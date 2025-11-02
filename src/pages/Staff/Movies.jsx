// src/components/staff/Movie.jsx
import React, { useEffect, useState } from "react";
import { movieApi } from "../../api/movie-api";
import "./Movie.css";

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showDescPopup, setShowDescPopup] = useState(null);
    const [showActorPopup, setShowActorPopup] = useState(null);
    const [editMovieID, setEditMovieID] = useState(null);
    const [showImagePopup, setShowImagePopup] = useState(null);
    const [errorMessages, setErrorMessages] = useState([]);

    const genres = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Animation"];
    const ages = ["All", "13+", "16+", "18+"];
    const languages = ["English", "Vietnamese", "Japanese", "Korean", "Chinese"];
    const statuses = ["Now Showing", "Coming Soon", "Ended"];

    const uploadImageToCloudinary = async (file) => {
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

    const handleFileChange = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const secureUrl = await uploadImageToCloudinary(file);
            setFormData((prev) => ({ ...prev, [fieldName]: secureUrl }));

            if (editMode && editMovieID) {
                let successMessage = `💾 Đã lưu ${fieldName} mới vào hệ thống (đang chờ duyệt).`;

                if (fieldName === "poster") {
                    await movieApi.updatePoster(editMovieID, secureUrl);
                } else if (fieldName === "banner") {
                    await movieApi.updateBanner(editMovieID, secureUrl);
                } else {
                    await movieApi.updateMovie(editMovieID, { [fieldName]: secureUrl, approveStatus: "PENDING" });
                    successMessage += " (Dùng API chung)";
                }

                console.log(successMessage);
                const updatedMovies = await movieApi.getMovies();
                setMovies(updatedMovies);
                setFilteredMovies(updatedMovies);
            }

        } catch (err) {
            console.error("Upload error:", err);
            const backendError = err.response?.data?.details;
            if (backendError) {
                const errorMessages = Object.values(backendError).join(" | ");
                alert(`❌ Lỗi API khi lưu ảnh: ${errorMessages}`);
            } else {
                alert(`❌ Lỗi tải ảnh ${fieldName}! Vui lòng thử lại.`);
            }
        }
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const data = await movieApi.getMovies();
                setMovies(data);
                setFilteredMovies(data);
            } catch {
                setError("Không thể tải danh sách phim.");
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase().trim();
        setSearchTerm(value);
        setFilteredMovies(movies.filter((m) => m.movieName.toLowerCase().includes(value)));
    };

    const resetForm = () => {
        setFormData({
            movieName: "",
            genre: "",
            duration: "",
            age: "",
            director: "",
            actress: "",
            releaseDate: "",
            language: "",
            description: "",
            poster: "",
            banner: "",
            trailer: "",
            status: "",
            approveStatus: "PENDING",
        });
    };

    const handleAddClick = () => {
        setEditMode(false);
        setEditMovieID(null);
        resetForm();
        setErrorMessages([]); // reset lỗi trước khi lưu

        setShowPopup(true);
    };

    const handleEditClick = (movie) => {
        setEditMode(true);
        setEditMovieID(movie.movieID);
        const movieData = {
            ...movie,
            duration: movie.duration ? Number(movie.duration) : "",
        };
        setFormData(movieData);
        setErrorMessages([]); // reset lỗi trước khi lưu

        setShowPopup(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMessages([]); // reset lỗi trước khi lưu

        try {
            const movieDataToSave = {
                ...formData,
                duration: formData.duration ? Number(formData.duration) : "",
                approveStatus: "PENDING",
            };

            if (editMode) {
                const filteredData = Object.fromEntries(
                    Object.entries(movieDataToSave).filter(([_, v]) => v !== "" && v !== null)
                );

                await movieApi.updateMovie(editMovieID, filteredData);
                alert("✏️ Cập nhật phim thành công (đang chờ duyệt).");

            } else {
                const requiredFields = [
                    "movieName", "genre", "duration", "age",
                    "director", "actress", "releaseDate",
                    "language", "description", "banner",
                    "poster", "trailer", "status",
                ];

                const missing = requiredFields.filter(
                    (f) => !movieDataToSave[f] || movieDataToSave[f].toString().trim() === ""
                );

                if (missing.length > 0) {
                    setErrorMessages([`⚠️ Vui lòng nhập đầy đủ: ${missing.join(", ")}`]);
                    return;
                }

                await movieApi.addMovie(movieDataToSave);
                alert("🎬 Thêm phim mới thành công (đang chờ duyệt).");
            }

            const updatedMovies = await movieApi.getMovies();
            setMovies(updatedMovies);
            setFilteredMovies(updatedMovies);
            setShowPopup(false);
            resetForm();

        } catch (error) {
            console.error("❌ Lỗi khi lưu phim:", error);

            const backendError = error.response?.data;

            // ✅ Backend trả về { code, message }
            if (backendError?.code && backendError?.message) {
                switch (backendError.code) {
                    case 2001:
                        setErrorMessages(["🎬 Phim đã tồn tại."]);
                        break;
                    case 2002:
                        setErrorMessages(["📅 Ngày phát hành không hợp lệ."]);
                        break;
                    default:
                        setErrorMessages([backendError.message]);
                }
                return;
            }

            // ✅ Backend trả về nhiều lỗi dạng details
            if (backendError?.details) {
                setErrorMessages(Object.values(backendError.details));
                return;
            }

            // ✅ Lỗi kết nối hoặc lỗi không xác định
            setErrorMessages(["🚨 Không thể kết nối đến server. Vui lòng thử lại!"]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xoá phim này không?")) {
            try {
                await movieApi.deleteMovie(id);
                const updated = movies.filter((m) => m.movieID !== id);
                setMovies(updated);
                setFilteredMovies(updated);
                alert("🗑️ Xóa phim thành công!");
            } catch {
                alert("❌ Lỗi khi xoá phim!");
            }
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="staff-movie-page">
            <div className="staff-movie-header">
                <h2>🎬 Quản lý phim (Staff)</h2>
                {errorMessages.length > 0 && (
                    <div className="staff-error-box">
                        <strong>⚠️ Đã xảy ra lỗi:</strong>
                        <ul>
                            {errorMessages.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="staff-movie-actions">
                    <input
                        type="text"
                        placeholder="🔍 Tìm kiếm phim..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="staff-search-box"
                    />
                    <button className="staff-add-btn" onClick={handleAddClick}>➕ Thêm phim</button>
                </div>
            </div>

            <table className="staff-movie-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên phim</th>
                        <th>Poster & Banner</th>
                        <th>Thể loại</th>
                        <th>Thời lượng</th>
                        <th>Độ tuổi</th>
                        <th>Đạo diễn</th>
                        <th>Diễn viên</th>
                        <th>Ngày chiếu</th>
                        <th>Ngôn ngữ</th>
                        <th>Trạng thái</th>
                        <th>Phê duyệt</th>
                        <th>Mô tả</th>
                        <th>Trailer</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map((m) => (
                            <tr key={m.movieID}>
                                <td>{m.movieID}</td>
                                <td>{m.movieName}</td>
                                <td>
                                    {m.poster || m.banner ? (
                                        <img
                                            src={m.poster || m.banner}
                                            alt="poster"
                                            className="staff-poster-img"
                                            onClick={() =>
                                                setShowImagePopup({ poster: m.poster, banner: m.banner })
                                            }
                                        />
                                    ) : (
                                        <span className="no-image-text">Chưa có hình ảnh</span>
                                    )}
                                </td>
                                <td>{m.genre}</td>
                                <td>{m.duration} phút</td>
                                <td>{m.age}</td>
                                <td>{m.director}</td>
                                {/* ✅ Đã sửa desc-cell thành staff-desc-cell */}
                                <td className="staff-desc-cell" onClick={() => setShowActorPopup(m.actress)}>
                                    {m.actress || "—"}
                                </td>
                                <td>{m.releaseDate}</td>
                                <td>{m.language}</td>
                                <td>{m.status}</td>
                                <td>
                                    <span
                                        className={`approve-status-tag ${m.approveStatus === "APPROVE"
                                            ? "approved"
                                            : m.approveStatus === "REJECT"
                                                ? "rejected"
                                                : m.approveStatus === "DENIED"
                                                    ? "denied"
                                                    : "pending"
                                            }`}
                                    >
                                        {m.approveStatus || "—"}
                                    </span>
                                </td>
                                {/* ✅ Đã sửa desc-cell thành staff-desc-cell */}
                                <td className="staff-desc-cell" onClick={() => setShowDescPopup(m.description)}>
                                    {m.description || "—"}
                                </td>
                                <td>
                                    {m.trailer ? (
                                        <a href={m.trailer} target="_blank" rel="noreferrer" className="staff-trailer-link">
                                            Xem
                                        </a>
                                    ) : (
                                        <span className="no-trailer">—</span>
                                    )}
                                </td>
                                <td>
                                    <button className="staff-edit-btn" onClick={() => handleEditClick(m)}>✏️</button>
                                    <button className="staff-delete-btn" onClick={() => handleDelete(m.movieID)}>🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="15" style={{ textAlign: "center" }}>Không có phim nào phù hợp.</td></tr>
                    )}
                </tbody>
            </table>
            {/* 🔥🔥🔥 ĐÃ CHỈNH SỬA: Popup Thêm/Sửa Phim (Dùng Input có gợi ý) 🔥🔥🔥 */}
            {showPopup && (
                <div className="staff-popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="staff-popup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editMode ? "✏️ Cập nhật phim" : "➕ Thêm phim mới"}</h3>
                        <form className="staff-movie-form" onSubmit={handleSave}>
                            <label>Tên phim *</label>
                            <input type="text" name="movieName" value={formData.movieName || ""} onChange={handleChange} required />

                            <label>Thể loại *</label>
                            <input type="text" name="genre" value={formData.genre || ""} onChange={handleChange} list="genre-list" required />

                            <datalist id="genre-list">
                                {genres.map((g) => (<option key={g} value={g} />))}
                            </datalist>

                            <label>Thời lượng (phút) *</label>
                            <input type="number" name="duration" value={formData.duration || ""} onChange={handleChange} min="1" required />

                            <label>Độ tuổi *</label>
                            <input type="text" name="age" value={formData.age || ""} onChange={handleChange} list="age-list" required />
                            <datalist id="age-list">{ages.map((a) => (<option key={a} value={a} />))}</datalist>

                            <label>Đạo diễn *</label>
                            <input type="text" name="director" value={formData.director || ""} onChange={handleChange} required />

                            <label>Diễn viên *</label>
                            <input type="text" name="actress" value={formData.actress || ""} onChange={handleChange} required />

                            <label>Ngày chiếu *</label>
                            <input type="date" name="releaseDate" value={formData.releaseDate || ""} onChange={handleChange} required />

                            <label>Ngôn ngữ *</label>
                            <input type="text" name="language" value={formData.language || ""} onChange={handleChange} list="language-list" required />
                            <datalist id="language-list">{languages.map((l) => (<option key={l} value={l} />))}</datalist>

                            <label>Trạng thái *</label>
                            <input type="text" name="status" value={formData.status || ""} onChange={handleChange} list="status-list" required />
                            <datalist id="status-list">{statuses.map((s) => (<option key={s} value={s} />))}</datalist>

                            <label>Trailer (URL) *</label>
                            <input type="url" name="trailer" value={formData.trailer || ""} onChange={handleChange} required />

                            <label>Mô tả *</label>
                            <textarea name="description" value={formData.description || ""} onChange={handleChange} rows="4" required />

                            <div className="staff-upload-group">
                                <label>Poster *</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "poster")} required={!editMode && !formData.poster} />
                                {formData.poster && <img src={formData.poster} className="staff-preview-img" alt="Poster preview" />}
                            </div>

                            <div className="staff-upload-group">
                                <label>Banner *</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "banner")} required={!editMode && !formData.banner} />
                                {formData.banner && <img src={formData.banner} className="staff-preview-img" alt="Banner preview" />}
                            </div>

                            <div className="staff-form-actions">
                                {errorMessages.length > 0 && (
                                    // ✅ Đã sửa error-box thành staff-error-box-popup
                                    <div className="staff-error-box-popup">
                                        {errorMessages.map((err, i) => (
                                            // ✅ Đã sửa error-text thành staff-error-text-popup
                                            <p key={i} className="staff-error-text-popup">{err}</p>
                                        ))}
                                    </div>
                                )}

                                <button type="submit" className="staff-save-btn">{editMode ? "💾 Lưu thay đổi" : "➕ Thêm phim"}</button>
                                <button type="button" className="staff-cancel-btn" onClick={() => setShowPopup(false)}>Hủy</button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
            {/* End Popup Thêm/Sửa Phim */}
            {/* Popup Mô tả */}
            {showDescPopup && (
                <div className="staff-popup-overlay" onClick={() => setShowDescPopup(null)}>
                    <div className="staff-popup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>📝 Mô tả phim</h3>
                        <div className="staff-popup-text">
                            {showDescPopup}
                        </div>
                        <button className="staff-close-btn" onClick={() => setShowDescPopup(null)}>Đóng</button>
                    </div>
                </div>
            )}

            {/* Popup Diễn viên */}
            {showActorPopup && (
                <div className="staff-popup-overlay" onClick={() => setShowActorPopup(null)}>
                    <div className="staff-popup-content" onClick={(e) => e.stopPropagation()}>
                        <h3>🎭 Diễn viên</h3>
                        <div className="staff-popup-text">
                            {showActorPopup}
                        </div>
                        <button className="staff-close-btn" onClick={() => setShowActorPopup(null)}>Đóng</button>
                    </div>
                </div>
            )}


            {/* Popup Xem ảnh */}
            {showImagePopup && (
                <div className="staff-popup-overlay" onClick={() => setShowImagePopup(null)}>
                    <div className="staff-image-popup" onClick={(e) => e.stopPropagation()}>
                        <h3>📸 Hình ảnh phim</h3>
                        <div className="staff-image-grid">
                            <div className="staff-image-box">
                                <h4>Poster</h4>
                                {showImagePopup.poster ? (
                                    <img src={showImagePopup.poster} alt="Poster" className="staff-large-img" />
                                ) : (
                                    <div className="staff-no-image-box">Chưa có hình ảnh</div>
                                )}
                            </div>
                            <div className="staff-image-box">
                                <h4>Banner</h4>
                                {showImagePopup.banner ? (
                                    <img src={showImagePopup.banner} alt="Banner" className="staff-large-img" />
                                ) : (
                                    <div className="staff-no-image-box">Chưa có hình ảnh</div>
                                )}
                            </div>
                        </div>
                        <button className="staff-close-btn" onClick={() => setShowImagePopup(null)}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movies;