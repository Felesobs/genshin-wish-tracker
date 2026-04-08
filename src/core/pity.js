import { getBannerByKey } from './bannerTypes.js'

// Known standard/non-limited 5★ characters and weapons
// Used to heuristically determine 50/50 win/loss from wish history
const STANDARD_5STARS = new Set([
  'Diluc', 'Jean', 'Keqing', 'Mona', 'Qiqi', 'Tighnari', 'Dehya',
  'Skyward Harp', 'Skyward Atlas', 'Skyward Blade', 'Skyward Flute', 'Skyward Pride',
  "Amos' Bow", 'Lost Prayer to the Sacred Winds', 'Primordial Jade Winged-Spear',
  "Wolf's Gravestone", 'Aquila Favonia',
])

/**
 * Given a list of wishes for ONE banner (sorted oldest→newest),
 * annotate each wish with:
 *   - pity:    pulls since last 5★ (1-indexed, resets on 5★)
 *   - pity4:   pulls since last ≥4★ (resets on 5★ or 4★)
 *   - won5050: 'win' | 'loss' | 'guaranteed' | null
 *
 * @param {object[]} wishes  sorted oldest → newest
 * @param {string}   bannerKey
 * @returns {object[]} annotated wishes
 */
export function annotatePity(wishes, bannerKey) {
  if (!wishes || wishes.length === 0) return []

  const cfg = getBannerByKey(bannerKey)
  let pity5 = 0
  let pity4 = 0
  let guaranteed = false

  return wishes.map(w => {
    pity5 += 1
    pity4 += 1

    const rank = Number(w.rank_type)
    const out = { ...w, pity: pity5, pity4 }

    if (rank === 5) {
      out.pity = pity5

      if (cfg?.has5050) {
        if (guaranteed) {
          out.won5050 = 'guaranteed'
          guaranteed = false
        } else {
          const isStandard = STANDARD_5STARS.has(w.name)
          out.won5050 = isStandard ? 'loss' : 'win'
          if (isStandard) guaranteed = true
        }
      } else {
        out.won5050 = null
      }

      pity5 = 0
      pity4 = 0  // 5★ also resets 4★ pity
    } else if (rank === 4) {
      out.pity4 = pity4
      pity4 = 0
    }

    return out
  })
}

export function getCurrentPity5(wishes) {
  if (!wishes || wishes.length === 0) return 0
  let pity = 0
  for (let i = wishes.length - 1; i >= 0; i--) {
    if (Number(wishes[i].rank_type) === 5) break
    pity++
  }
  return pity
}

export function getCurrentPity4(wishes) {
  if (!wishes || wishes.length === 0) return 0
  let pity = 0
  for (let i = wishes.length - 1; i >= 0; i--) {
    if (Number(wishes[i].rank_type) >= 4) break
    pity++
  }
  return pity
}

export function isGuaranteed(wishes) {
  if (!wishes || wishes.length === 0) return false
  const last5 = [...wishes].reverse().find(w => Number(w.rank_type) === 5)
  if (!last5) return false
  return last5.won5050 === 'loss'
}
