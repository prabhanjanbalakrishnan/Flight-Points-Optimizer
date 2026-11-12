import { useOptimizer } from '../context/OptimizerContext.jsx'
import { PROGRAMS, PROGRAMS_META, SURCHARGE_LABEL, DISTANCE_BANDS, CABINS } from '../data/programs.js'
import { cardsInto } from '../data/cards.js'
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

/** Reference: every program's alliance, partners, pricing model, sweet spots and elite ladder. */
export default function ProgramsPage() {
  const { state } = useOptimizer()
  const mine = Object.fromEntries(state.memberships.map((m) => [m.programId, m]))

  return (
    <div className="page">
      <h1>Programs</h1>
      <p className="lede">
        All {PROGRAMS.length} programs, how they price awards, who they partner with, and which cards transfer in.
      </p>
      <div className="stack">
        {PROGRAMS.map((p) => {
          const cards = cardsInto(p.id)
          const myTier = mine[p.id]?.tier
          return (
            <details key={p.id} className="card card--ref" style={{ '--accent-row': p.accentColor }}>
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
                <p>{p.partners.length ? p.partners.map(carrierName).join(', ') : 'None — own flights only.'}</p>
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
