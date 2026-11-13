import { Link, useNavigate } from 'react-router-dom'
import { useOptimizer, tripOriginCodes } from '../context/OptimizerContext.jsx'
import { CABINS } from '../data/programs.js'
import { AIRPORTS_BY_IATA, REGIONS } from '../data/airports.js'
import { distanceMiles } from '../utils/geo.js'
import AirportInput from '../components/AirportInput.jsx'
import Select from '../components/Select.jsx'
import DateField from '../components/DateField.jsx'
import { todayIso, daysBetween, peakSeason, bookingWindow } from '../utils/dates.js'

const CABIN_ICON = { Y: '💺', W: '🛋️', J: '🥂', F: '✨' }
const CABIN_SUB = {
  Y: 'Cheapest in miles',
  W: 'More room, fewer awards',
  J: 'Lie-flat on long haul',
  F: 'Rare, top sweet spots',
}

export default function TripPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const set = (patch) => dispatch({ type: 'SET', patch })

  const selected = tripOriginCodes(state)
  // Tiles: every home airport plus any one-off airport added for this trip.
  const tiles = [...new Set([...state.homeAirports, ...selected])]
  const origins = selected.map((c) => AIRPORTS_BY_IATA[c]).filter((a) => a && a.iata !== state.destination)
  const dest = AIRPORTS_BY_IATA[state.destination]
  const ready = origins.length > 0 && dest

  const toggle = (code) =>
    set({ tripOrigins: selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code] })

  return (
    <div className="page page--narrow">
      <h1>Your trip</h1>

      <section className="section">
        {tiles.length > 0 && (
          <fieldset className="choice choice--airports">
            <legend>Flying from (we compare every one you tick)</legend>
            {tiles.map((code) => {
              const a = AIRPORTS_BY_IATA[code]
              const on = selected.includes(code)
              return (
                <label key={code} className={on ? 'is-on' : ''}>
                  <input type="checkbox" checked={on} onChange={() => toggle(code)} />
                  <span className="choice__code">{code}</span>
                  <span className="choice__sub">
                    {a.city}
                    {!state.homeAirports.includes(code) && ' · this trip only'}
                  </span>
                </label>
              )
            })}
          </fieldset>
        )}
        <AirportInput
          key={tiles.length}
          label={tiles.length ? 'Add another airport for this trip' : 'Flying from'}
          value=""
          exclude={state.destination}
          onChange={(iata) => iata && !selected.includes(iata) && set({ tripOrigins: [...selected, iata] })}
          hint={
            state.homeAirports.length
              ? 'One-off airports aren’t saved to your home airports.'
              : 'Tip: add home airports on “My points” so they show up here every time.'
          }
        />
        <AirportInput
          label="Flying to"
          value={state.destination}
          exclude={selected.length === 1 ? selected[0] : undefined}
          onChange={(iata) => set({ destination: iata })}
          hint={
            <>
              Not sure yet? <Link to="/explore">See everywhere your points can reach</Link>.
            </>
          }
        />
        {ready && (
          <p className="muted">
            About {distanceMiles(origins[0], dest).toLocaleString()} miles direct · {REGIONS[origins[0].region]} →{' '}
            {REGIONS[dest.region]}
          </p>
        )}
      </section>

      <section className="section">
        <h2 className="section__title">When</h2>
        <fieldset className="choice choice--compact">
          <legend className="sr-only">Trip type</legend>
          {[
            [false, 'One-way', '→'],
            [true, 'Round trip', '⇄'],
          ].map(([v, text, icon]) => (
            <label key={text} className={state.roundTrip === v ? 'is-on' : ''}>
              <input type="radio" name="trip" checked={state.roundTrip === v} onChange={() => set({ roundTrip: v })} />
              <span className="choice__icon" aria-hidden="true">
                {icon}
              </span>
              {text}
            </label>
          ))}
        </fieldset>
        <div className="dates">
          <DateField
            label="Depart"
            value={state.departDate}
            min={todayIso()}
            placeholder="Any date"
            onChange={(iso) => dispatch({ type: 'SET_DEPART', iso })}
          />
          {state.roundTrip && (
            <DateField
              label="Return"
              value={state.returnDate}
              min={state.departDate || todayIso()}
              rangeStart={state.departDate}
              placeholder="Any date"
              onChange={(iso) => set({ returnDate: iso })}
            />
          )}
        </div>
        <p className="field__hint">
          {dateNote(state, origins, dest) ||
            'Optional. Dates don’t change the typical prices, but they flag peak seasons and fill in the Google Flights search.'}
        </p>
      </section>

      <section className="section">
        <fieldset className="choice">
          <legend>Cabin you’re aiming for</legend>
          {CABINS.map((c) => (
            <label key={c.id} className={state.cabin === c.id ? 'is-on' : ''}>
              <input type="radio" name="cabin" value={c.id} checked={state.cabin === c.id} onChange={() => set({ cabin: c.id })} />
              <span className="choice__icon" aria-hidden="true">
                {CABIN_ICON[c.id]}
              </span>
              {c.name}
              <span className="choice__sub">{CABIN_SUB[c.id]}</span>
            </label>
          ))}
        </fieldset>


        <div className="field--inline">
          <Select label="Travellers" value={state.travellers} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: n === 1 ? '1 traveller' : `${n} travellers` }))} onChange={(v) => set({ travellers: v })} />
        </div>
      </section>

      <div className="actions">
        <button type="button" className="btn btn--primary" disabled={!ready} onClick={() => navigate('/results')}>
          Find the best program →
        </button>
        {!ready && <span className="muted">Pick at least one airport to fly from, and where you’re going.</span>}
      </div>
    </div>
  )
}

/** One line about the chosen dates: trip length, peak season, booking window. */
function dateNote(state, origins, dest) {
  if (!state.departDate) return ''
  const parts = []
  if (state.roundTrip && state.returnDate) {
    const n = daysBetween(state.departDate, state.returnDate)
    parts.push(`${n} night${n === 1 ? '' : 's'}.`)
  }
  const regions = [...origins.map((o) => o.region), dest?.region].filter(Boolean)
  const peak =
    peakSeason(state.departDate, regions) || (state.roundTrip && peakSeason(state.returnDate, regions))
  if (peak) parts.push(`${peak}: award prices usually sit at the high end of the range.`)
  parts.push(bookingWindow(state.departDate).text)
  return parts.join(' ')
}
