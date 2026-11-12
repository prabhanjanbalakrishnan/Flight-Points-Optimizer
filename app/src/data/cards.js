/**
 * Transferable bank-points currencies and the airline programs (from
 * programs.js) they move into. `ratio` = airline miles per 1 bank point.
 *
 * Hand-compiled November 2026 from issuer pages and The Points Guy /
 * NerdWallet / One Mile at a Time transfer-partner tables. Only partners
 * that map to a program in this app are listed. Ratios change (Citi
 * changed several on 19 April 2026) and transfer bonuses come and go, so
 * every result tells the user to confirm with the issuer first.
 * `verify: true` marks links that rest on a single or older source.
 */
export const CARDS = [
  {
    id: 'chase-ur',
    name: 'Chase Ultimate Rewards',
    group: 'US',
    examples: 'Sapphire Preferred, Sapphire Reserve, Ink Preferred',
    transfers: {
      united: 1,
      aeroplan: 1,
      ba: 1,
      flyingblue: 1,
      krisflyer: 1,
      virgin: 1,
      jetblue: 1,
      southwest: 1,
      emirates: 1,
    },
  },
  {
    id: 'amex-mr',
    name: 'Amex Membership Rewards',
    group: 'US',
    examples: 'Platinum, Gold, Green, Business Platinum',
    transfers: {
      delta: 1,
      aeroplan: 1,
      ba: 1,
      flyingblue: 1,
      krisflyer: 1,
      virgin: 1,
      ana: 1,
      emirates: 0.8,
      jetblue: 0.8,
    },
  },
  {
    id: 'citi-ty',
    name: 'Citi ThankYou Points',
    group: 'US',
    examples: 'Strata Premier, Strata Elite',
    transfers: {
      american: 1,
      flyingblue: 1,
      krisflyer: 1,
      turkish: 1,
      virgin: 1,
      jetblue: 1,
      emirates: 0.8,
    },
  },
  {
    id: 'capital-one',
    name: 'Capital One Miles',
    group: 'US',
    examples: 'Venture X, Venture, Spark Miles',
    transfers: {
      aeroplan: 1,
      ba: 1,
      flyingblue: 1,
      krisflyer: 1,
      turkish: 1,
      virgin: 1,
      emirates: 0.75,
      jetblue: 0.6,
    },
  },
  {
    id: 'bilt',
    name: 'Bilt Rewards',
    group: 'US',
    examples: 'Bilt Mastercard',
    transfers: {
      american: 1,
      united: 1,
      alaska: 1,
      aeroplan: 1,
      ba: 1,
      flyingblue: 1,
      turkish: 1,
      virgin: 1,
      emirates: 1,
      southwest: 1,
    },
  },
  {
    id: 'wells-fargo',
    name: 'Wells Fargo Rewards',
    group: 'US',
    examples: 'Autograph Journey',
    transfers: { ba: 1, flyingblue: 1 },
  },
  {
    id: 'hdfc',
    name: 'HDFC Reward Points',
    group: 'India',
    examples: 'Infinia, Diners Club Black',
    verify: true,
    transfers: { krisflyer: 1, airindia: 1, flyingblue: 1 },
  },
]

export const CARDS_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]))

/** Every card that can send points to `programId`. */
export const cardsInto = (programId) => CARDS.filter((c) => c.transfers[programId])
