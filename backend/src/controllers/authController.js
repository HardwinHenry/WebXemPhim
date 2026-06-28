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

module.exports = { login, register }
