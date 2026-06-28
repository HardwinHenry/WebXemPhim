import api from './api'

export const loginRequest = (payload) => api.post('/auth/login', payload)

export const registerRequest = (payload) => api.post('/auth/register', payload)
