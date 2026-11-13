import { Link, useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { PROGRAMS } from '../data/programs.js'
import { CARDS } from '../data/cards.js'

export default function Home() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const hasProfile = state.memberships.length > 0 || state.bankPoints.length > 0

  return (
    <div className="page page--narrow">
      <section className="hero-sky">
        <svg className="hero-sky__path" viewBox="0 0 720 300" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M-20 250 C 160 240, 260 90, 460 110 S 700 40, 760 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
        </svg>
        <p className="eyebrow">Airline miles + credit card points</p>
        <h1 className="hero">Where should your points fly you?</h1>
        <p className="lede">
          Add the airline programs you belong to and the card points you hold. Then pick a destination, and see which
          program gets you there for the fewest miles, which cabin your points can reach, and where to send your card
          points so they go furthest.
        </p>

        <div className="actions">
          <Link className="btn btn--primary" to={hasProfile ? '/trip' : '/profile'}>
            {hasProfile ? 'Plan a trip →' : 'Get started →'}
          </Link>
          {hasProfile ? (
            <Link className="btn" to="/profile">
              Edit my points
            </Link>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => {
                dispatch({ type: 'LOAD_EXAMPLE' })
                navigate('/results')
              }}
            >
              Try an example
            </button>
          )}
        </div>
        {!hasProfile && (
          <p className="fine">
            The example uses made-up balances: United 50k miles, 80k Chase and 60k Amex points, Newark to Tokyo in
            business.
          </p>
        )}
      </section>

      <ol className="steps">
        <li>
          <strong>Your points.</strong> {PROGRAMS.length} airline programs (US, India and the big transfer partners)
          and {CARDS.length} bank-points currencies. Balances are optional.
        </li>
        <li>
          <strong>Your trip.</strong> About 140 major airports, any cabin, one-way or round trip.
        </li>
        <li>
          <strong>Your answer.</strong> The best program for the trip, including partner airlines (e.g. ANA through
          Virgin Atlantic), with typical award prices and how many more points you’d need.
        </li>
      </ol>

      <p className="fine">
        Prices are typical ranges from published award charts and well-known sweet spots, compiled by hand, not live
        availability. Nothing you enter is sent anywhere.
      </p>
    </div>
  )
}
