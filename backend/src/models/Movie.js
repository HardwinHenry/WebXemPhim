const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    posterUrl: String,
    videoUrl: String,
    genreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    genreName: String,
    duration: Number,
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Movie', movieSchema)
