import { CABIN_NAME } from '../data/programs.js'
import { carrierName, formatMiles, formatRange } from '../utils/awardLogic.js'
import { googleFlightsUrl, formatUsdRange } from '../utils/links.js'

/**
 * The best answer from each trip airport on its own, so someone who flies
 * out of several (e.g. EWR, JFK, LGA) can see whether one is clearly better.
 * Rows arrive best first from compareAirports().
 */
export default function AirportsPanel({ rows, dest, cabin, roundTrip, mult, dates }) {
  const best = rows[0]?.verdict?.top.costLow
  const allSame = rows.every((r) => r.verdict?.top.costLow === best && r.verdict?.top.program.id === rows[0].verdict?.top.program.id)

  return (
    <div className="stack">
      <p className="muted">
        Each airport on its own: the best program from there for {CABIN_NAME[cabin].toLowerCase()}
        {mult > 1 ? ` (${mult} tickets)` : ', one-way'}, and the typical cash fare.{' '}
        {rows.length > 1 &&
          (allSame
            ? 'They come out the same on points for this trip, so pick whichever is easiest and compare live cash fares.'
            : 'The airlines flying from each airport differ, which is why the points price can too.')}
      </p>
      <div className="airports">
        {rows.map(({ origin, verdict, cash }, i) => {
          const top = verdict?.top
          return (
            <article key={origin.iata} className={`airport${i === 0 && !allSame && top ? ' airport--best' : ''}`}>
              <header className="airport__head">
                <span className="airport__code">{origin.iata}</span>
                <span className="muted">{origin.city}</span>
                {i === 0 && !allSame && top && <span className="badge badge--accent">Best points price</span>}
              </header>
              {top ? (
                <dl className="airport__facts">
                  <div>
                    <dt>Best program</dt>
                    <dd>
                      {verdict.winners.map((w) => w.program.name).join(' / ')}
                      <span className="table__note">on {top.best.carriers.slice(0, 3).map(carrierName).join(', ')}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Points</dt>
                    <dd className="num">{formatRange(top.costLow, top.costHigh)}</dd>
                  </div>
                  <div>
                    <dt>Your points</dt>
                    <dd className={top.covered ? 'good' : 'warn'}>
                      {top.covered ? 'Covered' : `${formatMiles(top.shortfall)} short`}
                    </dd>
                  </div>
                  <div>
                    <dt>Cash (typical)</dt>
                    <dd className="num">{formatUsdRange(cash)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="muted">None of your programs book {CABIN_NAME[cabin].toLowerCase()} from here.</p>
              )}
              <a
                className="out"
                href={googleFlightsUrl({ origins: [origin], dest, cabin, roundTrip, ...dates })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live fares from {origin.iata} on Google Flights →
              </a>
            </article>
          )
        })}
      </div>
      <p className="fine">
        Cash fares are typical ranges by distance and cabin, not live prices, so they rarely differ between nearby
        airports. Google Flights shows the real difference.
      </p>
    </div>
  )
}
