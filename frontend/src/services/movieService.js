import api from './api'

export const getMoviesRequest = (params) => api.get('/movies', { params })

export const getMovieRequest = (id) => api.get(`/movies/${id}`)

export const createMovieRequest = (payload) => api.post('/movies', payload)

export const deleteMovieRequest = (id) => api.delete(`/movies/${id}`)

export const addMovieViewRequest = (id) => api.post(`/movies/${id}/view`)
