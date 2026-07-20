require('dotenv').config({ override: true })

const cors = require('cors')
const express = require('express')
const fs = require('fs')
const path = require('path')
const { isMongoReady } = require('./config/db')
const { errorMiddleware, notFound } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const movieRoutes = require('./routes/movieRoutes')
const genreRoutes = require('./routes/genreRoutes')
const commentRoutes = require('./routes/commentRoutes')
const favoriteRoutes = require('./routes/favoriteRoutes')
const historyRoutes = require('./routes/historyRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')
const frontendIndexPath = path.join(frontendDistPath, 'index.html')
const hasFrontendBuild = fs.existsSync(frontendIndexPath)
const uploadsDir = path.resolve(__dirname, '../uploads')

app.use(cors({ origin: process.env.CLIENT_URL || '*' }))
app.use(express.json({ limit: '50mb' }))

// Serve uploaded files (videos, posters, thumbnails) with Range support for streaming
const STATIC_OPTIONS = {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (/\.mp4$/i.test(filePath)) {
      res.setHeader('Content-Type', 'video/mp4')
      res.setHeader('Accept-Ranges', 'bytes')
    } else if (/\.webm$/i.test(filePath)) {
      res.setHeader('Content-Type', 'video/webm')
      res.setHeader('Accept-Ranges', 'bytes')
    } else if (/\.jpg$|\.jpeg$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/jpeg')
    } else if (/\.png$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/png')
    } else if (/\.webp$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/webp')
    }
  },
}
app.use('/uploads', express.static(uploadsDir, STATIC_OPTIONS))

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
