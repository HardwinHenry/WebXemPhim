const { isMongoReady } = require('../config/db')
const Movie = require('../models/Movie')
const User = require('../models/User')
const memoryStore = require('../models/memoryStore')
const { publicUser } = require('../services/authService')

const getUsers = async (_req, res) => {
  const users = isMongoReady() ? await User.find().sort({ createdAt: -1 }) : memoryStore.users
  res.json(users.map(publicUser))
}

const updateUserStatus = async (req, res) => {
  const { status } = req.body

  if (isMongoReady()) {
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(publicUser(user))
  }

  const user = memoryStore.users.find((item) => item._id === req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.status = status
  return res.json(publicUser(user))
}

const getAdminStats = async (_req, res) => {
  if (isMongoReady()) {
    const [movies, users, views] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments(),
      Movie.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ])
    return res.json({ movies, users, views: views[0]?.total || 0 })
  }

  const users = memoryStore.users.length
  const views = memoryStore.movies.reduce((sum, movie) => sum + movie.views, 0)
  return res.json({ users, movies: memoryStore.movies.length, views })
}

module.exports = { getAdminStats, getUsers, updateUserStatus }
