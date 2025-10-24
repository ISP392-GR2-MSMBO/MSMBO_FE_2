import React, { useState, useEffect } from "react";
import { movieApi } from "../../../api/movieApi";
import { toast } from "react-toastify";
import "./MovieManagement.css";
import { useHistory } from "react-router-dom";

// === Component hiển thị "Xem thêm / Thu gọn" ===
const ExpandableText = ({ text, maxChars = 60 }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return <span>-</span>;
    const shortText =
        text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
    return (
        <span>
            {expanded ? text : shortText}{" "}
            {text.length > maxChars && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="expand-btn"
                    style={{
                        color: "#007bff",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        padding: 0,
                    }}
                >
                    {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                </button>
            )}
        </span>
    );
};

// === Hàm upload ảnh Cloudinary ===
const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "movie-upload1");
    formData.append("cloud_name", "dmprbuogr");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dmprbuogr/image/upload",
        {
            method: "POST",
            body: formData,
        }
    );
    const data = await res.json();
    return data.secure_url;
};

const MovieManagement = () => {
    const history = useHistory();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchText, setSearchText] = useState("");

    // --- Lấy danh sách phim ---
    const fetchMovies = async () => {
        try {
            setLoading(true);
            const data = await movieApi.getMovies();
            const mapped = (data || []).map((m) => {
                const savedPoster = localStorage.getItem(`poster_${m.movieID}`);
                return {
                    ...m,
                    movieID: m.movieID || m.id,
                    poster: m.poster || savedPoster || "",
                };
            });
            setMovies(mapped);
        } catch (error) {
            console.error(error);
            toast.error("❌ Lỗi khi tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // --- Xóa phim ---
    const handleDelete = async (movie) => {
        if (!window.confirm(`Xác nhận xóa phim "${movie.movieName}"?`)) return;
        try {
            await movieApi.deleteMovie(movie.movieID);
            toast.success("🗑️ Xóa thành công!");
            setMovies((prev) => prev.filter((m) => m.movieID !== movie.movieID));
        } catch (error) {
            console.error(error);
            toast.error("❌ Xóa thất bại!");
        }
    };

    // --- Duyệt phim ---
    const handleApprove = async (movie) => {
        if (!window.confirm(`Duyệt phim "${movie.movieName}"?`)) return;
        try {
            await movieApi.approveMovie(movie.movieID);
            setMovies((prev) =>
                prev.map((m) =>
                    m.movieID === movie.movieID
                        ? { ...m, approveStatus: "APPROVE", status: "Coming Soon" }
                        : m
                )
            );
            toast.success(`✅ Phim "${movie.movieName}" đã được duyệt!`);
        } catch (error) {
            console.error(error);
            toast.error("❌ Lỗi khi duyệt phim!");
        }
    };

    // --- Từ chối phim ---
    const handleReject = async (movie) => {
        if (!window.confirm(`Từ chối phim "${movie.movieName}"?`)) return;
        try {
            await movieApi.rejectMovie(movie.movieID);
            setMovies((prev) =>
                prev.map((m) =>
                    m.movieID === movie.movieID
                        ? { ...m, approveStatus: "DENIED", status: "Denied" }
                        : m
                )
            );
            toast.info(`🚫 Phim "${movie.movieName}" đã bị từ chối.`);
        } catch (error) {
            console.error(error);
            toast.error("❌ Lỗi khi từ chối phim!");
        }
    };

    // --- Chỉnh sửa phim ---
    const handleEditClick = (movie) => {
        setSelectedMovie({ ...movie });
        setShowEditForm(true);
    };

    const handleStatusSave = async () => {
        if (!selectedMovie) return;
        try {
            const updatedMovie = { ...selectedMovie };
            await movieApi.updateMovie(updatedMovie.movieID, updatedMovie);
            setMovies((prev) =>
                prev.map((m) =>
                    m.movieID === updatedMovie.movieID ? updatedMovie : m
                )
            );
            toast.success("💾 Cập nhật trạng thái/phim thành công!");
            setShowEditForm(false);
        } catch (error) {
            console.error(error);
            toast.error("❌ Lỗi khi cập nhật phim!");
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    const filteredMovies = movies.filter((m) =>
        m.movieName?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="movie-management-container">
            <h2>🎥 Quản lý phim</h2>

            {/* Tìm kiếm */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên phim..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Bảng danh sách phim */}
            <div className="movie-table-container">
                <table className="movie-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Poster</th>
                            <th>Tên phim</th>
                            <th>Thể loại</th>
                            <th>Thời lượng</th>
                            <th>Độ tuổi</th>
                            <th>Đạo diễn</th>
                            <th>Diễn viên</th>
                            <th>Ngày phát hành</th>
                            <th>Ngôn ngữ</th>
                            <th>Mô tả</th>
                            <th>Trailer</th>
                            <th>Trạng thái</th>
                            <th>Duyệt</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovies.map((movie) => (
                            <tr key={movie.movieID}>
                                <td>{movie.movieID}</td>
                                <td>
                                    {movie.poster ? (
                                        <>
                                            <img
                                                src={movie.poster}
                                                alt="poster"
                                                style={{
                                                    width: "100px",
                                                    borderRadius: "8px",
                                                    marginBottom: "6px",
                                                }}
                                            />
                                            <br />
                                            <button
                                                className="detail-btn"
                                                onClick={() =>
                                                    history.push(`/admin/showtimes/${movie.movieID}`)
                                                }
                                            >
                                                ⏰ Chi tiết
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: "#777" }}>Chưa có ảnh</span>
                                            <br />
                                            <button
                                                className="detail-btn"
                                                onClick={() =>
                                                    history.push(`/admin/showtimes/${movie.movieID}`)
                                                }
                                            >
                                                ⏰ Chi tiết
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td>{movie.movieName}</td>
                                <td>{movie.genre}</td>
                                <td>{movie.duration} phút</td>
                                <td>{movie.age}</td>
                                <td><ExpandableText text={movie.director} /></td>
                                <td><ExpandableText text={movie.actress} /></td>
                                <td>{movie.releaseDate}</td>
                                <td>{movie.language}</td>
                                <td><ExpandableText text={movie.description} maxChars={80} /></td>
                                <td>
                                    {movie.trailer ? (
                                        <a href={movie.trailer} target="_blank" rel="noreferrer">
                                            🎞️ Xem trailer
                                        </a>
                                    ) : "-"}
                                </td>
                                <td
                                    className={
                                        movie.status === "Now Showing"
                                            ? "status-now"
                                            : movie.status === "Ended"
                                                ? "status-ended"
                                                : "status-coming"
                                    }
                                >
                                    {movie.status}
                                </td>
                                <td>
                                    {movie.status === "Ended" ? (
                                        <span className="ended-text">🎬 Đã kết thúc</span>
                                    ) : movie.approveStatus === "APPROVE" ? (
                                        <span className="approved-text">✅ Đã duyệt</span>
                                    ) : movie.approveStatus === "DENIED" ? (
                                        <span className="rejected-text">❌ Đã từ chối</span>
                                    ) : (
                                        <>
                                            <span className="pending-text">🕓 Pending</span>
                                            <div className="btn-group">
                                                <button
                                                    className="approve-btn"
                                                    onClick={() => handleApprove(movie)}
                                                >
                                                    ✅ Duyệt
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={() => handleReject(movie)}
                                                >
                                                    ❌ Từ chối
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditClick(movie)}
                                    >
                                        ✏️ Sửa trạng thái / poster
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(movie)}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quay lại */}
            <div className="back-container">
                <button className="back-btn" onClick={() => history.push("/admin")}>
                    🔙 Quay lại
                </button>
            </div>

            {/* Popup chỉnh sửa */}
            {showEditForm && selectedMovie && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>✏️ Chỉnh sửa trạng thái / poster</h3>

                        {/* Poster */}
                        <div className="poster-preview">
                            <p><strong>Poster hiện tại:</strong></p>
                            {selectedMovie.poster ? (
                                <img
                                    src={selectedMovie.poster}
                                    alt="Poster"
                                    style={{ width: "150px", borderRadius: "8px", marginBottom: "8px" }}
                                />
                            ) : <p>Chưa có ảnh</p>}
                        </div>

                        <div className="poster-upload">
                            <p><strong>Tải poster mới:</strong></p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    try {
                                        toast.info("⏳ Đang tải ảnh lên Cloudinary...");
                                        const url = await uploadImageToCloudinary(file);
                                        setSelectedMovie((prev) => ({ ...prev, poster: url }));
                                        toast.success("✅ Ảnh đã tải lên thành công!");
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("❌ Lỗi khi tải ảnh!");
                                    }
                                }}
                            />
                        </div>

                        {/* Chọn trạng thái */}
                        <label>
                            Trạng thái:
                            <select
                                value={selectedMovie.status || "Coming Soon"}
                                onChange={(e) =>
                                    setSelectedMovie({ ...selectedMovie, status: e.target.value })
                                }
                            >
                                <option value="Coming Soon">Coming Soon</option>
                                <option value="Now Showing">Now Showing</option>
                                <option value="Ended">Ended</option>
                            </select>
                        </label>

                        <button
                            className="save-btn"
                            onClick={handleStatusSave}
                        >
                            💾 Lưu thay đổi
                        </button>
                        <button
                            className="cancel-btn"
                            onClick={() => setShowEditForm(false)}
                        >
                            ❌ Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieManagement;
