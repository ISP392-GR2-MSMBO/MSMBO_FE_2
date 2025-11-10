
import axios from "axios";
const BASE_URL = "https://api-movie6868.purintech.id.vn/api/reports";
export const reportApi = {
    // 🟢 Lấy danh sách report của người gửi
    getReportsBySender: async (senderId) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${BASE_URL}/sender/${senderId}`, config);
        return res.data;
    },



    // 🟢 Gửi báo cáo (tạo report mới)
    createReport: async (senderId, reportData) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        };
        const res = await axios.post(`${BASE_URL}/sender/${senderId}`, reportData, config);
        return res.data;
    },


    // 🟡 Lấy chi tiết report theo ID
    getReportById: async (reportId) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${BASE_URL}/${reportId}`, config);
        return res.data;
    },


    // 🟠 Cập nhật trạng thái report (Cho Manager/Admin)
    updateReportStatus: async (reportId, status) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        };
        const res = await axios.patch(`${BASE_URL}/${reportId}/status`, { status }, config);
        return res.data;
    },


    // 🔵 Lấy danh sách report đang chờ xử lý
    getPendingQueue: async () => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${BASE_URL}/queue`, config);
        return res.data;
    }
};
