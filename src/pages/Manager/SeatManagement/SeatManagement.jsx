import React, { useState } from "react";
import { seatApi } from "../../../api/seatApi";
import { toast } from "react-toastify";
import "./SeatManagement.css";

const SeatManagement = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [managedSeats, setManagedSeats] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchSeats = async (theaterId) => {
        try {
            setLoading(true);
            const data = await seatApi.getSeatsByRoom(theaterId);
            const mappedData = data.map(s => ({
                ...s,
                status: s.status === "UNAVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
            }));

            setSeats(mappedData);
            setManagedSeats([]);
        } catch {
            toast.error("❌ Không thể tải danh sách ghế!");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoom = (roomId) => {
        setSelectedRoom(roomId);
        fetchSeats(roomId);
    };

    const handleSeatClick = async (seat) => {
        if (isUpdating) return;

        // 🚨 DEBUG: Log thông tin ghế được click
        console.log("--- Click Event ---");
        console.log("Ghế được click:", seat.row, seat.number, "ID:", seat.seatID, "Type:", seat.type);

        const nextStatus = seat.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

        try {
            setIsUpdating(true);

            if (seat.type && seat.type.toUpperCase() === "COUPLE") {
                const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
                const partnerSeat = seats.find(
                    s => s.row === seat.row && s.number === partnerNumber
                );

                // 🚨 DEBUG: Log thông tin ghế đối tác
                console.log("Ghế đối tác dự kiến:", partnerSeat ? `${partnerSeat.row}${partnerSeat.number}` : "Không tìm thấy");

                if (partnerSeat) {
                    await Promise.all([
                        seatApi.updateSeatStatus(seat.seatID, nextStatus),
                        seatApi.updateSeatStatus(partnerSeat.seatID, nextStatus)
                    ]);

                    const updatedSeats = [seat.seatID, partnerSeat.seatID];
                    setSeats((prev) =>
                        prev.map((s) =>
                            updatedSeats.includes(s.seatID)
                                ? { ...s, status: nextStatus }
                                : s
                        )
                    );
                    setManagedSeats((prev) =>
                        prev.map((s) =>
                            updatedSeats.includes(s.seatID)
                                ? { ...s, status: nextStatus }
                                : s
                        )
                    );

                    const coupleName = `${seat.row}${Math.min(seat.number, partnerNumber)}-${Math.max(seat.number, partnerNumber)}`;
                    toast.success(`✅ Cặp ghế ${coupleName} → ${nextStatus}`);

                } else {
                    toast.warn("❌ Không tìm thấy ghế đối tác. Chỉ cập nhật ghế hiện tại.");
                    await seatApi.updateSeatStatus(seat.seatID, nextStatus);
                    setSeats((prev) => prev.map(s => s.seatID === seat.seatID ? { ...s, status: nextStatus } : s));
                    setManagedSeats((prev) => prev.map(s => s.seatID === seat.seatID ? { ...s, status: nextStatus } : s));
                }

            } else {
                await seatApi.updateSeatStatus(seat.seatID, nextStatus);

                setSeats((prev) =>
                    prev.map((s) =>
                        s.seatID === seat.seatID ? { ...s, status: nextStatus } : s
                    )
                );
                setManagedSeats((prev) =>
                    prev.map((s) =>
                        s.seatID === seat.seatID ? { ...s, status: nextStatus } : s
                    )
                );
                toast.success(`✅ Ghế ${seat.row}${seat.number} → ${nextStatus}`);
            }

        } catch (error) {
            console.error("Update status error:", error);
            toast.error("❌ Cập nhật trạng thái thất bại!");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleManageSeat = (seat) => {
        let seatsToManage = [seat];
        let isCouple = seat.type && seat.type.toUpperCase() === "COUPLE";

        if (isCouple) {
            const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
            const partnerSeat = seats.find(
                s => s.row === seat.row && s.number === partnerNumber
            );

            if (partnerSeat) {
                if (seat.number % 2 === 1) {
                    seatsToManage.push(partnerSeat);
                } else {
                    seatsToManage.unshift(partnerSeat);
                }
            }
        }

        const seatIDsToManage = seatsToManage.map(s => s.seatID);

        const isCurrentlyManaged = seatsToManage.some(s =>
            managedSeats.some(ms => ms.seatID === s.seatID)
        );

        const seatNames = isCouple
            ? `Cặp ghế ${seat.row}${Math.min(...seatsToManage.map(s => s.number))}-${Math.max(...seatsToManage.map(s => s.number))}`
            : `Ghế ${seat.row}${seat.number}`;


        if (isCurrentlyManaged) {
            setManagedSeats((prev) =>
                prev.filter((s) => !seatIDsToManage.includes(s.seatID))
            );
            toast.info(`${seatNames} đã bị xóa khỏi bảng quản lý.`);
        } else {
            // Chỉ thêm ghế lẻ (ghế bắt đầu) vào managedSeats để tránh trùng lặp trong bảng
            const newSeats = isCouple
                ? seatsToManage.filter(s => s.number % 2 === 1)
                : seatsToManage;

            setManagedSeats((prev) => [...prev, ...newSeats]);
            toast.info(`${seatNames} đã được thêm vào bảng quản lý.`);
        }
    };

    const toggleSeatAvailability = (seat) => {
        if (seat.type && seat.type.toUpperCase() === "COUPLE") {
            const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
            const partnerSeat = seats.find(
                s => s.row === seat.row && s.number === partnerNumber
            );

            // Luôn gọi handleSeatClick với ghế lẻ (ghế đầu tiên) của cặp để đảm bảo logic cập nhật couple
            handleSeatClick(seat.number % 2 === 1 ? seat : partnerSeat);

        } else {
            handleSeatClick(seat);
        }
    };

    const groupCouples = (rowSeats) => {
        const groups = [];
        for (let i = 0; i < rowSeats.length; i += 2) {
            groups.push(rowSeats.slice(i, i + 2));
        }
        return groups;
    };

    const SeatItem = ({ seat, onClick }) => {
        const isCouple = seat.type?.toLowerCase() === "couple";
        // Kiểm tra xem ghế hiện tại hoặc ghế đối tác (nếu là ghế đôi số chẵn) có đang được quản lý không
        const isManaged = isCouple && seat.number % 2 === 0
            ? managedSeats.some(s => s.row === seat.row && s.number === seat.number - 1)
            : managedSeats.some(s => s.seatID === seat.seatID);

        return (
            <div
                key={seat.seatID}
                data-seat-number={seat.number}
                className={`seat-item 
                                ${seat.type?.toLowerCase() || ""} 
                                ${seat.status?.toLowerCase() || "available"} 
                                ${isCouple ? "couple" : ""} 
                                ${isManaged ? "managed-highlight" : ""}
                                ${isCouple && seat.number % 2 === 1 ? "couple-start" : ""}
                                ${isCouple && seat.number % 2 === 0 ? "couple-end-hidden" : ""}`}
                onClick={() => onClick(seat)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    handleManageSeat(seat);
                }}
                title={`Ghế ${seat.row}${seat.number} - ${seat.type} (${seat.status})\n(Click: Chuyển AVAILABLE/UNAVAILABLE, Chuột phải: Thêm/Xóa khỏi bảng)`}
            >
                {seat.number}
            </div>
        );
    };

    const ManagementTable = () => (
        <div className="management-table-container">
            <h3>Danh sách Ghế đang quản lý ({managedSeats.length})</h3>
            {managedSeats.length === 0 ? (
                <p className="seat-warning">
                    Click chuột phải vào ghế trên sơ đồ để thêm vào bảng quản lý.
                </p>
            ) : (
                <table className="seat-management-table">
                    <thead>
                        <tr>
                            <th>Ghế</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managedSeats.sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number).map((seat) => {

                            // SỬA LỖI ĐỒNG NHẤT TÊN GHẾ ĐÔI TẠI ĐÂY
                            const displayName = seat.type?.toUpperCase() === "COUPLE"
                                // Hiển thị tên ghế lẻ và ghế chẵn của cặp (Ví dụ: H9-10)
                                ? `${seat.row}${seat.number}`
                                : `${seat.row}${seat.number}`;

                            return (
                                <tr key={seat.seatID}>
                                    <td>{displayName}</td>
                                    <td>{seat.type}</td>
                                    <td>
                                        <span className={`status-tag status-${seat.status?.toLowerCase()}`}>
                                            {seat.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="action-button"
                                            onClick={() => toggleSeatAvailability(seat)}
                                            disabled={isUpdating}
                                        >
                                            {seat.status === "AVAILABLE" ? "Vô hiệu hóa" : "Kích hoạt"}
                                        </button>
                                        <button
                                            className="action-button remove-button"
                                            onClick={() => handleManageSeat(seat)}
                                            title="Xóa khỏi bảng"
                                            disabled={isUpdating}
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="seat-management-container">
            <h2 className="seat-title">Quản lý Sơ đồ Ghế </h2>

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

            {selectedRoom ? (
                loading ? (
                    <p className="seat-loading">Đang tải dữ liệu ghế...</p>
                ) : seats.length > 0 ? (
                    <div className="seat-layout-main-content">
                        <div className="seat-layout-wrapper">
                            <div className="seat-layout">
                                <h3>Sơ đồ phòng {selectedRoom}</h3>

                                <div className="seat-area">
                                    {["I", "H", "G", "F", "E", "D", "C", "B", "A"].map((row) => {
                                        let rowSeats = seats
                                            .filter((s) => s.row === row)
                                            .sort((a, b) => a.number - b.number);

                                        if (row === "H") {
                                            rowSeats = rowSeats.filter(
                                                (s) => s.number !== 5 && s.number !== 6
                                            );
                                        }

                                        if (rowSeats.length === 0) return null;

                                        if (row === "H") {
                                            const coupleGroups = groupCouples(rowSeats);
                                            return (
                                                <div key={row} className="seat-row">
                                                    <span className="row-label">{row}</span>
                                                    {coupleGroups.slice(0, 2).map((group, idx) => (
                                                        <div key={idx} className="seat-couple">
                                                            {group.map((seat) => (
                                                                <SeatItem key={seat.seatID} seat={seat} onClick={handleSeatClick} />
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <div className="aisle"></div>
                                                    {coupleGroups.slice(2).map((group, idx) => (
                                                        <div key={idx + 2} className="seat-couple">
                                                            {group.map((seat) => (
                                                                <SeatItem key={seat.seatID} seat={seat} onClick={handleSeatClick} />
                                                            ))}
                                                        </div>
                                                    ))}
                                                    <span className="row-label">{row}</span>
                                                </div>
                                            );
                                        }

                                        const left = rowSeats.filter((s) => s.number <= 5);
                                        const right = rowSeats.filter((s) => s.number >= 6);

                                        return (
                                            <div key={row} className="seat-row">
                                                <span className="row-label">{row}</span>
                                                <div className="seat-group">
                                                    {left.map((seat) => (
                                                        <SeatItem key={seat.seatID} seat={seat} onClick={handleSeatClick} />
                                                    ))}
                                                </div>
                                                <div className="aisle"></div>
                                                <div className="seat-group">
                                                    {right.map((seat) => (
                                                        <SeatItem key={seat.seatID} seat={seat} onClick={handleSeatClick} />
                                                    ))}
                                                </div>
                                                <span className="row-label">{row}</span>
                                            </div>
                                        );
                                    })}
                                    <div className="screen">Màn hình</div>
                                </div>

                                <div className="legend">
                                    <div className="legend-group status-group">
                                        <div><span className="legend-box available"></span>Khả dụng (AVAILABLE)</div>
                                        <div><span className="legend-box unavailable"></span>Vô hiệu hóa (UNAVAILABLE)</div>
                                    </div>
                                    <div className="legend-group type-group">
                                        <div><span className="legend-box standard"></span>Ghế thường</div>
                                        <div><span className="legend-box vip"></span>Ghế VIP</div>
                                        <div><span className="legend-box couple"></span>Ghế đôi</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ManagementTable />
                    </div>
                ) : (
                    <p className="seat-warning">Không có dữ liệu ghế cho phòng này.</p>
                )
            ) : (
                <p className="seat-warning">Vui lòng chọn phòng chiếu để xem sơ đồ ghế </p>
            )}
        </div>
    );
};

export default SeatManagement;