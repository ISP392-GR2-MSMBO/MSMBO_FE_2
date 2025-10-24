// src/api/adminApi.js
import { userApi } from "./userApi";

export const adminApi = {
    // ✅ Lấy thông tin người đăng nhập dựa vào username lưu trong localStorage
    getProfile: async () => {
        try {
            const username = localStorage.getItem("userName"); // phải trùng tên key khi login
            if (!username) throw new Error("Không tìm thấy username trong localStorage!");

            const data = await userApi.getUserByUsername(username);

            console.log("✅ Dữ liệu người dùng trả về:", data);
            // API trả về mảng → lấy phần tử đầu tiên
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin profile:", error);
            throw error;
        }
    },
};
