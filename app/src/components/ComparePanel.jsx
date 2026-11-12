import { useOptimizer, MAX_COMPARE } from '../context/OptimizerContext.jsx'
import { AIRPORTS_BY_IATA, airportLabel } from '../data/airports.js'
import { CABIN_NAME } from '../data/programs.js'
import { buildResults, pickVerdict } from '../utils/resultsLogic.js'
import { carrierName, formatRange, formatMiles } from '../utils/awardLogic.js'
import AirportInput from './AirportInput.jsx'

/** Side-by-side: the best program for the main destination and up to three others. */
export default function ComparePanel({ origin, mainDest }) {
  const { state, dispatch } = useOptimizer()
  const dests = [mainDest.iata, ...state.compareTo]

  // Cheap to compute (15 programs x a few airports), so no memoisation.
  const rows = dests.map((iata) => {
    const dest = AIRPORTS_BY_IATA[iata]
    const { entries } = buildResults({ ...state, origin, dest })
    return { dest, verdict: pickVerdict(entries) }
  })

  return (
    <div className="stack">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Destination</th>
            <th scope="col">Best program ({CABIN_NAME[state.cabin].toLowerCase()})</th>
            <th scope="col">Typical</th>
            <th scope="col">Your points</th>
            <th scope="col">
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ dest, verdict }, i) => {
            const top = verdict?.top
            return (
              <tr key={dest.iata} className={i === 0 ? 'is-current' : ''}>
                <td>{airportLabel(dest)}</td>
                <td>
                  {top ? (
                    <>
                      {verdict.winners.map((w) => w.program.name).join(' / ')}
                      <span className="table__note">on {top.best.carriers.slice(0, 3).map(carrierName).join(', ')}</span>
                    </>
                  ) : (
                    'No program you can reach books this'
                  )}
                </td>
                <td className="num">{top ? formatRange(top.costLow, top.costHigh) : '—'}</td>
                <td className={top ? (top.covered ? 'good' : 'warn') : ''}>
                  {top ? (top.covered ? 'Covered' : `${formatMiles(top.shortfall)} short`) : '—'}
                </td>
                <td>
                  {i > 0 && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      onClick={() => dispatch({ type: 'REMOVE_COMPARE', iata: dest.iata })}
                      aria-label={`Remove ${dest.city}`}
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {state.compareTo.length < MAX_COMPARE ? (
        <AddCompare key={state.compareTo.length} exclude={origin.iata} onAdd={(iata) => dispatch({ type: 'ADD_COMPARE', iata })} />
      ) : (
        <p className="muted">That’s the maximum of {MAX_COMPARE} extra destinations.</p>
      )}
    </div>
  )
}

// Keyed by count in the parent, so it remounts blank after each add.
function AddCompare({ exclude, onAdd }) {
  return <AirportInput label="Compare with another destination" value="" exclude={exclude} onChange={(iata) => iata && onAdd(iata)} />
}
