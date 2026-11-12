import { createContext, useContext, useEffect, useReducer } from 'react'
import { loadSaved, saveProfile, clearSaved } from '../utils/persistence.js'

const OptimizerContext = createContext(null)

export const MAX_COMPARE = 3

const initialState = {
  // Profile (saved only when `remember` is on)
  memberships: [], // [{ id, programId, balance, tier }]
  bankPoints: [], // [{ id, cardId, balance }]
  homeAirport: '', // IATA
  // Trip (never saved)
  origin: '', // IATA; blank = use homeAirport
  destination: '', // IATA
  cabin: 'J',
  travellers: 1,
  roundTrip: false,
  compareTo: [], // extra destination IATAs
  remember: false,
}

let nextRowId = 1

function init() {
  const saved = loadSaved()
  if (!saved) return initialState
  const maxId = Math.max(0, ...saved.memberships.map((m) => m.id), ...saved.bankPoints.map((b) => b.id))
  nextRowId = Math.max(nextRowId, maxId + 1)
  return { ...initialState, ...saved, remember: true }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MEMBERSHIP':
      if (state.memberships.some((m) => m.programId === action.programId)) return state
      return {
        ...state,
        memberships: [...state.memberships, { id: nextRowId++, programId: action.programId, balance: null, tier: null }],
      }
    case 'UPDATE_MEMBERSHIP':
      return {
        ...state,
        memberships: state.memberships.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      }
    case 'REMOVE_MEMBERSHIP':
      return { ...state, memberships: state.memberships.filter((m) => m.id !== action.id) }
    case 'ADD_BANK_POINTS':
      if (state.bankPoints.some((b) => b.cardId === action.cardId)) return state
      return { ...state, bankPoints: [...state.bankPoints, { id: nextRowId++, cardId: action.cardId, balance: null }] }
    case 'UPDATE_BANK_POINTS':
      return {
        ...state,
        bankPoints: state.bankPoints.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      }
    case 'REMOVE_BANK_POINTS':
      return { ...state, bankPoints: state.bankPoints.filter((b) => b.id !== action.id) }
    case 'SET':
      // Simple scalar fields: homeAirport, origin, destination, cabin, travellers, roundTrip, remember
      return { ...state, ...action.patch }
    case 'ADD_COMPARE':
      if (
        !action.iata ||
        action.iata === state.destination ||
        state.compareTo.includes(action.iata) ||
        state.compareTo.length >= MAX_COMPARE
      ) {
        return state
      }
      return { ...state, compareTo: [...state.compareTo, action.iata] }
    case 'REMOVE_COMPARE':
      return { ...state, compareTo: state.compareTo.filter((c) => c !== action.iata) }
    case 'NEW_TRIP':
      return { ...state, origin: '', destination: '', cabin: 'J', travellers: 1, roundTrip: false, compareTo: [] }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function OptimizerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // Mirror the profile to localStorage only while opted in; erase it the
  // moment the user isn't (unticked, or RESET). Trip fields are never saved.
  const { remember, memberships, bankPoints, homeAirport } = state
  useEffect(() => {
    if (remember) saveProfile({ memberships, bankPoints, homeAirport })
    else clearSaved()
  }, [remember, memberships, bankPoints, homeAirport])

  return <OptimizerContext.Provider value={{ state, dispatch }}>{children}</OptimizerContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useOptimizer() {
  const ctx = useContext(OptimizerContext)
  if (!ctx) throw new Error('useOptimizer must be used within OptimizerProvider')
  return ctx
}
