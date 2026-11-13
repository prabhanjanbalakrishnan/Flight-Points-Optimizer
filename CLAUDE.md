# Flight Points Optimizer

## Project overview

Airline-miles counterpart to the sibling `Hotel Points Optimizer` (same stack and conventions: Vite + React JSX, `HashRouter`, oxlint, no tests, fully static). **The look is deliberately different** from the hotel and card apps (the user asked for variety between the three): see "Design" below. Users add airline programs (balance and tier), bank-points balances and up to 4 home airports. Then they pick a destination, cabin, trip type and travellers, and get the best program to book through (partners included) **compared across every airport they fly from**, typical award prices, a typical cash fare and cents-per-point, cabin reach, a shortfall, and card-pooling advice.

Original plan: `~/.claude/plans/i-want-to-build-resilient-sketch.md`. Decisions the user made: several home airports, all compared on every trip (user lives in Jersey City and flies EWR/JFK/LGA; they want to see if one airport is cheaper), with per-trip toggles and one-off extras; cash = hand-compiled estimate + a pre-filled Google Flights link (no live fares; Google Flights has no public API); hand-compiled typical ranges (no paid API); about 15 programs (US + Air India + major transfer partners); partner awards shown.

**Deliberate scope boundaries (same as the hotel app):** no live data or scraping, no specific flights, and the profile is session-only unless the user opts in to "remember on this device" (`utils/persistence.js`, key `flight-points-optimizer:profile`; the trip is never saved).

## Commands (from `app/`)

- `npm run dev` — port **5175** (`--strictPort`; hotel app is 5174, card app 5173)
- `npm run build`, `npm run lint`, `npm run preview`
- `npm run build:artifact` — `scripts/build-artifact.mjs` builds with `VITE_ROUTER=memory` (MemoryRouter, because an artifact link only carries a plain `#name`) and inlines the JS + CSS into `dist-artifact/flight-points-optimizer.html` (gitignored). Published as the claude.ai artifact https://claude.ai/artifact/M1M4i4Y87U5DziViW43jYF; republish that file to the same URL after rebuilding.

## Data (`app/src/data/`, JS modules, not JSON, so they can carry comments)

- `airports.js` — 138 airports `{iata, city, country, region, lat, lon, foreignCarriers}` and 10 award `REGIONS` (NA, CAR, SA, EU, ME, AF, SAS, NAS, SEA, OC). Istanbul is EU; Cairo is ME; Hawaii is NA. `AIRPORT_CARRIERS` lists, for EWR/JFK/LGA only, which **non-home-region** airlines fly there (home-region airlines can always connect); LGA is `[]` (perimeter rule). This is what makes the airports differ (e.g. ANA flies JFK, not EWR). Add a list for another multi-airport city the same way. `airportLabel` gives "Tokyo (Haneda · HND)" for cities that already carry a qualifier; `AirportInput`'s parser accepts both forms.
- `airlines.js` — operating carriers `{name, alliance, home, hubs, serves, connects}` and `carrierCovers(code, origin, dest)`. A carrier covers a trip if it's domestic to its home region, if one end is its home and it serves the other, or if both ends are in `connects` **and** routing via one of its `hubs` is at most `MAX_DETOUR` (1.5×) the direct distance. The detour check exists because without it Qatar and Emirates showed up on New York–Mexico City.
- `programs.js` — 15 programs. Pricing is one `bands` table per program: `[low, high]` **in thousands**, one-way, per cabin (`Y W J F`), indexed by great-circle distance against `DISTANCE_BANDS` (700 / 1,500 / 3,000 / 5,000 / 7,000 / 9,000 / ∞). `overrides` pin well-known prices by region pair (`pairKey` sorts the two codes, e.g. `NA-NAS`), optionally limited to `carriers` and `countries`. For example, Virgin→ANA 47.5k business applies to Japan only, not Seoul. `carrierSurcharges` overrides the program-level `surcharges` per operating carrier. ANA is round-trip only; its numbers are **half the round trip**, noted in `pricingNote`.
- `cashFares.js` — typical one-way USD cash fares per cabin by the same `DISTANCE_BANDS`; route-level, not per airline. Only for a rough points-vs-cash read; Google Flights is the real number.
- `cards.js` — bank currencies with `transfers: {programId: ratio}` (miles per bank point). `verify: true` (HDFC) shows a "check with your bank" note.

**Accuracy caveats:** sources disagreed a lot (see `programs.js` header). Elite-tier thresholds are approximate. Citi changed ratios in April 2026. Spot-check before relying on any number, and refresh `PROGRAMS_META.lastUpdated` when you do.

## Logic (`app/src/utils/`)

- `geo.js` — `distanceMiles` (haversine).
- `awardLogic.js` — `programOptions(program, origin, dest, cabin)` groups carriers by identical price and surcharge, cheapest first. `cabinPrices`, formatting helpers.
- `resultsLogic.js` — `buildResults({…, origins, dest})` takes **an array of origin airports**; `optionsFrom` merges each program's options across them (rows carry `origins`). `compareAirports` runs it per airport for the "By airport" tab. `tripCash` / `pointsValue` give the cash range and cents-per-point (≥1.2× the program's `valuePerMile` = good use of points). It covers every program the user holds **or that one of their cards transfers into**. "Pooled" is the own balance plus all transferable card points, assuming everything goes to that one program (splitting isn't modelled, same as the hotel app). Ranking: bookable → covered → cheapest saver price → lowest surcharge → member first. `pickVerdict` returns ties. `buildPooling` evaluates each card alone plus the own balance. `cabinReach` gives the highest covered cabin and the next one up. `judgeRedemption` flags ≥1.2× typical value as "use points" and ≤0.8× as "pay cash".

## Design

Light, airy travel theme (user's choice, Nov 2026), unlike the dark/monospace/hard-edged hotel and card apps: sky-tinted paper, white rounded cards, deep-navy ink, one sky-blue accent, Plus Jakarta Sans. All colors are tokens in `index.css` with a night-sky dark variant (`prefers-color-scheme`, overridable by `data-theme` on `<html>`; required for the artifact). Flight-specific pieces: the **boarding-pass verdict** on Results (big IATA codes, dashed flight path, perforated tear-off stub showing covered / still need), the sky-gradient home hero with a dashed flight path, a plane logo, icon cabin tiles on Trip, segmented-pill tabs. Home has **Try an example** (`LOAD_EXAMPLE` in the context: United 50k, Chase 80k, Amex 60k, EWR→HND business, compare ICN/LHR), labelled as made-up balances.

## UI

Pages: Home, `/profile` (My points, home-airport chips), `/trip` (airport tiles: `tripOrigins` null = all home airports, else the ticked/added list; `tripOriginCodes(state)` resolves it), `/results` (boarding pass departs from the best option's airport; tabs: Your programs / By airport / Pool card points / Compare), `/programs` (reference). `utils/links.js` builds the Google Flights link from airport codes + cabin only (its `q` parse of cabin/trip type isn't guaranteed). Persistence migrates old single `homeAirport` profiles. `AirportInput` keeps a draft and only reports a resolved IATA (or '' when cleared). It records its own reports so the "value changed from outside" sync doesn't wipe the text being typed. `BalanceInput` accepts commas. `Tabs.jsx` was copied from the hotel app; its CSS (and the header, toggle and global styles) were rewritten for the new theme.

Not ported from the hotel app (and why): the payment-card co-brand notes and the status-progress tracker. Airline elite qualification (PQP / MQD / XP) differs too much between programs to track meaningfully here; tiers show award-relevant perks instead.
