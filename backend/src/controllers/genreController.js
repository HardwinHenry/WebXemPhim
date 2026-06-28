const { isMongoReady } = require('../config/db')
const Genre = require('../models/Genre')
const memoryStore = require('../models/memoryStore')

const getGenres = async (_req, res) => {
  const genres = isMongoReady() ? await Genre.find().sort({ name: 1 }) : memoryStore.genres
  res.json(genres)
}

const createGenre = async (req, res) => {
  const payload = { name: req.body.name, description: req.body.description }
  const genre = isMongoReady() ? await Genre.create(payload) : { _id: `g${Date.now()}`, ...payload }
  if (!isMongoReady()) memoryStore.genres.push(genre)
  res.status(201).json(genre)
}

module.exports = { createGenre, getGenres }
