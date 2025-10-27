import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { toast } from "react-toastify";
import { message } from "antd";
import { useLocalStorage } from "../../hook/useLocalStorage";
import "../../index.css";

const Login = () => {
    const history = useHistory();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Dùng hook để truy cập và thiết lập user trong localStorage
    const [, setUser] = useLocalStorage("user", null);

    const handleLogin = async () => {
        if (!userName || !password) {
            message.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.login({ userName, password });

            // ✅ Lưu user vào localStorage (bao gồm token, roleID, userName)
            setUser({
                token: data.token,
                roleID: data.roleID,
                userName: data.userName,
                // Thêm userID vào đây nếu API trả về ngay sau login
                // userID: data.userID, 
            });

            toast.success(`Chào mừng ${data.userName}!`);

            if (data.roleID === "MA") {
                history.push("/admin");
            } else {
                history.push("/");
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Đăng nhập thất bại! Sai username hoặc password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Đăng nhập</h2>
            <form
                className="auth-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
            >
                <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                {/* SỬ DỤNG CLASS LOGIN-BTN */}
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
};

export default Login;