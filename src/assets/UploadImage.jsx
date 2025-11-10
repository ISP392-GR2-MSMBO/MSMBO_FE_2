import React, { useState } from "react";

const UploadImage = ({ onUpload }) => {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "movie-upload1"); // preset bạn tạo
        formData.append("cloud_name", "dmprbuogr");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dmprbuogr/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setLoading(false);
            onUpload(data.secure_url); // Trả URL về parent
        } catch (err) {
            console.error("Upload error:", err);
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleUpload} />
            {loading && <p>Đang tải ảnh lên Cloudinary...</p>}
        </div>
    );
};

export default UploadImage;
