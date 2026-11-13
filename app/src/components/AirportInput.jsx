import { useCallback, useId, useRef, useState } from 'react'
import { AIRPORTS, AIRPORTS_BY_IATA, REGIONS, airportLabel } from '../data/airports.js'
import useDismiss from './useDismiss.js'
import './Controls.css'

const MAX_RESULTS = 8

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

/** Airports matching the typed text, best first: exact code, code prefix, city prefix, then anything containing it. */
function search(text, exclude) {
  const q = text.trim().toLowerCase()
  if (!q) return []
  const scored = []
  for (const a of AIRPORTS) {
    if (a.iata === exclude) continue
    const code = a.iata.toLowerCase()
    const city = a.city.toLowerCase()
    let score = null
    if (code === q) score = 0
    else if (code.startsWith(q)) score = 1
    else if (city.startsWith(q)) score = 2
    else if (city.split(/[\s(–-]+/).some((w) => w.startsWith(q))) score = 3
    else if (a.country.toLowerCase().startsWith(q)) score = 4
    else if (city.includes(q)) score = 5
    if (score !== null) scored.push({ a, score })
  }
  return scored
    .sort((x, y) => x.score - y.score || x.a.city.localeCompare(y.a.city))
    .slice(0, MAX_RESULTS)
    .map((x) => x.a)
}

/**
 * Airport field: type a city, code or country and pick from a themed results
 * list (WAI-ARIA combobox with listbox popup; arrows, Enter, Escape). Keeps
 * its own draft text so half-typed input isn't wiped, and reports a value
 * only when an airport is picked, Enter is pressed, or the field is left
 * with text that resolves to one -- or '' when cleared.
 */
export default function AirportInput({ label, value, onChange, hint, exclude }) {
  const id = useId()
  const listId = `${id}-list`
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const [draft, setDraft] = useState(() => airportLabel(AIRPORTS_BY_IATA[value]))
  const [error, setError] = useState('')
  const [lastValue, setLastValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  // Adjust the draft during render when the value changes from outside
  // (e.g. "New trip" clears it), rather than in an effect.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(airportLabel(AIRPORTS_BY_IATA[value]))
    setError('')
  }

  const results = open ? search(draft, exclude) : []
  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapRef, open, close)

  // Our own reports go through here, so the "changed from outside" check
  // above doesn't mistake them for an external reset and wipe the draft.
  const report = (code) => {
    setLastValue(code)
    if (code !== value) onChange(code)
  }

  const pick = (a) => {
    setDraft(airportLabel(a))
    setError('')
    setOpen(false)
    report(a.iata)
  }

  const commitTyped = () => {
    const code = resolve(draft)
    if (code === '') {
      setError('')
      report('')
    } else if (code && code !== exclude) {
      setError('')
      setDraft(airportLabel(AIRPORTS_BY_IATA[code]))
      report(code)
    } else {
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

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setActive((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault()
        pick(results[active])
      } else {
        commitTyped()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="ctl" ref={wrapRef}>
        <span className="ctl__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.2-4.2" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id={id}
          className="ctl__input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined}
          aria-invalid={!!error}
          value={draft}
          placeholder="City, airport code or country, e.g. Seoul or ICN"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setDraft(e.target.value)
            setActive(0)
            setOpen(true)
            setError('')
          }}
          onFocus={() => draft && setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            setOpen(false)
            commitTyped()
          }}
        />
        {open && draft.trim() && (
          <ul className="popover listbox listbox--airports" id={listId} role="listbox" aria-label={`${label} results`}>
            {results.length === 0 ? (
              <li className="listbox__empty" role="presentation">
                No match among the ~140 airports covered.
              </li>
            ) : (
              results.map((a, i) => (
                <li
                  key={a.iata}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`listbox__opt${i === active ? ' is-active' : ''}`}
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(a)}
                >
                  <span className="listbox__code">{a.iata}</span>
                  <span className="listbox__label">
                    {a.city}
                    <span className="listbox__sub">
                      {a.country} · {REGIONS[a.region]}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}
