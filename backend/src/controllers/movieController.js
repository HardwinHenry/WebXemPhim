const { isMongoReady } = require('../config/db')
const Movie = require('../models/Movie')
const memoryStore = require('../models/memoryStore')
const { uploadVideo, uploadPoster, uploadThumbnail, destroy } = require('../services/cloudinaryService')

const getMovies = async (req, res) => {
  const { q = '', genre, page = 1, limit = 12 } = req.query

  if (isMongoReady()) {
    const filter = { status: { $ne: 'processing' } }
    if (q) filter.$text = { $search: q }
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
  const movie = isMongoReady()
    ? await Movie.findById(req.params.id)
    : memoryStore.movies.find((item) => item._id === req.params.id)

  if (!movie) return res.status(404).json({ message: 'Movie not found' })

  if (movie.publicId && isMongoReady()) {
    try {
      await Promise.allSettled([
        destroy(movie.publicId, 'video'),
        movie.thumbnailPublicId ? destroy(movie.thumbnailPublicId, 'image') : Promise.resolve(),
      ])
    } catch (cloudErr) {
      console.warn('Cloudinary cleanup failed, continuing with DB delete:', cloudErr.message)
    }
  }

  if (isMongoReady()) {
    await Movie.findByIdAndDelete(req.params.id)
  } else {
    memoryStore.movies = memoryStore.movies.filter((m) => m._id !== req.params.id)
  }

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
      Movie.countDocuments({ status: { $ne: 'processing' } }),
      Movie.aggregate([{ $match: { status: { $ne: 'processing' } } }, { $group: { _id: null, total: { $sum: '$views' } } }]),
    ])
    return res.json({ movies, views: views[0]?.total || 0 })
  }

  return res.json({
    movies: memoryStore.movies.length,
    views: memoryStore.movies.reduce((sum, movie) => sum + movie.views, 0),
  })
}

const uploadVideoFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No video file provided' })

  const publicId = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  let result
  try {
    result = await uploadVideo(req.file.buffer, { publicId })
  } catch (err) {
    console.error('Cloudinary upload error:', err.message)
    return res.status(502).json({ message: 'Video upload failed', error: err.message })
  }

  const videoUrl = result.secure_url
  const videoPublicId = result.public_id
  const duration = result.duration ? Math.round(result.duration) : null

  if (req.body.movieId) {
    const movie = isMongoReady()
      ? await Movie.findByIdAndUpdate(req.body.movieId, { videoUrl, publicId: videoPublicId, duration, status: 'ready' }, { new: true })
      : null
    if (!movie) return res.status(404).json({ message: 'Movie not found' })
    return res.json({ videoUrl, publicId: videoPublicId, duration, movie })
  }

  return res.status(201).json({ videoUrl, publicId: videoPublicId, duration })
}

const uploadPosterFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' })

  let result
  try {
    result = await uploadPoster(req.file.buffer)
  } catch (err) {
    console.error('Poster upload error:', err.message)
    return res.status(502).json({ message: 'Poster upload failed', error: err.message })
  }

  return res.status(201).json({ posterUrl: result.secure_url, publicId: result.public_id })
}

const uploadThumbnailFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' })

  let result
  try {
    result = await uploadThumbnail(req.file.buffer)
  } catch (err) {
    console.error('Thumbnail upload error:', err.message)
    return res.status(502).json({ message: 'Thumbnail upload failed', error: err.message })
  }

  return res.status(201).json({ thumbnailUrl: result.secure_url, publicId: result.public_id })
}

const getStreamingUrl = async (req, res) => {
  const movie = isMongoReady()
    ? await Movie.findById(req.params.id).select('videoUrl publicId status')
    : memoryStore.movies.find((item) => item._id === req.params.id)

  if (!movie) return res.status(404).json({ message: 'Movie not found' })

  if (!movie.videoUrl) return res.status(404).json({ message: 'Video not available' })
  if (movie.status === 'processing') return res.status(202).json({ message: 'Video is still processing', status: 'processing' })

  return res.json({
    streamingUrl: movie.videoUrl,
    status: movie.status || 'ready',
  })
}

const createMovieWithUpload = async (req, res) => {
  const { title, description, genreName, duration, year, quality, cast, posterUrl, videoUrl, featured } = req.body

  if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })
  if (!description?.trim()) return res.status(400).json({ message: 'Description is required' })

  const movieData = {
    title: title.trim(),
    description: description.trim(),
    genreName: genreName || 'Other',
    duration: duration ? Number(duration) : null,
    year: year ? Number(year) : new Date().getFullYear(),
    quality: quality || 'HD',
    cast: cast ? (Array.isArray(cast) ? cast : cast.split(',').map((s) => s.trim()).filter(Boolean)) : [],
    featured: Boolean(featured),
    status: videoUrl ? 'ready' : 'ready',
  }

  if (posterUrl) movieData.posterUrl = posterUrl
  if (videoUrl) movieData.videoUrl = videoUrl

  let movie
  if (isMongoReady()) {
    movie = await Movie.create(movieData)
  } else {
    movie = { _id: `m${Date.now()}`, views: 0, createdAt: new Date(), ...movieData }
    memoryStore.movies.unshift(movie)
  }

  return res.status(201).json(movie)
}

module.exports = {
  addView,
  createMovie,
  createMovieWithUpload,
  deleteMovie,
  getMovieById,
  getMovies,
  getStats,
  getStreamingUrl,
  updateMovie,
  uploadPosterFile,
  uploadThumbnailFile,
  uploadVideoFile,
}
