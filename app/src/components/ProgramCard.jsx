import { useState } from 'react'
import { CABINS, CABIN_NAME, SURCHARGE_LABEL } from '../data/programs.js'
import { carrierName, formatMiles, formatRange } from '../utils/awardLogic.js'
import PriceChecker from './PriceChecker.jsx'
import { formatUsdRange } from '../utils/links.js'
import Tabs from './Tabs.jsx'

const TABS = [
  { id: 'redeem', label: 'Redeem' },
  { id: 'cabins', label: 'Every cabin' },
  { id: 'status', label: 'Status' },
  { id: 'check', label: 'Check a price' },
]

const carriersText = (codes, own) =>
  codes.map((c) => (c === own ? `${carrierName(c)} (own)` : carrierName(c))).join(', ')

export default function ProgramCard({ entry, cabin, mult, isBest, originCount = 1 }) {
  const [tab, setTab] = useState('redeem')
  const { program: p, best } = entry
  const idPrefix = `pc-${p.id}`
  const unit = p.currency
  const tier = entry.membership?.tier ? p.eliteTiers.find((t) => t.name === entry.membership.tier) : null

  return (
    <article className={`card${isBest ? ' card--best' : ''}`} style={{ '--accent-row': p.accentColor }}>
      <header className="card__head">
        <div>
          <h3>{p.name}</h3>
          <p className="muted">
            {p.alliance ?? 'No alliance'} · {SURCHARGE_LABEL[best?.surcharge ?? p.surcharges]}
          </p>
        </div>
        <div className="badges">
          {isBest && <span className="badge badge--accent">Best fit</span>}
          {entry.isMember ? (
            <span className="badge">Member{tier ? ` · ${tier.name}` : ''}</span>
          ) : (
            <span className="badge badge--soft">Not a member · free to join</span>
          )}
        </div>
      </header>

      {best ? (
        <div className="card__summary">
          <div className="stat">
            <span className="stat__label">
              {CABIN_NAME[cabin]}
              {mult > 1 ? `, ${mult} tickets` : ', one-way'}
            </span>
            <span className="stat__value num">{formatRange(entry.costLow, entry.costHigh)}</span>
            <span className="stat__sub">{unit}</span>
          </div>
          <div className="stat">
            <span className="stat__label">You could pool</span>
            <span className="stat__value num">{formatMiles(entry.pooled)}</span>
            <span className="stat__sub">
              {entry.ownBalance > 0 ? `${formatMiles(entry.ownBalance)} held` : 'none held'}
              {entry.transferable > 0 ? ` + ${formatMiles(entry.transferable)} from cards` : ''}
            </span>
          </div>
          <div className={`stat ${entry.covered ? 'stat--good' : 'stat--warn'}`}>
            <span className="stat__label">{entry.covered ? 'Covered' : 'Still need'}</span>
            <span className="stat__value num">{entry.covered ? '✓' : formatMiles(entry.shortfall)}</span>
            <span className="stat__sub">
              {entry.covered
                ? entry.coveredHigh
                  ? 'even at the higher price'
                  : 'at the saver price'
                : `more ${unit} at the saver price`}
            </span>
          </div>
          <div className="stat">
            <span className="stat__label">Or pay cash</span>
            <span className="stat__value num stat__value--sm">{formatUsdRange(entry.cash)}</span>
            <span className="stat__sub">
              {entry.value ? `≈${entry.value.cpp.toFixed(1)}¢ per point (usually ${p.valuePerMile}¢)` : 'typical fare'}
            </span>
          </div>
        </div>
      ) : (
        <p className="card__none">
          {p.name} can’t realistically book {CABIN_NAME[cabin].toLowerCase()} on this route with its own or partner
          flights.
          {entry.reach.reached || entry.reach.next ? ' See “Every cabin” for what it can book.' : ''}
        </p>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix={idPrefix} label={`${p.name} details`} variant="sub" />

      <div role="tabpanel" id={`${idPrefix}-panel-redeem`} aria-labelledby={`${idPrefix}-tab-redeem`} hidden={tab !== 'redeem'} className="card__panel">
        {entry.options.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Fly on</th>
                <th scope="col">Typical, per one-way</th>
                <th scope="col">Fees</th>
              </tr>
            </thead>
            <tbody>
              {entry.options.map((o) => (
                <tr key={`${o.min}-${o.max}-${o.carriers.join()}`}>
                  <td>
                    {carriersText(o.carriers, p.airline)}
                    {o.note && <span className="table__note">{o.note}</span>}
                    {originCount > 1 && (
                      <span className="table__note">
                        {o.origins.length === originCount ? 'From any of your airports' : `From ${o.origins.join(', ')} only`}
                      </span>
                    )}
                  </td>
                  <td className="num">{formatRange(o.min, o.max)}</td>
                  <td>{o.surcharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No {CABIN_NAME[cabin].toLowerCase()} options on this route.</p>
        )}
        <p className="fine">{p.pricingNote}</p>
        {entry.sources.length > 0 && (
          <p className="fine">
            Card transfers counted:{' '}
            {entry.sources
              .map((s) => `${s.cardName} ${s.bankPoints.toLocaleString()} → ${s.miles.toLocaleString()}${s.ratio !== 1 ? ` (1:${s.ratio})` : ''}${s.verify ? ' (check ratio)' : ''}`)
              .join('; ')}
            . Transfers usually can’t be reversed, so find the seat first.
          </p>
        )}
        <a className="out" href={p.bookingUrl} target="_blank" rel="noopener noreferrer">
          Search award seats on {p.name.split(' (')[0]} →
        </a>
      </div>

      <div role="tabpanel" id={`${idPrefix}-panel-cabins`} aria-labelledby={`${idPrefix}-tab-cabins`} hidden={tab !== 'cabins'} className="card__panel">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Cabin</th>
              <th scope="col">Typical{mult > 1 ? ` (${mult} tickets)` : ''}</th>
              <th scope="col">With your {formatMiles(entry.pooled)}</th>
            </tr>
          </thead>
          <tbody>
            {CABINS.map((c) => {
              const price = entry.prices[c.id]
              if (!price) {
                return (
                  <tr key={c.id} className="is-dim">
                    <td>{c.name}</td>
                    <td colSpan={2}>Not bookable on this route</td>
                  </tr>
                )
              }
              const cost = price.min * mult
              const ok = entry.pooled >= cost
              return (
                <tr key={c.id} className={c.id === cabin ? 'is-current' : ''}>
                  <td>{c.name}</td>
                  <td className="num">{formatRange(cost, price.max * mult)}</td>
                  <td className={ok ? 'good' : 'warn'}>{ok ? 'Covered' : `${formatMiles(cost - entry.pooled)} short`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p>
          {entry.reach.reached
            ? `Your pooled ${unit} reach ${CABIN_NAME[entry.reach.reached.cabin].toLowerCase()} at the saver price.`
            : `Your pooled ${unit} don’t cover any cabin here yet.`}{' '}
          {entry.reach.next &&
            `${formatMiles(entry.reach.next.short)} more would open up ${CABIN_NAME[entry.reach.next.cabin].toLowerCase()}.`}
        </p>
      </div>

      <div role="tabpanel" id={`${idPrefix}-panel-status`} aria-labelledby={`${idPrefix}-tab-status`} hidden={tab !== 'status'} className="card__panel">
        {tier ? (
          <>
            <p>
              As <strong>{tier.name}</strong>, what matters for award trips:
            </p>
            <ul className="bullets">
              {tier.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">
            {entry.isMember ? 'No status set for this program.' : 'You’re not a member yet.'} Award seats don’t need
            status, but some programs open more saver seats to elites.
          </p>
        )}
        <details className="ladder">
          <summary>All {p.eliteTiers.length} tiers</summary>
          <ul className="bullets">
            {p.eliteTiers.map((t) => (
              <li key={t.name} className={t.name === tier?.name ? 'is-current' : ''}>
                <strong>{t.name}</strong> ({t.qualification}): {t.perks.join('; ')}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div role="tabpanel" id={`${idPrefix}-panel-check`} aria-labelledby={`${idPrefix}-tab-check`} hidden={tab !== 'check'} className="card__panel">
        <PriceChecker program={p} />
      </div>
    </article>
  )
}
