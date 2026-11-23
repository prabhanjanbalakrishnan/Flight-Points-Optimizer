import { AIRPORTS_BY_IATA } from './airports.js'
import { distanceMiles } from '../utils/geo.js'

/**
 * Operating airlines, used to decide which carriers realistically fly
 * between two award regions (`url`, the airline's own website, is linked
 * from the Programs page). Region-level only -- this never claims a
 * specific route or flight exists.
 *
 * A carrier "covers" a region pair when:
 *  - both ends are its home region (domestic / intra-region), or
 *  - one end is its home region and the other is in `serves`, or
 *  - both ends are in `connects` (and `serves`) and one of its `hubs` sits
 *    roughly between them -- i.e. it's a sensible one-stop through its hub (Gulf carriers between Europe and Asia,
 *    Asian carriers between North America and Southeast Asia, and so on).
 */
const ALL = ['NA', 'CAR', 'SA', 'EU', 'ME', 'AF', 'SAS', 'NAS', 'SEA', 'OC']
const allBut = (...skip) => ALL.filter((r) => !skip.includes(r))

export const AIRLINES = {
  UA: { name: 'United', url: 'https://www.united.com/', alliance: 'Star Alliance', home: 'NA', hubs: ['EWR', 'ORD', 'IAH', 'SFO', 'DEN', 'IAD'], serves: ALL, connects: ['CAR', 'SA', 'NAS', 'OC'] },
  AA: { name: 'American', url: 'https://www.aa.com/', alliance: 'oneworld', home: 'NA', hubs: ['DFW', 'MIA', 'JFK', 'LAX', 'ORD', 'CLT'], serves: allBut('SAS', 'SEA', 'AF'), connects: ['CAR', 'SA', 'NAS', 'OC'] },
  DL: { name: 'Delta', url: 'https://www.delta.com/', alliance: 'SkyTeam', home: 'NA', hubs: ['ATL', 'JFK', 'LAX', 'SEA', 'DTW', 'MSP'], serves: allBut('SEA'), connects: ['CAR', 'SA', 'NAS', 'OC'] },
  AS: { name: 'Alaska', url: 'https://www.alaskaair.com/', alliance: 'oneworld', home: 'NA', hubs: ['SEA'], serves: ['NA', 'CAR', 'EU', 'NAS'], connects: [] },
  B6: { name: 'JetBlue', url: 'https://www.jetblue.com/', alliance: null, home: 'NA', hubs: ['JFK', 'BOS'], serves: ['NA', 'CAR', 'SA', 'EU'], connects: [] },
  WN: { name: 'Southwest', url: 'https://www.southwest.com/', alliance: null, home: 'NA', hubs: ['DFW'], serves: ['NA', 'CAR'], connects: [] },
  AC: { name: 'Air Canada', url: 'https://www.aircanada.com/', alliance: 'Star Alliance', home: 'NA', hubs: ['YYZ', 'YVR', 'YUL'], serves: ALL, connects: allBut('NA', 'ME', 'AF') },
  CM: { name: 'Copa', url: 'https://www.copaair.com/', alliance: 'Star Alliance', home: 'CAR', hubs: ['PTY'], serves: ['CAR', 'NA', 'SA'], connects: ['NA', 'CAR', 'SA'] },
  AM: { name: 'Aeroméxico', url: 'https://www.aeromexico.com/', alliance: 'SkyTeam', home: 'CAR', hubs: ['MEX'], serves: ['CAR', 'NA', 'SA', 'EU', 'NAS'], connects: ['NA', 'SA', 'NAS'] },
  AV: { name: 'Avianca', url: 'https://www.avianca.com/', alliance: 'Star Alliance', home: 'SA', hubs: ['BOG'], serves: ['SA', 'CAR', 'NA', 'EU'], connects: ['SA', 'CAR', 'NA', 'EU'] },
  LA: { name: 'LATAM', url: 'https://www.latamairlines.com/', alliance: null, home: 'SA', hubs: ['SCL', 'GRU', 'LIM'], serves: ['SA', 'CAR', 'NA', 'EU'], connects: ['SA', 'NA', 'EU'] },
  BA: { name: 'British Airways', url: 'https://www.britishairways.com/', alliance: 'oneworld', home: 'EU', hubs: ['LHR'], serves: ALL, connects: allBut('EU', 'OC') },
  // Aer Lingus isn't in oneworld (it's IAG-owned and shares Avios with BA and Iberia).
  // Within Europe it only flies to and from Ireland (`intraFrom`).
  EI: { name: 'Aer Lingus', url: 'https://www.aerlingus.com/', alliance: null, home: 'EU', hubs: ['DUB'], serves: ['EU', 'NA'], connects: [], intraFrom: ['Ireland'] },
  IB: { name: 'Iberia', url: 'https://www.iberia.com/', alliance: 'oneworld', home: 'EU', hubs: ['MAD'], serves: ['EU', 'NA', 'CAR', 'SA', 'AF'], connects: ['NA', 'CAR', 'SA', 'AF'] },
  AY: { name: 'Finnair', url: 'https://www.finnair.com/', alliance: 'oneworld', home: 'EU', hubs: ['HEL'], serves: ['EU', 'NA', 'ME', 'SAS', 'NAS', 'SEA'], connects: ['NA', 'SAS', 'NAS', 'SEA'] },
  AF: { name: 'Air France', url: 'https://www.airfrance.com/', alliance: 'SkyTeam', home: 'EU', hubs: ['CDG'], serves: ALL, connects: allBut('EU', 'OC') },
  KL: { name: 'KLM', url: 'https://www.klm.com/', alliance: 'SkyTeam', home: 'EU', hubs: ['AMS'], serves: ALL, connects: allBut('EU', 'OC') },
  LH: { name: 'Lufthansa', url: 'https://www.lufthansa.com/', alliance: 'Star Alliance', home: 'EU', hubs: ['FRA', 'MUC'], serves: allBut('OC'), connects: allBut('EU', 'OC') },
  LX: { name: 'SWISS', url: 'https://www.swiss.com/', alliance: 'Star Alliance', home: 'EU', hubs: ['ZRH'], serves: allBut('OC', 'CAR'), connects: allBut('EU', 'OC', 'CAR') },
  TK: { name: 'Turkish Airlines', url: 'https://www.turkishairlines.com/', alliance: 'Star Alliance', home: 'EU', hubs: ['IST'], serves: ALL, connects: ALL },
  VS: { name: 'Virgin Atlantic', url: 'https://www.virginatlantic.com/', alliance: 'SkyTeam', home: 'EU', hubs: ['LHR'], serves: ['EU', 'NA', 'CAR', 'AF', 'SAS', 'ME'], connects: ['NA', 'CAR', 'AF', 'SAS'] },
  EK: { name: 'Emirates', url: 'https://www.emirates.com/', alliance: null, home: 'ME', hubs: ['DXB'], serves: ALL, connects: ALL },
  QR: { name: 'Qatar Airways', url: 'https://www.qatarairways.com/', alliance: 'oneworld', home: 'ME', hubs: ['DOH'], serves: ALL, connects: ALL },
  EY: { name: 'Etihad', url: 'https://www.etihad.com/', alliance: null, home: 'ME', hubs: ['AUH'], serves: allBut('CAR', 'SA'), connects: allBut('CAR', 'SA') },
  ET: { name: 'Ethiopian', url: 'https://www.ethiopianairlines.com/', alliance: 'Star Alliance', home: 'AF', hubs: ['ADD'], serves: allBut('OC', 'SA'), connects: allBut('OC', 'SA') },
  AI: { name: 'Air India', url: 'https://www.airindia.com/', alliance: 'Star Alliance', home: 'SAS', hubs: ['DEL', 'BOM'], serves: ['SAS', 'NA', 'EU', 'ME', 'SEA', 'OC', 'NAS'], connects: ['NA', 'EU', 'SEA', 'OC'] },
  NH: { name: 'ANA', url: 'https://www.ana.co.jp/', alliance: 'Star Alliance', home: 'NAS', hubs: ['HND', 'NRT'], serves: ['NAS', 'NA', 'EU', 'SAS', 'SEA', 'OC'], connects: ['NA', 'SAS', 'SEA', 'OC'] },
  JL: { name: 'Japan Airlines', url: 'https://www.jal.com/', alliance: 'oneworld', home: 'NAS', hubs: ['HND', 'NRT'], serves: ['NAS', 'NA', 'EU', 'SAS', 'SEA', 'OC'], connects: ['NA', 'SAS', 'SEA', 'OC'] },
  KE: { name: 'Korean Air', url: 'https://www.koreanair.com/', alliance: 'SkyTeam', home: 'NAS', hubs: ['ICN'], serves: ['NAS', 'NA', 'EU', 'ME', 'SEA', 'OC'], connects: ['NA', 'SEA', 'OC'] },
  OZ: { name: 'Asiana', url: 'https://www.flyasiana.com/', alliance: 'Star Alliance', home: 'NAS', hubs: ['ICN'], serves: ['NAS', 'NA', 'EU', 'SEA', 'OC'], connects: ['NA', 'SEA', 'OC'] },
  BR: { name: 'EVA Air', url: 'https://www.evaair.com/', alliance: 'Star Alliance', home: 'NAS', hubs: ['TPE'], serves: ['NAS', 'NA', 'EU', 'SEA', 'OC'], connects: ['NA', 'SEA'] },
  CX: { name: 'Cathay Pacific', url: 'https://www.cathaypacific.com/', alliance: 'oneworld', home: 'NAS', hubs: ['HKG'], serves: allBut('CAR', 'SA'), connects: ['NA', 'SAS', 'SEA', 'OC', 'ME'] },
  SQ: { name: 'Singapore Airlines', url: 'https://www.singaporeair.com/', alliance: 'Star Alliance', home: 'SEA', hubs: ['SIN'], serves: allBut('CAR', 'SA', 'ME'), connects: ['NA', 'EU', 'SAS', 'NAS', 'OC', 'AF'] },
  QF: { name: 'Qantas', url: 'https://www.qantas.com/', alliance: 'oneworld', home: 'OC', hubs: ['SYD', 'MEL'], serves: ['OC', 'NA', 'EU', 'SEA', 'NAS', 'SAS', 'AF'], connects: ['NA', 'SEA', 'SAS', 'NAS'] },
  NZ: { name: 'Air New Zealand', url: 'https://www.airnewzealand.com/', alliance: 'Star Alliance', home: 'OC', hubs: ['AKL'], serves: ['OC', 'NA', 'NAS', 'SEA'], connects: ['NA', 'NAS', 'SEA'] },
}

