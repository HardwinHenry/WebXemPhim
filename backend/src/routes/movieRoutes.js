const express = require('express')
const {
  addView,
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  updateMovie,
} = require('../controllers/movieController')
const adminMiddleware = require('../middleware/adminMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/', asyncHandler(getMovies))
router.get('/:id', asyncHandler(getMovieById))
router.post('/', authMiddleware, adminMiddleware, asyncHandler(createMovie))
router.put('/:id', authMiddleware, adminMiddleware, asyncHandler(updateMovie))
router.delete('/:id', authMiddleware, adminMiddleware, asyncHandler(deleteMovie))
router.post('/:id/view', asyncHandler(addView))

module.exports = router
