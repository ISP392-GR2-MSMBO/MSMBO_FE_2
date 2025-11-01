import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Pagination } from 'antd';
import { bookingApi, getCurrentUserId } from "../../../api/bookingApi";
import "./BookingDetail.css";

const BookingDetail = () => {
    const { bookingId } = useParams();
    const history = useHistory();
    const [bookings, setBookings] = useState([]);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = getCurrentUserId();

    // ======================================
    // 1. State cho Phân trang
    // ======================================
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // ==============================
    // 2. Logic tải dữ liệu
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
                    const data = await bookingApi.getBookingById(Number(bookingId));
                    setBooking(data);
                } else {
                    const data = await bookingApi.getBookingsByUserId(userId);
                    setBookings(data);
                    // Đảm bảo quay về trang 1 khi danh sách mới được tải
                    setCurrentPage(1);
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

    // ======================================
    // 3. Logic Phân trang (LỌC VÀ SẮP XẾP) 
    // ======================================
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // **LỌC: Chỉ hiển thị các đơn hàng có trạng thái là 'CONFIRMED'**
    const confirmedBookings = bookings.filter(
        b => b.status?.toUpperCase() === 'CONFIRMED'
    );

    // **SẮP XẾP: Theo ngày đặt giảm dần (mới nhất lên đầu)**
    const sortedBookings = confirmedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentBookings = sortedBookings.slice(startIndex, endIndex);

    // ==============================
    // 4. Loading
    // ==============================
    if (loading) return <div className="detail-page-container">Đang tải dữ liệu...</div>;

    // ==============================
    // 5. Danh sách vé (Dạng Bảng có Phân trang - CHỈ HIỂN THỊ CONFIRMED)
    // ==============================
    if (!bookingId) {
        if (confirmedBookings.length === 0) {
            return <div className="detail-page-container">Bạn chưa có vé nào được xác nhận.</div>;
        }

        return (
            <div className="detail-page-container">
                <h2>📜 Danh sách vé đã đặt</h2>
                <div className="booking-list-table-container">
                    <table className="booking-table">
                        <thead>
                            <tr>
                                <th>Phim</th>
                                <th>Rạp</th>
                                <th>Ngày Đặt</th>
                                <th>Tổng Tiền</th>
                                <th>Trạng Thái</th>
                                <th>Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBookings.map((b) => (
                                <tr key={b.bookingID}>
                                    <td data-label="Phim">{b.movieName}</td>
                                    <td data-label="Rạp">{b.theaterName}</td>
                                    <td data-label="Ngày Đặt">{b.bookingDate}</td>
                                    <td data-label="Tổng Tiền" className="table-total-price">
                                        {b.totalPrice?.toLocaleString("vi-VN")} đ
                                    </td>
                                    <td data-label="Trạng Thái">
                                        <span className={`status status-${b.status?.toLowerCase()}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td data-label="Chi Tiết">
                                        <button
                                            onClick={() => history.push(`/booking/${b.bookingID}`)}
                                            className="detail-btn table-detail-btn"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Thêm component Phân trang - Dùng confirmedBookings.length */}
                <div className="pagination-container">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={confirmedBookings.length}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        className="custom-pagination-dark"
                    />
                </div>
            </div>
        );
    }

    // ==============================
    // 6. Chi tiết đơn hàng (Hiển thị chi tiết)
    // ==============================
    if (!booking) {
        return <div className="detail-page-container">Không tìm thấy đơn hàng!</div>;
    }

    // LỌC GHẾ: Hiển thị cả ghế 'CONFIRMED' và 'ACTIVE'
    const validSeats = booking.seats?.filter(seat => {
        const seatStatus = seat.status?.toUpperCase();
        return seatStatus === 'CONFIRMED' || seatStatus === 'ACTIVE';
    }) || [];

    // TẠO MÃ GHẾ ĐÃ ĐẶT (Bao gồm mã ghế và Loại ghế)
    const combinedSeatDetails = validSeats
        .map(seat => {
            const seatCode = `${seat.seatRow}${seat.seatNumber}`;
            const seatType = seat.seatType || 'Standard'; // Sử dụng seatType nếu có, nếu không thì dùng 'Standard'
            return `${seatCode} (${seatType})`;
        })
        .join(', ');

    return (
        <div className="detail-page-container">
            <h2 className="detail-title">Chi tiết Đơn hàng #{booking.bookingID}</h2>

            <div className="summary-box">
                <div className="summary-row">
                    <p>🎬 Phim:</p>
                    <p><b>{booking.movieName}</b></p>
                </div>
                <div className="summary-row">
                    <p>📍 Rạp:</p>
                    <p><b>{booking.theaterName}</b></p>
                </div>
                <div className="summary-row">
                    <p>⏱️ Suất chiếu:</p>
                    <p><b>{booking.startTime}</b> - {booking.showDate}</p>
                </div>
                <div className="summary-row">
                    <p>📅 Ngày đặt:</p>
                    <p>{booking.bookingDate}</p>
                </div>

                {/* DÒNG GHẾ ĐÃ ĐẶT - HIỆN CHI TIẾT GHẾ + LOẠI */}
                <div className="summary-row">
                    <p>🪑 Ghế đã đặt:</p>
                    <p><b>{combinedSeatDetails || 'Chưa có ghế được xác nhận'}</b></p>
                </div>

                <div className="summary-row total-price">
                    <p>💵 Tổng tiền:</p>
                    <p><b>{booking.totalPrice?.toLocaleString('vi-VN')} đ</b></p>
                </div>
                <div className="summary-row">
                    <p>Trạng thái:</p>
                    <p className={`status status-${booking.status?.toLowerCase()}`}>
                        <b>{booking.status}</b>
                    </p>
                </div>
            </div>

            <button onClick={() => history.push("/booking")} className="back-button">
                Quay lại danh sách vé
            </button>
        </div>
    );
};

export default BookingDetail;