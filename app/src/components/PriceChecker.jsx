import { useId, useState } from 'react'
import { judgeRedemption } from '../utils/resultsLogic.js'

const num = (s) => {
  const n = Number(String(s).replace(/[,\s$]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

const VERDICT_TEXT = {
  miles: 'Use points — this beats the program’s typical value.',
  cash: 'Pay cash — the points are worth more elsewhere.',
  close: 'Close call — either is reasonable.',
}

/** Paste in a real cash fare and award price you found; get cents per mile. */
export default function PriceChecker({ program }) {
  const id = useId()
  const [cash, setCash] = useState('')
  const [miles, setMiles] = useState('')
  const [taxes, setTaxes] = useState('')
  const result = judgeRedemption({
    cash: num(cash),
    miles: num(miles),
    taxes: num(taxes),
    valuePerMile: program.valuePerMile,
  })

  return (
    <div className="checker">
      <p className="muted">
        Found a real flight? Enter the cash fare and the award price from {program.name.split(' (')[0]}’s site
        (USD).
      </p>
      <div className="row__fields">
        <div className="field">
          <label htmlFor={`${id}-cash`}>Cash fare ($)</label>
          <input id={`${id}-cash`} inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="e.g. 4200" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-miles`}>Award price ({program.currency})</label>
          <input id={`${id}-miles`} inputMode="numeric" value={miles} onChange={(e) => setMiles(e.target.value)} placeholder="e.g. 75000" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-taxes`}>Award taxes ($)</label>
          <input id={`${id}-taxes`} inputMode="decimal" value={taxes} onChange={(e) => setTaxes(e.target.value)} placeholder="e.g. 85" />
        </div>
      </div>
      {result && (
        <p className={`verdict-line verdict-line--${result.verdict}`} aria-live="polite">
          <span className="num">{result.cpm.toFixed(2)}¢</span> per {program.currency === 'Avios' ? 'Avios' : 'point'} vs.
          about {program.valuePerMile}¢ typical. {VERDICT_TEXT[result.verdict]}
        </p>
      )}
    </div>
  )
}
