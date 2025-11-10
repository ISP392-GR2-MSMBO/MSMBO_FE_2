import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { message } from "antd";
import { authApi } from "../../api/authApi";
import { useLocalStorage } from "../../hook/useLocalStorage";
import "../../index.css";

const Login = () => {
    const history = useHistory();
    const [messageApi, contextHolder] = message.useMessage();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [, setUser] = useLocalStorage("user", null);

    const handleLogin = async () => {
        if (!userName || !password) {
            messageApi.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.login({ userName, password });
            setUser({
                token: data.token,
                roleID: data.roleID,
                userName: data.userName,
                userID: data.userID,
            });
            messageApi.success(`Chào mừng ${data.userName}!`);
            if (data.roleID === "MA") history.push("/manager");
            else if (data.roleID === "ST") history.push("/staff");
            else if (data.roleID === "AD") history.push("/admin");
            else history.push("/");
        } catch (err) {
            console.error("Login error:", err);
            messageApi.error("Tên đăng nhập hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {contextHolder}
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
                    placeholder="Tên đăng nhập"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <br />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>

            {/* ✅ Nút Quên mật khẩu */}
            <p style={{ marginTop: "10px" }}>
                <Link to="/forgot-password" className="forgot-link">
                    Quên mật khẩu?
                </Link>
            </p>
        </div>
    );
};

export default Login;
