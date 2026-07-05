require('dotenv').config({ override: true })

const app = require('./app')
const { connectDB, isMongoReady } = require('./config/db')
const User = require('./models/User')
const memoryStore = require('./models/memoryStore')
const { hashPassword } = require('./services/authService')

const PORT = process.env.PORT || 5000

const seedAdmin = async () => {
  if (isMongoReady()) {
    const exists = await User.findOne({ role: 'admin' })
    if (!exists && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await User.create({
        username: process.env.ADMIN_USERNAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: await hashPassword(process.env.ADMIN_PASSWORD),
        role: 'admin',
      })
    }
    return
  }

  if (!memoryStore.users.some((user) => user.role === 'admin')) {
    memoryStore.users.push({
      _id: 'admin',
      username: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      role: 'admin',
      status: 'active',
    })
  }
}


const startServer = async () => {
  await connectDB()
  await seedAdmin()
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
}

startServer()
