import { History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import useMovies from '../hooks/useMovies'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { favorites, historyMovies, selectMovie, toggleFavorite } = useMovies()

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
            <History
              size={28}
              style={{
                display: 'inline',
                verticalAlign: '-4px',
                marginRight: 10,
                color: '#22d3ee',
              }}
            />
            Lịch sử xem
          </h1>
          <p className="page-subtitle">
            Tiếp tục xem những bộ phim bạn đã bắt đầu hoặc đã xem gần đây.
          </p>
        </div>

        {historyMovies.length ? (
          <div className="movie-grid stagger">
            {historyMovies.map((movie) => (
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
          <div className="empty-state">Chưa có lịch sử xem phim.</div>
        )}
      </div>
    </div>
  )
}
