import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Film,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import SeasonEpisodeEditor from '../components/admin/SeasonEpisodeEditor'
import useAuth from '../hooks/useAuth'
import useMovies from '../hooks/useMovies'
import { resolveMediaUrl } from '../services/api'
import {
  uploadPosterRequest,
  uploadThumbnailRequest,
  uploadVideoRequest,
} from '../services/uploadService'
import {
  CONTENT_TYPE_OPTIONS,
  DOCUMENTARY_FORMAT_OPTIONS,
  createContentId,
  getContentBadge,
  getContentSummary,
  isEpisodicContent,
} from '../utils/movieContent'
import { getUniqueGenres } from '../utils/helpers'

const QUALITY_OPTIONS = ['4K', 'FHD', 'HD', 'SD']
const GENRE_OPTIONS = [
  'Action',
  'Drama',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Comedy',
  'Thriller',
  'Animation',
  'Documentary',
  'Mystery',
  'Other',
]
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_FORMATS_LABEL = 'MP4, MOV, AVI, WEBM, MKV'
const IMAGE_FORMATS_LABEL = 'JPG, PNG, WEBP'
const VIDEO_MAX_LABEL = 'Tối đa 2GB'
const IMAGE_MAX_LABEL = 'Tối đa 10MB'

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80'

function isPersistableMediaPath(value) {
  return typeof value === 'string' && !/^(blob:|data:)/i.test(value.trim())
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function createSeason(seasonNumber) {
  return {
    seasonNumber,
    title: `Mùa ${seasonNumber}`,
    episodes: [],
  }
}

function createInitialForm(genres) {
  return {
    title: '',
    description: '',
    type: 'movie',
    documentaryFormat: 'single',
    genreName: genres[0] || 'Action',
    year: new Date().getFullYear(),
    duration: 120,
    seasonCount: 1,
    totalEpisodes: 1,
    episodeDuration: 45,
    quality: 'FHD',
    cast: '',
    featured: false,
    posterUrl: '',
    thumbnailUrl: '',
    videoUrl: '',
  }
}

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

function InlineError({ children }) {
  return children ? <span className="field-error">{children}</span> : null
}

function StepBadge({ children }) {
  return <span className="step-badge">{children}</span>
}

function ToggleSwitch({ checked, id, label, onChange }) {
  return (
    <label className="toggle-field" htmlFor={id}>
      <span className="toggle-field-text">
        <strong>{label}</strong>
        <small>Hiển thị phim này trong khu vực phim nổi bật của trang chủ.</small>
      </span>
      <span className="toggle-switch" data-checked={checked ? 'true' : 'false'}>
        <input
          checked={checked}
          id={id}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="toggle-switch-track">
          <span className="toggle-switch-thumb" />
        </span>
      </span>
    </label>
  )
}

function DeleteConfirmDialog({ movie, onCancel, onConfirm }) {
  if (!movie) return null
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon">
          <Trash2 size={22} />
        </div>
        <h3>Xóa phim khỏi thư viện?</h3>
        <p>
          Phim <strong>“{movie.title}”</strong> sẽ bị xóa vĩnh viễn khỏi trình duyệt hiện tại.
          Hành động này không thể hoàn tác.
        </p>
        <div className="confirm-dialog-actions">
          <button className="btn-ghost" onClick={onCancel} type="button">
            Hủy
          </button>
          <button className="btn-danger-solid" onClick={onConfirm} type="button">
            <Trash2 size={16} />
            Xóa phim
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUpload() {
  const { user } = useAuth()
  const { addMovie, deleteMovie, movies } = useMovies()
  const genres = useMemo(
    () => getUniqueGenres(movies).filter((genre) => genre !== 'Tất cả'),
    [movies],
  )

  const [form, setForm] = useState(() => createInitialForm(genres))
  const [seasons, setSeasons] = useState([createSeason(1)])
  const [activeSeason, setActiveSeason] = useState(0)
  const [uploading, setUploading] = useState({ poster: false, thumbnail: false, video: false })
  const [progress, setProgress] = useState({ poster: 0, thumbnail: 0, video: 0 })
  const [uploadedFiles, setUploadedFiles] = useState({
    poster: null,
    thumbnail: null,
    video: null,
  })
  const [uploadedFileSizes, setUploadedFileSizes] = useState({
    poster: 0,
    thumbnail: 0,
    video: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [dragOver, setDragOver] = useState({ poster: false, thumbnail: false, video: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [genreFilter, setGenreFilter] = useState('Tất cả')
  const [pendingDelete, setPendingDelete] = useState(null)

  const posterInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const episodic = isEpisodicContent(form.type, form.documentaryFormat)

  useEffect(() => {
    if (!genreFilter || genreFilter === 'Tất cả') return
    if (!genres.includes(genreFilter)) setGenreFilter('Tất cả')
  }, [genres, genreFilter])

  const clearError = (field) => {
    setErrors((current) => {
      if (!current[field]) return current
      const updated = { ...current }
      delete updated[field]
      return updated
    })
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    clearError(field)
    setSuccess('')
  }

  const updateContentMode = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors({})
    setSuccess('')
  }

  const ensureSeasonDrafts = (count) => {
    const validCount = Math.max(1, Number(count) || 1)
    setSeasons((current) => {
      if (current.length >= validCount) return current
      return [
        ...current,
        ...Array.from({ length: validCount - current.length }, (_, index) =>
          createSeason(current.length + index + 1),
        ),
      ]
    })
    setActiveSeason((current) => Math.min(current, validCount - 1))
  }

  const handleSeasonCountChange = (value) => {
    updateForm('seasonCount', value)
    ensureSeasonDrafts(value)
  }

  const handleFileSelect = async (kind, file) => {
    if (!file) return

    const isVideo = kind === 'video'
    const maxSize = isVideo ? 2 * 1024 * 1024 * 1024 : 10 * 1024 * 1024
    const allowedTypes = isVideo ? VIDEO_TYPES : IMAGE_TYPES
    if (file.size > maxSize) {
      toast.error(`Tệp vượt quá dung lượng tối đa ${isVideo ? '2GB' : '10MB'}.`)
      return
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error('Định dạng tệp không được hỗ trợ.')
      return
    }

    setUploading((current) => ({ ...current, [kind]: true }))
    setProgress((current) => ({ ...current, [kind]: 0 }))
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append(kind, file)
      const request = kind === 'poster'
        ? uploadPosterRequest
        : kind === 'thumbnail'
          ? uploadThumbnailRequest
          : uploadVideoRequest
      const { data } = await request(formData, (value) =>
        setProgress((current) => ({ ...current, [kind]: value })),
      )
      const urlField = kind === 'poster' ? 'posterUrl' : kind === 'thumbnail' ? 'thumbnailUrl' : 'videoUrl'
      const url = kind === 'poster' ? data.posterUrl : kind === 'thumbnail' ? data.thumbnailUrl : data.videoUrl
      setUploadedFiles((current) => ({ ...current, [kind]: file.name }))
      setUploadedFileSizes((current) => ({ ...current, [kind]: file.size }))
      updateForm(urlField, url)
      toast.success(kind === 'video' ? 'Đã chọn video.' : 'Đã chọn hình ảnh.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu tệp. Bạn có thể dán URL trực tiếp vào ô bên dưới.')
    } finally {
      setUploading((current) => ({ ...current, [kind]: false }))
    }
  }

  const handleDrop = (kind) => (event) => {
    event.preventDefault()
    setDragOver((current) => ({ ...current, [kind]: false }))
    handleFileSelect(kind, event.dataTransfer.files?.[0])
  }

  const handleDragOver = (kind) => (event) => {
    event.preventDefault()
    setDragOver((current) => (current[kind] ? current : { ...current, [kind]: true }))
  }

  const handleDragLeave = (kind) => (event) => {
    event.preventDefault()
    setDragOver((current) => ({ ...current, [kind]: false }))
  }

  const removeUpload = (kind) => {
    const urlField = { poster: 'posterUrl', thumbnail: 'thumbnailUrl', video: 'videoUrl' }[kind]
    setUploadedFiles((current) => ({ ...current, [kind]: null }))
    setUploadedFileSizes((current) => ({ ...current, [kind]: 0 }))
    setProgress((current) => ({ ...current, [kind]: 0 }))
    updateForm(urlField, '')
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Vui lòng nhập tên phim.'
    if (!form.description.trim()) nextErrors.description = 'Vui lòng nhập mô tả.'

    const currentYear = new Date().getFullYear()
    const yearValue = Number(form.year)
    if (!Number.isFinite(yearValue) || yearValue < 1900 || yearValue > currentYear + 5) {
      nextErrors.year = `Năm phát hành phải từ 1900 đến ${currentYear + 5}.`
    }

    if (!episodic) {
      if (!Number.isFinite(Number(form.duration)) || Number(form.duration) < 1) {
        nextErrors.duration = 'Thời lượng phim phải lớn hơn 0 phút.'
      }
      if (!form.videoUrl.trim()) {
        nextErrors.videoUrl = 'Vui lòng chọn tệp hoặc nhập đường dẫn video.'
      } else if (!isPersistableMediaPath(form.videoUrl)) {
        nextErrors.videoUrl = 'Không thể lưu video dạng blob hoặc base64 trong trình duyệt.'
      }
    } else {
      const seasonCount = Number(form.seasonCount)
      const totalEpisodes = Number(form.totalEpisodes)
      if (!Number.isInteger(seasonCount) || seasonCount < 1) {
        nextErrors.seasonCount = 'Số mùa phải là số nguyên từ 1.'
      }
      if (!Number.isInteger(totalEpisodes) || totalEpisodes < 1) {
        nextErrors.totalEpisodes = 'Tổng số tập phải là số nguyên từ 1.'
      }
      if (form.episodeDuration !== '' && Number(form.episodeDuration) < 1) {
        nextErrors.episodeDuration = 'Thời lượng mỗi tập phải từ 1 phút.'
      }

      const activeSeasons = seasons.slice(0, Math.max(1, seasonCount || 1))
      let actualEpisodes = 0
      activeSeasons.forEach((season) => {
        const episodes = Array.isArray(season.episodes) ? season.episodes : []
        actualEpisodes += episodes.length
        if (!episodes.length) {
          nextErrors[`season-${season.seasonNumber}`] = `Mùa ${season.seasonNumber} phải có ít nhất 1 tập.`
        }

        const counts = new Map()
        episodes.forEach((episode) => {
          const episodeNumber = Number(episode.episodeNumber)
          if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
            nextErrors[`episode-${season.seasonNumber}-${episode.id}-episodeNumber`] =
              'Số tập phải là số nguyên từ 1.'
          } else {
            counts.set(episodeNumber, (counts.get(episodeNumber) || 0) + 1)
          }
          if (!String(episode.video || '').trim()) {
            nextErrors[`episode-${season.seasonNumber}-${episode.id}-video`] =
              'Vui lòng thêm tệp hoặc đường dẫn video.'
          } else if (!isPersistableMediaPath(episode.video)) {
            nextErrors[`episode-${season.seasonNumber}-${episode.id}-video`] =
              'Không thể lưu video dạng blob hoặc base64 trong trình duyệt.'
          }
          if (episode.duration !== '' && Number(episode.duration) < 1) {
            nextErrors[`episode-${season.seasonNumber}-${episode.id}-duration`] =
              'Thời lượng phải từ 1 phút.'
          }
        })
        episodes.forEach((episode) => {
          if (counts.get(Number(episode.episodeNumber)) > 1) {
            nextErrors[`episode-${season.seasonNumber}-${episode.id}-episodeNumber`] =
              'Số tập đã tồn tại trong mùa này.'
          }
        })
      })

      if (Number.isInteger(totalEpisodes) && totalEpisodes >= 1 && actualEpisodes !== totalEpisodes) {
        nextErrors.totalEpisodes = `Đã thêm ${actualEpisodes} tập, không khớp tổng số tập đã nhập.`
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = () => {
    const base = {
      _id: createContentId('movie'),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      genreName: form.genreName,
      year: Number(form.year),
      quality: form.quality,
      cast: form.cast.split(',').map((name) => name.trim()).filter(Boolean),
      featured: form.featured,
      posterUrl: form.posterUrl.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
    }

    if (form.type === 'documentary') base.documentaryFormat = form.documentaryFormat

    if (!episodic) {
      return {
        ...base,
        duration: Number(form.duration),
        videoUrl: form.videoUrl.trim(),
      }
    }

    const seasonCount = Number(form.seasonCount)
    return {
      ...base,
      seasonCount,
      totalEpisodes: Number(form.totalEpisodes),
      ...(form.episodeDuration !== '' ? { episodeDuration: Number(form.episodeDuration) } : {}),
      seasons: seasons.slice(0, seasonCount).map((season, seasonIndex) => ({
        seasonNumber: seasonIndex + 1,
        title: season.title || `Mùa ${seasonIndex + 1}`,
        episodes: season.episodes.map((episode) => ({
          id: episode.id,
          episodeNumber: Number(episode.episodeNumber),
          title: episode.title.trim() || `Tập ${episode.episodeNumber}`,
          ...(episode.duration !== '' ? { duration: Number(episode.duration) } : {}),
          video: episode.video.trim(),
          thumbnail: episode.thumbnail.trim(),
          description: episode.description.trim(),
        })),
      })),
    }
  }

  const resetForm = () => {
    setForm(createInitialForm(genres))
    setSeasons([createSeason(1)])
    setActiveSeason(0)
    setUploadedFiles({ poster: null, thumbnail: null, video: null })
    setUploadedFileSizes({ poster: 0, thumbnail: 0, video: 0 })
    setProgress({ poster: 0, thumbnail: 0, video: 0 })
    setErrors({})
    setSuccess('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSuccess('')
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường được đánh dấu.')
      return
    }

    setSubmitting(true)
    try {
      addMovie(buildPayload())
      setSuccess('Đã thêm phim vào thư viện.')
      toast.success('Đã thêm phim vào thư viện.')
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const targetId = pendingDelete._id
    deleteMovie(targetId)
    setPendingDelete(null)
    toast.success(`Đã xóa phim “${pendingDelete.title}” khỏi thư viện.`)
  }

  const filteredMovies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return movies.filter((movie) => {
      if (genreFilter !== 'Tất cả' && movie.genreName !== genreFilter) return false
      if (!term) return true
      const castText = Array.isArray(movie.cast) ? movie.cast.join(' ') : String(movie.cast || '')
      return (
        String(movie.title || '').toLowerCase().includes(term) ||
        String(movie.genreName || '').toLowerCase().includes(term) ||
        castText.toLowerCase().includes(term)
      )
    })
  }, [movies, searchTerm, genreFilter])

  const libraryGenres = useMemo(() => {
    const set = new Set(GENRE_OPTIONS)
    movies.forEach((movie) => {
      if (movie?.genreName) set.add(movie.genreName)
    })
    return ['Tất cả', ...Array.from(set)]
  }, [movies])

  return (
    <div className="upload-page">
      <div className="container upload-page-inner">
        <header className="upload-page-header">
          <span className="section-eyebrow">Quản trị nội dung</span>
          <h1 className="upload-page-title">Upload Phim Mới</h1>
          <p className="upload-page-subtitle">
            Chọn video, nhập thông tin và thêm phim vào thư viện cá nhân.
          </p>
          <p className="upload-page-note">
            Dữ liệu được lưu cục bộ bằng localStorage và chỉ tồn tại trên trình duyệt hiện tại.
          </p>
        </header>

        {user?.role !== 'admin' && (
          <div className="upload-alert upload-alert-warning">
            <AlertCircle size={18} />
            <span>Bạn cần quyền quản trị để tải tệp lên.</span>
          </div>
        )}

        <div className="upload-layout">
          <form className="upload-form" onSubmit={handleSubmit} noValidate>
            <section className="upload-card">
              <header className="upload-card-header">
                <div>
                  <StepBadge>Bước 1</StepBadge>
                  <h2 className="upload-card-title">Tệp video</h2>
                  <p className="upload-card-desc">
                    Video và thông tin phim sẽ được lưu trên trình duyệt của thiết bị.
                  </p>
                </div>
                <div className="upload-card-icon">
                  <FileVideo size={22} />
                </div>
              </header>

              {episodic ? (
                <div className="content-switch-panel">
                  <SeasonEpisodeEditor
                    activeSeason={activeSeason}
                    defaultEpisodeDuration={form.episodeDuration}
                    errors={errors}
                    onActiveSeasonChange={setActiveSeason}
                    onSeasonsChange={(value) => {
                      setSeasons(value)
                      setErrors((current) => {
                        const retained = Object.fromEntries(
                          Object.entries(current).filter(
                            ([key]) =>
                              key !== 'totalEpisodes' &&
                              !key.startsWith('episode-') &&
                              !key.startsWith('season-'),
                          ),
                        )
                        return retained
                      })
                    }}
                    seasonCount={form.seasonCount}
                    seasons={seasons}
                  />
                </div>
              ) : (
                <>
                  {uploadedFiles.video ? (
                    <div className="upload-file-card upload-file-done">
                      <div className="upload-file-icon-wrap">
                        <Film size={22} color="#a78bfa" />
                      </div>
                      <div className="upload-file-info">
                        <strong>{uploadedFiles.video}</strong>
                        <span>
                          {uploadedFileSizes.video ? `${formatBytes(uploadedFileSizes.video)} · ` : ''}
                          Đã chọn xong
                        </span>
                      </div>
                      <button
                        className="upload-file-action"
                        onClick={() => videoInputRef.current?.click()}
                        type="button"
                      >
                        Thay đổi
                      </button>
                      <button
                        className="upload-remove-btn"
                        onClick={() => removeUpload('video')}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                      <input
                        accept="video/*"
                        onChange={(event) => handleFileSelect('video', event.target.files?.[0])}
                        ref={videoInputRef}
                        style={{ display: 'none' }}
                        type="file"
                      />
                    </div>
                  ) : uploading.video ? (
                    <UploadProgress label="Đang xử lý video..." progress={progress.video} />
                  ) : (
                    <div
                      className={`upload-dropzone upload-dropzone-video${dragOver.video ? ' is-dragover' : ''}`}
                      onClick={() => videoInputRef.current?.click()}
                      onDragLeave={handleDragLeave('video')}
                      onDragOver={handleDragOver('video')}
                      onDrop={handleDrop('video')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="upload-dropzone-icon">
                        <CloudUpload size={36} />
                      </div>
                      <p className="upload-dropzone-title">Kéo và thả file video vào đây</p>
                      <small className="upload-dropzone-subtitle">Hoặc nhấn để chọn file</small>
                      <div className="upload-dropzone-meta">
                        <span className="upload-dropzone-chip">{VIDEO_FORMATS_LABEL}</span>
                        <span className="upload-dropzone-chip">{VIDEO_MAX_LABEL}</span>
                      </div>
                      <input
                        accept="video/*"
                        onChange={(event) => handleFileSelect('video', event.target.files?.[0])}
                        ref={videoInputRef}
                        style={{ display: 'none' }}
                        type="file"
                      />
                    </div>
                  )}

                  <div className="auth-field upload-url-field">
                    <label>Đường dẫn video *</label>
                    <input
                      onChange={(event) => updateForm('videoUrl', event.target.value)}
                      placeholder="https://... hoặc đường dẫn đã lưu trên trình duyệt"
                      value={form.videoUrl}
                    />
                    <span className="field-hint">
                      Chỉ đường dẫn (URL hoặc /uploads/...) được lưu cục bộ, không lưu trực tiếp tệp video.
                    </span>
                    <InlineError>{errors.videoUrl}</InlineError>
                  </div>
                </>
              )}
            </section>

            <section className="upload-card">
              <header className="upload-card-header">
                <div>
                  <StepBadge>Bước 2</StepBadge>
                  <h2 className="upload-card-title">Thông tin phim</h2>
                  <p className="upload-card-desc">
                    Nhập các thông tin cơ bản để phim hiển thị đầy đủ trong thư viện.
                  </p>
                </div>
                <div className="upload-card-icon">
                  <Film size={22} />
                </div>
              </header>

              <div className="upload-grid">
                <div className="auth-field upload-field-full">
                  <label>
                    Tên phim <span className="required-mark">*</span>
                  </label>
                  <input
                    onChange={(event) => updateForm('title', event.target.value)}
                    placeholder="Nhập tên phim..."
                    value={form.title}
                  />
                  <InlineError>{errors.title}</InlineError>
                </div>

                <div className="auth-field upload-field-full">
                  <label>
                    Mô tả <span className="required-mark">*</span>
                  </label>
                  <textarea
                    onChange={(event) => updateForm('description', event.target.value)}
                    placeholder="Mô tả nội dung phim..."
                    rows={5}
                    value={form.description}
                  />
                  <InlineError>{errors.description}</InlineError>
                </div>

                <div className="auth-field">
                  <label>Loại nội dung <span className="required-mark">*</span></label>
                  <select
                    onChange={(event) => updateContentMode('type', event.target.value)}
                    value={form.type}
                  >
                    {CONTENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="auth-field">
                  <label>Thể loại</label>
                  <select
                    onChange={(event) => updateForm('genreName', event.target.value)}
                    value={form.genreName}
                  >
                    {[...new Set([...genres, ...GENRE_OPTIONS])].map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field">
                  <label>Năm phát hành</label>
                  <input
                    max={new Date().getFullYear() + 5}
                    min="1900"
                    onChange={(event) => updateForm('year', event.target.value)}
                    type="number"
                    value={form.year}
                  />
                  <InlineError>{errors.year}</InlineError>
                </div>
                <div className="auth-field">
                  <label>Chất lượng</label>
                  <select
                    onChange={(event) => updateForm('quality', event.target.value)}
                    value={form.quality}
                  >
                    {QUALITY_OPTIONS.map((quality) => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </select>
                </div>

                {form.type === 'documentary' && (
                  <div className="auth-field upload-field-full content-switch-panel">
                    <label>Định dạng phim tài liệu <span className="required-mark">*</span></label>
                    <div className="documentary-format-control">
                      {DOCUMENTARY_FORMAT_OPTIONS.map((option) => (
                        <button
                          className={form.documentaryFormat === option.value ? 'active' : ''}
                          key={option.value}
                          onClick={() => updateContentMode('documentaryFormat', option.value)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="upload-field-full content-switch-panel" key={`${form.type}-${form.documentaryFormat}`}>
                  {!episodic ? (
                    <div className="auth-field">
                      <label>
                        Thời lượng <span className="required-mark">*</span> (phút)
                      </label>
                      <input
                        min="1"
                        onChange={(event) => updateForm('duration', event.target.value)}
                        type="number"
                        value={form.duration}
                      />
                      <span className="field-hint">Thời lượng phải lớn hơn 0 phút.</span>
                      <InlineError>{errors.duration}</InlineError>
                    </div>
                  ) : (
                    <div className="episodic-fields">
                      <div className="upload-grid">
                        <div className="auth-field">
                          <label>Số mùa <span className="required-mark">*</span></label>
                          <input
                            min="1"
                            onChange={(event) => handleSeasonCountChange(event.target.value)}
                            type="number"
                            value={form.seasonCount}
                          />
                          <InlineError>{errors.seasonCount}</InlineError>
                        </div>
                        <div className="auth-field">
                          <label>Tổng số tập <span className="required-mark">*</span></label>
                          <input
                            min="1"
                            onChange={(event) => updateForm('totalEpisodes', event.target.value)}
                            type="number"
                            value={form.totalEpisodes}
                          />
                          <InlineError>{errors.totalEpisodes}</InlineError>
                        </div>
                      </div>
                      <div className="auth-field">
                        <label>Thời lượng mỗi tập (phút)</label>
                        <input
                          min="1"
                          onChange={(event) => updateForm('episodeDuration', event.target.value)}
                          type="number"
                          value={form.episodeDuration}
                        />
                        <InlineError>{errors.episodeDuration}</InlineError>
                      </div>
                    </div>
                  )}
                </div>

                <div className="auth-field upload-field-full">
                  <label>Diễn viên</label>
                  <input
                    onChange={(event) => updateForm('cast', event.target.value)}
                    placeholder="Diễn viên 1, Diễn viên 2..."
                    value={form.cast}
                  />
                  <span className="field-hint">Phân cách các diễn viên bằng dấu phẩy.</span>
                </div>

                <div className="upload-field-full">
                  <ToggleSwitch
                    checked={form.featured}
                    id="featured-toggle"
                    label="Phim nổi bật"
                    onChange={(value) => updateForm('featured', value)}
                  />
                </div>
              </div>
            </section>

            <section className="upload-card">
              <header className="upload-card-header">
                <div>
                  <StepBadge>Bước 3</StepBadge>
                  <h2 className="upload-card-title">Hình ảnh <span className="upload-card-optional">(Không bắt buộc)</span></h2>
                  <p className="upload-card-desc">
                    Poster và thumbnail giúp phim nổi bật hơn. Nếu bỏ trống sẽ dùng ảnh mặc định.
                  </p>
                </div>
                <div className="upload-card-icon">
                  <ImageIcon size={22} />
                </div>
              </header>

              <div className="upload-image-grid">
                {[
                  { kind: 'poster', label: 'Poster', ref: posterInputRef, aspect: '2 / 3' },
                  { kind: 'thumbnail', label: 'Thumbnail', ref: thumbnailInputRef, aspect: '16 / 9' },
                ].map(({ kind, label, ref, aspect }) => {
                  const preview = kind === 'poster' ? form.posterUrl : form.thumbnailUrl
                  const isUploaded = Boolean(uploadedFiles[kind])
                  return (
                    <div className="upload-image-cell" key={kind}>
                      <label className="upload-media-label">{label}</label>

                      {isUploaded ? (
                        <div className="upload-image-preview" style={{ aspectRatio: aspect }}>
                          <img
                            alt={label}
                            onError={(event) => {
                              event.currentTarget.src = DEFAULT_POSTER
                            }}
                            src={resolveMediaUrl(preview)}
                          />
                          <div className="upload-image-preview-overlay">
                            <button
                              className="upload-file-action"
                              onClick={() => ref.current?.click()}
                              type="button"
                            >
                              Thay ảnh
                            </button>
                            <button
                              className="upload-remove-btn upload-remove-btn-strong"
                              onClick={() => removeUpload(kind)}
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : uploading[kind] ? (
                        <UploadProgress
                          label={`Đang xử lý ${label.toLowerCase()}...`}
                          progress={progress[kind]}
                        />
                      ) : (
                        <div
                          className={`upload-image-dropzone${dragOver[kind] ? ' is-dragover' : ''}`}
                          onClick={() => ref.current?.click()}
                          onDragLeave={handleDragLeave(kind)}
                          onDragOver={handleDragOver(kind)}
                          onDrop={handleDrop(kind)}
                          role="button"
                          style={{ aspectRatio: aspect }}
                          tabIndex={0}
                        >
                          <CloudUpload size={28} />
                          <span>Nhấn hoặc kéo thả để chọn {label.toLowerCase()}</span>
                          <small>{IMAGE_FORMATS_LABEL} · {IMAGE_MAX_LABEL}</small>
                          <input
                            accept="image/*"
                            onChange={(event) => handleFileSelect(kind, event.target.files?.[0])}
                            ref={ref}
                            style={{ display: 'none' }}
                            type="file"
                          />
                        </div>
                      )}

                      <div className="auth-field upload-url-field compact">
                        <input
                          onChange={(event) => updateForm(kind === 'poster' ? 'posterUrl' : 'thumbnailUrl', event.target.value)}
                          placeholder={`Đường dẫn ${label.toLowerCase()}`}
                          value={kind === 'poster' ? form.posterUrl : form.thumbnailUrl}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {Object.keys(errors).length > 0 && (
              <div className="upload-alert upload-alert-error">
                <AlertCircle size={18} />
                <span>Vui lòng kiểm tra các trường được đánh dấu trước khi lưu.</span>
              </div>
            )}
            {success && (
              <div className="upload-alert upload-alert-success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <button
              className="upload-submit-button"
              disabled={submitting || user?.role !== 'admin'}
              type="submit"
            >
              {submitting ? (
                <>
                  <Loader2 className="spin" size={18} />
                  Đang thêm phim...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Thêm vào thư viện
                </>
              )}
            </button>
          </form>

          <aside className="upload-sidebar">
            <div className="upload-library-card">
              <header className="upload-library-header">
                <div>
                  <span className="section-eyebrow">Thư viện cá nhân</span>
                  <h2 className="upload-library-title">
                    Thư viện phim
                    <span className="upload-library-badge">{movies.length} phim</span>
                  </h2>
                </div>
                <Upload size={20} color="#c4b5fd" />
              </header>

              <div className="upload-library-controls">
                <div className="upload-library-search">
                  <Search size={16} />
                  <input
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm theo tên, thể loại, diễn viên..."
                    value={searchTerm}
                  />
                </div>
                <select
                  className="upload-library-genre-filter"
                  onChange={(event) => setGenreFilter(event.target.value)}
                  value={genreFilter}
                >
                  {libraryGenres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="upload-library-list">
                {filteredMovies.map((movie) => (
                  <article className="upload-library-item" key={movie._id}>
                    <img
                      alt={movie.title}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_POSTER
                      }}
                      src={resolveMediaUrl(movie.posterUrl || movie.thumbnailUrl)}
                    />
                    <div className="upload-library-item-info">
                      <span className="content-type-mini-badge">{getContentBadge(movie)}</span>
                      <strong>{movie.title}</strong>
                      <div className="upload-library-item-meta">
                        <span>
                          <Film size={12} />
                          {movie.genreName || 'Khác'}
                        </span>
                        <span>
                          <Calendar size={12} />
                          {movie.year || '—'}
                        </span>
                        <span>{getContentSummary(movie)}</span>
                        {movie.quality && <span className="upload-library-quality">{movie.quality}</span>}
                      </div>
                    </div>
                    <button
                      className="upload-library-delete"
                      onClick={() => setPendingDelete(movie)}
                      title="Xóa phim"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}

                {!filteredMovies.length && (
                  <div className="upload-library-empty">
                    <Star size={24} />
                    <strong>
                      {movies.length
                        ? 'Không tìm thấy phim phù hợp với bộ lọc.'
                        : 'Chưa có phim nào trong thư viện.'}
                    </strong>
                    <span>
                      Hãy thêm phim đầu tiên của bạn bằng cách điền form bên trái.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {pendingDelete && (
        <DeleteConfirmDialog
          movie={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}