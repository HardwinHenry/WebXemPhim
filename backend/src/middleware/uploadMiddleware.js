const multer = require('multer')

const MAX_SIZES = {
  video: 2 * 1024 * 1024 * 1024,  // 2GB
  image: 10 * 1024 * 1024,        // 10MB
  default: 10 * 1024 * 1024,       // 10MB
}

const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const isVideo = file.mimetype.startsWith('video/')
  const isImage = file.mimetype.startsWith('image/')

  if (isVideo && !ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
    return cb(new Error(`Video format not supported: ${file.mimetype}. Allowed: mp4, mov, avi, webm, mkv`), false)
  }
  if (isImage && !ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    return cb(new Error(`Image format not supported: ${file.mimetype}. Allowed: jpg, png, webp, gif`), false)
  }
  cb(null, true)
}

const limits = {
  fileSize: MAX_SIZES.default,
  files: 1,
}

const upload = multer({ storage, fileFilter, limits })

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZES.video, files: 1 },
})

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZES.image, files: 1 },
})

module.exports = { upload, uploadImage, uploadVideo }
