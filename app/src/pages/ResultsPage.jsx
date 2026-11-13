import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useOptimizer, tripOriginCodes } from '../context/OptimizerContext.jsx'
import { AIRPORTS_BY_IATA } from '../data/airports.js'
import { CABIN_NAME, PROGRAMS_META } from '../data/programs.js'
import { buildResults, pickVerdict, buildPooling, compareAirports } from '../utils/resultsLogic.js'
import { googleFlightsUrl, formatUsdRange } from '../utils/links.js'
import { carrierName, distanceMiles, formatMiles, formatRange } from '../utils/awardLogic.js'
import ProgramCard from '../components/ProgramCard.jsx'
import PoolingPanel from '../components/PoolingPanel.jsx'
import ComparePanel from '../components/ComparePanel.jsx'
import AirportsPanel from '../components/AirportsPanel.jsx'
import Tabs from '../components/Tabs.jsx'

const TABS = [
  { id: 'programs', label: 'Your programs' },
  { id: 'airports', label: 'By airport' },
  { id: 'pool', label: 'Pool card points' },
  { id: 'compare', label: 'Compare destinations' },
]

export default function ResultsPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const [tab, setTab] = useState('programs')

  const dest = AIRPORTS_BY_IATA[state.destination]
  const origins = tripOriginCodes(state)
    .map((c) => AIRPORTS_BY_IATA[c])
    .filter((a) => a && a.iata !== dest?.iata)
  if (origins.length === 0 || !dest) return <Navigate to="/trip" replace />

  const input = { ...state, origins, dest }
  const { entries, mult } = buildResults(input)
  const verdict = pickVerdict(entries)
  const byAirport = compareAirports(input)
  // The verdict's boarding pass departs from the airport its best option uses.
  const origin = AIRPORTS_BY_IATA[verdict?.top.best.origins[0]] ?? origins[0]
  const googleUrl = googleFlightsUrl({ origins, dest, cabin: state.cabin, roundTrip: state.roundTrip })
  const bookable = entries.filter((e) => e.best)
  const notBookable = entries.filter((e) => !e.best)
  const pooling = buildPooling({ bankPoints: state.bankPoints, entries, mult })
  const bestIds = new Set(verdict?.winners.map((w) => w.program.id) ?? [])
  const cabinName = CABIN_NAME[state.cabin]

  const tags = [
    ...(origins.length > 1 ? [`Compared from ${origins.map((o) => o.iata).join(' · ')}`] : []),
    `${distanceMiles(origin, dest).toLocaleString()} mi`,
    cabinName,
    state.roundTrip ? 'Round trip' : 'One-way',
    `${state.travellers} traveller${state.travellers > 1 ? 's' : ''}`,
  ]

  return (
    <div className="page">
      <Verdict verdict={verdict} cabinName={cabinName} mult={mult} origin={origin} dest={dest} tags={tags} googleUrl={googleUrl} originCount={origins.length} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix="results" label="Results" />

      <div role="tabpanel" id="results-panel-programs" aria-labelledby="results-tab-programs" hidden={tab !== 'programs'}>
        {bookable.length === 0 && (
          <p className="muted">
            None of your programs (or the programs your cards transfer to) can book {cabinName.toLowerCase()} on this
            route. Try another cabin, or add programs on <Link to="/profile">My points</Link>.
          </p>
        )}
        <div className="stack">
          {bookable.map((e) => (
            <ProgramCard key={e.program.id} entry={e} cabin={state.cabin} mult={mult} isBest={bestIds.has(e.program.id)} originCount={origins.length} />
          ))}
        </div>
        {notBookable.length > 0 && (
          <details className="also">
            <summary>
              {notBookable.length} program{notBookable.length > 1 ? 's' : ''} can’t book {cabinName.toLowerCase()} here
            </summary>
            <div className="stack">
              {notBookable.map((e) => (
                <ProgramCard key={e.program.id} entry={e} cabin={state.cabin} mult={mult} isBest={false} originCount={origins.length} />
              ))}
            </div>
          </details>
        )}
      </div>

      <div role="tabpanel" id="results-panel-airports" aria-labelledby="results-tab-airports" hidden={tab !== 'airports'}>
        <AirportsPanel rows={byAirport} dest={dest} cabin={state.cabin} roundTrip={state.roundTrip} mult={mult} />
      </div>

      <div role="tabpanel" id="results-panel-pool" aria-labelledby="results-tab-pool" hidden={tab !== 'pool'}>
        <PoolingPanel pooling={pooling} cabin={state.cabin} />
      </div>

      <div role="tabpanel" id="results-panel-compare" aria-labelledby="results-tab-compare" hidden={tab !== 'compare'}>
        <ComparePanel origins={origins} mainDest={dest} />
      </div>

      <p className="disclaimer">{PROGRAMS_META.disclaimer}</p>

      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            dispatch({ type: 'NEW_TRIP' })
            navigate('/trip')
          }}
        >
          Plan another trip
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            dispatch({ type: 'RESET' })
            navigate('/')
          }}
        >
          Start over{state.remember ? ' (erases saved points)' : ''}
        </button>
      </div>
    </div>
  )
}

