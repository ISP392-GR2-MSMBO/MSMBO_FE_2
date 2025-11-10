import React, { useEffect, useState } from "react";
import "./User.css";
import { userApi } from "../../api/userApi";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("customer");
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    useEffect(() => {
        if (activeTab === "customer") {
            setRoleFilter("ALL");
        }
    }, [activeTab]);

    const [newUser, setNewUser] = useState({
        userName: "",
        fullName: "",
        password: "",
        email: "",
        phone: "",
        roleID: "ST",
        status: true,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(""); // Đặt lại lỗi trước khi fetch
        try {
            const data = await userApi.getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Lỗi fetchUsers:", err);
            setError("Không thể tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userID) => {
        if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
            try {
                await userApi.deleteUser(userID);
                setUsers((prev) => prev.filter((u) => u.userID !== userID));
                alert("🗑️ Đã xóa người dùng!");
            } catch (err) {
                alert("❌ Không thể xóa người dùng!");
            }
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.userID);
        setEditData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
        });
    };

    const handleSave = async (id) => {
        try {
            const updatedData = {
                fullName: editData.fullName,
                email: editData.email,
                phone: editData.phone,
            };

            const updated = await userApi.updateUser(id, updatedData);
            const newItem = updated?.userID ? updated : { ...updatedData, userID: id };
            setUsers((prev) => prev.map((u) => (u.userID === id ? { ...u, ...newItem } : u)));
            setEditingId(null);
            alert("✅ Cập nhật thành công!");
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi khi cập nhật!");
        }
    };

    const handleAddUser = async () => {
        if (!newUser.fullName || !newUser.userName || !newUser.password || !newUser.email)
            return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");

        try {
            const created = await userApi.createUser(newUser);
            setUsers((prev) => [...prev, created]);
            setShowPopup(false);
            setNewUser({
                userName: "",
                fullName: "",
                password: "",
                email: "",
                phone: "",
                roleID: "ST",
                status: true,
            });
            alert("✅ Thêm người dùng thành công!");
        } catch (err) {
            console.error("Lỗi khi thêm người dùng:", err.response?.data || err);
            alert("❌ Không thể thêm người dùng!");
        }
    };

    // Lọc theo tên + role
    const filteredUsers = users.filter((u) => {
        const matchName = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === "ALL" || u.roleID === roleFilter;
        return matchName && matchRole;
    });

    const customerList = filteredUsers.filter((u) => u.roleID === "CUS");
    const staffList = filteredUsers.filter((u) =>
        ["AD", "ST", "MA"].includes(u.roleID)
    );

    // ✅ PHÂN TRANG
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1); // Khi đổi tab hoặc search → quay trang 1
    }, [activeTab, searchTerm, roleFilter]);

    const dataToShow = activeTab === "customer" ? customerList : staffList;
    const totalPages = Math.ceil(dataToShow.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = dataToShow.slice(startIndex, startIndex + pageSize);

    return (
        <div className="admin-user-page">
            <div className="admin-user-header">
                <h2>👥 Quản lý người dùng</h2>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === "customer" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("customer")}
                >
                    Khách hàng
                </button>
                <button
                    className={activeTab === "staff" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("staff")}
                >
                    Nhân viên / Quản lý
                </button>
            </div>

            <div className="admin-user-controls">
                <input
                    type="text"
                    placeholder="🔍 Tìm theo họ tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-user-search-box"
                />

                {activeTab === "staff" && (
                    <div className="admin-user-right">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="MA">Quản lý</option>
                            <option value="AD">Admin</option>
                        </select>

                        <button
                            className="admin-user-add-btn"
                            onClick={() => setShowPopup(true)}
                        >
                            + Thêm người dùng
                        </button>
                    </div>
                )}
            </div>

            {/* SỬ DỤNG 'loading' và 'error' để loại bỏ lỗi ESLint */}
            {loading && <p>Đang tải danh sách người dùng...</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Lỗi: {error}</p>}

            {/* Chỉ hiển thị bảng khi không ở trạng thái loading hoặc error */}
            {!loading && !error && (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ và tên</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedUsers.map((u) => (
                                <tr key={u.userID}>
                                    <td>{u.userID}</td>
                                    <td>
                                        {editingId === u.userID ? (
                                            <input
                                                value={editData.fullName || ""}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, fullName: e.target.value })
                                                }
                                            />
                                        ) : (
                                            u.fullName
                                        )}
                                    </td>

                                    <td>{u.userName}</td>

                                    <td>
                                        {editingId === u.userID ? (
                                            <input
                                                value={editData.email || ""}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, email: e.target.value })
                                                }
                                            />
                                        ) : (
                                            u.email
                                        )}
                                    </td>

                                    <td>
                                        {editingId === u.userID ? (
                                            <input
                                                value={editData.phone || ""}
                                                onChange={(e) =>
                                                    setEditData({ ...editData, phone: e.target.value })
                                                }
                                            />
                                        ) : (
                                            u.phone
                                        )}
                                    </td>

                                    <td>{u.roleID}</td>
                                    <td>{u.status ? "✅ Hoạt động" : "🚫 Khóa"}</td>

                                    <td>
                                        {editingId === u.userID ? (
                                            <>
                                                <button className="admin-user-edit-btn" onClick={() => handleSave(u.userID)}>
                                                    Lưu
                                                </button>
                                                <button className="admin-user-delete-btn" onClick={() => setEditingId(null)}>
                                                    Hủy
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="admin-user-edit-btn" onClick={() => handleEdit(u)}>
                                                    Sửa
                                                </button>
                                                <button className="admin-user-delete-btn" onClick={() => handleDelete(u.userID)}>
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ✅ PHÂN TRANG BUTTONS */}
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            ← Trước
                        </button>

                        <span>Trang {currentPage} / {totalPages || 1}</span>

                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                            Sau →
                        </button>
                    </div>
                </>
            )}


            {showPopup && activeTab === "staff" && (
                <div className="admin-user-popup-overlay">
                    <div className="admin-user-popup">
                        <h3>Thêm người dùng mới</h3>
                        <input
                            type="text"
                            placeholder="Họ và tên"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={newUser.userName}
                            onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        />
                        <select
                            value={newUser.roleID}
                            onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value })}
                        >
                            <option value="ST">Nhân viên</option>
                            <option value="MA">Quản lý</option>
                        </select>

                        <div className="admin-user-popup-buttons">
                            <button className="admin-user-add-btn" onClick={handleAddUser}>➕ Thêm</button>
                            <button className="admin-user-delete-btn" onClick={() => setShowPopup(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;