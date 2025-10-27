import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { showtimeApi } from "../../../api/showtimeApi";
import { bookingApi } from "../../../api/bookingApi";
import { toast } from "react-toastify";
import "./BookingSeat.css";

const BookingSeat = () => {
    const { showtimeID } = useParams(); // lấy id suất chiếu từ URL
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const user = JSON.parse(localStorage.getItem("user")); // ✅ lấy user từ localStorage

    useEffect(() => {
        fetchSeats();
    }, [showtimeID]);

    const fetchSeats = async () => {
        try {
            setLoading(true);
            const res = await showtimeApi.getSeatsByShowtime(showtimeID);
            setSeats(res.data || res); // tùy backend trả kiểu nào
        } catch (error) {
            toast.error("Không thể tải danh sách ghế.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSeat = (seat) => {
        if (seat.status === "BOOKED") return; // ghế đã đặt thì không chọn
        setSelectedSeats((prev) =>
            prev.includes(seat.seatID)
                ? prev.filter((id) => id !== seat.seatID)
                : [...prev, seat.seatID]
        );
    };

    const handleBooking = async () => {
        if (!user || !user.userID) {
            toast.error("Vui lòng đăng nhập trước khi đặt vé.");
            return;
        }
        if (selectedSeats.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một ghế.");
            return;
        }

        try {
            setLoading(true);
            const bookingData = {
                showtimeID: Number(showtimeID),
                userID: user.userID, // ✅ tránh lỗi "User not found"
                seatIDs: selectedSeats,
                combos: [], // để trống nếu chưa có combo
            };

            await bookingApi.createBooking(bookingData);
            toast.success("Đặt vé thành công!");
            history.push("/booking-success");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Đặt vé thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-container">
            <h2>Chọn ghế suất chiếu #{showtimeID}</h2>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="seat-layout">
                    {seats.map((seat) => (
                        <div
                            key={seat.seatID}
                            className={`seat ${seat.type.toLowerCase()} ${seat.status === "BOOKED" ? "booked" : ""
                                } ${selectedSeats.includes(seat.seatID) ? "selected" : ""}`}
                            onClick={() => handleSelectSeat(seat)}
                        >
                            {seat.name}
                        </div>
                    ))}
                </div>
            )}

            <div className="booking-summary">
                <p>Ghế đã chọn: {selectedSeats.length}</p>
                <button
                    disabled={loading || selectedSeats.length === 0}
                    onClick={handleBooking}
                >
                    {loading ? "Đang đặt..." : "Đặt vé"}
                </button>
            </div>
        </div>
    );
};

export default BookingSeat;
