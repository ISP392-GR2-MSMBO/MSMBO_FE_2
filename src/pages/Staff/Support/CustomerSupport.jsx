import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerSupport.css";

const ITEMS_PER_PAGE = 6; // ✅ Số bản ghi mỗi trang

const CustomerSupport = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filterStatus, setFilterStatus] = useState("PENDING");
    const [currentPage, setCurrentPage] = useState(1); // ✅ Phân trang

    const fetchReports = async () => {
        try {
            const res = await axios.get("https://api-movie6868.purintech.id.vn/api/reports/queue", {
                params: { type: "CUSTOMER_FEEDBACK" }
            });
            setReports(res.data);
        } catch (error) {
            console.error("❌ Lỗi lấy danh sách report:", error);
        }
    };

    const updateStatus = async (reportId, newStatus) => {
        try {
            await axios.patch(`https://api-movie6868.purintech.id.vn/api/reports/${reportId}/status`, {
                status: newStatus
            });
            fetchReports();
        } catch (error) {
            console.error("❌ Lỗi cập nhật trạng thái:", error);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    // ✅ Filter trạng thái (không lấy ARCHIVED)
    const filteredReports = reports.filter(
        r => r.status !== "ARCHIVED" && r.status === filterStatus
    );

    // ✅ Phân trang
    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // ✅ Khi đổi tab -> quay về trang 1
    useEffect(() => { setCurrentPage(1); }, [filterStatus]);

    return (
        <div className="staff-support-page">
            <h2>💬 Hỗ trợ khách hàng</h2>
            <p className="staff-subtext">Xử lý các phản hồi, góp ý và vấn đề từ khách hàng.</p>

            {/* TAB STATUS */}
            <div className="staff-status-tabs">
                {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => (
                    <button
                        key={s}
                        className={`staff-status-tab ${filterStatus === s ? "active" : ""}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* TABLE */}
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
                    {currentReports.map((r) => (
                        <tr key={r.reportID}>
                            <td className="staff-desc-click" onClick={() => setSelectedReport(r)}>
                                {r.description?.length > 40 ? r.description.slice(0, 40) + "..." : r.description}
                            </td>
                            <td>{new Date(r.createdDate).toLocaleString()}</td>
                            <td className={`status-${r.status.toLowerCase()}`}>{r.status}</td>
                            <td className="staff-action-cell">
                                {r.status === "PENDING" && (
                                    <>
                                        <button className="staff-btn staff-btn-in-progress"
                                            onClick={() => updateStatus(r.reportID, "IN_PROGRESS")}>
                                            ⏳ Nhận xử lý
                                        </button>
                                        <button className="staff-btn staff-btn-reject"
                                            onClick={() => updateStatus(r.reportID, "REJECTED")}>
                                            ❌ Từ chối
                                        </button>
                                    </>
                                )}

                                {r.status === "IN_PROGRESS" && (
                                    <button className="staff-btn staff-btn-resolved"
                                        onClick={() => updateStatus(r.reportID, "RESOLVED")}>
                                        ✅ Hoàn thành
                                    </button>
                                )}

                                {(r.status === "RESOLVED" || r.status === "REJECTED") && (
                                    <>
                                        <span className={r.status === "RESOLVED" ? "staff-done-text" : "staff-reject-text"}>
                                            {r.status === "RESOLVED" ? "✔ Đã hoàn thành" : "❌ Đã từ chối"}
                                        </span>
                                        <button className="staff-btn staff-btn-archive"
                                            onClick={() => updateStatus(r.reportID, "ARCHIVED")}>
                                            🗑 Xóa
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ PAGINATION */}
            <div className="staff-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>←</button>
                <span>Trang {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</button>
            </div>

            {/* POPUP */}
            {selectedReport && (
                <div className="staff-modal-backdrop" onClick={() => setSelectedReport(null)}>
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
