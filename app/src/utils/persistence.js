import { PROGRAMS_BY_ID } from '../data/programs.js'
import { CARDS_BY_ID } from '../data/cards.js'
import { AIRPORTS_BY_IATA } from '../data/airports.js'

/**
 * Opt-in "remember me" storage, ported from the Hotel Points Optimizer. The
 * app is session-only by default; only when the user ticks "remember on this
 * device" is the profile below written to this browser's localStorage. It
 * never leaves the browser, and unticking (or "Start over") erases it.
 *
 * Saved: the *profile* -- programs, balances, tiers, card points, home
 * airport. Never saved: the trip (destination, cabin, travellers).
 *
 * Storage can throw or be missing (private windows, blocked site data), and
 * everything read back is re-validated, because it can be from an older
 * version or hand-edited.
 */
const KEY = 'flight-points-optimizer:profile'
const VERSION = 1

function store() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Whether this browser will actually let us save (it may block storage). */
export function storageAvailable() {
  const s = store()
  if (!s) return false
  try {
    const probe = `${KEY}:probe`
    s.setItem(probe, '1')
    s.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const positiveInt = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : null)

/**
 * Rebuilds a trustworthy profile from untrusted stored data: drops unknown
 * programs or cards, duplicates, tiers that no longer exist, non-numeric
 * balances, unknown airports. Row ids are reassigned. Null if `raw` isn't an
 * object.
 */
export function sanitizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null
  let nextId = 1

  const seenPrograms = new Set()
  const memberships = []
  for (const m of Array.isArray(raw.memberships) ? raw.memberships : []) {
    const program = PROGRAMS_BY_ID[m?.programId]
    if (!program || seenPrograms.has(program.id)) continue
    seenPrograms.add(program.id)
    memberships.push({
      id: nextId++,
      programId: program.id,
      balance: positiveInt(m.balance),
      tier: program.eliteTiers.some((t) => t.name === m.tier) ? m.tier : null,
    })
  }

  const seenCards = new Set()
  const bankPoints = []
  for (const b of Array.isArray(raw.bankPoints) ? raw.bankPoints : []) {
    if (!CARDS_BY_ID[b?.cardId] || seenCards.has(b.cardId)) continue
    seenCards.add(b.cardId)
    bankPoints.push({ id: nextId++, cardId: b.cardId, balance: positiveInt(b.balance) })
  }

  return {
    memberships,
    bankPoints,
    homeAirport: AIRPORTS_BY_IATA[raw.homeAirport] ? raw.homeAirport : '',
  }
}

/** The saved profile, or null if nothing is saved, it's unreadable, or it's from another version. */
export function loadSaved() {
  const s = store()
  if (!s) return null
  try {
    const text = s.getItem(KEY)
    if (!text) return null
    const data = JSON.parse(text)
    return data?.v === VERSION ? sanitizeProfile(data.profile) : null
  } catch {
    return null
  }
}

/** True only if the profile was actually written (false when storage is blocked or full). */
export function saveProfile(profile) {
  const s = store()
  if (!s) return false
  try {
    s.setItem(KEY, JSON.stringify({ v: VERSION, profile }))
    return true
  } catch {
    return false
  }
}

export function clearSaved() {
  try {
    store()?.removeItem(KEY)
  } catch {
    /* storage blocked -- nothing was saved to clear */
  }
}
