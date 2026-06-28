const express = require('express')
const { addFavorite, getFavorites, removeFavorite } = require('../controllers/favoriteController')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/', authMiddleware, asyncHandler(getFavorites))
router.post('/', authMiddleware, asyncHandler(addFavorite))
router.delete('/:movieId', authMiddleware, asyncHandler(removeFavorite))

module.exports = router
