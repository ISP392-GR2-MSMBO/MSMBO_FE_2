import axios from "axios";

export const showtimeApi = {
    // ✅ Lấy tất cả showtime
    getShowtimes: async () => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get("http://localhost:8080/api/showtime", config);
        return res.data;
    },

    // ✅ Lấy showtime theo movieID
    getShowtimesByMovie: async (movieID) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`http://localhost:8080/api/showtime/movie/${movieID}`, config);
        return res.data;
    },

    // ✅ Tạo showtime mới
    createShowtime: async (data) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.post("http://localhost:8080/api/showtime", data, config);
        return res.data;
    },

    // ✅ Cập nhật showtime
    updateShowtime: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.put(`http://localhost:8080/api/showtime/${id}`, data, config);
        return res.data;
    },

    // ✅ Xóa showtime
    deleteShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.delete(`http://localhost:8080/api/showtime/${id}`, config);
        return res.data;
    },
    // ✅ Duyệt showtime (Approve)
    approveShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        // Giả sử backend có endpoint: POST /api/showtime/{id}/approve
        const res = await axios.post(`http://localhost:8080/api/showtime/${id}/approve`, {}, config);
        return res.data;
    },

    // ✅ Từ chối showtime (Reject)
    rejectShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        // Giả sử backend có endpoint: POST /api/showtime/{id}/reject
        const res = await axios.post(`http://localhost:8080/api/showtime/${id}/reject`, {}, config);
        return res.data;
    },
    //customer
    getApprovedShowtimesByMovie: async (movieID) => {
        const res = await axios.get(`http://localhost:8080/api/showtime/movie/${movieID}`);
        const data = res.data;

        return Array.isArray(data)
            ? data.filter((s) => s.approveStatus === "APPROVE")
            : [];
    },


};
