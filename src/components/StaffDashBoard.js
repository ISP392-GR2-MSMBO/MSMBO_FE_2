import "../css/StaffDashBoard.css";

import { useState } from "react";
import ReviewMovie from "./ReviewMovie";
import ThreatherReport from "./ThreatherReport";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import CustomerSupport from "./CustomerSupport";

const StaffDashBoard = () => {
	const [selectedMenu, setSelectedMenu] = useState("home");
	const history = useHistory()
	const handleLogout = () => {
		history.push("/login")
	}
	return (
		<div className="staff-dashboard">
			<aside className="sidebar">
				<h2>Staff Dashboard</h2>
				<ul>
					<li style={{cursor: 'pointer'}} onClick={() => setSelectedMenu("review")}>Review phim</li>
					<li style={{cursor: 'pointer'}} onClick={() => setSelectedMenu("lichchieu")}>Quản lý lịch chiếu</li>
					<li style={{cursor: 'pointer'}} onClick={() => setSelectedMenu("baocao")}>Báo cáo sự cố rạp</li>
					<li style={{cursor: 'pointer'}} onClick={() => setSelectedMenu("chamsoc")}>Chăm sóc khách hàng</li>
					<li style={{cursor: 'pointer'}} onClick={handleLogout}>Đăng xuất</li>
				</ul>
			</aside>
			<main className="main-content">
				<header>
					<h1>Chào mừng nhân viên!</h1>
				</header>
				<section className="dashboard-content">
					{selectedMenu === "review" && <ReviewMovie />}
					{selectedMenu === "lichchieu" }
					{selectedMenu === "baocao" && <ThreatherReport />}
					{selectedMenu === "chamsoc" && <CustomerSupport />}
					{selectedMenu === "logout"}
					{selectedMenu !== "review" && <p>Chọn chức năng ở menu bên trái để bắt đầu quản lý.</p>}
				</section>
			</main>
		</div>
	);
};

export default StaffDashBoard;

