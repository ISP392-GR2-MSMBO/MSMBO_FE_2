import React, { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";

// ✅ Đổi tên CSS
import "./AdminProfile.css";

// ✅ Đổi tên component
const EditProfileAdmin = () => {
    const [storedUser] = useLocalStorage("user", null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        // ✅ Đổi ST → AD (Kiểm tra quyền Admin)
        if (!storedUser || storedUser.roleID !== "AD") {
            messageApi.error("Bạn không có quyền truy cập trang này!");
            setTimeout(() => window.location.href = "/", 500);
            return;
        }

        const fetchProfile = async () => {
            try {
                // ✅ Đổi role khi call API
                const data = await userApi.getUserByUsername(storedUser.userName, "AD");

                form.setFieldsValue({
                    fullName: data.fullName ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải thông tin Admin:", error);
                messageApi.error("Không thể tải thông tin quản trị!");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [storedUser, form, messageApi]);

    const handleSubmit = async (values) => {
        try {
            // ✅ Lấy lại thông tin để lấy userID
            const currentProfile = await userApi.getUserByUsername(storedUser.userName, "AD");
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) throw new Error("Không tìm thấy ID Admin để cập nhật!");

            await userApi.updateUser(currentUserId, values);
            messageApi.success("✅ Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message);
            const apiError = error.response?.data?.message || "Lỗi không xác định.";
            messageApi.error(`❌ Cập nhật thất bại. ${apiError}`);
        }
    };

    if (loading) return <p className="loading-admin">⏳ Đang tải thông tin...</p>;

    return (
        <div className="profile-container-admin">
            {contextHolder}
            <h2>⚙️ Chỉnh sửa thông tin Quản trị</h2>

            <Form form={form} layout="vertical" onFinish={handleSubmit} className="profile-form-admin">
                <Form.Item label="Họ và tên" name="fullName">
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[
                    { type: "email", message: "Email không hợp lệ" }
                ]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone" rules={[
                    { pattern: /^[0-9]{10,}$/, message: "SĐT phải chứa ít nhất 10 chữ số." }
                ]}>
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProfileAdmin;
