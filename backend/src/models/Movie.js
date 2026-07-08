const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    posterUrl: String,
    videoUrl: String,
    publicId: String,
    thumbnailPublicId: String,
    genreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    genreName: String,
    duration: Number,
    year: Number,
    quality: { type: String, enum: ['4K', 'FHD', 'HD', 'SD'], default: 'HD' },
    cast: [String],
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'ready' },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

movieSchema.index({ title: 'text', description: 'text' })
movieSchema.index({ genreName: 1 })
movieSchema.index({ featured: 1, views: -1 })
movieSchema.index({ status: 1 })

module.exports = mongoose.model('Movie', movieSchema)
