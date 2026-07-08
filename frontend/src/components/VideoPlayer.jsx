import {
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Subtitles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function formatTime(s) {
  if (!Number.isFinite(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`
}

export default function VideoPlayer({ movie, autoplay = false, subtitles = [] }) {
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const hideTimer = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showPoster, setShowPoster] = useState(true)
  const [hideControls, setHideControls] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [videoError, setVideoError] = useState(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const [activeSubtitle, setActiveSubtitle] = useState(null)
  const [qualities, setQualities] = useState([])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
    v.playbackRate = speed
  }, [volume, muted, speed])

  useEffect(() => {
    if (movie?.cast && Array.isArray(movie.cast)) {
      // Cast is available from movie prop
    }
  }, [movie])

  const startHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (playing) setHideControls(true)
    }, 2500)
  }

  const handleMouseMove = () => {
    setHideControls(false)
    if (playing) startHideTimer()
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => setVideoError('Cannot play video'))
      setPlaying(true)
      setShowPoster(false)
      startHideTimer()
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const onTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    setDuration(v.duration || 0)
    setProgress((v.currentTime / (v.duration || 1)) * 100)
  }

  const seek = (e) => {
    const v = videoRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (v && v.duration) v.currentTime = pct * v.duration
  }

  const toggleFullscreen = () => {
    const el = wrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const handleError = () => {
    const v = videoRef.current
    if (!v) return
    const err = v.error
    if (err) {
      switch (err.code) {
        case 1: setVideoError('Video loading aborted')
          break
        case 2: setVideoError('Network error while loading video')
          break
        case 3: setVideoError('Video decoding failed')
          break
        case 4: setVideoError('Video format not supported')
          break
        default: setVideoError('Video playback error')
      }
    }
    setPlaying(false)
  }

  const handleWaiting = () => setIsBuffering(true)
  const handleCanPlay = () => setIsBuffering(false)
  const handlePlaying = () => { setIsBuffering(false); setPlaying(true) }

  const retryLoad = () => {
    const v = videoRef.current
    if (!v) return
    setVideoError(null)
    v.load()
  }

  const poster = movie?.posterUrl
  const videoSrc = movie?.videoUrl

  return (
    <div
      ref={wrapRef}
      className={`video-player ${hideControls ? 'hide-controls' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setHideControls(true)}
    >
      <video
        ref={videoRef}
        poster={poster}
        preload="metadata"
        src={videoSrc}
        crossOrigin="anonymous"
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); startHideTimer() }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={() => setPlaying(false)}
        onError={handleError}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
      />

      {isBuffering && (
        <div className="video-loading-overlay">
          <div className="video-spinner" />
        </div>
      )}

      {videoError && (
        <div className="video-error-overlay">
          <div className="video-error-content">
            <p className="video-error-msg">{videoError}</p>
            <button className="video-retry-btn" onClick={retryLoad} type="button">
              <RefreshCw size={16} />
              Thử lại
            </button>
          </div>
        </div>
      )}

      {showPoster && !videoError && (
        <div
          className="video-poster"
          onClick={togglePlay}
          style={{ backgroundImage: poster ? `url(${poster})` : undefined }}
        >
          <div className="video-poster-play">
            <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />
          </div>
        </div>
      )}

      <div className="video-controls">
        <div className="video-progress" onClick={seek}>
          <div className="video-progress-fill" style={{ width: `${progress}%` }} />
          <div className="video-progress-thumb" style={{ left: `${progress}%` }} />
        </div>

        <div className="video-bottom">
          <div className="video-controls-left">
            <button
              className="video-control-btn play-btn"
              onClick={togglePlay}
              type="button"
              aria-label={playing ? 'Tạm dừng' : 'Phát'}
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <div className="video-volume">
              <button
                className="video-control-btn"
                onClick={() => setMuted((m) => !m)}
                type="button"
                aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                className="video-volume-slider"
                max="1"
                min="0"
                step="0.05"
                type="range"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  setMuted(false)
                }}
                aria-label="Âm lượng"
              />
            </div>

            <span className="video-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="video-controls-right">
            <div className="video-speed-menu">
              <button
                className="video-control-btn video-speed-btn"
                onClick={() => setOpenMenu(openMenu === 'speed' ? null : 'speed')}
                type="button"
                title="Tốc độ phát"
              >
                {speed === 1 ? '1x' : `${speed}x`}
              </button>
              {openMenu === 'speed' && (
                <div className="video-menu">
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      className={speed === s ? 'active' : ''}
                      key={s}
                      onClick={() => {
                        setSpeed(s)
                        setOpenMenu(null)
                      }}
                      type="button"
                    >
                      {s === 1 ? 'Bình thường' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {subtitles.length > 0 && (
              <div className="video-speed-menu">
                <button
                  className="video-control-btn video-speed-btn"
                  onClick={() => setOpenMenu(openMenu === 'sub' ? null : 'sub')}
                  type="button"
                  title="Phụ đề"
                >
                  <Subtitles size={16} />
                </button>
                {openMenu === 'sub' && (
                  <div className="video-menu">
                    <button
                      className={activeSubtitle === null ? 'active' : ''}
                      onClick={() => { setActiveSubtitle(null); setOpenMenu(null) }}
                      type="button"
                    >
                      Off
                    </button>
                    {subtitles.map((sub) => (
                      <button
                        className={activeSubtitle === sub.lang ? 'active' : ''}
                        key={sub.lang}
                        onClick={() => {
                          setActiveSubtitle(sub.lang)
                          setOpenMenu(null)
                        }}
                        type="button"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="video-control-btn" type="button" title="Cài đặt">
              <Settings size={18} />
            </button>

            <button
              className="video-control-btn"
              onClick={toggleFullscreen}
              type="button"
              title="Toàn màn hình"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
