const mongoose = require('mongoose')
const dns = require('dns')

let mongoReady = false

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.MONGOOSE_CONNECT_STRING
  if (!dbUri) return false

  try {
    await mongoose.connect(dbUri)
    mongoReady = true
    console.log('MongoDB connected')
    return true
  } catch (error) {
    // Check if the connection failed because of a DNS / querySrv issue
    if (error.message.includes('querySrv') || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      try {
        console.log('DNS resolution issue detected. Retrying connection with Google & Cloudflare DNS servers...')
        dns.setServers(['8.8.8.8', '1.1.1.1'])
        await mongoose.connect(dbUri)
        mongoReady = true
        console.log('MongoDB connected (via DNS fallback)')
        return true
      } catch (retryError) {
        console.warn(`MongoDB unavailable after DNS retry: ${retryError.message}`)
        return false
      }
    }
    console.warn(`MongoDB unavailable, using memory data: ${error.message}`)
    return false
  }
}

const isMongoReady = () => mongoReady

module.exports = { connectDB, isMongoReady }
