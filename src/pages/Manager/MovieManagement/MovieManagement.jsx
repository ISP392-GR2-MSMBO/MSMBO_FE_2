import React, { useState, useEffect } from "react";
import { movieApi } from "../../../api/movieApi";
import { toast } from "react-toastify";
import "./MovieManagement.css";
import { useHistory } from "react-router-dom";
import { Pagination, Spin, Modal } from "antd";

const { confirm } = Modal;

const ExpandableText = ({ text, maxChars = 30 }) => {
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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // State cho Modal Mô tả
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [currentDescription, setCurrentDescription] = useState({
        name: "",
        text: "",
    });

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
            toast.error("Lỗi khi tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    useEffect(() => {
        fetchMovies();
    }, []);

    const handlePageChange = (page) => setCurrentPage(page);

    const showValidationError = (error) => {
        if (error.response?.data?.details) {
            const detail = Object.entries(error.response.data.details)
                .map(([_, msg]) => {
                    let translatedMsg = msg;
                    if (msg.includes("Date must be today or in the future")) {
                        translatedMsg = "Ngày phát hành phải là hôm nay hoặc trong tương lai";
                    }
                    return `${translatedMsg}`;
                })
                .join("\n");

            Modal.error({
                title: "Lỗi xác thực dữ liệu",
                content: <pre style={{ whiteSpace: "pre-wrap" }}>{detail}</pre>,
            });
        } else {
            Modal.error({
                title: "Lỗi máy chủ",
                content: "Không thể thực hiện hành động. Vui lòng thử lại sau.",
            });
        }
    };

    // Hàm Xóa (Giữ nguyên)
    const handleDelete = (movie) => {
        confirm({
            title: "Xác nhận xóa phim",
            content: `Bạn có chắc chắn muốn xóa phim "${movie.movieName}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await movieApi.deleteMovie(movie.movieID);
                    toast.success("Xóa thành công!");
                    setMovies((prev) =>
                        prev.filter((m) => m.movieID !== movie.movieID)
                    );
                } catch (error) {
                    console.error(error);
                    showValidationError(error);
                    toast.error("Xóa thất bại!");
                }
            },
        });
    };

    // Hàm Duyệt (Giữ nguyên)
    const handleApprove = (movie) => {
        confirm({
            title: "Xác nhận duyệt phim",
            content: `Bạn có chắc chắn muốn duyệt phim "${movie.movieName}"? `,
            okText: "Duyệt",
            okType: "primary",
            cancelText: "Hủy",
            onOk: async () => {
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
                    showValidationError(error);
                    toast.error("Lỗi khi duyệt phim!");
                }
            },
        });
    };

    // Hàm Từ chối (Giữ nguyên)
    const handleReject = (movie) => {
        confirm({
            title: "Xác nhận từ chối phim",
            content: `Bạn có chắc chắn muốn từ chối phim "${movie.movieName}"?`,
            okText: "Từ chối",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
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
                    showValidationError(error);
                    toast.error("Lỗi khi từ chối phim!");
                }
            },
        });
    };

    const handleEditClick = (movie) => {
        setSelectedMovie({ ...movie });
        setShowEditForm(true);
    };

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
            showValidationError(error);
            toast.error("Lỗi khi cập nhật phim!");
        }
    };

    const handleShowBanner = (movie) => {
        setSelectedBannerUrl(movie.banner);
        setSelectedMovieName(movie.movieName);
        setShowBannerPopup(true);
    };

    // Hàm để hiển thị mô tả trong Modal
    const handleShowDescription = (movie) => {
        setCurrentDescription({ name: movie.movieName, text: movie.description });
        setShowDescriptionModal(true);
    };

    if (loading)
        return (
            <div className="loading">
                <Spin tip="Đang tải danh sách phim..." size="large" />
            </div>
        );

    const filteredMovies = movies
        .filter((m) =>
            m.movieName?.toLowerCase().includes(searchText.toLowerCase())
        )
        .sort((a, b) => {
            // Nếu phim đã kết thúc thì cho xuống cuối cùng
            if (a.status === "Ended" && b.status !== "Ended") return 1;
            if (b.status === "Ended" && a.status !== "Ended") return -1;

            // Ưu tiên sắp xếp theo approveStatus
            const order = { PENDING: 0, APPROVE: 1, DENIED: 2 };
            const aStatus = order[a.approveStatus] ?? 3;
            const bStatus = order[b.approveStatus] ?? 3;

            return aStatus - bStatus;
        });
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentMovies = filteredMovies.slice(startIndex, endIndex);

    // --- JSX RENDER START ---
    return (
        <div className="movie-management-container">
            <h2>🎥 Quản lý phim</h2>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên phim..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

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
                        {currentMovies.map((movie) => (
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
                                            <div className="btn-group-poster">
                                                <button
                                                    className="detail-btn"
                                                    onClick={() =>
                                                        history.push(
                                                            `/manager/showtimes/${movie.movieID}`
                                                        )
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="detail-btn view-banner-btn"
                                                    onClick={() =>
                                                        handleShowBanner(movie)
                                                    }
                                                >
                                                    🖼️ Banner
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: "#777" }}>
                                                Chưa có ảnh
                                            </span>
                                            <div className="btn-group-poster">
                                                <button
                                                    className="detail-btn"
                                                    onClick={() =>
                                                        history.push(
                                                            `/manager/showtimes/${movie.movieID}`
                                                        )
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="detail-btn view-banner-btn"
                                                    onClick={() =>
                                                        handleShowBanner(movie)
                                                    }
                                                >
                                                    🖼️ Banner
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                                <td>{movie.movieName}</td>
                                <td>{movie.genre}</td>
                                <td>{movie.duration} phút</td>
                                <td>{movie.age}</td>

                                {/* ✅ Áp dụng ExpandableText cho Đạo diễn */}
                                <td>
                                    <ExpandableText
                                        text={movie.director}
                                        maxChars={40}
                                    />
                                </td>

                                {/* ✅ Áp dụng ExpandableText cho Diễn viên */}
                                <td>
                                    <ExpandableText
                                        text={movie.actress}
                                        maxChars={40}
                                    />
                                </td>

                                <td>{movie.releaseDate}</td>
                                <td>{movie.language}</td>

                                <td>
                                    {movie.description ? (
                                        <button
                                            onClick={() =>
                                                handleShowDescription(movie)
                                            }
                                            className="view-description-btn" // ✅ Dùng class CSS
                                        >
                                            Xem mô tả
                                        </button>
                                    ) : (
                                        "-"
                                    )}
                                </td>

                                <td>
                                    {movie.trailer ? (
                                        <a
                                            href={movie.trailer}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Xem trailer
                                        </a>
                                    ) : (
                                        "-"
                                    )}
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
                                        <span className="ended-text">
                                            {" "}
                                            Đã kết thúc
                                        </span>
                                    ) : movie.approveStatus === "APPROVE" ? (
                                        <span className="approved-text">
                                            ✅ Đã duyệt
                                        </span>
                                    ) : movie.approveStatus === "DENIED" ? (
                                        <span className="rejected-text">
                                            ❌ Đã từ chối
                                        </span>
                                    ) : (
                                        <>
                                            <span className="pending-text">
                                                🕓 Pending
                                            </span>
                                            <div className="btn-group">
                                                <button
                                                    className="approve-btn"
                                                    onClick={() =>
                                                        handleApprove(movie)
                                                    }
                                                >
                                                    ✅ Duyệt
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={() =>
                                                        handleReject(movie)
                                                    }
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

            <div
                className="pagination-container"
                style={{ textAlign: "center", marginTop: "20px" }}
            >
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredMovies.length}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </div>

            <div className="back-container">
                <button
                    className="back-btn"
                    onClick={() => history.push("/manager")}
                >
                    🔙 Quay lại
                </button>
            </div>

            {/* Modal hiển thị Mô tả phim (Đã chỉnh width lớn) */}
            <Modal
                title={`📝 Mô tả phim: "${currentDescription.name}"`}
                visible={showDescriptionModal}
                onCancel={() => setShowDescriptionModal(false)}
                footer={[
                    <button
                        key="close"
                        className="cancel-btn"
                        onClick={() => setShowDescriptionModal(false)}
                        style={{ margin: 0, padding: '5px 15px' }}
                    >
                        Đóng
                    </button>,
                ]}
                width={1000} // ✅ Width lớn
            >
                <p className="description-content"> {/* ✅ Dùng class cho màu chữ đen và định dạng */}
                    {currentDescription.text}
                </p>
            </Modal>

            {/* Popup chỉnh sửa trạng thái (Giữ nguyên) */}
            {showEditForm && selectedMovie && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>✏️ Chỉnh sửa trạng thái</h3>
                        <div className="poster-preview">
                            <p>
                                <strong>Poster hiện tại:</strong>
                            </p>
                            {selectedMovie.poster ? (
                                <img
                                    src={selectedMovie.poster}
                                    alt="Poster"
                                    style={{
                                        width: "150px",
                                        borderRadius: "8px",
                                        marginBottom: "8px",
                                    }}
                                />
                            ) : (
                                <p>Chưa có ảnh</p>
                            )}
                        </div>

                        <label>
                            Trạng thái:
                            <select
                                value={selectedMovie.status || "Coming Soon"}
                                onChange={(e) =>
                                    setSelectedMovie({
                                        ...selectedMovie,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="Coming Soon">
                                    Coming Soon
                                </option>
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

            {/* Popup hiển thị Banner (Giữ nguyên) */}
            {showBannerPopup && (
                <div
                    className="popup-overlay"
                    onClick={() => setShowBannerPopup(false)}
                >
                    <div
                        className="popup-content banner-popup-content"
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            style={{ display: "block", margin: "15px auto 0 auto" }}
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