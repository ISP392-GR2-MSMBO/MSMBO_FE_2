import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { authApi } from "../../api/authApi";
// Loại bỏ import toast vì đã chuyển sang dùng message Antd
// import { toast } from "react-toastify";
import { message } from "antd"; // ✅ Giữ lại import message
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

            // ✅ Lưu user vào localStorage
            setUser({
                token: data.token,
                roleID: data.roleID,
                userName: data.userName,
                userID: data.userID,

            });

            // ✅ Sử dụng messageApi.success
            messageApi.success(`Chào mừng ${data.userName}!`);

            if (data.roleID === "MA") {
                history.push("/manager");
            } else if (data.roleID === "ST") { // <--- THÊM ĐIỀU KIỆN CHO STAFF
                history.push("/staff");
            } else {
                history.push("/");
            }
        } catch (err) {
            console.error("Login error:", err);
            // ✅ Sử dụng messageApi.error cho lỗi đăng nhập thất bại
            messageApi.error("Tên đăng nhập hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* ✅ THÊM contextHolder VÀO ĐÂY */}
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
                {/* SỬ DỤNG CLASS LOGIN-BTN */}
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
};

export default Login;
