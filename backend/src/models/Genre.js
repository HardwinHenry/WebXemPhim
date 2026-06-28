const mongoose = require('mongoose')

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
})

module.exports = mongoose.model('Genre', genreSchema)
