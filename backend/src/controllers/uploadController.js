const { localUploadVideo, localUploadPoster, localUploadThumbnail } = require('../services/localStorageService')

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File is required' })

  const { fieldname, buffer } = req.file
  let result

  if (fieldname === 'video') {
    result = await localUploadVideo(buffer)
  } else if (fieldname === 'poster') {
    result = await localUploadPoster(buffer)
  } else if (fieldname === 'thumbnail') {
    result = await localUploadThumbnail(buffer)
  } else {
    result = await localUploadPoster(buffer)
  }

  res.status(201).json({ url: result.secure_url, publicId: result.public_id })
}

module.exports = { uploadFile }