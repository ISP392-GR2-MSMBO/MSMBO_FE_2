import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { userApi } from "../../../api/userApi";
import { useLocalStorage } from "../../../hook/useLocalStorage";
import "./EditProfileCustomer.css";

const EditProfileCustomer = () => {
    const history = useHistory();
    // Lấy thông tin người dùng từ Local Storage
    const [user, setUser] = useLocalStorage("user", null);

    // State chứa toàn bộ dữ liệu người dùng hiện tại (từ API)
    const [profileData, setProfileData] = useState(null);

    // State quản lý form input
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // HÀM FETCH CHUNG (SỬ DỤNG TRONG useEffect VÀ handleSubmit)
    const fetchProfileData = async () => {
        // Xác định role để dùng cho getUserByUsername
        const role = user.roleID === "MA" || user.roleID === "AD" ? user.roleID : "CUS";

        // Luôn gọi getUserByUsername để có dữ liệu chính xác và ID mới nhất
        const data = await userApi.getUserByUsername(user.userName, role);
        return data;
    }

    // 1. Tải thông tin người dùng hiện tại (Load Data)
    useEffect(() => {
        const loadInitialData = async () => {
            // Kiểm tra tối thiểu: user và userName
            if (!user || !user.userName) {
                setError("Vui lòng đăng nhập để chỉnh sửa hồ sơ.");
                setLoading(false);
                if (!user) history.push('/login');
                return;
            }

            try {
                setLoading(true);
                // Sử dụng hàm fetchProfileData để lấy data
                const data = await fetchProfileData();

                if (data) {
                    const initialData = {
                        fullName: data.fullName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                    };
                    setProfileData(data);
                    setFormData(initialData);

                    // Cập nhật localStorage nếu API trả về userID mới
                    if (data.userID && data.userID !== user.userID) {
                        setUser({ ...user, userID: data.userID });
                    }
                } else {
                    setError("Không tìm thấy thông tin hồ sơ.");
                }
            } catch (err) {
                console.error("❌ Lỗi khi tải thông tin hồ sơ:", err);
                setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        // user?.userName và user?.roleID là đủ để kiểm tra sự thay đổi của user
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userName, user?.roleID, history]);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Xử lý gửi form cập nhật (ĐÃ SỬA: Lấy ID HỢP LỆ VÀ MỚI NHẤT GIỐNG MANAGER)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.userName) {
            toast.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
            history.push('/login');
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // BƯỚC 1: Lấy lại thông tin mới nhất và ID chính xác (giống Manager)
            const currentProfile = await fetchProfileData();
            const currentUserId = currentProfile?.userID;

            if (!currentUserId) {
                throw new Error("Không tìm thấy ID người dùng để cập nhật!");
            }

            // Chuẩn bị dữ liệu gửi đi
            const updatePayload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
            };

            // BƯỚC 2: Gọi API cập nhật
            const result = await userApi.updateUser(currentUserId, updatePayload);

            // BƯỚC 3: Cập nhật Local Storage
            const updatedUser = {
                ...user,
                userID: currentUserId, // Đảm bảo userID được lưu
                fullName: result.fullName,
                email: result.email,
                phone: result.phone,
            };
            setUser(updatedUser);
            setProfileData(result);

            toast.success("✅ Cập nhật hồ sơ thành công!");
            history.push(`/profile/${currentUserId}`);

        } catch (err) {
            console.error("❌ Lỗi cập nhật:", err.response?.data || err.message);
            const apiError = err.response?.data?.message || err.message;
            toast.error(`❌ Cập nhật thất bại. ${apiError}`);
            setError(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p className="loading">⏳ Đang tải thông tin...</p>;

    return (
        <div className="customer-profile-container edit-mode">
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
                        <label htmlFor="fullName">Họ và tên</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="[0-9]{10,}"
                            title="Số điện thoại phải chứa ít nhất 10 chữ số."
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