import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import useMovies from '../hooks/useMovies'

export default function History() {
  const navigate = useNavigate()
  const { favorites, historyMovies, selectMovie, toggleFavorite } = useMovies()

  const openMovie = (movie) => {
    selectMovie(movie)
    navigate(`/movies/${movie._id}`)
  }

  return (
    <section className="catalog-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Cá nhân</p>
          <h2>Lịch sử xem</h2>
        </div>
      </div>
      {historyMovies.length ? (
        <div className="movie-grid">
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
        <div className="empty-state">Chưa có lịch sử xem.</div>
      )}
    </section>
  )
}