/**
 * Airlines that sell a true First cabin on at least some long-haul (or, for
 * American, transcontinental) flights. Everyone else tops out at business,
 * so a First award on them isn't offered. November 2026; fleets change.
 */
export const FIRST_CLASS = new Set(['AA', 'BA', 'AF', 'LH', 'LX', 'EK', 'QR', 'EY', 'NH', 'JL', 'CX', 'SQ', 'AI', 'KE', 'QF'])

// A one-stop through a hub counts only if it isn't a wild detour: hub
// routing at most this many times the direct distance. 1.5 keeps e.g.
// Qatar New York–Johannesburg via Doha (~1.5x) and drops Emirates
// New York–Mexico City via Dubai.
const MAX_DETOUR = 1.5

// Airport-level check, only for airports that list their foreign airlines
// (see AIRPORT_CARRIERS in airports.js): a home-region airline can always
// connect you; anyone else has to actually fly there.
const servesAirport = (al, code, airport) =>
  !airport.foreignCarriers || al.home === airport.region || airport.foreignCarriers.includes(code)

/**
 * Whether airline `code` plausibly flies between airports `o` and `d`
 * (either direction). Region-level guidance, not a schedule.
 */
export function carrierCovers(code, o, d) {
  const al = AIRLINES[code]
  if (!al) return false
  if (!servesAirport(al, code, o) || !servesAirport(al, code, d)) return false
  const a = o.region
  const b = d.region
  if (a === b) {
    if (al.home !== a) return false
    // Carriers with `intraFrom` fly within their home region only to/from those countries.
    return !al.intraFrom || al.intraFrom.includes(o.country) || al.intraFrom.includes(d.country)
  }
  if (a === al.home) return al.serves.includes(b)
  if (b === al.home) return al.serves.includes(a)
  if (!(al.connects.includes(a) && al.connects.includes(b) && al.serves.includes(a) && al.serves.includes(b))) {
    return false
  }
  const direct = distanceMiles(o, d)
  return al.hubs.some((h) => {
    const hub = AIRPORTS_BY_IATA[h]
    return hub && distanceMiles(o, hub) + distanceMiles(hub, d) <= direct * MAX_DETOUR
  })
}
