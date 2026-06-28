import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerRequest } from '../services/authService'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'user' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim()) {
      setError('Tên người dùng không được để trống.')
      return
    }
    if (!form.email.trim()) {
      setError('Email không được để trống.')
      return
    }

    // Validate password strength: at least 1 uppercase, 1 special character (!@#$%^&*_+-=), and 1 digit
    const uppercaseRegex = /[A-Z]/
    const specialCharRegex = /[!@#$%^&*_\+\-=]/
    const numberRegex = /\d/

    if (!uppercaseRegex.test(form.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự viết hoa.')
      return
    }
    if (!specialCharRegex.test(form.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*_+-=).')
      return
    }
    if (!numberRegex.test(form.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ số.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      await registerRequest({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      })
      navigate('/login', { state: { message: 'Đăng ký tài khoản thành công! Hãy đăng nhập.' } })
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setError(serverMsg || 'Không thể đăng ký. Email có thể đã tồn tại.')
    }
  }

  return (
    <div className="auth-page-wrapper">
      <section className="auth-card">
        <p className="eyebrow">Tài khoản</p>
        <h1>Đăng ký</h1>
        <form className="movie-form" onSubmit={submit}>
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            placeholder="Tên người dùng"
            required
          />
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
          <div className="password-input-container">
            <input
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              placeholder="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className="auth-select"
            required
          >
            <option value="user">Người dùng thông thường (User)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: '#a0aec0', marginTop: '-8px', lineHeight: '1.3' }}>
            Mật khẩu yêu cầu: ít nhất 1 ký tự viết hoa, 1 chữ số và 1 ký tự đặc biệt (!@#$%^&*_+-=)
          </span>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit">
            Đăng ký
          </button>
          <Link to="/login">Đã có tài khoản</Link>
        </form>
      </section>
    </div>
  )
}
