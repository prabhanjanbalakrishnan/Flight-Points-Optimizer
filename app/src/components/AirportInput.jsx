import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { AIRPORTS, AIRPORTS_BY_IATA, airportLabel } from '../data/airports.js'
import useDismiss from './useDismiss.js'
import './Controls.css'

const MAX_RESULTS = 8

// Lower-case, accents and apostrophes off ("Zürich" -> "zurich", "O'Hare" -> "ohare").
const fold = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ'’]/g, '')
    .toLowerCase()
const words = (t) => fold(t).split(/[^a-z0-9]+/).filter(Boolean)

// Words people add that don't narrow anything down ("Newark airport").
const FILLER = new Set(['airport', 'airports', 'international', 'intl', 'int', 'apt', 'the'])

// Searchable text per airport, built once.
const INDEX = AIRPORTS.map((a) => {
  const city = fold(a.city)
  const name = fold(a.name ?? '')
  return {
    a,
    code: a.iata.toLowerCase(),
    city,
    name,
    country: fold(a.country),
    tokens: new Set([...words(a.city), ...words(a.name ?? ''), ...a.aliases.flatMap(words), ...words(a.country)]),
    aliases: a.aliases.map(fold),
  }
})

/**
 * Airports matching the typed text, best first: exact code, code prefix,
 * city / name / alias prefix, every word matched (e.g. "newark liberty",
 * "new york kennedy"), country, then anything containing it.
 */
function search(text, exclude) {
  const q = fold(text).trim()
  const qWords = words(text).filter((w) => !FILLER.has(w))
  if (!q) return []
  const phrase = qWords.join(' ')
  const scored = []
  for (const x of INDEX) {
    if (x.a.iata === exclude) continue
    let score = null
    if (x.code === q) score = 0
    else if (q.length <= 3 && x.code.startsWith(q)) score = 1
    else if (phrase && (x.city.startsWith(phrase) || x.aliases.some((al) => al.startsWith(phrase)))) score = 2
    else if (phrase && x.name.startsWith(phrase)) score = 3
    else if (qWords.length && qWords.every((w) => [...x.tokens].some((t) => t.startsWith(w)))) score = x.country.startsWith(phrase) ? 5 : 4
    else if (phrase.length >= 3 && (x.city.includes(phrase) || x.name.includes(phrase))) score = 6
    if (score !== null) scored.push({ a: x.a, score })
  }
  return scored
    .sort((x, y) => x.score - y.score || x.a.city.localeCompare(y.a.city))
    .map((x) => x.a)
}

/**
 * Turns typed text into an IATA code: "Seoul (ICN)", "Tokyo (Haneda · HND)",
 * "icn", an exact city, or text that matches exactly one airport ("Newa",
 * "Heathrow"). '' when empty, null when it can't tell.
 */
function resolve(text, exclude) {
  const t = text.trim()
  if (!t) return ''
  const paren = t.match(/[(·\s]([A-Za-z]{3})\)\s*$/)
  const code = (paren ? paren[1] : t).toUpperCase()
  if (AIRPORTS_BY_IATA[code]) return code
  const byCity = AIRPORTS.filter((a) => fold(a.city) === fold(t))
  if (byCity.length === 1) return byCity[0].iata
  const found = search(t, exclude)
  return found.length === 1 ? found[0].iata : null
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
  // True while a press on the results list is in progress. Safari and touch
  // screens blur the input before the click lands; without this the blur
  // would close the list and reject the half-typed text, losing the pick.
  const pressingList = useRef(false)
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

  const results = open ? search(draft, exclude).slice(0, MAX_RESULTS) : []
  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapRef, open, close)

  // Our own reports go through here, so the "changed from outside" check
  // above doesn't mistake them for an external reset and wipe the draft.
  const report = (code) => {
    setLastValue(code)
    if (code !== value) onChange(code)
  }

  const pick = (a) => {
    pressingList.current = false
    setDraft(airportLabel(a))
    setError('')
    setOpen(false)
    report(a.iata)
  }

  const commitTyped = () => {
    const code = resolve(draft, exclude)
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
          : 'Pick an airport from the list (about 170 airports are covered).',
      )
    }
  }

  // The blur skipped during a list press is finished here if the press
  // didn't end in a pick (released off an option, or on "No match").
  const commitRef = useRef(commitTyped)
  useLayoutEffect(() => {
    commitRef.current = commitTyped
  })
  const startListPress = () => {
    pressingList.current = true
    window.addEventListener(
      'pointerup',
      () =>
        setTimeout(() => {
          if (!pressingList.current) return
          pressingList.current = false
          if (document.activeElement !== inputRef.current) {
            setOpen(false)
            commitRef.current()
          }
        }),
      { once: true },
    )
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
            if (pressingList.current) return
            setOpen(false)
            commitTyped()
          }}
        />
        {open && draft.trim() && (
          <ul
            className="popover listbox listbox--airports"
            id={listId}
            role="listbox"
            aria-label={`${label} results`}
            onPointerDown={startListPress}
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length === 0 ? (
              <li className="listbox__empty" role="presentation">
                No match among the ~170 airports covered.
              </li>
            ) : (
              results.map((a, i) => (
                <li
                  key={a.iata}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`listbox__opt${i === active ? ' is-active' : ''}`}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(a)}
                >
                  <span className="listbox__code">{a.iata}</span>
                  <span className="listbox__label">
                    {a.city}
                    <span className="listbox__sub">
                      {a.name && a.name !== a.city ? `${a.name} · ` : ''}
                      {a.country}
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
