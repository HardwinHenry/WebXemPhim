const { cloudinary } = require('../config/cloudinary')

const BASE_FOLDER = 'movie-streaming'

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: options.folder || BASE_FOLDER,
        public_id: options.publicId,
        overwrite: Boolean(options.publicId),
        ...options,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

const uploadVideo = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: `${BASE_FOLDER}/videos`,
        public_id: options.publicId,
        overwrite: Boolean(options.publicId),
        eager: 'vc_auto',
        eager_async: true,
        notification_url: options.notificationUrl,
        transformation: [
          { quality: 'auto', format: 'mp4' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

const uploadPoster = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `${BASE_FOLDER}/posters`,
        transformation: [
          { width: 900, height: 1350, crop: 'fill', format: 'auto', quality: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

const uploadThumbnail = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `${BASE_FOLDER}/thumbnails`,
        transformation: [
          { width: 640, height: 360, crop: 'fill', format: 'auto', quality: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

const destroy = (publicId, resourceType = 'video') =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })

module.exports = { destroy, uploadBuffer, uploadPoster, uploadThumbnail, uploadVideo }
