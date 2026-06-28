const { uploadBuffer } = require('../services/cloudinaryService')

const uploadFile = async (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(501).json({ message: 'Cloudinary is not configured' })
  if (!req.file) return res.status(400).json({ message: 'File is required' })

  const result = await uploadBuffer(req.file.buffer)
  res.status(201).json({ url: result.secure_url, publicId: result.public_id })
}

module.exports = { uploadFile }
