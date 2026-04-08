import { useState, useMemo, useEffect } from 'react'
import { rarityBadgeClass } from '../utils/format.js'
import { paginate, sortNewestFirst } from '../utils/group.js'
import { getBannerByKey } from '../core/bannerTypes.js'

const PAGE_SIZE = 30

export default function WishTable({ wishes, bannerKey }) {
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever the wish list changes (filter change)
  useEffect(() => {
    setPage(1)
  }, [wishes])

  // Memoize sort — avoids re-sorting on every render
  const sorted = useMemo(() => sortNewestFirst(wishes), [wishes])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageData = paginate(sorted, page, PAGE_SIZE)
  const cfg = getBannerByKey(bannerKey)

  if (sorted.length === 0) {
    return (
      <div className="glass p-10 text-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-3xl mb-3">✦</p>
        <p className="text-sm">No wishes match the current filters.</p>
        <p className="text-xs mt-1 opacity-60">Try removing some filters, or import wish history on the Import page.</p>
      </div>
    )
  }

  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_4rem] gap-2 px-4 py-2.5 border-b text-[11px] font-semibold tracking-wide uppercase"
           style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <span>#</span>
        <span>Item</span>
        <span>Type</span>
        <span className="text-center">Rarity</span>
        <span className="text-center">Pity</span>
        <span className="text-right">Date</span>
      </div>

      {/* Rows */}
      <div className="max-h-[480px] overflow-y-auto">
        {pageData.map((wish, idx) => {
          const rank = Number(wish.rank_type)
          return (
            <div
              key={wish.id}
              className="wish-table-row grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_4rem] gap-2 px-4 text-sm"
              style={{ animationDelay: `${idx * 0.015}s` }}
            >
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {sorted.length - ((page - 1) * PAGE_SIZE + idx)}
              </span>
              <span className={`font-medium truncate ${rank === 5 ? 'r5' : rank === 4 ? 'r4' : ''}`}>
                {wish.name || '—'}
              </span>
              <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                {wish.item_type || '—'}
              </span>
              <span className="text-center">
                <span className={rarityBadgeClass(wish.rank_type)}>{wish.rank_type}★</span>
              </span>
              <span className={`text-center text-sm font-mono ${
                wish.pity >= (cfg?.softPity || 74) ? 'r5 font-bold' : wish.pity ? 'text-white/60' : ''
              }`}>
                {wish.pity ?? '—'}
              </span>
              <span className="text-right text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {wish.time ? wish.time.slice(0, 10) : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t"
             style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages} · {sorted.length.toLocaleString()} total
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            >← Prev</button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}
