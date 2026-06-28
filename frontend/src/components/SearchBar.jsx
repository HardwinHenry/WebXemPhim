import { Search } from 'lucide-react'

export default function SearchBar({ onChange, value }) {
  return (
    <div className="search-box">
      <Search size={18} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Tìm theo tên phim" />
    </div>
  )
}
