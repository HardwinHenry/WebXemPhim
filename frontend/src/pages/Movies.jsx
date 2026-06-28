import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'

const pageSize = 6

export default function Movies() {
  const navigate = useNavigate()
  const { favorites, movies, selectMovie, toggleFavorite } = useMovies()
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('Tất cả')
  const [page, setPage] = useState(1)

  const genres = useMemo(() => getUniqueGenres(movies), [movies])
  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase())
        const matchesGenre = genre === 'Tất cả' || movie.genreName === genre
        return matchesQuery && matchesGenre
      }),
    [genre, movies, query],
  )

  const pages = Math.max(1, Math.ceil(filteredMovies.length / pageSize))
  const visibleMovies = filteredMovies.slice((page - 1) * pageSize, page * pageSize)

  const openMovie = (movie) => {
    selectMovie(movie)
    navigate(`/movies/${movie._id}`)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Kho nội dung</p>
          <h1>Danh sách phim</h1>
        </div>
        <SearchBar value={query} onChange={setQuery} />
      </header>

      <section className="catalog-panel">
        <div className="section-heading">
          <h2>Tất cả phim</h2>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        {visibleMovies.length ? (
          <div className="movie-grid">
            {visibleMovies.map((movie) => (
              <MovieCard
                isFavorite={favorites.includes(movie._id)}
                key={movie._id}
                movie={movie}
                onFavorite={toggleFavorite}
                onSelect={openMovie}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">Không có phim phù hợp.</div>
        )}
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </section>
    </>
  )
}
