import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useHistory } from "react-router-dom";

const MovieListSlider = ({ movies }) => {
    const history = useHistory();

    if (!movies || movies.length === 0) {
        return <p className="text-center mt-5">Không có phim nào đang chiếu.</p>;
    }

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <Slider {...settings}>
            {movies.map((movie) => {
                const posterUrl =
                    movie.poster ||
                    localStorage.getItem(`poster_${movie.movieID}`) ||
                    "/default-poster.jpg";

                const trailerUrl = movie.trailer || "";

                return (
                    <div key={movie.movieID || movie.id} className="movie-card px-2">
                        {/* Poster */}
                        <div className="movie-poster" style={{ position: "relative" }}>
                            <img
                                src={posterUrl}
                                alt={movie.movieName}
                                style={{
                                    width: "180px",
                                    height: "270px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    display: "block",
                                    margin: "0 auto",
                                    boxShadow: "0 5px 15px rgba(0,0,0,0.4)"
                                }}
                            />
                        </div>

                        {/* Movie Info */}
                        <h4 className="mt-2 text-center font-semibold text-white">{movie.movieName}</h4>
                        <p className="text-sm text-center text-gray-300">Thể loại: {movie.genre}</p>
                        <p className="text-sm text-center text-gray-300">Thời lượng: {movie.duration} phút</p>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                            {/* Nút Mua vé */}
                            <button
                                style={{
                                    backgroundColor: "#ec4899",
                                    color: "#fff",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "all 0.3s ease"
                                }}
                                onClick={() =>
                                    history.push(`/movies/${encodeURIComponent(movie.movieName)}`)
                                }
                            >
                                🎟 Mua vé
                            </button>

                            {/* Nút Trailer */}
                            {trailerUrl ? (
                                <button
                                    style={{
                                        backgroundColor: "#3b82f6",
                                        color: "#fff",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        transition: "all 0.3s ease"
                                    }}
                                    onClick={() => window.open(trailerUrl, "_blank")}
                                >
                                    🎥 Trailer
                                </button>
                            ) : (
                                <button
                                    disabled
                                    style={{
                                        backgroundColor: "#555",
                                        color: "#ccc",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "not-allowed",
                                        fontWeight: 600
                                    }}
                                >
                                    🎥 Trailer
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </Slider>
    );
};

export default MovieListSlider;
