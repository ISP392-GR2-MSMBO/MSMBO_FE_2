import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom"; // ✅ phải có dòng này

import "swiper/css";
import "swiper/css/navigation";

const MovieList = ({ movies }) => {
    return (
        <Swiper modules={[Navigation]} navigation spaceBetween={20} slidesPerView={4}>
            {movies.map((movie) => (
                <SwiperSlide key={movie.id}>
                    <div className="movie-card">
                        <div className="poster-wrapper">
                            <img className="movie-poster" src={movie.poster} alt={movie.title} />
                        </div>

                        <div className="movie-title">{movie.title}</div>

                        <div className="movie-info">
                            <p><strong>Thể loại:</strong> {movie.genre}</p>
                            <p><strong>Thời lượng:</strong> {movie.duration} phút</p>
                        </div>

                        <div className="button-group">
                            <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="trailer-btn">
                                Trailer
                            </a>
                            {/* ✅ dùng Link để chuyển trang*/}
                            <Link
                                to={`/movies/${movie.id}`}
                                className="buy-btn"
                                style={{ textDecoration: "none" }}// để tránh dấu gach chân
                            >
                                Mua Vé
                            </Link>

                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default MovieList;
