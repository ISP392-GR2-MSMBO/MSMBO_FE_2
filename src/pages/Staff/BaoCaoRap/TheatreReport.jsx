import React, { useState, useEffect, useCallback } from "react";
import "./Report.css";
import { reportApi } from "../../../api/reportApi";

const ITEMS_PER_PAGE = 6; // Số dòng mỗi trang

const TheatreReport = () => {
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportType, setReportType] = useState("THEATER_ISSUE");
    const [currentPage, setCurrentPage] = useState(1); // phân trang

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser?.userID;

    // ✅ FIX LỖI: Bọc hàm loadReports trong useCallback.
    // Hàm này sẽ chỉ được tạo lại khi 'senderId' thay đổi.
    const loadReports = useCallback(async () => {
        try {
            const data = await reportApi.getReportsBySender(senderId);
            setReports(data);
        } catch (err) {
            console.error("❌ Lỗi tải lịch sử:", err);
        }
    }, [senderId]); // Dependency array của useCallback

    // Sử dụng loadReports đã được bọc trong useEffect
    useEffect(() => {
        if (senderId) loadReports();
    }, [senderId, loadReports]);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage("⚠️ Vui lòng mô tả sự cố.");
            return;
        }

        try {
            await reportApi.createReport(senderId, {
                description,
                reportType,
            });

            setMessage("✅ Gửi báo cáo thành công!");
            setDescription("");

            loadReports();
        } catch (error) {
            console.error(error);
            setMessage("❌ Gửi báo cáo thất bại.");
        }
    };

    // ✅ PHÂN TRANG
    const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentReports = reports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="staff-theater-report-container">

            {/* FORM GỬI BÁO CÁO */}
            <div className="staff-theater-report-card">
                <h2 className="staff-theater-report-title">🛠️ Gửi Báo Cáo Sự Cố</h2>

                <label className="staff-theater-report-label">Loại báo cáo:</label>
                <select
                    className="staff-theater-report-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                >
                    <option value="THEATER_ISSUE">🎭 Sự cố rạp (Gửi Manager)</option>
                    <option value="SYSTEM_BUG">💻 Lỗi hệ thống (Gửi Admin)</option>
                </select>

                <label className="staff-theater-report-label">Mô tả sự cố:</label>
                <textarea
                    className="staff-theater-report-textarea"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Máy chiếu phòng 5 bị nhòe, app bị lỗi thanh toán..."
                />

                {message && <p className="staff-theater-report-message">{message}</p>}

                <button className="staff-theater-report-button" onClick={handleSubmit}>
                    📩 Gửi Báo Cáo
                </button>
            </div>

            {/* LỊCH SỬ BÁO CÁO */}
            <div className="staff-theater-report-card">
                <h2 className="staff-theater-report-title">📜 Lịch Sử Báo Cáo</h2>

                {currentReports.length === 0 ? (
                    <p className="staff-theater-report-message">⚠️ Không có dữ liệu.</p>
                ) : (
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
                            {currentReports.map((r) => (
                                <tr key={r.reportID}>
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

                {/* ✅ PHÂN TRANG */}
                {reports.length > ITEMS_PER_PAGE && (
                    <div className="staff-theater-pagination">
                        <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>←</button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>→</button>
                    </div>
                )}

                {/* MODAL */}
                {selectedReport && (
                    <div className="staff-theater-report-modal-overlay" onClick={() => setSelectedReport(null)}>
                        <div className="staff-theater-report-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>📝 Chi tiết mô tả</h3>
                            <p>{selectedReport}</p>
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