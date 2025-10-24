import axios from "axios";

const BASE_URL = "http://localhost:8080/api/seat";

export const seatApi = {
    // 🟢 Lấy tất cả ghế
    getAllSeats: async () => {
        const res = await axios.get(`${BASE_URL}/all`);
        return res.data;
    },

    // 🟢 Lấy tất cả ghế trong 1 phòng chiếu (theaterId)
    getSeatsByRoom: async (theaterId) => {
        const res = await axios.get(`${BASE_URL}/theater/${theaterId}`);
        return res.data;
    },

    // 🟢 Lấy thông tin 1 ghế theo seatID
    getSeatById: async (seatID) => {
        const res = await axios.get(`${BASE_URL}/${seatID}`);
        return res.data;
    },

    // 🟠 Cập nhật trạng thái ghế (ví dụ: đặt ghế, hủy đặt, v.v.)
    updateSeatStatus: async (seatID, status) => {
        const res = await axios.put(BASE_URL, {
            seatID,
            status, // "EMPTY" | "BOOKED" | "AVAILABLE" tùy theo API backend
        });
        return res.data;
    },
};
