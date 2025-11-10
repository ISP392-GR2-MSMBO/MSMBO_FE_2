import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SystemReport.css";

const ITEMS_PER_PAGE = 6; // ✅ Số dòng mỗi trang

const SystemReport = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState("PENDING");
    const [currentPage, setCurrentPage] = useState(1); // ✅ phân trang

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://api-movie6868.purintech.id.vn/api/reports/queue", {
                params: { type: "SYSTEM_BUG" },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setReports(res.data);
        } catch (error) {
            console.error("❌ Lỗi lấy danh sách report:", error);
        }
    };

    const updateStatus = async (reportId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `https://api-movie6868.purintech.id.vn/api/reports/${reportId}/status`,
                { status: newStatus },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            fetchReports();
        } catch (error) {
            console.error("❌ Lỗi cập nhật trạng thái:", error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // ✅ FILTER + PHÂN TRANG
    const filteredReports = reports.filter(r => r.status !== "ARCHIVED" && r.status === filter);
    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1); // ✅ Reset về trang 1 khi đổi tab filter
    }, [filter]);

    return (
        <div className="admin-report-page">
            <h2>🛠 System Reports</h2>
            <p className="admin-subtext">Theo dõi và xử lý lỗi hệ thống.</p>

            {/* ✅ TAB FILTER */}
            <div className="admin-status-tabs">
                {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(s => (
                    <button
                        key={s}
                        className={`admin-status-tab ${filter === s ? "active" : ""}`}
                        onClick={() => setFilter(s)}
                    >
                        {s.replace("_", " ")}
                    </button>
                ))}
            </div>

            <table className="admin-report-table">
                <thead>
                    <tr>
                        <th>Mô tả</th>
                        <th>Ngày gửi</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {currentReports.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", opacity: 0.7 }}>
                                Không có dữ liệu.
                            </td>
                        </tr>
                    ) : (
                        currentReports.map((r) => (
                            <tr key={r.reportID}>
                                <td className="admin-desc-click" onClick={() => setSelectedReport(r)}>
                                    {r.description.length > 40 ? r.description.slice(0, 40) + "..." : r.description}
                                </td>

                                <td>{new Date(r.createdDate).toLocaleString()}</td>

                                <td className={`admin-status-badge status-${r.status.toLowerCase()}`}>
                                    {r.status}
                                </td>

                                <td className="admin-action-cell">
                                    {r.status === "PENDING" && (
                                        <>
                                            <button className="admin-btn in-progress" onClick={() => updateStatus(r.reportID, "IN_PROGRESS")}>
                                                ⏳ Nhận xử lý
                                            </button>
                                            <button className="admin-btn reject" onClick={() => updateStatus(r.reportID, "REJECTED")}>
                                                ❌ Từ chối
                                            </button>
                                        </>
                                    )}

                                    {r.status === "IN_PROGRESS" && (
                                        <button className="admin-btn resolved" onClick={() => updateStatus(r.reportID, "RESOLVED")}>
                                            ✅ Hoàn thành
                                        </button>
                                    )}

                                    {r.status === "RESOLVED" && <span className="admin-done-text">✔ Đã xử lý</span>}
                                    {r.status === "REJECTED" && <span className="admin-reject-text">🚫 Đã từ chối</span>}

                                    <button className="admin-btn archive" onClick={() => updateStatus(r.reportID, "ARCHIVED")}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ✅ PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>←</button>
                    <span>Trang {currentPage} / {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>→</button>
                </div>
            )}

            {/* POPUP */}
            {selectedReport && (
                <div className="admin-modal-backdrop" onClick={() => setSelectedReport(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>📝 Chi tiết báo cáo</h3>
                        <p>{selectedReport.description}</p>

                        <button className="admin-close-btn" onClick={() => setSelectedReport(null)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemReport;
