/**
 * Award regions. Airline award charts each draw their own zone lines; these
 * ten are the common denominator most charts roughly agree on. Hawaii and
 * Alaska sit in North America; Egypt and Türkiye's Asian side are filed where
 * most charts put them (Middle East, Europe).
 */
export const REGIONS = {
  NA: 'North America',
  CAR: 'Mexico, Central America & Caribbean',
  SA: 'South America',
  EU: 'Europe',
  ME: 'Middle East',
  AF: 'Africa',
  SAS: 'South Asia',
  NAS: 'North Asia',
  SEA: 'Southeast Asia',
  OC: 'Oceania',
}

// [IATA, city, country, region, lat, lon]
const RAW = [
  // North America
  ['ATL', 'Atlanta', 'United States', 'NA', 33.64, -84.43],
  ['BOS', 'Boston', 'United States', 'NA', 42.36, -71.01],
  ['ORD', 'Chicago', 'United States', 'NA', 41.98, -87.9],
  ['DFW', 'Dallas–Fort Worth', 'United States', 'NA', 32.9, -97.04],
  ['DEN', 'Denver', 'United States', 'NA', 39.86, -104.67],
  ['DTW', 'Detroit', 'United States', 'NA', 42.21, -83.35],
  ['HNL', 'Honolulu', 'United States', 'NA', 21.32, -157.92],
  ['IAH', 'Houston', 'United States', 'NA', 29.98, -95.34],
  ['LAS', 'Las Vegas', 'United States', 'NA', 36.08, -115.15],
  ['LAX', 'Los Angeles', 'United States', 'NA', 33.94, -118.41],
  ['MIA', 'Miami', 'United States', 'NA', 25.79, -80.29],
  ['MSP', 'Minneapolis', 'United States', 'NA', 44.88, -93.22],
  ['JFK', 'New York (JFK)', 'United States', 'NA', 40.64, -73.78],
  ['EWR', 'Newark', 'United States', 'NA', 40.69, -74.17],
  ['LGA', 'New York (LaGuardia)', 'United States', 'NA', 40.78, -73.87],
  ['MCO', 'Orlando', 'United States', 'NA', 28.43, -81.31],
  ['PHL', 'Philadelphia', 'United States', 'NA', 39.87, -75.24],
  ['PHX', 'Phoenix', 'United States', 'NA', 33.43, -112.01],
  ['SAN', 'San Diego', 'United States', 'NA', 32.73, -117.19],
  ['SFO', 'San Francisco', 'United States', 'NA', 37.62, -122.38],
  ['SEA', 'Seattle', 'United States', 'NA', 47.45, -122.31],
  ['IAD', 'Washington (Dulles)', 'United States', 'NA', 38.95, -77.46],
  ['CLT', 'Charlotte', 'United States', 'NA', 35.21, -80.94],
  ['AUS', 'Austin', 'United States', 'NA', 30.19, -97.67],
  ['ANC', 'Anchorage', 'United States', 'NA', 61.17, -149.99],
  ['YYZ', 'Toronto', 'Canada', 'NA', 43.68, -79.63],
  ['YVR', 'Vancouver', 'Canada', 'NA', 49.19, -123.18],
  ['YUL', 'Montréal', 'Canada', 'NA', 45.47, -73.74],
  ['YYC', 'Calgary', 'Canada', 'NA', 51.13, -114.01],
  // Mexico, Central America & Caribbean
  ['MEX', 'Mexico City', 'Mexico', 'CAR', 19.44, -99.07],
  ['CUN', 'Cancún', 'Mexico', 'CAR', 21.04, -86.87],
  ['GDL', 'Guadalajara', 'Mexico', 'CAR', 20.52, -103.31],
  ['SJD', 'Los Cabos', 'Mexico', 'CAR', 23.15, -109.72],
  ['PVR', 'Puerto Vallarta', 'Mexico', 'CAR', 20.68, -105.25],
  ['SJO', 'San José', 'Costa Rica', 'CAR', 9.99, -84.2],
  ['LIR', 'Liberia', 'Costa Rica', 'CAR', 10.59, -85.54],
  ['PTY', 'Panama City', 'Panama', 'CAR', 9.07, -79.38],
  ['SJU', 'San Juan', 'Puerto Rico', 'CAR', 18.44, -66.0],
  ['PUJ', 'Punta Cana', 'Dominican Republic', 'CAR', 18.57, -68.36],
  ['MBJ', 'Montego Bay', 'Jamaica', 'CAR', 18.5, -77.91],
  ['NAS', 'Nassau', 'Bahamas', 'CAR', 25.04, -77.47],
  ['AUA', 'Aruba', 'Aruba', 'CAR', 12.5, -70.02],
  // South America
  ['BOG', 'Bogotá', 'Colombia', 'SA', 4.7, -74.15],
  ['MDE', 'Medellín', 'Colombia', 'SA', 6.16, -75.42],
  ['CTG', 'Cartagena', 'Colombia', 'SA', 10.44, -75.51],
  ['LIM', 'Lima', 'Peru', 'SA', -12.02, -77.11],
  ['UIO', 'Quito', 'Ecuador', 'SA', -0.13, -78.36],
  ['SCL', 'Santiago', 'Chile', 'SA', -33.39, -70.79],
  ['EZE', 'Buenos Aires', 'Argentina', 'SA', -34.82, -58.54],
  ['GRU', 'São Paulo', 'Brazil', 'SA', -23.44, -46.47],
  ['GIG', 'Rio de Janeiro', 'Brazil', 'SA', -22.81, -43.25],
  // Europe
  ['LHR', 'London (Heathrow)', 'United Kingdom', 'EU', 51.47, -0.45],
  ['EDI', 'Edinburgh', 'United Kingdom', 'EU', 55.95, -3.36],
  ['DUB', 'Dublin', 'Ireland', 'EU', 53.42, -6.27],
  ['CDG', 'Paris', 'France', 'EU', 49.01, 2.55],
  ['NCE', 'Nice', 'France', 'EU', 43.66, 7.21],
  ['AMS', 'Amsterdam', 'Netherlands', 'EU', 52.31, 4.76],
  ['BRU', 'Brussels', 'Belgium', 'EU', 50.9, 4.48],
  ['FRA', 'Frankfurt', 'Germany', 'EU', 50.03, 8.56],
  ['MUC', 'Munich', 'Germany', 'EU', 48.35, 11.79],
  ['BER', 'Berlin', 'Germany', 'EU', 52.37, 13.5],
  ['ZRH', 'Zürich', 'Switzerland', 'EU', 47.46, 8.55],
  ['GVA', 'Geneva', 'Switzerland', 'EU', 46.24, 6.11],
  ['VIE', 'Vienna', 'Austria', 'EU', 48.11, 16.57],
  ['PRG', 'Prague', 'Czechia', 'EU', 50.1, 14.26],
  ['WAW', 'Warsaw', 'Poland', 'EU', 52.17, 20.97],
  ['BUD', 'Budapest', 'Hungary', 'EU', 47.44, 19.26],
  ['CPH', 'Copenhagen', 'Denmark', 'EU', 55.62, 12.66],
  ['ARN', 'Stockholm', 'Sweden', 'EU', 59.65, 17.92],
  ['OSL', 'Oslo', 'Norway', 'EU', 60.19, 11.1],
  ['HEL', 'Helsinki', 'Finland', 'EU', 60.32, 24.96],
  ['KEF', 'Reykjavík', 'Iceland', 'EU', 63.98, -22.61],
  ['MAD', 'Madrid', 'Spain', 'EU', 40.47, -3.56],
  ['BCN', 'Barcelona', 'Spain', 'EU', 41.3, 2.08],
  ['LIS', 'Lisbon', 'Portugal', 'EU', 38.77, -9.13],
  ['FCO', 'Rome', 'Italy', 'EU', 41.8, 12.25],
  ['MXP', 'Milan', 'Italy', 'EU', 45.63, 8.72],
  ['VCE', 'Venice', 'Italy', 'EU', 45.51, 12.35],
  ['ATH', 'Athens', 'Greece', 'EU', 37.94, 23.94],
  ['IST', 'Istanbul', 'Türkiye', 'EU', 41.26, 28.74],
  // Middle East
  ['DXB', 'Dubai', 'United Arab Emirates', 'ME', 25.25, 55.36],
  ['AUH', 'Abu Dhabi', 'United Arab Emirates', 'ME', 24.43, 54.65],
  ['DOH', 'Doha', 'Qatar', 'ME', 25.27, 51.61],
  ['RUH', 'Riyadh', 'Saudi Arabia', 'ME', 24.96, 46.7],
  ['JED', 'Jeddah', 'Saudi Arabia', 'ME', 21.68, 39.16],
  ['TLV', 'Tel Aviv', 'Israel', 'ME', 32.01, 34.89],
  ['AMM', 'Amman', 'Jordan', 'ME', 31.72, 35.99],
  ['MCT', 'Muscat', 'Oman', 'ME', 23.59, 58.28],
  ['CAI', 'Cairo', 'Egypt', 'ME', 30.12, 31.41],
  // Africa
  ['CMN', 'Casablanca', 'Morocco', 'AF', 33.37, -7.59],
  ['RAK', 'Marrakesh', 'Morocco', 'AF', 31.61, -8.04],
  ['ADD', 'Addis Ababa', 'Ethiopia', 'AF', 8.98, 38.8],
  ['NBO', 'Nairobi', 'Kenya', 'AF', -1.32, 36.93],
  ['LOS', 'Lagos', 'Nigeria', 'AF', 6.58, 3.32],
  ['ACC', 'Accra', 'Ghana', 'AF', 5.61, -0.17],
  ['JNB', 'Johannesburg', 'South Africa', 'AF', -26.14, 28.24],
  ['CPT', 'Cape Town', 'South Africa', 'AF', -33.97, 18.6],
  ['ZNZ', 'Zanzibar', 'Tanzania', 'AF', -6.22, 39.22],
  ['MRU', 'Mauritius', 'Mauritius', 'AF', -20.43, 57.68],
  // South Asia
  ['DEL', 'Delhi', 'India', 'SAS', 28.56, 77.1],
  ['BOM', 'Mumbai', 'India', 'SAS', 19.09, 72.87],
  ['BLR', 'Bengaluru', 'India', 'SAS', 13.2, 77.71],
  ['MAA', 'Chennai', 'India', 'SAS', 12.99, 80.17],
  ['HYD', 'Hyderabad', 'India', 'SAS', 17.24, 78.43],
  ['CCU', 'Kolkata', 'India', 'SAS', 22.65, 88.45],
  ['COK', 'Kochi', 'India', 'SAS', 10.15, 76.4],
  ['GOI', 'Goa', 'India', 'SAS', 15.38, 73.83],
  ['AMD', 'Ahmedabad', 'India', 'SAS', 23.08, 72.63],
  ['CMB', 'Colombo', 'Sri Lanka', 'SAS', 7.18, 79.88],
  ['MLE', 'Malé', 'Maldives', 'SAS', 4.19, 73.53],
  ['KTM', 'Kathmandu', 'Nepal', 'SAS', 27.7, 85.36],
  ['DAC', 'Dhaka', 'Bangladesh', 'SAS', 23.84, 90.4],
  // North Asia
  ['HND', 'Tokyo (Haneda)', 'Japan', 'NAS', 35.55, 139.78],
  ['NRT', 'Tokyo (Narita)', 'Japan', 'NAS', 35.77, 140.39],
  ['KIX', 'Osaka', 'Japan', 'NAS', 34.43, 135.24],
  ['ICN', 'Seoul', 'South Korea', 'NAS', 37.46, 126.44],
  ['PEK', 'Beijing', 'China', 'NAS', 40.08, 116.58],
  ['PVG', 'Shanghai', 'China', 'NAS', 31.14, 121.81],
  ['CAN', 'Guangzhou', 'China', 'NAS', 23.39, 113.3],
  ['HKG', 'Hong Kong', 'Hong Kong', 'NAS', 22.31, 113.92],
  ['TPE', 'Taipei', 'Taiwan', 'NAS', 25.08, 121.23],
  // Southeast Asia
  ['SIN', 'Singapore', 'Singapore', 'SEA', 1.36, 103.99],
  ['BKK', 'Bangkok', 'Thailand', 'SEA', 13.69, 100.75],
  ['HKT', 'Phuket', 'Thailand', 'SEA', 8.11, 98.31],
  ['KUL', 'Kuala Lumpur', 'Malaysia', 'SEA', 2.75, 101.71],
  ['CGK', 'Jakarta', 'Indonesia', 'SEA', -6.13, 106.66],
  ['DPS', 'Bali', 'Indonesia', 'SEA', -8.75, 115.17],
  ['MNL', 'Manila', 'Philippines', 'SEA', 14.51, 121.02],
  ['SGN', 'Ho Chi Minh City', 'Vietnam', 'SEA', 10.82, 106.65],
  ['HAN', 'Hanoi', 'Vietnam', 'SEA', 21.22, 105.81],
  // Oceania
  ['SYD', 'Sydney', 'Australia', 'OC', -33.95, 151.18],
  ['MEL', 'Melbourne', 'Australia', 'OC', -37.67, 144.84],
  ['BNE', 'Brisbane', 'Australia', 'OC', -27.38, 153.12],
  ['PER', 'Perth', 'Australia', 'OC', -31.94, 115.97],
  ['AKL', 'Auckland', 'New Zealand', 'OC', -37.01, 174.79],
  ['ZQN', 'Queenstown', 'New Zealand', 'OC', -45.02, 168.74],
  ['NAN', 'Nadi', 'Fiji', 'OC', -17.76, 177.44],
  ['PPT', 'Papeete (Tahiti)', 'French Polynesia', 'OC', -17.55, -149.61],
]

