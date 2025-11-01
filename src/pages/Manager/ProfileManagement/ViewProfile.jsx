import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi"; // ✅ dùng đúng API
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./Profile.css";

const ViewProfile = () => {
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

                console.log("🔍 Gọi API lấy thông tin theo username:", user.userName);
                const data = await userApi.getUserByUsername(user.userName, "MA");

                console.log("📦 Kết quả từ API:", data);

                if (data) {
                    setProfile(data);
                } else {
                    setError("Không tìm thấy thông tin người dùng!");
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy thông tin người dùng:", err);
                setError("Không thể tải thông tin người dùng!");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) return <p className="loading">Đang tải thông tin...</p>;

    return (
        <div className="profile-container">
            <h2>👤 Thông tin Người Dùng</h2>

            {error ? (
                <p className="error">{error}</p>
            ) : profile ? (
                <div className="profile-card">
                    <p><strong>ID:</strong> {profile.userID || "Không có"}</p>
                    <p><strong>Tên đăng nhập:</strong> {profile.userName || "Không có"}</p>
                    <p><strong>Họ tên:</strong> {profile.fullName || "Chưa có"}</p>
                    <p><strong>Email:</strong> {profile.email || "Chưa có"}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa có"}</p>
                    <p><strong>Vai trò:</strong> {profile.roleID || "Không xác định"}</p>
                </div>
            ) : (
                <p>❌ Không tìm thấy thông tin người dùng.</p>
            )}
        </div>
    );
};

export default ViewProfile;
