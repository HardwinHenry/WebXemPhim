import { Heart, Info, Play, Plus, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getContentSummary } from '../utils/movieContent'
import { formatViews } from '../utils/helpers'
import { resolveMediaUrl } from '../services/api'

export default function HeroBanner({ featured, related = [], favorites, onSelect, onFavorite }) {
  const navigate = useNavigate()

  const goWatch = (movie) => {
    onSelect(movie)
    navigate(`/movies/${movie._id}`)
  }

  if (!featured) return null

  const isFav = favorites.includes(featured._id)

  return (
    <section className="hero">
      <div className="hero-media">
        <img
          src={resolveMediaUrl(featured.posterUrl)}
          alt=""
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80'
          }}
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-scanline" />

      <div className="hero-particles">
        <div
          className="hero-particle"
          style={{ width: 280, height: 280, top: '15%', left: '8%', animationDelay: '0s' }}
        />
        <div
          className="hero-particle"
          style={{
            width: 360,
            height: 360,
            top: '50%',
            right: '5%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="hero-particle"
          style={{
            width: 220,
            height: 220,
            bottom: '10%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      <div className="hero-content">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-info">
              <span className="hero-eyebrow">
                <span className="dot" />
                {featured.genreName || 'Phim nổi bật'} · {featured.quality || '4K Ultra HD'}
              </span>
              <h1 className="hero-title">{featured.title}</h1>
              <div className="hero-meta">
                <span className="hero-rating">
                  <Star size={14} fill="currentColor" />
                  {featured.rating || '4.8'}
                </span>
                <span className="hero-meta-divider" />
                <span className="hero-meta-item">{getContentSummary(featured)}</span>
                <span className="hero-meta-divider" />
                <span className="hero-meta-item">{formatViews(featured.views)} lượt xem</span>
                <span className="hero-meta-divider" />
                <span className="hero-meta-item">{featured.year || '—'}</span>
              </div>
              <p className="hero-description">{featured.description}</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => goWatch(featured)} type="button">
                  <Play size={18} fill="currentColor" />
                  Xem ngay
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => onFavorite(featured._id)}
                  type="button"
                >
                  {isFav ? <Heart size={18} fill="currentColor" /> : <Plus size={18} />}
                  {isFav ? 'Đã yêu thích' : 'Thêm vào danh sách'}
                </button>
                <button className="btn-ghost" type="button" aria-label="Thông tin">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="hero-side">
                {related.slice(0, 3).map((m, i) => (
                  <button
                    className="hero-side-card"
                    key={m._id}
                    onClick={() => goWatch(m)}
                    type="button"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <img
                      className="hero-side-thumb"
                      src={resolveMediaUrl(m.posterUrl)}
                      alt={m.title}
                      loading="lazy"
                    />
                    <div className="hero-side-info">
                      <small>Gợi ý #{i + 1}</small>
                      <strong>{m.title}</strong>
                      <p>{m.genreName} · {getContentSummary(m)}</p>
                    </div>
                    <Play size={16} fill="currentColor" style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
