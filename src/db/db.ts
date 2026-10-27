import { openDB, type IDBPDatabase } from 'idb'
import type { Reglages, StoreName } from './types'

const DB_NAME = 'cuaderno'

/**
 * Migrations versionnées. Ne JAMAIS modifier une migration déjà livrée :
 * on en ajoute une nouvelle (index = version - 1).
 */
const MIGRATIONS: Array<(db: IDBPDatabase) => void> = [
  // v1 — structure initiale
  (db) => {
    db.createObjectStore('classes', { keyPath: 'id' })
    const cr = db.createObjectStore('creneaux', { keyPath: 'id' })
    cr.createIndex('jour', 'jour')
    const se = db.createObjectStore('seances', { keyPath: 'id' })
    se.createIndex('date', 'date')
    se.createIndex('classeId', 'classeId')
    se.createIndex('sequenceId', 'sequenceId')
    const de = db.createObjectStore('devoirs', { keyPath: 'id' })
    de.createIndex('pourLe', 'pourLe')
    de.createIndex('donneLe', 'donneLe')
    const ra = db.createObjectStore('rappels', { keyPath: 'id' })
    ra.createIndex('date', 'date')
    db.createObjectStore('sequences', { keyPath: 'id' })
    const el = db.createObjectStore('eleves', { keyPath: 'id' })
    el.createIndex('classeId', 'classeId')
    const ob = db.createObjectStore('observations', { keyPath: 'id' })
    ob.createIndex('eleveId', 'eleveId')
    const pj = db.createObjectStore('piecesJointes', { keyPath: 'id' })
    pj.createIndex('seanceId', 'seanceId')
    db.createObjectStore('meta', { keyPath: 'id' })
  },
]

export const DB_VERSION = MIGRATIONS.length

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB() {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      for (let v = oldVersion; v < DB_VERSION; v++) MIGRATIONS[v](db)
    },
    blocking() {
      // Une nouvelle version de l'appli (autre onglet) veut migrer : on libère.
      dbPromise?.then((d) => d.close())
      location.reload()
    },
  })
  return dbPromise
}

// ——— Notification de changement (pour rafraîchir les écrans)
const listeners = new Set<() => void>()
export function onDbChange(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
function notify() {
  listeners.forEach((fn) => fn())
}

// ——— Accès générique
export async function all<T>(store: StoreName): Promise<T[]> {
  return (await getDB()).getAll(store) as Promise<T[]>
}
export async function byIndex<T>(store: StoreName, index: string, value: IDBValidKey): Promise<T[]> {
  return (await getDB()).getAllFromIndex(store, index, value) as Promise<T[]>
}
export async function get<T>(store: StoreName, id: string): Promise<T | undefined> {
  return (await getDB()).get(store, id) as Promise<T | undefined>
}
export async function put<T>(store: StoreName, value: T): Promise<T> {
  await (await getDB()).put(store, value)
  notify()
  return value
}
export async function del(store: StoreName, id: string) {
  await (await getDB()).delete(store, id)
  notify()
}

/** Supprime une séance avec ses devoirs et pièces jointes liés. */
export async function delSeance(id: string) {
  const db = await getDB()
  const tx = db.transaction(['seances', 'devoirs', 'piecesJointes'], 'readwrite')
  await tx.objectStore('seances').delete(id)
  for (const d of await tx.objectStore('devoirs').getAll())
    if (d.seanceId === id) await tx.objectStore('devoirs').delete(d.id)
  for (const k of await tx.objectStore('piecesJointes').index('seanceId').getAllKeys(id))
    await tx.objectStore('piecesJointes').delete(k)
  await tx.done
  notify()
}

/** Supprime une classe et tout ce qui en dépend. */
export async function delClasse(id: string) {
  const db = await getDB()
  const stores = ['classes', 'creneaux', 'seances', 'devoirs', 'eleves', 'observations'] as const
  const tx = db.transaction([...stores], 'readwrite')
  await tx.objectStore('classes').delete(id)
  for (const s of ['creneaux', 'seances', 'devoirs', 'eleves'] as const)
    for (const x of await tx.objectStore(s).getAll())
      if (x.classeId === id) await tx.objectStore(s).delete(x.id)
  const eleves = new Set((await tx.objectStore('eleves').getAll()).map((e) => e.id))
  for (const o of await tx.objectStore('observations').getAll())
    if (!eleves.has(o.eleveId)) await tx.objectStore('observations').delete(o.id)
  await tx.done
  notify()
}

// ——— Réglages
export const REGLAGES_DEFAUT: Reglages = {
  id: 'reglages',
  theme: 'systeme',
  joursTravailles: [1, 2, 3, 4, 5],
  lundiSemaineA: '',
  heureDebutAgenda: '08:00',
  heureFinAgenda: '18:00',
  zone: 'A',
  rentree: '2026-09-01',
  finAnnee: '2027-07-03',
}

export async function getReglages(): Promise<Reglages> {
  const { pinHash: _h, pinSel: _s, verrouMinutes: _v, ...r } = ((await get('meta', 'reglages')) ?? {}) as Record<string, unknown>
  return { ...REGLAGES_DEFAUT, ...(r as Partial<Reglages>) }
}
export async function saveReglages(patch: Partial<Reglages>) {
  return put('meta', { ...(await getReglages()), ...patch, id: 'reglages' })
}

/** Demande au navigateur de ne pas effacer les données (Safari les purge sinon). */
export async function demanderStockagePersistant() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist()
  } catch {
    /* non supporté */
  }
}

export const uid = () => crypto.randomUUID()
export const maintenant = () => new Date().toISOString()
