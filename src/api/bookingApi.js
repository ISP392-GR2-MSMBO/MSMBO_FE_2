// src/api/bookingApi.js (hoặc file API tương ứng)

import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api";

// Hàm hỗ trợ để lấy token từ localStorage (object 'user')
const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            return userObject?.token;
        } catch (e) {
            return null;
        }
    }
    return null;
};

const createAuthConfig = () => {
    const token = getAuthToken();
    return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
};

export const bookingApi = {
    // API Đặt vé (đã có trong code Seatmap.js)
    createBooking: async (data) => {
        const config = createAuthConfig();
        const response = await axios.post(`${API_BASE_URL}/bookings`, data, config);
        return response.data;
    },

    // API Lấy ghế đã bán theo suất chiếu
    getSoldSeatsByShowtime: async (showtimeId) => {
        const config = createAuthConfig();
        // API trả về danh sách các đối tượng ghế đã bán.
        const response = await axios.get(
            `${API_BASE_URL}/bookings/showtime/${showtimeId}/sold-seats`,
            config
        );

        // CHỈ LẤY DANH SÁCH seatID ĐÃ BÁN (để hợp nhất logic ở component)
        return response.data.map(seat => seat.seatID);
    },

    // ... các hàm API khác ...
};