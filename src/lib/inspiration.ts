// Assistant « Inspiración » — 100 % local et déterministe.
// 1) analyser() lit la demande en langage courant (classe, axe terminé, thème, grammaire, durée…) ;
// 2) proposer() croise avec le programme, ce que la classe a déjà fait et la banque de séquences,
//    et classe les séquences possibles en expliquant pourquoi ;
// 3) planifier() pose la séquence choisie sur les prochains cours de la classe.

import { put, uid } from '../db/db'
import { creneauxDuJour, nouvelleSeance } from '../db/modeles'
import type { Classe, Creneau, ISODate, Reglages, Seance, Sequence } from '../db/types'
import { enVacances, periodes, programmeDe } from '../data/officiel'
import { niveauProg, PROGRAMMATIONS, type NiveauProg, type SeqProg } from '../data/programmations'
import { POINTS_LANGUE } from '../data/grammaire'
import { BANQUE, notionsDe } from '../data/inspiration'
import { ajouterJours, aujourdhui, minutesEntre } from './dates'
import { genererSeance } from './generateur'
import { paramsDepuisProgression, planningClasse, progressionDuNiveau, seancesSequence } from './progression'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ')
const sansAxe = (a: string) => a.replace(/^Axe \d+ — /, '').replace(/ \(.*\)$/, '')
const MOTS_VIDES = new Set(['dans', 'avec', 'pour', 'mes', 'les', 'des', 'une', 'axe', 'sur', 'que', 'qui', 'est', 'monde', 'hispanique', 'entre', 'faire', 'apres', 'quoi'])

const NIVEAUX: [NiveauProg, RegExp][] = [
  ['Tle', /\b(tle|terminales?|term)\b/],
  ['1re', /\b(1re|1ere|premieres?)\b/],
  ['3e', /\b(3e|3eme|troisiemes?)\b/],
  ['4e', /\b(4e|4eme|quatriemes?)\b/],
  ['5e', /\b(5e|5eme|cinquiemes?)\b/],
]

const GRAMMAIRE: [string, RegExp][] = [
  ['subjuntivo', /subjonctif|subjuntivo/], ['ser_estar', /ser.{0,3}estar/], ['gustar', /gustar|encantar|gouts?\b/],
  ['preterito', /passe simple|indefinido|preterit/], ['imperfecto', /imparfait|imperfecto/], ['perfecto', /passe compose|perfecto/],
  ['futuro', /futur/], ['condicional', /conditionnel|condicional/], ['imperativo', /imperatif|imperativo/],
  ['comparatifs', /compar/], ['obligacion', /obligation|tener que|hay que/], ['reflexivos', /pronomina|reflexi/],
  ['posesivos', /possessi|posesiv/], ['hay_estar', /\bhay\b|localis/], ['presente_irr', /diphtong|irreguli/],
]

export interface Analyse {
  texte: string
  classes: Classe[]
  niveau: NiveauProg | null
  axesTermines: string[]
  axesVoulus: string[]
  motsTheme: string[]
  seqTerminees: string[]
  points: string[]
  nbSeances: number | null
  intention: 'suite' | 'idees' | 'seance'
}

/** Tous les axes connus pour un niveau (programme officiel + programmation + banque). */
function axesDuNiveau(n: NiveauProg): string[] {
  const off = programmeDe(n)?.axes ?? []
  return [...new Set([...off, ...PROGRAMMATIONS[n].map((s) => s.axe), ...BANQUE.filter((b) => b.niveaux.includes(n)).map((b) => b.axe)])]
}

function axeMentionne(t: string, axe: string, n: NiveauProg | null): boolean {
  const a = norm(sansAxe(axe))
  if (t.includes(a)) return true
  const num = axe.match(/^Axe (\d)/)?.[1]
  if (n && num && new RegExp(`\\baxe ${num}\\b`).test(t)) return true
  const mots = a.split(/[^a-z]+/).filter((m) => m.length > 4 && !MOTS_VIDES.has(m))
  return mots.length > 0 && mots.filter((m) => t.includes(m)).length >= Math.min(2, mots.length)
}

