import React, { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./Profile.css";

const EditProfile = () => {
    const [storedUser] = useLocalStorage("user", null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (!storedUser || storedUser.roleID !== "MA") {
            messageApi.error("Bạn không có quyền truy cập trang này!");
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
            return;
        }

        const fetchProfile = async () => {
            try {
                // Lấy thông tin user hiện tại (để lấy userID mới nhất nếu cần)
                const data = await userApi.getUserByUsername(storedUser.userName, "MA");

                form.setFieldsValue({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải thông tin Manager:", error);
                messageApi.error("Không thể tải thông tin người dùng!");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [storedUser, form, messageApi]);

    const handleSubmit = async (values) => {
        try {
            // BƯỚC 1: Lấy lại thông tin mới nhất và ID chính xác (giống logic Customer)
            const currentProfile = await userApi.getUserByUsername(storedUser.userName, "MA");
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) {
                // Nếu không lấy được ID, ném lỗi để bắt ở catch
                throw new Error("Không tìm thấy ID người dùng để cập nhật!");
            }

            // BƯỚC 2: Gọi API cập nhật
            await userApi.updateUser(currentUserId, values);

            // BƯỚC 3: Cập nhật lại localStorage nếu cần (tùy chọn)

            messageApi.success(" Đã lưu thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message);

            // ✅ Bắt lỗi chi tiết từ API response và hiển thị bằng messageApi
            const apiError = error.response?.data?.message || "Lỗi không xác định khi cập nhật.";
            messageApi.error(`Cập nhật thất bại. ${apiError}`);
        }
    };

    if (loading) return <p className="loading">⏳ Đang tải thông tin...</p>;

    return (
        <div className="profile-container">
            {contextHolder}
            <h2>✏️ Chỉnh sửa thông tin Manager</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="profile-form"
            >
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
                    // Thêm validation cơ bản cho SĐT
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

export default EditProfile;