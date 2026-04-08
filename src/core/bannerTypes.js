/**
 * Canonical banner type definitions.
 * gacha_type matches the official Hoyoverse API parameter.
 */

export const BANNER_TYPES = {
  301: {
    key: 'character1',
    gacha_type: 301,
    label: 'Character Event 1',
    shortLabel: 'Char 1',
    hardPity: 90,
    softPity: 74,
    has5050: true,
    color: '#9b87f5',
  },
  400: {
    key: 'character2',
    gacha_type: 400,
    label: 'Character Event 2',
    shortLabel: 'Char 2',
    hardPity: 90,
    softPity: 74,
    has5050: true,
    color: '#b8a9ff',
  },
  302: {
    key: 'weapon',
    gacha_type: 302,
    label: 'Weapon Event',
    shortLabel: 'Weapon',
    hardPity: 80,
    softPity: 63,
    has5050: true,
    color: '#f59e0b',
  },
  200: {
    key: 'standard',
    gacha_type: 200,
    label: 'Standard Banner',
    shortLabel: 'Standard',
    hardPity: 90,
    softPity: 74,
    has5050: false,
    color: '#60a5fa',
  },
  100: {
    key: 'beginner',
    gacha_type: 100,
    label: 'Beginner Banner',
    shortLabel: 'Beginner',
    hardPity: 20,
    softPity: 8,
    has5050: false,
    color: '#34d399',
  },
}

export const BANNER_KEYS = Object.values(BANNER_TYPES).map(b => b.key)

export const GACHA_TYPES = Object.keys(BANNER_TYPES).map(Number)

export function getBannerByKey(key) {
  return Object.values(BANNER_TYPES).find(b => b.key === key) || null
}

export function getBannerByGachaType(gachaType) {
  return BANNER_TYPES[gachaType] || null
}
