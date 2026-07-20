export const CONTENT_TYPE_OPTIONS = [
  { value: 'movie', label: 'Phim lẻ', badge: 'PHIM LẺ' },
  { value: 'series', label: 'Phim bộ', badge: 'PHIM BỘ' },
  { value: 'tv_show', label: 'Chương trình truyền hình', filterLabel: 'TV Show', badge: 'TV SHOW' },
  { value: 'anime', label: 'Anime', badge: 'ANIME' },
  { value: 'documentary', label: 'Phim tài liệu', badge: 'TÀI LIỆU' },
]

export const DOCUMENTARY_FORMAT_OPTIONS = [
  { value: 'single', label: 'Phim tài liệu lẻ' },
  { value: 'series', label: 'Series tài liệu' },
]

const CONTENT_TYPES = new Set(CONTENT_TYPE_OPTIONS.map((option) => option.value))
const EPISODIC_TYPES = new Set(['series', 'tv_show', 'anime'])

export function getMovieType(movie) {
  return CONTENT_TYPES.has(movie?.type) ? movie.type : 'movie'
}

export function getContentTypeOption(typeOrMovie) {
  const type = typeof typeOrMovie === 'string' ? typeOrMovie : getMovieType(typeOrMovie)
  return CONTENT_TYPE_OPTIONS.find((option) => option.value === type) || CONTENT_TYPE_OPTIONS[0]
}

export function isEpisodicContent(typeOrMovie, documentaryFormat) {
  if (typeof typeOrMovie === 'object' && typeOrMovie !== null) {
    const type = getMovieType(typeOrMovie)
    return EPISODIC_TYPES.has(type) || (type === 'documentary' && typeOrMovie.documentaryFormat === 'series')
  }

  return EPISODIC_TYPES.has(typeOrMovie) || (typeOrMovie === 'documentary' && documentaryFormat === 'series')
}

export function getContentBadge(movie) {
  return getContentTypeOption(movie).badge
}

function asPositiveInteger(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : 0
}

export function getContentStats(movie) {
  if (!isEpisodicContent(movie)) {
    return {
      duration: asPositiveInteger(movie?.duration),
      seasonCount: 0,
      totalEpisodes: 0,
    }
  }

  const seasons = Array.isArray(movie?.seasons) ? movie.seasons : []
  const seasonsWithEpisodes = seasons.filter((season) => Array.isArray(season?.episodes))
  const actualEpisodes = seasonsWithEpisodes.reduce((total, season) => total + season.episodes.length, 0)

  return {
    duration: 0,
    seasonCount: seasons.length || asPositiveInteger(movie?.seasonCount) || 1,
    totalEpisodes: actualEpisodes || asPositiveInteger(movie?.totalEpisodes),
  }
}

export function getContentSummary(movie) {
  const stats = getContentStats(movie)
  if (isEpisodicContent(movie)) {
    return `${stats.seasonCount} mùa · ${stats.totalEpisodes} tập`
  }
  return `${stats.duration || 0} phút`
}

export function createContentId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
