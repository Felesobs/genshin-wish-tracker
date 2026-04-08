import { BANNER_TYPES } from '../core/bannerTypes.js'

const ALL_OPTION = { key: 'all', label: 'All Banners', shortLabel: 'All', color: '#9b87f5' }

export default function BannerTabs({ active, onChange, showAll = false, wishCounts = {} }) {
  const tabs = showAll
    ? [ALL_OPTION, ...Object.values(BANNER_TYPES)]
    : Object.values(BANNER_TYPES)

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(tab => {
        const isActive = active === tab.key
        const count = wishCounts[tab.key]
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200 active:scale-95 border
                        ${isActive ? 'nav-tab-active' : 'btn-ghost'}`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: tab.color, boxShadow: isActive ? `0 0 6px ${tab.color}` : 'none' }}
            />
            <span>{tab.shortLabel}</span>
            {count !== undefined && (
              <span className="text-[10px] opacity-60 ml-0.5">({count})</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
