import { CARD_COMPARE_URL } from '../data/cards.js'

/**
 * Invitation to the sibling Card Compare app, for people choosing which
 * card to earn transferable points with. `compact` is the one-line version
 * used inside the My points card section.
 */
export default function CardCompareBlurb({ compact = false }) {
  if (compact) {
    return (
      <p className="crosslink crosslink--compact">
        Don’t have one of these cards yet, or wondering which is best?{' '}
        <a href={CARD_COMPARE_URL} target="_blank" rel="noopener noreferrer">
          Compare them in Card Compare ↗
        </a>
      </p>
    )
  }
  return (
    <aside className="crosslink" aria-labelledby="crosslink-title">
      <span className="crosslink__icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 9.5h19M6.5 15h4" />
        </svg>
      </span>
      <div className="crosslink__body">
        <h2 id="crosslink-title" className="crosslink__title">
          Picking a card to earn these points?
        </h2>
        <p className="muted">
          Card Compare lines up 25 US credit cards side by side: annual fees, earning rates, perks and transfer
          partners. A five-question quiz matches you to your top three.
        </p>
      </div>
      <a className="btn btn--ghost crosslink__cta" href={CARD_COMPARE_URL} target="_blank" rel="noopener noreferrer">
        Open Card Compare ↗
      </a>
    </aside>
  )
}
