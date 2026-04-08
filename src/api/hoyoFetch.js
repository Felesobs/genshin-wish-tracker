/**
 * Hoyoverse Wish Log Fetch Engine
 * Proxy: corsproxy.io (CORS bypass)
 * Endpoint: hk4e-api-os.hoyoverse.com/gacha_info/api/getGachaLog
 */

const FALLBACK_ENDPOINT = 'https://hk4e-api-os.hoyoverse.com/gacha_info/api/getGachaLog'
const PROXY = 'https://corsproxy.io/?url='
const PAGE_SIZE = 20
const DELAY_MS  = 350
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 800

const AUTHKEY_PATTERN = /^[A-Za-z0-9+/=%-]{10,2048}$/

/**
 * Fetch ALL wishes for a single gacha_type (one banner).
 * Supports AbortSignal for cancellation.
 */
export async function fetchBannerWishes({ authParams, gachaType, onProgress, signal }) {
  const allItems = []
  let endId = '0'

  while (true) {
    if (signal?.aborted) throw new FetchError('Sync cancelled.', 'CANCELLED')

    await sleep(DELAY_MS)

    const items = await fetchPageWithRetry({ authParams, gachaType, endId, signal })

    if (!Array.isArray(items) || items.length === 0) break

    allItems.push(...items)
    endId = items[items.length - 1].id

    if (onProgress) onProgress(allItems.length)

    if (items.length < PAGE_SIZE) break
  }

  return allItems
}

/**
 * Fetch ALL banners sequentially.
 */
export async function fetchAllBanners({ authParams, gachaTypes, onProgress, signal }) {
  const result = {}

  for (const gachaType of gachaTypes) {
    if (signal?.aborted) throw new FetchError('Sync cancelled.', 'CANCELLED')

    if (onProgress) onProgress({ gachaType, fetched: 0, done: false })

    const items = await fetchBannerWishes({
      authParams,
      gachaType,
      signal,
      onProgress: (n) => onProgress?.({ gachaType, fetched: n, done: false }),
    })

    result[gachaType] = items
    if (onProgress) onProgress({ gachaType, fetched: items.length, done: true })
  }

  return result
}

/* ── Internal ─────────────────────────────────────────────────── */

async function fetchPageWithRetry(opts) {
  let lastErr
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetchOnePage(opts)
    } catch (e) {
      // Don't retry on auth errors or cancellation
      if (e.code === 'EXPIRED' || e.code === 'INVALID_KEY' || e.code === 'CANCELLED') throw e
      lastErr = e
      if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS * (attempt + 1))
    }
  }
  throw lastErr
}

async function fetchOnePage({ authParams, gachaType, endId, signal }) {
  // Validate authkey format before sending
  const ak = authParams.authkey || ''
  if (!AUTHKEY_PATTERN.test(ak)) {
    throw new FetchError('authkey contains invalid characters.', 'INVALID_KEY')
  }

  const params = new URLSearchParams({
    authkey_ver: authParams.authkey_ver || '1',
    sign_type:   authParams.sign_type   || '2',
    auth_appid:  'webview_gacha',
    lang:        authParams.lang        || 'en',
    authkey:     ak,
    game_biz:    authParams.game_biz    || 'hk4e_global',
    gacha_type:  String(gachaType),
    page:        '1',
    size:        String(PAGE_SIZE),
    end_id:      endId,
  })

  const baseUrl = authParams.endpoint || FALLBACK_ENDPOINT
  const targetUrl = `${baseUrl}?${params.toString()}`
  const proxied   = `${PROXY}${encodeURIComponent(targetUrl)}`

  let res
  try {
    res = await fetch(proxied, {
      headers: { 'Accept': 'application/json' },
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw new FetchError('Sync cancelled.', 'CANCELLED')
    throw new FetchError(`Network error: ${e.message}`, 'NETWORK')
  }

  if (!res.ok) {
    throw new FetchError(`HTTP ${res.status} from proxy`, 'HTTP', res.status)
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new FetchError('Response is not valid JSON. The proxy may be down.', 'PARSE')
  }

  if (json.retcode !== 0) {
    if (json.retcode === -101) throw new FetchError('authkey expired. Please generate a new URL from the game.', 'EXPIRED')
    if (json.retcode === -100) throw new FetchError('Invalid authkey.', 'INVALID_KEY')
    throw new FetchError(json.message || `API error retcode=${json.retcode}`, 'API', json.retcode)
  }

  return json.data?.list || []
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export class FetchError extends Error {
  constructor(message, code, retcode) {
    super(message)
    this.name = 'FetchError'
    this.code = code
    this.retcode = retcode
  }
}
