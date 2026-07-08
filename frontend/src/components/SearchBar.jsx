import { Search, X } from 'lucide-react'

export default function SearchBar({ onChange, value, placeholder = 'Tìm theo tên phim...' }) {
  return (
    <div className="search-input-wrap">
      <Search size={18} color="var(--color-text-muted)" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            borderRadius: 6,
          }}
          title="Xóa"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
