import React, { useEffect, useState, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { showtimeApi } from "../../../api/showtimeApi";
// ✅ Import Ant Design Components
import { message, Spin, Modal, Pagination } from "antd";
import "./ShowtimeManagement.css";

const { confirm } = Modal;

const ShowtimeManagement = () => {
    const { movieID } = useParams();
    const history = useHistory();
    const [allShowtimes, setAllShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); // 10 mục trên mỗi trang

    const [messageApi, contextHolder] = message.useMessage();

    // Lấy danh sách showtime
    const fetchShowtimes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await showtimeApi.getShowtimesByMovie(movieID);
            const filtered = Array.isArray(data)
                ? data.filter((s) => String(s.movieID) === String(movieID) && !s.deleted)
                : [];
            setAllShowtimes(filtered); // Lưu toàn bộ dữ liệu đã lọc
        } catch (err) {
            console.error(err);
            // ✅ ĐÃ SỬA: Chỉ giữ lại chuỗi thông báo (để Antd tự động thêm icon)
            messageApi.error("Lỗi khi tải lịch chiếu!");
        } finally {
            setLoading(false);
        }
    }, [movieID, messageApi]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    // === Duyệt lịch chiếu (Loại bỏ ký tự ❌ thừa) ===
    const handleApprove = (showtime) => {
        confirm({
            title: 'Xác nhận duyệt lịch chiếu',
            content: `Bạn có chắc muốn duyệt lịch chiếu ID ${showtime.showtimeID}?`,
            okText: 'Duyệt',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await showtimeApi.approveShowtime(showtime.showtimeID);
                    messageApi.success(`✅ Lịch chiếu ID ${showtime.showtimeID} đã được duyệt!`);
                    await fetchShowtimes();
                } catch (err) {
                    console.error("Lỗi khi duyệt:", err);
                    messageApi.error("Giờ chiếu đã qua không thể duyệt!");
                }
            },
        });
    };

    // === Từ chối lịch chiếu (Loại bỏ ký tự ❌ thừa) ===
    const handleReject = (showtime) => {
        confirm({
            title: 'Xác nhận từ chối lịch chiếu',
            content: `Bạn có chắc muốn từ chối lịch chiếu ID ${showtime.showtimeID}?`,
            okText: 'Từ chối',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await showtimeApi.rejectShowtime(showtime.showtimeID);
                    messageApi.info(`🚫 Lịch chiếu ID ${showtime.showtimeID} đã bị từ chối.`);
                    await fetchShowtimes();
                } catch (err) {
                    console.error(err);
                    // ✅ SỬA: Dùng thông báo thường, bỏ ký tự thừa nếu có
                    messageApi.error("Lỗi khi từ chối lịch chiếu!");
                }
            },
        });
    };

    // === Xóa lịch chiếu (Loại bỏ ký tự ❌ thừa) ===
    const handleDelete = (showtime) => {
        confirm({
            title: 'Xác nhận xóa lịch chiếu',
            content: `Bạn có chắc muốn xóa lịch chiếu ID ${showtime.showtimeID}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await showtimeApi.deleteShowtime(showtime.showtimeID);
                    messageApi.success(`🗑️ Lịch chiếu ID ${showtime.showtimeID} đã bị xóa!`);
                    await fetchShowtimes();
                } catch (err) {
                    console.error(err);
                    // ✅ SỬA: Dùng thông báo thường, bỏ ký tự thừa nếu có
                    messageApi.error("Lỗi khi xóa lịch chiếu!");
                }
            },
        });
    };

    // === LOGIC PHÂN TRANG FRONTEND ===
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentShowtimes = allShowtimes.slice(startIndex, endIndex);

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="loading"><Spin tip="Đang tải..." size="large" /></div>;

    return (
        <div className="showtime-management-container">
            {contextHolder} {/* Context Holder của Antd Message */}
            <h2>⏰ Quản lý lịch chiếu (Movie ID: {movieID})</h2>

            {allShowtimes.length === 0 ? (
                <p style={{ textAlign: "center", color: "#333" }}>
                    Chưa có lịch chiếu nào.
                </p>
            ) : (
                <>
                    <table className="showtime-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Phòng chiếu</th>
                                <th>Ngày</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Trạng thái duyệt</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentShowtimes.map((s) => (
                                <tr key={s.showtimeID}>
                                    <td>{s.showtimeID}</td>
                                    <td>{s.theaterID}</td>
                                    <td>{s.date}</td>
                                    <td>{s.startTime}</td>
                                    <td>{s.endTime}</td>
                                    <td>
                                        {s.approveStatus === "APPROVE" ? (
                                            <span className="approved-text">✅ Đã duyệt</span>
                                        ) : s.approveStatus === "DENIED" ? (
                                            <span className="rejected-text">❌ Đã từ chối</span>
                                        ) : (
                                            <span className="pending-text">🕓 Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        {(s.approveStatus === "PENDING" ||
                                            s.approveStatus === "pending") && (
                                                <div className="btn-group">
                                                    <button
                                                        className="approve-btn"
                                                        onClick={() => handleApprove(s)}
                                                    >
                                                        ✅ Duyệt
                                                    </button>
                                                    <button
                                                        className="reject-btn"
                                                        onClick={() => handleReject(s)}
                                                    >
                                                        ❌ Từ chối
                                                    </button>
                                                </div>
                                            )}

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(s)}
                                            style={{ marginLeft: "5px", backgroundColor: "#e74c3c", color: "#fff" }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ✅ PHÂN TRANG ANTD */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={allShowtimes.length} // Tổng số lượng mục cần phân trang
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            )}

            <div className="back-container">
                <button
                    className="back-btn"
                    onClick={() => history.push("/manager/movie-management")}
                >
                    🔙 Quay lại
                </button>
            </div>
        </div>
    );
};

export default ShowtimeManagement;