import {
  BarChart3,
  Film,
  Heart,
  History,
  LogOut,
  Plus,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'

function Stat({ icon: Icon, label, value, accent = 'violet' }) {
  const colors = {
    violet: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.15))',
    cyan: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.15))',
    amber: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.15))',
  }
  return (
    <div
      className="profile-stat"
      style={{ background: colors[accent], borderColor: 'var(--color-border-default)' }}
    >
      <Icon size={18} color="#c4b5fd" />
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  )
}

export default function Profile({ admin = false }) {
  const { logout, user } = useAuth()
  const { addMovie, deleteMovie, favoriteMovies, historyMovies, movies, totalViews } =
    useMovies()
  const genres = useMemo(
    () => getUniqueGenres(movies).filter((item) => item !== 'Tất cả'),
    [movies],
  )
  const [newMovie, setNewMovie] = useState({
    title: '',
    genreName: genres[0] || 'Action',
    duration: 100,
    posterUrl: '',
    videoUrl: '',
    description: '',
    quality: 'HD',
  })

  const submitMovie = (event) => {
    event.preventDefault()
    if (!newMovie.title.trim()) return
    addMovie(newMovie)
    setNewMovie({
      title: '',
      genreName: genres[0] || 'Action',
      duration: 100,
      posterUrl: '',
      videoUrl: '',
      description: '',
      quality: 'HD',
    })
  }

  if (!admin) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-card">
            <div className="profile-hero">
              <div className="profile-avatar-lg">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info-card">
                <span className="section-eyebrow">Thành viên CineFlow</span>
                <h1>{user?.username || 'Khách'}</h1>
                <span className="email">{user?.email || '—'}</span>
                <span className="role-badge">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>

            <div className="profile-stats stagger">
              <Stat
                icon={Heart}
                label="Phim yêu thích"
                value={favoriteMovies.length}
                accent="violet"
              />
              <Stat icon={History} label="Đã xem" value={historyMovies.length} accent="cyan" />
              <Stat
                icon={Star}
                label="Đánh giá TB"
                value="4.7"
                accent="amber"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn-primary" style={{ height: 46 }}>
                  <Shield size={16} />
                  Đến trang Quản trị
                </Link>
              )}
              <button
                className="btn-danger-ghost"
                onClick={logout}
                style={{ height: 46, justifyContent: 'center' }}
                type="button"
              >
                <LogOut size={16} />
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <span className="section-eyebrow">Bảng điều khiển</span>
          <h1 className="page-title">Trang quản trị</h1>
          <p className="page-subtitle">
            Quản lý kho phim, thêm nội dung mới và theo dõi số liệu hệ thống.
          </p>
        </div>

        <div className="profile-stats stagger" style={{ marginBottom: 32 }}>
          <Stat icon={Film} label="Tổng phim" value={movies.length} accent="violet" />
          <Stat icon={User} label="Người dùng" value="—" accent="cyan" />
          <Stat
            icon={BarChart3}
            label="Lượt xem"
            value={totalViews.toLocaleString('vi-VN')}
            accent="amber"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Link to="/admin/upload" className="btn-primary" style={{ height: 46 }}>
            <Upload size={16} />
            Upload Phim Mới
          </Link>
          <button className="btn-ghost" type="button" style={{ height: 46 }}>
            <Plus size={16} />
            Thêm bằng URL
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 420px) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <form
            className="comment-form-card"
            onSubmit={submitMovie}
            style={{ padding: 24 }}
          >
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div>
                <span className="section-eyebrow">Quản trị nội dung</span>
                <h2 className="section-title">Thêm phim mới</h2>
              </div>
              <Upload size={20} color="#c4b5fd" />
            </div>

            <div className="auth-form">
              <div className="auth-field">
                <label>Tên phim</label>
                <input
                  placeholder="Nhập tên phim..."
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label>Mô tả</label>
                <textarea
                  placeholder="Mô tả nội dung..."
                  rows={3}
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--color-border-default)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: 12,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div className="auth-field">
                <label>Thể loại</label>
                <select
                  value={newMovie.genreName}
                  onChange={(e) => setNewMovie({ ...newMovie, genreName: e.target.value })}
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label>Thời lượng (phút)</label>
                <input
                  min="1"
                  type="number"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label>Chất lượng</label>
                <select
                  value={newMovie.quality}
                  onChange={(e) => setNewMovie({ ...newMovie, quality: e.target.value })}
                >
                  <option>4K</option>
                  <option>HD</option>
                  <option>FHD</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Poster URL</label>
                <input
                  placeholder="https://..."
                  value={newMovie.posterUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                />
              </div>
              <div className="auth-field">
                <label>Video URL</label>
                <input
                  placeholder="https://..."
                  value={newMovie.videoUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, videoUrl: e.target.value })}
                />
              </div>
              <button className="btn-primary" type="submit" style={{ height: 46 }}>
                <Plus size={18} />
                Thêm phim
              </button>
            </div>
          </form>

          <div className="comment-form-card" style={{ padding: 24 }}>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div>
                <span className="section-eyebrow">Danh sách</span>
                <h2 className="section-title">Phim hiện có ({movies.length})</h2>
              </div>
              <Settings size={20} color="#c4b5fd" />
            </div>
            <div className="admin-list" style={{ display: 'grid', gap: 10 }}>
              {movies.map((movie) => (
                <div
                  key={movie._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 12,
                  }}
                >
                  <img
                    src={movie.posterUrl}
                    alt=""
                    style={{
                      width: 56,
                      height: 76,
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ color: '#fff', display: 'block' }}>{movie.title}</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {movie.genreName} · {movie.duration} phút · {movie.quality || 'HD'}
                    </span>
                  </div>
                  <button
                    className="btn-danger-ghost"
                    onClick={() => deleteMovie(movie._id)}
                    type="button"
                    style={{ width: 36, height: 36, padding: 0 }}
                    title="Xóa phim"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
