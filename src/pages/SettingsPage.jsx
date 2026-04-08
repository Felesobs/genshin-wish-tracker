import { useState, useRef } from 'react'
import { exportStore, importStore, clearStore, saveStore, EMPTY_STORE } from '../storage/wishStore.js'

export default function SettingsPage({ store, onStoreUpdate, theme, setTheme }) {
  const [importStatus, setImportStatus] = useState(null)
  const [importError, setImportError] = useState('')
  const [storageError, setStorageError] = useState(null)
  const [showClear, setShowClear] = useState(false)
  const fileRef = useRef()

  const totalWishes = Object.values(store.wishes).reduce((s, arr) => s + arr.length, 0)

  function handleExport() {
    const json = exportStore(store)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `genshin-wishes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Size guard: warn before reading a huge file
    if (file.size > 50 * 1024 * 1024) {
      setImportStatus('error')
      setImportError('File is too large (max 50MB).')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = importStore(ev.target.result)
        const result = saveStore(imported)
        if (!result.ok) {
          setImportStatus('error')
          setImportError(result.error)
        } else {
          onStoreUpdate(imported)
          setImportStatus('success')
          setImportError('')
        }
      } catch (err) {
        setImportStatus('error')
        setImportError(err.message)
      }
      setTimeout(() => setImportStatus(null), 4000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClearAll() {
    clearStore()
    const empty = EMPTY_STORE()
    onStoreUpdate(empty)
    setShowClear(false)
    setStorageError(null)
  }

  const sections = [
    {
      title: 'Data',
      items: [
        {
          label: 'Export Backup',
          description: `Download all ${totalWishes.toLocaleString()} wishes as a JSON file`,
          action: (
            <button className="btn-primary text-sm" onClick={handleExport}>
              ⬇️ Export JSON
            </button>
          ),
        },
        {
          label: 'Import Backup',
          description: 'Restore from a previously exported JSON file',
          action: (
            <>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
              <button className="btn-ghost text-sm" onClick={() => fileRef.current?.click()}>
                ⬆️ Import JSON
              </button>
            </>
          ),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'Theme',
          description: 'Switch between dark and light mode',
          action: (
            <button
              className="btn-ghost text-sm"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          ),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          label: 'Clear All Data',
          description: 'Permanently delete all wish history from this browser',
          danger: true,
          action: !showClear ? (
            <button className="btn-danger text-sm" onClick={() => setShowClear(true)}>
              🗑 Clear All
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.4)', color: '#fb7185' }}
                onClick={handleClearAll}
              >
                Yes, delete all
              </button>
              <button className="btn-ghost text-sm" onClick={() => setShowClear(false)}>Cancel</button>
            </div>
          ),
        },
      ],
    },
  ]

  return (
    <div className="space-y-8 animate-slide-up max-w-2xl">
      <div>
        <p className="label-xs mb-2">Preferences</p>
        <h1 className="font-display text-3xl font-bold text-white/90">Settings</h1>
      </div>

      {importStatus === 'success' && (
        <div className="glass-sm p-3 text-sm text-emerald-300 flex items-center gap-2 animate-scale-in"
             style={{ border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(16,185,129,0.08)' }}>
          ✓ Backup imported successfully!
        </div>
      )}
      {importStatus === 'error' && (
        <div className="glass-sm p-3 text-sm text-rose-300 animate-scale-in"
             style={{ border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)' }}>
          ✗ {importError}
        </div>
      )}
      {storageError && (
        <div className="glass-sm p-3 text-sm text-amber-300 animate-scale-in"
             style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
          ⚠️ {storageError}
        </div>
      )}

      {sections.map(section => (
        <div key={section.title} className="space-y-2">
          <p className="label-xs">{section.title}</p>
          <div className="glass overflow-hidden divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {section.items.map(item => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 px-5 py-4"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <p className={`text-sm font-medium ${item.danger ? 'text-rose-400' : 'text-white/80'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                </div>
                <div className="flex-shrink-0">{item.action}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass-sm p-5 space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <p className="font-semibold text-white/40 uppercase tracking-widest text-[10px]">About</p>
        <p>Genshin Wish Tracker — all data stored locally in your browser.</p>
        <p>No account required. Not affiliated with HoYoverse or miHoYo.</p>
        <p>Data syncs from Hoyoverse's official wish history API endpoint.</p>
      </div>
    </div>
  )
}
