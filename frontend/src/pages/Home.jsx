import { Heart, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import useMovies from '../hooks/useMovies'

export default function Home() {
  const navigate = useNavigate()
  const { favorites, featuredMovie, movies, selectMovie, toggleFavorite } = useMovies()

  const watchMovie = (movie) => {
    selectMovie(movie)
    navigate(`/movies/${movie._id}`)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Website xem phim trực tuyến</p>
          <h1>Khám phá phim mới hôm nay</h1>
        </div>
      </header>

      <section className="hero-panel">
        <img src={featuredMovie.posterUrl} alt="" />
        <div className="hero-content">
          <span>{featuredMovie.genreName}</span>
          <h2>{featuredMovie.title}</h2>
          <p>{featuredMovie.description}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => watchMovie(featuredMovie)} type="button">
              <Play size={18} fill="currentColor" />
              Xem ngay
            </button>
            <button className="icon-button" onClick={() => toggleFavorite(featuredMovie._id)} type="button" title="Yêu thích">
              <Heart size={18} fill={favorites.includes(featuredMovie._id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </section>

      <section className="catalog-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nổi bật</p>
            <h2>Phim đang xem nhiều</h2>
          </div>
        </div>
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              isFavorite={favorites.includes(movie._id)}
              key={movie._id}
              movie={movie}
              onFavorite={toggleFavorite}
              onSelect={watchMovie}
            />
          ))}
        </div>
      </section>
    </>
  )
}
