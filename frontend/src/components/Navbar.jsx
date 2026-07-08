import { useEffect, useState } from 'react'
import {
  Film,
  Heart,
  History,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Film size={20} />
          </span>
          <span className="brand-text">
            <strong>CineFlow</strong>
            <small>Cinematic · 4K</small>
          </span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => {
            if (item.to === '/admin' && user?.role !== 'admin') return null
            const Icon = item.icon
            return (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="nav-actions">
          <form className={`nav-search ${searchOpen ? 'expanded' : ''}`} onSubmit={handleSearchSubmit}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              autoFocus={searchOpen}
              placeholder="Tìm phim, thể loại, diễn viên..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => !searchValue && setSearchOpen(false)}
            />
            {searchOpen && (
              <button
                className="icon-btn"
                style={{ width: 28, height: 28, border: 0, background: 'transparent' }}
                onClick={(e) => {
                  e.preventDefault()
                  setSearchOpen(false)
                  setSearchValue('')
                }}
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {!searchOpen && (
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              title="Tìm kiếm"
              type="button"
            >
              <Search size={18} />
            </button>
          )}

          {user ? (
            <>
              <Link className="profile-chip" to="/profile" title="Trang cá nhân">
                <span className="profile-avatar">
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="profile-meta">
                  <strong>{user.username}</strong>
                  <small>{user.email}</small>
                </span>
              </Link>
              <button
                className="icon-btn"
                onClick={logout}
                title="Đăng xuất"
                type="button"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link className="btn-primary" to="/login">
              <User size={16} />
              <span>Đăng nhập</span>
            </Link>
          )}

          <button
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            title="Menu"
            type="button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
