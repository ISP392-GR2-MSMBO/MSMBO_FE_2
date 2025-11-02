// ✅ API cho đăng nhập & đăng ký
import axios from "axios";

const BASE_URL = "https://api-movie6868.purintech.id.vn/api/auth";

export const authApi = {
    // === Đăng nhập ===
    login: async (credentials) => {
        try {
            const res = await axios.post(`${BASE_URL}/login`, credentials, {
                headers: { "Content-Type": "application/json" },
            });

            const data = res.data; // { token, userID, userName, roleID }

            // ✅ Lưu token và userID vào localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userID", data.userID);

            return data;
        } catch (error) {
            console.error("❌ Login failed:", error.response?.data || error.message);
            throw error;
        }
    },


    // === Đăng ký ===
    register: async (userData) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, userData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("❌ Register failed:", error.response?.data || error.message);
            throw error;
        }
    },

    // === Quên Mật khẩu (Forgot Password) ===
    forgotPassword: async (email) => {
        try {
            // API thường chỉ cần email
            const response = await axios.post(`${BASE_URL}/forgot-password`, { email }, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("❌ Forgot Password failed:", error.response?.data || error.message);
            throw error;
        }
    },

    // === Đặt lại Mật khẩu (Reset Password) ===
    // Thường cần token/mã xác nhận và mật khẩu mới
    resetPassword: async (resetData) => {
        try {
            // resetData: { token, newPassword } hoặc { email, code, newPassword } tùy theo API
            const response = await axios.post(`${BASE_URL}/reset-password`, resetData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("❌ Reset Password failed:", error.response?.data || error.message);
            throw error;
        }
    },
};
