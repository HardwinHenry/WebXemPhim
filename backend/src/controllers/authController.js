const { isMongoReady } = require('../config/db')
const User = require('../models/User')
const memoryStore = require('../models/memoryStore')
const { comparePassword, hashPassword, publicUser } = require('../services/authService')
const generateToken = require('../utils/generateToken')

const register = async (req, res) => {
  const { username, email, password, role } = req.body
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
  const { email, password } = req.body
  const user = isMongoReady() ? await User.findOne({ email }) : memoryStore.users.find((item) => item.email === email)

  if (!user || !(await comparePassword(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' })
  if (user.status === 'locked') return res.status(403).json({ message: 'Account is locked' })

  return res.json({ user: publicUser(user), token: generateToken(user) })
}

const transporter = require("../config/mail")
const generateOTP = require("../utils/generateOTP")
const OTP = require("../models/OTP")

const sendOTP = async (req, res) => {
  const { email } = req.body
  if (!email){
    return res.status(400).json({ message: "Bắt buộc phải có email." })
  }
  const user = isMongoReady() ? await User.findOne({ email }) : memoryStore.users.find((u) => u.email === email)
  if (!user) {
    return res.status(404).json({
      message: "Người dùng không tồn tại." })
  }
  const otp = generateOTP()

await OTP.deleteMany({ email })

await OTP.create({
  email,
  otp,
  expiresAt: Date.now() + 5 * 60 * 1000
})

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Xác thực tài khoản",
  html: `
    <h2>Xin chào!</h2>
    <p>Mã OTP của bạn là: </p>
    <h1>${otp}</h1>
    <p>OTP này sẽ hết hạn sau 5 phút.</p>
  `
})

res.json({ message: "OTP đã được gửi đến email của bạn." })

}


const verifyOTP = async (req, res) => {
  const { email, otp } = req.body
  const record = await OTP.findOne({ email })
  if (!record) {
    return res.status(400).json({ message: "OTP không hợp lệ." })
  }
  if (record.expiresAt < Date.now()) {
  return res.status(400).json({ 
    message: "OTP đã hết hạn." })
}
if (record.otp !== otp) {
  return res.status(400).json({
     message: "OTP không hợp lệ." })
}
await OTP.deleteMany({ email })
res.json({ message: "Xác thực OTP thành công." })

}

module.exports = { login, register, sendOTP, verifyOTP }
