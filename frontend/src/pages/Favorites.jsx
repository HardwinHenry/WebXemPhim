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
    <section className="catalog-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Cá nhân</p>
          <h2>Danh sách yêu thích</h2>
        </div>
      </div>
      {favoriteMovies.length ? (
        <div className="movie-grid">
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
        <div className="empty-state">Bạn chưa thêm phim yêu thích.</div>
      )}
    </section>
  )
}
