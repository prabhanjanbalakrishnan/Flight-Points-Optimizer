/**
 * Light/dark choice for the header switch. Dark is the default; the choice
 * is a per-browser convenience kept in localStorage (separate from the
 * opt-in "remember my points" profile) and applied as data-theme on <html>,
 * which index.css keys its light palette off. Storage can be blocked, so
 * every access is guarded and the app simply starts dark without it.
 */
const KEY = 'flight-points-optimizer:theme'

export function savedTheme() {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    /* storage blocked -- the choice just won't persist */
  }
}
