import { Film } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: '#fff',
              }}
            >
              <Film size={16} />
            </span>
            CineFlow
          </div>
          <p className="footer-text">
            Nền tảng xem phim trực tuyến thế hệ mới — trải nghiệm điện ảnh cinematic với chất
            lượng 4K Ultra HD.
          </p>
          <small className="footer-meta">
            © 2026 CineFlow. Thiết kế bởi <span className="neon-text-violet">CineFlow Studio</span>.
          </small>
        </div>
      </div>
    </footer>
  )
}
