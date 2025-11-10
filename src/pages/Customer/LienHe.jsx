import React, { useState } from "react";
import { message } from "antd";
import { reportApi } from "../../api/reportApi";
import "../../layout/LienHe.css"; // Giả sử CSS đã được sửa trong file này

const LienHe = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [description, setDescription] = useState("");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser?.userID;

    const handleSubmitReport = async () => {
        if (!description.trim()) {
            messageApi.open({
                type: "warning",
                content: "⚠️ Vui lòng nhập nội dung phản hồi hoặc báo cáo.",
            });
            return;
        }

        if (!senderId) {
            messageApi.open({
                type: "error",
                content: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
            });
            return;
        }

        try {
            await reportApi.createReport(senderId, {
                description,
                reportType: "CUSTOMER_FEEDBACK",
            });

            messageApi.open({
                type: "success",
                content: "Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp ý kiến.",
            });

            setDescription("");
        } catch (error) {
            console.error("❌ Lỗi gửi báo cáo:", error);
            messageApi.open({
                type: "error",
                content: "❌ Gửi phản hồi thất bại. Vui lòng thử lại sau.",
            });
        }
    };

    return (
        <div className="customer-report-page">
            {contextHolder}
            {/* SỬA ĐỔI CLASS: report-form-card -> cus-report-form-card */}
            <div className="cus-report-form-card">
                {/* SỬA ĐỔI CLASS: report-title -> cus-report-title */}
                <h3 className="cus-report-title">Gửi Phản Hồi / Báo Cáo Sự Cố</h3>

                {/* SỬA ĐỔI CLASS: report-label -> cus-report-label */}
                <label className="cus-report-label">Nội dung phản hồi:</label>
                <textarea
                    // SỬA ĐỔI CLASS: report-textarea -> cus-report-textarea
                    className="cus-report-textarea"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập phản hồi hoặc vấn đề bạn gặp phải..."
                />

                <button
                    // SỬA ĐỔI CLASS: report-button -> cus-report-button
                    className="cus-report-button"
                    onClick={handleSubmitReport}
                    disabled={!senderId}
                >
                    📩 Gửi Phản Hồi
                </button>

                {!senderId && (
                    // SỬA ĐỔI CLASS: report-message error -> cus-report-message error
                    <p className="cus-report-message error">
                        ⚠️ Bạn cần đăng nhập để gửi phản hồi.
                    </p>
                )}
            </div>
        </div>
    );
};

export default LienHe;