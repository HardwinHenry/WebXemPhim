import { Film, LayoutDashboard, Plus, Shield, Upload } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <section className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-icon">
            <Shield size={18} />
          </div>
          <div>
            <strong>Admin Panel</strong>
            <small>CineFlow</small>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          <Link to="/admin" className="admin-nav-item">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/admin/upload" className="admin-nav-item">
            <Upload size={18} />
            Upload Phim
          </Link>
          <Link to="/admin" className="admin-nav-item">
            <Film size={18} />
            Quản lý Phim
          </Link>
          <Link to="/admin/upload" className="admin-nav-item">
            <Plus size={18} />
            Thêm Nội dung
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </section>
  )
}
