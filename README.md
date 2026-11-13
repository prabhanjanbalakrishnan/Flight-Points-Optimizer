# Flight Points Optimizer

The airline counterpart to the [Hotel Points Optimizer](../Hotel%20Points%20Optimizer). Add the airline programs you belong to and the credit-card points you hold, pick a destination, and get a straight answer: which program gets you there for the fewest miles (partner airlines included), roughly what each cabin costs, which cabin your points can reach, and where to send your card points so they go furthest.

**Live:** [flight-points-optimizer.vercel.app](https://flight-points-optimizer.vercel.app)

## What it does

- **Your points.** 15 airline programs (miles balance and elite tier, both optional), 7 bank-points currencies (Chase, Amex, Citi, Capital One, Bilt, Wells Fargo, HDFC), and up to four home airports (e.g. EWR, JFK and LGA).
- **Your trip.** Type a city or airport code (about 140 major airports), pick a cabin (economy / premium economy / business / first), one-way or round trip, and how many travellers. All your home airports are compared on every trip; untick one or add a one-off airport for a single trip.
- **Best fit.** A verdict naming the program to book through, the airlines it would put you on, the typical price, and whether your miles plus transferable card points already cover it (or how many more you need).
- **Programs you don't hold yet count too.** If your Amex points can reach ANA or Virgin Atlantic, those programs are ranked alongside your own, marked "free to join".
- **Cash vs points.** A typical cash fare for the trip, the cents-per-point you'd get, and a pre-filled Google Flights link for live fares.
- **By airport.** The best option from each of your airports side by side, since airlines differ between them (ANA flies from JFK, not Newark).
- **Per-program detail.** Every option with its carriers and surcharge level, every cabin's typical price and whether you can reach it, your tier's award perks, and a "check a price" calculator (cents per mile vs. the program's typical value).
- **Pool card points.** For each card, which program its points go furthest in for this trip.
- **Explore.** Don't know where to go? See every destination your points can cover in your cabin, plus the ones you're close to. Each destination lists every program that can get you there, cheapest first, with your balances shown at the top. Filter by any mix of regions and sort by points or value per point.
- **Compare destinations.** Up to three more destinations side by side.
- **Programs reference** (`/programs`): alliance, partners, pricing model, distance price table, sweet spots, elite ladder, and which cards transfer in.
- **Try an example** from the home page to see a filled-in result (made-up balances) before entering your own.
- **Dark or light.** Dark by default; the sun/moon switch in the header flips to light mode and remembers your choice in this browser.
- **Remember on this device (opt-in).** Programs, balances, cards and home airport are saved in your own browser only when you tick the box. Untick to erase. Trip details are never saved.

## Programs covered

United MileagePlus, American AAdvantage, Delta SkyMiles, Alaska Atmos Rewards, JetBlue TrueBlue, Southwest Rapid Rewards, Air India Maharaja Club, Air Canada Aeroplan, British Airways Club (Avios), Air France–KLM Flying Blue, Singapore KrisFlyer, Virgin Atlantic Flying Club, ANA Mileage Club, Emirates Skywards, Turkish Miles&Smiles.

## Scope, on purpose

- **No live data.** Award prices and cash fares are estimates; the Google Flights link is where real fares come from.
- **Award prices in detail.** There's no free award-availability API and airlines block automated access, so prices are **typical ranges** compiled by hand (November 2026) from published charts and well-known sweet spots. Where sources disagreed (Aeroplan's June 2026 repricing, Air India's April 2026 chart, Turkish 45k vs 65k to Europe), the range spans both.
- **Region-level routing.** "Who flies this" comes from which regions each airline serves and whether its hub sits sensibly between origin and destination. It never claims a specific flight exists.
- **Check before you transfer.** Every result links to the program's own site. Card transfers are usually instant and irreversible, so the app tells you to find the seat first.

## Tech stack

Vite + React (plain JSX), `react-router-dom` `HashRouter`, oxlint. Static, no backend, no external APIs at runtime.

## Getting started

```bash
cd app
npm install
npm run dev     # http://localhost:5175
```

```bash
npm run build           # production build
npm run lint            # oxlint
npm run build:artifact  # single self-contained HTML page for a claude.ai artifact
```
