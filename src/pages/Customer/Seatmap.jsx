import React, { useState, useEffect } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { showtimeApi } from "../../api/showtimeApi";
import { bookingApi } from "../../api/bookingApi";
import { seatApi } from "../../api/seatApi";
import { movieApi } from "../../api/movieApi";
import "../../layout/Seatmap.css";
import { paymentApi } from "../../api/paymentApi";

// =========================================================================
// HÀM HỖ TRỢ XÁC THỰC
// =========================================================================

/** Lấy Token từ localStorage (key: "user") */
const getAuthToken = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            return userObject?.token;
        } catch (e) { return null; }
    }
    return null;
};

/** Lấy ID người dùng từ localStorage (key: "user") */
const getCurrentUserId = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            return userObject?.id || userObject?.userID;
        } catch (e) { return null; }
    }
    return null;
};

// =========================================================================
// CẤU TRÚC VÀ LOGIC HỖ TRỢ
// =========================================================================

const SEAT_PRICE = {
    STANDARD: 95000,
    VIP: 110000,
    COUPLE: 110000,
};

const mockTheaterApi = {
    getTheaterName: (theaterId) => {
        return `Phòng Chiếu ${theaterId}`;
    }
};

const findPartnerSeat = (seat, allSeats) => {
    const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
    return allSeats.find(
        s => s.row === seat.row && s.number === partnerNumber && s.type.toUpperCase() === "COUPLE"
    );
};

// Hàm tạo layout cuối cùng (Hợp nhất ghế cơ bản và ghế đã bán)
const createFinalSeatsLayout = (theaterId, apiSeatsData, soldSeatIDs) => {
    const soldSeatIDSet = new Set(soldSeatIDs);

    const finalLayout = [];
    const fixedRowsOrder = ["I", "H", "G", "F", "E", "D", "C", "B", "A"];

    apiSeatsData.forEach(seat => {
        const seatID = seat.seatID;
        let finalStatus = seat.status ? seat.status.toUpperCase() : "AVAILABLE";

        if (soldSeatIDSet.has(seatID) && finalStatus === "AVAILABLE") {
            finalStatus = "SOLD";
        }

        const apiPrice = seat.finalePrice || SEAT_PRICE[seat.type.toUpperCase()] || SEAT_PRICE.STANDARD;

        if (fixedRowsOrder.includes(seat.row)) {
            finalLayout.push({
                seatID: seatID,
                theaterID: theaterId,
                row: seat.row,
                number: seat.number,
                type: seat.type ? seat.type.toUpperCase() : "STANDARD",
                status: finalStatus,
                price: apiPrice,
            });
        }
    });

    finalLayout.sort((a, b) => {
        const rowOrder = fixedRowsOrder.indexOf(a.row) - fixedRowsOrder.indexOf(b.row);
        if (rowOrder !== 0) return rowOrder;
        return a.number - b.number;
    });

    return finalLayout;
};


// =========================================================================
// COMPONENT SEATMAP CHÍNH
// =========================================================================

