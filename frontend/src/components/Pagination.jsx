import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null
  const items = []
  for (let i = 1; i <= pages; i++) {
    if (
      i === 1 ||
      i === pages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      items.push(i)
    } else if (i === page - 2 || i === page + 2) {
      items.push('…')
    }
  }
  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
        title="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>
      {items.map((it, idx) =>
        it === '…' ? (
          <span key={`dots-${idx}`} style={{ color: 'var(--color-text-muted)', padding: '0 6px' }}>
            …
          </span>
        ) : (
          <button
            className={page === it ? 'active' : ''}
            key={it}
            onClick={() => onPageChange(it)}
            type="button"
          >
            {it}
          </button>
        ),
      )}
      <button
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        type="button"
        title="Trang sau"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
