const uploadLimiter = new Map()

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const MAX_UPLOADS_PER_WINDOW = 10

const rateLimitMiddleware = (req, res, next) => {
  const key = req.user?._id || req.ip
  const now = Date.now()

  if (!uploadLimiter.has(key)) {
    uploadLimiter.set(key, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS })
  }

  const record = uploadLimiter.get(key)

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + RATE_LIMIT_WINDOW_MS
  }

  if (record.count >= MAX_UPLOADS_PER_WINDOW) {
    return res.status(429).json({
      message: 'Too many uploads. Please wait a few minutes.',
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    })
  }

  record.count += 1
  res.setHeader('X-RateLimit-Limit', MAX_UPLOADS_PER_WINDOW)
  res.setHeader('X-RateLimit-Remaining', MAX_UPLOADS_PER_WINDOW - record.count)
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000))
  next()
}

module.exports = rateLimitMiddleware
