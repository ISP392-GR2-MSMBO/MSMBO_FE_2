import axios from "axios";

const BASE_URL = "https://api-movie6868.purintech.id.vn/api/movie";

export const movieApi = {
    // 🟢 Lấy danh sách phim
    getMovies: async () => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(BASE_URL, config);
        return res.data;
    },

    // 🟢 Lấy phim theo ID
    getMovieById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${BASE_URL}/${id}`, config);
        return res.data;
    },

    // 🟢 Thêm phim mới
    addMovie: async (movieData) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const res = await axios.post(BASE_URL, movieData, config);
        return res.data;
    },

    // 🟠 Cập nhật phim
    updateMovie: async (id, movieData) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const res = await axios.put(`${BASE_URL}/${id}`, movieData, config);
        return res.data;
    },

    // 🔴 Xóa phim
    deleteMovie: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.delete(`${BASE_URL}/${id}`, config);
        return res.data;
    },

    // 🖼️ Upload ảnh poster/banner lên Cloudinary
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "movie-upload1");

        const res = await fetch("https://api.cloudinary.com/v1_1/dmprbuogr/image/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) throw new Error("Không thể upload ảnh lên Cloudinary");
        return data.secure_url;
    },

    // 🖼️ Cập nhật banner phim qua API riêng
    updateBanner: async (movieId, bannerUrl) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };

        await axios.put(
            `${BASE_URL}/${movieId}/banner`,
            { banner: bannerUrl },
            config
        );

        return bannerUrl;
    },
};
