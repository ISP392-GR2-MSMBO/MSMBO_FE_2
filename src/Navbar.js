import { Link } from "react-router-dom";
import "./index.css";

const Navbar = () => {
    return (
        <header className="navbar">
            {/* Hàng trên: chỉ Đăng ký / Đăng nhập */}
            <div className="top-bar">
                <div className="auth">
                    <Link to="/register">Đăng ký</Link>
                    <Link to="/login">Đăng nhập</Link>
                </div>
            </div>

            {/* Hàng dưới: Logo + Tìm kiếm + Menu */}
            <div className="menu-bar">
                {/* Logo */}
                <div className="logo">
                    <Link to="/">
                        <img
                            src="https://i.postimg.cc/3xggWX6s/Chill-Cinema-Logo-Design-Vibrant-Red-1-removebg-preview.png"
                            alt="Chill Cinema Logo"
                        />
                    </Link>
                </div>
                {/* Tìm kiếm */}
                <div className="search-box">
                    <input type="text" placeholder="Tìm kiếm..." />
                    <button>Tìm</button>
                </div>

                {/* Menu */}
                <nav className="menu">
                    <Link to="/">Trang chủ</Link>
                    <div className="dropdown">
                        <Link to="/phim">Phim ▾</Link>
                        <div className="dropdown-content">
                            <Link to="/phim/dang-chieu">Đang chiếu</Link>
                            <Link to="/phim-sap-chieu">Sắp chiếu</Link>
                        </div>
                    </div>
                    <Link to="/lich-chieu">Lịch chiếu</Link>
                    <Link to="/giave">Giá vé</Link>
                    <Link to="/uudai">Ưu đãi</Link>
                    <Link to="/lien-he">Liên hệ</Link>


                </nav>
            </div>
        </header>
    );
};

export default Navbar;
