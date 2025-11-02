// src/layouts/StaffLayout.jsx
import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import "./StaffLayout.css";

const StaffLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [username, setUsername] = useState("");
    const history = useHistory();

    useEffect(() => {
        // 🔹 Lấy thông tin user từ localStorage sau khi login
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUsername(user.userName || "Staff");
            } catch {
                setUsername("Staff");
            }
        } else {
            // Nếu chưa login -> tự động chuyển về trang login
            history.push("/login");
        }
    }, [history]);

    // ✅ Hàm mới để chuyển hướng đến trang hồ sơ
    const handleGoToProfile = (path) => {
        history.push(path);
        setShowMenu(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        history.push("/login");
    };

    return (
        <div className="staff-app">
            {/* Sidebar */}
            <aside className="staff-sidebar">
                <div>
                    <h2>Staff Dashboard</h2>
                    <nav className="staff-nav">
                        <Link to="/staff/topmovies">Phim bán chạy</Link>
                        <Link to="/staff/movies" className="active">Quản lí Phim</Link>
                        <Link to="/staff/showtimes">Quản lí Suất</Link>
                        <Link to="/staff/promotions">Quản lí Ưu Đãi</Link>
                        <Link to="/staff/reports">Báo Cáo</Link>
                        <Link to="/staff/support">Hỗ Trợ Người Dùng</Link>
                    </nav>
                </div>
                <div className="staff-sidebar-footer">© 2025 Staff</div>
            </aside>

            {/* Main Content */}
            <div className="staff-main">
                <header className="staff-header">
                    <div className="staff-header-left">
                        <h1>Xin chào, {username}</h1>
                    </div>
                    <div className="staff-header-right">
                        <img
                            src="https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"
                            alt="profile"
                            className="staff-profile"
                            onClick={() => setShowMenu(!showMenu)}
                        />
                        {showMenu && (
                            <div className="staff-dropdown">
                                {/* ✅ Thêm nút Xem Hồ sơ, chuyển đến ViewProfileStaff.jsx */}
                                <button onClick={() => handleGoToProfile("/staff/profile/view")}>
                                    👤 Xem Hồ sơ
                                </button>
                                {/* ✅ Thêm nút Sửa Hồ sơ, chuyển đến EditProfileStaff.jsx */}
                                <button onClick={() => handleGoToProfile("/staff/profile/edit")}>
                                    ✏️ Sửa Hồ sơ
                                </button>
                                <button onClick={handleLogout}>🚪 Đăng xuất</button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="staff-content">{children}</main>
            </div>
        </div>
    );
};

export default StaffLayout;