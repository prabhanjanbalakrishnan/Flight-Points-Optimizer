/**
 * Airline loyalty programs. Hand-compiled November 2026 from public sources
 * (program pages, One Mile at a Time, The Points Guy, Live and Let's Fly,
 * Prince of Travel, AwardWallet, NerdWallet, Frequent Miler). NOT live data.
 *
 * Pricing model
 * -------------
 * Every program gets one `bands` table: typical one-way award cost, in
 * THOUSANDS of miles, as [low, high] per cabin, indexed by the straight-line
 * distance between the two airports (DISTANCE_BANDS below). `low` is the
 * saver / partner-chart price you can realistically find with flexibility;
 * `high` is the common price when saver space is gone. `null` = that cabin
 * isn't realistically bookable at that distance with this program.
 *
 * Bands are an approximation for every program -- even region-chart programs
 * price roughly by distance -- and `overrides` pin down specific, well-known
 * prices (e.g. Virgin -> ANA to Japan) that a band would get wrong. An
 * override can be limited to `carriers` and to trips touching `countries`.
 *
 * Sources disagreed often (see the Aeroplan June 2026 and Air India April
 * 2026 changes, Turkish 45k vs 65k to Europe); where they did, the range
 * spans both rather than picking one.
 */

// Upper bound (statute miles, great-circle) of each band; the last is open.
export const DISTANCE_BANDS = [700, 1500, 3000, 5000, 7000, 9000, Infinity]

export const CABINS = [
  { id: 'Y', name: 'Economy' },
  { id: 'W', name: 'Premium Economy' },
  { id: 'J', name: 'Business' },
  { id: 'F', name: 'First' },
]

export const CABIN_NAME = Object.fromEntries(CABINS.map((c) => [c.id, c.name]))

export const SURCHARGE_LABEL = {
  none: 'No carrier surcharges',
  low: 'Low taxes & fees',
  moderate: 'Moderate surcharges',
  high: 'High carrier surcharges',
}

const n = null

