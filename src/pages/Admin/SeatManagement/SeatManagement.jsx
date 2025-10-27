import React, { useState } from "react";
import { seatApi } from "../../../api/seatApi";
import { toast } from "react-toastify";
import "./SeatManagement.css";

const SeatManagement = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    // State mới để quản lý các ghế được thêm vào bảng bên phải
    const [managedSeats, setManagedSeats] = useState([]);
    // State để ngăn chặn request kép khi đang cập nhật
    const [isUpdating, setIsUpdating] = useState(false);

    // Lấy danh sách ghế theo phòng
    const fetchSeats = async (theaterId) => {
        try {
            setLoading(true);
            const data = await seatApi.getSeatsByRoom(theaterId);
            // Ghi chú: Dữ liệu ghế trả về từ API cần phải dùng 2 trạng thái mới
            // Nếu API vẫn trả về EMPTY/BOOKED/SOLD, bạn cần ánh xạ chúng về AVAILABLE ở đây.
            const mappedData = data.map(s => ({
                ...s,
                // Ánh xạ cũ: Ghế nào không phải UNAVAILABLE thì coi là AVAILABLE
                status: s.status === "UNAVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
            }));

            setSeats(mappedData);
            setManagedSeats([]); // Reset bảng khi chuyển phòng
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

    /**
     * HÀM CẬP NHẬT: Chuyển đổi trạng thái giữa AVAILABLE và UNAVAILABLE.
     * Ghế luôn chuyển đổi trạng thái ngược lại (Ghế chỉ có 2 trạng thái).
     */
    const handleSeatClick = async (seat) => {
        // Ngăn hành động khi đang cập nhật
        if (isUpdating) return;

        // Trạng thái tiếp theo luôn là ngược lại của trạng thái hiện tại
        const nextStatus = seat.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

        try {
            setIsUpdating(true);

            // LOGIC GHẾ ĐÔI (Cập nhật trạng thái)
            if (seat.type && seat.type.toUpperCase() === "COUPLE") {

                // 1. Tìm ghế đối tác
                const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
                const partnerSeat = seats.find(
                    s => s.row === seat.row && s.number === partnerNumber
                );

                if (partnerSeat) {
                    // 2. Gửi request cập nhật cho cả hai ghế (song song)
                    await Promise.all([
                        seatApi.updateSeatStatus(seat.seatID, nextStatus),
                        seatApi.updateSeatStatus(partnerSeat.seatID, nextStatus)
                    ]);

                    // Cập nhật State (cả hai ghế)
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

                    toast.success(`✅ Cặp ghế ${seat.row}${Math.min(seat.number, partnerNumber)}-${Math.max(seat.number, partnerNumber)} → ${nextStatus}`);

                } else {
                    toast.warn("❌ Không tìm thấy ghế đối tác. Chỉ cập nhật ghế hiện tại.");
                    await seatApi.updateSeatStatus(seat.seatID, nextStatus);
                    setSeats((prev) => prev.map(s => s.seatID === seat.seatID ? { ...s, status: nextStatus } : s));
                }

            } else {
                // Logic cho ghế đơn
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

    /**
     * HÀM handleManageSeat: GIỮ NGUYÊN LOGIC THÊM/XÓA CẶP GHẾ
     */
    const handleManageSeat = (seat) => {
        // 1. Xác định cả hai ghế cần quản lý
        let seatsToManage = [seat];
        let isCouple = seat.type && seat.type.toUpperCase() === "COUPLE";

        if (isCouple) {
            const partnerNumber = seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;
            const partnerSeat = seats.find(
                s => s.row === seat.row && s.number === partnerNumber
            );

            if (partnerSeat) {
                seatsToManage.push(partnerSeat);
            }
        }

        // Tạo danh sách ID để tiện lọc
        const seatIDsToManage = seatsToManage.map(s => s.seatID);

        // 2. Kiểm tra xem bất kỳ ghế nào trong tập hợp đã được quản lý chưa
        const isCurrentlyManaged = seatsToManage.some(s =>
            managedSeats.some(ms => ms.seatID === s.seatID)
        );

        // Tạo tên để hiển thị trong thông báo toast
        const seatNames = isCouple
            ? `Cặp ghế ${seat.row}${Math.min(...seatsToManage.map(s => s.number))}-${Math.max(...seatsToManage.map(s => s.number))}`
            : `Ghế ${seat.row}${seat.number}`;


        if (isCurrentlyManaged) {
            // Xóa khỏi bảng (cả cặp nếu là ghế đôi)
            setManagedSeats((prev) =>
                prev.filter((s) => !seatIDsToManage.includes(s.seatID))
            );
            toast.info(`${seatNames} đã bị xóa khỏi bảng quản lý.`);
        } else {
            // Thêm vào bảng (cả cặp nếu là ghế đôi). 
            const newSeats = seatsToManage.filter(s =>
                !managedSeats.some(ms => ms.seatID === s.seatID)
            );

            setManagedSeats((prev) => [...prev, ...newSeats]);
            toast.info(`${seatNames} đã được thêm vào bảng quản lý.`);
        }
    };

    /**
     * HÀM TẮT/MỞ KHẢ DỤNG: Bây giờ hàm này trùng với handleSeatClick, 
     * nên ta sẽ gọi lại handleSeatClick từ bảng quản lý.
     */
    const toggleSeatAvailability = (seat) => {
        handleSeatClick(seat);
    };

    // Hàm để nhóm ghế đôi (GIỮ NGUYÊN)
    const groupCouples = (rowSeats) => {
        const groups = [];
        for (let i = 0; i < rowSeats.length; i += 2) {
            groups.push(rowSeats.slice(i, i + 2));
        }
        return groups;
    };

    // Component con để render một ghế (CẬP NHẬT: Loại bỏ class BOOKED/SOLD/EMPTY, chỉ giữ AVAILABLE/UNAVAILABLE)
    const SeatItem = ({ seat, onClick }) => {
        const isCouple = seat.type?.toLowerCase() === "couple";
        const isManaged = managedSeats.some(s => s.seatID === seat.seatID);

        return (
            <div
                key={seat.seatID}
                // Sử dụng 'available' làm class chung cho ghế khả dụng
                className={`seat-item ${seat.type?.toLowerCase() || ""} ${seat.status?.toLowerCase() || "available"} ${isCouple ? "couple" : ""} ${isManaged ? "managed-highlight" : ""}`}
                onClick={() => onClick(seat)}
                onContextMenu={(e) => {
                    e.preventDefault(); // Ngăn menu chuột phải mặc định
                    handleManageSeat(seat);
                }}
                title={`Ghế ${seat.row}${seat.number} - ${seat.type} (${seat.status})\n(Click: Chuyển AVAILABLE/UNAVAILABLE, Chuột phải: Thêm/Xóa khỏi bảng)`}
            >
                {seat.number}
            </div>
        );
    };

    // Component Bảng quản lý bên phải (CẬP NHẬT: Chỉ hiện nút chuyển đổi cho 2 trạng thái)
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
                        {managedSeats.sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number).map((seat) => (
                            <tr key={seat.seatID}>
                                <td>{seat.row}{seat.number}</td>
                                <td>{seat.type}</td>
                                <td>
                                    <span className={`status-tag status-${seat.status?.toLowerCase()}`}>
                                        {seat.status}
                                    </span>
                                </td>
                                <td>
                                    {/* Nút này luôn chuyển đổi giữa AVAILABLE và UNAVAILABLE */}
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
                        ))}
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
                        {/* Khu vực sơ đồ ghế */}
                        <div className="seat-layout-wrapper">
                            <div className="seat-layout">
                                <h3>Sơ đồ phòng {selectedRoom}</h3>

                                <div className="seat-area">
                                    {/* Logic render ghế giữ nguyên */}
                                    {["I", "H", "G", "F", "E", "D", "C", "B", "A"].map((row) => {
                                        let rowSeats = seats
                                            .filter((s) => s.row === row)
                                            .sort((a, b) => a.number - b.number);

                                        // Logic bỏ ghế 5, 6 của hàng H
                                        if (row === "H") {
                                            rowSeats = rowSeats.filter(
                                                (s) => s.number !== 5 && s.number !== 6
                                            );
                                        }

                                        if (rowSeats.length === 0) return null; // Bỏ qua hàng không có ghế

                                        // Logic render Ghế Đôi hàng H
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

                                        // Logic render Ghế Thường
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
                                    {/* Nhóm 1: Trạng thái (Phân biệt màu nền) */}
                                    <div className="legend-group status-group">
                                        <div><span className="legend-box available"></span>Khả dụng (AVAILABLE)</div>
                                        <div><span className="legend-box unavailable"></span>Vô hiệu hóa (UNAVAILABLE)</div>
                                    </div>

                                    {/* Nhóm 2: Loại ghế (Phân biệt màu viền) */}
                                    <div className="legend-group type-group">
                                        <div><span className="legend-box standard"></span>Ghế thường</div>
                                        <div><span className="legend-box vip"></span>Ghế VIP</div>
                                        <div><span className="legend-box couple"></span>Ghế đôi</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Khu vực bảng quản lý */}
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