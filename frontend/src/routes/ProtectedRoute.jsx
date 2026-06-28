import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate replace to="/login" />
  if (adminOnly && user?.role !== 'admin') return <Navigate replace to="/" />

  return <Outlet />
}
