import React, { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
// ✅ Đổi tên import CSS
import "./ProfileStaff.css";

// ✅ Đổi tên component
const EditProfileStaff = () => {
    const [storedUser] = useLocalStorage("user", null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        // ✅ Thay đổi logic kiểm tra role từ "MA" sang "ST" (Staff)
        if (!storedUser || storedUser.roleID !== "ST") {
            messageApi.error("Bạn không có quyền truy cập trang này!");
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
            return;
        }

        const fetchProfile = async () => {
            try {
                // ✅ Sử dụng roleID "ST" khi gọi API lấy thông tin Staff
                const data = await userApi.getUserByUsername(storedUser.userName, "ST");

                form.setFieldsValue({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải thông tin Nhân viên:", error);
                messageApi.error("Không thể tải thông tin nhân viên!");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [storedUser, form, messageApi]);

    const handleSubmit = async (values) => {
        try {
            // BƯỚC 1: Lấy lại thông tin mới nhất và ID chính xác
            // ✅ Sử dụng roleID "ST"
            const currentProfile = await userApi.getUserByUsername(storedUser.userName, "ST");
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) {
                throw new Error("Không tìm thấy ID nhân viên để cập nhật!");
            }

            // BƯỚC 2: Gọi API cập nhật
            await userApi.updateUser(currentUserId, values);

            messageApi.success(" Đã lưu thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message);

            const apiError = error.response?.data?.message || "Lỗi không xác định khi cập nhật.";
            messageApi.error(`Cập nhật thất bại. ${apiError}`);
        }
    };

    // ✅ Đổi tên class loading (nếu bạn sử dụng CSS riêng cho staff)
    if (loading) return <p className="loading-staff">⏳ Đang tải thông tin...</p>;

    return (
        // ✅ Đổi tên class container
        <div className="profile-container-staff">
            {contextHolder}
            {/* ✅ Đổi tiêu đề */}
            <h2>✏️ Chỉnh sửa thông tin Nhân viên</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                // ✅ Đổi tên class form
                className="profile-form-staff"
            >
                {/* Các Form.Item giữ nguyên cấu trúc vì dữ liệu cập nhật là chung */}
                <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ message: "Vui lòng nhập họ và tên" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                        { message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^[0-9]{10,}$/, message: "SĐT phải chứa ít nhất 10 chữ số." }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProfileStaff;