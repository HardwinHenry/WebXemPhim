const express = require('express')
const { login, register } = require('../controllers/authController')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))

module.exports = router
