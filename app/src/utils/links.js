import { CABIN_NAME } from '../data/programs.js'

/**
 * A Google Flights search pre-filled through its plain-language `q`
 * parameter, e.g. "Flights from EWR, JFK to HND one way business class".
 * Google parses this loosely: the route is reliably filled in, while cabin
 * and trip type may need a click on its page. Only airport codes and the
 * cabin go in the URL -- never balances or anything personal.
 */
export function googleFlightsUrl({ origins, dest, cabin, roundTrip }) {
  const from = origins.map((o) => o.iata).join(', ')
  const q = `Flights from ${from} to ${dest.iata} ${roundTrip ? 'round trip' : 'one way'} ${CABIN_NAME[cabin].toLowerCase()} class`
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`
}

export const formatUsd = (n) => `$${Math.round(n).toLocaleString('en-US')}`

export const formatUsdRange = (r) => (r ? `${formatUsd(r.min)}–${formatUsd(r.max)}` : '—')
