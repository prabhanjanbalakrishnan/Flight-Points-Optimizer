// Dates are plain 'yyyy-mm-dd' strings in local time, never Date objects in
// state, so there's no time-zone drift.
const pad = (n) => String(n).padStart(2, '0')
export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const todayIso = () => toIso(new Date())
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
export const daysBetween = (a, b) => Math.round((fromIso(b) - fromIso(a)) / 86400000)

export const formatDate = (iso, opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) =>
  iso ? fromIso(iso).toLocaleDateString('en-US', opts) : ''

export const formatShort = (iso) => formatDate(iso, { month: 'short', day: 'numeric' })

/** 4th Thursday of November. */
function thanksgiving(year) {
  const nov1 = new Date(year, 10, 1)
  return new Date(year, 10, 1 + ((4 - nov1.getDay() + 7) % 7) + 21)
}

/**
 * Typical peak travel periods, when award prices sit at the high end of
 * their range (dynamic programs, and peak/off-peak charts like Avios,
 * Flying Blue, Virgin and ANA). A rough guide by month and region, not a
 * program's actual calendar.
 */
export function peakSeason(iso, regions) {
  if (!iso) return null
  const d = fromIso(iso)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const has = (r) => regions.includes(r)

  if ((m === 12 && day >= 18) || (m === 1 && day <= 4)) return 'Year-end holidays'
  const tg = thanksgiving(y)
  if (has('NA') && d >= addDays(tg, -3) && d <= addDays(tg, 4)) return 'Thanksgiving week'
  if (m >= 6 && m <= 8 && (has('EU') || has('NA') || has('NAS'))) return 'Summer peak'
  if (has('CAR') && ((m === 3 && day >= 8) || (m === 4 && day <= 12))) return 'Spring break'
  if (has('SAS') && ((m === 12 && day >= 10) || (m === 10 && day >= 20) || (m === 11 && day <= 10))) {
    return 'Festive season to India'
  }
  return null
}

/**
 * Where the departure date sits in the award booking window. Most programs
 * open award seats about 330-360 days out; saver space is often thin in the
 * last two weeks.
 */
export function bookingWindow(iso) {
  if (!iso) return null
  const days = daysBetween(todayIso(), iso)
  if (days > 331) {
    return { kind: 'early', days, text: `${days} days out: many programs only open award seats about 330–360 days ahead, so this may not be bookable yet.` }
  }
  if (days <= 14) {
    return { kind: 'close', days, text: `${days <= 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} out`}: saver seats are often gone this close in, so expect the higher end of the range.` }
  }
  return { kind: 'ok', days, text: `${days} days out: a good window to look for saver seats.` }
}
