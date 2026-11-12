import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { AIRPORTS_BY_IATA, airportLabel } from '../data/airports.js'
import { CABIN_NAME, PROGRAMS_META } from '../data/programs.js'
import { buildResults, pickVerdict, buildPooling } from '../utils/resultsLogic.js'
import { carrierName, distanceMiles, formatMiles, formatRange } from '../utils/awardLogic.js'
import ProgramCard from '../components/ProgramCard.jsx'
import PoolingPanel from '../components/PoolingPanel.jsx'
import ComparePanel from '../components/ComparePanel.jsx'
import Tabs from '../components/Tabs.jsx'

const TABS = [
  { id: 'programs', label: 'Your programs' },
  { id: 'pool', label: 'Pool card points' },
  { id: 'compare', label: 'Compare destinations' },
]

export default function ResultsPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const [tab, setTab] = useState('programs')

  const origin = AIRPORTS_BY_IATA[state.origin || state.homeAirport]
  const dest = AIRPORTS_BY_IATA[state.destination]
  if (!origin || !dest) return <Navigate to="/trip" replace />

  const { entries, mult } = buildResults({ ...state, origin, dest })
  const verdict = pickVerdict(entries)
  const bookable = entries.filter((e) => e.best)
  const notBookable = entries.filter((e) => !e.best)
  const pooling = buildPooling({ bankPoints: state.bankPoints, entries, mult })
  const bestIds = new Set(verdict?.winners.map((w) => w.program.id) ?? [])
  const cabinName = CABIN_NAME[state.cabin]

  const tripLine = [
    `${airportLabel(origin)} → ${airportLabel(dest)}`,
    `${distanceMiles(origin, dest).toLocaleString()} mi`,
    cabinName,
    state.roundTrip ? 'round trip' : 'one-way',
    `${state.travellers} traveller${state.travellers > 1 ? 's' : ''}`,
  ].join(' · ')

  return (
    <div className="page">
      <p className="eyebrow">{tripLine}</p>
      <Verdict verdict={verdict} cabinName={cabinName} mult={mult} />

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
            <ProgramCard key={e.program.id} entry={e} cabin={state.cabin} mult={mult} isBest={bestIds.has(e.program.id)} />
          ))}
        </div>
        {notBookable.length > 0 && (
          <details className="also">
            <summary>
              {notBookable.length} program{notBookable.length > 1 ? 's' : ''} can’t book {cabinName.toLowerCase()} here
            </summary>
            <div className="stack">
              {notBookable.map((e) => (
                <ProgramCard key={e.program.id} entry={e} cabin={state.cabin} mult={mult} isBest={false} />
              ))}
            </div>
          </details>
        )}
      </div>

      <div role="tabpanel" id="results-panel-pool" aria-labelledby="results-tab-pool" hidden={tab !== 'pool'}>
        <PoolingPanel pooling={pooling} cabin={state.cabin} />
      </div>

      <div role="tabpanel" id="results-panel-compare" aria-labelledby="results-tab-compare" hidden={tab !== 'compare'}>
        <ComparePanel origin={origin} mainDest={dest} />
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

function Verdict({ verdict, cabinName, mult }) {
  if (!verdict) {
    return (
      <section className="verdict verdict--none">
        <h1>No good option in {cabinName.toLowerCase()}</h1>
        <p>None of the programs you hold or can transfer into realistically books this route in this cabin.</p>
      </section>
    )
  }
  const { top, winners } = verdict
  const names = winners.map((w) => w.program.name).join(' or ')
  const carriers = top.best.carriers.slice(0, 3).map(carrierName).join(', ')
  return (
    <section className={`verdict ${top.covered ? 'verdict--good' : 'verdict--short'}`}>
      <p className="verdict__label">Best fit</p>
      <h1>{names}</h1>
      <p className="verdict__line">
        {cabinName} on {carriers}
        {top.best.carriers.length > 3 ? ' and others' : ''} for about{' '}
        <strong className="num">{formatRange(top.costLow, top.costHigh)}</strong> {top.program.currency}
        {mult > 1 ? ` (${mult} tickets)` : ' one-way'}.
      </p>
      <p className="verdict__line">
        {top.covered ? (
          <>
            You can cover it: <span className="num">{formatMiles(top.pooled)}</span> available
            {top.transferable > 0 && top.ownBalance > 0
              ? ` (${formatMiles(top.ownBalance)} held + ${formatMiles(top.transferable)} from cards)`
              : top.transferable > 0
                ? ' by transferring card points'
                : ''}
            .
          </>
        ) : (
          <>
            You’d need <strong className="num">{formatMiles(top.shortfall)}</strong> more {top.program.currency} at the
            saver price (you can pool <span className="num">{formatMiles(top.pooled)}</span>).
          </>
        )}
        {!top.isMember && ' You’re not a member yet, but joining is free.'}
      </p>
      {winners.length > 1 && <p className="fine">These tie on price and fees.</p>}
    </section>
  )
}
