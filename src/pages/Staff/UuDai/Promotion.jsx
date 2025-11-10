import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Promotion.css";

const API_BASE = "https://api-movie6868.purintech.id.vn/api";

export default function Promotion() {
    const [seatTypes, setSeatTypes] = useState([]);
    const [selectedSeatTypeIds, setSelectedSeatTypeIds] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const ERROR_MESSAGES = {
        1013: "⚠️ Giá trị giảm giá phải lớn hơn 0!",
        1020: "⚠️ Khuyến mãi bị trùng thời gian với chương trình khác!",
        1026: "⚠️ Tên khuyến mãi đã tồn tại!",
        1032: "⚠️ Thời gian khuyến mãi chỉ được phép từ 2 - 3 ngày!",
    };
    const [imageFile, setImageFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // tạo danh sách phân trang
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedPromotions = promotions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
    const [form, setForm] = useState({
        name: "",
        description: "",
        discountValue: 0,
        startDate: "",
        endDate: "",
        discountType: "percentage",
    });

    const uploadImageToCloudinary = async (file) => {
        // ... (Giữ nguyên logic upload)
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "movie-upload1");
        data.append("cloud_name", "dmprbuogr");

        const res = await fetch("https://api.cloudinary.com/v1_1/dmprbuogr/image/upload", {
            method: "POST",
            body: data,
        });

        const result = await res.json();
        if (!result.secure_url) throw new Error("Không nhận được link ảnh!");
        return result.secure_url;
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const mapDiscountType = (value) => {
        if (!value) return null;

        switch (value.toUpperCase()) {
            case "PERCENT":
            case "%":
            case "PERCENTAGE":
                return "percentage";

            case "AMOUNT":
            case "VND":
            case "FIXED":
                return "fixed_amount";

            default:
                return null;
        }
    };

    // ✅ SỬA LỖI: Bọc hàm trong useCallback để đảm bảo hàm không bị tạo lại trên mỗi render
    const loadSeatTypes = useCallback(() => {
        axios.get(`${API_BASE}/seat/seat-type/all`, { headers: getAuthHeader() })
            .then(res => setSeatTypes(res.data))
            .catch(() => alert("⚠️ Lỗi tải loại ghế"));
    }, []); // Dependency array rỗng

    // ✅ SỬA LỖI: Bọc hàm trong useCallback để đảm bảo hàm không bị tạo lại trên mỗi render
    const loadPromotions = useCallback(() => {
        axios.get(`${API_BASE}/admin/promotions`, { headers: getAuthHeader() })
            .then(res => setPromotions(res.data))
            .catch(() => alert("⚠️ Lỗi tải danh sách khuyến mãi"));
    }, []); // Dependency array rỗng

    // Sử dụng các hàm đã được bọc trong useCallback trong useEffect
    useEffect(() => {
        loadSeatTypes();
        loadPromotions();
    }, [loadSeatTypes, loadPromotions]);


    const toggleSeatType = (id) => {
        setSelectedSeatTypeIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!form.name) return alert("Nhập tên khuyến mãi");
        if (!form.startDate || !form.endDate) return alert("Chọn ngày");
        if (selectedSeatTypeIds.length === 0) return alert("Chọn ít nhất 1 loại ghế");
        if (!imageFile) return alert("Chọn ảnh khuyến mãi!");

        setLoading(true);
        try {
            // ✅ Upload ảnh lên Cloudinary
            const imageUrl = await uploadImageToCloudinary(imageFile);

            // ✅ Gửi API tạo khuyến mãi kèm URL ảnh
            await axios.post(
                `${API_BASE}/admin/promotions`,
                {
                    name: form.name,
                    description: form.description,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    discountType: mapDiscountType(form.discountType),
                    discountValue: form.discountValue,
                    seatTypeIds: selectedSeatTypeIds,
                    imageUrl: imageUrl
                },
                { headers: getAuthHeader() }
            );

            alert("✅ Tạo khuyến mãi thành công!");
            setErrorMessage("");

            loadPromotions();

            // reset
            setForm({
                name: "",
                description: "",
                discountValue: 0,
                startDate: "",
                endDate: "",
                discountType: "percentage",
            });
            setSelectedSeatTypeIds([]);
            setImageFile(null);

        } catch (err) {
            const code = err.response?.data?.code;
            const fallback = err.response?.data?.message || "Lỗi tạo khuyến mãi";
            setErrorMessage(ERROR_MESSAGES[code] || fallback);
        } finally {
            setLoading(false);
        }
    };


    const deletePromotion = async (promotionId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) return;

        try {
            await axios.delete(
                `${API_BASE}/admin/promotions/${promotionId}/hard-delete`,
                { headers: getAuthHeader() }
            );
            alert("✅ Đã xóa thành công!");
            loadPromotions(); // refresh danh sách
        } catch (err) {
            console.error(err);
            alert("⚠️ Lỗi khi xóa khuyến mãi");
        }
    };

    const toggleStatus = async (promotion) => {
        try {
            await axios.patch(
                `${API_BASE}/admin/promotions/${promotion.promotionID}/status`,
                { isActive: !promotion.active },
                { headers: getAuthHeader() }
            );

            loadPromotions();
        } catch (err) {
            console.error(err);
            alert("⚠️ Lỗi khi đổi trạng thái khuyến mãi");
        }
    };


    return (
        <div className="staff-promo-container">
            <h2>🎟️ Quản lý Khuyến Mãi</h2>
            {errorMessage && (
                <div className="staff-promo-error-box">
                    {errorMessage}
                </div>
            )}


            {/* FORM TẠO */}
            <div className="staff-promo-form">
                <input className="staff-promo-input" placeholder="Tên khuyến mãi"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                <input className="staff-promo-input" placeholder="Mô tả"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                <select className="staff-promo-input" value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                    <option value="percentage">Giảm %</option>
                    <option value="fixed_amount">Giảm số tiền</option>
                </select>

                <input className="staff-promo-input" type="number" min="0" placeholder="Giá trị giảm"
                    value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />

                <input className="staff-promo-input" type="date"
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />

                <input className="staff-promo-input" type="date"
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="staff-promo-input"
                />

                <h4>Áp dụng cho loại ghế:</h4>
                <div className="staff-promo-seat-list">
                    {seatTypes.map(s => (
                        <label key={s.seatTypeID} className="staff-promo-seat-item">
                            <input type="checkbox"
                                checked={selectedSeatTypeIds.includes(s.seatTypeID)}
                                onChange={() => toggleSeatType(s.seatTypeID)} />
                            {s.name} — {Number(s.basePrice).toLocaleString()}đ
                        </label>
                    ))}
                </div>

                <button className="staff-promo-btn staff-promo-btn-primary" disabled={loading} onClick={handleSubmit}>
                    {loading ? "Đang xử lý..." : "Tạo khuyến mãi"}
                </button>
            </div>

            <hr className="staff-promo-hr" style={{ margin: "20px 0" }} />

            {/* LIST */}
            <h3>📋 Danh sách khuyến mãi</h3>

            <table className="staff-promo-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Ảnh</th>
                        <th>Giảm</th>
                        <th>Thời gian</th>
                        <th>Loại ghế áp dụng</th>
                        <th>Trạng thái</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPromotions.map(p => (
                        <tr key={p.promotionID}>
                            <td>{p.name}</td>
                            <td><img src={p.imageUrl} alt="" width="60" /></td>
                            <td>{p.discountValue} ({p.discountType})</td>
                            <td>{p.startDate} → {p.endDate}</td>
                            <td>{p.applicableSeatTypes?.map(s => s.name).join(", ") || "—"}</td>
                            <td>
                                <button
                                    className={p.active ? "staff-promo-btn-off" : "staff-promo-btn-on"}
                                    onClick={() => toggleStatus(p)}
                                >
                                    {p.active ? "Tắt" : "Bật"}
                                </button>
                            </td>
                            <td>
                                <button
                                    className="staff-promo-btn-delete"
                                    onClick={() => deletePromotion(p.promotionID)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="staff-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    ⬅️ Trước
                </button>

                <span>Trang {currentPage} / {totalPages}</span>

                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                    Tiếp ➡️
                </button>
            </div>

        </div>

    );
}