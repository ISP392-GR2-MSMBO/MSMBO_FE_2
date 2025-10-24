import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieListSlider from "./pages/Customer/MovieList";

// 🎬 Danh sách banner
const banners = [
    {
        id: 1,
        image:
            "https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/07/26020157/poster-phim-kinh-di-1024x576.jpg",
    },
    {
        id: 2,
        image: "https://shortlink.vn/wp-content/uploads/2025/05/shortlink-vn-203.jpg",
    },
    {
        id: 3,
        image:
            "https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/slider/quy%20an%20tang%203.jpg",
    },
];

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNowShowing = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/movie/status/now-showing");
                const data = await res.json();

                // Chỉ lấy phim "Now Showing" và đã được duyệt
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

        fetchNowShowing();
    }, []);

    // ⚙️ Cấu hình banner slider
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
            <Slider {...bannerSettings} className="banner-slider mt-4">
                {banners.map((banner) => (
                    <div key={banner.id} className="banner-item">
                        <img
                            src={banner.image}
                            alt="banner"
                            style={{
                                width: "100%",
                                height: "450px",
                                objectFit: "cover",
                                borderRadius: "10px",
                            }}
                        />
                    </div>
                ))}
            </Slider>

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
