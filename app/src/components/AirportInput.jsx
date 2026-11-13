import { useId, useState } from 'react'
import { AIRPORTS, AIRPORTS_BY_IATA, REGIONS, airportLabel } from '../data/airports.js'

/** Turns typed text into an IATA code: "Seoul (ICN)", "Tokyo (Haneda · HND)", "icn", or an exact city name. */
function resolve(text) {
  const t = text.trim()
  if (!t) return ''
  const paren = t.match(/[(·\s]([A-Za-z]{3})\)\s*$/)
  const code = (paren ? paren[1] : t).toUpperCase()
  if (AIRPORTS_BY_IATA[code]) return code
  const byCity = AIRPORTS.filter((a) => a.city.toLowerCase() === t.toLowerCase())
  return byCity.length === 1 ? byCity[0].iata : null
}

/**
 * Airport field: type a city or IATA code and pick from the browser's
 * suggestion list. Keeps its own draft text (so half-typed input isn't
 * wiped) and only reports a value once it resolves to a known airport, or
 * '' when cleared.
 */
export default function AirportInput({ label, value, onChange, hint, exclude }) {
  const id = useId()
  const listId = `${id}-list`
  const [draft, setDraft] = useState(() => airportLabel(AIRPORTS_BY_IATA[value]))
  const [error, setError] = useState('')
  const [lastValue, setLastValue] = useState(value)

  // Adjust the draft during render when the value changes from outside
  // (e.g. "New trip" clears it), rather than in an effect.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(airportLabel(AIRPORTS_BY_IATA[value]))
    setError('')
  }

  // Our own reports go through here, so the "changed from outside" check
  // above doesn't mistake them for an external reset and wipe the draft.
  const report = (code) => {
    setLastValue(code)
    if (code !== value) onChange(code)
  }

  const commit = (text, final) => {
    const code = resolve(text)
    if (code === '') {
      setError('')
      report('')
    } else if (code && code !== exclude) {
      setError('')
      report(code)
    } else if (final) {
      // Keep what they typed on screen, but don't let a stale airport
      // silently stand in for it.
      report('')
      setError(
        code && code === exclude
          ? 'Pick a different airport from the other field.'
          : 'Pick an airport from the list (about 140 major airports are covered).',
      )
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        list={listId}
        value={draft}
        placeholder="City or airport code, e.g. Seoul or ICN"
        autoComplete="off"
        aria-invalid={!!error}
        onChange={(e) => {
          setDraft(e.target.value)
          commit(e.target.value, false)
        }}
        onBlur={(e) => {
          commit(e.target.value, true)
          const code = resolve(e.target.value)
          if (code) setDraft(airportLabel(AIRPORTS_BY_IATA[code]))
        }}
      />
      <datalist id={listId}>
        {AIRPORTS.map((a) => (
          <option key={a.iata} value={airportLabel(a)}>
            {a.country} · {REGIONS[a.region]}
          </option>
        ))}
      </datalist>
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}
