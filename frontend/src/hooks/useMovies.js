import { useContext } from 'react'
import { MovieContext } from '../context/MovieContext'

export default function useMovies() {
  const context = useContext(MovieContext)
  if (!context) throw new Error('useMovies must be used inside MovieProvider')
  return context
}
