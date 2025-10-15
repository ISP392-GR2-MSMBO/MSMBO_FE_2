import '../phim-css/Phim.css';
const movies = [
    {
        id: 1,
        title: "Avenger: Endgame",
        genre: "Hành động, Viễn tưởng",
        duration: "181 phút",
        poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/a/4/a4_406.jpg"
    },
    {
        id: 2,
        title: "Frozen 2",
        genre: "Hoạt hình, phiêu lưu",
        duration: "103 phút",
        poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0VL9w43sZ8DbSyfyh0tfTNw8437Mi5IUxg&s"
    },
    {
        id: 3,
        title: "The Lion King",
        genre: "Hoạt hình, phiêu lưu",
        duration: "148 phút",
        poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/r/s/rsz_lion_king_poster__vst__final_2.jpg"
    },
    {
        id: 4,
        title: "Spider Man: No Way Home",
        genre: "Hành động, Phiêu lưu",
        duration: "118 phút",
        poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/s/n/snwh_new_fb1080x1350_1_.jpg"
    },
    {
        id: 5,
        title: "Titanic",
        genre: "Tình cảm, Chính kịch",
        duration: "195 phút",
        poster: "https://upload.wikimedia.org/wikipedia/vi/a/ab/Titanic_3D_poster_Vietnam.jpg"
    },
    {
        id: 6,
        title: "Inception",
        genre: "Hành động, Khoa học kĩ thuật",
        duration: "148 phút",
        poster: "https://m.media-amazon.com/images/M/MV5BMjExMjkwNTQ0Nl5BMl5BanBnXkFtZTcwNTY0OTk1Mw@@._V1_.jpg://via.placeholder.com/150x200?text=Inception"
    },
    {
        id: 7,
        title: "IT chapter 2",
        genre: "Kinh dị, siêu nhiên",
        duration: "169 phút",
        poster: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/r/s/rsz_it_chapter_two-_vietnamese_poster_2.jpg"
    }
]
const Phim = () => {
    return (
       <div className="page">
      <h2>Phim đang chiếu</h2>

      {/* Danh sách phim */}
      <div className="movies">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            
            <img src={movie.poster} alt={movie.title} />

            
            <h3 className='movie-info'>{movie.title}</h3>
            <p>Thể loại: {movie.genre}</p>
            <p>Thời lượng: {movie.duration}</p>

            
            <button className="buy-button">Mua vé</button>
          </div>
        ))}
      </div>
    </div>
    );
}
export default Phim;

