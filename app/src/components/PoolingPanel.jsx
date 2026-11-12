import { CABIN_NAME } from '../data/programs.js'
import { formatMiles } from '../utils/awardLogic.js'

/** Per card: which program its points go furthest in for this trip. */
export default function PoolingPanel({ pooling, cabin }) {
  if (pooling.length === 0) {
    return (
      <p className="muted">
        Add credit card points on “My points” (with a balance) to see where they go furthest for this trip.
      </p>
    )
  }

  return (
    <div className="stack">
      <p className="muted">
        Each option assumes you send <em>all</em> of that card’s points to one program, on top of any miles you
        already hold there. {CABIN_NAME[cabin]} prices at the saver level.
      </p>
      {pooling.map((p) => (
        <section key={p.rowId} className="pool">
          <h3>
            {p.card.name} <span className="muted num">· {p.balance.toLocaleString()} points</span>
          </h3>
          {p.options.length === 0 ? (
            <p className="muted">None of this card’s partners can book {CABIN_NAME[cabin].toLowerCase()} on this route.</p>
          ) : (
            <ol className="pool__list">
              {p.options.map((o, i) => (
                <li key={o.entry.program.id} className={i === 0 ? 'is-best' : ''}>
                  <span className="pool__name">
                    {o.entry.program.name}
                    {!o.entry.isMember && <span className="badge badge--soft">join free</span>}
                  </span>
                  <span className="num">
                    {formatMiles(o.miles)}
                    {o.ratio !== 1 && ` (1:${o.ratio})`}
                    {o.entry.ownBalance > 0 && ` + ${formatMiles(o.entry.ownBalance)} held`} vs{' '}
                    {formatMiles(o.entry.costLow)}
                  </span>
                  <span className={o.covered ? 'good' : 'warn'}>
                    {o.covered ? 'Covers it' : `${formatMiles(o.shortfall)} short`}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  )
}
