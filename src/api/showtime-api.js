import axios from "axios";

const BASE_URL = "https://api-movie6868.purintech.id.vn/api/showtime";
const BOOKING_BASE_URL = "https://api-movie6868.purintech.id.vn/api/bookings/showtime";

export const showtimeApi = {
    // 📘 Lấy toàn bộ danh sách suất chiếu
    getShowtimes: async () => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.get(BASE_URL, config);
        return res.data;
    },

    // 📗 Thêm suất chiếu mới (Create)
    addShowtime: async (showtime) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.post(BASE_URL, showtime, config);
        return res.data;
    },

    // 📙 Cập nhật suất chiếu (Update)
    updateShowtime: async (showtimeID, updatedData) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.put(`${BASE_URL}/${showtimeID}`, updatedData, config);
        return res.data;
    },

    // 📕 Xóa suất chiếu (Delete)
    deleteShowtime: async (showtimeID) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.delete(`${BASE_URL}/${showtimeID}`, config);
        return res.data;
    },

    // 📔 Lấy suất chiếu theo ID (Read by ID)
    getShowtimeById: async (showtimeID) => {
        const token = localStorage.getItem("token");
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        const res = await axios.get(`${BASE_URL}/${showtimeID}`, config);
        return res.data;
    },
    // 🆕 Lấy danh sách ghế đã bán theo suất chiếu
    getSeatsByShowtime: async (showtimeID) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // 🧠 Gọi song song 2 API bên booking service
        const [allSeatsRes, soldSeatsRes] = await Promise.all([
            axios.get(`${BOOKING_BASE_URL}/${showtimeID}/seats`, config),
            axios.get(`${BOOKING_BASE_URL}/${showtimeID}/sold-seats`, config)
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
