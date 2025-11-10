import axios from "axios";

export const movieApi = {
    // Lấy tất cả phim
    getMovies: async () => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/movie`, config);
        return res.data;
    },
    getNowShowing: async () => {
        const res = await axios.get("https://api-movie6868.purintech.id.vn/api/movie/status/now-showing");
        // ✅ Lọc phim đã duyệt và chưa xóa
        return res.data.filter(movie => movie.approveStatus === "APPROVE" && movie.deleted !== true);
    },


    getMovieByName: async (name) => {
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/movie/${name}`);
        return Array.isArray(res.data) ? res.data[0] : res.data;
    },

    // 🎞 Lấy phim sắp chiếu (Coming Soon)
    getComingSoon: async () => {
        const res = await axios.get("https://api-movie6868.purintech.id.vn/api/movie/status/coming-soon");
        return res.data.filter(movie => movie.approveStatus === "APPROVE" && movie.deleted !== true);
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
        const res = await axios.post("https://api-movie6868.purintech.id.vn/api/movie", movieData, config);
        return res.data;
    },

    // Cập nhật phim
    updateMovie: async (id, data) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.put(`https://api-movie6868.purintech.id.vn/api/movie/${id}`, data, config);
        return res.data;
    },

    // Xóa phim
    deleteMovie: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.delete(`https://api-movie6868.purintech.id.vn/api/movie/${id}`, config);
        return res.data;
    },



    // ==== Duyệt phim ====
    approveMovie: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.post(`https://api-movie6868.purintech.id.vn/api/movie/${id}/approve`, {}, config);
        return res.data;
    },

    // ==== Từ chối phim ====
    rejectMovie: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.post(`https://api-movie6868.purintech.id.vn/api/movie/${id}/reject`, {}, config);
        return res.data;
    },
    // 🖼️ Upload ảnh poster/banner lên Cloudinary
    uploadPoster: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "movie-upload1");
        const res = await fetch("https://api.cloudinary.com/v1_1/dmprbuogr/image/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url) {
            throw new Error("Không thể upload ảnh lên Cloudinary");
        }

        return data.secure_url; // ✅ trả về link ảnh
    },



    // 🟢 Lấy phim theo ID
    getMovieById: async (id) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`https://api-movie6868.purintech.id.vn/api/movie/${id}`, config);
        return res.data;
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
            `https://api-movie6868.purintech.id.vn/api/movie/${movieId}/banner`,
            { banner: bannerUrl },
            config
        );

        return bannerUrl;
    },
};



