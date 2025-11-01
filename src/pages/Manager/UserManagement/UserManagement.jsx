import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
// ✅ Import từ Ant Design
import { message, Spin, Button, Modal } from "antd";
import { userApi } from "../../../api/userApi";
import "./UserManagement.css";

// Sử dụng Modal.confirm cho hàm xóa
const { confirm } = Modal;

// Hàm ánh xạ lỗi từ backend sang tiếng Việt dễ hiểu
const mapBackendError = (error) => {
    // Kiểm tra xem lỗi có phải là lỗi API có cấu trúc cụ thể không
    if (error && error.response && error.response.data && error.response.data.code) {
        const errorCode = error.response.data.code;
        switch (errorCode) {
            case 1003:
                return "Tên đăng nhập đã tồn tại";
            case 1010:
                return "Email đã tồn tại";
            case 1011:
                return "Số điện thoại đã tồn tại";
            case 1012:
                return "Người dùng không tồn tại";
            default:
                // Trả về tin nhắn lỗi từ backend nếu có, nếu không thì dùng thông báo chung
                return error.response.data.message || "Lỗi không xác định từ máy chủ.";
        }
    }
    // Lỗi không phải từ API có cấu trúc errorCode
    return "Lỗi kết nối hoặc lỗi hệ thống. Vui lòng thử lại.";
};

