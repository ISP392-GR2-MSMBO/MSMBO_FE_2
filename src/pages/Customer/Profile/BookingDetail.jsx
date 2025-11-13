import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Pagination } from 'antd';
import { bookingApi, getCurrentUserId } from "../../../api/bookingApi";
import { seatApi } from "../../../api/seatApi";
import { promotionApi } from "../../../api/promotionApi";
import "./BookingDetail.css";

// ======================================
// HÀM HELPER ĐỂ CHUYỂN ĐỔI TÊN LOẠI GHẾ HIỂN THỊ
// ======================================
const formatSeatType = (type) => {
    const upperType = String(type || '').toUpperCase();

    if (upperType.includes('VIP')) return 'Ghế VIP';
    if (upperType.includes('COUPLE') || upperType.includes('DOUBLE')) return 'Ghế đôi';

    return 'Ghế thường'; // Mặc định là 'Ghế thường' (Standard)
};

const BookingDetail = () => {
    const { bookingId } = useParams();
    const history = useHistory();
    const [bookings, setBookings] = useState([]);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [promotionMap, setPromotionMap] = useState({});
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
                    const bookingData = await bookingApi.getBookingById(Number(bookingId));

                    const seats = bookingData.seats || [];

                    // --- B1: Tải chi tiết Ghế (Seat Type) ---
                    let seatsWithDetails = seats;
                    if (seats.length > 0) {
                        const seatDetailsPromises = seats.map(seat =>
                            seatApi.getSeatById(seat.seatID)
                                .catch(error => ({ type: 'UNKNOWN', seatID: seat.seatID }))
                        );

                        const seatDetails = await Promise.all(seatDetailsPromises);

                        seatsWithDetails = seats.map(seat => {
                            const detail = seatDetails.find(d => d.seatID === seat.seatID);
                            return {
                                ...seat,
                                typeFromSeatApi: detail?.type || 'Standard',
                            };
                        });
                    }

                    // --- B2: Tải chi tiết Khuyến mãi (Promotion Name) ---
                    const promotionIds = seatsWithDetails
                        .map(seat => seat.promotionID)
                        .filter((id, index, self) => id > 0 && self.indexOf(id) === index);

                    const promotionDetailsPromises = promotionIds.map(id =>
                        promotionApi.getPromotionById(id)
                            .catch(error => ({ promotionID: id, name: 'Lỗi tải KM' }))
                    );

                    const promotionDetails = await Promise.all(promotionDetailsPromises);

                    const promoMap = promotionDetails.reduce((map, promo) => {
                        if (promo && promo.promotionID) {
                            map[promo.promotionID] = promo.name;
                        }
                        return map;
                    }, {});

                    setPromotionMap(promoMap);

                    // --- B3: Cập nhật State ---
                    setBooking({ ...bookingData, seats: seatsWithDetails });

                } else {
                    const data = await bookingApi.getBookingsByUserId(userId);
                    setBookings(data);
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
    // 3. Logic Phân trang (Giữ nguyên)
    // ======================================
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const confirmedBookings = bookings.filter(
        b => b.status?.toUpperCase() === 'CONFIRMED'
    );

    const sortedBookings = confirmedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentBookings = sortedBookings.slice(startIndex, endIndex);

    // ==============================
    // 4. Loading
    // ==============================
    if (loading) return <div className="detail-page-container">Đang tải dữ liệu...</div>;

    // ... (Phần hiển thị danh sách vé giữ nguyên) ...

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

    const validSeats = booking.seats?.filter(seat => {
        const seatStatus = seat.status?.toUpperCase();
        return seatStatus === 'CONFIRMED' || seatStatus === 'ACTIVE';
    }) || [];

    const appliedPromotions = new Set();
    validSeats.forEach(seat => {
        if (seat.promotionID && promotionMap[seat.promotionID]) {
            appliedPromotions.add(promotionMap[seat.promotionID]);
        }
    });

    // Chuỗi tên các khuyến mãi đã áp dụng (cho dòng tổng hợp)
    const promotionText = appliedPromotions.size > 0
        ? Array.from(appliedPromotions).join(', ')
        : 'Không áp dụng';


    const seatDetailsList = validSeats.flatMap((seat, index) => {
        const seatCode = `${seat.seatRow}${seat.seatNumber}`;
        const seatType = formatSeatType(
            seat.typeFromSeatApi || seat.seatType || seat.type || 'Standard'
        );


        const elements = [
            <b key={`code-${seat.seatID || index}`} className="seat-code-line">{seatCode} ({seatType})</b>
        ];


        if (index < validSeats.length - 1) {
            elements.push(<br key={`br-${seat.seatID || index}`} />);
        }

        return elements;
    });


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

                {/* DÒNG KHUYẾN MÃI TỔNG HỢP (Giữ nguyên) */}
                <div className="summary-row">
                    <p>🏷️ Khuyến mãi:</p>
                    <p><b>{promotionText}</b></p>
                </div>

                <div className="summary-row" style={{ alignItems: 'flex-start' }}>
                    <p>🪑 Ghế đã đặt:</p>
                    {/* ⭐ HIỂN THỊ MẢNG JSX ĐÃ CHIA DÒNG */}
                    <p style={{ textAlign: 'right', lineHeight: '1.4' }}>
                        {seatDetailsList.length > 0 ? seatDetailsList : 'Chưa có ghế được xác nhận'}
                    </p>
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