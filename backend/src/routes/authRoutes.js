const express = require('express')
const { login, register, sendOTP, verifyOTP } = require('../controllers/authController')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))

router.post("/send-otp", asyncHandler(sendOTP))
router.post("/verify-otp", asyncHandler(verifyOTP))

module.exports = router
