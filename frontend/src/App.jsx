import { Toaster } from 'sonner'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { MovieProvider } from './context/MovieContext'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(18, 18, 26, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#f5f5f7',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
