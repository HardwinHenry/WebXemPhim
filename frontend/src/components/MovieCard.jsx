import { Heart, Play } from 'lucide-react'

export default function MovieCard({ isFavorite, movie, onFavorite, onSelect }) {
  return (
    <article className="movie-card">
      <button className="poster-button" onClick={() => onSelect(movie)} type="button">
        <img src={movie.posterUrl} alt={movie.title} />
        <span>
          <Play size={18} fill="currentColor" />
        </span>
      </button>
      <div className="movie-copy">
        <div>
          <strong>{movie.title}</strong>
          <small>
            {movie.genreName} · {movie.duration} phút
          </small>
        </div>
        <button className="icon-button" onClick={() => onFavorite(movie._id)} type="button" title="Yêu thích">
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}
