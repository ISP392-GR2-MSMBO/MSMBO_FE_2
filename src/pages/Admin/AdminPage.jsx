import React, { useState } from "react";
import {
    NavLink,
    Route,
    Switch,
    useRouteMatch,
    useHistory,
} from "react-router-dom";
import "./AdminPage.css";
import UserManagement from "./UserManagement/UserManagement";
import MovieManagement from "./MovieManagement/MovieManagement";
import ShowtimeManagement from "./ShowtimeManagement/ShowtimeManagement";
import ViewProfile from "./ProfileManagement/ViewProfile";
import EditProfile from "./ProfileManagement/EditProfile";
import SeatManagement from "./SeatManagement/SeatManagement";
import { useLocalStorage } from "../../hook/useLocalStorage"; // ✅ thêm

const AdminPage = () => {
    const { path, url } = useRouteMatch();
    const history = useHistory();
    const [menuOpen, setMenuOpen] = useState(false);

    // ✅ Lấy thông tin user
    const [user, setUser] = useLocalStorage("user", null);

    const handleLogout = () => {
        setUser(null); // ✅ clear toàn bộ user
        history.push("/login");
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="sidebar-title">Manager Panel</h2>
                <nav className="sidebar-menu">
                    <NavLink to={`${url}/user-management`} activeClassName="active" className="sidebar-link">
                        Quản lý người dùng
                    </NavLink>
                    <NavLink to={`${url}/movie-management`} activeClassName="active" className="sidebar-link">
                        Quản lý phim
                    </NavLink>
                    <NavLink to={`${url}/seat-management`} activeClassName="active" className="sidebar-link">
                        Quản lý ghế
                    </NavLink>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Đăng xuất
                </button>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <h1>Hệ thống quản lí web</h1>

                    <div
                        className="admin-avatar-container"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Admin Avatar"
                            className="admin-avatar"
                        />
                        <span className="admin-name">{user?.userName || "Manager"}</span>

                        {menuOpen && (
                            <div className="dropdown-menu">
                                <NavLink to={`${url}/view-profile`}>👁 Xem hồ sơ</NavLink>
                                <NavLink to={`${url}/edit-profile`}>✏️ Chỉnh sửa</NavLink>
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="admin-content">
                    <Switch>
                        <Route exact path={path}>
                            <div className="welcome-text">
                                <h1>Chào mừng {user?.userName || "Manager"}</h1>
                                <p>Chọn chức năng trong menu bên trái để bắt đầu.</p>
                            </div>
                        </Route>
                        <Route path={`${path}/user-management`} component={UserManagement} />
                        <Route path={`${path}/movie-management`} component={MovieManagement} />
                        <Route path={`${path}/showtimes/:movieID`} component={ShowtimeManagement} />
                        <Route path={`${path}/seat-management`} component={SeatManagement} />
                        <Route path={`${path}/view-profile`} component={ViewProfile} />
                        <Route path={`${path}/edit-profile`} component={EditProfile} />
                    </Switch>
                </main>
            </div>
        </div>
    );
};

export default AdminPage;
