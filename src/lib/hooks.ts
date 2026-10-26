import { useEffect, useState, useSyncExternalStore } from 'react'
import { onDbChange } from '../db/db'

/** Exécute une requête IndexedDB et la relance à chaque modification de la base. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]): T | undefined {
  const [val, setVal] = useState<T>()
  useEffect(() => {
    let vivant = true
    const run = () => fn().then((v) => vivant && setVal(v))
    run()
    const off = onDbChange(run)
    return () => {
      vivant = false
      off()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return val
}

// ——— Routeur minimal par hash (#/jour/2026-10-26) : compatible GitHub Pages.
const lireHash = () => location.hash.replace(/^#\/?/, '')
export function useRoute(): string[] {
  const h = useSyncExternalStore(
    (cb) => {
      addEventListener('hashchange', cb)
      return () => removeEventListener('hashchange', cb)
    },
    lireHash,
  )
  return h.split('/').filter(Boolean).map(decodeURIComponent)
}
export const aller = (...parts: string[]) => {
  location.hash = '/' + parts.map(encodeURIComponent).join('/')
}