/**
 * Foreign (non-North-American) airlines that fly from a few airports, where
 * it changes the answer: the three New York-area airports, so someone who
 * flies out of all of them can see which one has the better award. Airlines
 * based in the airport's own region aren't listed -- they can always connect
 * through their own hubs. Airports without a list allow every airline the
 * region-level rules allow. Hand-checked November 2026; schedules change.
 */
const AIRPORT_CARRIERS = {
  JFK: ['AF', 'KL', 'BA', 'IB', 'AY', 'LH', 'LX', 'TK', 'VS', 'EK', 'QR', 'EY', 'AI', 'NH', 'JL', 'KE', 'OZ', 'CX', 'SQ', 'QF', 'NZ', 'AM', 'CM', 'AV', 'LA'],
  EWR: ['LH', 'LX', 'TK', 'SQ', 'AI', 'BA', 'CM'],
  // LaGuardia's perimeter rule keeps it to US, Canadian and short
  // Caribbean flights, so only North American airlines fly from it.
  LGA: [],
}

export const AIRPORTS = RAW.map(([iata, city, country, region, lat, lon]) => ({
  iata,
  city,
  country,
  region,
  lat,
  lon,
  foreignCarriers: AIRPORT_CARRIERS[iata] ?? null,
}))

export const AIRPORTS_BY_IATA = Object.fromEntries(AIRPORTS.map((a) => [a.iata, a]))

/** "Seoul (ICN)"; cities that already carry a qualifier become "Tokyo (Haneda · HND)". */
export const airportLabel = (a) => {
  if (!a) return ''
  return a.city.endsWith(')') ? `${a.city.slice(0, -1)} · ${a.iata})` : `${a.city} (${a.iata})`
}
