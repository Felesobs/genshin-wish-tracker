/**
 * Parse authkey and required query parameters from a Genshin wish history URL.
 */

const REQUIRED_PARAMS = ['authkey', 'authkey_ver', 'sign_type']
const AUTHKEY_MAX_LENGTH = 2048
const AUTHKEY_PATTERN = /^[A-Za-z0-9+/=%]+$/

/**
 * @param {string} rawUrl
 * @returns {{ ok: true, params: object } | { ok: false, error: string }}
 */
export function parseAuthKey(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'URL is empty.' }
  }

  const trimmed = rawUrl.trim()

  if (!trimmed.includes('authkey')) {
    return { ok: false, error: 'URL does not contain an authkey. Make sure you copied the full wish history URL.' }
  }

  // Prevent absurdly large inputs
  if (trimmed.length > 8192) {
    return { ok: false, error: 'URL is too long. Please paste only the wish history URL.' }
  }

  let url
  try {
    url = new URL(trimmed)
  } catch {
    try {
      url = new URL('https://' + trimmed)
    } catch {
      return { ok: false, error: 'Invalid URL format. Please paste the full URL from the game.' }
    }
  }

  const params = {}
  for (const [k, v] of url.searchParams.entries()) {
    params[k] = v
  }

  for (const key of REQUIRED_PARAMS) {
    if (!params[key]) {
      return { ok: false, error: `Missing required parameter: ${key}. The URL may be incomplete or expired.` }
    }
  }

  // Validate authkey content and length
  const ak = params.authkey
  if (ak.length > AUTHKEY_MAX_LENGTH) {
    return { ok: false, error: 'authkey is too long. The URL may be malformed.' }
  }
  if (!AUTHKEY_PATTERN.test(ak)) {
    return { ok: false, error: 'authkey contains unexpected characters. Please re-copy the URL from the game.' }
  }

  // Detect region
  const host = url.hostname
  let game_biz = 'hk4e_global'
  if (host.includes('hk4e-api.mihoyo.com') || host.includes('hk4e-cn')) {
    game_biz = 'hk4e_cn'
  }

  params.game_biz = params.game_biz || game_biz
  params.lang = params.lang || 'en'
  params.endpoint = `${url.origin}${url.pathname}`
  params.endpoint = `${url.origin}${url.pathname}`
return { ok: true, params }
  
}
