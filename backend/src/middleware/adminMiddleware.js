const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin permission required' })
  return next()
}

module.exports = adminMiddleware
