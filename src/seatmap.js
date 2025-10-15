// Seatmap.jsx
import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const Seatmap = () => {
    const { id } = useParams(); // movieId từ route /seatmap/:id
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { time, format } = state;

    return (
        <div style={{ padding: 24 }}>
            <h2>Seatmap — Phim #{id}</h2>
            {time ? (
                <>
                    <p>Suất: <strong>{time}</strong> {format ? `- ${format}` : ""}</p>

                    {/* <-- đây là ví dụ placeholder cho layout ghế.
               Thay bằng component seatmap thực tế của bạn
          */}
                    <div style={{
                        marginTop: 20,
                        width: "100%",
                        maxWidth: 800,
                        border: "1px dashed #ccc",
                        padding: 16,
                        borderRadius: 8
                    }}>
                        <p>(Place your seatmap UI here)</p>
                        {/* ví dụ ghế: */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
                            {Array.from({ length: 32 }).map((_, i) => (
                                <button key={i} style={{
                                    padding: 12,
                                    borderRadius: 6,
                                    border: "1px solid #999",
                                    background: "#fff",
                                    cursor: "pointer"
                                }}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <p>Không có dữ liệu suất chiếu. Vui lòng chọn lại.</p>
            )}

            <div style={{ marginTop: 20 }}>
                <button onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
};

export default Seatmap;
