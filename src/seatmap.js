import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Seatmap.css";

const Seatmap = () => {
    const history = useHistory();

    const rows = "ABCDEFGH".split("");
    const seatsPerRow = 10;
    const [selectedSeats, setSelectedSeats] = useState([]);
    const bookedSeats = ["C5", "C6", "E4", "F8"];

    const toggleSeat = (seatCode) => {
        if (bookedSeats.includes(seatCode)) return;
        setSelectedSeats((prev) =>
            prev.includes(seatCode)
                ? prev.filter((s) => s !== seatCode)
                : [...prev, seatCode]
        );
    };

    const total = selectedSeats.length * 95000;

    return (
        <div className="seatmap-page-dark">
            <div className="seatmap-container-dark">
                {/* ===== Cột trái: Sơ đồ ghế ===== */}
                <div className="seatmap-left-dark">
                    <h2 className="seatmap-screen-title">MÀN HÌNH</h2>
                    <div className="seatmap-screen-line"></div>

                    <div className="seatmap-seat-grid">
                        {rows.map((row) => (
                            <div key={row} className="seatmap-seat-row">
                                <span className="seatmap-row-label">{row}</span>
                                <div className="seatmap-seats">
                                    {Array.from({ length: seatsPerRow }, (_, i) => {
                                        const seatNumber = i + 1;
                                        const seatCode = `${row}${seatNumber}`;
                                        const isBooked = bookedSeats.includes(seatCode);
                                        const isSelected = selectedSeats.includes(seatCode);
                                        return (
                                            <button
                                                key={seatCode}
                                                className={`seatmap-seat ${isBooked
                                                    ? "booked"
                                                    : isSelected
                                                        ? "selected"
                                                        : "available"
                                                    }`}
                                                onClick={() => toggleSeat(seatCode)}
                                            >
                                                {seatNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="seatmap-legend">
                        <span className="seatmap-seat available"></span> Trống
                        <span className="seatmap-seat selected"></span> Đang chọn
                        <span className="seatmap-seat booked"></span> Đã đặt
                    </div>
                </div>

                {/* ===== Cột phải: Thông tin phim ===== */}
                <div className="seatmap-summary-box">
                    <div className="seatmap-summary-content">
                        <img
                            src="https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg"
                            alt="poster"
                            className="seatmap-poster"
                        />
                        <div className="seatmap-info">
                            <h3>Avatar: Dòng Chảy Của Nước</h3>
                            <p>3D Phụ Đề - <span className="seatmap-tag-age">T13</span></p>
                            <p><b>ChillCinema</b> - RẠP 3</p>
                            <p>Suất chiếu: 20:00 - 07/10/2025</p>
                        </div>
                    </div>

                    <div className="seatmap-total-section">
                        <p>Ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</p>
                        <p className="seatmap-total-price">
                            Tổng cộng: <span>{total.toLocaleString("vi-VN")} đ</span>
                        </p>
                    </div>

                    <div className="seatmap-summary-buttons">
                        <button className="seatmap-back-btn" onClick={() => history.goBack()}>
                            Quay lại
                        </button>
                        <button
                            className="seatmap-confirm-btn"
                            onClick={() => {
                                if (selectedSeats.length === 0) {
                                    alert("⚠️ Vui lòng chọn ít nhất một ghế trước khi tiếp tục!");
                                    return;
                                }
                                history.push("/payment");
                            }}
                        >
                            Tiếp tục
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Seatmap;
