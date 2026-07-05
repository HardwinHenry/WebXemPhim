import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate replace to="/login" state={{ from: location }} />
  if (adminOnly && user?.role !== 'admin') return <Navigate replace to="/" />

  return <Outlet />
}
