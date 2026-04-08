import { useState, useEffect, useRef } from 'react'
import { BANNER_TYPES } from '../core/bannerTypes.js'

export default function ImportProgress({ progress, summary }) {
  const banners = Object.values(BANNER_TYPES)

  // Track which banners have been completed during this sync session
  const completedRef = useRef(new Set())
  const [completed, setCompleted] = useState(new Set())

  useEffect(() => {
    if (progress?.phase === 'fetch' && progress?.done && progress?.gachaType) {
      const key = BANNER_TYPES[progress.gachaType]?.key
      if (key && !completedRef.current.has(key)) {
        completedRef.current = new Set([...completedRef.current, key])
        setCompleted(new Set(completedRef.current))
      }
    }
    // Reset on new sync start
    if (progress?.phase === 'fetch' && progress?.gachaType && progress?.fetched === 0) {
      const key = BANNER_TYPES[progress.gachaType]?.key
      if (key && completedRef.current.size === 0) {
        // First banner starting — clear completed set
        completedRef.current = new Set()
        setCompleted(new Set())
      }
    }
  }, [progress])

  if (progress?.phase === 'done' && summary) {
    return (
      <div className="glass p-6 space-y-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-display font-semibold text-white/90">Import Complete!</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Wish history synced and saved locally.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(summary).map(([key, data]) => (
            <div key={key} className="glass-sm p-3">
              <p className="text-xs font-medium text-white/60 mb-1">{data.label}</p>
              <p className="font-display font-bold text-lg" style={{ color: 'var(--accent)' }}>
                {data.fetched.toLocaleString()}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>wishes fetched</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!progress || progress.phase === 'idle') return null

  if (progress.phase === 'processing' || progress.phase === 'saving') {
    return (
      <div className="glass p-5 flex items-center gap-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {progress.phase === 'processing' ? 'Processing data...' : 'Saving locally...'}
        </p>
      </div>
    )
  }

  // phase === 'fetch'
  const current = progress.gachaType ? BANNER_TYPES[progress.gachaType] : null

  return (
    <div className="glass p-5 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-brand-400/30 border-t-brand-400 animate-spin flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-white/80">
            Fetching {current?.label || 'wishes'}...
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {progress.fetched || 0} wishes retrieved
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {banners.map(cfg => {
          const isCurrent = progress.gachaType === cfg.gacha_type && !progress.done
          const isDone = completed.has(cfg.key)

          return (
            <div key={cfg.key} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${isCurrent ? 'animate-pulse' : ''}`}
                   style={{
                     background: isDone ? '#34d399' : isCurrent ? cfg.color : 'var(--text-muted)',
                     opacity: isDone || isCurrent ? 1 : 0.3,
                   }} />
              <span className={`text-xs flex-1 ${isCurrent ? 'text-white/80' : isDone ? 'text-white/50' : 'text-white/25'}`}>
                {cfg.label}
              </span>
              {isDone && <span className="text-[10px] text-emerald-400">✓</span>}
              {isCurrent && (
                <span className="text-xs font-mono" style={{ color: cfg.color }}>
                  {progress.fetched || 0}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        This may take a minute for large accounts. Please don't close the page.
      </p>
    </div>
  )
}
