import { useState } from "react"
import "../css/ThreatherReport.css";

const errorOptions = {
  thietBi: ["Máy chiếu", "Màn hình", "Điều hòa", "Khác"],
  ghe: ["Ghế hỏng", "Ghế bẩn", "Ghế kẹt", "Khác"],
  amThanh: ["Loa rè", "Không có tiếng", "Âm lượng nhỏ", "Khác"],
  anhSang: ["Đèn yếu", "Đèn nhấp nháy", "Môi trường ồn", "Khác"],
};

const ThreatherReport = () => {
    const [selectedErrors, setSelectedErrors] = useState({
      thietBi: [],
      ghe: [],
      amThanh: [],
      anhSang: [],
    });
    const [description, setDescription] = useState("");

    const handleCheck = (group, value, checked) => {
      setSelectedErrors(prev => ({
        ...prev,
        [group]: checked
          ? [...prev[group], value]
          : prev[group].filter(item => item !== value)
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      alert(
        `Thiết bị: ${selectedErrors.thietBi.join(", ")}\n` +
        `Ghế: ${selectedErrors.ghe.join(", ")}\n` +
        `Âm thanh: ${selectedErrors.amThanh.join(", ")}\n` +
        `Ánh sáng & môi trường: ${selectedErrors.anhSang.join(", ")}\n` +
        `Mô tả: ${description}`
      );
    };

    return (
        <div className="threather">
            <div className="threather-detail" >
                <h2>Báo cáo rạp</h2>
                <form onSubmit={handleSubmit} >
                  <div className="report-row">
                    <div className="report-group">
                      <b>Thiết bị phòng chiếu:</b><br/>
                      {errorOptions.thietBi.map(opt => (
                        <label key={opt}>
                          <input
                            type="checkbox"
                            checked={selectedErrors.thietBi.includes(opt)}
                            onChange={e => handleCheck("thietBi", opt, e.target.checked)}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                    <div className="report-group">
                      <b>Ghế:</b><br/>
                      {errorOptions.ghe.map(opt => (
                        <label key={opt}>
                          <input
                            type="checkbox"
                            checked={selectedErrors.ghe.includes(opt)}
                            onChange={e => handleCheck("ghe", opt, e.target.checked)}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="report-row">
                    <div className="report-group">
                      <b>Lỗi dịch vụ:</b><br/>
                      {errorOptions.amThanh.map(opt => (
                        <label key={opt}>
                          <input
                            type="checkbox"
                            checked={selectedErrors.amThanh.includes(opt)}
                            onChange={e => handleCheck("amThanh", opt, e.target.checked)}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                    <div className="report-group">
                      <b>Lỗi ánh sáng và môi trường:</b><br/>
                      {errorOptions.anhSang.map(opt => (
                        <label key={opt}>
                          <input
                            type="checkbox"
                            checked={selectedErrors.anhSang.includes(opt)}
                            onChange={e => handleCheck("anhSang", opt, e.target.checked)}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <b>Mô tả:</b><br/>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Mô tả chi tiết sự cố, phòng chiếu..."
                    />
                  </div>
                  <div className="report-submit">
                    <button className="review-btn" type="submit">Gửi báo cáo</button>
                  </div>
                </form>
            </div>
        </div>
    );
}
export default ThreatherReport;