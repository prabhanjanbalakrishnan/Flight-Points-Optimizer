import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { CABINS } from '../data/programs.js'
import { AIRPORTS_BY_IATA, REGIONS } from '../data/airports.js'
import { distanceMiles } from '../utils/geo.js'
import AirportInput from '../components/AirportInput.jsx'

export default function TripPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const set = (patch) => dispatch({ type: 'SET', patch })

  const originCode = state.origin || state.homeAirport
  const origin = AIRPORTS_BY_IATA[originCode]
  const dest = AIRPORTS_BY_IATA[state.destination]
  const ready = origin && dest && origin.iata !== dest.iata

  return (
    <div className="page page--narrow">
      <h1>Your trip</h1>

      <section className="section">
        <AirportInput
          label="Flying from"
          value={originCode}
          exclude={state.destination}
          onChange={(iata) => set({ origin: iata === state.homeAirport ? '' : iata })}
          hint={
            state.homeAirport
              ? state.origin
                ? 'Just for this trip. Your saved home airport isn’t changed.'
                : 'Your home airport. Change it here for just this trip.'
              : 'Tip: set a home airport on “My points” to skip this next time.'
          }
        />
        <AirportInput
          label="Flying to"
          value={state.destination}
          exclude={originCode}
          onChange={(iata) => set({ destination: iata })}
        />
        {ready && (
          <p className="muted">
            {distanceMiles(origin, dest).toLocaleString()} miles direct · {REGIONS[origin.region]} →{' '}
            {REGIONS[dest.region]}
          </p>
        )}
      </section>

      <section className="section">
        <fieldset className="choice">
          <legend>Cabin you’re aiming for</legend>
          {CABINS.map((c) => (
            <label key={c.id} className={state.cabin === c.id ? 'is-on' : ''}>
              <input type="radio" name="cabin" value={c.id} checked={state.cabin === c.id} onChange={() => set({ cabin: c.id })} />
              {c.name}
            </label>
          ))}
        </fieldset>

        <fieldset className="choice">
          <legend>Trip type</legend>
          {[
            [false, 'One-way'],
            [true, 'Round trip'],
          ].map(([v, text]) => (
            <label key={text} className={state.roundTrip === v ? 'is-on' : ''}>
              <input type="radio" name="trip" checked={state.roundTrip === v} onChange={() => set({ roundTrip: v })} />
              {text}
            </label>
          ))}
        </fieldset>

        <div className="field field--inline">
          <label htmlFor="travellers">Travellers</label>
          <select id="travellers" value={state.travellers} onChange={(e) => set({ travellers: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="actions">
        <button type="button" className="btn btn--primary" disabled={!ready} onClick={() => navigate('/results')}>
          Find the best program →
        </button>
        {!ready && <span className="muted">Pick where you’re flying from and to.</span>}
      </div>
    </div>
  )
}
