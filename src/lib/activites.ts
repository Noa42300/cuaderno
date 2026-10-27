// Attribution des activités d'entrée : une activité différente à chaque cours d'une classe,
// dans l'ordre de la banque de son niveau, à partir du 2 novembre 2026 (puis la banque recommence).

import { creneauxDuJour } from '../db/modeles'
import type { Classe, Creneau, ISODate, Reglages } from '../db/types'
import { enVacances } from '../data/officiel'
import { ACTIVITES_ENTREE, type ActiviteEntree } from '../data/activites'
import { niveauProg } from '../data/programmations'
import { ajouterJours } from './dates'

export const DEBUT_ACTIVITES = '2026-11-02'
export const FIN_ACTIVITES = '2026-12-19' // début des vacances de Noël

export interface CoursActivite { date: ISODate; creneau: Creneau; numero: number; activite: ActiviteEntree }

/** Tous les cours de la classe de `de` à `a` (exclu), avec leur activité. */
export function activitesDeClasse(classe: Classe, creneaux: Creneau[], r: Reglages, a: ISODate = FIN_ACTIVITES): CoursActivite[] {
  const n = niveauProg(classe.niveau)
  if (!n) return []
  const banque = ACTIVITES_ENTREE[n]
  const cc = creneaux.filter((c) => c.classeId === classe.id)
  const res: CoursActivite[] = []
  for (let d = DEBUT_ACTIVITES; d < a; d = ajouterJours(d, 1)) {
    if (enVacances(d, r.zone)) continue
    for (const c of creneauxDuJour(d, cc, r)) res.push({ date: d, creneau: c, numero: res.length + 1, activite: banque[res.length % banque.length] })
  }
  return res
}

/** Activité prévue pour un cours donné (ou la première du jour si le créneau n'est pas précisé). */
export function activiteDuCours(classe: Classe, date: ISODate, creneauId: string | undefined, creneaux: Creneau[], r: Reglages): CoursActivite | null {
  if (date < DEBUT_ACTIVITES) return null
  const liste = activitesDeClasse(classe, creneaux, r, ajouterJours(date, 1))
  return liste.find((x) => x.date === date && (!creneauId || x.creneau.id === creneauId)) ?? null
}
