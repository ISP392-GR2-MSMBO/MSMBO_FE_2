import { useParams, useHistory } from "react-router-dom";
import movies from "./MovieData";
import "./MovieDetail.css";
import React, { useState } from "react";

const MovieDetail = () => {
    const { id } = useParams();
    const history = useHistory(); // ✅ Dùng cho React Router v5
    const movie = movies.find((m) => m.id === parseInt(id));
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);

    if (!movie) return <h2>Không tìm thấy phim</h2>;

    // ✅ Hàm điều hướng sang Seatmap
    const goToSeatmap = (time, format) => {
        history.push(`/seatmap/${movie.id}`, {
            movieTitle: movie.title,
            image: movie.image,
            time: time,
            format: format,
        });
    };

    return (
        <div className="movie-detail-page">
            {/* Trailer */}
            <div className="trailer-section">
                <iframe
                    src={movie.trailer}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Info */}
            <div className="detail-container">
                {/* Poster */}
                <div className="poster">
                    <img src={movie.image} alt={movie.title} />
                </div>

                {/* Nội dung phim */}
                <div className="info">
                    <h1 className="title">{movie.title}</h1>

                    <p><strong>⏳ Thời lượng:</strong> {movie.duration}</p>
                    <p><strong>📅 Ngày khởi chiếu:</strong> {movie.releaseDate}</p>
                    <p><strong>🌍 Quốc gia:</strong> {movie.country}</p>
                    <p><strong>🏢 Nhà sản xuất:</strong> {movie.studio}</p>
                    <p><strong>🎬 Đạo diễn:</strong> {movie.director}</p>

                    {/* Tags
                    <div className="tags">
                        <strong>📖 Thể loại:</strong>
                        {movie.genre.map((g, i) => (
                            <span key={i} className="tag">{g}</span>
                        ))}
                    </div>

                     Cast 
                    <div className="cast">
                        <strong>🎭 Diễn viên:</strong>
                        {movie.cast.map((actor, i) => (
                            <span key={i} className="actor">{actor}</span>
                        ))}
                    </div> */}

                    {/* Mô tả phim */}
                    {movie.description && (
                        <div className="description-section">
                            <h2> Mô Tả Phim</h2>
                            <p>{movie.description}</p>
                        </div>
                    )}

                    {/* Lịch Chiếu */}
                    {movie.showtimes && (
                        <div className="showtime-section">
                            <h2> Lịch Chiếu</h2>

                            {/* Thanh chọn ngày */}
                            <div className="date-tabs">
                                {movie.showtimes.map((s, index) => (
                                    <button
                                        key={index}
                                        className={`date-btn ${selectedDateIndex === index ? "active" : ""}`}
                                        onClick={() => setSelectedDateIndex(index)}
                                    >
                                        {s.date}
                                    </button>
                                ))}
                            </div>

                            <div className="showtime-divider"></div>

                            {/* Phụ đề */}
                            {movie.showtimes[selectedDateIndex].subtitle &&
                                movie.showtimes[selectedDateIndex].subtitle.length > 0 && (
                                    <div className="showtime-block">
                                        <h3>🟢 Phụ đề</h3>
                                        <div className="showtime-list">
                                            {movie.showtimes[selectedDateIndex].subtitle.map((time, i) => (
                                                <button
                                                    key={i}
                                                    className="time-btn subtitle-btn"
                                                    onClick={() => goToSeatmap(time, "Phụ đề")}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Lồng tiếng */}
                            {movie.showtimes[selectedDateIndex].dub &&
                                movie.showtimes[selectedDateIndex].dub.length > 0 && (
                                    <div className="showtime-block">
                                        <h3>🟣 Lồng tiếng</h3>
                                        <div className="showtime-list">
                                            {movie.showtimes[selectedDateIndex].dub.map((time, i) => (
                                                <button
                                                    key={i}
                                                    className="time-btn dub-btn"
                                                    onClick={() => goToSeatmap(time, "Lồng tiếng")}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