/**
 * The answer, styled as a boarding pass: route in big airport codes, the
 * best program and price on the main part, coverage on the tear-off stub.
 */
function Verdict({ verdict, cabinName, mult, origin, dest, tags, googleUrl, originCount }) {
  const route = (
    <>
      <div className="pass__route">
        <div className="pass__code">
          {origin.iata}
          <span className="pass__city">{origin.city}</span>
        </div>
        <div className="pass__line" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" focusable="false">
            <path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-6z" />
          </svg>
        </div>
        <div className="pass__code pass__end">
          {dest.iata}
          <span className="pass__city">{dest.city}</span>
        </div>
      </div>
      <p className="sr-only">
        {origin.city} to {dest.city}
      </p>
      <div className="pass__meta">
        {tags.map((t) => (
          <span key={t} className="pass__tag">
            {t}
          </span>
        ))}
      </div>
    </>
  )

  if (!verdict) {
    return (
      <section className="pass pass--none">
        <div className="pass__main">
          {route}
          <h1>No good option in {cabinName.toLowerCase()}</h1>
          <p className="pass__text">
            None of the programs you hold or can transfer into realistically books this route in this cabin.
          </p>
          <a className="out" href={googleUrl} target="_blank" rel="noopener noreferrer">
            Check live cash fares on Google Flights →
          </a>
        </div>
        <div className="pass__stub">
          <span className="pass__stub-label">Status</span>
          <span className="pass__stub-value">—</span>
          <span className="fine">Try another cabin</span>
        </div>
      </section>
    )
  }
  const { top, winners } = verdict
  const names = winners.map((w) => w.program.name).join(' or ')
  const carriers = top.best.carriers.slice(0, 3).map(carrierName).join(', ')
  return (
    <section className={`pass ${top.covered ? 'pass--good' : 'pass--short'}`}>
      <div className="pass__main">
        {route}
        <p className="pass__label">Best fit</p>
        <h1>{names}</h1>
        <p className="pass__text">
          {cabinName} on {carriers}
          {top.best.carriers.length > 3 ? ' and others' : ''} for about{' '}
          <strong className="num">{formatRange(top.costLow, top.costHigh)}</strong> {top.program.currency}
          {mult > 1 ? ` (${mult} tickets)` : ' one-way'}.
        </p>
        <p className="pass__text">
          {top.covered ? (
            <>
              You can cover it with <span className="num">{formatMiles(top.pooled)}</span>
              {top.transferable > 0 && top.ownBalance > 0
                ? ` (${formatMiles(top.ownBalance)} held + ${formatMiles(top.transferable)} from cards)`
                : top.transferable > 0
                  ? ' by transferring card points'
                  : ' already in the account'}
              .
            </>
          ) : (
            <>
              You can pool <span className="num">{formatMiles(top.pooled)}</span>, short of the saver price.
            </>
          )}
          {!top.isMember && ' You’re not a member yet, but joining is free.'}
        </p>
        {top.cash && (
          <p className="pass__text">
            Paying cash instead: typically <strong className="num">{formatUsdRange(top.cash)}</strong>
            {mult > 1 ? ` for all ${mult} tickets` : ''}.{' '}
            {top.value && (
              <span className={`value value--${top.value.verdict}`}>
                ≈{top.value.cpp.toFixed(1)}¢ per point{' '}
                {top.value.verdict === 'miles'
                  ? '— a good use of points'
                  : top.value.verdict === 'cash'
                    ? '— cash is likely the better deal'
                    : '— about what these points are usually worth'}
              </span>
            )}
          </p>
        )}
        {originCount > 1 && top.best.origins.length < originCount && (
          <p className="pass__text">
            Best from <strong>{top.best.origins.join(' or ')}</strong>. See “By airport” for the others.
          </p>
        )}
        {winners.length > 1 && <p className="fine">These tie on price and fees.</p>}
        <a className="out" href={googleUrl} target="_blank" rel="noopener noreferrer">
          Check live cash fares on Google Flights →
        </a>
      </div>
      <div className="pass__stub">
        <span className="pass__stub-label">{top.covered ? 'Covered' : 'Still need'}</span>
        <span className="pass__stub-value num">{top.covered ? '✓' : formatMiles(top.shortfall)}</span>
        <span className="fine">{top.covered ? 'at the saver price' : `more ${top.program.currency}`}</span>
      </div>
    </section>
  )
}
