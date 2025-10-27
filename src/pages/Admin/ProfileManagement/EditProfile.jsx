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
            window.location.href = "/";
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
                messageApi.error("Không thể tải thông tin người dùng!");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [storedUser, form, messageApi]);

    const handleSubmit = async (values) => {
        try {
            const data = await userApi.getUserByUsername(storedUser.userName, "MA");
            await userApi.updateUser(data.userID, values);
            messageApi.success("Đã lưu thành công!");
        } catch (error) {
            messageApi.error("Lỗi khi cập nhật thông tin!");
            console.error(error);
        }
    };

    if (loading) return <p className="loading">Đang tải thông tin...</p>;

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
                    rules={[{ message: "Vui lòng nhập số điện thoại" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        💾 Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProfile;
