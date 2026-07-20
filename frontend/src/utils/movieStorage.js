export const MOVIE_STORAGE_KEY = 'cineflow_movies'

export function loadMovies(fallbackMovies = []) {
  if (typeof localStorage === 'undefined') return fallbackMovies

  try {
    const stored = localStorage.getItem(MOVIE_STORAGE_KEY)
    if (stored === null) return fallbackMovies

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : fallbackMovies
  } catch {
    return fallbackMovies
  }
}

export function saveMovies(movies) {
  if (typeof localStorage === 'undefined') return false

  try {
    localStorage.setItem(MOVIE_STORAGE_KEY, JSON.stringify(movies))
    return true
  } catch {
    return false
  }
}
