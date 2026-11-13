import { DISTANCE_BANDS } from './programs.js'

/**
 * Typical ONE-WAY cash fares in US dollars, per person, by cabin and the same
 * distance bands the award prices use. Hand-compiled November 2026 from
 * typical published fares (Google Flights / airline sites, economy sale fares
 * to full-fare business); NOT live prices. They exist to answer "is this a
 * good use of points?" roughly, and every place they appear links to Google
 * Flights for the real fare.
 *
 * One-way international fares are often close to a round-trip price, and
 * round trips are rarely exactly twice a one-way, so treat round-trip totals
 * (one-way x 2) as rough.
 */
const n = null

export const CASH_BANDS = {
  // ≤700, ≤1,500, ≤3,000, ≤5,000, ≤7,000, ≤9,000, 9,000+ miles
  Y: [[80, 250], [100, 350], [150, 450], [350, 900], [450, 1200], [550, 1400], [650, 1600]],
  W: [[150, 400], [200, 500], [300, 800], [800, 1800], [1000, 2200], [1100, 2500], [1300, 2800]],
  J: [[250, 700], [350, 900], [500, 1500], [2000, 5000], [2500, 6500], [3000, 7500], [3500, 9000]],
  F: [n, n, [1000, 3000], [6000, 12000], [7000, 15000], [8000, 18000], [9000, 20000]],
}

export function cashEstimate(miles, cabin) {
  const i = DISTANCE_BANDS.findIndex((max) => miles <= max)
  const band = CASH_BANDS[cabin]?.[i]
  return band ? { min: band[0], max: band[1] } : null
}