export function analyser(texte: string, classes: Classe[]): Analyse {
  const t = norm(texte)
  // Classe(s) : « Tle A », « mes terminales B », « 3e C »…
  let niveau: NiveauProg | null = null
  let choisies: Classe[] = []
  for (const [n, re] of NIVEAUX) {
    const m = t.match(new RegExp(re.source + '\\s*([a-d])?\\b'))
    if (!m) continue
    niveau = n
    const lettre = m[m.length - 1]
    const duNiveau = classes.filter((c) => c.niveau === n)
    choisies = lettre ? duNiveau.filter((c) => norm(c.nom).replace(/\s/g, '').includes(`${norm(n)}${lettre}`)) : duNiveau
    if (!choisies.length) choisies = duNiveau
    break
  }
  if (!choisies.length) {
    choisies = classes.filter((c) => t.replace(/\s/g, '').includes(norm(c.nom).replace(/\s/g, '')))
    niveau = choisies[0] ? niveauProg(choisies[0].niveau) : null
  }
  // Axes : on cherche « fini / terminé » à proximité pour savoir si l'axe est fait ou voulu.
  const axes = niveau ? axesDuNiveau(niveau) : [...new Set(Object.keys(PROGRAMMATIONS).flatMap((n) => axesDuNiveau(n as NiveauProg)))]
  const mentionnes = axes.filter((a) => axeMentionne(t, a, niveau))
  const fini = /(fini|termine|acheve|boucle|fin de|apres|derriere|ensuite|suite)/.test(t)
  const veut = /(commencer|aborder|travailler|attaquer|faire|lancer)\s+(l |sur l )?axe/.test(t)
  // Une séquence citée par son titre (« ont fini Clandestino ») compte comme terminée.
  const toutes = niveau ? [...PROGRAMMATIONS[niveau], ...BANQUE.filter((b) => b.niveaux.includes(niveau!))] : []
  const seqCitees = fini && !veut ? toutes.filter((sq) => t.includes(norm(sq.titre).replace(/[¡!¿?]/g, '').trim())) : []
  const axesTermines = fini && !veut ? [...new Set([...mentionnes, ...seqCitees.map((x) => x.axe)])] : []
  const axesVoulus = fini && !veut ? [] : mentionnes
  const motsCites = new Set([...seqCitees.map((x) => x.titre), ...mentionnes.map(sansAxe)].flatMap((x) => norm(x).split(/[^a-z0-9]+/)))
  // Thème libre : mots significatifs qui correspondent à un document ou un titre de séquence.
  const motsTheme = [...new Set(t.split(/[^a-z0-9]+/).filter((m) => m.length > 3 && !MOTS_VIDES.has(m) && !motsCites.has(m)))]
    .filter((m) => [...Object.values(PROGRAMMATIONS).flat(), ...BANQUE].some((s) => norm(`${s.titre} ${s.culturel} ${s.docs.map((d) => `${d.titre} ${d.source}`).join(' ')}`).includes(m)))
  const nb = t.match(/(\d+)\s*seances?/)
  return {
    texte, classes: choisies, niveau, axesTermines, axesVoulus, motsTheme, seqTerminees: seqCitees.map((x) => x.id),
    points: GRAMMAIRE.filter(([, re]) => re.test(t)).map(([k]) => k),
    nbSeances: nb ? Number(nb[1]) : /une seance|1 seance/.test(t) ? 1 : null,
    intention: fini ? 'suite' : /seance/.test(t) && !/sequence/.test(t) ? 'seance' : 'idees',
  }
}

export interface Proposition {
  seq: SeqProg
  niveau: NiveauProg
  source: 'programmation' | 'banque'
  score: number
  raisons: string[]
}

export interface Contexte { classes: Classe[]; creneaux: Creneau[]; reglages: Reglages; seances: Seance[] }

/** Axes déjà traités par une classe (cours passés de la progression + fiches faites). */
export function axesFaits(classe: Classe, ctx: Contexte): string[] {
  const n = niveauProg(classe.niveau)
  if (!n) return []
  const prog = progressionDuNiveau(n)
  const passes = planningClasse(classe, ctx.creneaux, ctx.reglages).filter((o) => o.date < aujourdhui())
  const faits = new Set<string>()
  // Une séquence compte comme traitée si on a passé sa tâche finale.
  for (const o of passes) { const sp = prog[o.index]; if (sp?.type === 'tache') faits.add(sp.seq.axe) }
  for (const s of ctx.seances) if (s.classeId === classe.id && s.statut === 'faite' && s.programme && /Tâche finale/.test(s.titre)) faits.add(s.programme)
  return [...faits]
}

