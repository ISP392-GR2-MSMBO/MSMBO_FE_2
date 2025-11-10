import React, { useState } from "react";
import { message } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { authApi } from "../../../api/authApi";
import "./ResetPassword.css";

const ResetPassword = () => {
    const history = useHistory();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔑 Lấy token từ URL (?token=abc)
    const token = new URLSearchParams(location.search).get("token");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword)
            return messageApi.error("Vui lòng nhập đầy đủ thông tin!");
        if (newPassword !== confirmPassword)
            return messageApi.error("Mật khẩu xác nhận không khớp!");

        setLoading(true);
        try {
            await authApi.resetPassword(token, newPassword);
            messageApi.success("Đặt lại mật khẩu thành công!");
            setTimeout(() => history.push("/login"), 2000);
        } catch (err) {
            console.error("Reset password error:", err);
            messageApi.error("Liên kết không hợp lệ hoặc đã hết hạn!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            {contextHolder}
            <h2>Đặt Lại Mật Khẩu</h2>
            <form className="reset-form" onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit" className="reset-btn" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
