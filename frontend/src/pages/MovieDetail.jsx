import { BarChart3, Clock3, Heart, MessageCircle, Star } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import useMovies from '../hooks/useMovies'
import { formatViews } from '../utils/helpers'

export default function MovieDetail() {
  const { id } = useParams()
  const { addComment, comments, favorites, movies, toggleFavorite } = useMovies()
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(null)
  
  const movie = movies.find((item) => item._id === id) || movies[0]
  const selectedComments = comments.filter((comment) => comment.movieId === movie._id)
  
  const ratedComments = selectedComments.filter((c) => c.rating)
  const avgRating = ratedComments.length
    ? (ratedComments.reduce((sum, c) => sum + c.rating, 0) / ratedComments.length).toFixed(1)
    : null

  const submitComment = (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    addComment(movie._id, commentText.trim(), rating)
    setCommentText('')
    setRating(5)
  }

  return (
    <section className="detail-page">
      <aside className="detail-panel">
        <VideoPlayer movie={movie} />
        <div className="detail-copy">
          <div>
            <p className="eyebrow">{movie.genreName}</p>
            <h2>{movie.title}</h2>
          </div>
          <button className="icon-button" onClick={() => toggleFavorite(movie._id)} type="button" title="Yêu thích">
            <Heart size={18} fill={favorites.includes(movie._id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p>{movie.description}</p>
        <div className="meta-row">
          <span>
            <Clock3 size={16} />
            {movie.duration} phút
          </span>
          <span>
            <BarChart3 size={16} />
            {formatViews(movie.views)} lượt xem
          </span>
          {avgRating ? (
            <span className="average-rating-badge">
              <Star size={14} fill="#b45309" stroke="#b45309" />
              {avgRating}/5 ({ratedComments.length} đánh giá)
            </span>
          ) : (
            <span className="average-rating-badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
              <Star size={14} fill="none" stroke="#4b5563" />
              Chưa có đánh giá
            </span>
          )}
        </div>
        
        <form className="comment-form-with-rating" onSubmit={submitComment}>
          <div className="star-rating-selector">
            <span className="rating-label">Đánh giá của bạn:</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-btn"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  title={`${star} sao`}
                >
                  <Star
                    size={20}
                    fill={star <= (hoverRating || rating) ? '#ffd166' : 'none'}
                    stroke={star <= (hoverRating || rating) ? '#ffd166' : '#9aa8b6'}
                  />
                </button>
              ))}
            </div>
            <span className="rating-text">
              {rating === 1 && 'Tệ'}
              {rating === 2 && 'Tạm được'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Hay'}
              {rating === 5 && 'Tuyệt vời!'}
            </span>
          </div>

          <div className="comment-input-row">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Viết bình luận của bạn..."
              required
            />
            <button type="submit" title="Gửi bình luận">
              <MessageCircle size={18} />
            </button>
          </div>
        </form>

        <div className="comment-list">
          {selectedComments.map((comment) => (
            <article key={comment._id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.authorName}</strong>
                {comment.rating && (
                  <div className="comment-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        fill={star <= comment.rating ? '#ffd166' : 'none'}
                        stroke={star <= comment.rating ? '#ffd166' : '#9aa8b6'}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p>{comment.content}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  )
}
