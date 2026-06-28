import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="catalog-panel">
      <p className="eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <Link className="primary-button" to="/">
        Về trang chủ
      </Link>
    </section>
  )
}
