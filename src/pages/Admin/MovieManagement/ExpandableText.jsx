import React, { useState } from "react";
import "./ExpandableText.css";

const ExpandableText = ({ text, maxLines = 2 }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return <span>-</span>;

    return (
        <div className="expandable-text">
            <div
                className={`text-content ${expanded ? "expanded" : ""}`}
                style={{ WebkitLineClamp: expanded ? "unset" : maxLines }}
            >
                {text}
            </div>
            {text.length > 60 && (
                <button
                    className="expand-btn"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                </button>
            )}
        </div>
    );
};

export default ExpandableText;
