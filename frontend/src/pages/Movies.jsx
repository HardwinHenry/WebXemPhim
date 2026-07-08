import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import GenrePills from '../components/GenrePills'
import MovieCard from '../components/MovieCard'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { SkeletonGrid } from '../components/SkeletonCard'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'

const pageSize = 12

export default function Movies() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { favorites, movies, selectMovie, toggleFavorite } = useMovies()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [genre, setGenre] = useState(searchParams.get('g') || 'Tất cả')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setSearchParams(
      (() => {
        const p = new URLSearchParams()
        if (query) p.set('q', query)
        if (genre !== 'Tất cả') p.set('g', genre)
        return p
      })(),
      { replace: true },
    )
  }, [query, genre, setSearchParams])

  const genres = useMemo(() => getUniqueGenres(movies), [movies])
  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        const q = query.toLowerCase()
        const matchesQuery = !q || movie.title.toLowerCase().includes(q)
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
    <div className="search-page">
      <div className="container">
        <div className="search-hero">
          <span className="section-eyebrow">Kho nội dung</span>
          <h1 className="page-title">Khám phá thư viện phim</h1>
          <p className="page-subtitle">
            Tìm kiếm hàng nghìn bộ phim chất lượng cao theo tên hoặc thể loại bạn yêu thích.
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={(v) => {
            setQuery(v)
            setPage(1)
          }}
          placeholder="Tìm phim, diễn viên, đạo diễn..."
        />

        <div style={{ marginTop: 28 }}>
          <GenrePills
            genres={genres}
            active={genre}
            onChange={(g) => {
              setGenre(g)
              setPage(1)
            }}
          />
        </div>

        <div className="section-header" style={{ marginTop: 20 }}>
          <div>
            <span className="section-eyebrow">Kết quả</span>
            <h2 className="section-title">
              {filteredMovies.length} bộ phim
            </h2>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={8} />
        ) : visibleMovies.length ? (
          <div className="movie-grid stagger">
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
          <div className="empty-state">
            Không tìm thấy phim nào phù hợp với tiêu chí của bạn.
          </div>
        )}

        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </div>
  )
}
