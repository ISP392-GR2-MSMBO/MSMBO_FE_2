// src/pages/Customer/Profile/BookingDetail.js

import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingApi, getCurrentUserId } from "../../../api/bookingApi";
import "./BookingDetail.css";

const BookingDetail = () => {
    const { bookingId } = useParams();
    const history = useHistory();
    const [bookings, setBookings] = useState([]); // ✅ danh sách tất cả booking
    const [booking, setBooking] = useState(null); // ✅ chi tiết đơn hàng
    const [loading, setLoading] = useState(true);
    const userId = getCurrentUserId();

    // ==============================
    // 1️⃣ Trường hợp có bookingId -> xem chi tiết 1 đơn
    // ==============================
    useEffect(() => {
        if (!userId) {
            toast.warn("Vui lòng đăng nhập.");
            history.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                if (bookingId) {
                    // ✅ ĐÃ SỬA: Gọi hàm getBookingById mới để lấy chi tiết đơn hàng
                    const data = await bookingApi.getBookingById(Number(bookingId));
                    setBooking(data);
                } else {
                    const data = await bookingApi.getBookingsByUserId(userId);
                    setBookings(data);
                }
            } catch (error) {
                console.error("❌ Lỗi tải dữ liệu booking:", error);
                toast.error("Không thể tải dữ liệu đặt vé!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId, userId, history]);

    // ==============================
    // 2️⃣ Loading
    // ==============================
    if (loading) return <div className="detail-page-container">Đang tải dữ liệu...</div>;

    // ==============================
    // 3️⃣ Trường hợp không có bookingId → hiển thị danh sách vé
    // ==============================
    if (!bookingId) {
        if (bookings.length === 0) {
            return <div className="detail-page-container">Bạn chưa đặt vé nào.</div>;
        }

        return (
            <div className="detail-page-container">
                <h2>📜 Danh sách Vé của bạn</h2>
                <div className="booking-list">
                    {bookings.map((b) => (
                        <div key={b.bookingID} className="booking-card">
                            <h3>{b.movieName}</h3>
                            <p>Rạp: {b.theaterName}</p>
                            <p>Ngày đặt: {b.bookingDate}</p>
                            <p>Tổng tiền: {b.totalPrice?.toLocaleString("vi-VN")} đ</p>
                            <p className={`status status-${b.status?.toLowerCase()}`}>
                                Trạng thái: {b.status}
                            </p>
                            <button
                                onClick={() => history.push(`/booking/${b.bookingID}`)}
                                className="detail-btn"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ==============================
    // 4️⃣ Trường hợp có bookingId → hiển thị chi tiết đơn hàng
    // ==============================
    if (!booking) {
        return <div className="detail-page-container">Không tìm thấy đơn hàng!</div>;
    }

    const totalSeats = booking.seats ? booking.seats.length : 0;

    return (
        <div className="detail-page-container">
            <h2 className="detail-title">Chi tiết Đơn hàng #{booking.bookingID}</h2>

            <div className="summary-box">
                <p>🎬 Phim: <b>{booking.movieName}</b></p>
                <p>📍 Rạp: <b>{booking.theaterName}</b></p>
                <p>⏱️ Suất chiếu: <b>{booking.startTime}</b> - {booking.showDate}</p>
                <p>📅 Ngày đặt: {booking.bookingDate}</p>
                <p className="total-price">💵 Tổng tiền: <b>{booking.totalPrice?.toLocaleString('vi-VN')} đ</b></p>
                <p className={`status status-${booking.status?.toLowerCase()}`}>
                    Trạng thái: <b>{booking.status}</b>
                </p>
            </div>

            <div className="seat-details-section">
                <h3>Chi tiết Ghế ({totalSeats} ghế)</h3>
                <div className="seat-list-grid">
                    {booking.seats?.map((seat, index) => (
                        <div key={index} className="seat-item">
                            <p>Ghế: <b>{seat.seatRow}{seat.seatNumber}</b></p>
                            <p>Giá: {seat.price?.toLocaleString('vi-VN')} đ</p>
                            <p className={`seat-status status-${seat.status?.toLowerCase()}`}>
                                Trạng thái: <b>{seat.status}</b>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={() => history.push("/booking")} className="back-button">
                Quay lại danh sách vé
            </button>
        </div>
    );
};

export default BookingDetail;