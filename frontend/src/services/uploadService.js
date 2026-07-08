import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

const directApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

directApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const UPLOAD_TIMEOUT = 10 * 60 * 1000

export const uploadVideoRequest = (formData, onProgress) => {
  return directApi.post('/movies/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
    timeout: UPLOAD_TIMEOUT,
  })
}

export const uploadPosterRequest = (formData, onProgress) => {
  return directApi.post('/movies/upload-poster', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
    timeout: UPLOAD_TIMEOUT,
  })
}

export const uploadThumbnailRequest = (formData, onProgress) => {
  return directApi.post('/movies/upload-thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
    timeout: UPLOAD_TIMEOUT,
  })
}

export const createMovieWithUploadRequest = (movieData) =>
  api.post('/movies/create-with-upload', movieData)

export const deleteMovieRequest = (id) => api.delete(`/movies/${id}`)

export const getStreamingUrlRequest = (id) => api.get(`/movies/${id}/stream`)

export default api
