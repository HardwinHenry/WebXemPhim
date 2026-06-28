import { createContext, useMemo, useState } from 'react'
import { demoComments, demoMovies } from '../utils/helpers'
import useAuth from '../hooks/useAuth'

export const MovieContext = createContext(null)

export function MovieProvider({ children }) {
  const { user } = useAuth()
  const [movies, setMovies] = useState(demoMovies)
  const [comments, setComments] = useState(() => {
    const localComments = localStorage.getItem('cineflow_comments')
    return localComments ? JSON.parse(localComments) : demoComments
  })
  const [favorites, setFavorites] = useState(['m1'])
  const [history, setHistory] = useState(['m2'])

  const featuredMovie = movies.find((movie) => movie.featured) || movies[0]
  const favoriteMovies = movies.filter((movie) => favorites.includes(movie._id))
  const historyMovies = history.map((id) => movies.find((movie) => movie._id === id)).filter(Boolean)
  const totalViews = movies.reduce((sum, movie) => sum + movie.views, 0)

  const selectMovie = (movie) => {
    setHistory((current) => [movie._id, ...current.filter((id) => id !== movie._id)].slice(0, 8))
    setMovies((current) => current.map((item) => (item._id === movie._id ? { ...item, views: item.views + 1 } : item)))
  }

  const toggleFavorite = (movieId) => {
    setFavorites((current) => (current.includes(movieId) ? current.filter((id) => id !== movieId) : [...current, movieId]))
  }

  const addComment = (movieId, content, rating) => {
    setComments((current) => {
      const newComment = {
        _id: `c${Date.now()}`,
        movieId,
        authorName: user?.username || 'Bạn',
        content,
        rating: rating ? Number(rating) : null,
        createdAt: new Date().toISOString(),
      }
      const updated = [newComment, ...current]
      localStorage.setItem('cineflow_comments', JSON.stringify(updated))
      return updated
    })
  }

  const addMovie = (payload) => {
    const movie = {
      _id: `m${Date.now()}`,
      title: payload.title.trim(),
      description: payload.description.trim() || 'Phim mới đang chờ cập nhật mô tả.',
      posterUrl:
        payload.posterUrl.trim() ||
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80',
      videoUrl: payload.videoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      genreName: payload.genreName,
      duration: Number(payload.duration),
      views: 0,
      featured: false,
    }

    setMovies((current) => [movie, ...current])
    return movie
  }

  const deleteMovie = (movieId) => {
    setMovies((current) => current.filter((movie) => movie._id !== movieId))
    setFavorites((current) => current.filter((id) => id !== movieId))
    setHistory((current) => current.filter((id) => id !== movieId))
  }

  const value = useMemo(
    () => ({
      addComment,
      addMovie,
      comments,
      deleteMovie,
      favoriteMovies,
      favorites,
      featuredMovie,
      historyMovies,
      movies,
      selectMovie,
      toggleFavorite,
      totalViews,
    }),
    [comments, favoriteMovies, favorites, featuredMovie, historyMovies, movies, totalViews],
  )

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
}
