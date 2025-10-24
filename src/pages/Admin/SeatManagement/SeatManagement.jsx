import React, { useState } from "react";
import { seatApi } from "../../../api/seatApi";
import { toast } from "react-toastify";
import "./SeatManagement.css";

const SeatManagement = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🟩 Lấy danh sách ghế theo phòng
    const fetchSeats = async (theaterId) => {
        try {
            setLoading(true);
            const data = await seatApi.getSeatsByRoom(theaterId);
            setSeats(data);
        } catch (err) {
            toast.error("❌ Không thể tải danh sách ghế!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🟧 Khi chọn phòng
    const handleSelectRoom = (roomId) => {
        setSelectedRoom(roomId);
        fetchSeats(roomId);
    };

    // 🟦 Cập nhật trạng thái ghế
    const handleSeatClick = async (seat) => {
        const nextStatus =
            seat.status === "BOOKED"
                ? "EMPTY"
                : seat.status === "EMPTY"
                    ? "BOOKED"
                    : "BOOKED";

        try {
            await seatApi.updateSeatStatus(seat.seatID, nextStatus);
            toast.success(
                `✅ Ghế ${seat.row}${seat.number} cập nhật thành ${nextStatus}`
            );

            setSeats((prev) =>
                prev.map((s) =>
                    s.seatID === seat.seatID ? { ...s, status: nextStatus } : s
                )
            );
        } catch (err) {
            toast.error("❌ Cập nhật trạng thái thất bại!");
            console.error(err);
        }
    };

    // 🧩 Gom ghế đôi
    const groupCouples = (rowSeats) => {
        const groups = [];
        for (let i = 0; i < rowSeats.length; i += 2) {
            groups.push(rowSeats.slice(i, i + 2));
        }
        return groups;
    };

    return (
        <div className="seat-management-container">
            <h2>🎬 Quản lý Sơ đồ Ghế Ngồi</h2>

            {/* 🏠 Chọn phòng */}
            <div className="room-selector">
                {[1, 2, 3, 4, 5, 6].map((roomId) => (
                    <button
                        key={roomId}
                        className={`room-button ${selectedRoom === roomId ? "active" : ""}`}
                        onClick={() => handleSelectRoom(roomId)}
                    >
                        Phòng chiếu {roomId}
                    </button>
                ))}
            </div>

            {/* Hiển thị sơ đồ */}
            {selectedRoom ? (
                loading ? (
                    <p>Đang tải dữ liệu ghế...</p>
                ) : seats.length > 0 ? (
                    <div>
                        <h3>Sơ đồ phòng {selectedRoom}</h3>

                        <div className="seat-layout">
                            {["I", "H", "G", "F", "E", "D", "C", "B", "A"].map((row) => {
                                let rowSeats = seats
                                    .filter((s) => s.row === row)
                                    .sort((a, b) => a.number - b.number);

                                // 🟨 Chỉ bỏ ghế 5–6 ở hàng H
                                if (row === "H") {
                                    rowSeats = rowSeats.filter(
                                        (s) => s.number !== 5 && s.number !== 6
                                    );
                                }

                                // 🟧 Hàng H là ghế đôi
                                if (row === "H") {
                                    const coupleGroups = groupCouples(rowSeats);
                                    return (
                                        <div key={row} className="seat-row">
                                            <span className="row-label">{row}</span>

                                            {/* Bên trái */}
                                            {coupleGroups.slice(0, 2).map((group, idx) => (
                                                <div key={idx} className="seat-couple">
                                                    {group.map((seat) => (
                                                        <div
                                                            key={seat.seatID}
                                                            className={`seat-item couple ${seat.status?.toLowerCase() || "available"} ${seat.type === "VIP" ? "vip" : ""}`}
                                                            onClick={() => handleSeatClick(seat)}
                                                            title={`Ghế ${seat.row}${seat.number} - ${seat.type}`}
                                                        >
                                                            {seat.number}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                            <div className="aisle"></div>

                                            {/* Bên phải */}
                                            {coupleGroups.slice(2).map((group, idx) => (
                                                <div key={idx + 2} className="seat-couple">
                                                    {group.map((seat) => (
                                                        <div
                                                            key={seat.seatID}
                                                            className={`seat-item couple ${seat.status?.toLowerCase() || "available"} ${seat.type === "VIP" ? "vip" : ""}`}
                                                            onClick={() => handleSeatClick(seat)}
                                                            title={`Ghế ${seat.row}${seat.number} - ${seat.type}`}
                                                        >
                                                            {seat.number}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                            <span className="row-label">{row}</span>
                                        </div>
                                    );
                                }

                                // 🟩 Các hàng khác (bao gồm I)
                                const left = rowSeats.filter((s) => s.number <= 5);
                                const right = rowSeats.filter((s) => s.number >= 6);

                                return (
                                    <div key={row} className="seat-row">
                                        <span className="row-label">{row}</span>

                                        <div className="seat-group">
                                            {left.map((seat) => (
                                                <div
                                                    key={seat.seatID}
                                                    className={`seat-item ${seat.status?.toLowerCase() || "available"} ${seat.type === "VIP" ? "vip" : ""}`}
                                                    onClick={() => handleSeatClick(seat)}
                                                    title={`Ghế ${seat.row}${seat.number} - ${seat.type}`}
                                                >
                                                    {seat.number}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="aisle"></div>

                                        <div className="seat-group">
                                            {right.map((seat) => (
                                                <div
                                                    key={seat.seatID}
                                                    className={`seat-item ${seat.status?.toLowerCase() || "available"} ${seat.type === "VIP" ? "vip" : ""}`}
                                                    onClick={() => handleSeatClick(seat)}
                                                    title={`Ghế ${seat.row}${seat.number} - ${seat.type}`}
                                                >
                                                    {seat.number}
                                                </div>
                                            ))}
                                        </div>

                                        <span className="row-label">{row}</span>
                                    </div>
                                );
                            })}
                            <div className="screen">Màn hình</div>
                        </div>
                    </div>
                ) : (
                    <p>Không có dữ liệu ghế cho phòng này.</p>
                )
            ) : (
                <p>Vui lòng chọn phòng chiếu để xem sơ đồ ghế 🎟️</p>
            )}
        </div>
    );
};

export default SeatManagement;
