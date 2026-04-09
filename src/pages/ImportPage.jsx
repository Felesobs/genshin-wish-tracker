import { useState, useCallback, useRef, useEffect } from 'react'
import { parseAuthKey } from '../core/parseAuthKey.js'
import { syncWishes } from '../storage/syncEngine.js'
import ImportProgress from '../components/ImportProgress.jsx'

const HOW_TO_STEPS = [
  {
    n: 1,
    title: 'Open Wish History in-game',
    body: 'Launch Genshin Impact → Wish → History. Open any banner\'s history page and wait for it to load.',
  },
  {
    n: 2,
    title: 'Get the URL (PC)',
    body: 'Open PowerShell or CMD and run:',
    code: `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://github.com/Felesobs/genshin-wish-tracker/blob/main/getlink.ps1'))} global"`,
note: 'Run in PowerShell (not CMD). The URL will be copied to your clipboard automatically.',
  },
  {
    n: 3,
    title: 'Paste and import',
    body: 'Paste the URL below and click "Fetch Wish History". All banners will be imported automatically.',
  },
]

// Debounce helper
function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function ImportPage({ store, onStoreUpdate }) {
  const [url, setUrl] = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const abortRef = useRef(null)

  const debouncedUrl = useDebounced(url, 200)

  // Parse URL after debounce
  useEffect(() => {
    if (debouncedUrl.trim()) {
      setParseResult(parseAuthKey(debouncedUrl.trim()))
    } else {
      setParseResult(null)
    }
  }, [debouncedUrl])

  const handleUrlChange = useCallback((e) => {
    setUrl(e.target.value)
    setError(null)
    setSummary(null)
    setProgress(null)
  }, [])

  const handleSync = useCallback(async () => {
    if (!parseResult?.ok) return
    const controller = new AbortController()
    abortRef.current = controller

    setSyncing(true)
    setError(null)
    setSummary(null)
    setProgress({ phase: 'fetch', gachaType: null, fetched: 0 })

    try {
      const { store: updated, summary: s } = await syncWishes({
        authParams: parseResult.params,
        currentStore: store,
        onProgress: (p) => setProgress({ ...p }),
        signal: controller.signal,
      })
      setProgress({ phase: 'done' })
      setSummary(s)
      onStoreUpdate(updated)
    } catch (e) {
      if (e.code === 'CANCELLED') {
        setProgress(null)
        setError(null)
      } else {
        setError(e.message || 'Unknown error occurred.')
        setProgress(null)
      }
    } finally {
      setSyncing(false)
      abortRef.current = null
    }
  }, [parseResult, store, onStoreUpdate])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return (
    <div className="space-y-8 animate-slide-up max-w-2xl">
      <div>
        <p className="label-xs mb-2">Sync</p>
        <h1 className="font-display text-3xl font-bold text-white/90">Import Wish History</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Fetches directly from Hoyoverse's servers using your temporary authkey. No login required.
        </p>
      </div>

      {/* How to */}
      <div className="glass overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={() => setShowHelp(v => !v)}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-white/70">
            <span className="text-base">❓</span> How to get your wish URL
          </span>
          <span className={`text-white/30 transition-transform duration-200 ${showHelp ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {showHelp && (
          <div className="px-5 pb-5 space-y-5 border-t animate-fade-in" style={{ borderColor: 'var(--border-subtle)' }}>
            {HOW_TO_STEPS.map(step => (
              <div key={step.n} className="flex gap-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-default)' }}
                >
                  {step.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 mb-1">{step.title}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.body}</p>
                  {step.code && (
                    <pre className="mt-2 p-3 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
                         style={{ background: 'var(--bg-elevated)', color: '#fde68a', border: '1px solid var(--border-subtle)' }}>
                      {step.code}
                    </pre>
                  )}
                  {step.note && (
                    <p className="mt-1.5 text-xs italic" style={{ color: 'var(--text-muted)' }}>{step.note}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#fde68a' }}>
              ⚠️ The URL contains an authkey that expires after <strong>24 hours</strong>. You'll need to generate a new URL to sync again.
            </div>
          </div>
        )}
      </div>

      {/* URL input */}
      <div className="glass p-5 space-y-4">
        <p className="label-xs">Wish History URL</p>
        <textarea
          className="input-field h-28 resize-none font-mono text-xs leading-relaxed"
          placeholder="https://hk4e-api-os.hoyoverse.com/gacha_info/api/...?authkey=..."
          value={url}
          onChange={handleUrlChange}
          disabled={syncing}
          spellCheck={false}
        />

        {parseResult && (
          <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
            parseResult.ok
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            <span>{parseResult.ok ? '✓' : '✗'}</span>
            <span>{parseResult.ok ? 'URL parsed successfully — authkey found.' : parseResult.error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            className="btn-primary flex-1"
            disabled={!parseResult?.ok || syncing}
            onClick={handleSync}
          >
            {syncing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Fetching...
              </>
            ) : (
              <>⬇️ Fetch Wish History</>
            )}
          </button>
          {syncing && (
            <button className="btn-danger" onClick={handleCancel}>
              ✕ Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {(syncing || progress?.phase === 'done') && (
        <ImportProgress progress={progress} summary={progress?.phase === 'done' ? summary : null} />
      )}

      {/* Error */}
      {error && (
        <div className="glass p-4 text-sm rounded-xl animate-scale-in"
             style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
          <p className="font-medium mb-1">Import Failed</p>
          <p style={{ color: 'rgba(251,113,133,0.7)' }}>{error}</p>
        </div>
      )}

      {/* Last sync info */}
      {store.lastSync && (
        <div className="glass-sm p-4 flex items-center gap-3 text-sm">
          <span className="text-base">🕐</span>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Last synced</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {new Date(store.lastSync).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
