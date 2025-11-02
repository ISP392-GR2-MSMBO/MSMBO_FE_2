import axios from "axios";

const BASE_URL = "https://api-movie6868.purintech.id.vn/api/users";

export const userApi = {
    // ✅ Lấy danh sách tất cả user
    getUsers: async () => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
            : { credentials: "include" };
        const response = await axios.get(BASE_URL, config);
        return response.data;
    },

    // ✅ Lấy user theo username (query ?keyword=)
    getUserByUsername: async (username) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.get(`${BASE_URL}/userName?keyword=${username}`, config);
        return response.data;
    },

    // ✅ Tạo user mới
    createUser: async (data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.post(BASE_URL, data, config);
        return response.data;
    },

    // ✅ Cập nhật user theo ID
    updateUser: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.put(`${BASE_URL}/${id}`, data, config);
        return response.data;
    },

    // ✅ Lấy user theo ID
    getUserById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.get(`${BASE_URL}/${id}`, config);
        return response.data;
    },

    // ✅ Xóa user theo ID
    deleteUser: async (id) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const response = await axios.delete(`${BASE_URL}/${id}`, config);
        return response.data;
    },
};
