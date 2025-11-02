import React, { useState, useEffect } from "react";
// ✅ Đổi tên file CSS
import "./Report.css";
import { reportApi } from "../../api/report-api";

const TheatreReport = () => {
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportType, setReportType] = useState("THEATER_ISSUE"); // ✅ mặc định gửi Manager rạp

    // ✅ Lấy userID
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser?.userID;

    // 🟢 Load lịch sử báo cáo
    const loadReports = async () => {
        try {
            const data = await reportApi.getReportsBySender(senderId);
            setReports(data);
        } catch (err) {
            console.error("❌ Lỗi tải lịch sử:", err);
        }
    };

    useEffect(() => {
        if (senderId) loadReports();
    }, [senderId]);

    // 🟢 Gửi báo cáo
    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage("⚠️ Vui lòng mô tả sự cố.");
            return;
        }

        try {
            await reportApi.createReport(senderId, {
                description,
                reportType, // ✅ tự động gửi đúng nơi
            });

            setMessage("✅ Gửi báo cáo thành công!");
            setDescription("");

            // load lại lịch sử
            loadReports();
        } catch (error) {
            console.error(error);
            setMessage("❌ Gửi báo cáo thất bại.");
        }
    };

    return (
        // ✅ Đã sửa report-container
        <div className="staff-theater-report-container">

            {/* FORM BÁO CÁO */}
            {/* ✅ Đã sửa report-card */}
            <div className="staff-theater-report-card">
                {/* ✅ Đã sửa report-title */}
                <h2 className="staff-theater-report-title">🛠️ Gửi Báo Cáo Sự Cố</h2>

                {/* ✅ Đã sửa report-label */}
                <label className="staff-theater-report-label">Loại báo cáo:</label>
                {/* ✅ Đã sửa report-select */}
                <select
                    className="staff-theater-report-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                >
                    <option value="THEATER_ISSUE">🎭 Sự cố rạp (Gửi Manager)</option>
                    <option value="SYSTEM_BUG">💻 Lỗi hệ thống (Gửi Admin)</option>
                </select>

                {/* ✅ Đã sửa report-label */}
                <label className="staff-theater-report-label">Mô tả sự cố:</label>
                {/* ✅ Đã sửa report-textarea */}
                <textarea
                    className="staff-theater-report-textarea"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Máy chiếu phòng 5 bị nhòe, app bị lỗi thanh toán..."
                />

                {/* ✅ Đã sửa report-message */}
                {message && <p className="staff-theater-report-message">{message}</p>}

                {/* ✅ Đã sửa report-button */}
                <button className="staff-theater-report-button" onClick={handleSubmit}>
                    📩 Gửi Báo Cáo
                </button>
            </div>

            {/* LỊCH SỬ */}
            {/* ✅ Đã sửa report-card */}
            <div className="staff-theater-report-card">
                {/* ✅ Đã sửa report-title */}
                <h2 className="staff-theater-report-title">📜 Lịch Sử Báo Cáo</h2>

                {reports.length === 0 ? (
                    // ✅ Đã sửa report-message
                    <p className="staff-theater-report-message">⚠️ Bạn chưa gửi báo cáo nào.</p>
                ) : (
                    // ✅ Đã sửa report-table
                    <table className="staff-theater-report-table">
                        <thead>
                            <tr>
                                <th>Mô tả</th>
                                <th>Loại</th>
                                <th>Trạng thái</th>
                                <th>Ngày gửi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((r) => (
                                <tr key={r.reportID}>
                                    {/* ✅ Đã sửa click-description */}
                                    <td
                                        className="staff-theater-click-description"
                                        onClick={() => setSelectedReport(r.description)}
                                    >
                                        {r.description.length > 35
                                            ? r.description.slice(0, 35) + "..."
                                            : r.description}
                                    </td>
                                    <td>{r.reportType === "SYSTEM_BUG" ? "💻 Hệ thống" : "🎭 Rạp"}</td>
                                    <td className={
                                        r.status === "PENDING" ? "pending" :
                                            r.status === "RESOLVED" ? "resolved" :
                                                r.status === "REJECTED" ? "rejected" : "inprogress"
                                    }>
                                        {r.status}
                                    </td>
                                    <td>{new Date(r.createdDate).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {selectedReport && (
                    // ✅ Đã sửa report-modal-overlay
                    <div className="staff-theater-report-modal-overlay" onClick={() => setSelectedReport(null)}>
                        {/* ✅ Đã sửa report-modal */}
                        <div className="staff-theater-report-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>📝 Chi tiết mô tả</h3>
                            <p>{selectedReport}</p>

                            {/* ✅ Đã sửa close-btn */}
                            <button className="staff-theater-close-btn" onClick={() => setSelectedReport(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheatreReport;