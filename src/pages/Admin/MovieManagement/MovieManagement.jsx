import React, { useState, useEffect } from "react";
import { movieApi } from "../../../api/movieApi";
import { toast } from "react-toastify";
import "./MovieManagement.css";
import { useHistory } from "react-router-dom";
// ✅ IMPORT PHÂN TRANG VÀ MODAL TỪ ANTD
import { Pagination, Spin, Modal } from 'antd';

const { confirm } = Modal;

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


const MovieManagement = () => {
    const history = useHistory();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [showBannerPopup, setShowBannerPopup] = useState(false);
    const [selectedBannerUrl, setSelectedBannerUrl] = useState(null);
    const [selectedMovieName, setSelectedMovieName] = useState("");

    // ✅ STATE MỚI CHO PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); // 10 phim mỗi trang

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
            // ✅ ĐÃ SỬA: Bỏ ký tự ❌ thừa (để react-toastify tự quản lý icon)
            toast.error("Lỗi khi tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    // Khi tìm kiếm thay đổi, reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    useEffect(() => {
        fetchMovies();
    }, []);

    // --- Xử lý sự kiện phân trang ---
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
    };

    // --- Xử lý các hành động quản lý phim ---

    const handleDelete = (movie) => {
        confirm({
            title: 'Xác nhận xóa phim',
            content: `Bạn có chắc chắn muốn xóa phim "${movie.movieName}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await movieApi.deleteMovie(movie.movieID);
                    toast.success("Xóa thành công!");
                    setMovies((prev) => prev.filter((m) => m.movieID !== movie.movieID));
                } catch (error) {
                    console.error(error);
                    // ✅ ĐÃ SỬA: Bỏ ký tự ❌ thừa
                    toast.error("Xóa thất bại!");
                }
            },
        });
    };

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
            // ✅ ĐÃ SỬA: Bỏ ký tự ❌ thừa
            toast.error("Lỗi khi duyệt phim!");
        }
    };

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
            // ✅ ĐÃ SỬA: Bỏ ký tự ❌ thừa
            toast.error("Lỗi khi từ chối phim!");
        }
    };

    const handleEditClick = (movie) => {
        setSelectedMovie({ ...movie });
        setShowEditForm(true);
    };

    // --- Cập nhật trạng thái ---
    const handleStatusSave = async () => {
        if (!selectedMovie) return;
        try {
            const updatedMovie = {
                ...selectedMovie,
                poster: selectedMovie.poster,
            };

            await movieApi.updateMovie(updatedMovie.movieID, updatedMovie);

            setMovies((prev) =>
                prev.map((m) =>
                    m.movieID === updatedMovie.movieID ? updatedMovie : m
                )
            );

            toast.success("Cập nhật trạng thái thành công!");
            setShowEditForm(false);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật phim!");
        }
    };

    const handleShowBanner = (movie) => {
        setSelectedBannerUrl(movie.banner);
        setSelectedMovieName(movie.movieName);
        setShowBannerPopup(true);
    };

    if (loading) return <div className="loading"><Spin tip="Đang tải danh sách phim..." size="large" /></div>;

    // 1. Lọc phim theo từ khóa
    const filteredMovies = movies.filter((m) =>
        m.movieName?.toLowerCase().includes(searchText.toLowerCase())
    );

    // 2. TÍNH TOÁN PHIM HIỂN THỊ TRÊN TRANG HIỆN TẠI
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentMovies = filteredMovies.slice(startIndex, endIndex);

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
                        {/* ✅ DÙNG currentMovies CHO PHÂN TRANG */}
                        {currentMovies.map((movie) => (
                            <tr key={movie.movieID}>
                                <td>{movie.movieID}</td>
                                {/* CỘT POSTER (ĐÃ BỎ NÚT SỬA POSTER) */}
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
                                            <div className="btn-group-poster">
                                                <button
                                                    className="detail-btn"
                                                    onClick={() =>
                                                        history.push(`/admin/showtimes/${movie.movieID}`)
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="detail-btn view-banner-btn"
                                                    onClick={() => handleShowBanner(movie)}
                                                >
                                                    🖼️ Banner
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: "#777" }}>Chưa có ảnh</span>
                                            <div className="btn-group-poster">
                                                <button
                                                    className="detail-btn"
                                                    onClick={() =>
                                                        history.push(`/admin/showtimes/${movie.movieID}`)
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="detail-btn view-banner-btn"
                                                    onClick={() => handleShowBanner(movie)}
                                                >
                                                    🖼️ Banner
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                                {/* Hết CỘT POSTER */}
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
                                            Xem trailer
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
                                        <span className="ended-text"> Đã kết thúc</span>
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
                                        Sửa
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(movie)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ PHÂN TRANG ANTD */}
            <div className="pagination-container" style={{ textAlign: 'center', marginTop: '20px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredMovies.length} // Tổng số lượng phim (sau khi lọc)
                    onChange={handlePageChange}
                    showSizeChanger={false} // Tắt chọn kích thước trang
                />
            </div>

            {/* Quay lại */}
            <div className="back-container">
                <button className="back-btn" onClick={() => history.push("/admin")}>
                    🔙 Quay lại
                </button>
            </div>

            {/* Popup chỉnh sửa trạng thái (ĐÃ BỎ PHẦN POSTER) */}
            {showEditForm && selectedMovie && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>✏️ Chỉnh sửa trạng thái</h3>

                        {/* Poster Preview (Giữ lại để xem) */}
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

            {/* Popup Xem Banner (GIỮ NGUYÊN) */}
            {showBannerPopup && (
                <div className="popup-overlay" onClick={() => setShowBannerPopup(false)}>
                    <div className="popup-content banner-popup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Banner phim "{selectedMovieName}"</h3>
                        {selectedBannerUrl ? (
                            <img
                                src={selectedBannerUrl}
                                alt={`Banner ${selectedMovieName}`}
                                className="banner-image-preview"
                            />
                        ) : (
                            <p className="no-banner-text">
                                Phim này chưa có banner được tải lên.
                            </p>
                        )}
                        <button
                            className="cancel-btn"
                            onClick={() => setShowBannerPopup(false)}
                            style={{ display: 'block', margin: '15px auto 0 auto' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieManagement;