import { fetchAllBanners, FetchError } from '../api/hoyoFetch.js'
import { BANNER_TYPES, GACHA_TYPES } from '../core/bannerTypes.js'
import { mergeWishes, saveStore } from './wishStore.js'
import { annotatePity } from '../core/pity.js'

/**
 * Full sync: fetch all banners, merge into store, re-annotate pity, save.
 *
 * @param {object}   options
 * @param {object}   options.authParams    - from parseAuthKey
 * @param {object}   options.currentStore  - current store from loadStore()
 * @param {Function} options.onProgress    - ({ phase, gachaType, fetched, done, error? }) => void
 * @param {AbortSignal} [options.signal]   - optional cancellation signal
 * @returns {Promise<{ store, summary }>}
 */
export async function syncWishes({ authParams, currentStore, onProgress, signal }) {
  const rawByGachaType = await fetchAllBanners({
    authParams,
    gachaTypes: GACHA_TYPES,
    onProgress: (p) => onProgress?.({ phase: 'fetch', ...p }),
    signal,
  })

  onProgress?.({ phase: 'processing' })

  // Map gacha_type → bannerKey, sort oldest→newest
  // Do NOT pre-annotate — let merge happen first, then annotate once
  const incoming = {}
  const summary = {}

  for (const [gachaTypeStr, rawList] of Object.entries(rawByGachaType)) {
    const gt = Number(gachaTypeStr)
    const cfg = BANNER_TYPES[gt]
    if (!cfg) continue

    const key = cfg.key
    const sorted = [...rawList].sort((a, b) => a.id < b.id ? -1 : 1)
    incoming[key] = sorted  // raw, not yet annotated

    summary[key] = {
      label: cfg.label,
      fetched: rawList.length,
    }
  }

  // Merge raw into store (dedup by id)
  const merged = mergeWishes(currentStore, incoming)

  // Annotate pity on the fully merged list (single pass per banner)
  for (const key of Object.keys(merged.wishes)) {
    const cfg = Object.values(BANNER_TYPES).find(b => b.key === key)
    if (!cfg) continue
    merged.wishes[key] = annotatePity(merged.wishes[key], key)
  }

  onProgress?.({ phase: 'saving' })
  const saveResult = saveStore(merged)

  if (!saveResult.ok) {
    throw new Error(saveResult.error || 'Failed to save to local storage.')
  }

  return { store: merged, summary }
}
