import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { message } from "antd";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./EditProfileCustomer.css";

const EditProfileCustomer = () => {
    const history = useHistory();
    const [messageApi, contextHolder] = message.useMessage();

    const [user, setUser] = useLocalStorage("user", null);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // HÀM FETCH CHUNG
    const fetchProfileData = async () => {
        const role = user.roleID === "MA" || user.roleID === "AD" ? user.roleID : "CUS";
        const data = await userApi.getUserByUsername(user.userName, role);
        return data;
    }

    // 1. Tải thông tin người dùng hiện tại
    useEffect(() => {
        const loadInitialData = async () => {
            if (!user || !user.userName) {
                const loginError = "Vui lòng đăng nhập để chỉnh sửa hồ sơ.";
                setError(loginError);
                messageApi.error(loginError);
                setLoading(false);
                if (!user) history.push('/login');
                return;
            }

            try {
                setLoading(true);
                const data = await fetchProfileData();

                if (data) {
                    const initialData = {
                        fullName: data.fullName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                    };
                    setProfileData(data);
                    setFormData(initialData);

                    if (data.userID && data.userID !== user.userID) {
                        setUser({ ...user, userID: data.userID });
                    }
                } else {
                    setError("Không tìm thấy thông tin hồ sơ.");
                }
            } catch (err) {
                console.error("❌ Lỗi khi tải thông tin hồ sơ:", err);
                const genericError = "Không thể tải thông tin hồ sơ. Vui lòng thử lại.";
                messageApi.error(`❌ ${genericError}`);
                setError(genericError);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userName, user?.roleID, history, messageApi]);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Xử lý gửi form cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.userName) {
            messageApi.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
            history.push('/login');
            return;
        }

        // =======================================================
        // ✅ BƯỚC 1: THÊM VALIDATION FORM (Tiếng Việt)
        // =======================================================

        // 1. Kiểm tra Họ và tên
        if (!formData.fullName.trim()) {
            messageApi.warning("Họ và tên không được để trống.");
            return;
        }

        // 2. Kiểm tra Email
        if (!formData.email.trim()) {
            messageApi.warning("Email không được để trống.");
            return;
        }

        // 3. Kiểm tra định dạng Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            messageApi.warning("Email không hợp lệ.");
            return;
        }

        // 4. KIỂM TRA SỐ ĐIỆN THOẠI KHÔNG ĐƯỢC ĐỂ TRỐNG
        if (!formData.phone.trim()) {
            messageApi.warning("Số điện thoại không được để trống.");
            return;
        }

        // 5. Kiểm tra định dạng Số điện thoại (từ thuộc tính pattern trong input)
        const phoneRegex = /^[0-9]{10,}$/;
        if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
            messageApi.warning("Số điện thoại phải chứa ít nhất 10 chữ số.");
            return;
        }

        // =======================================================

        setIsSubmitting(true);
        setError("");
        let hideLoading = messageApi.loading('Đang lưu thay đổi...', 0);

        try {
            const currentProfile = await fetchProfileData();
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) {
                throw new Error("Không tìm thấy ID người dùng để cập nhật!");
            }

            const updatePayload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
            };

            const result = await userApi.updateUser(currentUserId, updatePayload);

            const updatedUser = {
                ...user,
                userID: currentUserId,
                fullName: result.fullName,
                email: result.email,
                phone: result.phone,
            };
            setUser(updatedUser);
            setProfileData(result);

            hideLoading();
            messageApi.success("✅ Cập nhật hồ sơ thành công!");
            history.push(`/profile/${currentUserId}`);

        } catch (err) {
            hideLoading();

            console.error("❌ Lỗi cập nhật:", err.response?.data || err.message);

            // Đảm bảo thông báo lỗi cuối cùng là Tiếng Việt
            const genericError = "Cập nhật thất bại. Vui lòng kiểm tra lại thông tin và thử lại.";
            messageApi.error(`❌ ${genericError}`);
            setError(genericError);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p className="loading">⏳ Đang tải thông tin...</p>;

    return (
        <div className="customer-profile-container edit-mode">
            {contextHolder}

            <h2>✏️ Chỉnh sửa Hồ sơ</h2>

            {error ? (
                <p className="error">{error}</p>
            ) : profileData ? (
                <form onSubmit={handleSubmit} className="customer-profile-form">
                    <div className="form-group">
                        <label>Tên đăng nhập (Không thể thay đổi)</label>
                        <input
                            type="text"
                            value={profileData.userName || ''}
                            disabled
                            className="disabled-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên <span className="required-star">*</span></label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email <span className="required-star">*</span></label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại <span className="required-star">*</span></label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        // Giữ lại pattern để tham khảo, nhưng JS validation đã thay thế chức năng này
                        // pattern="[0-9]{10,}" 
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => history.goBack()} disabled={isSubmitting} className="btn-cancel">
                            Hủy
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-save">
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            ) : (
                <p>❌ Không tìm thấy thông tin người dùng.</p>
            )}
        </div>
    );
};

export default EditProfileCustomer;