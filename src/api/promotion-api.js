import axios from "axios";

const API_BASE = "https://api-movie6868.purintech.id.vn/api"; // đổi theo backend của bạn

export const promotionApi = {
    createPromotion: async (data) => {
        const res = await axios.post(`${API_BASE}/admin/promotions`, data);
        return res.data;
    },

    applyPromotionToSeatTypes: async (promotionId, seatTypeIds) => {
        const res = await axios.post(
            `${API_BASE}/admin/promotions/${promotionId}/apply-to-seat-types`,
            { seatTypeIds }
        );
        return res.data;
    },
    toggleStatus: async (promotionId, isActive) => {
        const res = await axios.patch(
            `${API_BASE}/admin/promotions/${promotionId}/status`,
            { isActive }
        );
        return res.data;
    },
};
