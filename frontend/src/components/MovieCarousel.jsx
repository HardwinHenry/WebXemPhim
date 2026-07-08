import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

export default function MovieCarousel({ title, eyebrow, movies, favorites, onSelect, onFavorite }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const check = () => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    check()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [movies])

  const scrollBy = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (!movies?.length) return null

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
            <h2 className="section-title">{title}</h2>
          </div>
          <div className="carousel-nav">
            <button
              className="carousel-btn"
              disabled={!canPrev}
              onClick={() => scrollBy(-1)}
              type="button"
              aria-label="Trước"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="carousel-btn"
              disabled={!canNext}
              onClick={() => scrollBy(1)}
              type="button"
              aria-label="Sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="carousel-wrap">
          <div className="carousel no-scrollbar stagger" ref={trackRef}>
            {movies.map((movie) => (
              <MovieCard
                isFavorite={favorites.includes(movie._id)}
                key={movie._id}
                movie={movie}
                onFavorite={onFavorite}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
