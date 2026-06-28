const express = require('express')
const { getAdminStats, getUsers, updateUserStatus } = require('../controllers/userController')
const { uploadFile } = require('../controllers/uploadController')
const adminMiddleware = require('../middleware/adminMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

router.get('/', authMiddleware, adminMiddleware, asyncHandler(getUsers))
router.get('/stats', authMiddleware, adminMiddleware, asyncHandler(getAdminStats))
router.patch('/:id/status', authMiddleware, adminMiddleware, asyncHandler(updateUserStatus))
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), asyncHandler(uploadFile))

module.exports = router
