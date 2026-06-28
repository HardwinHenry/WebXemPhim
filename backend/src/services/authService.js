const bcrypt = require('bcryptjs')

const hashPassword = (password) => bcrypt.hash(password, 10)

const comparePassword = (password, hashedPassword) => bcrypt.compare(password, hashedPassword)

const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
})

module.exports = { comparePassword, hashPassword, publicUser }
