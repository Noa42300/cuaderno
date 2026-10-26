import { getDB, DB_VERSION } from './db'
import { STORES, type StoreName } from './types'

export interface Sauvegarde {
  app: 'cuaderno'
  version: number
  exporteLe: string
  data: Partial<Record<StoreName, unknown[]>>
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((ok, ko) => {
    const r = new FileReader()
    r.onload = () => ok(r.result as string)
    r.onerror = () => ko(r.error)
    r.readAsDataURL(b)
  })

/** Sauvegarde COMPLÈTE (y compris élèves) : fichier personnel, à garder pour soi. */
export async function exporterTout(): Promise<Sauvegarde> {
  const db = await getDB()
  const data: Sauvegarde['data'] = {}
  for (const s of STORES) {
    const rows = await db.getAll(s)
    if (s === 'piecesJointes')
      data[s] = await Promise.all(rows.map(async (r) => ({ ...r, blob: await blobToDataUrl(r.blob) })))
    else data[s] = rows
  }
  return { app: 'cuaderno', version: DB_VERSION, exporteLe: new Date().toISOString(), data }
}

/** Restauration : REMPLACE toutes les données actuelles. */
export async function importerTout(s: Sauvegarde) {
  if (s?.app !== 'cuaderno' || typeof s.data !== 'object') throw new Error('Ce fichier n’est pas une sauvegarde Cuaderno.')
  if (s.version > DB_VERSION) throw new Error('Sauvegarde issue d’une version plus récente de l’appli : mets l’appli à jour d’abord.')
  const db = await getDB()
  const tx = db.transaction([...STORES], 'readwrite')
  for (const st of STORES) {
    const store = tx.objectStore(st)
    await store.clear()
    for (const row of s.data[st] ?? []) {
      const r = row as Record<string, unknown>
      if (st === 'piecesJointes' && typeof r.blob === 'string') r.blob = await (await fetch(r.blob)).blob()
      await store.put(r)
    }
  }
  await tx.done
  location.reload()
}

/** Téléchargement direct par ancre (marche aussi en PWA installée). */
export function telecharger(nom: string, contenu: Blob) {
  const url = URL.createObjectURL(contenu)
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
