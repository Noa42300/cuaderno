// Emploi du temps 2026-2027 de la prof (photo de son agenda, 27/10/2026), chargé une seule fois si
// l'emploi du temps est vide. Cases d'1 h à partir de 8 h, pause méridienne, fin à 15 h 45.
// Semaine A / B : alternance calée sur la semaine de la rentrée = semaine A (à confirmer).

import { all, get, getReglages, put, saveReglages, uid } from '../db/db'
import type { Alternance, Classe, Creneau, JourSemaine } from '../db/types'

const HORAIRES: Record<number, [string, string]> = {
  1: ['08:00', '09:00'], 2: ['09:00', '10:00'], 3: ['10:00', '11:00'], 4: ['11:00', '12:00'],
  6: ['12:45', '13:45'], 7: ['13:45', '14:45'], 8: ['14:45', '15:45'],
}

/** [jour, case, classe, semaine] */
const EDT: [JourSemaine, number, string, Alternance][] = [
  [1, 1, '5e D', 'toutes'], [1, 2, '4e C', 'toutes'], [1, 3, '3e D', 'toutes'], [1, 4, '3e C', 'toutes'],
  [1, 6, 'Tle A', 'toutes'], [1, 7, '3e B', 'toutes'], [1, 8, '1re B', 'toutes'],
  [2, 1, '3e C', 'toutes'], [2, 2, '3e B', 'A'], [2, 2, '4e C', 'B'], [2, 3, '1re A', 'toutes'], [2, 4, '4e D', 'toutes'],
  [4, 1, '4e C', 'toutes'], [4, 2, '4e D', 'toutes'], [4, 3, 'Tle B', 'toutes'], [4, 4, '5e D', 'toutes'],
  [4, 6, '3e D', 'toutes'], [4, 7, '1re B', 'toutes'],
  [5, 1, '1re A', 'toutes'], [5, 2, 'Tle A', 'toutes'], [5, 3, '5e D', 'A'], [5, 3, '4e D', 'B'],
  [5, 4, '3e C', 'A'], [5, 4, '3e D', 'B'], [5, 6, 'Tle B', 'toutes'], [5, 7, '3e B', 'toutes'],
]

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Charge l'emploi du temps. `remplacer` : efface d'abord les créneaux existants. */
export async function chargerEdtInitial(remplacer = false) {
  if (!remplacer && (await get('meta', 'seed-edt-v1'))) return 0
  const existants = await all<Creneau>('creneaux')
  if (existants.length && !remplacer) {
    await put('meta', { id: 'seed-edt-v1', le: new Date().toISOString(), ignore: true })
    return 0
  }
  const { del } = await import('../db/db')
  for (const c of existants) await del('creneaux', c.id)
  const classes = await all<Classe>('classes')
  let n = 0
  for (const [jour, cas, nom, semaine] of EDT) {
    const c = classes.find((x) => norm(x.nom).startsWith(norm(nom)))
    if (!c) continue
    const [debut, fin] = HORAIRES[cas]
    await put<Creneau>('creneaux', { id: uid(), classeId: c.id, jour, debut, fin, salle: '', semaine })
    n++
  }
  const r = await getReglages()
  await saveReglages({
    lundiSemaineA: r.lundiSemaineA || '2026-08-31',
    heureDebutAgenda: '08:00',
    heureFinAgenda: '16:00',
    joursTravailles: [1, 2, 3, 4, 5],
  })
  await put('meta', { id: 'seed-edt-v1', le: new Date().toISOString() })
  return n
}
