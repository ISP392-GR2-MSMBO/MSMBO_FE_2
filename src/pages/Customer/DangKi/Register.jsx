import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { message } from "antd";
import { authApi } from "../../../api/authApi";
import "./Register.css";

const Register = () => {
    const history = useHistory();
    const [messageApi, contextHolder] = message.useMessage();

    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const getVietnameseErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 1002:
            case 1003:
                return "Tên đăng nhập đã tồn tại.";
            case 1010:
                return "Email này đã được sử dụng.";
            case 1011:
                return "Số điện thoại này đã được sử dụng.";
            case 9999:
                return "Lỗi không xác định. Vui lòng thử lại.";
            default:
                return null;
        }
    };

    const showMessage = (type, content) => {
        messageApi.open({
            type,
            content,
            duration: 2.5,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // ✅ VALIDATE INPUT
        if (!fullName) return showMessage("error", "Họ và Tên không được để trống.");
        if (!userName) return showMessage("error", "Tên đăng nhập không được để trống.");
        if (!email) return showMessage("error", "Email không được để trống.");
        if (!phone) return showMessage("error", "Số điện thoại không được để trống.");
        if (!password) return showMessage("error", "Mật khẩu không được để trống.");
        if (!confirmPassword) return showMessage("error", "Mật khẩu xác nhận không được để trống.");

        // ✅ KIỂM TRA EMAIL HỢP LỆ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return showMessage("error", "Email không đúng định dạng. Vui lòng nhập lại.");
        }

        // ✅ KIỂM TRA SỐ ĐIỆN THOẠI: BẮT ĐẦU BẰNG 0, GỒM 10 SỐ
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return showMessage("error", "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.");
        }

        if (password !== confirmPassword) {
            return showMessage("error", "Mật khẩu xác nhận không khớp.");
        }

        setLoading(true);
        try {
            await authApi.register({
                fullName,
                userName,
                email,
                phone,
                password,
            });

            showMessage("success", "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
            setTimeout(() => history.push("/login"), 2000);
        } catch (err) {
            console.error("Register error:", err);
            const responseData = err.response?.data;
            let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

            if (responseData) {
                const errorCode = responseData.code;
                const backendMessage = responseData.message || responseData.details?.fullName;
                const specificError = getVietnameseErrorMessage(errorCode);
                errorMessage = specificError || backendMessage || errorMessage;
            }

            showMessage("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            {contextHolder}
            <h2>Đăng ký</h2>
            <form className="register-form" onSubmit={handleRegister} noValidate>
                <input
                    type="text"
                    placeholder="Họ và Tên (Full Name)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Xác nhận Mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            <p className="register-link">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </div>
    );
};

export default Register;
