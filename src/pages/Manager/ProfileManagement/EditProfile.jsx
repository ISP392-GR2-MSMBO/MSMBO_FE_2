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
            const currentProfile = await userApi.getUserByUsername(storedUser.userName, "MA");
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) {
                throw new Error("Không tìm thấy ID người dùng để cập nhật!");
            }

            await userApi.updateUser(currentUserId, values);


            messageApi.success(" Đã lưu thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message);

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