import { useParams } from "react-router-dom";
import movies from "./MovieData";
import "../phim-css/MovieDetail.css";

const MovieDetail = () => {
    const { id } = useParams();
    const movie = movies.find((m) => m.id === parseInt(id));

    console.log("Movie data:", movie); // kiểm tra dữ liệu

    if (!movie) return <h2>Không tìm thấy phim</h2>;

    return (
        <div className="movie-detail-page">
            {/* Trailer */}
            <div className="trailer-section">
                <iframe
                    src={movie.trailer}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Info */}
            <div className="detail-container">
                {/* Poster */}
                <div className="poster">
                    <img src={movie.image} alt={movie.title} />
                </div>

                {/* Nội dung phim */}
                <div className="info">
                    <h1 className="title">{movie.title}</h1>

                    <p><strong>⏳ Thời lượng:</strong> {movie.duration}</p>
                    <p><strong>📅 Ngày khởi chiếu:</strong> {movie.releaseDate}</p>
                    <p><strong>🌍 Quốc gia:</strong> {movie.country}</p>
                    <p><strong>🏢 Nhà sản xuất:</strong> {movie.studio}</p>
                    <p><strong>🎬 Đạo diễn:</strong> {movie.director}</p>

                    {/* Tags */}
                    <div className="tags">
                        <strong>📖 Thể loại:</strong>
                        {movie.genre.map((g, i) => (
                            <span key={i} className="tag">{g}</span>
                        ))}
                    </div>

                    {/* Cast */}
                    <div className="cast">
                        <strong>🎭 Diễn viên:</strong>
                        {movie.cast.map((actor, i) => (
                            <span key={i} className="actor">{actor}</span>
                        ))}
                    </div>



                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
