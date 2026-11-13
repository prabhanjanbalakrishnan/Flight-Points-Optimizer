import { AIRPORTS } from '../data/airports.js'
import { AIRLINES } from '../data/airlines.js'
import { SURCHARGE_RANK, distanceMiles } from './awardLogic.js'
import { buildResults, pointsValue, tripCash } from './resultsLogic.js'

// "Just out of reach" = short by at most this share of the saver price.
const CLOSE_SHARE = 0.3
// Skip hops so short they aren't a points trip (e.g. Newark to JFK).
const MIN_MILES = 150

/**
 * A "fly direct-ish" option uses an airline based at one end of the trip,
 * so there's no third-country hub in the middle (Emirates via Dubai to
 * Europe, say). Region-level, like the rest of the routing.
 */
const isDirectish = (option, origin, dest) =>
  option.carriers.some((c) => [origin.region, dest.region].includes(AIRLINES[c]?.home))

/**
 * Turns the results question around: instead of "what does this trip
 * cost?", "where can my points take me?". Prices every airport in the app
 * from the user's trip airports, keeps every program that can book each
 * destination (cheapest first), picks the cheapest one the user can cover
 * as the headline, and splits destinations into reachable now vs. just out
 * of reach.
 */
export function exploreDestinations({ origins, directOnly = false, ...profile }) {
  const originCodes = new Set(origins.map((o) => o.iata))
  const reachable = []
  const close = []

  for (const dest of AIRPORTS) {
    if (originCodes.has(dest.iata)) continue
    const miles = Math.min(...origins.map((o) => distanceMiles(o, dest)))
    if (miles < MIN_MILES) continue

    const { entries, mult } = buildResults({ ...profile, origins, dest, allCabins: false })
    // Every program that can book this trip, each at its cheapest option.
    const programs = []
    for (const e of entries) {
      const option = e.options.find(
        (o) => !directOnly || o.origins.some((code) => isDirectish(o, origins.find((x) => x.iata === code), dest)),
      )
      if (!option) continue
      const costLow = option.min * mult
      const costHigh = option.max * mult
      programs.push({
        entry: e,
        option,
        costLow,
        costHigh,
        covered: e.pooled >= costLow,
        leftover: e.pooled - costLow,
        shortfall: Math.max(0, costLow - e.pooled),
      })
    }
    if (programs.length === 0) continue
    // Cheapest first, so the card reads as "which program is most
    // affordable here"; covered ones break ties, then lower fees.
    programs.sort(
      (a, b) =>
        a.costLow - b.costLow ||
        (b.covered ? 1 : 0) - (a.covered ? 1 : 0) ||
        SURCHARGE_RANK[a.option.surcharge] - SURCHARGE_RANK[b.option.surcharge],
    )
    // Headline: the cheapest program you can cover, else the one you're closest to.
    const pick =
      programs.find((p) => p.covered) ?? programs.reduce((m, p) => (p.shortfall < m.shortfall ? p : m))
    const cash = tripCash(pick.option.origins[0], origins, dest, profile.cabin, mult)
    const row = {
      dest,
      miles,
      programs,
      ...pick,
      cash,
      value: pointsValue(cash, pick.costLow, pick.costHigh, pick.entry.program.valuePerMile),
    }

    if (row.covered) reachable.push(row)
    else if (row.shortfall <= row.costLow * CLOSE_SHARE) close.push(row)
  }

  return { reachable, close }
}

export const SORTS = {
  points: { label: 'Fewest points', fn: (a, b) => a.costLow - b.costLow },
  value: { label: 'Best value per point', fn: (a, b) => (b.value?.cpp ?? 0) - (a.value?.cpp ?? 0) },
  distance: { label: 'Farthest first', fn: (a, b) => b.miles - a.miles },
}
