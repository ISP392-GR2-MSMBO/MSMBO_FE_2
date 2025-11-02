import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./ProfileStaff.css"; // ✅ Đổi tên file CSS

// ✅ Đổi tên component thành ViewProfileStaff
const ViewProfileStaff = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Giả định 'user' trong localStorage chứa thông tin đăng nhập của Staff
    const [user] = useLocalStorage("user", null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user?.userName) {
                    setError("Không tìm thấy thông tin đăng nhập của nhân viên!");
                    setLoading(false);
                    return;
                }

                console.log("🔍 Gọi API lấy thông tin theo username:", user.userName);
                // Giả định: 'ST' là mã role cho Staff. 
                // Nếu API của bạn cần mã role cụ thể (như 'MA' cho Manager), bạn cần thay đổi tham số thứ 2 ở đây.
                // Tôi dùng 'ST' cho Staff, bạn có thể thay đổi tùy ý.
                const data = await userApi.getUserByUsername(user.userName, "ST");

                console.log("📦 Kết quả từ API:", data);

                if (data) {
                    setProfile(data);
                } else {
                    setError("Không tìm thấy thông tin nhân viên!");
                }
            } catch (err) {
                console.error("❌ Lỗi khi lấy thông tin nhân viên:", err);
                setError("Không thể tải thông tin nhân viên!");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) return <p className="loading-staff">Đang tải thông tin nhân viên...</p>;

    return (
        // ✅ Đổi tên class container thành profile-container-staff
        <div className="profile-container-staff">
            <h2>👤 Thông tin Nhân Viên</h2>

            {error ? (
                // ✅ Đổi tên class error thành error-staff
                <p className="error-staff">{error}</p>
            ) : profile ? (
                // ✅ Đổi tên class card thành profile-card-staff
                <div className="profile-card-staff">
                    <p><strong>ID:</strong> {profile.userID || "Không có"}</p>
                    <p><strong>Tên đăng nhập:</strong> {profile.userName || "Không có"}</p>
                    <p><strong>Họ tên:</strong> {profile.fullName || "Chưa có"}</p>
                    <p><strong>Email:</strong> {profile.email || "Chưa có"}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phone || "Chưa có"}</p>
                    <p><strong>Vai trò:</strong> {profile.roleID || "Không xác định"}</p>
                    {/* Thêm các trường thông tin khác nếu cần */}
                </div>
            ) : (
                <p>❌ Không tìm thấy thông tin nhân viên.</p>
            )}
        </div>
    );
};

// ✅ Export component mới
export default ViewProfileStaff;