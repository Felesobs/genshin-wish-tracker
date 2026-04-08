/**
 * localStorage persistence layer.
 *
 * Schema:
 *   genshin_wish_history = {
 *     version: 1,
 *     lastSync: ISO string | null,
 *     wishes: {
 *       character1: Wish[],
 *       character2: Wish[],
 *       weapon: Wish[],
 *       standard: Wish[],
 *       beginner: Wish[],
 *     }
 *   }
 */

const KEY = 'genshin_wish_history'
const VERSION = 1
const MAX_IMPORT_BYTES = 50 * 1024 * 1024 // 50MB sanity cap

export function EMPTY_STORE() {
  return {
    version: VERSION,
    lastSync: null,
    wishes: {
      character1: [],
      character2: [],
      weapon: [],
      standard: [],
      beginner: [],
    },
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_STORE()
    const parsed = JSON.parse(raw)
    if (!parsed.wishes) return EMPTY_STORE()
    const store = { ...EMPTY_STORE(), ...parsed }
    store.wishes = { ...EMPTY_STORE().wishes, ...parsed.wishes }
    return store
  } catch {
    return EMPTY_STORE()
  }
}

/**
 * Save store. Returns { ok: true } or { ok: false, error }.
 */
export function saveStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
    return { ok: true }
  } catch (e) {
    console.error('Failed to save wish store:', e)
    // Quota exceeded
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      return { ok: false, error: 'Storage quota exceeded. Try clearing old data in Settings.' }
    }
    return { ok: false, error: e.message }
  }
}

export function clearStore() {
  localStorage.removeItem(KEY)
}

/**
 * Merge incoming wishes (keyed by banner key) into existing store.
 * Deduplicates by id. Sorts oldest→newest by id (numeric string compare).
 */
export function mergeWishes(store, incoming) {
  const updated = { ...store, lastSync: new Date().toISOString() }
  updated.wishes = { ...store.wishes }

  for (const [key, newList] of Object.entries(incoming)) {
    const existing = store.wishes[key] || []
    const map = new Map()
    for (const w of existing) map.set(w.id, w)
    for (const w of newList)  map.set(w.id, w)
    updated.wishes[key] = [...map.values()].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    )
  }

  return updated
}

export function exportStore(store) {
  return JSON.stringify({ ...store, exportedAt: new Date().toISOString() }, null, 2)
}

/**
 * Import from JSON string. Validates structure and size.
 * Throws with a user-friendly message on failure.
 */
export function importStore(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') {
    throw new Error('No data provided.')
  }
  if (jsonStr.length > MAX_IMPORT_BYTES) {
    throw new Error('File is too large to import (max 50MB).')
  }

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('File is not valid JSON.')
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.wishes || typeof parsed.wishes !== 'object') {
    throw new Error('Invalid backup format: missing wishes object.')
  }

  const store = { ...EMPTY_STORE(), ...parsed }
  store.wishes = { ...EMPTY_STORE().wishes }

  // Only copy known banner keys, skip unknown keys
  const emptyKeys = Object.keys(EMPTY_STORE().wishes)
  for (const k of emptyKeys) {
    if (Array.isArray(parsed.wishes[k])) {
      store.wishes[k] = parsed.wishes[k]
    }
  }

  return store
}
