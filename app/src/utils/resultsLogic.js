import { PROGRAMS, CABINS } from '../data/programs.js'
import { CARDS, CARDS_BY_ID } from '../data/cards.js'

import { programOptions, cabinPrices, SURCHARGE_RANK } from './awardLogic.js'

/** How many one-way tickets the trip is: travellers x (2 if round trip). */
export const tripMultiplier = ({ travellers, roundTrip }) => Math.max(1, travellers) * (roundTrip ? 2 : 1)

/**
 * Bank points that can land in `programId`, one entry per card the user
 * holds a balance on, converted at the card's ratio.
 */
export function transferSources(programId, bankPoints) {
  const sources = []
  for (const row of bankPoints) {
    const card = CARDS_BY_ID[row.cardId]
    const ratio = card?.transfers[programId]
    if (!ratio || !(row.balance > 0)) continue
    sources.push({ cardId: card.id, cardName: card.name, ratio, bankPoints: row.balance, miles: Math.floor(row.balance * ratio), verify: !!card.verify })
  }
  return sources
}

/**
 * Highest cabin the balance covers (cheapest typical price), and what the
 * next cabin up would take.
 */
export function cabinReach(prices, balance, mult) {
  const priced = CABINS.filter((c) => prices[c.id]).map((c) => ({ cabin: c.id, cost: prices[c.id].min * mult }))
  let reachedAt = -1
  priced.forEach((p, i) => {
    if (balance >= p.cost) reachedAt = i
  })
  const reached = reachedAt >= 0 ? priced[reachedAt] : null
  const up = priced.slice(reachedAt + 1).find((p) => balance < p.cost)
  return { reached, next: up ? { ...up, short: up.cost - balance } : null }
}

/**
 * One entry per program worth showing: ones the user belongs to, plus ones
 * their card points can reach (joining a program is free, so a program they
 * don't hold yet can still be the best answer). Each says how much the trip
 * costs there in the chosen cabin, what they can pool into it, and whether
 * that covers it.
 *
 * Like the hotel app, "pooled" assumes ALL of each card's points go to this
 * one program -- splitting a balance across programs isn't modelled.
 */
export function buildResults({ memberships, bankPoints, origin, dest, cabin, travellers, roundTrip }) {
  const mult = tripMultiplier({ travellers, roundTrip })
  const membershipByProgram = Object.fromEntries(memberships.map((m) => [m.programId, m]))
  const heldCards = new Set(bankPoints.map((b) => b.cardId))

  const entries = []
  for (const program of PROGRAMS) {
    const membership = membershipByProgram[program.id]
    const reachableByCard = CARDS.some((c) => heldCards.has(c.id) && c.transfers[program.id])
    if (!membership && !reachableByCard) continue

    const ownBalance = membership?.balance > 0 ? membership.balance : 0
    const sources = transferSources(program.id, bankPoints)
    const transferable = sources.reduce((s, x) => s + x.miles, 0)
    const pooled = ownBalance + transferable

    const options = programOptions(program, origin, dest, cabin)
    const best = options[0] ?? null
    const prices = cabinPrices(program, origin, dest)
    const costLow = best ? best.min * mult : null
    const costHigh = best ? best.max * mult : null

    entries.push({
      program,
      membership: membership ?? null,
      isMember: !!membership,
      ownBalance,
      sources,
      transferable,
      pooled,
      options,
      best,
      costLow,
      costHigh,
      covered: best ? pooled >= costLow : false,
      coveredHigh: best ? pooled >= costHigh : false,
      shortfall: best ? Math.max(0, costLow - pooled) : null,
      prices,
      reach: cabinReach(prices, pooled, mult),
    })
  }

  entries.sort(compareEntries)
  return { entries, mult }
}

function compareEntries(a, b) {
  return (
    (b.best ? 1 : 0) - (a.best ? 1 : 0) ||
    (b.covered ? 1 : 0) - (a.covered ? 1 : 0) ||
    (a.costLow ?? Infinity) - (b.costLow ?? Infinity) ||
    SURCHARGE_RANK[a.best?.surcharge ?? 'none'] - SURCHARGE_RANK[b.best?.surcharge ?? 'none'] ||
    (b.isMember ? 1 : 0) - (a.isMember ? 1 : 0)
  )
}

/** The top entry, plus anything that ties it on every ranking rule except membership. */
export function pickVerdict(entries) {
  const top = entries[0]
  if (!top?.best) return null
  const winners = entries.filter(
    (e) =>
      e.best &&
      e.covered === top.covered &&
      e.costLow === top.costLow &&
      e.best.surcharge === top.best.surcharge,
  )
  return { top, winners, covered: top.covered }
}

/**
 * "Where should this card's points go?" -- per card balance, every program
 * it transfers into that can book this trip, evaluated with ONLY that card's
 * points plus the program's own balance. Ranked like the verdict.
 */
export function buildPooling({ bankPoints, entries, mult }) {
  const out = []
  for (const row of bankPoints) {
    const card = CARDS_BY_ID[row.cardId]
    if (!card || !(row.balance > 0)) continue
    const options = []
    for (const e of entries) {
      const ratio = card.transfers[e.program.id]
      if (!ratio || !e.best) continue
      const miles = Math.floor(row.balance * ratio)
      const total = e.ownBalance + miles
      options.push({
        entry: e,
        ratio,
        miles,
        total,
        covered: total >= e.costLow,
        shortfall: Math.max(0, e.costLow - total),
      })
    }
    options.sort(
      (a, b) =>
        (b.covered ? 1 : 0) - (a.covered ? 1 : 0) ||
        a.entry.costLow - b.entry.costLow ||
        a.shortfall - b.shortfall,
    )
    out.push({ rowId: row.id, card, balance: row.balance, options, mult })
  }
  return out
}

/** Cents per mile for a real price the user found, and whether it beats the program's typical value. */
export function judgeRedemption({ cash, taxes, miles, valuePerMile }) {
  if (!(cash > 0) || !(miles > 0)) return null
  const cpm = ((cash - (taxes > 0 ? taxes : 0)) / miles) * 100
  let verdict = 'close'
  if (cpm >= valuePerMile * 1.2) verdict = 'miles'
  else if (cpm <= valuePerMile * 0.8) verdict = 'cash'
  return { cpm, verdict }
}
