const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
}

const errorMiddleware = (error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' })
  }

  const statusCode = error.statusCode || error.status || 500
  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({ message: error.message || 'Internal server error' })
}

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next)
  } catch (error) {
    next(error)
  }
}

module.exports = { asyncHandler, errorMiddleware, notFound }
