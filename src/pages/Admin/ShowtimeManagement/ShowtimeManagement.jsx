import React, { useEffect, useState, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { showtimeApi } from "../../../api/showtimeApi";
import { toast } from "react-toastify";
import "./ShowtimeManagement.css";

const ShowtimeManagement = () => {
    const { movieID } = useParams(); // Lấy ID phim từ URL
    const history = useHistory();
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách showtime
    const fetchShowtimes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await showtimeApi.getShowtimesByMovie(movieID);
            const filtered = Array.isArray(data)
                ? data.filter((s) => String(s.movieID) === String(movieID) && !s.deleted)
                : [];
            setShowtimes(filtered);
        } catch (err) {
            console.error(err);
            toast.error("❌ Lỗi khi tải lịch chiếu!");
        } finally {
            setLoading(false);
        }
    }, [movieID]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    // === Duyệt lịch chiếu ===
    const handleApprove = async (showtime) => {
        if (!window.confirm(`Duyệt lịch chiếu ID ${showtime.showtimeID}?`)) return;
        try {
            await showtimeApi.approveShowtime(showtime.showtimeID);
            toast.success(`✅ Lịch chiếu ID ${showtime.showtimeID} đã được duyệt!`);
            await fetchShowtimes();
        } catch (err) {
            console.error(err);
            toast.error("❌ Lỗi khi duyệt lịch chiếu!");
        }
    };

    // === Từ chối lịch chiếu ===
    const handleReject = async (showtime) => {
        if (!window.confirm(`Từ chối lịch chiếu ID ${showtime.showtimeID}?`)) return;
        try {
            await showtimeApi.rejectShowtime(showtime.showtimeID);
            toast.info(`🚫 Lịch chiếu ID ${showtime.showtimeID} đã bị từ chối.`);
            await fetchShowtimes();
        } catch (err) {
            console.error(err);
            toast.error("❌ Lỗi khi từ chối lịch chiếu!");
        }
    };

    // === Xóa lịch chiếu ===
    const handleDelete = async (showtime) => {
        if (!window.confirm(`Bạn có chắc muốn xóa lịch chiếu ID ${showtime.showtimeID}?`)) return;
        try {
            await showtimeApi.deleteShowtime(showtime.showtimeID);
            toast.success(`🗑️ Lịch chiếu ID ${showtime.showtimeID} đã bị xóa!`);
            await fetchShowtimes();
        } catch (err) {
            console.error(err);
            toast.error("❌ Lỗi khi xóa lịch chiếu!");
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="showtime-management-container">
            <h2>⏰ Quản lý lịch chiếu (Movie ID: {movieID})</h2>

            {showtimes.length === 0 ? (
                <p style={{ textAlign: "center", color: "#333" }}>
                    Chưa có lịch chiếu nào.
                </p>
            ) : (
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
                        {showtimes.map((s) => (
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
            )}

            <div className="back-container">
                <button
                    className="back-btn"
                    onClick={() => history.push("/admin/movie-management")}
                >
                    🔙 Quay lại
                </button>
            </div>
        </div>
    );
};

export default ShowtimeManagement;
