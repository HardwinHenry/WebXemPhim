const jwt = require('jsonwebtoken')
const { JWT_EXPIRES_IN, JWT_SECRET } = require('../config/jwt')

const generateToken = (user) =>
  jwt.sign({ id: String(user._id), role: user.role, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

module.exports = generateToken
