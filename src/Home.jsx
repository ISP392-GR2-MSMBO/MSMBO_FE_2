import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieListSlider from "./pages/Customer/MovieList";
// 💡 Cần import movieApi để gọi API
import { movieApi } from "./api/movieApi";

// ❌ LOẠI BỎ: const banners = [...]

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [apiBanners, setApiBanners] = useState([]); // State mới cho banner động
    const [loading, setLoading] = useState(true);

    // --- Hàm Tải Banner từ API ---
    const fetchBanners = async () => {
        try {
            // ✅ Lấy tất cả phim để lọc
            const data = await movieApi.getMovies();

            // Lọc các phim đủ điều kiện làm banner
            const filteredBanners = data
                .filter(
                    (m) =>
                        m.banner && // Phải có URL banner
                        m.approveStatus === "APPROVE" && // Phải được duyệt
                        m.deleted !== true // Phải không bị xóa
                )
                .slice(0, 5); // Giới hạn số lượng banner (ví dụ 5)

            setApiBanners(filteredBanners);
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách banner:", error);
            setApiBanners([]);
        }
    };

    // --- Hàm Tải Phim Now Showing (Giữ nguyên logic lọc) ---
    const fetchNowShowing = async () => {
        try {
            // 💡 TỐT HƠN NÊN DÙNG movieApi.getNowShowing() đã có logic lọc
            const res = await fetch("https://api-movie6868.purintech.id.vn/api/movie/status/now-showing");
            const data = await res.json();

            const filtered = data.filter(
                (m) =>
                    m.status &&
                    m.status.toLowerCase() === "now showing" &&
                    m.approveStatus === "APPROVE" &&
                    m.deleted !== true
            );

            setMovies(filtered);
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách phim:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // ✅ Gọi cả hai hàm để tải dữ liệu
        fetchBanners();
        fetchNowShowing();
    }, []);

    // ⚙️ Cấu hình banner slider (Giữ nguyên)
    const bannerSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <div className="home px-4 md:px-8">
            {/* 🎬 Banner slider */}
            {/* Chỉ hiển thị Slider nếu có banner */}
            {apiBanners.length > 0 && (
                <Slider {...bannerSettings} className="banner-slider mt-4">
                    {/* ✅ Dùng apiBanners động */}
                    {apiBanners.map((banner) => (
                        <div key={banner.movieID} className="banner-item">
                            <img
                                // ✅ Lấy URL từ trường 'banner' của object phim gốc
                                src={banner.banner}
                                alt={banner.movieName || "banner"}
                                style={{
                                    width: "100%",
                                    height: "500px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                            />
                        </div>
                    ))}
                </Slider>
            )}

            <h2 className="section-title text-center text-2xl font-bold mt-8">
                🎬 Phim nổi bật
            </h2>

            {loading ? (
                <div className="fullscreen-spinner text-center mt-10">
                    <ClipLoader color="#ff0055" size={70} />
                    <p className="text-gray-400 mt-3">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <MovieListSlider movies={movies} />
            )}
        </div>
    );
};

export default Home;