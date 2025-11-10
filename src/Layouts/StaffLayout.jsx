// src/layouts/StaffLayout.jsx
import React, { useState, useEffect } from "react";
import { useHistory, NavLink, useLocation } from "react-router-dom";
import "./StaffLayout.css";

const StaffLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [username, setUsername] = useState("");
    const history = useHistory();
    const location = useLocation(); // ✅ Đã import useLocation

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        let isValidStaff = false;

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);

                // 🔑 KIỂM TRA QUYỀN: RoleID Staff là "ST"
                if (user && user.roleID === "ST") {
                    setUsername(user.userName || "Staff");
                    isValidStaff = true;
                }
            } catch (error) {
                console.error("Lỗi khi phân tích thông tin người dùng:", error);
            }
        }

        if (!isValidStaff) {
            // Chuyển hướng nếu không có quyền/chưa đăng nhập
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            history.push("/login");
            return;
        }

        // ✅ LOGIC CHUYỂN HƯỚNG MẶC ĐỊNH CHO /staff
        // Nếu path chính xác là "/staff", chuyển hướng đến "/staff/movies"
        if (location.pathname === "/staff" || location.pathname === "/staff/") {
            history.replace("/staff/movies");
            // Không cần return vì history.replace đã thay đổi URL,
            // nhưng component sẽ render lại với path mới.
        }

    }, [history, location.pathname]);

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

    // Ngăn chặn render nội dung nếu chưa xác thực xong
    if (!localStorage.getItem("user")) {
        return null;
    }

    return (
        <div className="staff-app">
            {/* Sidebar */}
            <aside className="staff-sidebar">
                <div>
                    <h2>Staff Dashboard</h2>
                    <nav className="staff-nav">
                        <NavLink to="/staff/movies" activeClassName="active">Quản lí Phim</NavLink>
                        <NavLink to="/staff/showtimes" activeClassName="active">Quản lí Suất</NavLink>
                        <NavLink to="/staff/promotions" activeClassName="active">Quản lí Ưu Đãi</NavLink>
                        <NavLink to="/staff/topmovies" activeClassName="active">Phim bán chạy</NavLink>
                        <NavLink to="/staff/reports" activeClassName="active">Báo Cáo</NavLink>
                        <NavLink to="/staff/support" activeClassName="active">Hỗ Trợ Người Dùng</NavLink>
                    </nav>
                </div>
                {/* ✅ Nút quay về trang chủ */}
                <div className="staff-go-home">
                    <NavLink to="/" className="go-home-btn">
                        Quay về trang chủ
                    </NavLink>
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
                                <button onClick={() => handleGoToProfile("/staff/profile/view")}>
                                    👤 Xem Hồ sơ
                                </button>
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