// api/promotionApi.js

// Đảm bảo dùng HTTPS như API bạn cung cấp
const BASE_URL = 'https://api-movie6868.purintech.id.vn';

export const promotionApi = {

    /**
     * Lấy danh sách tất cả các chương trình ưu đãi (Promotions) ĐANG HOẠT ĐỘNG
     * @returns {Promise<Array<Object>>} - Trả về danh sách ưu đãi đã lọc (active: true)
     */
    getAllPromotions: async () => {
        const url = `${BASE_URL}/api/admin/promotions`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                // API Customer thường không cần token, nhưng bạn có thể thêm nếu cần
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch promotions (HTTP ${response.status})`);
            }

            const data = await response.json();

            // ⭐ LỌC DỮ LIỆU: Chỉ trả về các đối tượng có active = true
            return data.filter(promo => promo.active === true);

        } catch (error) {
            console.error("Lỗi khi tải danh sách ưu đãi:", error);
            throw error;
        }
    },
    getPromotionById: async (id) => {
        const url = `${BASE_URL}/api/admin/promotions/${id}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Failed to fetch promotion ID ${id} (HTTP ${response.status})`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error(`Lỗi khi tải chi tiết ưu đãi ${id}:`, error);
            return null; // Trả về null khi có lỗi
        }
    },

};