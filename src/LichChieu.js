import React, { useState } from "react";
import "./LichChieu.css";

export default function LichChieu() {
    const [activeDate, setActiveDate] = useState("01/10");

    const moviesByDate = {
        "01/10": [
            {
                title: "Doraemon: Nobita và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh",
                tags: ["Hoạt Hình", "Phiêu Lưu", "Gia Đình"],
                director: "Emilie Blichfeldt",
                actors: "Lea Myren, Thea Sofie Loch Næss, Ane Dahl Torp",
                duration: "107 Phút",
                times: ["12:40", "18:20"],
                poster:
                    "https://upload.wikimedia.org/wikipedia/vi/5/5d/Doraemon_Movie_2025_Poster.jpg",
            },
            {
                title: "TỬ CHIẾN TRÊN KHÔNG (T16)",
                tags: ["Tiếng Việt", "Hành động", "Hồi Hộp"],
                director: "Hàm Trần",
                actors:
                    "Thái Hòa, Kaity Nguyễn, Thanh Sơn, Võ Điền Gia Huy, Trần Ngọc Vàng",
                duration: "118 Phút",
                times: ["09:40", "12:55", "18:20", "21:35"],
                poster:
                    "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            },
        ],
        "02/10": [
            {
                title: "TRĂM DẶM TỬ THẦN (T18)",
                tags: ["Phụ Đề", "Kinh dị"],
                director: "Francis Lawrence",
                actors: "Judy Greer, Mark Hamill, Ben Wang",
                duration: "108 Phút",
                times: ["09:00", "16:20", "20:20"],
                poster:
                    "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            },
            {
                title: "TỬ CHIẾN TRÊN KHÔNG (T16)",
                tags: ["Tiếng Việt", "Hành động"],
                director: "Hàm Trần",
                actors: "Thái Hòa, Kaity Nguyễn",
                duration: "118 Phút",
                times: ["10:00", "14:20", "19:00"],
                poster:
                    "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            },
        ],
        "03/10": [
            {
                title: "MA CHẢI ĐẦU (T18)",
                tags: ["Phụ Đề", "Kinh dị"],
                director: "Chairun Nissa",
                actors: "Asmara Abigai Edward, AkbarAjeng, Giona",
                duration: "90 Phút",
                times: ["11:00", "14:40", "22:20"],
                poster:
                    "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            },
        ],
    };

    return (
        <div className="lich-chieu-page">
            {/* Thanh chọn ngày */}
            <div className="date-bar">
                {["01/10", "02/10", "03/10"].map((date) => (
                    <button
                        key={date}
                        className={`date-btn ${activeDate === date ? "active" : ""}`}
                        onClick={() => setActiveDate(date)}
                    >
                        {date}
                    </button>
                ))}
            </div>

            {/* Danh sách phim */}
            <div className="movie-list">
                {moviesByDate[activeDate]?.map((movie, index) => (
                    <div className="movie-item" key={index}>
                        <div className="poster">
                            <img src={movie.poster} alt={movie.title} />
                        </div>
                        <div className="info">
                            <h3>{movie.title}</h3>
                            <div className="tags">
                                {movie.tags.map((tag, i) => (
                                    <span key={i} className="tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p>
                                <strong>🎬 Đạo diễn:</strong> {movie.director}
                            </p>
                            <p>
                                <strong>🎭 Diễn viên:</strong> {movie.actors}
                            </p>
                            <p>
                                <strong>⏳ Thời lượng:</strong> {movie.duration}
                            </p>
                            <div className="times">
                                {movie.times.map((time, i) => (
                                    <button key={i} className="time-btn">
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
