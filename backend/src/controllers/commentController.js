const { isMongoReady } = require('../config/db')
const Comment = require('../models/Comment')
const memoryStore = require('../models/memoryStore')

const getCommentsByMovie = async (req, res) => {
  const comments = isMongoReady()
    ? await Comment.find({ movieId: req.params.movieId }).sort({ createdAt: -1 })
    : memoryStore.comments.filter((comment) => comment.movieId === req.params.movieId)
  res.json(comments)
}

const createComment = async (req, res) => {
  const payload = { 
    movieId: req.body.movieId, 
    content: req.body.content, 
    rating: req.body.rating ? Number(req.body.rating) : undefined,
    userId: req.user.id, 
    authorName: req.user.username 
  }
  const comment = isMongoReady() ? await Comment.create(payload) : { _id: `c${Date.now()}`, createdAt: new Date(), ...payload }
  if (!isMongoReady()) memoryStore.comments.unshift(comment)
  res.status(201).json(comment)
}

module.exports = { createComment, getCommentsByMovie }
