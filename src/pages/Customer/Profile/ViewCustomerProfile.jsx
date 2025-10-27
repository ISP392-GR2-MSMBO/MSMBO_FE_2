import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./CustomerProfile.css";

const ViewCustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user] = useLocalStorage("user", null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user?.userName) {
                    setError("Không tìm thấy thông tin người dùng đăng nhập!");
                    setLoading(false);
                    return;
                }

                // 🔍 Xác định role tự động (MA hoặc CUS)
                const role = user?.roleID === "MA" ? "MA" : "CUS";
                console.log("📡 Gọi API lấy thông tin người dùng:", user.userName, " - role:", role);

                const data = await userApi.getUserByUsername(user.userName, role);

                console.log("📦 Dữ liệu trả về:", data);

                if (data) {
                    setProfile(data);
                } else {
                    setError("Không tìm thấy thông tin người dùng!");
                }
            } catch (err) {
                console.error("❌ Lỗi khi tải thông tin người dùng:", err);
                setError("Không thể tải thông tin người dùng!");
            } finally {
                setLoading(false);
            }
        };


        fetchProfile();
    }, [user]);

    if (loading) return <p className="loading">⏳ Đang tải thông tin...</p>;

    return (
        <div className="customer-profile-container">
            <h2>👤 Hồ sơ cá nhân</h2>

            {error ? (
                <p className="error">{error}</p>
            ) : profile ? (
                <div className="customer-profile-card">
                    <div className="avatar-section">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="avatar"
                            className="avatar"
                        />
                        <h3>{profile.fullName || profile.userName}</h3>
                        <span className="role-badge">
                            {profile.roleID === "MA" ? "Quản lý" : "Khách hàng"}
                        </span>
                    </div>

                    <div className="info-section">
                        <p><strong>Tên đăng nhập:</strong> {profile.userName || "Không có"}</p>
                        <p><strong>Họ và tên:</strong> {profile.fullName || "Chưa cập nhật"}</p>
                        <p><strong>Email:</strong> {profile.email || "Chưa cập nhật"}</p>
                        <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa cập nhật"}</p>
                    </div>
                </div>
            ) : (
                <p>❌ Không tìm thấy thông tin người dùng.</p>
            )}
        </div>
    );
};

export default ViewCustomerProfile;
