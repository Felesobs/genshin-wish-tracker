import { useState, useMemo, useEffect } from 'react'
import BannerTabs from '../components/BannerTabs.jsx'
import WishTable from '../components/WishTable.jsx'
import { BANNER_TYPES } from '../core/bannerTypes.js'

const RARITY_OPTS = [
  { value: 'all', label: 'All ★' },
  { value: '5',   label: '5★' },
  { value: '4',   label: '4★' },
  { value: '3',   label: '3★' },
]

const TYPE_OPTS = [
  { value: 'all',       label: 'All Types' },
  { value: 'character', label: 'Character' },
  { value: 'weapon',    label: 'Weapon' },
]

export default function HistoryPage({ store }) {
  const { wishes } = store
  const [activeBanner, setActiveBanner] = useState('character1')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Reset filters when banner changes
  const handleBannerChange = (banner) => {
    setActiveBanner(banner)
    setRarityFilter('all')
    setTypeFilter('all')
    setSearch('')
  }

  const wishCounts = useMemo(() => {
    const c = {}
    for (const cfg of Object.values(BANNER_TYPES)) {
      c[cfg.key] = (wishes[cfg.key] || []).length
    }
    return c
  }, [wishes])

  const filtered = useMemo(() => {
    let list = wishes[activeBanner] || []
    if (rarityFilter !== 'all') list = list.filter(w => w.rank_type === rarityFilter)
    if (typeFilter !== 'all') {
      list = list.filter(w => (w.item_type || '').toLowerCase().includes(typeFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(w => (w.name || '').toLowerCase().includes(q))
    }
    return list
  }, [wishes, activeBanner, rarityFilter, typeFilter, search])

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <p className="label-xs mb-2">Records</p>
        <h1 className="font-display text-3xl font-bold text-white/90">Wish History</h1>
      </div>

      <BannerTabs active={activeBanner} onChange={handleBannerChange} wishCounts={wishCounts} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input-field pl-9 py-2 text-sm w-44"
            placeholder="Search name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5">
          {RARITY_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRarityFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                rarityFilter === opt.value ? 'nav-tab-active' : 'btn-ghost'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {TYPE_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                typeFilter === opt.value ? 'nav-tab-active' : 'btn-ghost'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filtered.length.toLocaleString()} wish{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <WishTable wishes={filtered} bannerKey={activeBanner} />
    </div>
  )
}
