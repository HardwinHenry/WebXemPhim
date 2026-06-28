const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
}

const errorMiddleware = (error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: error.message || 'Internal server error' })
}

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next)
  } catch (error) {
    next(error)
  }
}

module.exports = { asyncHandler, errorMiddleware, notFound }
