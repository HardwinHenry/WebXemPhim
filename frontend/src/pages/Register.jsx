import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerRequest, sendOtpRequest, verifyOtpRequest } from '../services/authService'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'user' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // OTP States
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Countdown timer for OTP resending
  useEffect(() => {
    let timer
    if (isOtpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOtpSent, countdown])

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

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

    setLoading(true)
    try {
      await sendOtpRequest({ email: form.email })
      setIsOtpSent(true)
      setSuccess(`Mã OTP đã được gửi đến email ${form.email}.`)
      setCountdown(60)
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setError(serverMsg || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP.')
      return
    }

    setLoading(true)
    try {
      // 1. Verify OTP
      await verifyOtpRequest({
        email: form.email,
        otp: otp.trim()
      })

      // 2. Perform register
      await registerRequest({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      })

      navigate('/login', { state: { message: 'Đăng ký tài khoản thành công! Hãy đăng nhập.' } })
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setError(serverMsg || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await sendOtpRequest({ email: form.email })
      setSuccess('Mã OTP mới đã được gửi thành công.')
      setCountdown(60)
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setError(serverMsg || 'Không thể gửi lại mã OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-wrapper">
      <section className="auth-card">
        <p className="eyebrow">Tài khoản</p>
        <h1>{isOtpSent ? 'Xác thực OTP' : 'Đăng ký'}</h1>
        
        {!isOtpSent ? (
          <form className="movie-form" onSubmit={handleSendOtp}>
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              placeholder="Tên người dùng"
              required
              disabled={loading}
            />
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Email"
              type="email"
              required
              disabled={loading}
            />
            <div className="password-input-container">
              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                disabled={loading}
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
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="auth-select"
              required
              disabled={loading}
            >
              <option value="user">Người dùng thông thường (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
            <span style={{ fontSize: '0.78rem', color: '#a0aec0', marginTop: '-8px', lineHeight: '1.3' }}>
              Mật khẩu yêu cầu: ít nhất 1 ký tự viết hoa, 1 chữ số và 1 ký tự đặc biệt (!@#$%^&*_+-=)
            </span>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Đang gửi mã...' : 'Đăng ký'}
            </button>
            <Link to="/login">Đã có tài khoản</Link>
          </form>
        ) : (
          <form className="movie-form" onSubmit={handleVerifyAndRegister}>
            <p style={{ color: '#b9c4cf', fontSize: '0.92rem', textAlign: 'center', lineHeight: '1.5', margin: '0 0 10px 0' }}>
              Mã OTP xác thực đã được gửi đến email:<br />
              <strong style={{ color: '#ffffff' }}>{form.email}</strong>
            </p>
            
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Nhập mã OTP (6 chữ số)"
              required
              maxLength={6}
              disabled={loading}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
            />
            
            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}
            
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực & Đăng ký'}
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false)
                  setError('')
                  setSuccess('')
                }}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a0aec0',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Quay lại
              </button>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: countdown > 0 ? '#4a5568' : '#ff5a5f',
                  fontSize: '0.88rem',
                  cursor: countdown > 0 ? 'default' : 'pointer',
                  fontWeight: '600',
                  textAlign: 'right'
                }}
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
