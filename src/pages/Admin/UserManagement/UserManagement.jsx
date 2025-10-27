import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { userApi } from "../../../api/userApi";
import "react-toastify/dist/ReactToastify.css";
import "./UserManagement.css";

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

    // 🔹 Lấy danh sách user
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 🔹 Tạo user mới
    const handleCreateUser = async () => {
        try {
            if (!newUser.userName || !newUser.fullName || !newUser.password || !newUser.roleID) {
                toast.error("Vui lòng điền đầy đủ thông tin");
                return;
            }
            await userApi.createUser(newUser);
            toast.success("Tạo người dùng thành công!");
            setShowAddPopup(false);
            setNewUser({ userName: "", fullName: "", password: "", email: "", phone: "", roleID: "AD", status: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("Tạo người dùng thất bại");
        }
    };

    // 🔹 Sửa user
    const handleEdit = (user) => {
        setEditingId(user.userID);
        setEditedUser({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            roleID: user.roleID || "",
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedUser({ fullName: "", email: "", phone: "", roleID: "" });
    };

    const handleSave = async (id) => {
        try {
            const originalUser = users.find(u => u.userID === id);

            // Nếu role thay đổi, gọi API updateUserRole
            if (originalUser.roleID !== editedUser.roleID) {
                await userApi.updateUserRole(id, editedUser.roleID);
                toast.success("Cập nhật vai trò thành công!");
            }

            // Cập nhật các thông tin còn lại
            const updatedUser = {
                fullName: editedUser.fullName,
                email: editedUser.email,
                phone: editedUser.phone,
            };
            await userApi.updateUser(id, updatedUser);
            toast.success("Cập nhật thông tin thành công!");
            fetchUsers();
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
        try {
            await userApi.deleteUser(id);
            toast.success("Xóa thành công");
            setUsers(users.filter((u) => u.userID !== id));
        } catch (error) {
            console.error(error);
            toast.error("Xóa thất bại");
        }
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
        return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;
    }

    return (
        <div className="user-management-container">
            <h2>👤 Quản lý người dùng</h2>

            {/* Thanh chọn nhóm người dùng */}
            <div className="role-switch">
                <button className={viewRole === "AD" ? "active" : ""} onClick={() => setViewRole("AD")}>
                    Admin & Manager
                </button>
                <button className={viewRole === "CUS" ? "active" : ""} onClick={() => setViewRole("CUS")}>
                    Khách hàng
                </button>
                <button className={viewRole === "ST" ? "active" : ""} onClick={() => setViewRole("ST")}>
                    Nhân viên
                </button>
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
                <button className="add-btn" onClick={() => setShowAddPopup(true)}>
                    ➕ Tạo người dùng
                </button>
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
                                <td>
                                    {editingId === user.userID ? (
                                        <input
                                            type="text"
                                            value={editedUser.fullName}
                                            onChange={(e) =>
                                                setEditedUser({ ...editedUser, fullName: e.target.value })
                                            }
                                        />
                                    ) : (
                                        user.fullName
                                    )}
                                </td>
                                <td>
                                    {editingId === user.userID ? (
                                        <input
                                            type="email"
                                            value={editedUser.email}
                                            onChange={(e) =>
                                                setEditedUser({ ...editedUser, email: e.target.value })
                                            }
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>
                                    {editingId === user.userID ? (
                                        <input
                                            type="text"
                                            value={editedUser.phone}
                                            onChange={(e) =>
                                                setEditedUser({ ...editedUser, phone: e.target.value })
                                            }
                                        />
                                    ) : (
                                        user.phone
                                    )}
                                </td>
                                <td>
                                    {editingId === user.userID ? (
                                        <select
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
                        <label>
                            Tên đăng nhập:
                            <input
                                type="text"
                                value={newUser.userName}
                                onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                            />
                        </label>
                        <label>
                            Mật khẩu:
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </label>
                        <label>
                            Họ tên:
                            <input
                                type="text"
                                value={newUser.fullName}
                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </label>
                        <label>
                            SĐT:
                            <input
                                type="text"
                                value={newUser.phone}
                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            />
                        </label>
                        <label>
                            Vai trò:
                            <select
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
                            <button onClick={() => setShowAddPopup(false)}>❌ Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
