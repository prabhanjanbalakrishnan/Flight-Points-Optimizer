import { useOptimizer } from '../context/OptimizerContext.jsx'
import { PROGRAMS, PROGRAMS_META, SURCHARGE_LABEL, DISTANCE_BANDS, CABINS } from '../data/programs.js'
import { cardsInto } from '../data/cards.js'
import { AIRLINES } from '../data/airlines.js'
import { carrierName, formatRange } from '../utils/awardLogic.js'

const MODEL_LABEL = {
  dynamic: 'Dynamic pricing',
  'region-chart': 'Region award chart',
  'distance-band': 'Distance-based chart',
  'revenue-based': 'Tied to cash fare',
}

const bandLabel = (i) => {
  const lo = i === 0 ? 0 : DISTANCE_BANDS[i - 1] + 1
  const hi = DISTANCE_BANDS[i]
  return hi === Infinity ? `${lo.toLocaleString()}+ mi` : `${lo.toLocaleString()}–${hi.toLocaleString()} mi`
}

// Partner airlines that have their own program here open that program's
// card instead of leaving the app. KLM shares Flying Blue with Air France.
const PROGRAM_BY_AIRLINE = { ...Object.fromEntries(PROGRAMS.map((p) => [p.airline, p])), KL: PROGRAMS.find((p) => p.id === 'flyingblue') }

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Opens a program's card, scrolls to it and briefly highlights it. */
function openProgram(id) {
  const el = document.getElementById(`program-${id}`)
  if (!el) return
  el.open = true
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.querySelector('summary')?.focus({ preventScroll: true })
  el.classList.remove('is-flash')
  void el.offsetWidth // restart the animation if it's clicked twice
  el.classList.add('is-flash')
  setTimeout(() => el.classList.remove('is-flash'), 1600)
}

function PartnerChips({ partners }) {
  if (!partners.length) return <p>None — own flights only.</p>
  return (
    <ul className="partners">
      {partners.map((code) => {
        const program = PROGRAM_BY_AIRLINE[code]
        const name = carrierName(code)
        if (program) {
          return (
            <li key={code}>
              <button type="button" className="partner partner--program" onClick={() => openProgram(program.id)} title={`Open ${program.name}`}>
                {name}
                <span className="partner__icon" aria-hidden="true">↓</span>
                <span className="sr-only"> (open its program, {program.name})</span>
              </button>
            </li>
          )
        }
        const url = AIRLINES[code]?.url
        if (!url) return <li key={code} className="partner partner--plain">{name}</li>
        return (
          <li key={code}>
            <a className="partner" href={url} target="_blank" rel="noopener noreferrer" title={`${name} website`}>
              {name}
              <span className="partner__icon" aria-hidden="true">↗</span>
              <span className="sr-only"> (website, opens in a new tab)</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Reference: every program's alliance, partners, pricing model, sweet spots and elite ladder. */
export default function ProgramsPage() {
  const { state } = useOptimizer()
  const mine = Object.fromEntries(state.memberships.map((m) => [m.programId, m]))

  return (
    <div className="page">
      <h1>Programs</h1>
      <p className="lede">
        All {PROGRAMS.length} programs, how they price awards, who they partner with, and which cards transfer in.
        Partner airlines marked ↓ have their own program here and open it; ↗ goes to the airline’s website.
      </p>
      <div className="stack">
        {PROGRAMS.map((p) => {
          const cards = cardsInto(p.id)
          const myTier = mine[p.id]?.tier
          return (
            <details key={p.id} id={`program-${p.id}`} className="card card--ref" style={{ '--accent-row': p.accentColor }}>
              <summary className="card__head">
                <div>
                  <h3>{p.name}</h3>
                  <p className="muted">
                    {p.alliance ?? 'No alliance'} · {MODEL_LABEL[p.pricingModel]} · {SURCHARGE_LABEL[p.surcharges]}
                  </p>
                </div>
                {mine[p.id] && <span className="badge">You’re a member</span>}
              </summary>
              <div className="card__panel">
                <p>{p.pricingNote}</p>
                <h4>Partner airlines</h4>
                <PartnerChips partners={p.partners} />
                <h4>Card points that transfer in</h4>
                <p>
                  {cards.length
                    ? cards.map((c) => `${c.name}${c.transfers[p.id] !== 1 ? ` (1:${c.transfers[p.id]})` : ''}`).join(', ')
                    : 'None of the cards in this app.'}
                </p>
                <h4>Sweet spots</h4>
                <ul className="bullets">
                  {p.sweetSpots.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <h4>Typical one-way prices by distance</h4>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Distance</th>
                        {CABINS.map((c) => (
                          <th key={c.id} scope="col">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DISTANCE_BANDS.map((_, i) => (
                        <tr key={i}>
                          <td>{bandLabel(i)}</td>
                          {CABINS.map((c) => {
                            const b = p.bands[c.id][i]
                            return (
                              <td key={c.id} className="num">
                                {b ? formatRange(b[0] * 1000, b[1] * 1000) : '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {p.overrides.length > 0 && (
                  <ul className="bullets fine">
                    {p.overrides.map((o) => (
                      <li key={o.note}>{o.note}</li>
                    ))}
                  </ul>
                )}
                <h4>Elite tiers</h4>
                <ul className="bullets">
                  {p.eliteTiers.map((t) => (
                    <li key={t.name} className={t.name === myTier ? 'is-current' : ''}>
                      <strong>{t.name}</strong>
                      {t.name === myTier && <span className="badge">Your tier</span>} ({t.qualification}):{' '}
                      {t.perks.join('; ')}
                    </li>
                  ))}
                </ul>
                <a className="out" href={p.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Visit {p.name.split(' (')[0]} →
                </a>
              </div>
            </details>
          )
        })}
      </div>
      <p className="disclaimer">
        {PROGRAMS_META.disclaimer} Elite thresholds are approximate; check each program for current rules.
      </p>
    </div>
  )
}
