// src/pages/Payment/Payment.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentApi } from "../../../api/paymentApi";
import "./Payment.css";

const Payment = () => {
    const { bookingId } = useParams();

    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initPayment = async () => {
            try {
                setLoading(true);
                // ✅ Bước 1: Gọi API tạo link thanh toán (đã giả định có token)
                const res = await paymentApi.createPaymentLink(Number(bookingId));

                // ✅ Bước 2: Kiểm tra cấu trúc dữ liệu trả về
                if (!res || !res.data) {
                    console.error("API trả về không có trường 'data' hợp lệ:", res);
                    toast.error("❌ Cấu trúc dữ liệu thanh toán không hợp lệ!");
                    setPaymentData(null);
                    return;
                }

                setPaymentData(res.data);
                toast.success("✅ Link thanh toán đã được tạo!");
            } catch (err) {
                // SỬA ĐỔI: Log lỗi chi tiết của Axios để debug
                const errorMessage = err.response?.data?.message || err.message;
                console.error("Lỗi tạo link thanh toán chi tiết:", errorMessage);
                toast.error(`❌ Không thể tạo link thanh toán! Lỗi: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        if (bookingId) initPayment();
    }, [bookingId]);

    if (loading) return <div className="payment-page">Đang tạo link thanh toán...</div>;

    // Hiển thị thông báo này nếu API thất bại
    if (!paymentData) return <div className="payment-page">Không có dữ liệu thanh toán!</div>;

    const paymentUrl = paymentData.paymentUrl || paymentData.checkoutUrl || null;

    return (
        <div className="payment-page">
            <h2>Thanh toán đơn hàng #{paymentData.orderCode}</h2>
            <p>Số tiền: <strong>{paymentData.amount?.toLocaleString("vi-VN")} đ</strong></p>

            {paymentUrl ? (
                <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="payment-btn"
                >
                    👉 Thanh toán ngay
                </a>
            ) : (
                <div className="qr-section">
                    <p>Hoặc quét mã QR để thanh toán:</p>
                    {paymentData.qrCode && (
                        <img src={paymentData.qrCode} alt="QR Thanh toán" className="qr-image" />
                    )}
                </div>
            )}
        </div>
    );
};

export default Payment;