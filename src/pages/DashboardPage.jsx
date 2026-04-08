import { useMemo } from 'react'
import PityCard from '../components/PityCard.jsx'
import { computeBannerStats, computeGlobalStats } from '../core/stats.js'
import { BANNER_TYPES } from '../core/bannerTypes.js'
import { formatRelative } from '../utils/format.js'

export default function DashboardPage({ store }) {
  const { wishes, lastSync } = store

  const bannerStats = useMemo(() => {
    const result = {}
    for (const cfg of Object.values(BANNER_TYPES)) {
      result[cfg.key] = computeBannerStats(wishes[cfg.key] || [], cfg.key)
    }
    return result
  }, [wishes])

  const global = useMemo(() => computeGlobalStats(wishes), [wishes])

  // Memoized recent 5★ list — fixes inline IIFE recalculation bug
  const recent5Stars = useMemo(() => {
    return Object.entries(wishes)
      .flatMap(([bk, list]) =>
        (list || []).filter(w => Number(w.rank_type) === 5).map(w => ({ ...w, _bannerKey: bk }))
      )
      .sort((a, b) => a.id > b.id ? -1 : 1)
      .slice(0, 6)
  }, [wishes])

  const hasData = global.total > 0

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div>
        <p className="label-xs mb-2">Overview</p>
        <div className="flex items-end justify-between flex-wrap gap-2">
          <h1 className="font-display text-3xl font-bold text-white/90">
            Wish Dashboard
          </h1>
          {lastSync && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Synced {formatRelative(lastSync)}
            </p>
          )}
        </div>
      </div>

      {/* Global stats row */}
      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Wishes', value: global.total.toLocaleString() },
            { label: '5★ Obtained',  value: global.fiveStarCount,   gold: true },
            { label: '5★ Rate',      value: `${global.fiveStarRate}%` },
            { label: '4★ Rate',      value: `${global.fourStarRate}%`, purple: true },
          ].map(({ label, value, gold, purple }) => (
            <div key={label} className="stat-card animate-slide-up">
              <p className="label-xs">{label}</p>
              <p className={`font-display font-bold text-2xl mt-1 ${gold ? 'text-gold-shimmer' : purple ? 'text-violet-300' : 'text-white/90'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="glass p-12 text-center space-y-3">
          <p className="text-4xl">✦</p>
          <h2 className="font-display text-xl font-semibold text-white/70">No Data Yet</h2>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Import your wish history from the game to start tracking pity and stats.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Go to the <strong>Import</strong> page to get started.
          </p>
        </div>
      )}

      {/* Pity cards */}
      {hasData && (
        <div>
          <p className="label-xs mb-3">Pity Counters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(BANNER_TYPES).map((cfg, i) => (
              <div key={cfg.key} style={{ animationDelay: `${i * 0.07}s` }}>
                <PityCard bannerKey={cfg.key} stats={bannerStats[cfg.key]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent 5★ */}
      {hasData && recent5Stars.length > 0 && (
        <div>
          <p className="label-xs mb-3">Recent 5★ Pulls</p>
          <div className="glass overflow-hidden">
            {recent5Stars.map((w, i) => {
              const cfg = BANNER_TYPES[w.gacha_type] || {}
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-4 px-5 py-3 border-b last:border-0 transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-lg">⭐</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm r5 truncate">{w.name || '5★'}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {cfg.shortLabel || ''} · pity {w.pity ?? '?'}
                      {w.won5050 === 'loss' && <span className="ml-2 text-rose-400">Lost 50/50</span>}
                      {w.won5050 === 'win' && <span className="ml-2 text-emerald-400">Won 50/50</span>}
                      {w.won5050 === 'guaranteed' && <span className="ml-2 text-amber-300">Guaranteed</span>}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {w.time?.slice(0, 10) || '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
