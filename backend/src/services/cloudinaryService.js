const { cloudinary } = require('../config/cloudinary')

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'movie-streaming' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )

    stream.end(buffer)
  })

module.exports = { uploadBuffer }
