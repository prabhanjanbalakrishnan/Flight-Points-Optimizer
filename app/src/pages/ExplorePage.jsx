import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOptimizer, tripOriginCodes } from '../context/OptimizerContext.jsx'
import { AIRPORTS_BY_IATA, REGIONS } from '../data/airports.js'
import { CABINS, CABIN_NAME, PROGRAMS_BY_ID } from '../data/programs.js'
import { CARDS_BY_ID } from '../data/cards.js'
import { exploreDestinations, SORTS } from '../utils/exploreLogic.js'
import Select from '../components/Select.jsx'
import { carrierName, formatMiles } from '../utils/awardLogic.js'
import { formatUsdRange } from '../utils/links.js'

/**
 * "Where can my points take me?" Every destination in the app, priced from
 * the user's airports in their chosen cabin, split into reachable now and
 * just out of reach, grouped by region. Picking one opens the full Results.
 */
// Asia is three award regions (charts price them differently); "All of
// Asia" selects the three together.
const ASIA = ['NAS', 'SEA', 'SAS']
const PILL_ORDER = ['NA', 'CAR', 'SA', 'EU', 'ME', 'AF', 'ASIA', 'NAS', 'SEA', 'SAS', 'OC']

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  // Empty set = everywhere; otherwise any mix of regions.
  const [regions, setRegions] = useState(() => new Set())
  const [sort, setSort] = useState('points')
  const [directOnly, setDirectOnly] = useState(false)
  const set = (patch) => dispatch({ type: 'SET', patch })

  const origins = tripOriginCodes(state)
    .map((c) => AIRPORTS_BY_IATA[c])
    .filter(Boolean)
  const hasPoints = state.memberships.some((m) => m.balance > 0) || state.bankPoints.some((b) => b.balance > 0)

  if (origins.length === 0 || !hasPoints) {
    return (
      <div className="page page--narrow">
        <h1>Explore</h1>
        <p className="lede">
          See every destination your points can reach. First add at least one home airport and a points balance on{' '}
          <Link to="/profile">My points</Link>, or try the example on the <Link to="/">home page</Link>.
        </p>
      </div>
    )
  }

  // Cheap enough (~20 ms for every destination) to recompute on each render.
  const { reachable, close } = exploreDestinations({ ...state, origins, directOnly })
  const inRegion = (x) => regions.size === 0 || regions.has(x.dest.region)
  const toggleRegion = (r) =>
    setRegions((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      return next
    })
  const regionNames = (
    ASIA.every((r) => regions.has(r))
      ? [...[...regions].filter((r) => !ASIA.includes(r)).map((r) => REGIONS[r]), 'Asia']
      : [...regions].map((r) => REGIONS[r])
  ).join(', ')
  const shown = reachable.filter(inRegion).sort(SORTS[sort].fn)
  const almost = close.filter(inRegion).sort((a, b) => a.shortfall - b.shortfall)
  // Every region is always listed (with its count) so none silently vanish.
  const countIn = (codes) => [...reachable, ...close].filter((x) => codes.includes(x.dest.region)).length
  const allAsia = ASIA.every((r) => regions.has(r))
  const toggleAsia = () =>
    setRegions((prev) => {
      const next = new Set(prev)
      ASIA.forEach((r) => (allAsia ? next.delete(r) : next.add(r)))
      return next
    })

  const open = (iata) => {
    set({ destination: iata })
    navigate('/results')
  }

  return (
    <div className="page">
      <p className="eyebrow">From {origins.map((o) => o.iata).join(' · ')}</p>
      <h1>Where can your points take you?</h1>
      <p className="lede">
        Every destination your miles and card points can cover in {CABIN_NAME[state.cabin].toLowerCase()}
        {state.roundTrip ? ', round trip' : ', one-way'}
        {state.travellers > 1 ? ` for ${state.travellers} travellers` : ''}, at the typical saver price.
      </p>

      <YourPoints memberships={state.memberships} bankPoints={state.bankPoints} />

      <section className="section explore-filters">
        <fieldset className="choice choice--compact">
          <legend>Cabin</legend>
          {CABINS.map((c) => (
            <label key={c.id} className={state.cabin === c.id ? 'is-on' : ''}>
              <input type="radio" name="explore-cabin" checked={state.cabin === c.id} onChange={() => set({ cabin: c.id })} />
              {c.name}
            </label>
          ))}
        </fieldset>
        <div className="explore-filters__row">
          <Select
            label="Trip"
            value={state.roundTrip ? 'rt' : 'ow'}
            options={[
              { value: 'ow', label: 'One-way' },
              { value: 'rt', label: 'Round trip' },
            ]}
            onChange={(v) => set({ roundTrip: v === 'rt' })}
          />
          <Select label="Travellers" value={state.travellers} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: n === 1 ? '1 traveller' : `${n} travellers` }))} onChange={(v) => set({ travellers: v })} />
          <Select
            label="Sort by"
            value={sort}
            options={Object.entries(SORTS).map(([id, x]) => ({ value: id, label: x.label }))}
            onChange={setSort}
          />
          <label className="check">
            <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
            Avoid long detours
            <span className="choice__sub">Only airlines based at either end, no third-country hub</span>
          </label>
        </div>
        <p className="filter-label" id="region-label">
          Regions <span className="muted">(pick as many as you like)</span>
        </p>
        <div className="region-pills" role="group" aria-labelledby="region-label">
          <button
            type="button"
            className={`pill${regions.size === 0 ? ' is-on' : ''}`}
            aria-pressed={regions.size === 0}
            onClick={() => setRegions(new Set())}
          >
            Everywhere
          </button>
          {PILL_ORDER.map((r) =>
            r === 'ASIA' ? (
              <button
                key="asia"
                type="button"
                className={`pill pill--group${allAsia ? ' is-on' : ''}${countIn(ASIA) === 0 ? ' is-empty' : ''}`}
                aria-pressed={allAsia}
                onClick={toggleAsia}
              >
                {allAsia && <span aria-hidden="true">✓ </span>}
                All of Asia <span className="pill__count">{countIn(ASIA)}</span>
              </button>
            ) : (
              <button
                key={r}
                type="button"
                className={`pill${regions.has(r) ? ' is-on' : ''}${countIn([r]) === 0 ? ' is-empty' : ''}`}
                aria-pressed={regions.has(r)}
                onClick={() => toggleRegion(r)}
              >
                {regions.has(r) && <span aria-hidden="true">✓ </span>}
                {REGIONS[r]} <span className="pill__count">{countIn([r])}</span>
              </button>
            ),
          )}
        </div>
      </section>

      <h2 className="explore-heading">
        You can go now <span className="count">{shown.length}</span>
      </h2>
      {shown.length === 0 ? (
        <p className="muted">
          Nothing {regions.size === 0 ? 'in this cabin' : `in ${regionNames}`} is fully covered yet. Check “Almost there” below, or
          try a lower cabin.
        </p>
      ) : (
        <div className="dest-grid">
          {shown.map((x) => (
            <DestCard key={x.dest.iata} x={x} onOpen={open} />
          ))}
        </div>
      )}

      {almost.length > 0 && (
        <>
          <h2 className="explore-heading">
            Almost there <span className="count">{almost.length}</span>
          </h2>
          <p className="muted">Within 30% of the saver price. Worth saving toward, or a transfer bonus away.</p>
          <div className="dest-grid">
            {almost.map((x) => (
              <DestCard key={x.dest.iata} x={x} onOpen={open} />
            ))}
          </div>
        </>
      )}

      <p className="disclaimer">
        Typical saver prices, not live availability: a destination listed here can still have no award seats on your
        dates. Open one to see every option, the cash comparison and live fares on Google Flights.
      </p>
    </div>
  )
}

