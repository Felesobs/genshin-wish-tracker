import { useState, useCallback, useEffect } from 'react'
import { loadStore } from './storage/wishStore.js'
import DashboardPage from './pages/DashboardPage.jsx'
import HistoryPage   from './pages/HistoryPage.jsx'
import StatsPage     from './pages/StatsPage.jsx'
import ImportPage    from './pages/ImportPage.jsx'
import SettingsPage  from './pages/SettingsPage.jsx'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '◈' },
  { key: 'history',   label: 'History',   icon: '📜' },
  { key: 'stats',     label: 'Stats',     icon: '📊' },
  { key: 'import',    label: 'Import',    icon: '⬇️' },
  { key: 'settings',  label: 'Settings',  icon: '⚙️' },
]

function getInitialTheme() {
  try {
    return localStorage.getItem('gwt_theme') || 'dark'
  } catch {
    return 'dark'
  }
}

export default function App() {
  const [page, setPage]   = useState('dashboard')
  const [store, setStore] = useState(() => loadStore())
  const [theme, setThemeState] = useState(getInitialTheme)

  const setTheme = useCallback((valOrFn) => {
    setThemeState(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn
      try { localStorage.setItem('gwt_theme', next) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
    root.classList.toggle('dark', theme !== 'light')
  }, [theme])

  const handleStoreUpdate = useCallback((updated) => {
    setStore(updated)
  }, [])

  return (
    <div className={`min-h-screen relative ${theme}`}>
      <div className="star-field" />
      <div className="ambient-bg" />

      <div className="relative z-10 flex min-h-screen">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen border-r"
               style={{ background: 'rgba(11,9,24,0.7)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(20px)' }}>
          <div className="px-5 py-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">✦</span>
              <div>
                <p className="font-display font-bold text-sm text-white/90 leading-tight">Genshin</p>
                <p className="font-display text-xs" style={{ color: 'var(--accent)' }}>Wish Tracker</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {NAV.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 active:scale-95 text-left
                            ${page === key ? 'nav-tab-active' : 'text-white/35 hover:text-white/70 hover:bg-white/5'}`}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="px-5 py-4">
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              All data stored locally
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Top bar — mobile */}
          <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
                  style={{ background: 'rgba(5,4,13,0.9)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">✦</span>
              <span className="font-display font-bold text-sm text-white/80">Wish Tracker</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              {NAV.find(n => n.key === page)?.label}
            </span>
          </header>

          <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
            {page === 'dashboard' && <DashboardPage store={store} />}
            {page === 'history'   && <HistoryPage   store={store} />}
            {page === 'stats'     && <StatsPage     store={store} />}
            {page === 'import'    && <ImportPage    store={store} onStoreUpdate={handleStoreUpdate} />}
            {page === 'settings'  && (
              <SettingsPage
                store={store}
                onStoreUpdate={handleStoreUpdate}
                theme={theme}
                setTheme={setTheme}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex border-t"
           style={{ background: 'rgba(5,4,13,0.95)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(20px)' }}>
        {NAV.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
            style={{ color: page === key ? 'var(--accent)' : 'rgba(255,255,255,0.25)' }}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="lg:hidden h-20" />
    </div>
  )
}
