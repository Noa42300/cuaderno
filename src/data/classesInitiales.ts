// Les 10 classes de l'année 2026-2027, ajoutées une seule fois au premier lancement
// (si une classe du même nom existe déjà, elle n'est pas dupliquée ; si la prof en supprime une,
// elle ne revient pas).

import { all, get, put, uid } from '../db/db'
import type { Cecrl, Classe, Niveau } from '../db/types'

const COULEURS = ['#C84B31', '#1C6E8C', '#2F7D5B', '#A11C3A', '#D98A2B', '#6A4C93', '#1F3A5F', '#B5651D', '#3E8E9E', '#8E5572']

const CLASSES: [string, Niveau, string, Cecrl, number][] = [
  ['5e D', '5e', 'LV2', 'A1+', 2.5],
  ['4e C', '4e', 'LV2', 'A2', 2.5],
  ['4e D', '4e', 'LV2', 'A2', 2.5],
  ['3e B', '3e', 'LV2', 'A2', 2.5],
  ['3e C', '3e', 'LV2', 'A2', 2.5],
  ['3e D', '3e', 'LV2', 'A2', 2.5],
  ['1re A', '1re', 'LVB', 'B1', 2],
  ['1re B', '1re', 'LVB', 'B1', 2],
  ['Tle A', 'Tle', 'LVB', 'B1', 2],
  ['Tle B', 'Tle', 'LVB', 'B1', 2],
]

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export async function ajouterClassesInitiales(forcer = false) {
  if (!forcer && (await get('meta', 'seed-classes-v1'))) return 0
  const existantes = (await all<Classe>('classes')).map((c) => norm(c.nom))
  let n = 0
  for (const [i, [nom, niveau, option, cecrlVise, heuresHebdo]] of CLASSES.entries()) {
    if (existantes.some((e) => e.startsWith(norm(nom)))) continue
    await put<Classe>('classes', { id: uid(), nom, niveau, option, effectif: 0, cecrlVise, couleur: COULEURS[i], heuresHebdo })
    n++
  }
  await put('meta', { id: 'seed-classes-v1', le: new Date().toISOString() })
  return n
}
