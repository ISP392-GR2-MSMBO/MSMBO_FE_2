// src/api/adminApi.js
import axios from "axios";

export const adminApi = {
    // ✅ Lấy thông tin người dùng hiện tại (theo username trong localStorage)
    getProfile: async () => {
        try {
            const username = localStorage.getItem("userName"); // Key này phải trùng khi login lưu vào
            if (!username) throw new Error("Không tìm thấy username trong localStorage!");

            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                params: { keyword: username }, // ✅ theo swagger
                withCredentials: true, // nếu backend bật allowCredentials(true)
            };

            const response = await axios.get(
                "http://localhost:8080/api/users/userName",
                config
            );

            console.log("📦 API trả về:", response.data);

            // ✅ backend trả về mảng => lấy phần tử đầu tiên
            const users = response.data;
            if (Array.isArray(users) && users.length > 0) {
                return users[0];
            } else {
                throw new Error("Không tìm thấy thông tin người dùng trong dữ liệu trả về.");
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin profile:", error.response || error.message);
            throw new Error("Không thể tải thông tin người dùng. Vui lòng thử lại.");
        }
    },
};
