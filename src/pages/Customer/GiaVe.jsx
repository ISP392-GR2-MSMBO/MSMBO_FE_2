import React from 'react';

const GiaVe = () => {
    // URL ảnh giá vé cố định
    const imageUrl = "https://res.cloudinary.com/dmprbuogr/image/upload/v1762715245/Screenshot_2025-11-10_015914_mter7j.png";

    return (
        <div style={{
            // Căn giữa nội dung theo cả chiều ngang và chiều dọc
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // Chiều cao tối thiểu, điều chỉnh 60px nếu có header/footer
            minHeight: 'calc(100vh - 60px)',
            backgroundColor: '#000', // Nền đen
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <img
                src={imageUrl}
                alt="Hình ảnh giá vé"
                style={{
                    // Kích thước: 90% chiều rộng, tối đa 1200px
                    width: '90%',
                    maxWidth: '1200px',
                    height: 'auto',
                    display: 'block',
                    // Viền đen 1px (không phải viền đỏ)
                    border: '1px solid #000',
                    outline: 'none', // Đảm bảo không có viền focus
                }}
            />
        </div>
    );
}

export default GiaVe;