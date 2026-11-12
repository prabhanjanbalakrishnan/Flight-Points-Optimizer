import { useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { PROGRAMS, PROGRAMS_BY_ID } from '../data/programs.js'
import { CARDS, CARDS_BY_ID } from '../data/cards.js'
import { AIRLINES } from '../data/airlines.js'
import AirportInput from '../components/AirportInput.jsx'
import RememberToggle from '../components/RememberToggle.jsx'
import BalanceInput from '../components/BalanceInput.jsx'

export default function ProfilePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const heldPrograms = new Set(state.memberships.map((m) => m.programId))
  const heldCards = new Set(state.bankPoints.map((b) => b.cardId))
  const canContinue = state.memberships.length > 0 || state.bankPoints.length > 0

  return (
    <div className="page page--narrow">
      <h1>Your points</h1>
      <p className="lede">Everything here is optional. Leave a balance blank if you don’t know it.</p>

      <section className="section">
        <h2>Home airport</h2>
        <AirportInput
          label="Where you usually fly from"
          value={state.homeAirport}
          onChange={(iata) => dispatch({ type: 'SET', patch: { homeAirport: iata } })}
          hint="Award prices depend on where you start. You can change it for any single trip."
        />
      </section>

      <section className="section">
        <h2>Airline programs</h2>
        {state.memberships.length === 0 && <p className="muted">No programs added yet.</p>}
        <ul className="rows">
          {state.memberships.map((m) => {
            const p = PROGRAMS_BY_ID[m.programId]
            return (
              <li key={m.id} className="row" style={{ '--accent-row': p.accentColor }}>
                <div className="row__head">
                  <strong>{p.name}</strong>
                  <span className="muted">{p.alliance ?? 'No alliance'}</span>
                </div>
                <div className="row__fields">
                  <BalanceInput
                    label={`Balance (${p.currency})`}
                    value={m.balance}
                    onChange={(balance) => dispatch({ type: 'UPDATE_MEMBERSHIP', id: m.id, patch: { balance } })}
                  />
                  <div className="field">
                    <label htmlFor={`tier-${m.id}`}>Elite status</label>
                    <select
                      id={`tier-${m.id}`}
                      value={m.tier ?? ''}
                      onChange={(e) =>
                        dispatch({ type: 'UPDATE_MEMBERSHIP', id: m.id, patch: { tier: e.target.value || null } })
                      }
                    >
                      <option value="">No status</option>
                      {p.eliteTiers.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => dispatch({ type: 'REMOVE_MEMBERSHIP', id: m.id })}
                    aria-label={`Remove ${p.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <AddSelect
          label="Add a program"
          options={PROGRAMS.filter((p) => !heldPrograms.has(p.id)).map((p) => ({
            value: p.id,
            label: `${p.name} (${AIRLINES[p.airline].name})`,
          }))}
          onAdd={(programId) => dispatch({ type: 'ADD_MEMBERSHIP', programId })}
        />
      </section>

      <section className="section">
        <h2>Credit card points</h2>
        <p className="muted">
          Transferable points you can move into airline programs. You don’t need to belong to a program already:
          results include programs your cards can reach, since joining is free.
        </p>
        <ul className="rows">
          {state.bankPoints.map((b) => {
            const c = CARDS_BY_ID[b.cardId]
            return (
              <li key={b.id} className="row">
                <div className="row__head">
                  <strong>{c.name}</strong>
                  <span className="muted">{c.examples}</span>
                </div>
                <div className="row__fields">
                  <BalanceInput
                    label="Points"
                    value={b.balance}
                    onChange={(balance) => dispatch({ type: 'UPDATE_BANK_POINTS', id: b.id, patch: { balance } })}
                  />
                  <p className="row__note">
                    Transfers to{' '}
                    {Object.entries(c.transfers)
                      .map(([id, r]) => `${PROGRAMS_BY_ID[id].name.split(' (')[0]}${r !== 1 ? ` (1:${r})` : ''}`)
                      .join(', ')}
                    {c.verify && ' — single source, check with your bank'}
                  </p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => dispatch({ type: 'REMOVE_BANK_POINTS', id: b.id })}
                    aria-label={`Remove ${c.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <AddSelect
          label="Add card points"
          options={CARDS.filter((c) => !heldCards.has(c.id)).map((c) => ({
            value: c.id,
            label: `${c.name}${c.group === 'India' ? ' (India)' : ''}`,
          }))}
          onAdd={(cardId) => dispatch({ type: 'ADD_BANK_POINTS', cardId })}
        />
      </section>

      <RememberToggle checked={state.remember} onChange={(value) => dispatch({ type: 'SET', patch: { remember: value } })} />

      <div className="actions">
        <button type="button" className="btn btn--primary" disabled={!canContinue} onClick={() => navigate('/trip')}>
          Next: your trip →
        </button>
        {!canContinue && <span className="muted">Add at least one program or card.</span>}
      </div>
    </div>
  )
}

function AddSelect({ label, options, onAdd }) {
  const id = useId()
  if (options.length === 0) return null
  return (
    <div className="field field--inline">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value=""
        onChange={(e) => {
          if (e.target.value) onAdd(e.target.value)
        }}
      >
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
