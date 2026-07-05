const { isMongoReady } = require('../config/db')
const User = require('../models/User')
const OTP = require('../models/OTP')
const memoryStore = require('../models/memoryStore')
const { comparePassword, hashPassword, publicUser } = require('../services/authService')
const generateToken = require('../utils/generateToken')
const generateOTP = require('../utils/generateOTP')
const transporter = require('../config/mail')

const getRequestBody = (req) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return {}
  }

  return req.body
}

const register = async (req, res) => {
  const { username, email, password, role } = getRequestBody(req)
  if (!username || !email || !password) return res.status(400).json({ message: 'Username, email and password are required' })

  // Validate password strength: at least 1 uppercase, 1 special character (!@#$%^&*_+-=), and 1 digit
  const uppercaseRegex = /[A-Z]/
  const specialCharRegex = /[!@#$%^&*_\+\-=]/
  const numberRegex = /\d/

  if (!uppercaseRegex.test(password)) {
    return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 ký tự viết hoa.' })
  }
  if (!specialCharRegex.test(password)) {
    return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*_+-=).' })
  }
  if (!numberRegex.test(password)) {
    return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 chữ số.' })
  }

  if (isMongoReady()) {
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already exists' })

    const user = await User.create({ username, email, password: await hashPassword(password), role: role || 'user' })
    return res.status(201).json({ user: publicUser(user), token: generateToken(user) })
  }

  if (memoryStore.users.some((user) => user.email === email)) return res.status(409).json({ message: 'Email already exists' })
  const user = { _id: `u${Date.now()}`, username, email, password: await hashPassword(password), role: role || 'user', status: 'active' }
  memoryStore.users.push(user)
  return res.status(201).json({ user: publicUser(user), token: generateToken(user) })
}

const login = async (req, res) => {
  const { email, password } = getRequestBody(req)
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const user = isMongoReady() ? await User.findOne({ email }) : memoryStore.users.find((item) => item.email === email)

  if (!user || !(await comparePassword(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' })
  if (user.status === 'locked') return res.status(403).json({ message: 'Account is locked' })

  return res.json({ user: publicUser(user), token: generateToken(user) })
}

const sendOtp = async (req, res) => {
  const { email } = getRequestBody(req)
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }

  const otp = generateOTP()
  console.log(`[DEBUG] Mã OTP cho ${email} là: ${otp}`)

  if (isMongoReady()) {
    await OTP.deleteMany({ email })
    await OTP.create({ email, otp })
  } else {
    if (!memoryStore.otps) {
      memoryStore.otps = []
    }
    memoryStore.otps = memoryStore.otps.filter((item) => item.email !== email)
    memoryStore.otps.push({
      email,
      otp,
      createdAt: new Date()
    })
  }

  const mailOptions = {
    from: `"WebXemPhim" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '[WebXemPhim] Mã xác thực OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2b6cb0; text-align: center;">Mã Xác Thực OTP</h2>
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu mã xác thực OTP từ <strong>WebXemPhim</strong>.</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2d3748;">${otp}</span>
        </div>
        <p style="color: #718096; font-size: 14px;">Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #a0aec0; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return res.status(200).json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Failed to send email:', error)
    return res.status(500).json({ message: 'Failed to send OTP email', error: error.message })
  }
}

const verifyOtp = async (req, res) => {
  const { email, otp } = getRequestBody(req)
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  if (isMongoReady()) {
    const record = await OTP.findOne({ email, otp })
    if (!record) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' })
    }
    await OTP.deleteMany({ email })
    return res.status(200).json({ message: 'Xác thực OTP thành công!' })
  } else {
    if (!memoryStore.otps) {
      memoryStore.otps = []
    }
    const recordIndex = memoryStore.otps.findIndex((item) => item.email === email && item.otp === otp)
    if (recordIndex === -1) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' })
    }
    const record = memoryStore.otps[recordIndex]
    const now = new Date()
    if (now - record.createdAt > 5 * 60 * 1000) {
      memoryStore.otps.splice(recordIndex, 1)
      return res.status(400).json({ message: 'Mã OTP đã hết hạn.' })
    }
    memoryStore.otps.splice(recordIndex, 1)
    return res.status(200).json({ message: 'Xác thực OTP thành công!' })
  }
}

module.exports = { login, register, sendOtp, verifyOtp }
