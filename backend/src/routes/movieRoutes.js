const express = require('express')
const {
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
} = require('../controllers/movieController')
const adminMiddleware = require('../middleware/adminMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware')
const { uploadImage, uploadVideo } = require('../middleware/uploadMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/', asyncHandler(getMovies))
router.get('/:id', asyncHandler(getMovieById))
router.get('/:id/stream', asyncHandler(getStreamingUrl))
router.post('/', authMiddleware, adminMiddleware, asyncHandler(createMovie))
router.post('/upload-video', authMiddleware, adminMiddleware, rateLimitMiddleware, uploadVideo.single('video'), asyncHandler(uploadVideoFile))
router.post('/upload-poster', authMiddleware, adminMiddleware, rateLimitMiddleware, uploadImage.single('poster'), asyncHandler(uploadPosterFile))
router.post('/upload-thumbnail', authMiddleware, adminMiddleware, rateLimitMiddleware, uploadImage.single('thumbnail'), asyncHandler(uploadThumbnailFile))
router.post('/create-with-upload', authMiddleware, adminMiddleware, rateLimitMiddleware, asyncHandler(createMovieWithUpload))
router.put('/:id', authMiddleware, adminMiddleware, asyncHandler(updateMovie))
router.delete('/:id', authMiddleware, adminMiddleware, asyncHandler(deleteMovie))
router.post('/:id/view', asyncHandler(addView))

module.exports = router
