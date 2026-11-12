import { useId, useState } from 'react'
import parseBalance from '../utils/parseBalance.js'

/**
 * Whole-number balance field. Keeps its own text so typing "50,000" or
 * clearing the field mid-edit isn't fought by the parent; reports a number
 * (or null for blank/invalid) on every change.
 */
export default function BalanceInput({ label, value, onChange }) {
  const id = useId()
  const [draft, setDraft] = useState(value == null ? '' : value.toLocaleString('en-US'))

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="e.g. 50000"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(parseBalance(e.target.value.replace(/[,\s_]/g, '')))
        }}
        onBlur={() => setDraft(value == null ? '' : value.toLocaleString('en-US'))}
      />
    </div>
  )
}
