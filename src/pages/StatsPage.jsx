import { useState, useMemo } from 'react'
import { PityHistogram, BannerDistribution, DailyPullsChart } from '../components/StatChart.jsx'
import BannerTabs from '../components/BannerTabs.jsx'
import { computeBannerStats, computeBannerDistribution, computeDailyPulls } from '../core/stats.js'
import { BANNER_TYPES, getBannerByKey } from '../core/bannerTypes.js'

export default function StatsPage({ store }) {
  const { wishes } = store
  const [activeBanner, setActiveBanner] = useState('character1')

  // Only compute stats for the active banner (lazy per-tab)
  const s = useMemo(
    () => computeBannerStats(wishes[activeBanner] || [], activeBanner),
    [wishes, activeBanner]
  )

  const cfg = getBannerByKey(activeBanner)

  const distribution = useMemo(() => computeBannerDistribution(wishes), [wishes])
  const dailyData    = useMemo(() => computeDailyPulls(wishes), [wishes])

  const hasData = s.total > 0

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <p className="label-xs mb-2">Analytics</p>
        <h1 className="font-display text-3xl font-bold text-white/90">Statistics</h1>
      </div>

      <BannerTabs active={activeBanner} onChange={setActiveBanner} />

      {!hasData && (
        <div className="glass p-12 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">No data for this banner yet.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Pulls',    value: s.total.toLocaleString() },
              { label: '5★ Count',       value: s.fiveStarCount,   gold: true },
              { label: 'Avg 5★ Pity',   value: s.avgPity5 ?? '—', sub: 'pulls' },
              { label: 'Min / Max Pity', value: s.minPity5 && s.maxPity5 ? `${s.minPity5} / ${s.maxPity5}` : '—' },
            ].map(({ label, value, gold, sub }) => (
              <div key={label} className="stat-card">
                <p className="label-xs">{label}</p>
                <p className={`font-display font-bold text-xl mt-1 ${gold ? 'r5' : 'text-white/90'}`}>
                  {value}
                  {sub && <span className="text-xs text-white/30 font-body font-normal ml-1">{sub}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '5★ Pull Rate', value: `${s.fiveStarRate}%`, color: 'var(--gold)' },
              { label: '4★ Pull Rate', value: `${s.fourStarRate}%`, color: 'var(--purple)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-card">
                <p className="label-xs">{label}</p>
                <p className="font-display font-bold text-2xl mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Luck score */}
          {s.luckScore !== null && (
            <div className="glass p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="label-xs">Luck Score</p>
                <span className="font-display font-bold text-2xl text-white/90">
                  {s.luckScore}
                  <span className="text-sm text-white/30 font-body font-normal ml-1">/ 100</span>
                </span>
              </div>
              <div className="pity-bar-track">
                <div
                  className="pity-bar-fill"
                  style={{
                    width: `${s.luckScore}%`,
                    background: s.luckScore >= 70 ? 'linear-gradient(90deg,#059669,#34d399)' :
                                s.luckScore >= 40 ? 'linear-gradient(90deg,#d97706,#fde68a)' :
                                                    'linear-gradient(90deg,#e11d48,#fb7185)',
                  }}
                />
              </div>
              <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {s.luckScore >= 70 ? '🍀 Very lucky!' : s.luckScore >= 40 ? '😐 Average luck' : '😢 Below average luck'}
              </p>
            </div>
          )}

          {/* Pity histogram */}
          <div className="glass p-5">
            <p className="label-xs mb-4">5★ Pity Distribution</p>
            <PityHistogram histogram={s.histogram} softPity={s.softPity} hardPity={s.hardPity} />
          </div>

          {/* All 5★ list */}
          {s.fiveStars.length > 0 && (
            <div className="glass overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="label-xs">All 5★ — {cfg?.label}</p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {[...s.fiveStars].reverse().map(w => (
                  <div key={w.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <span className="r5 font-medium text-sm">{w.name || '5★'}</span>
                      <span className="text-[11px] ml-2 capitalize" style={{ color: 'var(--text-muted)' }}>{w.item_type}</span>
                      {w.won5050 === 'win' && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>Won 50/50</span>
                      )}
                      {w.won5050 === 'loss' && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(244,63,94,0.08)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}>Lost 50/50</span>
                      )}
                      {w.won5050 === 'guaranteed' && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.2)' }}>Guaranteed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>pity {w.pity}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{w.time?.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Global charts — always shown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass p-5">
          <p className="label-xs mb-4">Banner Distribution</p>
          <BannerDistribution distribution={distribution} />
        </div>
        <div className="glass p-5">
          <p className="label-xs mb-4">Daily Pulls (last 60 days)</p>
          <DailyPullsChart dailyData={dailyData} />
        </div>
      </div>
    </div>
  )
}
