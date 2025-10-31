// src/pages/Customer/ChinhSachVaDieuKhoang/DieuKhoang.jsx

import React from 'react';
import './Policy.css'; // Sử dụng CSS chung cho policy/terms

const DieuKhoang = () => {
    return (
        <div className="policy-container">
            <h1 className="policy-title">ĐIỀU KHOẢN SỬ DỤNG RẠP CHILL CINEMA</h1>

            <div className="policy-content">
                <h2>1. Chấp nhận Điều khoản</h2>
                <p>Bằng cách truy cập và sử dụng dịch vụ của Chill Cinema, bạn đồng ý với các điều khoản và điều kiện được quy định dưới đây. Các điều khoản này có thể được cập nhật định kỳ mà không cần thông báo trước.</p>

                <h2>2. Quy định mua vé</h2>
                <ul>
                    <li>Vé đã mua không được đổi hoặc trả lại, trừ khi suất chiếu bị hủy hoặc thay đổi bởi rạp.</li>
                    <li>Khách hàng phải tuân thủ quy định phân loại phim theo độ tuổi (P, K, T13, T16, T18). Rạp có quyền yêu cầu xuất trình giấy tờ tùy thân.</li>
                    <li>Khách hàng phải đến trước giờ chiếu ít nhất 15 phút.</li>
                </ul>

                <h2>3. Quyền sở hữu trí tuệ</h2>
                <p>Toàn bộ nội dung, hình ảnh, logo và phần mềm trên trang web/ứng dụng Chill Cinema thuộc quyền sở hữu của công ty. Mọi hành vi sao chép, tái bản hoặc phân phối mà không có sự cho phép bằng văn bản đều bị nghiêm cấm.</p>

                <h2>4. Miễn trừ trách nhiệm</h2>
                <p>Chill Cinema không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh do việc truy cập hoặc không thể truy cập dịch vụ của chúng tôi.</p>
            </div>
        </div>
    );
};

export default DieuKhoang;