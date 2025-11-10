import axios from "axios";

export const showtimeApi = {
    // ✅ Lấy tất cả showtime
    getShowtimes: async () => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get("https://api-movie6868.purintech.id.vn/api/showtime", config);
        return res.data;
    },

    // ✅ Lấy showtime theo movieID
    getShowtimesByMovie: async (movieID) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/showtime/movie/${movieID}`, config);
        return res.data;
    },


    // 📗 Thêm suất chiếu mới (Create)
    addShowtime: async (showtime) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.post("https://api-movie6868.purintech.id.vn/api/showtime", showtime, config);
        return res.data;
    },

    // ✅ Cập nhật showtime
    updateShowtime: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.put(`https://api-movie6868.purintech.id.vn/api/showtime/${id}`, data, config);
        return res.data;
    },

    // 📙 Cập nhật suất chiếu (Update)
    // updateShowtime: async (showtimeID, updatedData) => {
    //    const token = localStorage.getItem("token");
    //  const config = token
    //      ? { headers: { Authorization: `Bearer ${token}` } }
    //      : {};
    //   const res = await axios.put(`https://api-movie6868.purintech.id.vn/api/showtime/${showtimeID}`, updatedData, config);
    //  return res.data;
    //  },

    // ✅ Xóa showtime
    deleteShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.delete(`https://api-movie6868.purintech.id.vn/api/showtime/${id}`, config);
        return res.data;
    },
    // ✅ Duyệt showtime (Approve)
    approveShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        // Giả sử backend có endpoint: POST /api/showtime/{id}/approve
        const res = await axios.post(`https://api-movie6868.purintech.id.vn/api/showtime/${id}/approve`, {}, config);
        return res.data;
    },

    // ✅ Từ chối showtime (Reject)
    rejectShowtime: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        // Giả sử backend có endpoint: POST /api/showtime/{id}/reject
        const res = await axios.post(`https://api-movie6868.purintech.id.vn/api/showtime/${id}/reject`, {}, config);
        return res.data;
    },
    //customer
    getApprovedShowtimesByMovie: async (movieID) => {
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/showtime/movie/${movieID}`);
        const data = res.data;

        return Array.isArray(data)
            ? data.filter((s) => s.approveStatus === "APPROVE")
            : [];
    },




    // ✅ Lấy chi tiết suất chiếu và trạng thái ghế đã đặt
    getShowtimeDetailsWithSeats: async (showtimeId) => {
        // GIẢ ĐỊNH Backend có endpoint này. Đây là API QUAN TRỌNG nhất cho Seatmap
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/showtime/${showtimeId}/details-with-seats`);
        return res.data;

    },

    getShowtimeById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/showtime/${id}`, config);
        return res.data;
    },

    // 🆕 Lấy danh sách ghế đã bán theo suất chiếu
    getSeatsByShowtime: async (showtimeID) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // 🧠 Gọi song song 2 API bên booking service
        const [allSeatsRes, soldSeatsRes] = await Promise.all([
            axios.get(`https://api-movie6868.purintech.id.vn/api/bookings/showtime/${showtimeID}/seats`, config),
            axios.get(`https://api-movie6868.purintech.id.vn/api/bookings/showtime/${showtimeID}/sold-seats`, config)
        ]);


        const allSeats = allSeatsRes.data;
        const soldSeats = soldSeatsRes.data;

        // 🔗 Gộp dữ liệu
        const seatMap = allSeats.map(seat => ({
            ...seat,
            isSold: soldSeats.some(s => s.seatID === seat.seatID)
        }));

        return seatMap;
    },

};

