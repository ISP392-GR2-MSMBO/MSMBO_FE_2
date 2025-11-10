import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./AdminProfile.css"; // ✅ Đổi file CSS

// ✅ Đổi tên component thành ViewProfileAdmin
const ViewProfileAdmin = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [user] = useLocalStorage("user", null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user?.userName) {
                    setError("Không tìm thấy thông tin đăng nhập của Admin!");
                    setLoading(false);
                    return;
                }

                console.log("🔍 Gọi API lấy thông tin theo username:", user.userName);

                // ✅ Với Admin → đổi role thành "AD"
                const data = await userApi.getUserByUsername(user.userName, "AD");

                console.log("📦 Kết quả API:", data);

                if (data) {
                    setProfile(data);
                } else {
                    setError("Không tìm thấy thông tin Admin!");
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy dữ liệu Admin:", err);
                setError("Không thể tải thông tin!");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) return <p className="loading-admin">Đang tải thông tin...</p>;

    return (
        <div className="profile-container-admin">
            <h2>👤 Thông tin Quản Trị</h2>

            {error ? (
                <p className="error-admin">{error}</p>
            ) : profile ? (
                <div className="profile-card-admin">
                    <p><strong>ID:</strong> {profile.userID || "Không có"}</p>
                    <p><strong>Tên đăng nhập:</strong> {profile.userName || "Không có"}</p>
                    <p><strong>Họ tên:</strong> {profile.fullName || "Chưa có"}</p>
                    <p><strong>Email:</strong> {profile.email || "Chưa có"}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa có"}</p>
                    <p><strong>Vai trò:</strong> {profile.roleID || "Không xác định"}</p>
                </div>
            ) : (
                <p>❌ Không tìm thấy thông tin Admin.</p>
            )}
        </div>
    );
};

export default ViewProfileAdmin;
