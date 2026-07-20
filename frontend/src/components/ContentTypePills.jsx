import { Clapperboard, Film, Layers3, MonitorPlay, Sparkles } from 'lucide-react'
import { CONTENT_TYPE_OPTIONS } from '../utils/movieContent'

const icons = {
  movie: Film,
  series: Layers3,
  tv_show: MonitorPlay,
  anime: Sparkles,
  documentary: Clapperboard,
}

const options = [
  { value: 'all', label: 'Tất cả', icon: Film },
  ...CONTENT_TYPE_OPTIONS.map((option) => ({
    ...option,
    label: option.filterLabel || option.label,
    icon: icons[option.value],
  })),
]

export default function ContentTypePills({ active, onChange }) {
  return (
    <div className="content-type-filters" role="tablist" aria-label="Lọc theo loại nội dung">
      {options.map(({ icon: Icon, label, value }) => {
        const isActive = active === value
        return (
          <button
            aria-selected={isActive}
            className={`content-type-filter ${isActive ? 'active' : ''}`}
            key={value}
            onClick={() => onChange(value)}
            role="tab"
            type="button"
          >
            <Icon size={15} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
