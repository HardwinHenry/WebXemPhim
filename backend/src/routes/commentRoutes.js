const express = require('express')
const { createComment, getCommentsByMovie } = require('../controllers/commentController')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/:movieId', asyncHandler(getCommentsByMovie))
router.post('/', authMiddleware, asyncHandler(createComment))

module.exports = router
