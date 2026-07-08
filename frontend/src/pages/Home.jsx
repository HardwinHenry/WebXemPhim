import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroBanner from '../components/HeroBanner'
import MovieCarousel from '../components/MovieCarousel'
import GenrePills from '../components/GenrePills'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'

export default function Home() {
  const navigate = useNavigate()
  const { featuredMovie, favorites, movies, selectMovie, toggleFavorite } = useMovies()

  const watchMovie = (movie) => {
    selectMovie(movie)
    navigate(`/movies/${movie._id}`)
  }

  const genres = useMemo(() => getUniqueGenres(movies), [movies])

  const topPicks = useMemo(
    () => [...movies].sort((a, b) => b.views - a.views).slice(0, 8),
    [movies],
  )

  const newReleases = useMemo(
    () => [...movies].slice(0, 8).reverse(),
    [movies],
  )

  const trending = useMemo(
    () => movies.filter((m) => m.featured).slice(0, 8),
    [movies],
  )

  return (
    <>
      <HeroBanner
        featured={featuredMovie}
        related={topPicks}
        favorites={favorites}
        onSelect={watchMovie}
        onFavorite={toggleFavorite}
      />

      <main>
        <section className="section" style={{ paddingTop: 48 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Khám phá</span>
                <h2 className="section-title">Chọn thể loại yêu thích của bạn</h2>
              </div>
            </div>
            <GenrePills
              genres={genres}
              active="Tất cả"
              onChange={() => navigate('/movies')}
            />
          </div>
        </section>

        <MovieCarousel
          title="Đang thịnh hành"
          eyebrow="Top lượt xem"
          movies={topPicks}
          favorites={favorites}
          onSelect={watchMovie}
          onFavorite={toggleFavorite}
        />

        {trending.length > 0 && (
          <MovieCarousel
            title="Nổi bật tuần này"
            eyebrow="Editor's pick"
            movies={trending}
            favorites={favorites}
            onSelect={watchMovie}
            onFavorite={toggleFavorite}
          />
        )}

        <MovieCarousel
          title="Mới phát hành"
          eyebrow="Fresh drops"
          movies={newReleases}
          favorites={favorites}
          onSelect={watchMovie}
          onFavorite={toggleFavorite}
        />
      </main>
    </>
  )
}