/** The user's balances, so they can read the results against them. */
function YourPoints({ memberships, bankPoints }) {
  const programs = memberships.filter((m) => PROGRAMS_BY_ID[m.programId])
  const cards = bankPoints.filter((b) => CARDS_BY_ID[b.cardId])
  return (
    <section className="section wallet" aria-labelledby="wallet-title">
      <div className="wallet__head">
        <h2 id="wallet-title">Your points</h2>
        <Link to="/profile">Edit</Link>
      </div>
      <div className="wallet__groups">
        <div>
          <h3 className="wallet__label">Airline programs</h3>
          {programs.length === 0 ? (
            <p className="muted">None added</p>
          ) : (
            <ul className="wallet__list">
              {programs.map((m) => {
                const p = PROGRAMS_BY_ID[m.programId]
                return (
                  <li key={m.id} style={{ '--accent-row': p.accentColor }}>
                    <span className="wallet__name">
                      {p.name}
                      {m.tier && <span className="table__note">{m.tier}</span>}
                    </span>
                    <span className="num wallet__bal">{m.balance ? m.balance.toLocaleString() : '—'}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div>
          <h3 className="wallet__label">Credit card points</h3>
          {cards.length === 0 ? (
            <p className="muted">None added</p>
          ) : (
            <ul className="wallet__list">
              {cards.map((b) => (
                <li key={b.id}>
                  <span className="wallet__name">{CARDS_BY_ID[b.cardId].name}</span>
                  <span className="num wallet__bal">{b.balance ? b.balance.toLocaleString() : '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

const SHOWN_PROGRAMS = 4

function DestCard({ x, onOpen }) {
  const { dest, programs } = x
  // The cheapest few, always including the highlighted pick.
  let rows = programs.slice(0, SHOWN_PROGRAMS)
  if (!rows.some((p) => p.entry === x.entry)) {
    rows = [...rows.slice(0, SHOWN_PROGRAMS - 1), programs.find((p) => p.entry === x.entry)]
  }
  const extra = programs.length - rows.length
  return (
    <button type="button" className={`dest${x.covered ? '' : ' dest--close'}`} onClick={() => onOpen(dest.iata)}>
      <span className="dest__top">
        <span className="dest__code">{dest.iata}</span>
        <span className="dest__place">
          {dest.city}
          <span className="muted">{dest.country}</span>
        </span>
      </span>
      <span className="dest__programs">
        {rows.map((p) => (
          <span key={p.entry.program.id} className={`dest__row${p.entry === x.entry ? ' is-pick' : ''}`}>
            <span className="dest__prog">
              {shortName(p.entry.program.name)}
              <span className="table__note">
                {p.option.carriers.slice(0, 2).map(carrierName).join(', ')}
                {p.option.carriers.length > 2 ? ' +' : ''}
              </span>
            </span>
            <span className="num dest__pts">{formatMiles(p.costLow)}</span>
            <span className={`dest__state ${p.covered ? 'good' : 'warn'}`}>
              {p.covered ? 'Covered' : `${formatMiles(p.shortfall)} short`}
            </span>
          </span>
        ))}
        {extra > 0 && <span className="table__note">+{extra} more program{extra > 1 ? 's' : ''}</span>}
      </span>
      <span className="dest__cash">
        From {x.option.origins.join(', ')} · Cash ~{formatUsdRange(x.cash)}
        {x.value && ` · ≈${x.value.cpp.toFixed(1)}¢/pt with ${shortName(x.entry.program.name)}`}
      </span>
    </button>
  )
}

// "Virgin Atlantic Flying Club" -> "Virgin Atlantic", "British Airways Club (Avios)" -> "BA Avios", etc.
const SHORT = {
  united: 'United',
  american: 'American',
  delta: 'Delta',
  alaska: 'Alaska',
  jetblue: 'JetBlue',
  southwest: 'Southwest',
  airindia: 'Air India',
  aeroplan: 'Aeroplan',
  ba: 'BA Avios',
  flyingblue: 'Flying Blue',
  krisflyer: 'KrisFlyer',
  virgin: 'Virgin Atlantic',
  ana: 'ANA',
  emirates: 'Emirates',
  turkish: 'Turkish',
}
const BY_NAME = Object.fromEntries(Object.entries(PROGRAMS_BY_ID).map(([id, p]) => [p.name, SHORT[id] ?? p.name]))
const shortName = (name) => BY_NAME[name] ?? name
