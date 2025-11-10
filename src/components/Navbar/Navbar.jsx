import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { movieApi } from "../../api/movieApi";
import { useLocalStorage } from "../../hook/useLocalStorage";
import "../../index.css";

const Navbar = () => {
    const history = useHistory();
    const [allMovies, setAllMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // ✅ Theo dõi realtime user
    const [user, setUser] = useLocalStorage("user", null);

    // ✅ Lấy danh sách phim đang chiếu
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const data = await movieApi.getNowShowing();
                const approvedMovies = data.filter(
                    (m) =>
                        m &&
                        m.approveStatus?.toUpperCase() === "APPROVE" &&
                        m.deleted !== true
                );
                setAllMovies(approvedMovies);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách phim:", err);
            }
        };
        fetchMovies();
    }, []);

    // ✅ Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".user-info") && !e.target.closest(".search-results")) {
                setShowUserMenu(false);
                setShowResults(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // ✅ Tìm kiếm phim
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === "") {
            setFilteredMovies([]);
            setShowResults(false);
            return;
        }

        const results = allMovies.filter((movie) =>
            movie.movieName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredMovies(results);
        setShowResults(true);
    };

    const handleSelectMovie = (movieName) => {
        setSearchTerm("");
        setShowResults(false);
        history.push(`/movies/${encodeURIComponent(movieName)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && filteredMovies.length > 0) {
            handleSelectMovie(filteredMovies[0].movieName);
        }
    };

    // ✅ Đăng xuất
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userID");
        history.push("/");
    };

    // ✅ Xem hồ sơ
    const handleViewProfile = () => {
        if (user && user.userID) {
            history.push(`/profile/${user.userID}`);
        } else {
            history.push("/profile");
        }
        setShowUserMenu(false);
    };

    const handleViewHistory = () => {
        history.push("/booking");
        setShowUserMenu(false);
    };

    const handleManagerPanel = () => {
        history.push("/manager");
        setShowUserMenu(false);
    };
    const handleAdminPanel = () => {
        history.push("/admin");
        setShowUserMenu(false);
    };

    const handleStaffPanel = () => {
        history.push("/staff");
        setShowUserMenu(false);
    };
    // ✅ Lời chào
    const renderGreeting = () => {
        if (!user || !user.roleID || !user.userName) return null;
        if (user.roleID === "MA") {
            return "Xin chào, Manager";
        }
        if (user.roleID === "AD") {
            return "Xin chào, Admin";
        }
        if (user.roleID === "ST") {
            return "Xin chào, Staff";
        }
        return `Xin chào, ${user.userName}`;
    };

    const isManager = user && user.roleID === "MA";
    const isAdmin = user && user.roleID === "AD";
    const isStaff = user && user.roleID === "ST";
    return (
        <header className="navbar">
            {/* Logo + Thanh tìm kiếm */}
            <div
                className="logo-bar"
                style={{ display: "flex", alignItems: "center", padding: "10px 20px" }}
            >
                <div className="logo" style={{ flexShrink: 0 }}>
                    <Link to="/">
                        <img
                            src="https://res.cloudinary.com/dmprbuogr/image/upload/v1762684724/Chill_Cinema_Logo_Design_-_Vibrant_Red-removebg-preview_uj1stm.png"
                            alt="Chill Cinema Logo"
                            style={{ maxWidth: "180px" }}
                        />
                    </Link>
                </div>

                {/* Ô tìm kiếm */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        maxWidth: "550px",
                        margin: "0 auto",
                        position: "relative",
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Tìm phim đang chiếu..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setShowResults(true)}
                        onKeyDown={handleKeyDown}
                        style={{
                            color: "black",
                            background: "white",
                            border: "1px solid #e50914",
                            borderRadius: "6px",
                            padding: "10px 15px",
                            flexGrow: 1,
                            outline: "none",
                            height: "45px",
                        }}
                    />
                    <button
                        onClick={() => {
                            if (filteredMovies.length > 0) {
                                handleSelectMovie(filteredMovies[0].movieName);
                            }
                        }}
                        style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#e50914",
                            color: "white",
                            cursor: "pointer",
                            marginLeft: "8px",
                            flexShrink: 0,
                            height: "45px",
                        }}
                    >
                        Tìm
                    </button>

                    {/* Gợi ý phim */}
                    {showResults && filteredMovies.length > 0 && (
                        <ul
                            className="search-results"
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "calc(100% + 58px)",
                                background: "#fff",
                                border: "1px solid #ccc",
                                borderTop: "none",
                                zIndex: 10,
                                maxHeight: "260px",
                                overflowY: "auto",
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                color: "black",
                            }}
                        >
                            {filteredMovies.map((movie) => (
                                <li
                                    key={movie.movieID}
                                    style={{
                                        padding: "8px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    onClick={() => handleSelectMovie(movie.movieName)}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <img
                                        src={movie.poster || "/default-poster.jpg"}
                                        alt={movie.movieName}
                                        style={{
                                            width: "35px",
                                            height: "50px",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                        }}
                                    />
                                    <span>{movie.movieName}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {showResults && filteredMovies.length === 0 && searchTerm.trim() !== "" && (
                        <ul
                            className="search-results"
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "calc(100% + 58px)",
                                background: "white",
                                border: "1px solid #ccc",
                                zIndex: 10,
                                padding: "8px 12px",
                                margin: 0,
                                color: "black",
                            }}
                        >
                            <li>Không tìm thấy phim phù hợp</li>
                        </ul>
                    )}
                </div>

                {/* Khu vực đăng nhập / đăng ký */}
                <div className="top-bar" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="auth">
                        {user && user.roleID && user.userName ? (
                            <div className="user-info" style={{ position: "relative" }}>
                                <div
                                    onClick={() => setShowUserMenu((prev) => !prev)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                >
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                        alt="avatar"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    />
                                    <span style={{ fontWeight: 1000, fontSize: "21px", color: "white" }}>
                                        {renderGreeting()}
                                    </span>
                                </div>

                                {showUserMenu && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "120%",
                                            right: 0,
                                            background: "white",
                                            border: "1px solid #ddd",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                            minWidth: "180px",
                                            zIndex: 100,
                                            padding: "8px 0",
                                        }}
                                    >
                                        <button onClick={handleViewProfile} className="dropdown-btn">
                                            👁 Xem hồ sơ
                                        </button>

                                        <button onClick={() => history.push("/edit-profile")} className="dropdown-btn">
                                            ✏️ Chỉnh sửa
                                        </button>

                                        <button onClick={handleViewHistory} className="dropdown-btn">
                                            📜 Lịch sử Giao dịch
                                        </button>
                                        {/* Kiểm tra nếu bất kỳ vai trò đặc biệt nào được kích hoạt */}
                                        {(isManager || isAdmin || isStaff) && (
                                            <>
                                                {/* Chỉ một lần phân cách */}
                                                <hr className="dropdown-divider" />

                                                {isAdmin && (
                                                    <button onClick={handleAdminPanel} className="dropdown-btn">
                                                        Admin Panel
                                                    </button>
                                                )}

                                                {isManager && (
                                                    <button onClick={handleManagerPanel} className="dropdown-btn">
                                                        🔑 Manager Panel
                                                    </button>
                                                )}

                                                {isStaff && (
                                                    <button onClick={handleStaffPanel} className="dropdown-btn">
                                                        💼 Staff Panel
                                                    </button>
                                                )}
                                            </>
                                        )}


                                        <hr className="dropdown-divider" />

                                        <button onClick={handleLogout} className="dropdown-btn">
                                            🚪 Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/register" style={{ color: "#fff", marginLeft: "10px" }}>
                                    Đăng ký
                                </Link>
                                <Link to="/login" style={{ color: "#fff", marginLeft: "10px" }}>
                                    Đăng nhập
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu chính */}
            <nav className="menu" style={{ textAlign: "center", marginTop: "10px" }}>
                <Link to="/">Trang chủ</Link>
                <div className="dropdown">
                    <Link to="/phim">Phim ▾</Link>
                    <div className="dropdown-content">
                        <Link to="/phim/dang-chieu">Đang chiếu</Link>
                        <Link to="/phim-sap-chieu">Sắp chiếu</Link>
                    </div>
                </div>
                <Link to="/lich-chieu">Lịch chiếu</Link>
                <Link to="/gia-ve">Giá vé</Link>
                <Link to="/uu-dai">Ưu đãi</Link>
                <Link to="/lien-he">Liên hệ</Link>
            </nav>
        </header>
    );
};

export default Navbar;
