import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../layout/LienHe.css";

const LienHe = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [posterIndex, setPosterIndex] = useState(0);
    const posters = [
        "https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/Poster%20Phim/C%E1%BA%AET%20NG%C3%93N%20TH%E1%BB%AC%20H%C3%80I.jpg",
        "http://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/Poster%20Phim/T%E1%BB%AC%20CHI%E1%BA%BEN%20TR%C3%8AN%20KH%C3%94NG.jpg",
        "http://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/Poster%20Phim/MA%20CH%E1%BA%A2I%20%C4%90%E1%BA%A6U.jpg",
    ];

    const intervalRef = useRef(null);

    // ✅ Dùng useCallback để tránh cảnh báo "missing dependency"
    const handleNext = useCallback(() => {
        setPosterIndex((prev) => (prev + 1) % posters.length);
    }, [posters.length]);

    const handlePrev = () => {
        setPosterIndex((prev) => (prev - 1 + posters.length) % posters.length);
    };

    const startAutoSlide = useCallback(() => {
        stopAutoSlide(); // clear trước khi setInterval mới
        intervalRef.current = setInterval(() => {
            handleNext();
        }, 4000);
    }, [handleNext]);

    const stopAutoSlide = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // ✅ Chỉ 1 useEffect gọn gàng
    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [startAutoSlide]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Cảm ơn bạn đã góp ý!");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="lienhe-page">
            {/* Thông tin liên hệ */}
            <div className="cinema-info">
                <h2>CHILL CINEMA</h2>
                <p>📍 890 Trần Hưng Đạo, Quận 5, HCM</p>
                <p>📞 Tel: 0368.799.890</p>
                <p>✉️ Email: chillcinema890@gmail.com</p>
            </div>

            {/* 3 cột: Map - Form - Poster */}
            <div className="three-columns">
                {/* Google Map */}
                <div className="map-container">
                    <iframe
                        title="dd-cinema-map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.690415229308!2d106.682!3d10.762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2f7b0eaeab%3A0xf0b4b6f4f6f3!2zVHLhuqduIEjGsG5nIMSQ4bqhaQ!5e0!3m2!1svi!2s!4v1696249249494!5m2!1svi!2s"
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>

                {/* Form góp ý */}
                <div className="feedback-form-wrapper">
                    <h2>Góp ý & Liên hệ</h2>
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Họ và tên"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Nội dung góp ý..."
                            rows="5"
                            required
                        ></textarea>
                        <button type="submit">Gửi góp ý</button>
                    </form>
                </div>

                {/* Poster phim (Slider) */}
                <div
                    className="poster-slider"
                    onMouseEnter={stopAutoSlide}
                    onMouseLeave={startAutoSlide}
                >
                    <button className="arrow left" onClick={handlePrev}>
                        ❮
                    </button>
                    <div className="poster-wrapper">
                        <div
                            className="poster-track"
                            style={{
                                transform: `translateX(-${posterIndex * 100}%)`,
                            }}
                        >
                            {posters.map((poster, index) => (
                                <div key={index} className="poster-container">
                                    <img src={poster} alt={`Poster ${index}`} className="poster-img" />
                                    <div className="overlay">
                                        <button className="buy-btn">🎟 Mua vé</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="arrow right" onClick={handleNext}>
                        ❯
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LienHe;
