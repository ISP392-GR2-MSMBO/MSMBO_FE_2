import React, { useEffect, useState } from "react";
import { adminApi } from "../../../api/adminApi";
import "./Profile.css";

const ViewProfile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log("🔍 Bắt đầu lấy thông tin người dùng...");

                const data = await adminApi.getProfile();
                console.log("📦 Dữ liệu người dùng nhận được:", data);

                if (!data) {
                    setErrorMsg("Không tìm thấy thông tin người dùng!");
                } else {
                    setAdmin(data);
                }
            } catch (error) {
                console.error("❌ Lỗi khi tải thông tin người dùng:", error);
                setErrorMsg("Không thể tải thông tin người dùng!");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p className="loading">Đang tải thông tin...</p>;

    return (
        <div className="profile-container">
            <h2>👤 Thông tin Người Dùng</h2>

            {errorMsg ? (
                <p className="error">{errorMsg}</p>
            ) : admin ? (
                <div className="profile-card">
                    <p><strong>ID:</strong> {admin.userID || "Không có"}</p>
                    <p><strong>Tên đăng nhập:</strong> {admin.userName || "Không có"}</p>
                    <p><strong>Họ tên:</strong> {admin.fullName || "Chưa có"}</p>
                    <p><strong>Email:</strong> {admin.email || "Chưa có"}</p>
                    <p><strong>Số điện thoại:</strong> {admin.phone || "Chưa có"}</p>
                    <p><strong>Vai trò:</strong> {admin.roleID || "Không xác định"}</p>
                    <p>
                        <strong>Trạng thái:</strong>{" "}
                        {admin.status ? "✅ Hoạt động" : "🚫 Bị khóa"}
                    </p>
                </div>
            ) : (
                <p>❌ Không tìm thấy thông tin người dùng.</p>
            )}
        </div>
    );
};

export default ViewProfile;
