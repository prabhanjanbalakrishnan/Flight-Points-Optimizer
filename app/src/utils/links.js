import { CABIN_NAME } from '../data/programs.js'
import { formatDate } from './dates.js'

const long = (iso) => formatDate(iso, { month: 'long', day: 'numeric', year: 'numeric' })

/**
 * A Google Flights search pre-filled through its plain-language `q`
 * parameter, e.g. "Flights from EWR, JFK to HND on December 15, 2026
 * returning December 22, 2026 business class". Google parses this loosely:
 * the route is reliably filled in, while dates, cabin and trip type may need
 * a click on its page. Only airport codes, dates and the cabin go in the
 * URL -- never balances or anything personal.
 */
export function googleFlightsUrl({ origins, dest, cabin, roundTrip, departDate, returnDate }) {
  const from = origins.map((o) => o.iata).join(', ')
  const when = departDate
    ? ` on ${long(departDate)}${roundTrip && returnDate ? ` returning ${long(returnDate)}` : ''}`
    : ''
  const kind = roundTrip ? (returnDate && departDate ? '' : ' round trip') : ' one way'
  const q = `Flights from ${from} to ${dest.iata}${when}${kind} ${CABIN_NAME[cabin].toLowerCase()} class`
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`
}

export const formatUsd = (n) => `$${Math.round(n).toLocaleString('en-US')}`

export const formatUsdRange = (r) => (r ? `${formatUsd(r.min)}–${formatUsd(r.max)}` : '—')
