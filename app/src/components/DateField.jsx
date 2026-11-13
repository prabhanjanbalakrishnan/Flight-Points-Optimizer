import { useCallback, useEffect, useId, useRef, useState } from 'react'
import useDismiss from './useDismiss.js'
import { Chevron } from './Select.jsx'
import './Controls.css'
import { toIso, fromIso, todayIso, addDays, addMonths, formatDate } from '../utils/dates.js'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/**
 * Themed date picker: a button showing the date opens a month calendar.
 * Arrow keys move by day/week, PageUp/PageDown by month, Enter picks,
 * Escape closes. Days before `min` are disabled. `rangeStart` shades the
 * span from it to the hovered/picked day, for a return date.
 */
export default function DateField({ label, value, onChange, min, rangeStart, placeholder = 'Pick a date', hint }) {
  const id = useId()
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const gridRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [focusIso, setFocusIso] = useState(value || min || todayIso())
  const [month, setMonth] = useState(() => fromIso(value || min || todayIso()))

  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapRef, open, close)

  const openCal = () => {
    const start = value || (min && min > todayIso() ? min : todayIso())
    setFocusIso(start)
    setMonth(fromIso(start))
    setOpen(true)
  }

  // Keep keyboard focus on the focused day while the calendar is open.
  useEffect(() => {
    if (open) gridRef.current?.querySelector(`[data-iso="${focusIso}"]`)?.focus()
  }, [open, focusIso, month])

  const disabled = (iso) => !!min && iso < min
  const pick = (iso) => {
    if (disabled(iso)) return
    onChange(iso)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const moveFocus = (d) => {
    const iso = toIso(d)
    setFocusIso(iso)
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    }
  }

  const onGridKey = (e) => {
    const f = fromIso(focusIso)
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (moves[e.key] !== undefined) moveFocus(addDays(f, moves[e.key]))
    else if (e.key === 'PageUp') moveFocus(new Date(f.getFullYear(), f.getMonth() - 1, Math.min(f.getDate(), 28)))
    else if (e.key === 'PageDown') moveFocus(new Date(f.getFullYear(), f.getMonth() + 1, Math.min(f.getDate(), 28)))
    else if (e.key === 'Enter' || e.key === ' ') pick(focusIso)
    else if (e.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    } else return
    e.preventDefault()
  }

  // Six-week grid starting on the Sunday on/before the 1st.
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = addDays(first, -first.getDay())
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const today = todayIso()
  const canGoBack = !min || toIso(addDays(first, -1)) >= min

  return (
    <div className="field">
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <div className="ctl" ref={wrapRef}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          className={`ctl__button${value ? '' : ' is-placeholder'}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openCal())}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !open) {
              e.preventDefault()
              openCal()
            }
          }}
        >
          <span className="ctl__icon ctl__icon--static" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3.5" y="5" width="17" height="15" rx="3" />
              <path d="M3.5 10h17M8 3v4M16 3v4" />
            </svg>
          </span>
          <span className="ctl__value">{value ? formatDate(value) : placeholder}</span>
          <Chevron />
        </button>
        {open && (
          <div className="popover cal" role="dialog" aria-modal="false" aria-labelledby={`${id}-label`}>
            <div className="cal__head">
              <button
                type="button"
                className="cal__nav"
                onClick={() => setMonth(addMonths(month, -1))}
                disabled={!canGoBack}
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="cal__title" aria-live="polite">
                {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" className="cal__nav" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
                ›
              </button>
            </div>
            <div className="cal__grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
              <div className="cal__row" role="row">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="cal__dow" role="columnheader">
                    {w}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, r) => (
                <div className="cal__row" role="row" key={r}>
                  {days.slice(r * 7, r * 7 + 7).map((d) => {
                    const iso = toIso(d)
                    const outside = d.getMonth() !== month.getMonth()
                    const inRange = rangeStart && value && iso > rangeStart && iso < value
                    const cls = [
                      'cal__day',
                      outside && 'is-outside',
                      iso === value && 'is-selected',
                      iso === rangeStart && 'is-start',
                      inRange && 'is-range',
                      iso === today && 'is-today',
                    ]
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <span role="gridcell" key={iso} aria-selected={iso === value}>
                        <button
                          type="button"
                          className={cls}
                          data-iso={iso}
                          tabIndex={iso === focusIso ? 0 : -1}
                          disabled={disabled(iso)}
                          aria-label={formatDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          onClick={() => pick(iso)}
                        >
                          {d.getDate()}
                        </button>
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="cal__foot">
              {value ? (
                <button
                  type="button"
                  className="cal__link"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                    buttonRef.current?.focus()
                  }}
                >
                  Clear date
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="cal__link" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}
