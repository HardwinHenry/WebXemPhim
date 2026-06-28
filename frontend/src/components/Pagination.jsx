import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPageChange }) {
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button" title="Trang trước">
        <ChevronLeft size={18} />
      </button>
      <span>
        {page}/{pages}
      </span>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} type="button" title="Trang sau">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
