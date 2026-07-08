import {
  Drama,
  Film,
  Flame,
  Ghost,
  Heart,
  Rocket,
  Swords,
  Wand2,
} from 'lucide-react'

const iconMap = {
  'Sci-Fi': Rocket,
  'Hành động': Swords,
  Action: Swords,
  'Kinh dị': Ghost,
  Horror: Ghost,
  'Tình cảm': Heart,
  Romance: Heart,
  'Hoạt hình': Wand2,
  Animation: Wand2,
  Drama: Drama,
  Mystery: Flame,
  default: Film,
}

export default function GenrePills({ genres, active, onChange }) {
  return (
    <div className="genre-pills" role="tablist">
      {genres.map((g) => {
        const Icon = iconMap[g] || iconMap.default
        const isActive = active === g
        return (
          <button
            className={`genre-pill ${isActive ? 'active' : ''}`}
            key={g}
            onClick={() => onChange(g)}
            role="tab"
            aria-selected={isActive}
            type="button"
          >
            <Icon size={14} />
            <span>{g}</span>
          </button>
        )
      })}
    </div>
  )
}
