import React, { useEffect, useState } from "react";
import { movieApi } from "../../api/movieApi";
import "../../layout/PhimSapChieu.css";

const PhimSapChieu = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComingSoon = async () => {
            try {
                const data = await movieApi.getComingSoon();

                // ✅ Lọc phim: đã duyệt và chưa xóa
                const filtered = data.filter(
                    (movie) => movie.approveStatus === "APPROVE" && movie.deleted !== true
                );

                setMovies(filtered);
            } catch (err) {
                console.error("❌ Lỗi khi tải phim sắp chiếu:", err);
                setError("Không thể tải danh sách phim sắp chiếu.");
            } finally {
                setLoading(false);
            }
        };

        fetchComingSoon();
    }, []);

    if (loading) return <p className="text-center mt-5">Đang tải phim sắp chiếu...</p>;
    if (error) return <p className="text-center mt-5 text-red-500">{error}</p>;
    if (!movies || movies.length === 0)
        return <p className="text-center mt-5">Không có phim sắp chiếu.</p>;

    return (
        <div className="phim-sap-chieu-wrapper">
            <h2 className="phim-sap-chieu-wrapper__title">🎞 Phim Sắp Chiếu</h2>

            {movies.map((movie) => {
                // ✅ Lấy poster ưu tiên từ admin upload
                const posterUrl =
                    movie.poster || localStorage.getItem(`poster_${movie.movieID}`) || movie.image || "/default-poster.jpg";

                return (
                    <div
                        key={movie.movieID || movie.id}
                        className="phim-sap-chieu-wrapper__movie-box"
                    >
                        <div className="phim-sap-chieu-wrapper__poster">
                            <img
                                src={posterUrl}
                                alt={movie.movieName || movie.title}
                            />
                        </div>

                        <div className="phim-sap-chieu-wrapper__movie-info">
                            <h3 className="phim-sap-chieu-wrapper__movie-title">
                                {movie.movieName || movie.title}
                            </h3>
                            {movie.description && (
                                <p className="phim-sap-chieu-wrapper__movie-description">
                                    {movie.description}
                                </p>
                            )}
                            {movie.releaseDate && (
                                <p className="phim-sap-chieu-wrapper__release-date">
                                    <strong>Khởi chiếu:</strong>{" "}
                                    {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PhimSapChieu;
