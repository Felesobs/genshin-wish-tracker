import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
dayjs.extend(relativeTime)

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dayjs(dateStr).format('MMM D, YYYY')
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return dayjs(dateStr).format('MMM D, YYYY HH:mm')
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—'
  return dayjs(dateStr).fromNow()
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString()
}

export function formatPercent(val, decimals = 2) {
  if (val === null || val === undefined) return '—'
  return `${Number(val).toFixed(decimals)}%`
}

export function rarityClass(r) {
  const n = Number(r)
  if (n === 5) return 'r5'
  if (n === 4) return 'r4'
  return 'r3'
}

export function rarityBadgeClass(r) {
  const n = Number(r)
  if (n === 5) return 'badge-r5'
  if (n === 4) return 'badge-r4'
  return 'badge-r3'
}

export function itemTypeLabel(item_type) {
  if (!item_type) return '—'
  return item_type.charAt(0).toUpperCase() + item_type.slice(1).toLowerCase()
}
