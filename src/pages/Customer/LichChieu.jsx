import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import "../../layout/LichChieu.css";

const LichChieu = () => {
    const history = useHistory();
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");

    // Khởi tạo ngày hiện tại theo định dạng YYYY-MM-DD (en-CA) để so sánh chuỗi
    const todayDateString = new Date().toLocaleDateString("en-CA");

    // ===== Lấy dữ liệu phim & lịch chiếu =====
    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await movieApi.getMovies();
                const showtimeRes = await showtimeApi.getShowtimes();

                const movieList = Array.isArray(movieRes) ? movieRes : movieRes.data || [];
                const showtimeList = Array.isArray(showtimeRes) ? showtimeRes : showtimeRes.data || [];

                // Lọc chỉ lấy các suất chiếu đã được duyệt và chưa bị xóa
                const approvedShowtimes = showtimeList.filter(
                    (s) => s.approveStatus === "APPROVE" && !s.deleted
                );

                setMovies(movieList);
                setShowtimes(approvedShowtimes);

                // Thiết lập ngày mặc định là hôm nay
                setSelectedDate(todayDateString);
            } catch (error) {
                console.error("❌ Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, [todayDateString]); // Thêm todayDateString vào dependency array nếu cần (mặc dù nó là hằng số)

    // ===== Danh sách 5 ngày =====
    const nextDays = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            label:
                i === 0
                    ? `Hôm nay ${date.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                    })}`
                    : date.toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                    }),
            value: date.toLocaleDateString("en-CA"),
        };
    });

    // ===== LOGIC LỌC LỊCH CHIẾU THEO NGÀY VÀ GIỜ THỰC TẾ =====

    const now = new Date();
    // Lấy giờ hiện tại dưới dạng HH:MM (vd: "09:05") để so sánh chuỗi
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isToday = selectedDate === todayDateString;

    // 1. Lọc lịch chiếu theo ngày
    let showtimesFiltered = showtimes
        .filter((st) => st.date === selectedDate)
        .filter((st) => {
            // 2. Lọc theo thời gian thực (chỉ áp dụng cho ngày hôm nay)
            if (isToday) {
                // Giữ lại suất chiếu nếu giờ bắt đầu (st.startTime: "HH:MM") >= giờ hiện tại (currentTime: "HH:MM")
                return st.startTime >= currentTime;
            }
            // Nếu không phải hôm nay, giữ lại tất cả
            return true;
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime)); // Sắp xếp theo giờ tăng dần


    // ===== Lọc phim có suất chiếu trong ngày (từ showtimes đã lọc) =====
    const moviesForDate = movies.filter((movie) =>
        showtimesFiltered.some(
            (st) =>
                st.movieID === movie.movieID ||
                st.movieID === movie.id ||
                st.movieID === movie._id
        )
    );
    // -----------------------------------------------------------------


    return (
        <div className="lichchieu-page">
            <h1 className="lichchieu-title">🎬 Lịch Chiếu Phim</h1>

            {/* === Thanh chọn ngày === */}
            <div className="lichchieu-date-tabs">
                {nextDays.map((day) => (
                    <button
                        key={day.value}
                        className={`lichchieu-date-tab ${selectedDate === day.value ? "active" : ""
                            }`}
                        onClick={() => setSelectedDate(day.value)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            {/* === Danh sách phim === */}
            <div className="lichchieu-movie-list">
                {moviesForDate.length > 0 ? (
                    moviesForDate.map((movie) => {
                        // Lọc suất chiếu cho từng phim sau khi đã lọc theo ngày và giờ thực tế
                        const movieShowtimes = showtimesFiltered.filter(
                            (st) =>
                                st.movieID === movie.movieID ||
                                st.movieID === movie.id ||
                                st.movieID === movie._id
                        );

                        return (
                            <div
                                key={movie.movieID || movie.id}
                                className="lichchieu-movie-card"
                            >
                                <div className="lichchieu-poster-wrapper">
                                    <img
                                        src={
                                            movie.posterUrl ||
                                            movie.poster ||
                                            "/default-poster.jpg"
                                        }
                                        alt={movie.title || movie.movieName}
                                        className="lichchieu-movie-poster"
                                    />
                                </div>

                                <div className="lichchieu-movie-info">
                                    <h3 className="lichchieu-movie-title">
                                        {movie.title || movie.movieName}
                                    </h3>

                                    {movie.genre && (
                                        <p>
                                            🎭 <strong>Thể loại:</strong> {movie.genre}
                                        </p>
                                    )}
                                    {movie.duration && (
                                        <p>
                                            🕒 <strong>Thời lượng:</strong> {movie.duration} phút
                                        </p>
                                    )}
                                    {movie.director && (
                                        <p>
                                            🎥 <strong>Đạo diễn:</strong> {movie.director}
                                        </p>
                                    )}
                                    {movie.cast && (
                                        <p>
                                            👩‍🎤 <strong>Diễn viên:</strong> {movie.cast}
                                        </p>
                                    )}
                                    {movie.releaseDate && (
                                        <p>
                                            📅 <strong>Ngày khởi chiếu:</strong>{" "}
                                            {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    )}

                                    <div className="lichchieu-showtimes-inline">
                                        {movieShowtimes.map((st) => (
                                            <span
                                                key={st.showtimeID}
                                                className="lichchieu-showtime-badge"
                                            >
                                                {st.startTime}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        className="lichchieu-buy-btn"
                                        onClick={() =>
                                            history.push(`/movies/${encodeURIComponent(movie.movieName)}`)
                                        }
                                    >
                                        🎟 Mua vé
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="lichchieu-no-movie">
                        ❌ Không có phim nào được chiếu trong ngày này.
                    </p>
                )}
            </div>
        </div>
    );
};

export default LichChieu;