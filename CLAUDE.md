# Flight Points Optimizer

## Project overview

Airline-miles counterpart to the sibling `Hotel Points Optimizer` (same stack, look and conventions: Vite + React JSX, `HashRouter`, oxlint, no tests, fully static). Users add airline programs (balance and tier), bank-points balances and a home airport. Then they pick a destination, cabin, trip type and travellers, and get the best program to book through (partners included), typical award prices, cabin reach, a shortfall, and card-pooling advice.

Original plan: `~/.claude/plans/i-want-to-build-resilient-sketch.md`. Decisions the user made: home airport plus per-trip override; hand-compiled typical ranges (no paid API); about 15 programs (US + Air India + major transfer partners); partner awards shown.

**Deliberate scope boundaries (same as the hotel app):** no live data or scraping, no specific flights, and the profile is session-only unless the user opts in to "remember on this device" (`utils/persistence.js`, key `flight-points-optimizer:profile`; the trip is never saved).

## Commands (from `app/`)

- `npm run dev` — port **5175** (`--strictPort`; hotel app is 5174, card app 5173)
- `npm run build`, `npm run lint`, `npm run preview`

## Data (`app/src/data/`, JS modules, not JSON, so they can carry comments)

- `airports.js` — about 140 airports `{iata, city, country, region, lat, lon}` and 10 award `REGIONS` (NA, CAR, SA, EU, ME, AF, SAS, NAS, SEA, OC). Istanbul is EU; Cairo is ME; Hawaii is NA.
- `airlines.js` — operating carriers `{name, alliance, home, hubs, serves, connects}` and `carrierCovers(code, origin, dest)`. A carrier covers a trip if it's domestic to its home region, if one end is its home and it serves the other, or if both ends are in `connects` **and** routing via one of its `hubs` is at most `MAX_DETOUR` (1.5×) the direct distance. The detour check exists because without it Qatar and Emirates showed up on New York–Mexico City.
- `programs.js` — 15 programs. Pricing is one `bands` table per program: `[low, high]` **in thousands**, one-way, per cabin (`Y W J F`), indexed by great-circle distance against `DISTANCE_BANDS` (700 / 1,500 / 3,000 / 5,000 / 7,000 / 9,000 / ∞). `overrides` pin well-known prices by region pair (`pairKey` sorts the two codes, e.g. `NA-NAS`), optionally limited to `carriers` and `countries`. For example, Virgin→ANA 47.5k business applies to Japan only, not Seoul. `carrierSurcharges` overrides the program-level `surcharges` per operating carrier. ANA is round-trip only; its numbers are **half the round trip**, noted in `pricingNote`.
- `cards.js` — bank currencies with `transfers: {programId: ratio}` (miles per bank point). `verify: true` (HDFC) shows a "check with your bank" note.

**Accuracy caveats:** sources disagreed a lot (see `programs.js` header). Elite-tier thresholds are approximate. Citi changed ratios in April 2026. Spot-check before relying on any number, and refresh `PROGRAMS_META.lastUpdated` when you do.

## Logic (`app/src/utils/`)

- `geo.js` — `distanceMiles` (haversine).
- `awardLogic.js` — `programOptions(program, origin, dest, cabin)` groups carriers by identical price and surcharge, cheapest first. `cabinPrices`, formatting helpers.
- `resultsLogic.js` — `buildResults` covers every program the user holds **or that one of their cards transfers into**. "Pooled" is the own balance plus all transferable card points, assuming everything goes to that one program (splitting isn't modelled, same as the hotel app). Ranking: bookable → covered → cheapest saver price → lowest surcharge → member first. `pickVerdict` returns ties. `buildPooling` evaluates each card alone plus the own balance. `cabinReach` gives the highest covered cabin and the next one up. `judgeRedemption` flags ≥1.2× typical value as "use points" and ≤0.8× as "pay cash".

## UI

Pages: Home, `/profile` (My points), `/trip`, `/results` (tabs: Your programs / Pool card points / Compare), `/programs` (reference). `AirportInput` keeps a draft and only reports a resolved IATA (or '' when cleared). It records its own reports so the "value changed from outside" sync doesn't wipe the text being typed. `BalanceInput` accepts commas. `Tabs.jsx`, `RememberToggle.css`, `SiteHeader.css`, `index.css` were copied from the hotel app.

Not ported from the hotel app (and why): the payment-card co-brand notes and the status-progress tracker. Airline elite qualification (PQP / MQD / XP) differs too much between programs to track meaningfully here; tiers show award-relevant perks instead.
