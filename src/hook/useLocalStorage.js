// ✅ Hook dùng để lưu user vào localStorage + re-render realtime
import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
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
            // 🔔 Báo cho các component khác biết user đã thay đổi
            window.dispatchEvent(new Event("userChange"));
        } catch (error) {
            console.error(error);
        }
    };

    // Lắng nghe thay đổi
    useEffect(() => {
        const handleChange = () => {
            const item = localStorage.getItem(key);
            setStoredValue(item ? JSON.parse(item) : initialValue);
        };

        window.addEventListener("userChange", handleChange);
        return () => window.removeEventListener("userChange", handleChange);
    }, [key, initialValue]);

    return [storedValue, setValue];
}
