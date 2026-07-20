import axios from 'axios'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

export const resolveMediaUrl = (url) => {
  if (!url) return url
  if (/^(https?:|blob:|data:)/i.test(url)) return url
  if (url.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${url}`
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`
  return url
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
