// src/api/bookingApi.js (Đã sửa đổi)

import axios from 'axios';

const API_BASE_URL = "https://api-movie6868.purintech.id.vn/api";

// -------------------------------------------------------------------------
// AUTH UTILS (Đảm bảo tính nhất quán với cách lưu trữ token)
// -------------------------------------------------------------------------

/**
 * Lấy token xác thực từ localStorage (key: "user")
 */
export const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            // ✅ Phải đảm bảo 'token' là key chứa token trong object user
            return userObject?.token;
        } catch (e) {
            return null;
        }
    }
    return null;
};

/**
 * Lấy ID người dùng hiện tại từ localStorage (key: "user")
 */
export const getCurrentUserId = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            // ✅ Phải đảm bảo 'id' (hoặc 'userID') là key chứa ID người dùng
            return userObject?.id || userObject?.userID;
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

// -------------------------------------------------------------------------
// BOOKING API FUNCTIONS
// -------------------------------------------------------------------------

export const bookingApi = {
    // API Đặt vé (SỬ DỤNG AUTH CONFIG để tránh lỗi "User not found")
    createBooking: async (data) => {
        const config = createAuthConfig();
        const response = await axios.post(`${API_BASE_URL}/bookings`, data, config);
        return response.data;
    },

    // API Lấy ghế đã bán theo suất chiếu (SỬ DỤNG AUTH CONFIG)
    getSoldSeatsByShowtime: async (showtimeId) => {
        const config = createAuthConfig();
        // Dùng endpoint từ Swagger: /api/bookings/showtime/{showtimeId}/sold-seats
        const response = await axios.get(
            `${API_BASE_URL}/bookings/showtime/${showtimeId}/sold-seats`,
            config
        );

        // CHỈ LẤY DANH SÁCH seatID ĐÃ BÁN (để hợp nhất logic ở component)
        return response.data.map(seat => seat.seatID);
    },

    // API Lấy danh sách booking theo UserID 
    getBookingsByUserId: async (userId) => {
        const config = createAuthConfig();
        const response = await axios.get(`${API_BASE_URL}/bookings/user/${userId}`, config);
        return response.data;
    },
    // Lấy chi tiết booking theo BookingID
    getBookingById: async (bookingId) => {
        const config = createAuthConfig();
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, config);
        return response.data;
    },
    getBookingDetailById: async (bookingDetailId) => {
        const config = createAuthConfig();
        const response = await axios.get(`${API_BASE_URL}/bookings/details/${bookingDetailId}`, config);
        return response.data;
    },


    deleteBookingById: async (bookingId) => {
        const config = createAuthConfig();
        if (!config.headers.Authorization) {
            throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
        }

        return axios
            .delete(`${API_BASE_URL}/bookings/${bookingId}`, config)
            .then((response) => response.data)
            .catch((error) => {
                console.error(`Error deleting booking ${bookingId}:`, error);
                // Ném lỗi để component PaymentFail có thể bắt và hiển thị
                throw error;
            });
    },
};