import React, { useEffect, useState, useCallback } from "react";
// 🟢 IMPORT ANT DESIGN COMPONENTS
import { message, Spin } from 'antd';
import { reportApi } from "../../../api/reportApi";
import { userApi } from "../../../api/userApi";
import axios from "axios";
import "./ManagerReport.css";

// 🟢 Hàm fetchUserDetail (Giữ nguyên)
const fetchUserDetail = async (userId) => {
    try {
        const user = await userApi.getUserById(userId);
        const displayName = user.fullName || user.userName || `User ID ${userId}`;
        return {
            userID: user.userID,
            username: displayName,
            role: user.roleID
        };
    } catch (error) {
        console.error(`❌ Lỗi khi lấy thông tin user ${userId}:`, error);
        return {
            userID: userId,
            username: `User ${userId} (Lỗi tải)`,
            role: "N/A"
        };
    }
};

const REPORT_STATUSES = {
    PENDING: "Đang chờ xử lý",
    IN_PROGRESS: "Đang tiến hành",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Bị từ chối",
    ARCHIVED: "Đã lưu trữ"
};

const ManagerReport = () => {
    // 🟢 KHỞI TẠO ANT DESIGN MESSAGE HOOK
    const [messageApi, contextHolder] = message.useMessage();

    const [viewMode, setViewMode] = useState("IN_PROGRESS");
    const [reportsWithSender, setReportsWithSender] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const [newSelectedStatus, setNewSelectedStatus] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser?.userID;
    const [newReportDescription, setNewReportDescription] = useState("");
    // ❌ Đã loại bỏ state 'creationMessage' vì sử dụng Ant Design message

    // --- LOGIC XEM BÁO CÁO (REPORT QUEUE) ---
    const fetchReportsAndSenders = useCallback(async () => {
        if (viewMode === 'create') {
            setReportsWithSender([]);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const statusesToFetch = viewMode;

            const res = await axios.get("https://api-movie6868.purintech.id.vn/api/reports/queue", {
                params: {
                    type: "THEATER_ISSUE",
                    status: [statusesToFetch]
                },
                headers: config.headers
            });
            const fetchedReports = res.data;

            const uniqueSenderIds = [...new Set(fetchedReports.map(r => r.senderUserID))];
            const senderDetailsPromises = uniqueSenderIds.map(id => fetchUserDetail(id));
            const senderDetails = await Promise.all(senderDetailsPromises);
            const senderMap = senderDetails.reduce((acc, user) => {
                acc[user.userID] = user;
                return acc;
            }, {});

            const combinedReports = fetchedReports.map(report => ({
                ...report,
                senderDetails: senderMap[report.senderUserID] || { username: "Unknown", role: "N/A" }
            }));

            setReportsWithSender(combinedReports);

        } catch (error) {
            console.error("❌ Lỗi lấy danh sách report và người gửi:", error);
            setReportsWithSender([]);
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            await reportApi.updateReportStatus(reportId, newStatus);

            setSelectedReport(null);
            setNewSelectedStatus(null);

            messageApi.open({
                type: 'success',
                content: 'Cập nhật trạng thái thành công!',
            });

            if (newStatus !== viewMode) {
                setReportsWithSender(prev => prev.filter(r => r.reportID !== reportId));
            } else {
                fetchReportsAndSenders();
            }

        } catch (error) {
            console.error("❌ Lỗi cập nhật trạng thái:", error);
            messageApi.open({
                type: 'error',
                content: 'Cập nhật trạng thái thất bại. Vui lòng kiểm tra quyền hạn (Error 403/401).',
            });
        }
    };

    const handleSaveStatus = () => {
        if (selectedReport && newSelectedStatus) {
            updateReportStatus(selectedReport.reportID, newSelectedStatus);
        }
    };

    const closeStatusModal = () => {
        setSelectedReport(null);
        setNewSelectedStatus(null);
    };

    useEffect(() => {
        fetchReportsAndSenders();
    }, [fetchReportsAndSenders]);

    // --- LOGIC TẠO BÁO CÁO (CREATE REPORT) DÙNG ANT D MESSAGE ---
    const handleCreateReport = async () => {
        if (!newReportDescription.trim()) {
            messageApi.open({
                type: 'warning',
                content: '⚠️ Vui lòng mô tả chi tiết báo cáo.',
            });
            return;
        }

        if (!senderId) {
            messageApi.open({
                type: 'error',
                content: '⚠️ Không tìm thấy User ID. Vui lòng đăng nhập lại.',
            });
            return;
        }

        try {
            await reportApi.createReport(senderId, {
                description: newReportDescription,
                reportType: "SYSTEM_BUG"
            });

            messageApi.open({
                type: 'success',
                content: 'Gửi báo cáo thành công!',
            });
            setNewReportDescription("");

            if (viewMode === 'PENDING') fetchReportsAndSenders();

        } catch (error) {
            console.error(error);
            // 🟢 THÔNG BÁO THẤT BẠI
            messageApi.open({
                type: 'error',
                content: '❌ Gửi báo cáo thất bại.',
            });
        }
    };

    // -----------------------------------------------------
    // 🟢 HÀM RENDER MODAL SỬA TRẠNG THÁI
    // -----------------------------------------------------
    const renderStatusEditModal = () => {
        if (!selectedReport || newSelectedStatus === null) return null;

        return (
            <div className="modal-backdrop" onClick={closeStatusModal}>
                <div className="modal modal-status-edit" onClick={(e) => e.stopPropagation()}>

                    <h3>Cập Nhật Trạng Thái Báo Cáo</h3>

                    <p className="modal-current-status">
                        <span className={`status-${selectedReport.status.toLowerCase()}`}>
                            {REPORT_STATUSES[selectedReport.status]}
                        </span>
                    </p>

                    <div className="status-selection-group">
                        <label className="status-label">Chọn trạng thái mới:</label>
                        {Object.keys(REPORT_STATUSES)
                            .filter(statusKey => statusKey !== 'ARCHIVED')
                            .map((statusKey) => (
                                <div key={statusKey} className="status-radio-item">
                                    <input
                                        type="radio"
                                        id={`status-${statusKey}`}
                                        name="newStatus"
                                        value={statusKey}
                                        checked={newSelectedStatus === statusKey}
                                        onChange={(e) => setNewSelectedStatus(e.target.value)}
                                    />
                                    <label
                                        htmlFor={`status-${statusKey}`}
                                        className={`status-btn status-btn-${statusKey.toLowerCase()}`}
                                    >
                                        {statusKey === 'REJECTED' ? 'Từ chối' : REPORT_STATUSES[statusKey]}
                                    </label>
                                </div>
                            ))}
                    </div>

                    <div className="modal-actions">
                        <button
                            className="btn-save-status"
                            onClick={handleSaveStatus}
                            disabled={!newSelectedStatus || newSelectedStatus === selectedReport.status}
                        >
                            💾 Lưu Trạng Thái Mới
                        </button>
                        <button className="btn-cancel" onClick={closeStatusModal}>Hủy</button>
                    </div>

                </div>
            </div>
        );
    };


    // -----------------------------------------------------
    // 🟢 RENDER QUEUE DÙNG SPIN TỪ ANT DESIGN
    // -----------------------------------------------------
    const renderReportQueue = () => (
        <div className="report-queue-container">
            <h3> Danh sách Báo Cáo: {REPORT_STATUSES[viewMode] || "Đang tải..."}</h3>

            {/* 🟢 SPIN WRAPPER */}
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                {!loading && reportsWithSender.length === 0 && <p>Không có báo cáo nào ở trạng thái này.</p>}

                {!loading && reportsWithSender.length > 0 && (
                    <table className="manager-report-table">
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '35%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '25%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>ID Người Gửi</th>
                                <th>Mô tả</th>
                                <th>Trạng Thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsWithSender.map((r, index) => (
                                <tr key={r.reportID}>
                                    <td>{index + 1}</td>
                                    <td>{r.senderUserID}</td>

                                    <td>
                                        <button
                                            className="btn-action in-progress"
                                            onClick={() => {
                                                setSelectedReport(r);
                                                setNewSelectedStatus(null);
                                            }}
                                        >
                                            Xem Mô Tả
                                        </button>
                                    </td>

                                    <td className={`status-${r.status.toLowerCase()}`}>
                                        {REPORT_STATUSES[r.status] || r.status}
                                    </td>

                                    <td>
                                        <button
                                            className="btn-status-edit"
                                            onClick={() => {
                                                setSelectedReport(r);
                                                setNewSelectedStatus(r.status);
                                            }}
                                        >
                                            Sửa Trạng Thái
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Spin>


            {/* --- Modal/Popup Chi tiết Báo cáo (Xem mô tả) --- */}
            {selectedReport && newSelectedStatus === null && (
                <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>📝 Mô Tả Báo Cáo </h3>
                        <p style={{ color: '#000' }}>{selectedReport.description}</p>
                        <button className="close-btn" onClick={() => setSelectedReport(null)}>Đóng</button>
                    </div>
                </div>
            )}

            {/* 🟢 MODAL SỬA TRẠNG THÁI MỚI */}
            {selectedReport && newSelectedStatus !== null && renderStatusEditModal()}

        </div>
    );

    // --- renderCreateReport ĐÃ TỐI ƯU GIAO DIỆN VÀ MESSAGE ---
    const renderCreateReport = () => (
        <div className="create-report-container">
            <div className="report-form-card">
                <h3 className="report-title">Gửi Báo Cáo Hỗ Trợ</h3>

                <label className="report-label">Mô tả chi tiết:</label>
                <textarea
                    className="report-textarea"
                    rows="5"
                    value={newReportDescription}
                    onChange={(e) => setNewReportDescription(e.target.value)}
                    placeholder="Mô tả sự cố hệ thống, vấn đề cần cải thiện..."
                />

                {/* ❌ Đã xóa phần hiển thị creationMessage cũ */}

                <button className="report-button" onClick={handleCreateReport} disabled={!senderId}>
                    Gửi Báo Cáo Hệ Thống
                </button>
                {/* ⚠️ Giữ lại thông báo lỗi nếu không có User ID vì nó là phần của UI form, không phải toast notification */}
                {!senderId && <p className="report-message error">Không tìm thấy User ID (Bạn cần đăng nhập).</p>}
            </div>
        </div>
    );

    // --- return (ManagerReport) ---
    return (
        <div className="manager-page">
            {/* 🟢 ANT DESIGN CONTEXT HOLDER PHẢI NẰM Ở ĐÂY */}
            {contextHolder}

            <div className="main-report-content-box">
                {/* 🎯 BỌC TIÊU ĐỀ và CONTROLS để cô lập style */}
                <div className="header-and-controls-section">
                    <h2>Quản lý và tạo báo cáo</h2>
                    <div className="manager-controls">
                        <button
                            className={`control-btn ${viewMode === 'PENDING' ? 'active' : ''}`}
                            onClick={() => setViewMode('PENDING')}
                        >
                            📑 Đang Chờ Xử Lý
                        </button>
                        <button
                            className={`control-btn ${viewMode === 'IN_PROGRESS' ? 'active' : ''}`}
                            onClick={() => setViewMode('IN_PROGRESS')}
                        >
                            ⏳ Đang Giải Quyết
                        </button>
                        <button
                            className={`control-btn ${viewMode === 'RESOLVED' ? 'active' : ''}`}
                            onClick={() => setViewMode('RESOLVED')}
                        >
                            ✅ Đã Xử Lý
                        </button>
                        <button
                            className={`control-btn ${viewMode === 'REJECTED' ? 'active' : ''}`}
                            onClick={() => setViewMode('REJECTED')}
                        >
                            ❌ Đã Từ Chối
                        </button>

                        <button
                            className={`control-btn ${viewMode === 'create' ? 'active' : ''}`}
                            onClick={() => setViewMode('create')}
                        >
                            📩 Gửi Báo Cáo Hỗ Trợ
                        </button>
                    </div>
                </div>

                {viewMode === 'create' ? renderCreateReport() : renderReportQueue()}

            </div>

        </div>
    );
};

export default ManagerReport;