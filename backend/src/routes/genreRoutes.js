const express = require('express')
const { createGenre, getGenres } = require('../controllers/genreController')
const adminMiddleware = require('../middleware/adminMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/', asyncHandler(getGenres))
router.post('/', authMiddleware, adminMiddleware, asyncHandler(createGenre))

module.exports = router
