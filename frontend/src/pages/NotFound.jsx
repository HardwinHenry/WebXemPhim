import { Home, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="section-eyebrow">Error 404</span>
      <h1 className="notfound-code">404</h1>
      <p className="page-subtitle">
        Không tìm thấy trang bạn yêu cầu. Có thể URL đã thay đổi hoặc bạn đã nhập sai đường dẫn.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn-primary" to="/">
          <Home size={16} />
          Về trang chủ
        </Link>
        <Link className="btn-ghost" to="/movies">
          <Search size={16} />
          Khám phá phim
        </Link>
      </div>
    </div>
  )
}
