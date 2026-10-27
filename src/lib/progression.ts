// Moteur de progression : à chaque cours de l'emploi du temps (hors vacances et jours fériés)
// correspond la séance suivante de la programmation du niveau. C'est ce qui permet de proposer
// automatiquement un titre et une fiche complète sur chaque créneau.

import { put } from '../db/db'
import { creneauxDuJour, nouvelleSeance } from '../db/modeles'
import type { Classe, Creneau, ISODate, Reglages, Seance } from '../db/types'
import { enVacances, periodes } from '../data/officiel'
import { niveauProg, PROGRAMMATIONS, type DocProg, type NiveauProg, type SeqProg } from '../data/programmations'
import { POINTS_LANGUE } from '../data/grammaire'
import { rituelDuJour } from '../data/rituels'
import { ajouterJours, minutesEntre } from './dates'
import { genererSeance, TYPES_SEANCE, type ParamsGenerateur, type TypeSeance } from './generateur'

export interface SeanceProg {
  cle: string // « 5e:1:3 » = niveau : n° séquence : n° séance
  niveau: NiveauProg
  seqIndex: number
  seq: SeqProg
  numero: number // dans la séquence (1…)
  total: number
  type: TypeSeance
  doc?: DocProg
  point?: string
  titre: string
}

const court = (t: string) => t.split(/ \(| — /)[0]

function seancesSequence(niveau: NiveauProg, seq: SeqProg, seqIndex: number): SeanceProg[] {
  const [d1, d2, d3] = seq.docs
  const [p1, p2] = seq.points
  const plan: { type: TypeSeance; doc?: DocProg; point?: string; titre: string }[] = [
    { type: 'decouverte', doc: d1, point: p1, titre: `Découverte : ${court(d1.titre)}` },
    { type: 'approfondissement', doc: d1, point: p1, titre: `${court(d1.titre)} : approfondissement` },
    { type: 'langue', doc: d1, point: p1, titre: `Point de langue : ${POINTS_LANGUE[p1]?.label ?? p1}` },
    { type: 'decouverte', doc: d2, point: p2, titre: `Découverte : ${court(d2.titre)}` },
    { type: 'approfondissement', doc: d2, point: p2, titre: `${court(d2.titre)} : approfondissement` },
    { type: 'langue', doc: d2, point: p2, titre: `Point de langue : ${POINTS_LANGUE[p2]?.label ?? p2}` },
    { type: 'decouverte', doc: d3, point: p1, titre: `Découverte : ${court(d3.titre)}` },
    { type: 'approfondissement', doc: d3, point: p2, titre: `${court(d3.titre)} : approfondissement` },
    { type: 'preparation', point: p1, titre: 'Préparation de la tâche finale' },
    { type: 'tache', point: p1, titre: 'Tâche finale (évaluation)' },
    { type: 'bilan', point: p1, titre: 'Bilan, remédiation & culture' },
  ]
  return plan.map((x, i) => ({
    cle: `${niveau}:${seqIndex + 1}:${i + 1}`, niveau, seqIndex, seq, numero: i + 1, total: plan.length, ...x,
    titre: `${seq.titre} — ${x.titre}`,
  }))
}

const cache = new Map<NiveauProg, SeanceProg[]>()
/** Toutes les séances de l'année pour un niveau, dans l'ordre. */
export function progressionDuNiveau(niveau: NiveauProg): SeanceProg[] {
  if (!cache.has(niveau)) cache.set(niveau, PROGRAMMATIONS[niveau].flatMap((s, i) => seancesSequence(niveau, s, i)))
  return cache.get(niveau)!
}

export interface Occurrence { date: ISODate; creneau: Creneau; index: number; suite?: boolean }

/**
 * Tous les cours d'une classe sur l'année, numérotés dans la progression.
 * — Par défaut, la progression suit la programmation période par période : les séances des séquences
 *   prévues pour une période sont réparties sur tous les cours de cette période. Quand il y a plus de
 *   cours que de séances, une séance s'étale sur deux cours (le second est marqué « suite »).
 * — Si la prof a « recalé » la classe (classe.depart), on suit strictement l'ordre à partir de ce point.
 */
export function planningClasse(classe: Classe, creneaux: Creneau[], r: Reglages): Occurrence[] {
  const cc = creneaux.filter((c) => c.classeId === classe.id)
  if (!cc.length) return []
  const cours = (de: ISODate, a: ISODate) => {
    const res: { date: ISODate; creneau: Creneau }[] = []
    for (let d = de; d < a; d = ajouterJours(d, 1)) if (!enVacances(d, r.zone)) for (const c of creneauxDuJour(d, cc, r)) res.push({ date: d, creneau: c })
    return res
  }
  if (classe.depart) return cours(classe.depart.date, r.finAnnee).map((o, k) => ({ ...o, index: classe.depart!.index + k }))

  const n = niveauProg(classe.niveau)
  const prog = n ? progressionDuNiveau(n) : []
  const pers = periodes(r.zone, r.rentree)
  const premier = (p: number) => { const i = prog.findIndex((x) => x.seq.periode >= p); return i < 0 ? prog.length : i }
  const res: Occurrence[] = []
  let reste = 0
  pers.forEach((per, pi) => {
    const liste = cours(per.debut, pi === pers.length - 1 ? r.finAnnee : per.fin)
    const s = Math.max(reste, premier(pi + 1))
    const e = pi === pers.length - 1 ? prog.length : premier(pi + 2)
    const nbSeances = e - s
    if (nbSeances > 0 && liste.length >= nbSeances) {
      let prec = -1
      liste.forEach((o, k) => {
        const index = s + Math.floor((k * nbSeances) / liste.length)
        res.push({ ...o, index, suite: index === prec })
        prec = index
      })
      reste = e
    } else {
      liste.forEach((o, k) => res.push({ ...o, index: s + k }))
      reste = s + liste.length
    }
  })
  return res
}

/** Index : « date|créneau » → occurrence, pour toutes les classes. */
export function indexPlanning(classes: Classe[], creneaux: Creneau[], r: Reglages) {
  const m = new Map<string, Occurrence>()
  for (const c of classes) for (const o of planningClasse(c, creneaux, r)) m.set(`${o.date}|${o.creneau.id}`, o)
  return m
}

/** Séance de progression proposée pour un cours (null : progression terminée ou niveau sans programmation). */
export function proposition(classe: Classe | undefined, occ: Occurrence | undefined): SeanceProg | null {
  if (!classe || !occ) return null
  const n = niveauProg(classe.niveau)
  const sp = n ? progressionDuNiveau(n)[occ.index] : undefined
  if (!sp) return null
  return occ.suite ? enSuite(sp) : sp
}

/** Deuxième cours consacré à une même séance : approfondissement / entraînement. */
function enSuite(sp: SeanceProg): SeanceProg {
  return { ...sp, cle: `${sp.cle}+`, titre: `${sp.titre} (suite)`, type: sp.type === 'decouverte' ? 'approfondissement' : sp.type === 'tache' ? 'tache' : sp.type === 'langue' ? 'langue' : 'approfondissement' }
}

/** Retrouve une séance de progression à partir de sa clé (« 5e:2:3 » ou « 5e:2:3+ » pour une suite). */
export function seanceParCle(cle: string): SeanceProg | null {
  const n = cle.split(':')[0] as NiveauProg
  if (!PROGRAMMATIONS[n]) return null
  const sp = progressionDuNiveau(n).find((x) => x.cle === cle.replace(/\+$/, ''))
  return sp ? (cle.endsWith('+') ? enSuite(sp) : sp) : null
}

export function paramsDepuisProgression(sp: SeanceProg, classe: Classe, date: ISODate, duree: number): ParamsGenerateur {
  const { seq, type, doc } = sp
  const lyc = sp.niveau === '1re' || sp.niveau === 'Tle'
  const rit = rituelDuJour(sp.niveau, date, classe.id)
  const activite = type === 'tache' || type === 'preparation' ? seq.tache.al
    : type === 'langue' ? 'CE'
      : type === 'bilan' ? 'EE'
        : type === 'approfondissement' ? (doc?.al === 'EOC' || doc?.al === 'EOI' ? 'EE' : 'EOI')
          : (doc?.al ?? 'CO')
  const secondaires = type === 'langue' ? ['EE', 'EOC'] as const : type === 'approfondissement' && doc ? [doc.al] : type === 'bilan' ? ['CO', 'EOI'] as const : ['EOC'] as const
  const pts = seq.points.map((k) => POINTS_LANGUE[k]?.label).join(' · ')
  return {
    titre: sp.titre,
    theme: seq.culturel,
    programme: seq.axe,
    activite,
    secondaires: secondaires.filter((x) => x !== activite),
    point: sp.point ?? 'aucun',
    lexique: '',
    lexiquePaires: seq.lexique,
    docNature: doc?.nature ?? '',
    docTitre: doc?.titre ?? '',
    docSource: doc?.source ?? '',
    docAChoisir: doc?.aChoisir,
    videoUrl: doc?.video,
    cecrlDe: classe.cecrlVise,
    cecrlVers: classe.cecrlVise,
    duree,
    type,
    college: !lyc,
    lancement: sp.numero === 1,
    problematique: seq.problematique,
    tacheFinale: seq.tache.texte,
    pointsSequence: [...seq.points],
    rituels: type === 'tache' ? [] : rit.rituels,
    traductions: type === 'tache' ? [] : rit.traductions,
    progressionRef: [
      `Programmation ${sp.niveau} — Période ${seq.periode} · Séquence ${sp.seqIndex + 1}/${PROGRAMMATIONS[sp.niveau].length} « ${seq.titre} »`,
      `Axe / thématique : ${seq.axe}`,
      `Problématique : ${seq.problematique}`,
      `Séance ${sp.numero}/${sp.total} : ${TYPES_SEANCE[type]}`,
      `Points de langue de la séquence : ${pts}`,
      `Tâche finale (${seq.tache.al}) : ${seq.tache.texte}`,
    ].join('\n'),
  }
}

/** Crée (et enregistre) la fiche complète d'un cours à partir de la séance de progression proposée. */
export async function creerDepuisProgression(classe: Classe, date: ISODate, creneau: Creneau | undefined, sp: SeanceProg | null): Promise<Seance> {
  const base = nouvelleSeance(classe, date, creneau)
  const duree = creneau ? minutesEntre(creneau.debut, creneau.fin) : 55
  const s: Seance = sp
    ? { ...base, ...genererSeance(paramsDepuisProgression(sp, classe, date, duree)), cleProgression: sp.cle }
    : { ...base, titre: 'Séance libre — approfondissement / projet' }
  await put('seances', s)
  return s
}
