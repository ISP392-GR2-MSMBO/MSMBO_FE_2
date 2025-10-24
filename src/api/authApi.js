// ✅ API cho đăng nhập & đăng ký
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

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
};
