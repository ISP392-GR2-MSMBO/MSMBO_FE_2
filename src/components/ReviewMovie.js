import "../css/ReviewMovie.css";
import React, { useState } from "react";

const movies = [
  {
    id: 1,
    title: "Dune Part 2",
    genre: "Khoa học viễn tưởng, Phiêu lưu",
    duration: "155 phút",
    poster: "https://www.bhdstar.vn/wp-content/uploads/2024/02/referenceSchemeHeadOfficeallowPlaceHoldertrueheight700ldapp-2.jpg",
    description: "Cuộc phiêu lưu tiếp theo trên hành tinh sa mạc Arrakis...",
  },
  {
    id: 2,
    title: "Avatar 3: Fire and Ashes",
    genre: "Khoa học viễn tưởng, Phiêu lưu",
    duration: "166 phút",
    poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/a/v/avatar3_teaser_poster_vietnam.jpg",
    description: "Tiếp tục hành trình của người Navi trên Pandora...",
  },
  {
    id: 3,
    title: "Top Gun Maverkick",
    genre: "Hành động, phiêu lưu",
    duration: "130 phút",
    poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/p/h/phi-cong-sieu-dang.jpg",
    description: "Phi công Maverick trở lại với những pha hành động nghẹt thở...",
  },
];

const ReviewMovie = () => {
  const [selectedId, setSelectedId] = useState(movies[0].id);
  const [search, setSearch] = useState("");
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );
  const selectedMovie =
    movies.find((m) => m.id === selectedId) || filteredMovies[0];

  return (
    <div className="review-movie">
      <div className="review-sidebar">
        <h3>Danh sách phim</h3>
        <input
          type="search"
          placeholder="Tìm phim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="review-search-input"
        />
        <ul>
          {filteredMovies.map((movie) => (
            <li
              key={movie.id}
              className={selectedId === movie.id ? "active" : ""}
              onClick={() => setSelectedId(movie.id)}
            >
              {movie.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="review-detail">
        {selectedMovie ? (
          <>
            <h2>{selectedMovie.title}</h2>
            <img
              src={
                selectedMovie.poster ||
                "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={selectedMovie.title}
            />
            <p>
              <b>Thể loại:</b> {selectedMovie.genre}
            </p>
            <p>
              <b>Thời lượng:</b> {selectedMovie.duration}
            </p>
            <p>
              <b>Mô tả:</b> {selectedMovie.description}
            </p>
          </>
        ) : (
          <p>Không tìm thấy phim phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewMovie;