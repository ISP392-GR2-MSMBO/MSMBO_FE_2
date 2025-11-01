// src/pages/Customer/Payment/PaymentSuccess.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { bookingApi } from "../../../api/bookingApi";
import { toast } from "react-toastify";
import {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    WidthType, TextRun, ShadingType
} from "docx";
import { saveAs } from "file-saver";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
    const location = useLocation();
    const history = useHistory();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // ✅ SỬA LỖI: LẤY GIÁ TRỊ TỪ ORDERCODE VÀ LÀM SẠCH (CHỈ GIỮ LẠI CHUỖI SỐ)
    const query = new URLSearchParams(location.search);
    const rawBookingId =
        query.get("bookingId") ||
        query.get("id");

    // === LÀM SẠCH ID: Loại bỏ mọi ký tự không phải số (ví dụ: ":1") ===
    const bookingId = rawBookingId ? rawBookingId.replace(/\D/g, '') : null;

    // Log để kiểm tra giá trị
    console.log("Raw Booking ID:", rawBookingId);
    console.log("Cleaned Booking ID (Sẽ dùng gọi API):", bookingId);

    useEffect(() => {
        setIsLoading(true);

        if (!bookingId) {
            setApiError("Không tìm thấy mã hóa đơn trong đường dẫn.");
            setIsLoading(false);
            toast.error("Không tìm thấy mã hóa đơn trong đường dẫn.");
            setTimeout(() => { history.push("/"); }, 300);
            return;
        }

        // Kiểm tra tính hợp lệ cơ bản (phải là số)
        if (isNaN(Number(bookingId)) || Number(bookingId) <= 0) {
            setApiError("ID hóa đơn không hợp lệ (Không phải số nguyên dương).");
            setIsLoading(false);
            toast.error("ID hóa đơn không hợp lệ.");
            setTimeout(() => { history.push("/"); }, 300);
            return;
        }

        const fetchBooking = async () => {
            try {
                // GỌI API BẰNG ID ĐÃ ĐƯỢC LÀM SẠCH
                const data = await bookingApi.getBookingById(bookingId);

                // Kiểm tra dữ liệu
                if (!data || !data.bookingID || !data.seats || data.seats.length === 0) {
                    throw new Error("Dữ liệu hóa đơn từ Server không đầy đủ.");
                }

                setBooking(data);
                setApiError(null);

            } catch (err) {
                // XỬ LÝ LỖI API: Giữ nguyên trên màn hình
                console.error("Lỗi tải hóa đơn (Chi tiết):", err.response?.data || err.message);

                const statusCode = err.response?.status;
                let errorMessage = `Lỗi ${statusCode || 'Mạng'}. Vui lòng thử lại.`;

                if (statusCode === 400) {
                    errorMessage = "Lỗi định dạng ID đặt vé. (ID phải là số nguyên). Vui lòng kiểm tra tham số URL.";
                } else if (statusCode === 401 || statusCode === 403) {
                    errorMessage = "Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập.";
                } else if (statusCode === 404) {
                    errorMessage = "Không tìm thấy hóa đơn này.";
                } else if (err.message.includes("ID đặt vé không hợp lệ")) {
                    errorMessage = "ID đặt vé không hợp lệ (Không phải số). Vui lòng kiểm tra lại URL.";
                }

                setApiError(errorMessage);
                toast.error(`❌ Tải hóa đơn thất bại: ${errorMessage}`);

            } finally {
                setIsLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, history]);

    // ================= Word Download Handler (CẬP NHẬT TÊN TRƯỜNG) =================
    const handleDownloadWord = () => {
        if (!booking) return;

        const tableRows = booking.seats.map((s, i) =>
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(String(i + 1))], width: { size: 10, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph(`${s.seatRow}${s.seatNumber}`)], width: { size: 20, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph("Ghế thường")], width: { size: 35, type: WidthType.PERCENTAGE } }), // Dùng tạm 'Ghế thường'
                    new TableCell({ children: [new Paragraph(s.price.toLocaleString("vi-VN"))], width: { size: 35, type: WidthType.PERCENTAGE } }),
                ]
            })
        );

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "HÓA ĐƠN ĐẶT VÉ XEM PHIM", bold: true, size: 36 })],
                        spacing: { after: 300 }
                    }),
                    new Paragraph({ children: [new TextRun({ text: `Mã hóa đơn: ${booking.bookingID}`, bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `Khách hàng: ${booking.userName || "Ẩn danh"}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Phim: ${booking.movieName}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Phòng: ${booking.theaterName}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Thời gian: ${booking.startTime} - ${booking.showDate}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Ghế: ${booking.seats.map(s => `${s.seatRow}${s.seatNumber}`).join(", ")}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Tổng tiền: ${booking.totalPrice.toLocaleString("vi-VN")} đ`, bold: true })] }),
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "STT", bold: true })], shading: { type: ShadingType.CLEAR, fill: "B0C4DE" } }),
                                    new TableCell({ children: [new Paragraph({ text: "Ghế", bold: true })], shading: { type: ShadingType.CLEAR, fill: "B0C4DE" } }),
                                    new TableCell({ children: [new Paragraph({ text: "Loại", bold: true })], shading: { type: ShadingType.CLEAR, fill: "B0C4DE" } }),
                                    new TableCell({ children: [new Paragraph({ text: "Giá (VNĐ)", bold: true })], shading: { type: ShadingType.CLEAR, fill: "B0C4DE" } }),
                                ]
                            }),
                            ...tableRows
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    })
                ]
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `HoaDon_${booking.bookingID}.docx`);
        });
    };

    // ================= RENDER UI =================

    if (isLoading) { return <p className="loading-message">Đang tải hóa đơn...</p>; }

    if (apiError && !booking) {
        return (
            <div className="payment-success-page error">
                <div className="invoice-container">
                    <h2>❌ Lỗi Tải Hóa Đơn</h2>
                    <p>Chi tiết lỗi: <b>{apiError}</b></p>
                    <p>Vui lòng kiểm tra lại ID hóa đơn hoặc nhấn nút bên dưới để về trang chủ.</p>
                    <button onClick={() => history.push("/")} className="home-btn">Về trang chủ ngay</button>
                </div>
            </div>
        );
    }

    if (!booking) { return <p className="loading-message">Không tìm thấy dữ liệu hóa đơn.</p>; }

    return (
        <div className="payment-success-page">
            <div className="invoice-container">
                <h2>🎉 Thanh toán thành công!</h2>
                <p>Mã hóa đơn: <b>{booking.bookingID}</b></p>
                <p>Phim: <b>{booking.movieName}</b></p>
                <p>Phòng chiếu: {booking.theaterName}</p>
                <p>Thời gian: {booking.startTime} - {booking.showDate}</p>
                <p>Ghế: {booking.seats.map(s => `${s.seatRow}${s.seatNumber}`).join(", ")}</p>
                <p>Tổng tiền: <b>{booking.totalPrice.toLocaleString("vi-VN")} đ</b></p>
                <button onClick={handleDownloadWord} className="download-btn">Tải hóa đơn (Word)</button>
                <button onClick={() => history.push("/")} className="home-btn">Về trang chủ</button>
            </div>
        </div>
    );
};

export default PaymentSuccess;