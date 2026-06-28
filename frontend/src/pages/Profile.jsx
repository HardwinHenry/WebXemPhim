import { BarChart3, Film, Plus, Trash2, Upload, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'

export default function Profile({ admin = false }) {
  const { logout, user } = useAuth()
  const { addMovie, deleteMovie, movies, totalViews } = useMovies()
  const genres = useMemo(() => getUniqueGenres(movies).filter((item) => item !== 'Tất cả'), [movies])
  const [newMovie, setNewMovie] = useState({
    title: '',
    genreName: genres[0] || 'Action',
    duration: 100,
    posterUrl: '',
    videoUrl: '',
    description: '',
  })

  const submitMovie = (event) => {
    event.preventDefault()
    if (!newMovie.title.trim()) return
    addMovie(newMovie)
    setNewMovie({ title: '', genreName: genres[0] || 'Action', duration: 100, posterUrl: '', videoUrl: '', description: '' })
  }

  if (!admin) {
    return (
      <section className="catalog-panel profile-page-premium">
        <div className="profile-hero-card">
          <div className="profile-big-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-details">
            <p className="eyebrow">Thành viên CineFlow</p>
            <h1>{user?.username}</h1>
            <span className="profile-email">{user?.email}</span>
            <span className="profile-role-badge">{user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
          </div>
        </div>
        <div className="profile-actions">
          {user?.role === 'admin' && (
            <Link to="/admin" className="primary-button admin-redirect-btn">
              Đến trang Quản trị
            </Link>
          )}
          <button className="logout-button" onClick={logout} type="button">
            Đăng xuất tài khoản
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-panel">
      <div className="stats">
        <Stat icon={Film} label="Tổng phim" value={movies.length.toString()} />
        <Stat icon={User} label="Người dùng" value="1" />
        <Stat icon={BarChart3} label="Lượt xem" value={totalViews.toLocaleString('vi-VN')} />
      </div>

      <form className="movie-form" onSubmit={submitMovie}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quản trị nội dung</p>
            <h2>Thêm phim mới</h2>
          </div>
          <Upload size={20} />
        </div>
        <input value={newMovie.title} onChange={(event) => setNewMovie({ ...newMovie, title: event.target.value })} placeholder="Tên phim" />
        <textarea
          value={newMovie.description}
          onChange={(event) => setNewMovie({ ...newMovie, description: event.target.value })}
          placeholder="Mô tả nội dung"
        />
        <div className="form-row">
          <select value={newMovie.genreName} onChange={(event) => setNewMovie({ ...newMovie, genreName: event.target.value })}>
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input min="1" type="number" value={newMovie.duration} onChange={(event) => setNewMovie({ ...newMovie, duration: event.target.value })} />
        </div>
        <input value={newMovie.posterUrl} onChange={(event) => setNewMovie({ ...newMovie, posterUrl: event.target.value })} placeholder="Poster URL" />
        <input value={newMovie.videoUrl} onChange={(event) => setNewMovie({ ...newMovie, videoUrl: event.target.value })} placeholder="Video URL" />
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Thêm phim
        </button>
      </form>

      <div className="admin-list">
        {movies.map((movie) => (
          <article key={movie._id}>
            <img src={movie.posterUrl} alt="" />
            <div>
              <strong>{movie.title}</strong>
              <span>{movie.genreName}</span>
            </div>
            <button className="icon-button danger" onClick={() => deleteMovie(movie._id)} type="button" title="Xóa phim">
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <article>
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
