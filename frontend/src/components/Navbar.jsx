import { Film, Heart, History, Search, Shield, User, LogOut } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Film },
  { to: '/movies', label: 'Kho phim', icon: Search },
  { to: '/favorites', label: 'Yêu thích', icon: Heart },
  { to: '/history', label: 'Lịch sử', icon: History },
  { to: '/admin', label: 'Admin', icon: Shield },
]

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <span className="brand-mark">
            <Film size={18} />
          </span>
          <div>
            <strong>CineFlow</strong>
            <small>Online Movies</small>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => {
            if (item.to === '/admin' && user?.role !== 'admin') {
              return null
            }
            const Icon = item.icon
            return (
              <NavLink className={({ isActive }) => (isActive ? 'active' : '')} key={item.to} to={item.to}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="header-profile">
          {user ? (
            <>
              <Link to="/profile" className="profile-info" title="Xem thông tin cá nhân">
                <div className="profile-avatar">
                  <User size={16} />
                </div>
                <div>
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                </div>
              </Link>
              <button className="logout-button" onClick={logout} title="Đăng xuất">
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button" title="Đăng nhập">
              <User size={16} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
