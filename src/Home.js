import MovieList from "./component-phim/MovieList";
import useFetch from "./useFetch";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ✅ Danh sách banner
const banners = [
    {
        id: 1,
        image: "https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/slider/bannenr.jpg",
    },
    {
        id: 2,
        image: "https://shortlink.vn/wp-content/uploads/2025/05/shortlink-vn-203.jpg",
    },
    {
        id: 3,
        image: "https://ddcinema.vn/Areas/Admin/Content/Fileuploads/images/slider/banner%20tu%20chien%20tren%20khong.jpg",
    },
];

// ✅ Mock data phim (hiện ở phần Phim nổi bật)
const movies = [
    {
        id: 1,
        title: "Doraemon: Nobita và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh",
        genre: "Hoạt Hình",
        duration: 180,
        poster:
            "https://upload.wikimedia.org/wikipedia/vi/5/5d/Doraemon_Movie_2025_Poster.jpg",
        trailer: "https://youtu.be/nDR_9NCMIYk",
    },
    {
        id: 2,
        title: "Your Name",
        genre: "Hoạt hình, Tình cảm, Phiêu lưu",
        duration: 106, // phút
        poster: "https://upload.wikimedia.org/wikipedia/vi/0/01/Poster_Your_Name_H%C3%A0n_Qu%E1%BB%91c_ch%C3%A0o_m%E1%BB%ABng_3_tri%E1%BB%87u_l%C6%B0%E1%BB%A3t_xem.jpg",
        trailer: "https://youtu.be/xU47nhruN-Q",
    },
    {
        id: 3,
        title: "Doctor Strange",
        genre: "Kỳ ảo",
        duration: 126,
        poster: "https://image.tmdb.org/t/p/w500/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
        trailer: "https://www.youtube.com/watch?v=aWzlQ2N6qqg",
    },
    {
        id: 4,
        title: "Spider-Man: No Way Home",
        genre: "Siêu anh hùng",
        duration: 150,
        poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        trailer: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
    },
    {
        id: 5,
        title: "Black Panther: Wakanda Forever",
        genre: "Hành động",
        duration: 161,
        poster: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
        trailer: "https://www.youtube.com/watch?v=_Z3QKkl1WyM",
    },
    {
        id: 6,
        title: "The Batman",
        genre: "Hành động",
        duration: 176,
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        trailer: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    },
    {
        id: 7,
        title: "Thor: Love and Thunder",
        genre: "Siêu anh hùng",
        duration: 119,
        poster: "https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
        trailer: "https://www.youtube.com/watch?v=Go8nTmfrQd8",
    },
    {
        id: 8,
        title: "Guardians of the Galaxy Vol. 3",
        genre: "Hành động",
        duration: 150,
        poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        trailer: "https://www.youtube.com/watch?v=u3V5KDHRQvk",
    },
];

const Home = () => {
    // ✅ Lấy dữ liệu từ API
    const { error, isPending, data: blogs } = useFetch("http://localhost:8000/blogs");

    // ✅ Cấu hình slider
    const settings = {
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
        <div className="home">
            {/* 🎬 Banner slider */}
            <Slider {...settings} className="banner-slider">
                {banners.map((banner) => (
                    <div key={banner.id} className="banner-item" style={{ position: "relative" }}>
                        <img
                            src={banner.image}
                            alt={banner.title}
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

            {/* 🎬 Tiêu đề */}
            <h2 className="section-title">Phim nổi bật</h2>

            {isPending && <div>Loading...</div>}

            {/* 🎬 Hiển thị danh sách phim */}
            <MovieList movies={blogs || movies} />
        </div>
    );
};

export default Home;
