import { useState } from "react";
import "../phim-css/PhimSapChieu.css";

const comingMovies = [
  {
    id: 1,
    title: "Avatar: Way of Water",
    genre: "Hành động, Khoa học Viễn Tưởng",
    duration: "196 phút",
    date: "02-10-2025",
    poster:
      "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/a/v/avatar_2_payoff_posster_2_.jpg",
  },
  {
    id: 2,
    title: "Avatar: Fire and Ash",
    genre: "Hành động, Khoa học Viễn Tưởng",
    duration: "196 phút",
    date: "19-12-2025",
    poster:
      "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/a/v/avatar3_teaser_poster_vietnam.jpg", 
  },
];

const PhimSapChieu = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Khi bấm mũi tên phải
  const nextMovie = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % comingMovies.length);
  };

  // Khi bấm mũi tên trái
  const prevMovie = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + comingMovies.length) % comingMovies.length
    );
  };

  const currentMovie = comingMovies[currentIndex];

  return (
    <div className="coming-movie-page">
      <h2 className="title">Phim Sắp Chiếu</h2>

      <div className="movie-container">
        <button className="arrow-btn" onClick={prevMovie}>
          &lt;
        </button>

        <img
          src={currentMovie.poster}
          alt={currentMovie.title}
          className="poster"
        />

        <div className="movie-infor">
          <h3>{currentMovie.title}</h3>
          <p>
            <strong>Thể loại:</strong> {currentMovie.genre}
          </p>
          <p>
            <strong>Thời lượng:</strong> {currentMovie.duration}
          </p>
          <p>
            <strong>Ngày công chiếu:</strong> {currentMovie.date}
          </p>
        </div>

        <button className="arrow-btn" onClick={nextMovie}>
          &gt;
        </button>
      </div>

      <footer className="footer">
        © 2025 Cinema. <a href="/contact">Liên hệ</a> |{" "}
        <a href="/terms">Điều khoản</a>
      </footer>
    </div>
  );
};

export default PhimSapChieu;
