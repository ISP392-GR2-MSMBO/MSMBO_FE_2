// src/api/paymentApi.js (CODE ĐÃ SỬA ĐỔI)
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// ⚠️ CẦN TÁI SỬ DỤNG/ĐỊNH NGHĨA LẠI CÁC HÀM HỖ TRỢ XÁC THỰC

/** Lấy Token từ localStorage (user object) */
const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            return userObject?.token;
        } catch (e) { return null; }
    }
    return null;
};

// Hàm tạo config header có chứa token
const createAuthConfig = () => {
    const token = getAuthToken();
    return token
        ? { headers: { Authorization: `Bearer ${token}` } } // ✅ Thêm token
        : {};
};
// ----------------------------------------------------------------------


export const paymentApi = {
    /**
     * Tạo link thanh toán PayOS cho một booking
     */
    createPaymentLink: async (bookingId) => {
        // SỬA ĐỔI LỚN: Thêm config xác thực vào request POST
        const config = createAuthConfig();

        try {
            const response = await axios.post(
                `${BASE_URL}/payment/create-link`,
                { bookingId },
                config // <== ÁP DỤNG CONFIG CÓ TOKEN
            );
            return response.data;
        } catch (error) {
            // Log lỗi chi tiết để debug
            console.error("Lỗi tạo link thanh toán:", error.response || error.message);
            throw error; // Ném lỗi để component Payment.jsx bắt được
        }
    },

    /**
     * Xử lý callback từ PayOS (nếu cần test)
     */
    handleTransfer: async (data) => {
        // Hàm này có thể không cần Auth nếu nó là webhook từ PayOS
        const response = await axios.post(`${BASE_URL}/payment/payos_transfer_handler`, data);
        return response.data;
    },
};