export function proposer(a: Analyse, ctx: Contexte) {
  const n = a.niveau ?? (a.classes[0] && niveauProg(a.classes[0].niveau))
  if (!n) return null
  const classe = a.classes[0]
  const faits = new Set([...(classe ? axesFaits(classe, ctx) : []), ...a.axesTermines].map((x) => norm(sansAxe(x))))
  const notionsFinies = a.axesTermines.flatMap(notionsDe)
  const perActuelle = periodes(ctx.reglages.zone, ctx.reglages.rentree).findIndex((p) => aujourdhui() >= p.debut && aujourdhui() < p.fin) + 1
  const offAxes = programmeDe(n)?.axes ?? []
  const axesRestants = offAxes.filter((x) => !faits.has(norm(sansAxe(x))))

  const candidats: Proposition[] = [
    ...PROGRAMMATIONS[n].map((seq) => ({ seq, niveau: n, source: 'programmation' as const, score: 0, raisons: [] as string[] })),
    ...BANQUE.filter((b) => b.niveaux.includes(n)).map((seq) => ({ seq, niveau: n, source: 'banque' as const, score: 0, raisons: [] as string[] })),
  ]
  for (const p of candidats) {
    const axe = norm(sansAxe(p.seq.axe))
    const r = p.raisons
    if (a.seqTerminees.includes(p.seq.id)) { p.score -= 20; continue }
    if (faits.has(axe) && !a.axesVoulus.some((v) => norm(sansAxe(v)) === axe)) { p.score -= 10; continue }
    if (offAxes.length) { p.score += 3; r.push(`Axe pas encore traité cette année (${axesRestants.length} restant${axesRestants.length > 1 ? 's' : ''} sur ${offAxes.length}).`) }
    if (a.axesVoulus.some((v) => norm(sansAxe(v)) === axe)) { p.score += 6; r.push('C’est l’axe que tu demandes.') }
    const communes = notionsDe(p.seq.axe).filter((x) => notionsFinies.includes(x))
    if (communes.length) { p.score += communes.length; r.push(`Continuité avec « ${sansAxe(a.axesTermines[0])} » : notion${communes.length > 1 ? 's' : ''} commune${communes.length > 1 ? 's' : ''} « ${communes.join(', ')} » — les élèves réinvestissent ce qu’ils viennent d’apprendre.`) }
    if (/^Axe 6/.test(p.seq.axe)) { p.score += n === '5e' ? 3 : 1; r.push(n === '5e' ? 'Axe 6 obligatoire en 5e.' : 'Axe 6 (aire hispanophone) vivement recommandé.') }
    if (p.source === 'programmation' && perActuelle > 0 && (p.seq.periode === perActuelle || p.seq.periode === perActuelle + 1)) { p.score += 1; r.push(`Prévue en période ${p.seq.periode} dans ta programmation.`) }
    const texteSeq = norm(`${p.seq.titre} ${p.seq.culturel} ${p.seq.docs.map((d) => `${d.titre} ${d.source}`).join(' ')}`)
    const themes = a.motsTheme.filter((m) => texteSeq.includes(m))
    if (themes.length) { p.score += 4 * themes.length; r.push(`Contient ce que tu cherches : « ${themes.join(', ')} ».`) }
    const pts = a.points.filter((k) => p.seq.points.includes(k))
    if (pts.length) { p.score += 3; r.push(`Travaille ${pts.map((k) => POINTS_LANGUE[k]?.label).join(' et ')}.`) }
    if (p.seq.docs.some((d) => d.video)) { p.score += 0.5; r.push('Vidéo déjà trouvée pour au moins un document.') }
    if (p.source === 'banque') r.push('Séquence complémentaire (hors programmation de départ).')
  }
  const tries = candidats.filter((p) => p.score > -5).sort((x, y) => y.score - x.score)
  const libelles = [...offAxes, ...a.axesTermines]
  const faitsLisibles = [...faits].map((f) => sansAxe(libelles.find((x) => norm(sansAxe(x)) === f) ?? f))
  return { niveau: n, classe, faits: [...new Set(faitsLisibles)], axesRestants, recommandation: tries[0] ?? null, autres: tries.slice(1, 4) }
}

