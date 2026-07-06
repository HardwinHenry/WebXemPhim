require('dotenv').config({ override: true })

const cors = require('cors')
const express = require('express')
const fs = require('fs')
const path = require('path')
const { isMongoReady } = require('./config/db')
const { configureCloudinary } = require('./config/cloudinary')
const { errorMiddleware, notFound } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const movieRoutes = require('./routes/movieRoutes')
const genreRoutes = require('./routes/genreRoutes')
const commentRoutes = require('./routes/commentRoutes')
const favoriteRoutes = require('./routes/favoriteRoutes')
const historyRoutes = require('./routes/historyRoutes')
const userRoutes = require('./routes/userRoutes')

configureCloudinary()

const app = express()
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')
const frontendIndexPath = path.join(frontendDistPath, 'index.html')
const hasFrontendBuild = fs.existsSync(frontendIndexPath)

app.use(cors({ origin: process.env.CLIENT_URL || '*' }))
app.use(express.json({ limit: '20mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: isMongoReady() ? 'mongodb' : 'memory' })
})

app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/genres', genreRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/users', userRoutes)

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(frontendIndexPath)
  })
} else {
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      message: 'WebXemPhim API is running',
      health: '/api/health',
    })
  })
}

app.use(notFound)
app.use(errorMiddleware)

module.exports = app
