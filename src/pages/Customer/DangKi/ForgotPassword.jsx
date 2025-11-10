import React, { useState } from "react";
import { message } from "antd";
import { authApi } from "../../../api/authApi";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!email) return messageApi.error("Vui lòng nhập email!");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageApi.error("Email không đúng định dạng!");
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            messageApi.success("Đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra email!");
        } catch (err) {
            console.error("Forgot password error:", err);
            messageApi.error("Không thể gửi yêu cầu. Kiểm tra lại email hoặc thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {contextHolder}
            <h2>Quên mật khẩu</h2>
            <form className="auth-form" onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Đang gửi..." : "Gửi link đặt lại"}
                </button>
            </form>
            <p className="note">Sau khi gửi, vui lòng kiểm tra hộp thư đến (và thư rác).</p>
        </div>
    );
};

export default ForgotPassword;
