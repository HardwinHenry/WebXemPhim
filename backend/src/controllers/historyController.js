const { isMongoReady } = require('../config/db')
const WatchHistory = require('../models/WatchHistory')
const memoryStore = require('../models/memoryStore')

const getHistory = async (req, res) => {
  if (isMongoReady()) {
    const history = await WatchHistory.find({ userId: req.user.id }).populate('movieId').sort({ watchedAt: -1 })
    return res.json(history.map((item) => ({ ...item.toObject(), movie: item.movieId })))
  }

  const items = memoryStore.histories
    .filter((item) => item.userId === req.user.id)
    .map((item) => ({ ...item, movie: memoryStore.movies.find((movie) => movie._id === item.movieId) }))
  return res.json(items)
}

const addHistory = async (req, res) => {
  const payload = { userId: req.user.id, movieId: req.body.movieId, watchedAt: new Date() }
  const item = isMongoReady() ? await WatchHistory.create(payload) : { _id: `h${Date.now()}`, ...payload }
  if (!isMongoReady()) memoryStore.histories.unshift(item)
  res.status(201).json(item)
}

module.exports = { addHistory, getHistory }
