import { createContext, useMemo, useState } from 'react'
import { demoComments, demoMovies } from '../utils/helpers'
import { createContentId } from '../utils/movieContent'
import { loadMovies, saveMovies } from '../utils/movieStorage'
import useAuth from '../hooks/useAuth'

export const MovieContext = createContext(null)

export function MovieProvider({ children }) {
  const { user } = useAuth()
  const [movies, setMovies] = useState(() => loadMovies(demoMovies))
  const [comments, setComments] = useState(() => {
    const localComments = localStorage.getItem('cineflow_comments')
    return localComments ? JSON.parse(localComments) : demoComments
  })
  const [favorites, setFavorites] = useState(['m1'])
  const [history, setHistory] = useState(['m2'])

  const featuredMovie = movies.find((movie) => movie.featured) || movies[0]
  const favoriteMovies = movies.filter((movie) => favorites.includes(movie._id))
  const historyMovies = history.map((id) => movies.find((movie) => movie._id === id)).filter(Boolean)
  const totalViews = movies.reduce((sum, movie) => sum + Number(movie.views || 0), 0)

  const selectMovie = (movie) => {
    setHistory((current) => [movie._id, ...current.filter((id) => id !== movie._id)].slice(0, 8))
    setMovies((current) => {
      const updated = current.map((item) =>
        item._id === movie._id ? { ...item, views: Number(item.views || 0) + 1 } : item,
      )
      saveMovies(updated)
      return updated
    })
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
      ...payload,
      _id: payload._id || createContentId('movie'),
      title: String(payload.title || '').trim(),
      description: String(payload.description || '').trim() || 'Phim mới đang chờ cập nhật mô tả.',
      posterUrl:
        String(payload.posterUrl || '').trim() ||
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80',
      genreName: payload.genreName || 'Other',
      quality: payload.quality || 'HD',
      rating: Number(payload.rating || 4.5),
      views: Number(payload.views || 0),
      featured: Boolean(payload.featured),
    }

    setMovies((current) => {
      const updated = [movie, ...current]
      saveMovies(updated)
      return updated
    })
    return movie
  }

  const deleteMovie = (movieId) => {
    setMovies((current) => {
      const updated = current.filter((movie) => movie._id !== movieId)
      saveMovies(updated)
      return updated
    })
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
