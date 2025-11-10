// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { useHistory, NavLink } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [username, setUsername] = useState("");
    const history = useHistory();

    useEffect(() => {
        // 🔹 Lấy thông tin user từ localStorage sau khi login
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUsername(user.userName || "Admin");
            } catch {
                setUsername("Admin");
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
        <div className="admin-app">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div>
                    <h2>Admin Dashboard</h2>
                    <nav className="admin-nav">
                        <NavLink to="/admin/users" activeClassName="active">
                            👥 Quản lí Người Dùng
                        </NavLink>

                        <NavLink to="/admin/reports" activeClassName="active">
                            💬 Hỗ trợ
                        </NavLink>
                    </nav>
                </div>
                {/* ✅ Nút quay về trang chủ */}
                <div className="admin-go-home">
                    <NavLink to="/" className="go-home-btn">
                        Quay về trang chủ
                    </NavLink>
                </div>
                <div className="admin-sidebar-footer">© 2025 Cinema Admin</div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1>Xin chào, {username}</h1>
                    </div>
                    <div className="admin-header-right">
                        <img
                            src="https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"
                            alt="profile"
                            className="admin-profile"
                            onClick={() => setShowMenu(!showMenu)}
                        />
                        {showMenu && (
                            <div className="admin-dropdown">
                                <button onClick={() => handleGoToProfile("/admin/profile")}>👤 Hồ sơ</button>
                                <button onClick={handleLogout}>🚪 Đăng xuất</button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="admin-content">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
