import { Eye, EyeOff, Film, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await login(form)
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch {
      setError('Không thể đăng nhập. Hãy kiểm tra API hoặc thông tin tài khoản.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            margin: '0 auto 20px',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
          }}
        >
          <Film size={24} />
        </div>
        <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>
          Chào mừng trở lại
        </span>
        <h1>Đăng nhập CineFlow</h1>
        <p className="page-subtitle">Tiếp tục hành trình điện ảnh của bạn</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                style={{ paddingLeft: 42, width: '100%' }}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@cineflow.com"
                type="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                style={{ paddingLeft: 42, paddingRight: 42, width: '100%' }}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  width: 28,
                  height: 28,
                }}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button className="auth-submit" type="submit">
            Đăng nhập
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}
