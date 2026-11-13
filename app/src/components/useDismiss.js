import { useEffect } from 'react'

/** Calls `close` on a pointer press outside `ref` while `open` is true. */
export default function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [ref, open, close])
}
