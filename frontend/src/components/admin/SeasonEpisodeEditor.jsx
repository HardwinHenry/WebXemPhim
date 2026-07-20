import {
  CheckCircle2,
  Edit3,
  Film,
  Image,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { uploadThumbnailRequest, uploadVideoRequest } from '../../services/uploadService'
import { createContentId } from '../../utils/movieContent'

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function InlineError({ children }) {
  return children ? <span className="field-error">{children}</span> : null
}

function EpisodeCard({
  episode,
  errorFor,
  isDuplicate,
  isEditing,
  onDelete,
  onEdit,
  onFinishEditing,
  onUpdate,
}) {
  const [uploading, setUploading] = useState({ video: false, thumbnail: false })
  const [progress, setProgress] = useState({ video: 0, thumbnail: 0 })

  const uploadEpisodeFile = async (kind, file) => {
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
    try {
      const formData = new FormData()
      formData.append(isVideo ? 'video' : 'thumbnail', file)
      const request = isVideo ? uploadVideoRequest : uploadThumbnailRequest
      const { data } = await request(formData, (value) =>
        setProgress((current) => ({ ...current, [kind]: value })),
      )
      onUpdate({ [kind]: isVideo ? data.videoUrl : data.thumbnailUrl })
      toast.success(isVideo ? 'Đã tải video tập phim.' : 'Đã tải thumbnail tập phim.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải tệp lên.')
    } finally {
      setUploading((current) => ({ ...current, [kind]: false }))
    }
  }

  if (!isEditing) {
    return (
      <article className="episode-card episode-card-summary">
        <div className="episode-summary-number">Tập {episode.episodeNumber || '—'}</div>
        <div className="episode-summary-info">
          <strong>{episode.title?.trim() || `Tập ${episode.episodeNumber || ''}`}</strong>
          <span>
            {episode.duration ? `${episode.duration} phút` : 'Chưa có thời lượng'}
            {episode.video ? ' · Đã có video' : ' · Chưa có video'}
          </span>
        </div>
        <div className="episode-actions">
          <button className="btn-ghost episode-action-btn" onClick={onEdit} type="button">
            <Edit3 size={15} />
            Chỉnh sửa
          </button>
          <button className="btn-danger-ghost episode-action-btn" onClick={onDelete} type="button">
            <Trash2 size={15} />
            Xóa tập
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="episode-card episode-card-editing">
      <div className="episode-card-heading">
        <div>
          <span className="section-eyebrow">Tập phim</span>
          <h3>Tập {episode.episodeNumber || 'mới'}</h3>
        </div>
        <div className="episode-actions">
          <button className="btn-ghost episode-action-btn" onClick={onFinishEditing} type="button">
            <Save size={15} />
            Xong
          </button>
          <button className="btn-danger-ghost episode-action-btn" onClick={onDelete} type="button">
            <Trash2 size={15} />
            Xóa tập
          </button>
        </div>
      </div>

      <div className="upload-form-row">
        <div className="auth-field">
          <label>Số tập *</label>
          <input
            min="1"
            onChange={(event) => onUpdate({ episodeNumber: event.target.value })}
            type="number"
            value={episode.episodeNumber}
          />
          <InlineError>{isDuplicate ? 'Số tập đã tồn tại trong mùa này.' : errorFor('episodeNumber')}</InlineError>
        </div>
        <div className="auth-field">
          <label>Tên tập</label>
          <input
            onChange={(event) => onUpdate({ title: event.target.value })}
            placeholder={`Tập ${episode.episodeNumber || ''}`}
            value={episode.title}
          />
          <InlineError>{errorFor('title')}</InlineError>
        </div>
      </div>

      <div className="upload-form-row">
        <div className="auth-field">
          <label>Video tập phim *</label>
          <div className="episode-media-input">
            <input
              onChange={(event) => onUpdate({ video: event.target.value })}
              placeholder="Dán đường dẫn video hoặc tải tệp lên"
              value={episode.video}
            />
            <label className={`episode-upload-button ${uploading.video ? 'disabled' : ''}`}>
              {uploading.video ? <Loader2 className="spin" size={15} /> : <Upload size={15} />}
              {uploading.video ? `${progress.video}%` : 'Chọn tệp'}
              <input
                accept="video/*"
                disabled={uploading.video}
                onChange={(event) => uploadEpisodeFile('video', event.target.files?.[0])}
                type="file"
              />
            </label>
          </div>
          {episode.video && (
            <span className="field-success"><CheckCircle2 size={13} /> Đã có đường dẫn video</span>
          )}
          <InlineError>{errorFor('video')}</InlineError>
        </div>
        <div className="auth-field">
          <label>Thời lượng mỗi tập (phút)</label>
          <input
            min="1"
            onChange={(event) => onUpdate({ duration: event.target.value })}
            placeholder="45"
            type="number"
            value={episode.duration}
          />
          <InlineError>{errorFor('duration')}</InlineError>
        </div>
      </div>

      <div className="auth-field">
        <label>Thumbnail của tập</label>
        <div className="episode-media-input">
          <input
            onChange={(event) => onUpdate({ thumbnail: event.target.value })}
            placeholder="Dán đường dẫn ảnh hoặc tải tệp lên"
            value={episode.thumbnail}
          />
          <label className={`episode-upload-button ${uploading.thumbnail ? 'disabled' : ''}`}>
            {uploading.thumbnail ? <Loader2 className="spin" size={15} /> : <Image size={15} />}
            {uploading.thumbnail ? `${progress.thumbnail}%` : 'Chọn ảnh'}
            <input
              accept="image/*"
              disabled={uploading.thumbnail}
              onChange={(event) => uploadEpisodeFile('thumbnail', event.target.files?.[0])}
              type="file"
            />
          </label>
        </div>
      </div>

      <div className="auth-field">
        <label>Mô tả ngắn</label>
        <textarea
          onChange={(event) => onUpdate({ description: event.target.value })}
          placeholder="Tóm tắt nội dung tập phim..."
          rows={3}
          value={episode.description}
        />
      </div>
    </article>
  )
}

export default function SeasonEpisodeEditor({
  activeSeason,
  defaultEpisodeDuration,
  errors,
  onActiveSeasonChange,
  onSeasonsChange,
  seasonCount,
  seasons,
}) {
  const [editingEpisodeId, setEditingEpisodeId] = useState(null)
  const visibleSeasons = seasons.slice(0, Math.max(1, Number(seasonCount) || 1))
  const selectedSeasonIndex = Math.min(Math.max(activeSeason, 0), visibleSeasons.length - 1)
  const selectedSeason = visibleSeasons[selectedSeasonIndex] || visibleSeasons[0]

  const duplicateNumbers = useMemo(() => {
    const counts = new Map()
    selectedSeason?.episodes?.forEach((episode) => {
      const value = Number(episode.episodeNumber)
      if (Number.isInteger(value) && value > 0) counts.set(value, (counts.get(value) || 0) + 1)
    })
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([number]) => number))
  }, [selectedSeason])

  const updateSeasonEpisodes = (episodes) => {
    onSeasonsChange(
      seasons.map((season, index) =>
        index === selectedSeasonIndex ? { ...season, episodes } : season,
      ),
    )
  }

  const addEpisode = () => {
    const episodes = selectedSeason?.episodes || []
    const highestNumber = episodes.reduce(
      (highest, episode) => Math.max(highest, Number(episode.episodeNumber) || 0),
      0,
    )
    const id = createContentId('episode')
    updateSeasonEpisodes([
      ...episodes,
      {
        id,
        episodeNumber: highestNumber + 1,
        title: '',
        duration: defaultEpisodeDuration || '',
        video: '',
        thumbnail: '',
        description: '',
      },
    ])
    setEditingEpisodeId(id)
  }

  const updateEpisode = (episodeId, patch) => {
    updateSeasonEpisodes(
      (selectedSeason?.episodes || []).map((episode) =>
        episode.id === episodeId ? { ...episode, ...patch } : episode,
      ),
    )
  }

  const deleteEpisode = (episodeId) => {
    updateSeasonEpisodes((selectedSeason?.episodes || []).filter((episode) => episode.id !== episodeId))
    if (editingEpisodeId === episodeId) setEditingEpisodeId(null)
  }

  const errorFor = (episodeId, field) =>
    errors?.[`episode-${selectedSeason?.seasonNumber}-${episodeId}-${field}`]

  return (
    <div className="season-episode-editor">
      <div className="season-editor-toolbar">
        <div>
          <span className="section-eyebrow">Quản lý tập phim</span>
          <h3 className="season-editor-title">Danh sách tập phim</h3>
        </div>
        <button className="btn-primary episode-add-button" onClick={addEpisode} type="button">
          <Plus size={17} />
          Thêm tập
        </button>
      </div>

      {visibleSeasons.length > 1 && (
        <div className="season-tabs" aria-label="Chọn mùa">
          {visibleSeasons.map((season, index) => (
            <button
              className={`season-tab ${selectedSeasonIndex === index ? 'active' : ''}`}
              key={season.seasonNumber}
              onClick={() => {
                onActiveSeasonChange(index)
                setEditingEpisodeId(null)
              }}
              type="button"
            >
              Mùa {season.seasonNumber}
              <span>{season.episodes?.length || 0} tập</span>
            </button>
          ))}
        </div>
      )}

      <InlineError>{errors?.[`season-${selectedSeason?.seasonNumber}`]}</InlineError>

      <div className="episode-list content-switch-panel">
        {(selectedSeason?.episodes || []).map((episode) => (
          <EpisodeCard
            episode={episode}
            errorFor={(field) => errorFor(episode.id, field)}
            isDuplicate={duplicateNumbers.has(Number(episode.episodeNumber))}
            isEditing={editingEpisodeId === episode.id}
            key={episode.id}
            onDelete={() => deleteEpisode(episode.id)}
            onEdit={() => setEditingEpisodeId(episode.id)}
            onFinishEditing={() => setEditingEpisodeId(null)}
            onUpdate={(patch) => updateEpisode(episode.id, patch)}
          />
        ))}
        {!selectedSeason?.episodes?.length && (
          <button className="episode-empty-state" onClick={addEpisode} type="button">
            <Film size={28} />
            <strong>Mùa này chưa có tập phim</strong>
            <span>Nhấn để thêm tập đầu tiên.</span>
          </button>
        )}
      </div>
    </div>
  )
}
