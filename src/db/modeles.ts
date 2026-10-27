import { all, maintenant, put, uid } from './db'
import type { Classe, Creneau, ISODate, Reglages, Seance, Sequence } from './types'
import { ajouterJours, creneauActif, jourDe, minutesEntre, semaineAB } from '../lib/dates'

export function nouvelleSeance(classe: Classe | undefined, date: ISODate | null, creneau?: Creneau): Seance {
  return {
    id: uid(),
    classeId: classe?.id ?? '',
    date,
    creneauId: creneau?.id ?? null,
    debut: creneau?.debut ?? '',
    fin: creneau?.fin ?? '',
    sequenceId: null,
    ordre: 0,
    titre: '',
    statut: 'prevue',
    dureeMin: creneau ? minutesEntre(creneau.debut, creneau.fin) : 55,
    activites: [],
    cecrlDe: classe?.cecrlVise ?? 'A1',
    cecrlVers: classe?.cecrlVise ?? 'A1',
    objectifs: { culturel: '', lexical: '', grammatical: '', phonologique: '', pragmatique: '' },
    programme: '',
    competences: '',
    progressionRef: '',
    organisation: '',
    materiel: '',
    cleProgression: '',
    support: { titre: '', nature: '', source: '', url: '' },
    videoUrl: '',
    tache: '',
    traceEcrite: '',
    deroulement: [],
    differenciation: { fragiles: '', aLaise: '' },
    obstacles: '',
    correction: '',
    exercices: [],
    diapos: [],
    bilan: '',
    creeLe: maintenant(),
    modifieLe: maintenant(),
  }
}

/** Complète les séances enregistrées par une version plus ancienne de l'appli. */
export function normaliserSeance(s: Seance): Seance {
  return { ...nouvelleSeance(undefined, null), ...s, exercices: s.exercices ?? [], diapos: s.diapos ?? [], debut: s.debut ?? '', fin: s.fin ?? '', ordre: s.ordre ?? 0 }
}

export async function toutesSeances() {
  return (await all<Seance>('seances')).map(normaliserSeance)
}

export function nouvelleSequence(): Sequence {
  return {
    id: uid(), titre: '', niveau: '5e', classeIds: [], programme: '', projetFinal: '', tacheFinale: '', evaluation: '',
    cecrlVise: 'A1', dateDebut: '', dateFin: '', couleur: '#1C6E8C', notes: '',
  }
}
export function normaliserSequence(q: Sequence): Sequence {
  return { ...nouvelleSequence(), ...q }
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

/**
 * Pose une séance sur une date pour une classe : elle se range dans le premier
 * créneau libre de cette classe ce jour-là (sinon elle reste « hors emploi du temps »).
 * Elle apparaît alors automatiquement dans l'agenda.
 */
export async function poserSeance(s: Seance, classeId: string, date: ISODate, creneaux: Creneau[], r: Reglages, seances: Seance[]) {
  const pris = new Set(seances.filter((x) => x.date === date && x.id !== s.id).map((x) => x.creneauId))
  const cr = creneauxDuJour(date, creneaux, r).find((c) => c.classeId === classeId && !pris.has(c.id))
  return put<Seance>('seances', {
    ...s,
    classeId,
    date,
    creneauId: cr?.id ?? null,
    debut: cr?.debut ?? s.debut,
    fin: cr?.fin ?? s.fin,
    dureeMin: cr ? minutesEntre(cr.debut, cr.fin) : s.dureeMin,
    modifieLe: maintenant(),
  })
}

/** Horaire effectif d'une séance (le créneau fait foi s'il existe). */
export function horaire(s: Seance, creneaux: Creneau[]) {
  const c = s.creneauId ? creneaux.find((x) => x.id === s.creneauId) : undefined
  return { debut: c?.debut ?? s.debut, fin: c?.fin ?? s.fin }
}
