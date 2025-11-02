import React, { useState, useEffect } from "react";
import axios from "axios";
// ✅ Đã đổi tên file CSS cho dễ quản lý
import "./Promotion.css";

const API_BASE = "http://api-movie6868.purintech.id.vn/api";

// ✅ Giữ tên component Promotion nếu nó là file Promotion.jsx
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


    const loadSeatTypes = () => {
        axios.get(`${API_BASE}/seat/seat-type/all`, { headers: getAuthHeader() })
            .then(res => setSeatTypes(res.data))
            .catch(() => alert("⚠️ Lỗi tải loại ghế"));
    };

    const loadPromotions = () => {
        axios.get(`${API_BASE}/admin/promotions`, { headers: getAuthHeader() })
            .then(res => setPromotions(res.data))
            .catch(() => alert("⚠️ Lỗi tải danh sách khuyến mãi"));
    };

    useEffect(() => {
        loadSeatTypes();
        loadPromotions();
    }, []);

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
                    imageUrl: imageUrl  // ⬅️ Gửi kèm ảnh
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
        // ✅ Đã đổi create-promo
        <div className="staff-promo-container">
            <h2>🎟️ Quản lý Khuyến Mãi</h2>
            {errorMessage && (
                // ✅ Đã đổi error-box
                <div className="staff-promo-error-box">
                    {errorMessage}
                </div>
            )}


            {/* FORM TẠO */}
            {/* ✅ Đã đổi promo-form */}
            <div className="staff-promo-form">
                {/* ✅ Đã đổi input */}
                <input className="staff-promo-input" placeholder="Tên khuyến mãi"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                {/* ✅ Đã đổi input */}
                <input className="staff-promo-input" placeholder="Mô tả"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                {/* ✅ Đã đổi input */}
                <select className="staff-promo-input" value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                    <option value="percentage">Giảm %</option>
                    <option value="fixed_amount">Giảm số tiền</option>
                </select>

                {/* ✅ Đã đổi input */}
                <input className="staff-promo-input" type="number" min="0" placeholder="Giá trị giảm"
                    value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />

                {/* ✅ Đã đổi input */}
                <input className="staff-promo-input" type="date"
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />

                {/* ✅ Đã đổi input */}
                <input className="staff-promo-input" type="date"
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    // ✅ Đã đổi input
                    className="staff-promo-input"
                />

                <h4>Áp dụng cho loại ghế:</h4>
                {/* ✅ Đã đổi seat-list */}
                <div className="staff-promo-seat-list">
                    {seatTypes.map(s => (
                        // ✅ Đã đổi seat-item
                        <label key={s.seatTypeID} className="staff-promo-seat-item">
                            <input type="checkbox"
                                checked={selectedSeatTypeIds.includes(s.seatTypeID)}
                                onChange={() => toggleSeatType(s.seatTypeID)} />
                            {s.name} — {Number(s.basePrice).toLocaleString()}đ
                        </label>
                    ))}
                </div>

                {/* ✅ Đã đổi btn btn-primary */}
                <button className="staff-promo-btn staff-promo-btn-primary" disabled={loading} onClick={handleSubmit}>
                    {loading ? "Đang xử lý..." : "Tạo khuyến mãi"}
                </button>
            </div>

            <hr className="staff-promo-hr" style={{ margin: "20px 0" }} />

            {/* LIST */}
            <h3>📋 Danh sách khuyến mãi</h3>

            {/* ✅ Đã đổi table */}
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
                    {promotions.map(p => (
                        <tr key={p.promotionID}>
                            <td>{p.name}</td>
                            <td><img src={p.imageUrl} alt="" width="60" /></td>
                            <td>{p.discountValue} ({p.discountType})</td>
                            <td>{p.startDate} → {p.endDate}</td>
                            <td>{p.applicableSeatTypes?.map(s => s.name).join(", ") || "—"}</td>
                            <td>
                                <button
                                    // ✅ Đổi btn-off/btn-on thành class có prefix
                                    className={p.active ? "staff-promo-btn-off" : "staff-promo-btn-on"}
                                    onClick={() => toggleStatus(p)}
                                >
                                    {p.active ? "Tắt" : "Bật"}
                                </button>

                            </td>
                            <td>
                                <button
                                    // ✅ Đã đổi btn-delete
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
        </div>
    );
}