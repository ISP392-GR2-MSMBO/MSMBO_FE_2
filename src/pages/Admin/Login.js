import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { toast } from "react-toastify";
import { message } from "antd";
import { useLocalStorage } from "../../hook/useLocalStorage"; // ✅ import hook
import "../../index.css";

const Login = () => {
    const history = useHistory();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Dùng useLocalStorage thay vì localStorage trực tiếp
    const [, setUser] = useLocalStorage("user", null);

    const handleLogin = async () => {
        if (!userName || !password) {
            message.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.login({ userName, password });

            // ✅ Lưu toàn bộ thông tin vào 1 object
            setUser({
                token: data.token,
                roleID: data.roleID,
                userName: data.userName,
            });

            toast.success(`Chào mừng ${data.userName}!`);

            if (data.roleID === "AD" || data.roleID === "MA") {
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
                <button type="submit" className="buy-btn" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
            <p className="auth-link">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
        </div>
    );
};

export default Login;
