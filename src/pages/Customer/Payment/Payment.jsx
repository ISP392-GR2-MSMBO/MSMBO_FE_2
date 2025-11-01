import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { paymentApi } from "../../../api/paymentApi";
import { bookingApi } from "../../../api/bookingApi";

const Payment = () => {
    const { bookingId } = useParams();
    const history = useHistory();

    useEffect(() => {
        const handlePayment = async () => {
            try {
                if (!bookingId) {
                    toast.error("Không tìm thấy mã đặt vé!");
                    history.push("/");
                    return;
                }

                // 1️⃣ Kiểm tra thông tin booking
                const bookingRes = await bookingApi.getBookingById(bookingId);
                if (!bookingRes || !bookingRes.id) {
                    toast.error("Không tìm thấy thông tin đặt vé!");
                    history.push("/");
                    return;
                }

                const res = await paymentApi.createPaymentLink(Number(bookingId));

                console.log("Response createPaymentLink:", res);
                const generatedUrl = res?.paymentUrl || res?.checkoutUrl;

                if (res && generatedUrl) {
                    toast.success("✅ Đang chuyển hướng đến cổng thanh toán PayOS...");
                    window.location.href = generatedUrl;
                } else {
                    toast.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại!");
                    history.push("/");
                }
            } catch (error) {
                console.error("Payment error:", error);
                toast.error("Đã xảy ra lỗi khi tạo thanh toán!");
                history.push("/");
            }
        };

        handlePayment();
    }, [bookingId, history]);

    return (
        <div className="flex flex-col justify-center items-center h-[60vh]">
            <h2 className="text-xl font-semibold mb-3">
                Đang tạo liên kết thanh toán...
            </h2>
            <p className="text-gray-500">Vui lòng đợi giây lát.</p>
        </div>
    );
};

export default Payment;
