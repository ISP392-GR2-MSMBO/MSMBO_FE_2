import axios from "axios";

export const userApi = {
    // Lấy danh sách tất cả user
    getUsers: async () => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
            : { credentials: 'include' };
        const response = await axios.get("https://api-movie6868.purintech.id.vn/api/users", config);
        return response.data;
    },

    // Lấy 1 user theo ID
    getUserById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.get(`https://api-movie6868.purintech.id.vn/api/users/${id}`, config);
        return response.data;
    },

    // Tạo user mới
    createUser: async (data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.post("https://api-movie6868.purintech.id.vn/api/users", data, config);
        return response.data;
    },

    // Cập nhật user
    updateUser: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.put(`https://api-movie6868.purintech.id.vn/api/users/${id}`, data, config);
        return response.data;
    },

    // Xóa user
    deleteUser: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.delete(`https://api-movie6868.purintech.id.vn/api/users/${id}`, config);
        return response.data;
    },


    // Cập nhật role cho user
    updateUserRole: async (id, newRole) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        // Gửi request PUT với query parameter newRole
        const response = await axios.put(`https://api-movie6868.purintech.id.vn/api/users/${id}/role`, null, {
            ...config,
            params: { newRole }
        });
        return response.data;
    },
    // src/api/userApi.js
    getUserByUsername: async (username, expectedRole) => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = storedUser?.token;

        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            params: { keyword: username },
        };

        try {
            const response = await axios.get(
                "https://api-movie6868.purintech.id.vn/api/users/userName",
                config
            );

            const users = response.data;
            console.log("📦 API trả về:", users);

            // ✅ Nếu có truyền expectedRole (ví dụ "MA" hoặc "CUS") thì lọc theo role
            const matchedUser = expectedRole
                ? users.find(u => u.userName === username && u.roleID === expectedRole)
                : users.find(u => u.userName === username);

            if (matchedUser) return matchedUser;

            throw new Error("Không tìm thấy người dùng phù hợp!");
        } catch (error) {
            console.error("❌ Lỗi khi gọi API getUserByUsername:", error);
            throw error;
        }
    },

    // ✅ Lấy user theo username (query ?keyword=)
    getUserByUsernameForAdmin: async (username) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.get(`https://api-movie6868.purintech.id.vn/api/users/userName?keyword=${username}`, config);
        return response.data;
    },
};
