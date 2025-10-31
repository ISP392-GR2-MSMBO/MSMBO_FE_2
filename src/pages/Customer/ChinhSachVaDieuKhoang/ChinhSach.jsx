// src/pages/Customer/ChinhSachVaDieuKhoang/ChinhSach.jsx

import React from 'react';
import './Policy.css'; // Sử dụng CSS chung

const ChinhSach = () => {
    return (
        <div className="policy-container">
            <h1 className="policy-title">CHÍNH SÁCH BẢO MẬT CỦA CHILL CINEMA</h1>

            <div className="policy-content">
                <h2>1. Thu thập thông tin cá nhân</h2>
                <p>Chill Cinema thu thập thông tin cá nhân (Họ tên, Email, Số điện thoại) khi bạn đăng ký tài khoản và thực hiện giao dịch đặt vé. Việc thu thập này nhằm mục đích quản lý đơn hàng và hỗ trợ khách hàng.</p>

                <h2>2. Bảo mật thông tin</h2>
                <ul>
                    <li>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp bảo mật tiêu chuẩn ngành.</li>
                    <li>Thông tin thanh toán được xử lý qua cổng thanh toán an toàn, chúng tôi không lưu trữ chi tiết thẻ tín dụng/thẻ ghi nợ của bạn.</li>
                </ul>

                <h2>3. Mục đích sử dụng thông tin</h2>
                <p>Thông tin của bạn được sử dụng để:</p>
                <ol>
                    <li>Xác nhận và quản lý đơn đặt vé.</li>
                    <li>Cải thiện chất lượng dịch vụ khách hàng.</li>
                </ol>

                <h2>4. Chia sẻ thông tin</h2>
                <p>Chill Cinema cam kết không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào, trừ trường hợp có yêu cầu từ cơ quan pháp luật.</p>
            </div>
        </div>
    );
};

export default ChinhSach;