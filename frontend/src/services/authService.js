import api from './api'

export const loginRequest = (payload) => api.post('/auth/login', payload)

export const registerRequest = (payload) => api.post('/auth/register', payload)

export const sendOtpRequest = (payload) => api.post('/auth/send-otp', payload)

export const verifyOtpRequest = (payload) => api.post('/auth/verify-otp', payload)
