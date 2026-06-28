const { isMongoReady } = require('../config/db')
const Movie = require('../models/Movie')
const memoryStore = require('../models/memoryStore')

const getMovies = async (req, res) => {
  const { q = '', genre, page = 1, limit = 12 } = req.query

  if (isMongoReady()) {
    const filter = {}
    if (q) filter.title = { $regex: q, $options: 'i' }
    if (genre) filter.genreName = genre

    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const skip = (pageNumber - 1) * limitNumber
    const [items, total] = await Promise.all([
      Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Movie.countDocuments(filter),
    ])

    return res.json({ items, total, page: pageNumber, pages: Math.ceil(total / limitNumber) || 1 })
  }

  const filtered = memoryStore.movies.filter((movie) => {
    const matchesQuery = movie.title.toLowerCase().includes(String(q).toLowerCase())
    const matchesGenre = !genre || movie.genreName === genre
    return matchesQuery && matchesGenre
  })

  return res.json({ items: filtered, total: filtered.length, page: 1, pages: 1 })
}

const getMovieById = async (req, res) => {
  const movie = isMongoReady() ? await Movie.findById(req.params.id) : memoryStore.movies.find((item) => item._id === req.params.id)
  if (!movie) return res.status(404).json({ message: 'Movie not found' })
  return res.json(movie)
}

const createMovie = async (req, res) => {
  const movie = isMongoReady() ? await Movie.create(req.body) : { _id: `m${Date.now()}`, views: 0, createdAt: new Date(), ...req.body }
  if (!isMongoReady()) memoryStore.movies.unshift(movie)
  return res.status(201).json(movie)
}

const updateMovie = async (req, res) => {
  const movie = isMongoReady()
    ? await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true })
    : Object.assign(memoryStore.movies.find((item) => item._id === req.params.id) || {}, req.body)

  if (!movie?._id) return res.status(404).json({ message: 'Movie not found' })
  return res.json(movie)
}

const deleteMovie = async (req, res) => {
  if (isMongoReady()) await Movie.findByIdAndDelete(req.params.id)
  else memoryStore.movies = memoryStore.movies.filter((movie) => movie._id !== req.params.id)
  return res.status(204).end()
}

const addView = async (req, res) => {
  const movie = isMongoReady()
    ? await Movie.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    : memoryStore.movies.find((item) => item._id === req.params.id)

  if (!movie) return res.status(404).json({ message: 'Movie not found' })
  if (!isMongoReady()) movie.views += 1
  return res.json({ views: movie.views })
}

const getStats = async (_req, res) => {
  if (isMongoReady()) {
    const [movies, views] = await Promise.all([
      Movie.countDocuments(),
      Movie.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ])
    return res.json({ movies, views: views[0]?.total || 0 })
  }

  return res.json({
    movies: memoryStore.movies.length,
    views: memoryStore.movies.reduce((sum, movie) => sum + movie.views, 0),
  })
}

module.exports = { addView, createMovie, deleteMovie, getMovieById, getMovies, getStats, updateMovie }
