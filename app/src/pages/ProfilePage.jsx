import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { PROGRAMS, PROGRAMS_BY_ID } from '../data/programs.js'
import { CARDS, CARDS_BY_ID } from '../data/cards.js'
import { AIRLINES } from '../data/airlines.js'
import AirportInput from '../components/AirportInput.jsx'
import { AIRPORTS_BY_IATA, airportLabel } from '../data/airports.js'
import { MAX_HOME_AIRPORTS } from '../utils/persistence.js'
import RememberToggle from '../components/RememberToggle.jsx'
import BalanceInput from '../components/BalanceInput.jsx'
import Select from '../components/Select.jsx'

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
        <h2>Home airports</h2>
        <p className="muted">
          Add every airport you’d realistically fly from. Each trip compares all of them, so you can see if one is
          cheaper.
        </p>
        {state.homeAirports.length > 0 && (
          <ul className="chips" aria-label="Your home airports">
            {state.homeAirports.map((code) => (
              <li key={code} className="chip">
                <span>{airportLabel(AIRPORTS_BY_IATA[code])}</span>
                <button
                  type="button"
                  className="chip__remove"
                  onClick={() => dispatch({ type: 'REMOVE_HOME_AIRPORT', iata: code })}
                  aria-label={`Remove ${code}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {state.homeAirports.length < MAX_HOME_AIRPORTS ? (
          <AirportInput
            key={state.homeAirports.length}
            label={state.homeAirports.length ? 'Add another home airport' : 'Where you usually fly from'}
            value=""
            onChange={(iata) => iata && dispatch({ type: 'ADD_HOME_AIRPORT', iata })}
            hint="E.g. Newark, JFK and LaGuardia if you live near New York."
          />
        ) : (
          <p className="muted">That’s the maximum of {MAX_HOME_AIRPORTS} home airports.</p>
        )}
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
                  <Select
                    label="Elite status"
                    value={m.tier ?? ''}
                    options={[
                      { value: '', label: 'No status' },
                      ...p.eliteTiers.map((t) => ({ value: t.name, label: t.name, sub: t.qualification })),
                    ]}
                    onChange={(v) => dispatch({ type: 'UPDATE_MEMBERSHIP', id: m.id, patch: { tier: v || null } })}
                  />
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
  if (options.length === 0) return null
  return (
    <div className="field--inline">
      <Select label={label} value="" options={options} onChange={(v) => v && onAdd(v)} />
    </div>
  )
}
