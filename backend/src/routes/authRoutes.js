const express = require('express')
const { login, register, sendOtp, verifyOtp } = require('../controllers/authController')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.post('/send-otp', asyncHandler(sendOtp))
router.post('/verify-otp', asyncHandler(verifyOtp))

module.exports = router
