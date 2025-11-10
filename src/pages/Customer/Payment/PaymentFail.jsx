// src/pages/Customer/Payment/PaymentFail.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingApi } from "../../../api/bookingApi";
import "./PaymentFail.css";

const PaymentFail = () => {
    const location = useLocation();
    const history = useHistory();
    // Biến 'deletionStatus' hiện đã được sử dụng trong JSX
    const [deletionStatus, setDeletionStatus] = useState("Đang xử lý");
    const [isDeleting, setIsDeleting] = useState(true);

    // Lấy bookingId từ URL (Giả định tham số là 'bookingId', 'orderCode' hoặc 'id')
    const query = new URLSearchParams(location.search);
    const rawBookingId = query.get("bookingId") || query.get("orderCode") || query.get("id");

    // LÀM SẠCH ID: Loại bỏ mọi ký tự không phải số
    const bookingId = rawBookingId ? rawBookingId.replace(/\D/g, '') : null;

    useEffect(() => {
        if (!bookingId) {
            setDeletionStatus("Không tìm thấy Mã hóa đơn. Không thể hủy bỏ.");
            setIsDeleting(false);
            toast.error("Không tìm thấy Mã hóa đơn để hủy.");
            return;
        }

        const deleteBooking = async () => {
            setIsDeleting(true);
            try {
                // ✅ GỌI API HỦY BOOKING
                await bookingApi.deleteBookingById(bookingId);

                setDeletionStatus(
                    `✅ Mã hóa đơn (${bookingId}) đã được HỦY thành công trên hệ thống.`
                );
                toast.success("Hóa đơn thanh toán không thành công đã bị hủy.");

            } catch (error) {
                console.error("Booking Deletion failed:", error.response?.data || error.message);

                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Lỗi không xác định khi hủy hóa đơn.";

                // Xử lý trường hợp 404 (đã bị xóa hoặc không tồn tại)
                if (error.response?.status === 404) {
                    setDeletionStatus(
                        `⚠️ Mã hóa đơn (${bookingId}) không tồn tại hoặc đã bị hủy trước đó.`
                    );
                } else {
                    setDeletionStatus(
                        `❌ Lỗi hủy hóa đơn. ${errorMessage}. Vui lòng liên hệ hỗ trợ.`
                    );
                    toast.error(`❌ Lỗi khi hủy booking: ${errorMessage}`);
                }
            } finally {
                setIsDeleting(false);
            }
        };

        deleteBooking();
    }, [bookingId, history]);

    const handleGoHome = () => {
        history.push("/");
    };

    // ❌ Hàm 'handleRetryBooking' đã được xóa do không sử dụng, loại bỏ lỗi no-unused-vars.

    return (
        <div className="payment-fail-page">
            <div className="fail-container">
                <h2>💔 Thanh Toán Thất Bại!</h2>

                <p>
                    Quá trình xử lý thanh toán của bạn không thành công hoặc bị hủy.
                </p>

                <p>
                    Mã hóa đơn: <b>{bookingId || "Không rõ"}</b>
                </p>

                {/* ✅ Hiển thị deletionStatus để loại bỏ lỗi no-unused-vars */}
                <p className={`status-message ${isDeleting ? 'pending' : 'completed'}`}>
                    Trạng thái hủy đơn:
                    <span style={{ fontWeight: 'bold' }}> {deletionStatus}</span>
                    {isDeleting && " (Đang hủy booking tạm thời)"}
                </p>


                <div className="fail-actions">
                    <button
                        onClick={handleGoHome}
                        className="home-btn"
                        disabled={isDeleting}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFail;