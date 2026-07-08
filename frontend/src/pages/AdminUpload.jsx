import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Film,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import useAuth from '../hooks/useAuth'
import useMovies from '../hooks/useMovies'
import { getUniqueGenres } from '../utils/helpers'
import {
  createMovieWithUploadRequest,
  deleteMovieRequest,
  uploadPosterRequest,
  uploadThumbnailRequest,
  uploadVideoRequest,
} from '../services/uploadService'

const QUALITY_OPTIONS = ['4K', 'FHD', 'HD', 'SD']
const GENRE_OPTIONS = ['Action', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Comedy', 'Thriller', 'Animation', 'Documentary', 'Mystery', 'Other']

function UploadProgress({ progress, label }) {
  return (
    <div className="upload-progress-wrap">
      <div className="upload-progress-header">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="upload-progress-track">
        <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default function AdminUpload() {
  const { user } = useAuth()
  const { addMovie, deleteMovie, movies } = useMovies()
  const genres = getUniqueGenres(movies).filter((g) => g !== 'Tất cả')

  const [form, setForm] = useState({
    title: '',
    description: '',
    genreName: genres[0] || 'Action',
    year: new Date().getFullYear(),
    duration: 120,
    quality: 'FHD',
    cast: '',
    featured: false,
    posterUrl: '',
    thumbnailUrl: '',
    videoUrl: '',
  })

  const [uploading, setUploading] = useState({ poster: false, thumbnail: false, video: false })
  const [progress, setProgress] = useState({ poster: 0, thumbnail: 0, video: 0 })
  const [uploadedFiles, setUploadedFiles] = useState({ poster: null, thumbnail: null, video: null })
  const [submitting, setSubmitting] = useState(false)
  const [movieId, setMovieId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const posterInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const handleFileSelect = async (type, file) => {
    if (!file) return

    const isVideo = type === 'video'
    const maxSize = isVideo ? 2 * 1024 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${isVideo ? '2GB' : '10MB'}`)
      return
    }

    const allowedTypes = isVideo
      ? ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
      : ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.type}`)
      return
    }

    setError('')
    setSuccess('')

    if (type === 'poster') {
      const fd = new FormData()
      fd.append('poster', file)
      setUploading((p) => ({ ...p, poster: true }))
      try {
        const { data } = await uploadPosterRequest(fd, (p) => setProgress((pr) => ({ ...pr, poster: p })))
        setUploadedFiles((f) => ({ ...f, poster: file.name }))
        setForm((f) => ({ ...f, posterUrl: data.posterUrl }))
        toast.success('Poster uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload poster')
        setError('Poster upload failed')
      } finally {
        setUploading((p) => ({ ...p, poster: false }))
      }
    } else if (type === 'thumbnail') {
      const fd = new FormData()
      fd.append('thumbnail', file)
      setUploading((p) => ({ ...p, thumbnail: true }))
      try {
        const { data } = await uploadThumbnailRequest(fd, (p) => setProgress((pr) => ({ ...pr, thumbnail: p })))
        setUploadedFiles((f) => ({ ...f, thumbnail: file.name }))
        setForm((f) => ({ ...f, thumbnailUrl: data.thumbnailUrl }))
        toast.success('Thumbnail uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload thumbnail')
        setError('Thumbnail upload failed')
      } finally {
        setUploading((p) => ({ ...p, thumbnail: false }))
      }
    } else if (type === 'video') {
      const fd = new FormData()
      fd.append('video', file)
      setUploading((p) => ({ ...p, video: true }))
      try {
        const { data } = await uploadVideoRequest(fd, (p) => setProgress((pr) => ({ ...pr, video: p })))
        setUploadedFiles((f) => ({ ...f, video: file.name }))
        setForm((f) => ({ ...f, videoUrl: data.videoUrl }))
        if (data.duration && !form.duration) {
          setForm((f) => ({ ...f, duration: data.duration }))
        }
        toast.success('Video uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload video')
        setError('Video upload failed')
      } finally {
        setUploading((p) => ({ ...p, video: false }))
      }
    }
  }

  const handleDrop = (type) => (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(type, file)
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    if (!form.videoUrl) {
      setError('Please upload a video file first')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload = {
        ...form,
        cast: form.cast ? form.cast.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      const { data } = await createMovieWithUploadRequest(payload)
      addMovie({ ...form, _id: data._id || `m${Date.now()}` })
      setSuccess('Movie created successfully!')
      toast.success('Movie added to the library!')
      setMovieId(data._id)
      resetForm()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create movie'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return
    try {
      await deleteMovieRequest(id)
      deleteMovie(id)
      toast.success('Movie deleted')
    } catch {
      toast.error('Failed to delete movie')
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      genreName: genres[0] || 'Action',
      year: new Date().getFullYear(),
      duration: 120,
      quality: 'FHD',
      cast: '',
      featured: false,
      posterUrl: '',
      thumbnailUrl: '',
      videoUrl: '',
    })
    setUploadedFiles({ poster: null, thumbnail: null, video: null })
    setProgress({ poster: 0, thumbnail: 0, video: 0 })
    setMovieId(null)
  }

  const removeUpload = (type) => {
    setUploadedFiles((f) => ({ ...f, [type]: null }))
    setForm((f) => ({ ...f, [type === 'poster' ? 'posterUrl' : type === 'thumbnail' ? 'thumbnailUrl' : 'videoUrl']: '' }))
    setProgress((p) => ({ ...p, [type]: 0 }))
  }

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <span className="section-eyebrow">Quản trị nội dung</span>
          <h1 className="page-title">Upload Phim Mới</h1>
          <p className="page-subtitle">
            Upload video lên Cloudinary, điền metadata và thêm phim vào thư viện.
          </p>
        </div>

        {user?.role !== 'admin' && (
          <div className="upload-alert upload-alert-warning">
            <AlertCircle size={18} />
            <span>You need admin permissions to upload movies.</span>
          </div>
        )}

        <div className="upload-layout">
          <form className="upload-form" onSubmit={handleSubmit}>
            <div className="upload-section-card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <span className="section-eyebrow">Step 1</span>
                  <h2 className="section-title">Video File</h2>
                </div>
                <Film size={20} color="#c4b5fd" />
              </div>
              <p className="upload-section-desc">Upload video gốc (mp4, mov, avi, webm, mkv). Tối đa 2GB. Video sẽ được Cloudinary tự động tối ưu streaming.</p>

              {uploadedFiles.video ? (
                <div className="upload-file-card upload-file-done">
                  <CheckCircle2 size={20} color="#22c55e" />
                  <div className="upload-file-info">
                    <strong>{uploadedFiles.video}</strong>
                    <span>Upload thành công</span>
                  </div>
                  <button type="button" className="upload-remove-btn" onClick={() => removeUpload('video')}>
                    <X size={16} />
                  </button>
                </div>
              ) : uploading.video ? (
                <UploadProgress progress={progress.video} label="Uploading video..." />
              ) : (
                <div
                  className="upload-dropzone"
                  onDrop={handleDrop('video')}
                  onDragOver={handleDragOver}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <CloudUpload size={36} color="#8b5cf6" />
                  <p>Kéo & thả file video vào đây</p>
                  <small>hoặc click để chọn file</small>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect('video', e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <div className="upload-section-card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <span className="section-eyebrow">Step 2</span>
                  <h2 className="section-title">Movie Information</h2>
                </div>
                <Film size={20} color="#c4b5fd" />
              </div>

              <div className="auth-form">
                <div className="auth-field">
                  <label>Title *</label>
                  <input
                    placeholder="Nhập tên phim..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Description *</label>
                  <textarea
                    placeholder="Mô tả nội dung phim..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--color-border-default)',
                      color: '#fff',
                      borderRadius: 10,
                      padding: 12,
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div className="upload-form-row">
                  <div className="auth-field">
                    <label>Genre</label>
                    <select value={form.genreName} onChange={(e) => setForm({ ...form, genreName: e.target.value })}>
                      {[...new Set([...genres, ...GENRE_OPTIONS])].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="auth-field">
                    <label>Year</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="upload-form-row">
                  <div className="auth-field">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    />
                  </div>
                  <div className="auth-field">
                    <label>Quality</label>
                    <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
                      {QUALITY_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label>Cast (comma separated)</label>
                  <input
                    placeholder="Actor 1, Actor 2, Actress 3"
                    value={form.cast}
                    onChange={(e) => setForm({ ...form, cast: e.target.value })}
                  />
                </div>
                <div className="auth-field">
                  <label className="upload-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    Featured movie
                  </label>
                </div>
              </div>
            </div>

            <div className="upload-section-card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <span className="section-eyebrow">Step 3</span>
                  <h2 className="section-title">Images (Optional)</h2>
                </div>
                <Film size={20} color="#c4b5fd" />
              </div>
              <p className="upload-section-desc">Upload poster (ảnh bìa) và thumbnail (ảnh preview video). Nếu bỏ trống, hệ thống sẽ dùng ảnh mặc định.</p>

              <div className="upload-form-row">
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Poster</label>
                  {uploadedFiles.poster ? (
                    <div className="upload-file-card upload-file-done">
                      <CheckCircle2 size={16} color="#22c55e" />
                      <div className="upload-file-info">
                        <strong style={{ fontSize: '0.8rem' }}>{uploadedFiles.poster}</strong>
                      </div>
                      <button type="button" className="upload-remove-btn" onClick={() => removeUpload('poster')}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : uploading.poster ? (
                    <UploadProgress progress={progress.poster} label="Uploading poster..." />
                  ) : (
                    <div
                      className="upload-dropzone upload-dropzone-sm"
                      onDrop={handleDrop('poster')}
                      onDragOver={handleDragOver}
                      onClick={() => posterInputRef.current?.click()}
                    >
                      <CloudUpload size={24} color="#8b5cf6" />
                      <small>Click to upload poster</small>
                      <input ref={posterInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect('poster', e.target.files[0])} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Thumbnail</label>
                  {uploadedFiles.thumbnail ? (
                    <div className="upload-file-card upload-file-done">
                      <CheckCircle2 size={16} color="#22c55e" />
                      <div className="upload-file-info">
                        <strong style={{ fontSize: '0.8rem' }}>{uploadedFiles.thumbnail}</strong>
                      </div>
                      <button type="button" className="upload-remove-btn" onClick={() => removeUpload('thumbnail')}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : uploading.thumbnail ? (
                    <UploadProgress progress={progress.thumbnail} label="Uploading thumbnail..." />
                  ) : (
                    <div
                      className="upload-dropzone upload-dropzone-sm"
                      onDrop={handleDrop('thumbnail')}
                      onDragOver={handleDragOver}
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <CloudUpload size={24} color="#8b5cf6" />
                      <small>Click to upload thumbnail</small>
                      <input ref={thumbnailInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect('thumbnail', e.target.files[0])} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="upload-alert upload-alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="upload-alert upload-alert-success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={submitting || !form.videoUrl}
              style={{ height: 50, fontSize: '1rem', width: '100%' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Creating movie...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add to Library
                </>
              )}
            </button>
          </form>

          <div className="upload-sidebar">
            <div className="comment-form-card" style={{ padding: 24 }}>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div>
                  <span className="section-eyebrow">Library</span>
                  <h2 className="section-title">Movies ({movies.length})</h2>
                </div>
                <Upload size={20} color="#c4b5fd" />
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {movies.map((m) => (
                  <div
                    key={m._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 12,
                    }}
                  >
                    <img
                      src={m.posterUrl}
                      alt=""
                      style={{ width: 48, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '0.9rem' }}>{m.title}</strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                        {m.genreName} · {m.duration} min · {m.quality || 'HD'}
                      </span>
                    </div>
                    <button
                      className="btn-danger-ghost"
                      onClick={() => handleDelete(m._id)}
                      type="button"
                      style={{ width: 32, height: 32, padding: 0, flexShrink: 0 }}
                      title="Delete movie"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {movies.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
                    No movies yet. Upload your first film!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
