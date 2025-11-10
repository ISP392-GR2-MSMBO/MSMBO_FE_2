import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "../../layout/PhimDangChieu.css";

const Phim = () => {
    const history = useHistory();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch(
                    "https://api-movie6868.purintech.id.vn/api/movie/status/now-showing"
                );
                const data = await res.json();


                // Lọc phim đang chiếu và đã duyệt
                const filtered = data.filter(
                    (m) =>
                        m.status &&
                        m.status.toLowerCase() === "now showing" &&
                        m.approveStatus === "APPROVE" &&
                        m.deleted !== true
                );

                setMovies(filtered);
            } catch (error) {
                console.error("❌ Lỗi khi tải phim đang chiếu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <p className="text-center mt-5">Đang tải phim...</p>;
    if (!movies || movies.length === 0)
        return <p className="text-center mt-5">Không có phim nào đang chiếu.</p>;

    return (
        <div className="phim-body">
            <div className="phim-container">
                <h2 className="phim-section-title">🎬 Phim Đang Chiếu</h2>

                {movies.map((movie) => {
                    const posterUrl =
                        movie.poster || localStorage.getItem(`poster_${movie.movieID}`) || movie.image || "/default-poster.jpg";

                    return (
                        <div key={movie.movieID || movie.id} className="phim-movie-row">
                            <div className="phim-movie-left">
                                <div className="phim-poster-wrapper">
                                    <img
                                        src={posterUrl}
                                        alt={movie.movieName || movie.title}
                                        className="phim-poster"
                                    />
                                    <span className="phim-tag phim-genre">
                                        {movie.genre || "Không rõ thể loại"}
                                    </span>
                                    {movie.language && (
                                        <span className="phim-tag phim-language">{movie.language}</span>
                                    )}
                                </div>
                            </div>

                            <div className="phim-movie-right">
                                <h3 className="phim-movie-title">{movie.movieName || movie.title}</h3>
                                {movie.releaseDate && (
                                    <p className="phim-release-date">
                                        <strong>Khởi chiếu:</strong>{" "}
                                        {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                                    </p>
                                )}
                                {movie.duration && (
                                    <p className="phim-release-date">
                                        <strong>Thời lượng:</strong> {movie.duration} phút
                                    </p>
                                )}
                                {movie.description && (
                                    <p className="phim-movie-desc">{movie.description}</p>
                                )}

                                <div className="phim-button-group">
                                    {movie.trailer && (
                                        <button
                                            className="phim-trailer-btn"
                                            onClick={() => window.open(movie.trailer, "_blank")}
                                        >
                                            🎥 Trailer
                                        </button>
                                    )}
                                    <button
                                        className="phim-buy-btn"
                                        onClick={() => history.push(`/movies/${encodeURIComponent(movie.movieName)}`)}
                                    >
                                        🎟 Mua vé
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Phim;
