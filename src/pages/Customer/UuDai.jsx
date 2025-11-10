import React, { useState, useEffect } from 'react';
import { promotionApi } from '../../api/promotionApi';
import "../../layout/UuDai.css";

const UuDai = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDiscount = (type, value) => {
        const normalizedType = type ? type.toUpperCase() : '';

        if (normalizedType === 'PERCENT' || normalizedType.includes('PERCENT')) {
            return `${value}%`;
        }

        const formattedValue = new Intl.NumberFormat('vi-VN').format(value);
        return `${formattedValue} VNĐ`;
    };

    useEffect(() => {
        const loadPromotions = async () => {
            setLoading(true);
            try {
                // Hàm này chỉ trả về ưu đãi có active=true
                const data = await promotionApi.getAllPromotions();
                setPromotions(data);
                setError(null);
            } catch (err) {
                console.error("Error loading promotions:", err);
                setError("Không thể tải danh sách ưu đãi.");
            } finally {
                setLoading(false);
            }
        };

        loadPromotions();
    }, []);

    if (loading) {
        return <div className="promotion-page" style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Đang tải ưu đãi...</div>;
    }

    if (error) {
        return <div className="promotion-page" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Lỗi: {error}</div>;
    }

    if (promotions.length === 0) {
        return <div className="promotion-page" style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Hiện không có chương trình ưu đãi nào đang hoạt động.</div>;
    }

    return (
        <div className="promotion-page">

            {promotions.map((promo) => (
                <div key={promo.promotionID} className="promotion-slide">

                    {/* KHỐI BÊN TRÁI: Hình ảnh */}
                    <div className="promo-image-container">
                        <img
                            src={promo.imageUrl || "placeholder_image_url"}
                            alt={promo.name}
                            className="promo-image"
                        />
                    </div>

                    {/* KHỐI BÊN PHẢI: Thông tin chi tiết */}
                    <div className="promo-details">
                        <h3 className="promo-title">{promo.name}</h3>

                        <p className="promo-date">
                            Áp dụng: Từ {new Date(promo.startDate).toLocaleDateString()} đến {new Date(promo.endDate).toLocaleDateString()}
                        </p>

                        <p className="promo-value">
                            Giảm giá: <span style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '1.2em' }}>
                                {formatDiscount(promo.discountType, promo.discountValue)}
                            </span>
                        </p>

                        <p>
                            loại ghế được giảm: {promo.applicableSeatTypes.map(seat => seat.name).join(', ')}
                        </p>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default UuDai;