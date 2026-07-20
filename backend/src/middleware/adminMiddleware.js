const adminMiddleware = (req, res, next) => {
  const role = req.user?.role
  const allowedRoles = ['admin', 'master admin']
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Admin permission required' })
  }
  return next()
}

module.exports = adminMiddleware
