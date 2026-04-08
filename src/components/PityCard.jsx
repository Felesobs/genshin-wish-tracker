import { getBannerByKey } from '../core/bannerTypes.js'

export default function PityCard({ bannerKey, stats }) {
  const cfg = getBannerByKey(bannerKey)
  if (!cfg || !stats) return null

  const { currentPity5, currentPity4, fiveStarCount, avgPity5, guaranteed, hardPity, softPity, total } = stats

  const pct5 = Math.min((currentPity5 / hardPity) * 100, 100)
  const pct4 = Math.min((currentPity4 / 10) * 100, 100)
  const isSoft = currentPity5 >= softPity
  const isClose = currentPity5 >= hardPity - 5

  const barColor5 = isClose
    ? 'linear-gradient(90deg,#f43f5e,#fb7185)'
    : isSoft
    ? 'linear-gradient(90deg,#d97706,#fde68a)'
    : `linear-gradient(90deg,${cfg.color}99,${cfg.color})`

  return (
    <div className="glass p-5 flex flex-col gap-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="label-xs mb-1">{cfg.shortLabel}</p>
          <h3 className="font-display text-lg font-semibold" style={{ color: cfg.color }}>
            {cfg.label}
          </h3>
        </div>
        {cfg.has5050 && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
            guaranteed
              ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 animate-pulse-soft'
              : 'border-white/10 text-white/30'
          }`}>
            {guaranteed ? '🛡 GUARANTEED' : '50/50'}
          </span>
        )}
      </div>

      {/* 5★ Pity bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 flex items-center gap-1.5">
            <span className="text-sm">⭐⭐⭐⭐⭐</span> Pity
          </span>
          <span className={`font-display font-bold text-xl ${
            isClose ? 'text-rose-400' : isSoft ? 'r5' : 'text-white/90'
          }`}>
            {currentPity5}
            <span className="text-sm font-body font-normal text-white/30 ml-1">/ {hardPity}</span>
          </span>
        </div>
        <div className="pity-bar-track">
          <div
            className="pity-bar-fill"
            style={{ width: `${pct5}%`, background: barColor5 }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>0</span>
          <span className={isSoft ? 'text-amber-400 font-semibold' : ''}>
            {isSoft && '⚡ '}Soft {softPity}
          </span>
          <span className={isClose ? 'text-rose-400 font-bold' : ''}>Hard {hardPity}</span>
        </div>
        {isClose && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            ⚠️ {hardPity - currentPity5} pull{hardPity - currentPity5 !== 1 ? 's' : ''} until hard pity!
          </p>
        )}
        {isSoft && !isClose && (
          <p className="mt-1.5 text-xs text-amber-300/70">⚡ Soft pity active — increased rates</p>
        )}
      </div>

      {/* 4★ Pity bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">⭐⭐⭐⭐ Pity</span>
          <span className={`text-base font-display font-semibold ${
            currentPity4 >= 9 ? 'text-violet-300' : 'text-white/60'
          }`}>
            {currentPity4}<span className="text-xs text-white/25 font-body font-normal ml-1">/ 10</span>
          </span>
        </div>
        <div className="pity-bar-track" style={{ height: 5 }}>
          <div
            className="pity-bar-fill"
            style={{ width: `${pct4}%`, background: 'linear-gradient(90deg,#7c3aed,#c4b5fd)' }}
          />
        </div>
        {currentPity4 >= 9 && (
          <p className="mt-1 text-[11px] text-violet-300">4★ guaranteed next pull!</p>
        )}
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {[
          { label: 'Pulls', value: total },
          { label: '5★ Got', value: fiveStarCount },
          { label: 'Avg Pity', value: avgPity5 ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-display font-semibold text-base text-white/90">{value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
