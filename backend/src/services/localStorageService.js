const fs = require('fs')
const path = require('path')

const UPLOADS_DIR = path.resolve(__dirname, '../uploads')
const VIDEO_DIR = path.join(UPLOADS_DIR, 'videos')
const POSTER_DIR = path.join(UPLOADS_DIR, 'posters')
const THUMBNAIL_DIR = path.join(UPLOADS_DIR, 'thumbnails')

// Ensure upload directories exist
;[UPLOADS_DIR, VIDEO_DIR, POSTER_DIR, THUMBNAIL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

const saveFile = (buffer, subDir, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOADS_DIR, subDir, filename)
    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(err)
      resolve(`/uploads/${subDir}/${filename}`)
    })
  })
}

const removeFile = (url) => {
  if (!url || !url.startsWith('/uploads/')) return
  const filePath = path.join(UPLOADS_DIR, url.replace(/^\/uploads\//, ''))
  fs.unlink(filePath, () => {})
}

const localUploadVideo = async (buffer, options = {}) => {
  const filename = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`
  const fileUrl = await saveFile(buffer, 'videos', filename)
  return { secure_url: fileUrl, public_id: filename }
}

const localUploadPoster = async (buffer, options = {}) => {
  const filename = `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const fileUrl = await saveFile(buffer, 'posters', filename)
  return { secure_url: fileUrl, public_id: filename }
}

const localUploadThumbnail = async (buffer, options = {}) => {
  const filename = `thumb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const fileUrl = await saveFile(buffer, 'thumbnails', filename)
  return { secure_url: fileUrl, public_id: filename }
}

const localDestroy = async (publicId, resourceType = 'video') => {
  const dir = resourceType === 'video' ? 'videos' : resourceType === 'image' ? 'posters' : 'thumbnails'
  const filePath = path.join(UPLOADS_DIR, dir, publicId)
  fs.unlink(filePath, () => {})
}

module.exports = {
  localDestroy,
  localUploadPoster,
  localUploadThumbnail,
  localUploadVideo,
  UPLOADS_DIR,
}
