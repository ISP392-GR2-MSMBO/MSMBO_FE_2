import React, { useEffect, useState } from "react";
import { adminApi } from "../../../api/adminApi";
import { toast } from "react-toastify";
import "./Profile.css";

const EditProfile = () => {
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await adminApi.getProfile();
                setAdmin({
                    name: data.name || "",
                    email: data.email || "",
                    password: "",
                });
            } catch (error) {
                toast.error("Không thể tải thông tin admin");
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setAdmin({ ...admin, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminApi.updateProfile(admin);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Lỗi khi cập nhật thông tin!");
        }
    };

    return (
        <div className="profile-container">
            <h2>✏️ Chỉnh sửa thông tin Admin</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
                <label>Tên:</label>
                <input
                    type="text"
                    name="name"
                    value={admin.name}
                    onChange={handleChange}
                    required
                />

                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={admin.email}
                    onChange={handleChange}
                    required
                />

                <label>Mật khẩu (nếu muốn đổi):</label>
                <input
                    type="password"
                    name="password"
                    value={admin.password}
                    onChange={handleChange}
                />

                <button type="submit" className="save-btn">💾 Lưu thay đổi</button>
            </form>
        </div>
    );
};

export default EditProfile;
