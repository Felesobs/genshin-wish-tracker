/**
 * Chunk array into pages.
 */
export function paginate(arr, page, pageSize) {
  const start = (page - 1) * pageSize
  return arr.slice(start, start + pageSize)
}

/**
 * Sort wishes by id descending (newest first for display).
 * Returns a new array.
 */
export function sortNewestFirst(wishes) {
  return [...wishes].sort((a, b) => {
    if (a.id > b.id) return -1
    if (a.id < b.id) return  1
    return 0
  })
}

/**
 * Group an array by a key function.
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => string} keyFn
 * @returns {Record<string, T[]>}
 */
export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}