const Seatmap = () => {
    const history = useHistory();
    const { showtimeId } = useParams();
    const location = useLocation();

    const passedData = location.state?.state;

    const [movieDetails, setMovieDetails] = useState(passedData?.movie || null);
    const [showtimeDetails, setShowtimeDetails] = useState(passedData?.showtime || null);

    const [allSeats, setAllSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    const CURRENT_USER_ID = getCurrentUserId();


    // =========================================================================
    // 1. FETCH DATA THỰC TẾ
    // =========================================================================
    useEffect(() => {
        const fetchSeatAndShowtimeData = async () => {
            if (!CURRENT_USER_ID || !getAuthToken()) {
                toast.error("Vui lòng đăng nhập để tiếp tục đặt vé.");
                history.push("/login", { from: location.pathname });
                setLoading(false);
                return;
            }

            if (!showtimeId) {
                setLoading(false);
                toast.error("Thiếu ID suất chiếu!");
                return;
            }

            let currentStDetails = showtimeDetails;
            let currentMovieDetails = movieDetails;
            let theaterId;

            if (currentStDetails && currentMovieDetails && allSeats.length > 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                if (!currentStDetails) {
                    currentStDetails = await showtimeApi.getShowtimeById(showtimeId);
                }
                theaterId = currentStDetails.theaterID;

                if (!currentMovieDetails && currentStDetails.movieID) {
                    const movieData = await movieApi.getMovieByName(currentStDetails.movieID);
                    setMovieDetails(Array.isArray(movieData) ? movieData[0] : movieData);
                }

                if (!theaterId) {
                    toast.error("Thiếu theaterID để lấy sơ đồ ghế!");
                    return;
                }

                const roomName = mockTheaterApi.getTheaterName(theaterId);
                setShowtimeDetails({ ...currentStDetails, roomName: roomName });

                const seatsData = await seatApi.getSeatsByRoom(theaterId);
                const soldSeatIDs = await bookingApi.getSoldSeatsByShowtime(showtimeId);

                const seatsWithStatus = createFinalSeatsLayout(theaterId, seatsData, soldSeatIDs);
                setAllSeats(seatsWithStatus);

            } catch (error) {
                toast.error("❌ Lỗi tải dữ liệu. Kiểm tra API Backend hoặc phiên đăng nhập.");
                console.error("Fetch Data Error:", error);
                setMovieDetails(null);
                setShowtimeDetails(null);
                setAllSeats([]);
            } finally {
                setLoading(false);
            }
        };

        if (showtimeId) {
            fetchSeatAndShowtimeData();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showtimeId, history, location.pathname]);

    // =========================================================================
    // 2. LOGIC CHỌN/BỎ CHỌN GHẾ
    // =========================================================================
    const toggleSeat = (seat) => {
        if (seat.status !== "AVAILABLE") return;

        let newSelectedSeats = [...selectedSeats];
        const isCurrentlySelected = selectedSeats.some(s => s.seatID === seat.seatID);

        if (seat.type && seat.type.toUpperCase() === "COUPLE") {
            const partnerSeat = findPartnerSeat(seat, allSeats);

            if (!partnerSeat) {
                toast.error("Lỗi dữ liệu: Không tìm thấy ghế đối tác!");
                return;
            }

            const coupleIDs = [seat.seatID, partnerSeat.seatID];

            if (isCurrentlySelected) {
                newSelectedSeats = newSelectedSeats.filter(s => !coupleIDs.includes(s.seatID));
            } else {
                if (partnerSeat.status !== "AVAILABLE") {
                    toast.error(`Ghế đối tác ${partnerSeat.row}${partnerSeat.number} không khả dụng!`);
                    return;
                }
                // Thêm cả hai ghế vào danh sách được chọn
                newSelectedSeats.push(seat, partnerSeat);
            }

        } else {
            if (isCurrentlySelected) {
                newSelectedSeats = newSelectedSeats.filter(s => s.seatID !== seat.seatID);
            } else {
                newSelectedSeats.push(seat);
            }
        }

        // Loại bỏ trùng lặp và cập nhật
        setSelectedSeats(Array.from(new Set(newSelectedSeats)));
    };

    // =========================================================================
    // 3. TÍNH TỔNG CỘNG
    // =========================================================================
    const calculateTotal = () => {
        let total = 0;

        const seatPriceMap = new Map();
        allSeats.forEach(seat => {
            const finalPrice = seat.price || (SEAT_PRICE[seat.type.toUpperCase()] || SEAT_PRICE.STANDARD);
            seatPriceMap.set(seat.seatID, finalPrice);
        });

        selectedSeats.forEach(seat => {
            const price = seatPriceMap.get(seat.seatID);
            if (price) {
                total += price;
            } else {
                const fallbackPrice = SEAT_PRICE[seat.type.toUpperCase()] || SEAT_PRICE.STANDARD;
                total += fallbackPrice;
            }
        });

        return total;
    };


    const totalPrice = calculateTotal();

    const selectedSeatCodes = selectedSeats
        .map(s => `${s.row}${s.number}`)
        .sort((a, b) => a.localeCompare(b));


    // =========================================================================
    // 4. LOGIC ĐẶT VÉ VÀ CHUYỂN HƯỚNG (ĐÃ SỬA LỖI LẤY BOOKING ID & CHUYỂN HƯỚNG)
    // =========================================================================
    const handleBooking = async () => {
        if (!CURRENT_USER_ID) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            history.push("/login");
            return;
        }

        if (selectedSeats.length === 0) {
            toast.warn("⚠️ Vui lòng chọn ghế!");
            return;
        }

        const seatIDs = selectedSeats.map(s => s.seatID);

        const bookingData = {
            showtimeID: Number(showtimeId),
            userID: CURRENT_USER_ID,
            seatIDs: seatIDs,
            combos: [],
        };

        try {
            setIsBooking(true);
            const response = await bookingApi.createBooking(bookingData);

            // ✅ SỬA ĐỔI: Kiểm tra và lấy bookingID từ response
            const bookingID = response?.bookingID || response?.data?.bookingID || response?.id;

            if (!bookingID) {
                throw new Error("Backend không trả về Booking ID hợp lệ.");
            }

            const PaymentInfo = await paymentApi.createPaymentLink(bookingID);
            console.log("PaymentInfo:", PaymentInfo);
            toast.success("✅ Đặt vé thành công! Chuyển đến thanh toán.");

            // 🚀 SỬA LỖI CHUYỂN HƯỚNG: Dùng window.location.href để chuyển hướng ra ngoài ứng dụng
            window.location.href = PaymentInfo.checkoutUrl;

        } catch (error) {
            console.error("Booking failed:", error.response?.data || error.message);
            // Cải thiện thông báo lỗi
            const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định.";
            toast.error(`❌ Đặt vé thất bại. ${errorMessage}. Vui lòng kiểm tra console.`);
        } finally {
            setIsBooking(false);
        }
    };


    // =========================================================================
    // 5. RENDER UI
    // =========================================================================

    const groupSeatsByRow = allSeats.reduce((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {});

    const sortedRows = ["I", "H", "G", "F", "E", "D", "C", "B", "A"].filter(row => groupSeatsByRow[row] && groupSeatsByRow[row].length > 0);

    const movieName = movieDetails?.movieName || "Tên phim...";
    const posterUrl = movieDetails?.poster || movieDetails?.posterUrl || "https://placehold.co/500x750";
    const roomName = showtimeDetails?.roomName || `Phòng ${showtimeDetails?.theaterID || 'X'}`;
    const cinemaName = showtimeDetails?.cinemaName || "ChillCinema";
    const showDate = showtimeDetails?.date ? new Date(showtimeDetails.date).toLocaleDateString("vi-VN") : "Đang cập nhật";

    if (loading || !movieDetails || !showtimeDetails || allSeats.length === 0) {
        return <div className="seatmap-page-dark"><p className="seatmap-loading">Đang tải chi tiết suất chiếu...</p></div>;
    }

    /**
     * Component con để render một ghế
     */
    const SeatItem = ({ seat }) => {
        const isSelected = selectedSeats.some(s => s.seatID === seat.seatID);
        const isUnavailable = seat.status === "UNAVAILABLE";
        const isSold = seat.status === "SOLD";

        const isBookedOrUnavailable = isUnavailable || isSold;

        const isCouple = seat.type?.toLowerCase() === "couple";

        let seatClass = "available";
        if (isSelected) {
            seatClass = "selected";
        } else if (isUnavailable) {
            seatClass = "unavailable";
        } else if (isSold) {
            seatClass = "sold";
        }

        return (
            <button
                key={seat.seatID}
                className={`seatmap-seat ${seatClass} ${seat.type?.toLowerCase() || 'standard'} ${isCouple ? 'couple-seat' : ''}`}
                onClick={() => toggleSeat(seat)}
                disabled={isBookedOrUnavailable}
                title={`Ghế ${seat.row}${seat.number} - ${seat.type} (${seat.status}) - ${seat.price ? seat.price.toLocaleString("vi-VN") + " đ" : "Giá không rõ"}`}
            >
                {seat.number}
            </button>
        );
    };


    return (
        <div className="seatmap-page-dark">
            <div className="seatmap-container-dark">
                {/* ===== Cột trái: Sơ đồ ghế ===== */}
                <div className="seatmap-left-dark">

                    <h3 className="seatmap-room-title">{roomName}</h3>

                    <div className="seatmap-seat-grid">
                        {sortedRows.map((row) => {
                            let rowSeats = groupSeatsByRow[row].sort((a, b) => a.number - b.number);
                            const isCoupleRow = rowSeats.length > 0 && rowSeats[0].type.toUpperCase() === "COUPLE";

                            if (isCoupleRow) {
                                const coupleBlock1 = rowSeats.filter(s => s.number <= 4);
                                const coupleBlock2 = rowSeats.filter(s => s.number >= 7);

                                return (
                                    <div key={row} className="seatmap-seat-row couple-row">
                                        <span className="seatmap-row-label">{row}</span>
                                        <div className="seatmap-seats couple-group-1">
                                            {coupleBlock1.map(seat => <SeatItem key={seat.seatID} seat={seat} />)}
                                        </div>
                                        {coupleBlock1.length > 0 && coupleBlock2.length > 0 && <div className="seatmap-aisle-spacer"></div>}
                                        <div className="seatmap-seats couple-group-2">
                                            {coupleBlock2.map(seat => <SeatItem key={seat.seatID} seat={seat} />)}
                                        </div>
                                        <span className="seatmap-row-label">{row}</span>
                                    </div>
                                );

                            } else {
                                const leftBlock = rowSeats.filter(s => s.number <= 5);
                                const rightBlock = rowSeats.filter(s => s.number >= 6);

                                return (
                                    <div key={row} className="seatmap-seat-row">
                                        <span className="seatmap-row-label">{row}</span>

                                        <div className="seatmap-seats standard-group-left">
                                            {leftBlock.map(seat => <SeatItem key={seat.seatID} seat={seat} />)}
                                        </div>

                                        {leftBlock.length > 0 && rightBlock.length > 0 && <div className="seatmap-aisle-spacer"></div>}

                                        <div className="seatmap-seats standard-group-right">
                                            {rightBlock.map(seat => <SeatItem key={seat.seatID} seat={seat} />)}
                                        </div>
                                        <span className="seatmap-row-label">{row}</span>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    <div className="seatmap-screen-line"></div>
                    <h2 className="seatmap-screen-title">Màn hình</h2>

                    <div className="seatmap-legend">
                        <div className="legend-group status-group">
                            <span className="legend-box selected"></span> Đang chọn
                            <span className="legend-box sold"></span> Đã bán (SOLD)
                        </div>

                        <div className="legend-group type-group">
                            <span className="legend-box standard"></span> Ghế thường
                            <span className="legend-box vip"></span> Ghế VIP
                            <span className="legend-box couple"></span> Ghế đôi
                        </div>
                    </div>
                </div>

                {/* ===== Cột phải: Tổng kết & Thanh toán ===== */}
                <div className="seatmap-summary-box">
                    <div className="seatmap-summary-content">
                        <img
                            src={posterUrl}
                            alt={movieName}
                            className="seatmap-poster"
                        />
                        <div className="seatmap-info">
                            <h3>{movieName}</h3>
                            <p>{showtimeDetails.format} - <span className="seatmap-tag-age">T13</span></p>
                            <p><b>{cinemaName}</b> - {roomName}</p>
                            <p>Suất chiếu: {showtimeDetails.startTime} - {showDate}</p>
                        </div>
                    </div>

                    <div className="seatmap-total-section">
                        <p>Ghế đã chọn: {selectedSeatCodes.length > 0 ? selectedSeatCodes.join(", ") : "Chưa chọn"}</p>
                        <p className="seatmap-total-price">
                            Tổng cộng: <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
                        </p>
                    </div>

                    <div className="seatmap-summary-buttons">
                        <button className="seatmap-back-btn" onClick={() => history.goBack()} disabled={isBooking}>
                            Quay lại
                        </button>
                        <button
                            className="seatmap-confirm-btn"
                            onClick={handleBooking}
                            disabled={isBooking || selectedSeats.length === 0}
                        >
                            {isBooking ? "Đang đặt..." : "Tiếp tục"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Seatmap;