/** Les 11 séances d'une séquence proposée. */
export function seancesDe(p: Proposition) {
  const i = PROGRAMMATIONS[p.niveau].findIndex((s) => s.id === p.seq.id)
  return seancesSequence(p.niveau, p.seq, i)
}

/**
 * Pose la séquence sur les prochains cours de la classe à partir de `depuis`.
 * — Séquence de la programmation : on recale la progression (les fiches se génèrent à l'ouverture).
 * — Séquence de la banque : on crée une séquence personnelle + les 11 fiches complètes sur les cours.
 */
export async function planifier(p: Proposition, classe: Classe, depuis: ISODate, ctx: Contexte) {
  const prog = progressionDuNiveau(p.niveau)
  const idxProg = prog.findIndex((s) => s.seq.id === p.seq.id)
  if (p.source === 'programmation' && idxProg >= 0) {
    await put<Classe>('classes', { ...classe, depart: { date: depuis, index: idxProg } })
    return { mode: 'recale' as const, nb: 11 }
  }
  const sequence: Sequence = {
    id: uid(), titre: p.seq.titre, niveau: classe.niveau, classeIds: [classe.id], programme: p.seq.axe,
    projetFinal: '', tacheFinale: p.seq.tache.texte, evaluation: '', cecrlVise: classe.cecrlVise,
    dateDebut: depuis, dateFin: '', couleur: '#1C6E8C', notes: `Problématique : ${p.seq.problematique}`,
  }
  const seances = seancesDe(p)
  const cc = ctx.creneaux.filter((c) => c.classeId === classe.id)
  const pris = new Set(ctx.seances.filter((s) => s.classeId === classe.id).map((s) => `${s.date}|${s.creneauId}`))
  let k = 0
  let d = depuis
  let derniere = depuis
  for (let garde = 0; k < seances.length && garde < 200; garde++, d = ajouterJours(d, 1)) {
    if (enVacances(d, ctx.reglages.zone)) continue
    for (const cr of creneauxDuJour(d, cc, ctx.reglages)) {
      if (k >= seances.length || pris.has(`${d}|${cr.id}`)) continue
      const sp = seances[k]
      const params = paramsDepuisProgression(sp, classe, d, minutesEntre(cr.debut, cr.fin))
      const s: Seance = {
        ...nouvelleSeance(classe, d, cr), ...genererSeance(params), sequenceId: sequence.id, ordre: k, cleProgression: '',
        progressionRef: [`Séquence complémentaire « ${p.seq.titre} » (proposée par Inspiración)`, `Axe : ${p.seq.axe}`, `Problématique : ${p.seq.problematique}`, `Séance ${sp.numero}/${sp.total}`, `Tâche finale : ${p.seq.tache.texte}`].join('\n'),
      }
      await put('seances', s)
      derniere = d
      k++
    }
  }
  if (!k) return { mode: 'aucun' as const, nb: 0 }
  sequence.dateFin = derniere
  await put('sequences', sequence)
  // Après la séquence, la progression reprend là où elle en était.
  const apres = planningClasse(classe, ctx.creneaux, ctx.reglages).find((o) => o.date > derniere)
  if (apres) await put<Classe>('classes', { ...classe, depart: { date: ajouterJours(derniere, 1), index: apres.index } })
  return { mode: 'fiches' as const, nb: k, fin: derniere }
}

/** Crée une seule fiche (prochain cours de la classe, ou bibliothèque si pas d'EDT). */
export async function genererUneSeance(p: Proposition, numero: number, classe: Classe, ctx: Contexte) {
  const sp = seancesDe(p)[numero]
  const cc = ctx.creneaux.filter((c) => c.classeId === classe.id)
  let date: ISODate | null = null
  let cr: Creneau | undefined
  for (let d = aujourdhui(), i = 0; i < 60 && !cr; i++, d = ajouterJours(d, 1)) {
    if (enVacances(d, ctx.reglages.zone)) continue
    cr = creneauxDuJour(d, cc, ctx.reglages).find((c) => !ctx.seances.some((s) => s.date === d && s.creneauId === c.id))
    if (cr) date = d
  }
  const s: Seance = {
    ...nouvelleSeance(classe, date, cr), ...genererSeance(paramsDepuisProgression(sp, classe, date ?? aujourdhui(), cr ? minutesEntre(cr.debut, cr.fin) : 55)),
    cleProgression: p.source === 'programmation' ? sp.cle : '',
  }
  await put('seances', s)
  return s
}
