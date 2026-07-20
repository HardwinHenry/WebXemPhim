import {
  BarChart3,
  Film,
  Heart,
  History,
  LogOut,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useMovies from '../hooks/useMovies'
import { resolveMediaUrl } from '../services/api'
import { getContentBadge, getContentSummary } from '../utils/movieContent'

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
  const { deleteMovie, favoriteMovies, historyMovies, movies, totalViews } = useMovies()

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
              <Stat icon={Heart} label="Phim yêu thích" value={favoriteMovies.length} accent="violet" />
              <Stat icon={History} label="Đã xem" value={historyMovies.length} accent="cyan" />
              <Stat icon={Star} label="Đánh giá TB" value="4.7" accent="amber" />
            </div>

            <div className="profile-actions">
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn-primary profile-action-button">
                  <Shield size={16} />
                  Đến trang Quản trị
                </Link>
              )}
              <button className="btn-danger-ghost profile-action-button" onClick={logout} type="button">
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
            Quản lý kho nội dung, thêm phim mới và theo dõi số liệu trên trình duyệt này.
          </p>
        </div>

        <div className="profile-stats stagger admin-stat-row">
          <Stat icon={Film} label="Tổng nội dung" value={movies.length} accent="violet" />
          <Stat icon={User} label="Người dùng" value="—" accent="cyan" />
          <Stat
            icon={BarChart3}
            label="Lượt xem"
            value={totalViews.toLocaleString('vi-VN')}
            accent="amber"
          />
        </div>

        <div className="admin-dashboard-actions">
          <Link to="/admin/upload" className="btn-primary admin-primary-action">
            <Upload size={16} />
            Thêm nội dung mới
          </Link>
          <p>Một form duy nhất để tạo phim lẻ, phim bộ, TV show, anime và phim tài liệu.</p>
        </div>

        <section className="comment-form-card admin-library-panel">
          <div className="section-header admin-library-heading">
            <div>
              <span className="section-eyebrow">Thư viện</span>
              <h2 className="section-title">Nội dung hiện có ({movies.length})</h2>
            </div>
            <Settings size={20} color="#c4b5fd" />
          </div>
          <div className="admin-dashboard-list">
            {movies.map((movie) => (
              <article className="admin-dashboard-item" key={movie._id}>
                <img
                  alt={movie.title}
                  onError={(event) => {
                    event.currentTarget.src =
                      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80'
                  }}
                  src={resolveMediaUrl(movie.posterUrl)}
                />
                <div className="admin-dashboard-info">
                  <span className="content-type-mini-badge">{getContentBadge(movie)}</span>
                  <strong>{movie.title}</strong>
                  <small>
                    {movie.genreName || 'Khác'} · {getContentSummary(movie)} · {movie.quality || 'HD'}
                  </small>
                </div>
                <button
                  className="btn-danger-ghost admin-dashboard-delete"
                  onClick={() => deleteMovie(movie._id)}
                  title="Xóa nội dung"
                  type="button"
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </article>
            ))}
            {!movies.length && <p className="admin-empty-copy">Chưa có nội dung trong thư viện.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
