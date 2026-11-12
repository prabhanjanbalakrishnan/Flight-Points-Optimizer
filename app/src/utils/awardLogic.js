import { AIRLINES, carrierCovers } from '../data/airlines.js'
import { DISTANCE_BANDS, CABINS } from '../data/programs.js'

import { distanceMiles } from './geo.js'

export { distanceMiles }

export const bandIndex = (miles) => DISTANCE_BANDS.findIndex((max) => miles <= max)

/** Order-independent key for a region pair, e.g. NA + NAS -> "NA-NAS". */
export const pairKey = (a, b) => [a, b].sort().join('-')

export const SURCHARGE_RANK = { none: 0, low: 1, moderate: 2, high: 3 }

/** Airlines this program can book that plausibly fly between the two airports; own airline first. */
export function carriersFor(program, origin, dest) {
  return [program.airline, ...program.partners].filter((code) => carrierCovers(code, origin, dest))
}

/** Typical one-way price (in miles, per person) for one carrier and cabin, or null. */
export function estimateLeg(program, carrier, origin, dest, cabin, miles) {
  const key = pairKey(origin.region, dest.region)
  const override = program.overrides.find(
    (o) =>
      o.pair === key &&
      o[cabin] &&
      (!o.carriers || o.carriers.includes(carrier)) &&
      (!o.countries || o.countries.includes(origin.country) || o.countries.includes(dest.country)),
  )
  if (override) {
    return { min: override[cabin][0] * 1000, max: override[cabin][1] * 1000, note: override.note }
  }
  const band = program.bands[cabin]?.[bandIndex(miles)]
  if (!band) return null
  return { min: band[0] * 1000, max: band[1] * 1000, note: null }
}

/**
 * Every way this program can get you there in `cabin`: one option per
 * distinct price, listing the carriers that share it. Cheapest first, then
 * lowest surcharges.
 */
export function programOptions(program, origin, dest, cabin) {
  const miles = distanceMiles(origin, dest)
  const groups = new Map()
  for (const code of carriersFor(program, origin, dest)) {
    const est = estimateLeg(program, code, origin, dest, cabin, miles)
    if (!est) continue
    const surcharge = program.carrierSurcharges?.[code] ?? program.surcharges
    const k = `${est.min}|${est.max}|${surcharge}|${est.note ?? ''}`
    if (!groups.has(k)) groups.set(k, { ...est, surcharge, carriers: [] })
    groups.get(k).carriers.push(code)
  }
  return [...groups.values()].sort(
    (a, b) => a.min - b.min || SURCHARGE_RANK[a.surcharge] - SURCHARGE_RANK[b.surcharge],
  )
}

/** Cheapest typical price per cabin for this program on this route (null where not bookable). */
export function cabinPrices(program, origin, dest) {
  return Object.fromEntries(
    CABINS.map((c) => {
      const opts = programOptions(program, origin, dest, c.id)
      return [c.id, opts.length ? opts[0] : null]
    }),
  )
}

export const carrierName = (code) => AIRLINES[code]?.name ?? code

export function formatMiles(n) {
  if (n == null) return '—'
  if (n >= 1000) {
    const k = n / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return String(n)
}

export const formatRange = (min, max) =>
  min === max ? formatMiles(min) : `${formatMiles(min)}–${formatMiles(max)}`
