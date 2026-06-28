const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    authorName: String,
  },
  { timestamps: true },
)

module.exports = mongoose.model('Comment', commentSchema)
