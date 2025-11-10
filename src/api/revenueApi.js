import axios from "axios";

const API_BASE_URL = "https://api-movie6868.purintech.id.vn/api";

export const revenueApi = {
    async getMonthlyRevenue(year) {
        try {
            const response = await axios.get(`${API_BASE_URL}/statistics/monthly-revenue`, {
                params: { year },
            });

            // Mảng tên tháng đầy đủ (dùng cho hiển thị trên biểu đồ và bảng)
            const fullMonths = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            // Mảng tên tháng viết tắt (dùng để so sánh với dữ liệu API)
            const shortMonths = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            const data = fullMonths.map((month, index) => {
                const shortMonth = shortMonths[index]; // Lấy tên viết tắt tương ứng

                // **LỖI ĐÃ ĐƯỢC SỬA: Tìm kiếm bằng tên tháng viết tắt từ API**
                const found = response.data.find((item) => item.month === shortMonth);

                return found
                    ? { month, revenue: found.revenue }
                    : { month, revenue: 0, message: "Tháng này chưa có doanh thu" };
            });

            return data;
        } catch (error) {
            console.error("Lỗi khi gọi API doanh thu:", error);
            throw error;
        }
    },
};