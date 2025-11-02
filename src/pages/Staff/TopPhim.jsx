import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
// ✅ Đổi tên file CSS
import "./TopPhim.css";

const StaffTopMoviesWeek = () => { // ✅ Đổi tên component
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://api-movie6868.purintech.id.vn/api/statistics/top-movies-week");
                setMovies(res.data);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // ✅ Đã sửa class loading
    if (loading) return <p className="staff-loading">⏳ Đang tải dữ liệu...</p>;

    return (
        // ✅ Đã sửa top-movies-container
        <div className="staff-top-movies-container">
            {/* ✅ Đã sửa title */}
            <h2 className="staff-title">🎬 Top Phim Bán Chạy Trong Tuần</h2>

            {/* TABLE */}
            {/* ✅ Đã sửa top-movies-table */}
            <table className="staff-top-movies-table">
                <thead>
                    <tr>
                        <th>Tên Phim</th>
                        <th>Số Vé Bán</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((m, i) => (
                        <tr key={i}>
                            <td>{m.movieName}</td>
                            {/* ✅ Đã sửa center */}
                            <td className="staff-center">{m.ticketCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* CHART */}
            {/* ✅ Đã sửa chart-box */}
            <div className="staff-chart-box">
                <ResponsiveContainer>
                    <BarChart data={movies}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="movieName" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="ticketCount" fill="#6366f1" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StaffTopMoviesWeek; // ✅ Export tên component mới