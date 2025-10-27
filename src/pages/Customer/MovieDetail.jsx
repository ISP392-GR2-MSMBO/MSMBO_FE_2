import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import "../../layout/MovieDetail.css";

const MovieDetail = () => {
    const { name } = useParams();
    const history = useHistory();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvedShowtimes, setApprovedShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const data = await movieApi.getMovieByName(name);
                const movieData = Array.isArray(data) ? data[0] : data;

                if (!movieData) {
                    setError("Không tìm thấy phim");
                    return;
                }

                setMovie(movieData);

                const movieID = movieData.movieID || movieData._id || movieData.id;
                if (!movieID) {
                    console.error("❌ Không có movieID hợp lệ");
                    return;
                }

                const showtimes = await showtimeApi.getApprovedShowtimesByMovie(movieID);
                const activeShowtimes = Array.isArray(showtimes)
                    ? showtimes.filter((s) => !s.deleted)
                    : [];
                setApprovedShowtimes(activeShowtimes);

            } catch (err) {
                console.error("❌ Lỗi khi tải:", err);
                setError("Không thể tải thông tin phim");
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [name]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;
    if (!movie) return <p>Không tìm thấy phim.</p>;

    // ==== Lấy danh sách 7 ngày liên tiếp ====
    const nextDays = Array.from({ length: 7 }, (_, i) => {
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

    // ==== Lọc lịch chiếu theo ngày và sắp xếp theo giờ ====
    // Biến này chứa danh sách các suất chiếu đã được lọc theo ngày và sắp xếp theo giờ
    const showtimesForSelectedDate = approvedShowtimes
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // **ĐÃ BỎ:** Không cần hàm groupedShowtimes nữa vì không cần nhóm theo rạp/phòng.

    // ==== Hàm xử lý khi click vào giờ chiếu (Truyền state) ====
    const handleSelectShowtime = (showtime) => {
        const dataToPass = {
            movie: movie,
            showtime: showtime,
        };

        history.push(`/book/${showtime.showtimeID}`, { state: dataToPass });
    };


    return (
        <div className="movie-detail-page">
            <div className="trailer-section">
                {movie.trailer ? (
                    <iframe
                        src={movie.trailer.replace("watch?v=", "embed/")}
                        title="Trailer"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="no-trailer">🎞 Trailer chưa được cập nhật</div>
                )}
            </div>

            <div className="detail-container">
                <div className="poster">
                    <img
                        src={movie.poster || "/default-poster.jpg"}
                        alt={movie.movieName}
                    />
                </div>
                <div className="info">
                    <h1 className="title">{movie.movieName}</h1>
                    <p>
                        <strong>🎭 Thể loại:</strong> {movie.genre || "Không rõ"}
                    </p>
                    <p>
                        <strong>🕒 Thời lượng:</strong>{" "}
                        {movie.duration ? `${movie.duration} phút` : "Đang cập nhật"}
                    </p>
                    <p>
                        <strong>🎥 Đạo diễn:</strong>{" "}
                        {movie.director || "Đang cập nhật"}
                    </p>
                    <p>
                        <strong>👩‍🎤 Diễn viên:</strong>{" "}
                        {movie.actress || "Đang cập nhật"}
                    </p>
                    <p>
                        <strong>📅 Ngày khởi chiếu:</strong>{" "}
                        {movie.releaseDate
                            ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
                            : "Chưa xác định"}
                    </p>
                </div>
            </div>

            <div className="description-section">
                <h2>Nội dung phim</h2>
                <p>{movie.description || "Nội dung phim đang được cập nhật."}</p>
            </div>

            <div className="showtime-section">
                <h2>Lịch Chiếu</h2>

                <div className="date-tabs">
                    {nextDays.map((day) => (
                        <button
                            key={day.value}
                            className={`date-tab ${selectedDate === day.value ? "active" : ""}`}
                            onClick={() => setSelectedDate(day.value)}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                {showtimesForSelectedDate.length > 0 ? (
                    // **ĐÃ SỬA:** Hiển thị tất cả giờ chiếu trong một lưới duy nhất
                    <div className="showtime-grid single-grid">
                        {showtimesForSelectedDate.map((st) => (
                            <button
                                key={st.showtimeID}
                                className="showtime-btn"
                                onClick={() => handleSelectShowtime(st)}
                            >
                                {st.startTime}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="no-showtime">🎫 Không có suất chiếu cho ngày này.</p>
                )}
            </div>
        </div>
    );
};

export default MovieDetail;