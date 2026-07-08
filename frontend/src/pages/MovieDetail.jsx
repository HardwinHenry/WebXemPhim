import {
  Calendar,
  Clock3,
  Eye,
  Film,
  Heart,
  MessageCircle,
  Play,
  Star,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import useMovies from '../hooks/useMovies'
import { formatViews } from '../utils/helpers'

const RATING_LABELS = {
  1: 'Tệ',
  2: 'Tạm được',
  3: 'Bình thường',
  4: 'Hay',
  5: 'Tuyệt vời!',
}

function RatingStars({ value = 0, size = 14 }) {
  return (
    <span className="stars" style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(value) ? '#fbbf24' : 'none'}
          stroke={s <= Math.round(value) ? '#fbbf24' : 'currentColor'}
        />
      ))}
    </span>
  )
}

function NeonRatingBar({ label, icon, percent, value }) {
  return (
    <div className="rating-row">
      <span className="label">
        {icon}
        {label}
      </span>
      <div className="rating-bar">
        <div className="rating-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="value">{value}</span>
    </div>
  )
}

export default function MovieDetail() {
  const { id } = useParams()
  const { addComment, comments, favorites, movies, toggleFavorite } = useMovies()
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(null)

  const movie = movies.find((m) => m._id === id) || movies[0]
  const selectedComments = comments.filter((c) => c.movieId === movie._id)
  const ratedComments = selectedComments.filter((c) => c.rating)

  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = ratedComments.filter((c) => Math.round(c.rating) === star).length
    return {
      star,
      count,
      percent: ratedComments.length ? (count / ratedComments.length) * 100 : 0,
    }
  })

  const avgRating = ratedComments.length
    ? ratedComments.reduce((s, c) => s + c.rating, 0) / ratedComments.length
    : null

  const isFav = favorites.includes(movie._id)

  const submitComment = (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    addComment(movie._id, commentText.trim(), rating)
    setCommentText('')
    setRating(5)
  }

  return (
    <>
      <div className="detail-bg">
        <img src={movie.posterUrl} alt="" />
      </div>

      <div className="detail-page">
        <div className="container">
          <div className="detail-grid">
            <div className="detail-poster">
              <span className="detail-poster-badge">{movie.quality || '4K'}</span>
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80'
                }}
              />
            </div>

            <div className="detail-content">
              <span className="detail-eyebrow">
                <Film size={12} />
                {movie.genreName || 'Phim'}
              </span>

              <h1 className="detail-title">{movie.title}</h1>

              <div className="detail-tags">
                <span className="detail-tag">HD Vietsub</span>
                <span className="detail-tag">{movie.quality || '4K Ultra HD'}</span>
                <span className="detail-tag">2026</span>
                <span className="detail-tag">18+</span>
              </div>

              <div className="detail-meta">
                <span className="detail-meta-item">
                  <Clock3 size={16} />
                  {movie.duration} phút
                </span>
                <span className="detail-meta-item">
                  <Eye size={16} />
                  {formatViews(movie.views)} lượt xem
                </span>
                <span className="detail-meta-item">
                  <Calendar size={16} />
                  2026
                </span>
                <span className="detail-meta-item">
                  <Users size={16} />
                  {selectedComments.length} bình luận
                </span>
              </div>

              <p className="detail-description">{movie.description}</p>

              <div className="detail-actions">
                <button className="btn-primary" type="button">
                  <Play size={18} fill="currentColor" />
                  Xem ngay
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => toggleFavorite(movie._id)}
                  type="button"
                >
                  <Heart
                    size={18}
                    fill={isFav ? '#ec4899' : 'none'}
                    color={isFav ? '#ec4899' : 'currentColor'}
                  />
                  {isFav ? 'Đã yêu thích' : 'Thêm yêu thích'}
                </button>
              </div>

              <div className="rating-grid">
                <div className="rating-overall">
                  <div className="rating-overall-score">
                    {avgRating ? avgRating.toFixed(1) : (movie.rating || '4.8')}
                  </div>
                  <div className="rating-overall-info">
                    <RatingStars
                      value={Number(avgRating || movie.rating || 4.8)}
                      size={16}
                    />
                    <small>{ratedComments.length} lượt đánh giá</small>
                  </div>
                </div>
                {ratingStats.map(({ star, count, percent }) => (
                  <NeonRatingBar
                    key={star}
                    label={
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {star}
                        <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                      </span>
                    }
                    icon={null}
                    percent={percent}
                    value={count}
                  />
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 12, color: '#fff' }}>
                  Diễn viên chính
                </h3>
                <div className="cast-list">
                  {(movie.cast || ['Trần Anh Khoa', 'Linh Phạm', 'Minh Tuấn', 'Hà My']).map(
                    (name, i) => (
                      <div className="cast-chip" key={i}>
                        <span className="cast-avatar">{name.charAt(0)}</span>
                        <span className="cast-name">{name}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="container" style={{ padding: 0, marginTop: 40 }}>
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Trình phát</span>
                <h2 className="section-title">Xem ngay</h2>
              </div>
            </div>
            <VideoPlayer movie={movie} />
          </div>

          <div className="container" style={{ padding: 0, marginTop: 40 }}>
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Cộng đồng</span>
                <h2 className="section-title">Bình luận & đánh giá</h2>
              </div>
            </div>

            <form className="comment-form-card" onSubmit={submitComment}>
              <div className="star-selector">
                <span className="label">Đánh giá của bạn:</span>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      title={`${star} sao`}
                      type="button"
                    >
                      <Star
                        size={22}
                        fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <span className="rating-label">{RATING_LABELS[hoverRating || rating]}</span>
              </div>

              <div className="comment-input">
                <input
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" title="Gửi bình luận">
                  <MessageCircle size={16} />
                </button>
              </div>
            </form>

            {selectedComments.length ? (
              <div className="comment-list stagger">
                {selectedComments.map((c) => (
                  <article className="comment-item" key={c._id}>
                    <div className="comment-header">
                      <strong>{c.authorName}</strong>
                      {c.rating && <RatingStars value={c.rating} size={12} />}
                    </div>
                    <p className="comment-body">{c.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: 16 }}>
                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
