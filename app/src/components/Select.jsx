import { useCallback, useId, useRef, useState } from 'react'
import useDismiss from './useDismiss.js'
import './Controls.css'

/**
 * Themed dropdown replacing the native <select>, whose open menu can't be
 * styled. A button opens a listbox (WAI-ARIA "select-only combobox"):
 * Enter/Space/arrows open it, arrows/Home/End move, Enter picks, Escape or
 * an outside click closes, typing a letter jumps to the next match.
 *
 * options: [{ value, label, sub? }]. With `placeholder` and a value that
 * isn't an option (e.g. ''), the button shows the placeholder -- used for
 * "Add a program"-style pickers that act on choose and stay blank.
 */
export default function Select({ label, value, options, onChange, placeholder = 'Choose…', id: idProp }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const listId = `${id}-list`
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = options[selectedIndex]

  const close = useCallback(() => setOpen(false), [])
  useDismiss(wrapRef, open, close)

  const openList = () => {
    setActive(Math.max(0, selectedIndex))
    setOpen(true)
  }
  const choose = (i) => {
    const o = options[i]
    setOpen(false)
    buttonRef.current?.focus()
    if (o && o.value !== value) onChange(o.value)
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'ArrowDown') setActive((i) => Math.min(options.length - 1, i + 1))
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(0, i - 1))
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(options.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') choose(active)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
      if (e.key === 'Tab') return
    } else if (e.key.length === 1) {
      const k = e.key.toLowerCase()
      const n = options.length
      for (let step = 1; step <= n; step++) {
        const i = (active + step) % n
        if (String(options[i].label).toLowerCase().startsWith(k)) {
          setActive(i)
          break
        }
      }
    } else return
    e.preventDefault()
  }

  return (
    <div className="field">
      {label && (
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="ctl" ref={wrapRef}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          className={`ctl__button${selected ? '' : ' is-placeholder'}`}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span className="ctl__value">{selected ? selected.label : placeholder}</span>
          <Chevron />
        </button>
        {open && (
          <ul className="popover listbox" id={listId} role="listbox" aria-labelledby={label ? `${id}-label` : undefined}>
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={o.value === value}
                className={`listbox__opt${i === active ? ' is-active' : ''}`}
                onPointerDown={(e) => e.preventDefault()}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                <span className="listbox__label">
                  {o.label}
                  {o.sub && <span className="listbox__sub">{o.sub}</span>}
                </span>
                {o.value === value && <Check />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const Chevron = () => (
  <svg className="ctl__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const Check = () => (
  <svg className="listbox__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
