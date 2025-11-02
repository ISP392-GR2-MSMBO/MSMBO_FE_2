import React, { useEffect, useState } from "react";
import { showtimeApi } from "../../api/showtime-api";
import { movieApi } from "../../api/movie-api";
// ✅ Đổi tên file CSS
import "./Showtime.css";

const HOURS_START = 8;
const HOURS_END = 24;
const HOURS_RANGE = HOURS_END - HOURS_START;

const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toISOString().split("T")[0];
};

const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

const parseHourFloat = (timeStr) => {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(":").map((x) => Number(x));
    return hh + (mm || 0) / 60;
};

const Showtime = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("manage");

    const [filterDate, setFilterDate] = useState("");
    const [filterTheater, setFilterTheater] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredShowtimes, setFilteredShowtimes] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
    const [selectedShowtimeSeats, setSelectedShowtimeSeats] = useState([]);
    const [selectedShowtimeID, setSelectedShowtimeID] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [editMode, setEditMode] = useState(false);
    const [editID, setEditID] = useState(null);
    const [formData, setFormData] = useState({
        theaterID: "",
        movieID: "",
        date: "",
        startTime: "",
        endTime: "",
    });

    const [startDate, setStartDate] = useState(new Date());
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const days = Array.from({ length: 7 }, (_, i) => formatDate(addDays(startDate, i)));
    const activeDay = days[selectedDayIndex];

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [stData, mvData] = await Promise.all([
                    showtimeApi.getShowtimes(),
                    movieApi.getMovies(),
                ]);
                setShowtimes(Array.isArray(stData) ? stData : []);
                setMovies(Array.isArray(mvData) ? mvData : []);
                setFilterDate((prev) => prev || formatDate(new Date()));
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu từ server.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const refreshShowtimes = async () => {
        try {
            const stData = await showtimeApi.getShowtimes();
            setShowtimes(Array.isArray(stData) ? stData : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        let data = [...showtimes];
        if (filterDate) data = data.filter((s) => s.date === filterDate);
        if (filterTheater)
            data = data.filter((s) => String(s.theaterID) === String(filterTheater));

        const q = searchTerm.trim();
        if (q !== "") {
            const qLower = q.toLowerCase();
            data = data.filter((s) =>
                String(s.movieID).toLowerCase().includes(qLower)
            );
        }
        setFilteredShowtimes(data);
    }, [showtimes, filterDate, filterTheater, searchTerm]);

    const getMovieName = (movieID) => {
        const m = movies.find((x) => x.movieID === movieID);
        return m ? m.movieName : `#${movieID}`;
    };

    const openCreateModal = () => {
        setEditMode(false);
        setEditID(null);
        setFormData({ theaterID: "", movieID: "", date: "", startTime: "", endTime: "" });
        setErrorMessage("");

        setIsModalOpen(true);
    };

    const openEditModal = (s) => {
        if (s.approveStatus === "APPROVE") {
            alert("❌ Suất chiếu đã duyệt — không thể chỉnh sửa.");
            return;
        }
        setEditMode(true);
        setEditID(s.showtimeID);
        setFormData({
            theaterID: s.theaterID,
            movieID: s.movieID,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
        });
        setErrorMessage("");

        setIsModalOpen(true);
    };
    const openSeatModal = async (showtimeID) => {
        try {
            setSelectedShowtimeID(showtimeID);
            setIsSeatModalOpen(true);
            const data = await showtimeApi.getSeatsByShowtime(showtimeID);
            setSelectedShowtimeSeats(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            alert("❌ Không thể tải danh sách ghế.");
        }
    };


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));

    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const payload = {
            theaterID: Number(formData.theaterID),
            movieID: Number(formData.movieID),
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
        };

        try {
            if (editMode) {
                await showtimeApi.updateShowtime(editID, payload);
                alert("✏️ Cập nhật thành công!");
            } else {
                await showtimeApi.addShowtime(payload);
                alert("✅ Tạo suất chiếu thành công!");
            }

            await refreshShowtimes();
            setIsModalOpen(false);

        } catch (err) {
            console.error(err);

            if (err.response && err.response.data) {
                const { code, message } = err.response.data;

                switch (code) {
                    case 1008:
                        setErrorMessage("❌ Rạp không tồn tại.");
                        break;
                    case 1009:
                        setErrorMessage("⚠️ Suất chiếu bị trùng giờ! Hãy chọn giờ khác.");
                        break;
                    case 1001:
                        setErrorMessage("🎬 Phim không tồn tại.");
                        break;
                    default:
                        setErrorMessage(message || "⚠️ Lỗi không xác định!");
                }
            } else {
                setErrorMessage("🚨 Không thể kết nối server. Vui lòng kiểm tra mạng!");
            }
        }

    };


    const handleDelete = async (s) => {
        if (s.approveStatus === "APPROVE") {
            alert("❌ Suất chiếu đã duyệt — không thể xóa.");
            return;
        }
        if (!window.confirm(`Xác nhận xóa suất chiếu ID ${s.showtimeID}?`)) return;
        try {
            await showtimeApi.deleteShowtime(s.showtimeID);
            alert("🗑️ Xóa thành công!");
            await refreshShowtimes();
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi khi xóa.");
        }
    };

    const computeStyleForShow = (s) => {
        const start = parseHourFloat(s.startTime);
        const end = parseHourFloat(s.endTime);
        const clampedStart = Math.max(HOURS_START, Math.min(HOURS_END, start));
        const clampedEnd = Math.max(HOURS_START, Math.min(HOURS_END, end));
        const leftPct = ((clampedStart - HOURS_START) / HOURS_RANGE) * 100;
        const widthPct = Math.max(0.5, ((clampedEnd - clampedStart) / HOURS_RANGE) * 100);
        return { left: `${leftPct}%`, width: `${widthPct}%` };
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="staff-error-text" style={{ color: "red" }}>{error}</p>;

    const theaters = Array.from(new Set(showtimes.map((s) => s.theaterID))).sort(
        (a, b) => a - b
    );

    return (
        <div className="staff-showtime-root">
            <div className="staff-showtime-topbar">
                <h2>📋 Quản lý Suất chiếu</h2>
                <div className="staff-showtime-tabs">
                    <button
                        className={activeTab === "manage" ? "active" : ""}
                        onClick={() => setActiveTab("manage")}
                    >
                        Quản lý
                    </button>
                    <button
                        className={activeTab === "timeline" ? "active" : ""}
                        onClick={() => setActiveTab("timeline")}
                    >
                        Timeline
                    </button>
                </div>
            </div>

            {/* Manage Tab */}
            {activeTab === "manage" && (
                <div className="staff-showtime-manage-tab">
                    <div className="staff-showtime-manage-controls">
                        <div className="staff-showtime-left-controls">
                            <button className="staff-showtime-btn-primary" onClick={openCreateModal}>
                                ➕ Thêm suất chiếu
                            </button>
                        </div>

                        <div className="staff-showtime-search-box">
                            <input
                                type="text"
                                placeholder="🔍 Tìm theo ID phim..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="staff-showtime-right-controls">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            <select
                                value={filterTheater}
                                onChange={(e) => setFilterTheater(e.target.value)}
                            >
                                <option value="">-- Tất cả rạp --</option>
                                {theaters.map((t) => (
                                    <option key={t} value={t}>
                                        Rạp {t}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    setFilterDate("");
                                    setFilterTheater("");
                                    setSearchTerm("");
                                }}
                                className="staff-showtime-btn-secondary"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>

                    <div className="staff-showtime-table-wrap">
                        <table className="staff-showtime-manage-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Movie ID</th>
                                    <th>Movie Name</th>
                                    <th>Theater</th>
                                    <th>Date</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShowtimes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            style={{ textAlign: "center", color: "#64748b" }}
                                        >
                                            Không có suất chiếu.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShowtimes.map((s) => (
                                        <tr key={s.showtimeID}>
                                            <td>{s.showtimeID}</td>
                                            <td>{s.movieID}</td>
                                            <td>{getMovieName(s.movieID)}</td>
                                            <td>{s.theaterID}</td>
                                            <td>{s.date}</td>
                                            <td>{s.startTime}</td>
                                            <td>{s.endTime}</td>
                                            <td>
                                                <span
                                                    className={`staff-showtime-status-badge ${s.approveStatus?.toLowerCase()}`}
                                                >
                                                    {s.approveStatus || "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="staff-showtime-icon-btn staff-showtime-seat"
                                                    onClick={() => openSeatModal(s.showtimeID)}
                                                >
                                                    🪑
                                                </button>
                                                {s.approveStatus === "APPROVE" ? (
                                                    <span className="staff-showtime-muted">Đã duyệt</span>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="staff-showtime-icon-btn"
                                                            onClick={() => openEditModal(s)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="staff-showtime-icon-btn staff-showtime-delete"
                                                            onClick={() => handleDelete(s)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
                <div className="staff-showtime-timeline-tab">
                    <div className="staff-showtime-timeline-controls">
                        <div>
                            <label>Ngày bắt đầu:</label>
                            <input
                                type="date"
                                value={formatDate(startDate)}
                                onChange={(e) => {
                                    setStartDate(new Date(e.target.value));
                                    setSelectedDayIndex(0);
                                }}
                            />
                        </div>
                        <div>
                            <label>Lọc rạp:</label>
                            <select
                                value={filterTheater}
                                onChange={(e) => setFilterTheater(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                {theaters.map((t) => (
                                    <option key={t} value={t}>
                                        Rạp {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="staff-showtime-day-tabs">
                            {days.map((d, idx) => (
                                <button
                                    key={d}
                                    className={
                                        selectedDayIndex === idx ? "staff-showtime-day-tab active" : "staff-showtime-day-tab"
                                    }
                                    onClick={() => setSelectedDayIndex(idx)}
                                >
                                    <div className="staff-showtime-day-label">
                                        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][idx]}
                                    </div>
                                    <div className="staff-showtime-day-date">{d}</div>
                                </button>
                            ))}
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                            <button
                                className="staff-showtime-btn-secondary"
                                onClick={() => {
                                    setStartDate(addDays(startDate, -7));
                                    setSelectedDayIndex(0);
                                }}
                            >
                                ◀ Tuần trước
                            </button>
                            <button
                                className="staff-showtime-btn-secondary"
                                onClick={() => {
                                    setStartDate(addDays(startDate, 7));
                                    setSelectedDayIndex(0);
                                }}
                            >
                                Tuần sau ▶
                            </button>
                        </div>
                    </div>

                    {/* === Thay trục dọc thành Rạp === */}
                    <div className="staff-showtime-timeline-wrapper">
                        <div className="staff-showtime-timeline-grid-header">
                            <div className="staff-showtime-col-movie">Rạp (ID)</div>
                            <div className="staff-showtime-col-hours">
                                {Array.from({ length: HOURS_RANGE }, (_, i) => (
                                    <div key={i} className="staff-showtime-hour-col">
                                        {HOURS_START + i}:00
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="staff-showtime-timeline-body">
                            {theaters.length === 0 ? (
                                <div className="staff-showtime-no-data">Không có rạp nào.</div>
                            ) : (
                                theaters
                                    // CHỈ lọc theo rạp được chọn (nếu có), không lọc theo suất chiếu
                                    .filter(t => !filterTheater || String(t) === String(filterTheater))
                                    .map((t) => {
                                        // Lọc suất chiếu CHỈ cho rạp hiện tại và ngày đang chọn
                                        const theaterShowtimes = showtimes.filter(
                                            (s) =>
                                                s.theaterID === t &&
                                                s.date === activeDay
                                        );

                                        return (
                                            <div key={t} className="staff-showtime-timeline-row">
                                                <div className="staff-showtime-col-movie staff-showtime-movie-cell">
                                                    <div className="staff-showtime-movie-title">Rạp {t}</div>
                                                    <div className="staff-showtime-movie-id">ID: {t}</div>
                                                </div>

                                                <div className="staff-showtime-col-hours">
                                                    <div className="staff-showtime-track">
                                                        {theaterShowtimes.length === 0 ? (
                                                            <div className="staff-showtime-no-showtimes-message">
                                                                Không có suất chiếu
                                                            </div>
                                                        ) : (
                                                            theaterShowtimes
                                                                .map((s) => {
                                                                    const style =
                                                                        computeStyleForShow(s);
                                                                    const cls = (
                                                                        s.approveStatus || ""
                                                                    ).toLowerCase();
                                                                    return (
                                                                        <div
                                                                            key={s.showtimeID}
                                                                            className={`staff-showtime-show-block ${cls}`}
                                                                            style={style}
                                                                            title={`${getMovieName(
                                                                                s.movieID
                                                                            )} — Phòng ${s.theaterID}\n${s.startTime
                                                                                } - ${s.endTime}\n${s.approveStatus
                                                                                }`}
                                                                            onClick={() => {
                                                                                if (
                                                                                    s.approveStatus ===
                                                                                    "PENDING"
                                                                                ) {
                                                                                    if (
                                                                                        window.confirm(
                                                                                            "Mở form chỉnh sửa suất chiếu này?"
                                                                                        )
                                                                                    )
                                                                                        openEditModal(
                                                                                            s
                                                                                        );
                                                                                } else {
                                                                                    alert(
                                                                                        `${getMovieName(
                                                                                            s.movieID
                                                                                        )}\nPhòng ${s.theaterID
                                                                                        }\n${s.startTime
                                                                                        } - ${s.endTime
                                                                                        }\n${s.approveStatus
                                                                                        }`
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className="staff-showtime-block-title">
                                                                                {getMovieName(
                                                                                    s.movieID
                                                                                )}
                                                                            </div>
                                                                            <div className="staff-showtime-block-sub">
                                                                                {
                                                                                    s.startTime
                                                                                }–
                                                                                {s.endTime}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Create/Edit Showtime */}
            {isModalOpen && (
                <div
                    className="staff-showtime-modal-backdrop"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="staff-showtime-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editMode
                                ? "✏️ Cập nhật Suất chiếu"
                                : "➕ Tạo Suất chiếu"}
                        </h3>
                        <form onSubmit={handleSave} className="staff-showtime-modal-form">
                            <label>ID Rạp</label>
                            <input
                                name="theaterID"
                                type="number"
                                value={formData.theaterID}
                                onChange={handleFormChange}
                                required
                            />
                            <label>ID Phim</label>
                            <input
                                name="movieID"
                                type="number"
                                value={formData.movieID}
                                onChange={handleFormChange}
                                required
                            />
                            <label>Ngày chiếu</label>
                            <input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                required
                            />
                            <label>Giờ bắt đầu</label>
                            <input
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleFormChange}
                                required
                            />
                            <label>Giờ kết thúc</label>
                            <input
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleFormChange}
                                required
                            />
                            {errorMessage && (
                                <div className="staff-showtime-error-box">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="staff-showtime-modal-actions">
                                <button type="submit" className="staff-showtime-btn-primary">
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    className="staff-showtime-btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal - Seat Layout */}
            {isSeatModalOpen && (
                <div className="staff-showtime-modal-backdrop" onClick={() => setIsSeatModalOpen(false)}>
                    <div className="staff-showtime-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🪑 Sơ đồ ghế — Suất #{selectedShowtimeID}</h3>

                        <div className="staff-showtime-seat-layout">
                            {selectedShowtimeSeats.length === 0 ? (
                                <p className="staff-showtime-no-seat-data">
                                    Không có dữ liệu ghế.
                                </p>
                            ) : (
                                ["H", "G", "F", "E", "D", "C", "B", "A"].map((row) => {
                                    let rowSeats = selectedShowtimeSeats
                                        .filter((seat) => seat.row === row)
                                        .sort((a, b) => a.number - b.number);

                                    // ✅ Xử lý riêng cho hàng H
                                    if (row === "H") {
                                        // Ẩn H5 và H6
                                        rowSeats = rowSeats.filter(
                                            (s) => s.number !== 5 && s.number !== 6
                                        );

                                        // Gán ghế đôi
                                        rowSeats = rowSeats.map((s) => {
                                            if (
                                                (s.number === 1 || s.number === 2 || s.number === 3 || s.number === 4 ||
                                                    s.number === 7 || s.number === 8 || s.number === 9 || s.number === 10)
                                            ) {
                                                return { ...s, type: "Couple" };
                                            }
                                            return s;
                                        });
                                    }

                                    const left = rowSeats.filter((s) => s.number <= 5);
                                    const right = rowSeats.filter((s) => s.number > 5);

                                    const renderSeat = (seat) => (
                                        <div
                                            key={seat.seatID}
                                            className={`staff-showtime-seat-box ${seat.status === "SOLD"
                                                ? "staff-showtime-sold"
                                                : seat.status === "UNAVAILABLE"
                                                    ? "staff-showtime-unavailable"
                                                    : seat.type === "VIP"
                                                        ? "staff-showtime-vip"
                                                        : seat.type === "Couple"
                                                            ? "staff-showtime-couple"
                                                            : "staff-showtime-standard"
                                                }`}
                                            title={`Ghế ${seat.row}${seat.number} — ${seat.status === "SOLD"
                                                ? "Đã bán"
                                                : seat.status === "UNAVAILABLE"
                                                    ? "Không sử dụng"
                                                    : seat.type
                                                }`}
                                            onClick={() => {
                                                if (seat.status !== "SOLD" && seat.status !== "UNAVAILABLE") {
                                                    alert(`🪑 Bạn đã chọn ghế ${seat.row}${seat.number}`);
                                                }
                                            }}
                                        >
                                            {seat.number}
                                        </div>
                                    );

                                    return (
                                        <div key={row} className="staff-showtime-seat-row">
                                            <span className="staff-showtime-seat-row-label">{row}</span>
                                            <div className="staff-showtime-seat-group">{left.map(renderSeat)}</div>
                                            <div className="staff-showtime-aisle"></div>
                                            <div className="staff-showtime-seat-group">{right.map(renderSeat)}</div>
                                            <span className="staff-showtime-seat-row-label">{row}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="staff-showtime-seat-legend">
                            <span><div className="staff-showtime-legend-box staff-showtime-standard"></div> Standard</span>
                            <span><div className="staff-showtime-legend-box staff-showtime-vip"></div> VIP</span>
                            <span><div className="staff-showtime-legend-box staff-showtime-couple"></div> Couple</span>
                            <span><div className="staff-showtime-legend-box staff-showtime-sold"></div> Đã bán</span>
                            <span><div className="staff-showtime-legend-box staff-showtime-unavailable"></div> Không sử dụng</span>
                        </div>

                        <div className="staff-showtime-modal-actions">
                            <button className="staff-showtime-btn-secondary" onClick={() => setIsSeatModalOpen(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Showtime;