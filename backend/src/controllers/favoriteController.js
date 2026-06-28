const { isMongoReady } = require('../config/db')
const Favorite = require('../models/Favorite')
const memoryStore = require('../models/memoryStore')

const getFavorites = async (req, res) => {
  if (isMongoReady()) {
    const favorites = await Favorite.find({ userId: req.user.id }).populate('movieId').sort({ createdAt: -1 })
    return res.json(favorites.map((favorite) => favorite.movieId))
  }

  const movieIds = memoryStore.favorites.filter((favorite) => favorite.userId === req.user.id).map((favorite) => favorite.movieId)
  return res.json(memoryStore.movies.filter((movie) => movieIds.includes(movie._id)))
}

const addFavorite = async (req, res) => {
  if (isMongoReady()) {
    const favorite = await Favorite.findOneAndUpdate({ userId: req.user.id, movieId: req.body.movieId }, {}, { upsert: true, new: true })
    return res.status(201).json(favorite)
  }

  const exists = memoryStore.favorites.some((favorite) => favorite.userId === req.user.id && favorite.movieId === req.body.movieId)
  if (!exists) memoryStore.favorites.push({ _id: `f${Date.now()}`, userId: req.user.id, movieId: req.body.movieId })
  return res.status(201).json({ ok: true })
}

const removeFavorite = async (req, res) => {
  if (isMongoReady()) await Favorite.deleteOne({ userId: req.user.id, movieId: req.params.movieId })
  else memoryStore.favorites = memoryStore.favorites.filter((favorite) => favorite.userId !== req.user.id || favorite.movieId !== req.params.movieId)
  return res.status(204).end()
}

module.exports = { addFavorite, getFavorites, removeFavorite }
