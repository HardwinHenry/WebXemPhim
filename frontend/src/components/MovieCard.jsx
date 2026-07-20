import { Eye, Heart, Play, Star } from 'lucide-react'
import { getContentBadge, getContentSummary } from '../utils/movieContent'
import { formatViews } from '../utils/helpers'
import { resolveMediaUrl } from '../services/api'

export default function MovieCard({ isFavorite, movie, onFavorite, onSelect }) {
  const handleFavorite = (e) => {
    e.stopPropagation()
    onFavorite(movie._id)
  }

  return (
    <article className="movie-card">
      <div
        className="movie-poster"
        onClick={() => onSelect(movie)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(movie) }}
        aria-label={`Xem phim ${movie.title}`}
      >
        <img
          src={resolveMediaUrl(movie.posterUrl)}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80'
          }}
        />
        <span className="movie-quality">{movie.quality || 'HD'}</span>
        <span className="movie-type-badge">{getContentBadge(movie)}</span>
        <button
          className={`movie-fav ${isFavorite ? 'active' : ''}`}
          onClick={handleFavorite}
          type="button"
          title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <div className="movie-play">
          <span className="movie-play-icon">
            <Play size={24} fill="currentColor" />
          </span>
        </div>
      </div>

      <div className="movie-info">
        <div className="movie-rating">
          <span className="star">
            <Star size={12} fill="currentColor" />
            {movie.rating || '4.5'}
          </span>
          <span className="dot" />
          <span className="views">
            <Eye size={11} />
            {formatViews(movie.views)}
          </span>
        </div>
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span>{movie.genreName || 'Phim'}</span>
          <span className="dot" />
          <span>{getContentSummary(movie)}</span>
        </div>
      </div>
    </article>
  )
}
