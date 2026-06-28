import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
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
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
      // Clear navigation state to avoid alert showing again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await login(form)
      navigate('/')
    } catch {
      setError('Không thể đăng nhập. Hãy kiểm tra API hoặc thông tin tài khoản.')
    }
  }

  return (
    <div className="auth-page-wrapper">
      <section className="auth-card">
        <p className="eyebrow">Tài khoản</p>
        <h1>Đăng nhập</h1>
        <form className="movie-form" onSubmit={submit}>
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
            type="email"
            required
          />
          <div className="password-input-container">
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button className="primary-button" type="submit">
            Đăng nhập
          </button>
          <Link to="/register">Tạo tài khoản mới</Link>
        </form>
      </section>
    </div>
  )
}