export const PROGRAMS = [
  {
    id: 'united',
    name: 'United MileagePlus',
    airline: 'UA',
    alliance: 'Star Alliance',
    currency: 'miles',
    pricingModel: 'dynamic',
    pricingNote:
      'Dynamic on United flights (saver prices exist but swing widely). Partner awards are close to a fixed chart and usually the better deal.',
    partners: ['AC', 'NH', 'LH', 'LX', 'TK', 'SQ', 'NZ', 'OZ', 'BR', 'AI', 'CM', 'AV', 'ET', 'EK', 'B6'],
    valuePerMile: 1.3,
    surcharges: 'none',
    bookingUrl: 'https://www.united.com/en/us',
    accentColor: '#3b82f6',
    bands: {
      Y: [[7.5, 15], [10, 22.5], [12.5, 35], [30, 60], [35, 70], [40, 80], [45, 90]],
      W: [n, n, n, [50, 95], [60, 110], [65, 120], [70, 130]],
      J: [[15, 35], [20, 50], [25, 75], [60, 150], [80, 175], [88, 200], [100, 220]],
      F: [n, n, n, [120, 180], [130, 200], [140, 220], [150, 240]],
    },
    overrides: [],
    sweetSpots: [
      'Partner business class on Star Alliance airlines (ANA, Lufthansa group, Turkish) without fuel surcharges.',
      'Excursionist Perk: a free one-way segment within a region on some round-trip itineraries.',
    ],
    eliteTiers: [
      { name: 'Premier Silver', qualification: 'About 6,000 PQP (or 5,000 PQP + 15 PQF)', perks: ['Economy Plus at check-in', 'Expanded saver availability on United flights (XN)'] },
      { name: 'Premier Gold', qualification: 'About 12,000 PQP (or 10,000 PQP + 30 PQF)', perks: ['Star Alliance Gold lounge access on international trips', 'Wider saver award space on United flights'] },
      { name: 'Premier Platinum', qualification: 'About 18,000 PQP (or 15,000 PQP + 45 PQF)', perks: ['Better upgrade priority', 'Wider saver award space on United flights'] },
      { name: 'Premier 1K', qualification: 'About 28,000 PQP (or 22,000 PQP + 60 PQF)', perks: ['PlusPoints for long-haul upgrades', 'Widest saver award space (XN/IN) on United flights'] },
    ],
  },
  {
    id: 'american',
    name: 'American AAdvantage',
    airline: 'AA',
    alliance: 'oneworld',
    currency: 'miles',
    pricingModel: 'region-chart',
    pricingNote:
      'Dynamic on American flights; partner awards (Qatar, JAL, Cathay, BA, Iberia, Finnair) follow a fixed regional chart.',
    partners: ['BA', 'IB', 'AY', 'QR', 'JL', 'CX', 'QF', 'AS', 'EY'],
    valuePerMile: 1.6,
    surcharges: 'low',
    carrierSurcharges: { BA: 'high' },
    bookingUrl: 'https://www.aa.com/',
    accentColor: '#9ca3af',
    bands: {
      Y: [[7.5, 15], [10, 20], [12.5, 30], [22.5, 35], [30, 45], [35, 50], [40, 55]],
      W: [n, n, n, [40, 60], [50, 75], [55, 80], [60, 90]],
      J: [[15, 25], [20, 35], [25, 50], [57.5, 75], [60, 85], [70, 90], [80, 110]],
      F: [n, n, [32.5, 62.5], [85, 115], [80, 110], [110, 130], [110, 150]],
    },
    overrides: [
      { pair: 'NA-NAS', carriers: ['JL', 'CX'], J: [60, 70], F: [80, 110], note: 'Partner chart: Asia 1 (Japan/Korea) business 60k' },
      { pair: 'ME-NA', carriers: ['QR'], J: [70, 70], F: [115, 115], note: 'Partner chart: Middle East business 70k' },
      { pair: 'NA-SAS', carriers: ['QR', 'EY'], J: [70, 75], note: 'Partner chart: India business 70k' },
    ],
    sweetSpots: [
      'Qatar Airways Qsuites business class to the Middle East and India at fixed partner prices.',
      'JAL and Cathay Pacific business class to Asia at 60k–70k one-way.',
    ],
    eliteTiers: [
      { name: 'Gold', qualification: '40,000 Loyalty Points', perks: ['Complimentary upgrades on short flights', 'oneworld Ruby'] },
      { name: 'Platinum', qualification: '75,000 Loyalty Points', perks: ['oneworld Sapphire lounge access', 'Better upgrade priority'] },
      { name: 'Platinum Pro', qualification: '125,000 Loyalty Points', perks: ['oneworld Emerald', 'Free same-day changes'] },
      { name: 'Executive Platinum', qualification: '200,000 Loyalty Points', perks: ['Systemwide upgrades', 'First-class lounge access on oneworld'] },
    ],
  },
  {
    id: 'delta',
    name: 'Delta SkyMiles',
    airline: 'DL',
    alliance: 'SkyTeam',
    currency: 'miles',
    pricingModel: 'dynamic',
    pricingNote:
      'Fully dynamic, no award chart. Delta One prices swing very widely; flash sales are where the value is. Partner awards (Air France, KLM, Virgin, Korean) are often cheaper than Delta’s own flights.',
    partners: ['AF', 'KL', 'VS', 'KE', 'AM', 'LA'],
    valuePerMile: 1.2,
    surcharges: 'low',
    carrierSurcharges: { AF: 'moderate', KL: 'moderate', VS: 'high' },
    bookingUrl: 'https://www.delta.com/',
    accentColor: '#ef4444',
    bands: {
      Y: [[5, 15], [8, 25], [10, 40], [25, 70], [35, 90], [40, 100], [45, 110]],
      W: [n, n, n, [45, 120], [60, 150], [70, 170], [80, 190]],
      J: [[15, 40], [20, 60], [30, 90], [50, 250], [75, 300], [85, 320], [95, 350]],
      F: [n, n, n, n, n, n, n],
    },
    overrides: [],
    sweetSpots: ['Delta One flash sales to Europe around 50k one-way.', 'Korean Air business class to Asia via SkyMiles when partner space opens.'],
    eliteTiers: [
      { name: 'Silver Medallion', qualification: '5,000 MQDs', perks: ['Complimentary upgrades (lowest priority)'] },
      { name: 'Gold Medallion', qualification: '10,000 MQDs', perks: ['SkyTeam Elite Plus lounge access on international trips', 'Waived award change fees'] },
      { name: 'Platinum Medallion', qualification: '15,000 MQDs', perks: ['Choice Benefits', 'Higher upgrade priority'] },
      { name: 'Diamond Medallion', qualification: '28,000 MQDs', perks: ['Delta One upgrade certificates', 'Delta Sky Club membership option'] },
    ],
  },
  {
    id: 'alaska',
    name: 'Alaska Atmos Rewards',
    airline: 'AS',
    alliance: 'oneworld',
    currency: 'points',
    pricingModel: 'distance-band',
    pricingNote:
      'Partner awards use regional distance charts (priced on the whole one-way trip). Alaska and Hawaiian flights are dynamic. A stopover is allowed on one-way partner awards.',
    partners: ['AA', 'BA', 'IB', 'AY', 'QR', 'JL', 'CX', 'QF'],
    valuePerMile: 1.4,
    surcharges: 'low',
    carrierSurcharges: { BA: 'high' },
    bookingUrl: 'https://www.alaskaair.com/',
    accentColor: '#14b8a6',
    bands: {
      Y: [[5, 12.5], [7.5, 15], [12.5, 25], [22.5, 35], [30, 45], [35, 50], [40, 60]],
      W: [n, n, n, [35, 55], [45, 65], [50, 75], [55, 85]],
      J: [[12.5, 25], [17.5, 35], [25, 50], [45, 70], [50, 85], [60, 90], [70, 110]],
      F: [n, n, [30, 60], [70, 100], [70, 100], [80, 120], [100, 140]],
    },
    overrides: [
      { pair: 'NA-NAS', carriers: ['CX'], J: [50, 60], F: [70, 80], note: 'Cathay Pacific business has been one of the cheapest ways to Asia' },
    ],
    sweetSpots: ['Cathay Pacific and JAL premium cabins to Asia.', 'Free stopover on one-way partner awards.'],
    eliteTiers: [
      { name: 'Atmos Silver', qualification: '20,000 status points', perks: ['oneworld Ruby', 'Upgrades on Alaska flights'] },
      { name: 'Atmos Gold', qualification: '40,000 status points', perks: ['oneworld Sapphire lounge access'] },
      { name: 'Atmos Platinum', qualification: '80,000 status points', perks: ['oneworld Emerald', 'Higher upgrade priority'] },
      { name: 'Atmos Titanium', qualification: '135,000 status points', perks: ['Top upgrade priority', 'Bonus points on partner flights'] },
    ],
  },
  {
    id: 'jetblue',
    name: 'JetBlue TrueBlue',
    airline: 'B6',
    alliance: null,
    currency: 'points',
    pricingModel: 'revenue-based',
    pricingNote:
      'Points track the cash fare (roughly 1.3¢ each), so the price is cheap when the fare is cheap. Through the Blue Sky partnership TrueBlue points can also book some United flights.',
    partners: ['UA'],
    valuePerMile: 1.3,
    surcharges: 'none',
    bookingUrl: 'https://www.jetblue.com/',
    accentColor: '#2563eb',
    bands: {
      Y: [[4, 12], [6, 18], [8, 30], [15, 45], n, n, n],
      W: [n, n, n, n, n, n, n],
      J: [n, n, [25, 80], [35, 100], n, n, n],
      F: [n, n, n, n, n, n, n],
    },
    overrides: [],
    sweetSpots: ['Mint business class on sale fares, transatlantic or transcon.'],
    eliteTiers: [
      { name: 'Mosaic 1', qualification: '15 tiles', perks: ['Free changes and cancellations', 'Extra bag'] },
      { name: 'Mosaic 2–4', qualification: '30–150 tiles', perks: ['Upgrade certificates', 'Extra perks per level'] },
    ],
  },
  {
    id: 'southwest',
    name: 'Southwest Rapid Rewards',
    airline: 'WN',
    alliance: null,
    currency: 'points',
    pricingModel: 'revenue-based',
    pricingNote:
      'Points track the cash fare (roughly 1.3¢ each). No partner airlines. Flies the US, Mexico, Central America and the Caribbean only.',
    partners: [],
    valuePerMile: 1.3,
    surcharges: 'none',
    bookingUrl: 'https://www.southwest.com/',
    accentColor: '#f59e0b',
    bands: {
      Y: [[3, 12], [5, 20], [8, 30], [15, 40], n, n, n],
      W: [n, n, n, n, n, n, n],
      J: [n, n, n, n, n, n, n],
      F: [n, n, n, n, n, n, n],
    },
    overrides: [],
    sweetSpots: ['Companion Pass: a companion flies free (taxes only) on every trip, award trips included.'],
    eliteTiers: [
      { name: 'A-List', qualification: '20 flights or 35,000 tier points', perks: ['Priority boarding', 'Bonus points'] },
      { name: 'A-List Preferred', qualification: '40 flights or 70,000 tier points', perks: ['More bonus points', 'Free inflight Wi-Fi'] },
    ],
  },
  {
    id: 'airindia',
    name: 'Air India Maharaja Club',
    airline: 'AI',
    alliance: 'Star Alliance',
    currency: 'points',
    pricingModel: 'region-chart',
    pricingNote:
      'Banded chart repriced on 1 April 2026 (economy down sharply; business mixed). Air India points it to its own Points Calculator for exact prices. Star Alliance partner awards are bookable but limited.',
    partners: ['UA', 'LH', 'SQ', 'NH', 'TK'],
    valuePerMile: 0.9,
    surcharges: 'low',
    bookingUrl: 'https://www.airindia.com/',
    accentColor: '#dc2626',
    bands: {
      Y: [[1.5, 6], [3, 10], [6, 18], [12, 30], [20, 45], [30, 60], [35, 70]],
      W: [n, n, n, [30, 55], [45, 80], [55, 100], [60, 110]],
      J: [[5, 15], [10, 25], [18, 45], [60, 100], [70, 115], [100, 140], [110, 160]],
      F: [n, n, n, n, n, [150, 220], [160, 240]],
    },
    overrides: [
      { pair: 'NA-SAS', carriers: ['AI'], J: [130, 130], note: 'Delhi–New York / San Francisco business cut to 130k (Apr 2026)' },
    ],
    sweetSpots: ['Domestic India and short-haul economy after the April 2026 cuts.', 'Nonstop India–US business on Air India’s own flights.'],
    eliteTiers: [
      { name: 'Red', qualification: 'Entry level', perks: ['Points earning'] },
      { name: 'Silver', qualification: 'Tier points threshold (see airindia.com)', perks: ['Priority check-in', 'Star Alliance Silver'] },
      { name: 'Gold', qualification: 'Tier points threshold (see airindia.com)', perks: ['Lounge access', 'Star Alliance Gold'] },
      { name: 'Platinum', qualification: 'Tier points threshold (see airindia.com)', perks: ['Upgrade vouchers', 'Star Alliance Gold'] },
    ],
  },
  {
    id: 'aeroplan',
    name: 'Air Canada Aeroplan',
    airline: 'AC',
    alliance: 'Star Alliance',
    currency: 'points',
    pricingModel: 'distance-band',
    pricingNote:
      'Fixed partner chart by zone and distance, repriced on 1 June 2026 (long-haul business up; e.g. North America–Atlantic 4,001–6,000 mi now 75k). Air Canada’s own flights are dynamic. Partner booking fee about CA$39.',
    partners: ['UA', 'LH', 'LX', 'TK', 'SQ', 'NH', 'NZ', 'OZ', 'BR', 'AI', 'CM', 'AV', 'ET', 'EK', 'EY'],
    valuePerMile: 1.5,
    surcharges: 'low',
    carrierSurcharges: { LH: 'moderate', LX: 'moderate' },
    bookingUrl: 'https://www.aircanada.com/aeroplan',
    accentColor: '#f43f5e',
    bands: {
      Y: [[6, 10], [10, 15], [12.5, 25], [35, 50], [45, 60], [50, 70], [60, 75]],
      W: [n, n, n, [50, 70], [60, 80], [70, 90], [80, 100]],
      J: [[15, 25], [20, 35], [25, 45], [60, 75], [75, 90], [85, 102.5], [102.5, 120]],
      F: [n, n, n, [90, 120], [110, 140], [120, 150], [140, 170]],
    },
    overrides: [],
    sweetSpots: ['Widest Star Alliance partner list with low fees.', 'Stopover for 5,000 points on one-way awards.'],
    eliteTiers: [
      { name: '25K', qualification: '25,000 SQM or 25 SQS', perks: ['Star Alliance Silver', 'eUpgrade credits'] },
      { name: '35K', qualification: '35,000 SQM', perks: ['Star Alliance Gold', 'Lounge access'] },
      { name: '50K', qualification: '50,000 SQM', perks: ['More eUpgrades', 'Priority waitlist'] },
      { name: '75K / Super Elite', qualification: '75,000–100,000 SQM', perks: ['Priority Rewards', 'Top upgrade priority'] },
    ],
  },
  {
    id: 'ba',
    name: 'British Airways Club (Avios)',
    airline: 'BA',
    alliance: 'oneworld',
    currency: 'Avios',
    pricingModel: 'distance-band',
    pricingNote:
      'Distance-based and priced per flight segment, so connections cost more than nonstops. Off-peak/peak pricing on BA and Iberia. BA’s own long-haul flights carry high surcharges; American and Alaska flights do not.',
    partners: ['AA', 'IB', 'AY', 'QR', 'JL', 'CX', 'QF', 'AS'],
    valuePerMile: 1.4,
    surcharges: 'high',
    carrierSurcharges: { AA: 'low', AS: 'low', IB: 'moderate', AY: 'moderate', JL: 'moderate', QR: 'moderate' },
    bookingUrl: 'https://www.britishairways.com/',
    accentColor: '#1d4ed8',
    bands: {
      Y: [[7.5, 11], [11, 15], [13, 20], [20, 32], [32, 42], [40, 50], [50, 60]],
      W: [n, n, n, [40, 60], [50, 70], [60, 85], [70, 100]],
      J: [[15, 20], [22, 30], [30, 50], [50, 85], [75, 110], [90, 130], [110, 150]],
      F: [n, n, n, [80, 120], [110, 150], [130, 180], [150, 200]],
    },
    overrides: [
      { pair: 'EU-NA', carriers: ['IB'], J: [34, 50], note: 'Iberia off-peak business to Madrid from the US East Coast' },
    ],
    sweetSpots: ['Short nonstop flights on American and Alaska.', 'Iberia off-peak business class to Madrid.'],
    eliteTiers: [
      { name: 'Bronze', qualification: '300 tier points', perks: ['oneworld Ruby'] },
      { name: 'Silver', qualification: '600 tier points', perks: ['oneworld Sapphire lounge access'] },
      { name: 'Gold', qualification: '1,500 tier points', perks: ['oneworld Emerald', 'Gold Priority Reward seats'] },
    ],
  },
  {
    id: 'flyingblue',
    name: 'Air France–KLM Flying Blue',
    airline: 'AF',
    alliance: 'SkyTeam',
    currency: 'miles',
    pricingModel: 'dynamic',
    pricingNote:
      'Dynamic with a published floor per zone, plus monthly Promo Rewards (often 25–50% off on selected routes). Moderate surcharges on Air France and KLM flights from North America.',
    partners: ['KL', 'DL', 'VS', 'KE', 'AM'],
    valuePerMile: 1.3,
    surcharges: 'moderate',
    bookingUrl: 'https://www.flyingblue.com/',
    accentColor: '#0ea5e9',
    bands: {
      Y: [[5, 10], [8, 15], [10, 20], [20, 35], [30, 45], [35, 55], [40, 60]],
      W: [n, n, n, [35, 60], [50, 80], [55, 90], [60, 100]],
      J: [[15, 25], [20, 35], [25, 50], [50, 90], [70, 110], [80, 130], [90, 150]],
      F: [n, n, n, n, n, n, n],
    },
    overrides: [],
    sweetSpots: ['Promo Rewards to/from Europe.', 'Business class to Europe from about 50k one-way.'],
    eliteTiers: [
      { name: 'Silver', qualification: '100 XP', perks: ['SkyTeam Elite', 'Priority check-in'] },
      { name: 'Gold', qualification: '180 XP', perks: ['SkyTeam Elite Plus lounge access', 'Better award availability'] },
      { name: 'Platinum', qualification: '300 XP', perks: ['Wider award availability', 'Guaranteed seat on full flights'] },
    ],
  },
  {
    id: 'krisflyer',
    name: 'Singapore KrisFlyer',
    airline: 'SQ',
    alliance: 'Star Alliance',
    currency: 'miles',
    pricingModel: 'region-chart',
    pricingNote:
      'Fixed Saver and Advantage charts by zone on Singapore Airlines; separate Star Alliance partner chart. The only practical way to book Singapore’s Suites and long-haul business.',
    partners: ['UA', 'LH', 'LX', 'TK', 'NH', 'AC', 'NZ', 'OZ', 'BR', 'AI', 'ET', 'AV', 'CM'],
    valuePerMile: 1.4,
    surcharges: 'low',
    carrierSurcharges: { LH: 'moderate', LX: 'moderate' },
    bookingUrl: 'https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/',
    accentColor: '#eab308',
    bands: {
      Y: [[7.5, 12], [9, 17], [13, 26], [25, 40], [35, 55], [40, 65], [45, 75]],
      W: [n, n, [20, 35], [35, 55], [50, 75], [60, 90], [70, 105]],
      J: [[15, 25], [20, 35], [30, 50], [50, 85], [70, 110], [85, 130], [100, 160]],
      F: [n, n, n, [90, 130], [110, 160], [130, 190], [150, 220]],
    },
    overrides: [],
    sweetSpots: ['Singapore Airlines business and Suites from the US and Europe.', 'Short regional flights in Southeast Asia.'],
    eliteTiers: [
      { name: 'Elite Silver', qualification: '25,000 Elite miles', perks: ['Priority waitlist', 'Bonus miles'] },
      { name: 'Elite Gold', qualification: '50,000 Elite miles', perks: ['Star Alliance Gold lounge access'] },
      { name: 'PPS Club', qualification: 'S$25,000 PPS Value', perks: ['Better award access', 'Waived award fees'] },
    ],
  },
  {
    id: 'virgin',
    name: 'Virgin Atlantic Flying Club',
    airline: 'VS',
    alliance: 'SkyTeam',
    currency: 'points',
    pricingModel: 'region-chart',
    pricingNote:
      'Dynamic on Virgin’s own flights (with high surcharges). Partner charts for Delta, Air France/KLM and ANA, mostly without surcharges. ANA awards are a well-known sweet spot but sources disagree on 2026 pricing.',
    partners: ['DL', 'AF', 'KL', 'NH', 'KE', 'AM', 'AI'],
    valuePerMile: 1.4,
    surcharges: 'high',
    carrierSurcharges: { DL: 'low', NH: 'moderate', AF: 'moderate', KL: 'moderate', KE: 'low', AM: 'low', AI: 'low' },
    bookingUrl: 'https://www.virginatlantic.com/',
    accentColor: '#be123c',
    bands: {
      Y: [[7.5, 12.5], [10, 15], [12.5, 25], [15, 40], [25, 50], [30, 55], [35, 60]],
      W: [n, n, n, [25, 60], [35, 70], [40, 80], [50, 90]],
      J: [[15, 25], [22.5, 35], [25, 50], [30, 100], [55, 95], [60, 100], [70, 115]],
      F: [n, n, n, n, [85, 110], [85, 120], [110, 140]],
    },
    overrides: [
      { pair: 'NA-NAS', carriers: ['NH'], countries: ['Japan'], J: [47.5, 60], F: [85, 110], note: 'ANA business / first to Japan via Virgin' },
      { pair: 'EU-NA', carriers: ['DL'], J: [50, 60], note: 'Delta One to Europe on the partner chart' },
    ],
    sweetSpots: ['ANA business and first class to Japan.', 'Delta One to Europe without surcharges.'],
    eliteTiers: [
      { name: 'Red', qualification: 'Entry level', perks: ['Points earning'] },
      { name: 'Silver', qualification: '400 tier points', perks: ['SkyTeam Elite', 'Priority check-in'] },
      { name: 'Gold', qualification: '1,000 tier points', perks: ['SkyTeam Elite Plus lounge access', 'Clubhouse access'] },
    ],
  },
  {
    id: 'ana',
    name: 'ANA Mileage Club',
    airline: 'NH',
    alliance: 'Star Alliance',
    currency: 'miles',
    pricingModel: 'region-chart',
    pricingNote:
      'Round-trip awards only. Prices shown are HALF of the round-trip cost so they compare with one-way programs. ANA flights use a seasonal zone chart; partners use a distance chart. Surcharges are passed on for most carriers.',
    partners: ['UA', 'AC', 'LH', 'LX', 'TK', 'SQ', 'NZ', 'OZ', 'BR', 'AI', 'ET', 'CM', 'AV', 'EY', 'VS'],
    valuePerMile: 1.4,
    surcharges: 'moderate',
    carrierSurcharges: { UA: 'none', AC: 'low' },
    roundTripOnly: true,
    bookingUrl: 'https://www.ana.co.jp/en/us/amc/',
    accentColor: '#1e40af',
    bands: {
      Y: [[5, 10], [7.5, 15], [10, 20], [20, 30], [25, 35], [30, 40], [35, 50]],
      W: [n, n, n, [30, 45], [37.5, 55], [45, 65], [50, 75]],
      J: [[12.5, 20], [15, 25], [20, 35], [40, 55], [42.5, 60], [52, 70], [60, 85]],
      F: [n, n, n, [70, 90], [55, 80], [80, 110], [90, 130]],
    },
    overrides: [
      { pair: 'NA-NAS', carriers: ['NH'], countries: ['Japan'], J: [37.5, 45], F: [55, 75], note: 'ANA’s own flights to Japan (half of a round trip)' },
    ],
    sweetSpots: ['ANA business and first to Japan on ANA’s own chart.', 'Round-the-World award.'],
    eliteTiers: [
      { name: 'Bronze', qualification: '30,000 Premium Points', perks: ['Star Alliance Silver'] },
      { name: 'Platinum', qualification: '50,000 Premium Points', perks: ['Star Alliance Gold lounge access', 'Priority award waitlist'] },
      { name: 'Diamond', qualification: '100,000 Premium Points', perks: ['Expanded award availability', 'Upgrade points'] },
    ],
  },
  {
    id: 'emirates',
    name: 'Emirates Skywards',
    airline: 'EK',
    alliance: null,
    currency: 'miles',
    pricingModel: 'dynamic',
    pricingNote:
      'Saver and Flex award prices by zone, increasingly dynamic. Surcharges are high on most Emirates awards. Also books Qantas.',
    partners: ['QF'],
    valuePerMile: 1.1,
    surcharges: 'high',
    bookingUrl: 'https://www.emirates.com/',
    accentColor: '#b91c1c',
    bands: {
      Y: [[7.5, 15], [12, 25], [20, 35], [30, 50], [40, 60], [45, 75], [55, 90]],
      W: [n, n, [25, 45], [40, 70], [55, 85], [65, 100], [75, 115]],
      J: [[15, 30], [25, 45], [35, 70], [60, 105], [80, 130], [95, 150], [110, 180]],
      F: [n, n, [50, 90], [90, 150], [110, 180], [130, 215], [150, 250]],
    },
    overrides: [],
    sweetSpots: ['Emirates first class (with shower and lounge) on shorter fifth-freedom routes.'],
    eliteTiers: [
      { name: 'Silver', qualification: '25,000 tier miles', perks: ['Priority check-in', 'Bonus miles'] },
      { name: 'Gold', qualification: '50,000 tier miles', perks: ['Lounge access', 'Guaranteed seat on full flights'] },
      { name: 'Platinum', qualification: '150,000 tier miles', perks: ['First-class lounge access', 'Chauffeur on some fares'] },
    ],
  },
  {
    id: 'turkish',
    name: 'Turkish Miles&Smiles',
    airline: 'TK',
    alliance: 'Star Alliance',
    currency: 'miles',
    pricingModel: 'region-chart',
    pricingNote:
      'Fixed region chart for Star Alliance partners; Turkish’s own flights have Promotion and Classic awards. Sources disagreed in 2026 on North America–Europe business (45k vs 65k), so the range spans both.',
    partners: ['UA', 'AC', 'LH', 'LX', 'SQ', 'NH', 'NZ', 'OZ', 'BR', 'AI', 'CM', 'AV', 'ET'],
    valuePerMile: 1.3,
    surcharges: 'moderate',
    carrierSurcharges: { UA: 'none' },
    bookingUrl: 'https://www.turkishairlines.com/',
    accentColor: '#dc2626',
    bands: {
      Y: [[5, 7.5], [7.5, 12.5], [10, 20], [15, 30], [25, 45], [30, 50], [35, 60]],
      W: [n, n, n, n, n, n, n],
      J: [[10, 15], [15, 25], [20, 40], [45, 65], [60, 80], [65, 90], [75, 110]],
      F: [n, n, n, [65, 100], [85, 120], [90, 130], [110, 150]],
    },
    overrides: [
      { pair: 'NA-NA', carriers: ['UA'], Y: [10, 12.5], J: [15, 25], note: 'United domestic on the partner chart, any distance' },
    ],
    sweetSpots: ['United domestic flights (including Hawaii) at flat partner prices.', 'Star Alliance business to Europe.'],
    eliteTiers: [
      { name: 'Classic Plus', qualification: '25,000 status miles', perks: ['Star Alliance Silver'] },
      { name: 'Elite', qualification: '40,000 status miles', perks: ['Star Alliance Gold lounge access'] },
      { name: 'Elite Plus', qualification: '80,000 status miles', perks: ['Upgrade vouchers', 'Companion benefits'] },
    ],
  },
]

export const PROGRAMS_BY_ID = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]))

export const PROGRAMS_META = {
  lastUpdated: '2026-11-12',
  disclaimer:
    'Award prices are typical ranges compiled by hand from public sources in November 2026, not live availability. Saver seats are limited, prices change without notice, and dynamic programs can price far above these ranges. Always find the actual seat on the airline’s site before transferring points — transfers are usually instant and can’t be undone.',
}
