import { Link } from 'react-router-dom';
import "./Footer.css"; // tạo CSS riêng

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4>Liên hệ</h4>
                    <p>Email: ChillCinema@gmail.com</p>
                    <p>Hotline: 1900 1234</p>
                    <p>Địa chỉ: 123 Đường Phin, TP.HCM</p>
                </div>

                <div className="footer-section">
                    <h4>Điều khoản</h4>
                    <Link to="/dieu-khoan">Điều khoản sử dụng</Link>
                    <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
                </div>

                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <p>Facebook | Instagram | Youtube</p>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; 2025 ChillCinema. Hân hạnh được phục vụ quý khách.
            </div>
        </footer>
    );
};

export default Footer;
