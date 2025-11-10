import React, { useEffect, useState } from "react";
import { revenueApi } from "../../../api/revenueApi";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import "./Revenue.css";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const revenue = data.revenue;
        const note = data.message;

        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                <p className="label">**{label}**</p>
                <p className="intro" style={{ color: payload[0].color }}>
                    Doanh thu: {revenue > 0 ? revenue.toLocaleString("vi-VN") + " ₫" : "**Chưa có doanh thu**"}
                </p>
                {/* Vẫn giữ ghi chú ở Tooltip trên biểu đồ để cung cấp thông tin chi tiết */}
                {revenue === 0 && <p className="desc" style={{ color: '#d9534f', fontWeight: 'bold' }}>Ghi chú: {note}</p>}

            </div>
        );
    }
    return null;
};
// END CUSTOM TOOLTIP COMPONENT

const Revenue = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [year, setYear] = useState(2025);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Đảm bảo bạn đã sửa logic tên tháng trong file revenueApi.js
                const data = await revenueApi.getMonthlyRevenue(year);
                setRevenueData(data);
            } catch {
                console.error("Không thể tải dữ liệu doanh thu.");
            }
        };
        fetchData();
    }, [year]);

    return (
        <div className="revenue-page">
            <h1>Thống kê doanh thu năm <strong>{year}</strong></h1>
            <div className="year-selector">
                <label>Chọn năm: </label>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                />
            </div>

            {/* Biểu đồ cột doanh thu */}
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={revenueData}
                        // ĐIỀU CHỈNH MARGIN LEFT TỪ 0 LÊN 30
                        margin={{ top: 30, right: 30, left: 30, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />

                        {/* Sử dụng Custom Tooltip để hiển thị thông tin rõ ràng hơn */}
                        <Tooltip content={<CustomTooltip />} />

                        <Legend />
                        <Bar dataKey="revenue" fill="#4caf50" name="Doanh thu (₫)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h2 style={{ textAlign: 'center', marginTop: '40px', marginBottom: '15px' }}>Bảng Chi Tiết Doanh Thu</h2>

            <table className="revenue-table">
                <thead>
                    <tr>
                        <th>Tháng</th>
                        <th>Doanh thu</th>
                    </tr>
                </thead>
                <tbody>
                    {revenueData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.month}</td>
                            <td>
                                {item.revenue > 0
                                    ? item.revenue.toLocaleString("vi-VN") + " ₫"
                                    : <strong style={{ color: '#d9534f' }}>Chưa có doanh thu</strong>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Revenue;