const UserManagement = () => {
    const history = useHistory();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewRole, setViewRole] = useState("AD");
    const [editingId, setEditingId] = useState(null);
    const [editedUser, setEditedUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        roleID: "",
    });

    const [showAddPopup, setShowAddPopup] = useState(false);
    const [newUser, setNewUser] = useState({
        userName: "",
        fullName: "",
        password: "",
        email: "",
        phone: "",
        roleID: "AD",
        status: true,
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [editingErrors, setEditingErrors] = useState({});

    // ✅ Ant Design message hook
    const [messageApi, contextHolder] = message.useMessage();

    // --------------------------------------------------------
    // HÀM VALIDATION CHUNG
    // --------------------------------------------------------
    const validateUser = (user, isEditing = false) => {
        const errors = {};

        // @NotBlank checks
        if (!isEditing && !user.userName.trim()) errors.userName = "Tên đăng nhập khong được để trống";
        if (!user.fullName.trim()) errors.fullName = "Họ tên không được để trống";
        if (!isEditing && !user.password) errors.password = "Mật khẩu không được để trống";
        if (!user.email.trim()) errors.email = "Email không được để trống";
        if (!user.phone.trim()) errors.phone = "Số điện thoại không được để trống";

        // @Email check
        if (user.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.email = "Email không đúng định dạng";
        }

        // @Pattern(regexp = "^0[0-9]{9}$") check
        if (user.phone.trim() && !/^0[0-9]{9}$/.test(user.phone)) {
            errors.phone = "Số điện thoại phải có chính xác 10 chữ số và bắt đầu bằng số 0";
        }

        return errors;
    };


    // 🔹 Lấy danh sách user (ĐÃ BAO BỌC BẰNG USECALLBACK)
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            // Sử dụng mapBackendError để hiển thị thông báo lỗi chi tiết hơn nếu cần
            messageApi.error(mapBackendError(error));
        } finally {
            setLoading(false);
        }
    }, [setLoading, setUsers, messageApi]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 🔹 Tạo user mới
    const handleCreateUser = async () => {
        const errors = validateUser(newUser, false);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            messageApi.warning(`Lỗi: ${firstError}`);
            return;
        }

        try {
            await userApi.createUser(newUser);
            messageApi.success("Tạo người dùng thành công!");
            setShowAddPopup(false);
            setNewUser({ userName: "", fullName: "", password: "", email: "", phone: "", roleID: "AD", status: true });
            fetchUsers();
        } catch (error) {
            console.error(error);
            // ✅ Xử lý lỗi trùng lặp từ BE
            const errorMessage = mapBackendError(error);
            messageApi.error(`Tạo người dùng thất bại: ${errorMessage}`);
        }
    };

    // 🔹 Cập nhật state cho newUser (popup tạo)
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: '' });
        }
    };

    // 🔹 Cập nhật state cho editedUser (inline sửa)
    const handleEditedUserChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
        if (editingErrors[name]) {
            setEditingErrors({ ...editingErrors, [name]: '' });
        }
    };


    // 🔹 Sửa user
    const handleEdit = (user) => {
        setEditingId(user.userID);
        setEditingErrors({});
        setEditedUser({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            roleID: user.roleID || "",
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingErrors({});
        setEditedUser({ fullName: "", email: "", phone: "", roleID: "" });
    };

    // 🔹 Lưu người dùng đã sửa
    const handleSave = async (id) => {

        const errors = validateUser(editedUser, true);
        setEditingErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            messageApi.warning(`Lỗi validation khi lưu: ${firstError}`);
            return;
        }

        try {
            const originalUser = users.find(u => u.userID === id);

            // Cập nhật vai trò trước nếu có thay đổi
            if (originalUser.roleID !== editedUser.roleID) {
                await userApi.updateUserRole(id, editedUser.roleID);
                messageApi.success("Cập nhật vai trò thành công!");
            }

            const updatedUser = {
                fullName: editedUser.fullName,
                email: editedUser.email,
                phone: editedUser.phone,
            };

            // Cập nhật thông tin cơ bản
            await userApi.updateUser(id, updatedUser);

            messageApi.success("Cập nhật thông tin thành công!");
            fetchUsers();
            setEditingId(null);
            setEditingErrors({});
        } catch (error) {
            console.error(error);
            // ✅ Xử lý lỗi trùng lặp từ BE
            const errorMessage = mapBackendError(error);
            messageApi.error(`Cập nhật thất bại: ${errorMessage}`);
        }
    };

    const handleDelete = (id) => {
        confirm({
            title: 'Xác nhận xóa người dùng',
            content: 'Bạn có chắc muốn xóa người dùng này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await userApi.deleteUser(id);
                    messageApi.success("Xóa thành công");
                    setUsers(users.filter((u) => u.userID !== id));
                } catch (error) {
                    console.error(error);
                    messageApi.error("Xóa thất bại");
                }
            },
        });
    };

    // 🔹 Lọc người dùng theo role
    const filteredUsers =
        users && users.length > 0
            ? users.filter((u) => {
                if (viewRole === "AD") return u.roleID === "AD" || u.roleID === "MA";
                if (viewRole === "CUS") return u.roleID === "CUS";
                if (viewRole === "ST") return u.roleID === "ST";
                return true;
            })
            : [];

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Spin tip="Đang tải..." size="large" /></div>;
    }

    // Hàm để lấy style lỗi cho input (Cho Popup Tạo)
    const getErrorStyle = (fieldName) => ({
        borderColor: validationErrors[fieldName] ? 'red' : '',
    });

    // Hàm để lấy style lỗi cho input (Cho Inline Sửa)
    const getEditingErrorStyle = (fieldName) => ({
        borderColor: editingErrors[fieldName] ? 'red' : '',
        width: '100%',
    });

    const getErrorMessage = (errors, fieldName) => (
        errors[fieldName] && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{errors[fieldName]}</p>
    );

    return (
        <div className="user-management-container">
            {contextHolder}
            <h2> Quản lý người dùng</h2>

            {/* Thanh chọn nhóm người dùng */}
            <div className="role-switch">
                <Button
                    type={viewRole === "AD" ? "primary" : "default"}
                    onClick={() => setViewRole("AD")}
                    style={{ marginRight: 8 }}
                >
                    Admin & Manager
                </Button>
                <Button
                    type={viewRole === "CUS" ? "primary" : "default"}
                    onClick={() => setViewRole("CUS")}
                    style={{ marginRight: 8 }}
                >
                    Khách hàng
                </Button>
                <Button
                    type={viewRole === "ST" ? "primary" : "default"}
                    onClick={() => setViewRole("ST")}
                >
                    Nhân viên
                </Button>
            </div>

            {/* Tìm kiếm & Tạo mới */}
            <div className="action-bar">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên đăng nhập..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <Button type="primary" className="add-btn" onClick={() => {
                    setShowAddPopup(true);
                    setValidationErrors({});
                    setNewUser({ userName: "", fullName: "", password: "", email: "", phone: "", roleID: "AD", status: true });
                }}>
                    ➕ Tạo người dùng
                </Button>
            </div>

            {/* Bảng user */}
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Vai trò</th>
                        {(viewRole === "AD" || viewRole === "ST") && <th>Hành động</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers
                        .filter((u) => u.userName?.toLowerCase().includes(search.toLowerCase()))
                        .map((user) => (
                            <tr key={user.userID}>
                                <td>{user.userID}</td>
                                <td>{user.userName}</td>

                                {/* Họ tên */}
                                <td>
                                    {editingId === user.userID ? (
                                        <>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={editedUser.fullName}
                                                onChange={handleEditedUserChange}
                                                style={getEditingErrorStyle('fullName')}
                                            />
                                            {getErrorMessage(editingErrors, 'fullName')}
                                        </>
                                    ) : (
                                        user.fullName
                                    )}
                                </td>

                                {/* Email */}
                                <td>
                                    {editingId === user.userID ? (
                                        <>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editedUser.email}
                                                onChange={handleEditedUserChange}
                                                style={getEditingErrorStyle('email')}
                                            />
                                            {getErrorMessage(editingErrors, 'email')}
                                        </>
                                    ) : (
                                        user.email
                                    )}
                                </td>

                                {/* SĐT */}
                                <td>
                                    {editingId === user.userID ? (
                                        <>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={editedUser.phone}
                                                onChange={handleEditedUserChange}
                                                style={getEditingErrorStyle('phone')}
                                            />
                                            {getErrorMessage(editingErrors, 'phone')}
                                        </>
                                    ) : (
                                        user.phone
                                    )}
                                </td>

                                {/* Vai trò */}
                                <td>
                                    {editingId === user.userID ? (
                                        <select
                                            name="roleID"
                                            value={editedUser.roleID}
                                            onChange={(e) =>
                                                setEditedUser({ ...editedUser, roleID: e.target.value })
                                            }
                                        >
                                            <option value="AD">Admin</option>
                                            <option value="MA">Manager</option>
                                            <option value="ST">Staff</option>
                                        </select>
                                    ) : (
                                        user.roleID
                                    )}
                                </td>

                                {/* Hành động */}
                                {(viewRole === "AD" || viewRole === "ST") && (
                                    <td>
                                        {editingId === user.userID ? (
                                            <>
                                                <button className="save-btn" onClick={() => handleSave(user.userID)}>
                                                    💾 Lưu
                                                </button>
                                                <button className="cancel-btn" onClick={handleCancelEdit}>
                                                    ❌ Hủy
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="edit-btn" onClick={() => handleEdit(user)}>
                                                    ✏️ Sửa
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(user.userID)}>
                                                    🗑️ Xóa
                                                </button>
                                            </>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                </tbody>
            </table>

            <button className="back-btn" onClick={() => history.goBack()}>
                🔙 Quay lại
            </button>

            {/* Popup tạo user */}
            {showAddPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Tạo người dùng mới</h3>
                        {/* Tên đăng nhập */}
                        <label>
                            Tên đăng nhập:
                            <input
                                type="text"
                                name="userName"
                                value={newUser.userName}
                                onChange={handleNewUserChange}
                                style={getErrorStyle('userName')}
                            />
                            {getErrorMessage(validationErrors, 'userName')}
                        </label>
                        {/* Mật khẩu */}
                        <label>
                            Mật khẩu:
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleNewUserChange}
                                style={getErrorStyle('password')}
                            />
                            {getErrorMessage(validationErrors, 'password')}
                        </label>
                        {/* Họ tên */}
                        <label>
                            Họ tên:
                            <input
                                type="text"
                                name="fullName"
                                value={newUser.fullName}
                                onChange={handleNewUserChange}
                                style={getErrorStyle('fullName')}
                            />
                            {getErrorMessage(validationErrors, 'fullName')}
                        </label>
                        {/* Email */}
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleNewUserChange}
                                style={getErrorStyle('email')}
                            />
                            {getErrorMessage(validationErrors, 'email')}
                        </label>
                        {/* SĐT */}
                        <label>
                            SĐT:
                            <input
                                type="text"
                                name="phone"
                                value={newUser.phone}
                                onChange={handleNewUserChange}
                                style={getErrorStyle('phone')}
                            />
                            {getErrorMessage(validationErrors, 'phone')}
                        </label>
                        {/* Vai trò */}
                        <label>
                            Vai trò:
                            <select
                                name="roleID"
                                value={newUser.roleID}
                                onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value })}
                            >
                                <option value="AD">Admin</option>
                                <option value="MA">Manager</option>
                                <option value="ST">Staff</option>
                            </select>
                        </label>
                        <div className="popup-buttons">
                            <button onClick={handleCreateUser}>💾 Tạo</button>
                            <button onClick={() => { setShowAddPopup(false); setValidationErrors({}); }}>❌ Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;