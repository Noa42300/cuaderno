import { maintenant, uid } from './db'
import type { Classe, Creneau, ISODate, Reglages, Seance } from './types'
import { ajouterJours, creneauActif, jourDe, minutesEntre, semaineAB } from '../lib/dates'

export function nouvelleSeance(classe: Classe, date: ISODate | null, creneau?: Creneau): Seance {
  return {
    id: uid(),
    classeId: classe.id,
    date,
    creneauId: creneau?.id ?? null,
    sequenceId: null,
    titre: '',
    statut: 'prevue',
    dureeMin: creneau ? minutesEntre(creneau.debut, creneau.fin) : 55,
    activites: [],
    cecrlDe: classe.cecrlVise,
    cecrlVers: classe.cecrlVise,
    objectifs: { culturel: '', lexical: '', grammatical: '', phonologique: '', pragmatique: '' },
    programme: '',
    support: { titre: '', nature: '', source: '', url: '' },
    videoUrl: '',
    tache: '',
    traceEcrite: '',
    deroulement: [],
    differenciation: { fragiles: '', aLaise: '' },
    obstacles: '',
    correction: '',
    bilan: '',
    creeLe: maintenant(),
    modifieLe: maintenant(),
  }
}

/** Créneaux de l'EDT actifs pour une date donnée (jour + alternance A/B), triés. */
export function creneauxDuJour(date: ISODate, creneaux: Creneau[], r: Reglages) {
  const j = jourDe(date)
  if (!r.joursTravailles.includes(j as Reglages['joursTravailles'][number])) return []
  const ab = semaineAB(date, r.lundiSemaineA)
  return creneaux.filter((c) => c.jour === j && creneauActif(c.semaine, ab)).sort((a, b) => a.debut.localeCompare(b.debut))
}

/** Prochaine date de cours d'une classe après `date` (pour les devoirs). */
export function prochainCours(classeId: string, date: ISODate, creneaux: Creneau[], r: Reglages): ISODate {
  const cc = creneaux.filter((c) => c.classeId === classeId)
  for (let i = 1; i <= 21; i++) {
    const d = ajouterJours(date, i)
    if (creneauxDuJour(d, cc, r).length) return d
  }
  return ajouterJours(date, 7)
}
