const express = require('express')
const { addHistory, getHistory } = require('../controllers/historyController')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/errorMiddleware')

const router = express.Router()

router.get('/', authMiddleware, asyncHandler(getHistory))
router.post('/', authMiddleware, asyncHandler(addHistory))

module.exports = router
