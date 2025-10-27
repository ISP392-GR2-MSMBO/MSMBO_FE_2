// ✅ Hook lưu và cập nhật localStorage realtime, chống lỗi dữ liệu cũ
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            if (!item || item === "undefined" || item === "null" || item === "{}") {
                localStorage.removeItem(key);
                return initialValue;
            }
            return JSON.parse(item);
        } catch {
            localStorage.removeItem(key);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);
            if (value === null || value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
            // 🔄 Re-render realtime
            window.dispatchEvent(new Event("storageChange"));
        } catch (error) {
            console.error("❌ useLocalStorage set error:", error);
        }
    };

    useEffect(() => {
        const handleChange = () => {
            try {
                const item = localStorage.getItem(key);
                setStoredValue(item ? JSON.parse(item) : initialValue);
            } catch {
                setStoredValue(initialValue);
            }
        };
        window.addEventListener("storageChange", handleChange);
        window.addEventListener("storage", handleChange); // Đồng bộ giữa nhiều tab
        return () => {
            window.removeEventListener("storageChange", handleChange);
            window.removeEventListener("storage", handleChange);
        };
    }, [key, initialValue]);

    return [storedValue, setValue];
}
