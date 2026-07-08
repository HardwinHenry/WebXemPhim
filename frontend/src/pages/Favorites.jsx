import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import useMovies from '../hooks/useMovies'

export default function Favorites() {
  const navigate = useNavigate()
  const { favoriteMovies, favorites, selectMovie, toggleFavorite } = useMovies()

  const openMovie = (movie) => {
    selectMovie(movie)
    navigate(`/movies/${movie._id}`)
  }

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <span className="section-eyebrow">Cá nhân</span>
          <h1 className="page-title">
            <Heart
              size={28}
              style={{ display: 'inline', verticalAlign: '-4px', marginRight: 10, color: '#ec4899' }}
              fill="#ec4899"
            />
            Danh sách yêu thích
          </h1>
          <p className="page-subtitle">
            Những bộ phim bạn đã đánh dấu — luôn sẵn sàng để xem lại bất cứ lúc nào.
          </p>
        </div>

        {favoriteMovies.length ? (
          <div className="movie-grid stagger">
            {favoriteMovies.map((movie) => (
              <MovieCard
                isFavorite={favorites.includes(movie._id)}
                key={movie._id}
                movie={movie}
                onFavorite={toggleFavorite}
                onSelect={openMovie}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Bạn chưa thêm phim yêu thích nào. Khám phá ngay!
          </div>
        )}
      </div>
    </div>
  )
}
