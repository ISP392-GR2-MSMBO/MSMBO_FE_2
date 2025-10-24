import axios from "axios";

export const userApi = {
    // Lấy danh sách tất cả user
    getUsers: async () => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
            : { credentials: 'include' };
        const response = await axios.get("http://localhost:8080/api/users", config);
        return response.data;
    },

    // Lấy 1 user theo ID
    getUserById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.get(`http://localhost:8080/api/users/${id}`, config);
        return response.data;
    },

    // Tạo user mới
    createUser: async (data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.post("http://localhost:8080/api/users", data, config);
        return response.data;
    },

    // Cập nhật user
    updateUser: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.put(`http://localhost:8080/api/users/${id}`, data, config);
        return response.data;
    },

    // Xóa user
    deleteUser: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.delete(`http://localhost:8080/api/users/${id}`, config);
        return response.data;
    },


    // Cập nhật role cho user
    updateUserRole: async (id, newRole) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        // Gửi request PUT với query parameter newRole
        const response = await axios.put(`http://localhost:8080/api/users/${id}/role`, null, {
            ...config,
            params: { newRole }
        });
        return response.data;
    },
    getUserByUsername: async (username) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            : { withCredentials: true };

        const response = await axios.get("http://localhost:8080/api/users/userName", {
            ...config,
            params: { keyword: username },
        });

        console.log("📦 API trả về user theo username:", response.data);
        return response.data; // API trả mảng [{...}]
    },
};
