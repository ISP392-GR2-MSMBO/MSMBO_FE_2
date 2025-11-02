import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerSupport.css"; // Vẫn giữ nguyên tên file CSS

const CustomerSupport = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filterStatus, setFilterStatus] = useState("PENDING");

    const fetchReports = async () => {
        try {
            const res = await axios.get("http://api-movie6868.purintech.id.vn/api/reports/queue", {
                params: { type: "CUSTOMER_FEEDBACK" }
            });
            setReports(res.data);
        } catch (error) {
            console.error("❌ Lỗi lấy danh sách report:", error);
        }
    };

    const updateStatus = async (reportId, newStatus) => {
        try {
            await axios.patch(`http://api-movie6868.purintech.id.vn/api/reports/${reportId}/status`, {
                status: newStatus
            });
            fetchReports();
        } catch (error) {
            console.error("❌ Lỗi cập nhật trạng thái:", error);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const filteredReports = reports.filter(r => r.status !== "ARCHIVED" && r.status === filterStatus);

    return (
        // ✅ Class chính đã được đổi tên
        <div className="staff-support-page">
            <h2>💬 Hỗ trợ khách hàng</h2>
            <p className="staff-subtext">Xử lý các phản hồi, góp ý và vấn đề từ khách hàng.</p>

            {/* ✅ TAB STATUS */}
            <div className="staff-status-tabs">
                {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => (
                    <button
                        key={s}
                        // ✅ Đổi status-tab thành staff-status-tab
                        className={`staff-status-tab ${filterStatus === s ? "active" : ""}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* ✅ TABLE */}
            {/* ✅ Đổi report-table thành staff-report-table */}
            <table className="staff-report-table">
                <thead>
                    <tr>
                        <th>Mô tả</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredReports.map((r) => (
                        <tr key={r.reportID}>
                            {/* ✅ Đổi desc-click thành staff-desc-click */}
                            <td className="staff-desc-click" onClick={() => setSelectedReport(r)}>
                                {r.description?.length > 40
                                    ? r.description.slice(0, 40) + "..."
                                    : r.description}
                            </td>

                            <td>{new Date(r.createdDate).toLocaleString()}</td>
                            {/* ✅ Giữ lại status-pending/in_progress/... vì nó là style trạng thái */}
                            <td className={`status-${r.status.toLowerCase()}`}>{r.status}</td>

                            <td className="staff-action-cell">
                                {/* 🎯 GOM HÀNH ĐỘNG VÀO MỘT CỘT (theo đề xuất sửa lỗi trước) */}
                                {r.status === "PENDING" && (
                                    <>
                                        {/* ✅ Đổi btn thành staff-btn, thêm class riêng cho style */}
                                        <button className="staff-btn staff-btn-in-progress" onClick={() => updateStatus(r.reportID, "IN_PROGRESS")}>
                                            ⏳ Nhận xử lý
                                        </button>
                                        <button className="staff-btn staff-btn-reject" onClick={() => updateStatus(r.reportID, "REJECTED")}>
                                            ❌ Từ chối
                                        </button>
                                    </>
                                )}

                                {r.status === "IN_PROGRESS" && (
                                    <button className="staff-btn staff-btn-resolved" onClick={() => updateStatus(r.reportID, "RESOLVED")}>
                                        ✅ Hoàn thành
                                    </button>
                                )}

                                {(r.status === "RESOLVED" || r.status === "REJECTED") && (
                                    // ✅ Đổi done-text/reject-text thành staff-done-text/staff-reject-text
                                    <span className={r.status === "RESOLVED" ? "staff-done-text" : "staff-reject-text"}>
                                        {r.status === "RESOLVED" ? "✔ Đã hoàn thành" : "❌ Đã từ chối"}
                                    </span>
                                )}

                                {(r.status === "RESOLVED" || r.status === "REJECTED") && (
                                    // ✅ Đổi btn archive thành staff-btn staff-btn-archive
                                    <button className="staff-btn staff-btn-archive" onClick={() => updateStatus(r.reportID, "ARCHIVED")}>
                                        🗂 Lưu trữ
                                    </button>
                                )}
                            </td>

                            {/* ❌ LOẠI BỎ CÁC THẺ TD BỊ TRÙNG LẶP */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ POPUP */}
            {selectedReport && (
                // ✅ Đổi modal-backdrop thành staff-modal-backdrop
                <div className="staff-modal-backdrop" onClick={() => setSelectedReport(null)}>
                    {/* ✅ Đổi modal thành staff-modal */}
                    <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>📝 Chi tiết báo cáo</h3>
                        <p className="staff-modal-desc">{selectedReport.description}</p>
                        <button className="staff-close-btn" onClick={() => setSelectedReport(null)}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupport;