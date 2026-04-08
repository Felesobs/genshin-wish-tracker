import dayjs from 'dayjs'
import { getCurrentPity5, getCurrentPity4, isGuaranteed } from './pity.js'
import { getBannerByKey, BANNER_TYPES } from './bannerTypes.js'

/**
 * Compute full statistics for a single banner's wish list.
 * @param {object[]} wishes  sorted oldest → newest, already pity-annotated
 * @param {string}   bannerKey
 */
export function computeBannerStats(wishes, bannerKey) {
  const cfg = getBannerByKey(bannerKey)
  const total = wishes.length

  const fiveStars = wishes.filter(w => Number(w.rank_type) === 5)
  const fourStars = wishes.filter(w => Number(w.rank_type) === 4)
  const threeStars = wishes.filter(w => Number(w.rank_type) === 3)

  const fiveStarRate = total > 0 ? ((fiveStars.length / total) * 100).toFixed(2) : '0.00'
  const fourStarRate = total > 0 ? ((fourStars.length / total) * 100).toFixed(2) : '0.00'

  const fivePities = fiveStars.map(w => w.pity).filter(Boolean)
  const avgPity5 = fivePities.length > 0
    ? (fivePities.reduce((a, b) => a + b, 0) / fivePities.length).toFixed(1)
    : null

  const minPity5 = fivePities.length > 0 ? Math.min(...fivePities) : null
  const maxPity5 = fivePities.length > 0 ? Math.max(...fivePities) : null

  const currentPity5 = getCurrentPity5(wishes)
  const currentPity4 = getCurrentPity4(wishes)
  const guaranteed = isGuaranteed(wishes)

  // Pity histogram (buckets of 10)
  const histogram = buildPityHistogram(fivePities, cfg?.hardPity || 90)

  // Luck score: how much luckier than average (compared to hardPity/2)
  const baseline = (cfg?.hardPity || 90) / 2
  const luckScore = avgPity5 !== null
    ? Math.max(0, Math.min(100, Math.round(((baseline - Number(avgPity5)) / baseline) * 100 + 50)))
    : null

  return {
    total,
    fiveStars,
    fourStars,
    threeStars,
    fiveStarCount: fiveStars.length,
    fourStarCount: fourStars.length,
    threeStarCount: threeStars.length,
    fiveStarRate,
    fourStarRate,
    avgPity5,
    minPity5,
    maxPity5,
    currentPity5,
    currentPity4,
    guaranteed,
    histogram,
    luckScore,
    hardPity: cfg?.hardPity || 90,
    softPity: cfg?.softPity || 74,
    has5050: cfg?.has5050 || false,
  }
}

/**
 * Global stats across ALL banners.
 */
export function computeGlobalStats(allWishes) {
  let total = 0, five = 0, four = 0, three = 0

  for (const key of Object.keys(allWishes)) {
    const list = allWishes[key] || []
    total += list.length
    list.forEach(w => {
      const r = Number(w.rank_type)
      if (r === 5) five++
      else if (r === 4) four++
      else three++
    })
  }

  return {
    total,
    fiveStarCount: five,
    fourStarCount: four,
    threeStarCount: three,
    fiveStarRate: total > 0 ? ((five / total) * 100).toFixed(2) : '0.00',
    fourStarRate: total > 0 ? ((four / total) * 100).toFixed(2) : '0.00',
  }
}

/**
 * Banner distribution: how many pulls in each banner.
 */
export function computeBannerDistribution(allWishes) {
  return Object.values(BANNER_TYPES).map(cfg => ({
    label: cfg.shortLabel,
    key: cfg.key,
    count: (allWishes[cfg.key] || []).length,
    color: cfg.color,
  }))
}

/**
 * Daily pulls chart data: { date, count } sorted ascending.
 */
export function computeDailyPulls(allWishes) {
  const map = {}
  for (const list of Object.values(allWishes)) {
    for (const w of list) {
      const date = w.time ? w.time.slice(0, 10) : null
      if (!date) continue
      map[date] = (map[date] || 0) + 1
    }
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Build pity histogram with buckets of 10.
 */
export function buildPityHistogram(pities, hardPity = 90) {
  const buckets = {}
  for (let i = 0; i <= hardPity; i += 10) {
    const label = `${i + 1}–${Math.min(i + 10, hardPity)}`
    buckets[label] = 0
  }
  pities.forEach(p => {
    const bucket = Math.floor((p - 1) / 10) * 10
    const label = `${bucket + 1}–${Math.min(bucket + 10, hardPity)}`
    if (buckets[label] !== undefined) buckets[label]++
  })
  return Object.entries(buckets).map(([label, count]) => ({ label, count }))
}
