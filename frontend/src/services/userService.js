import api from './api'

export const getUsersRequest = () => api.get('/users')

export const updateUserStatusRequest = (id, status) => api.patch(`/users/${id}/status`, { status })

export const getStatsRequest = () => api.get('/users/stats')
