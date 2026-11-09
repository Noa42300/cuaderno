// Ajustements ponctuels de la progression, demandés par la prof, appliqués une seule fois sur l'appareil.

import { all, delSeance, get, getReglages, put, uid } from '../db/db'
import { creneauxDuJour, nouvelleSeance } from '../db/modeles'
import type { Classe, Creneau, Seance } from '../db/types'
import { creerDepuisProgression, indexPlanning, progressionDuNiveau, proposition } from '../lib/progression'
import { ajouterJours, aujourdhui } from '../lib/dates'
import { enVacances } from './officiel'
import { DESCRIPTEURS } from './officiel'
import { PROGRESSION_REF_5E, PROGRESSION_REF_5E_NOEL, SEANCES_5E_D, SEANCES_5E_D_FIN, SEANCES_5E_D_NOEL, type SeanceEcrite } from './seances5eD'

/**
 * 9/11/2026 — Terminales : cette semaine, tâche finale puis évaluation de compréhension écrite sur l'axe
 * « Territoire et mémoire » (séquence Tle-2). Le 1er cours de la semaine = restitutions évaluées,
 * le 2e = compréhension écrite ; ensuite synthèse puis séquence suivante.
 */
export async function appliquerAjustements() {
  if (await get('meta', 'ajust-tle-eval-2026-11-09')) return
  const prog = progressionDuNiveau('Tle')
  const index = prog.findIndex((s) => s.cle.startsWith('Tle:2:') && s.titre.includes('restitutions évaluées (2)'))
  if (index >= 0)
    for (const c of await all<Classe>('classes'))
      if (c.niveau === 'Tle' && (!c.depart || c.depart.date < '2026-11-09'))
        await put<Classe>('classes', { ...c, depart: { date: '2026-11-09', index } })
  await put('meta', { id: 'ajust-tle-eval-2026-11-09', le: new Date().toISOString() })
}

/**
 * 9/11/2026 — 5e D : séances validées par la prof (évaluation EOI jeudi 12, bilan vendredi 13,
 * « ¿Cómo es Frida? » lundi 16, « ¿Quién es? » jeudi 19), puis reprise de la progression
 * « ¡Hola! Así soy yo » au point de langue genre / nombre à partir du 23 novembre.
 * Une fiche déjà modifiée par la prof sur l'un de ces créneaux n'est jamais écrasée.
 */
export async function ajuster5eD() {
  if (await get('meta', 'ajust-5eD-2026-11-09')) return
  const classe = await ecrireSeances('5ed', SEANCES_5E_D, PROGRESSION_REF_5E)
  if (classe) {
    // Reprise de la progression : séquence « ¡Hola! Así soy yo », point de langue genre / nombre (6e séance).
    const index = progressionDuNiveau('5e').findIndex((s) => s.cle === '5e:1:6')
    if (index >= 0) await put<Classe>('classes', { ...classe, depart: { date: '2026-11-23', index } })
  }
  await put('meta', { id: 'ajust-5eD-2026-11-09', le: new Date().toISOString() })
}

/** 5e D — mini-séquence de Noël (10-17 décembre) ; en janvier, reprise sur « Mi día a día ». */
export async function ajuster5eDNoel() {
  if (await get('meta', 'ajust-5eD-noel-2026')) return
  const classe = await ecrireSeances('5ed', SEANCES_5E_D_NOEL, PROGRESSION_REF_5E_NOEL)
  // Les autres cours jusqu'à Noël sont préparés AVANT de recaler la 5e D sur janvier.
  await preparerJusquaNoel()
  if (classe) {
    const index = progressionDuNiveau('5e').findIndex((s) => s.cle === '5e:3:1')
    const c = (await get<Classe>('classes', classe.id)) ?? classe
    if (index >= 0) await put<Classe>('classes', { ...c, depart: { date: '2027-01-04', index } })
  }
  await put('meta', { id: 'ajust-5eD-noel-2026', le: new Date().toISOString() })
}

/** 5e D — fin de « ¡Hola! Así soy yo » rédigée à la main (23 nov. → 7 déc.), à la place des trames automatiques. */
export async function ajuster5eDFin() {
  if (await get('meta', 'ajust-5eD-fin-2026')) return
  await ecrireSeances('5ed', SEANCES_5E_D_FIN, PROGRESSION_REF_5E)
  await put('meta', { id: 'ajust-5eD-fin-2026', le: new Date().toISOString() })
}

/**
 * Écrit des séances rédigées à la main sur les créneaux d'une classe (retrouvée par le début de son nom).
 * Une fiche déjà modifiée par la prof sur l'un de ces créneaux n'est jamais écrasée.
 */
async function ecrireSeances(prefixeNom: string, liste: SeanceEcrite[], progressionRef: string) {
  const [classes, creneaux, seances, r] = await Promise.all([all<Classe>('classes'), all<Creneau>('creneaux'), all<Seance>('seances'), getReglages()])
  const classe = classes.find((c) => c.nom.replace(/\s/g, '').toLowerCase().startsWith(prefixeNom))
  if (!classe) return null
  for (const e of liste) {
    const cr = creneauxDuJour(e.date, creneaux.filter((c) => c.classeId === classe.id), r)[0]
    const existante = seances.find((s) => s.classeId === classe.id && s.date === e.date && (!cr || s.creneauId === cr.id))
    // Modifiée par la prof (plus de 2 s entre création et dernière modification) : on n'y touche pas.
    if (existante && Math.abs(Date.parse(existante.modifieLe) - Date.parse(existante.creeLe)) > 2000) continue
    const base = existante ?? nouvelleSeance(classe, e.date, cr)
    const al = e.activites
    await put<Seance>('seances', {
      ...base,
      titre: e.titre, statut: e.statut ?? 'prevue', activites: al, cecrlDe: 'A1', cecrlVers: 'A1+', dureeMin: e.etapes.reduce((t, x) => t + x.duree, 0),
      programme: progressionRef.split('—')[1]?.split('\n')[0]?.trim() ?? '', cleProgression: '',
      competences: [`Programme : ${progressionRef.split('\n')[0]}`, 'BO n° 22 du 29 mai 2025 (programme de 5e)', 'Niveau visé : A1 → A1+', '', 'Compétences travaillées (CECRL, niveau A1) :',
        ...al.map((x) => `• ${x} — ${DESCRIPTEURS.A1[x]}`), '', 'Socle commun (cycle 4) : D1 — comprendre, s’exprimer en utilisant une langue étrangère ; D2 — méthodes et outils pour apprendre.'].join('\n'),
      progressionRef,
      organisation: e.etapes.map((x) => `• ${x.titre} (${x.duree} min) — ${x.modalite}. Mon rôle : ${x.role}.`).join('\n'),
      materiel: e.materiel.join('\n'),
      objectifs: e.objectifs,
      support: { ...e.support, url: '' },
      videoUrl: e.video ?? '',
      tache: e.tache, traceEcrite: e.traceEcrite,
      deroulement: e.etapes.map((x) => ({ id: uid(), titre: x.titre, duree: x.duree, activites: x.al, contenu: x.contenu.join('\n') })),
      differenciation: { fragiles: e.fragiles, aLaise: e.aLaise },
      obstacles: e.obstacles.join('\n'), correction: e.correction,
      exercices: e.exercices.map((x) => ({ id: uid(), consigne: x.consigne, exemple: x.exemple, items: x.items.join('\n'), corrige: x.corrige.join('\n') })),
      diapos: e.diapos.map((x) => ({ id: uid(), titre: x.titre, texte: x.texte, image: '', aReveler: x.aReveler.join('\n') })),
      creeLe: base.creeLe, modifieLe: base.creeLe,
    })
  }
  return classe
}

/**
 * « Prépare toutes les séances jusqu'aux vacances de Noël » (demande de la prof) : crée la fiche complète
 * de chaque cours à venir, pour toutes les classes, jusqu'au 18/12/2026. Les créneaux qui ont déjà une
 * fiche ne sont pas touchés.
 */
export async function preparerJusquaNoel() {
  if (await get('meta', 'prep-noel-2026')) return
  const [classes, creneaux, seances, r] = await Promise.all([all<Classe>('classes'), all<Creneau>('creneaux'), all<Seance>('seances'), getReglages()])
  const planning = indexPlanning(classes, creneaux, r)
  const pris = new Set(seances.map((s) => `${s.date}|${s.creneauId}`))
  const debut = aujourdhui() > '2026-11-09' ? aujourdhui() : '2026-11-09'
  for (let d = debut; d < '2026-12-19'; d = ajouterJours(d, 1)) {
    if (enVacances(d, r.zone)) continue
    for (const cr of creneauxDuJour(d, creneaux, r)) {
      if (pris.has(`${d}|${cr.id}`)) continue
      const classe = classes.find((c) => c.id === cr.classeId)
      const sp = proposition(classe, planning.get(`${d}|${cr.id}`))
      if (classe && sp) await creerDepuisProgression(classe, d, cr, sp)
    }
  }
  await put('meta', { id: 'prep-noel-2026', le: new Date().toISOString() })
}

/**
 * 9/11/2026 — Terminales : la séquence suivant « Territoire et mémoire » est « Raíces mestizas » (axe 6).
 * Les fiches générées automatiquement à partir du 20/11 (ancienne séquence « Entre ficción y realidad »)
 * et jamais modifiées sont remplacées par celles de la nouvelle séquence.
 */
export async function ajusterTleMestizaje() {
  if (await get('meta', 'ajust-tle-mestizaje-2026')) return
  const [classes, creneaux, seances, r] = await Promise.all([all<Classe>('classes'), all<Creneau>('creneaux'), all<Seance>('seances'), getReglages()])
  const tle = classes.filter((c) => c.niveau === 'Tle')
  const intactes = (s: Seance) => Math.abs(Date.parse(s.modifieLe) - Date.parse(s.creeLe)) <= 2000
  for (const s of seances)
    if (tle.some((c) => c.id === s.classeId) && s.date && s.date >= '2026-11-20' && s.cleProgression && intactes(s)) await delSeance(s.id)
  const restantes = new Set((await all<Seance>('seances')).map((s) => `${s.date}|${s.creneauId}`))
  const planning = indexPlanning(tle, creneaux, r)
  for (let d = '2026-11-20'; d < '2026-12-19'; d = ajouterJours(d, 1)) {
    if (enVacances(d, r.zone)) continue
    for (const cr of creneauxDuJour(d, creneaux.filter((c) => tle.some((t) => t.id === c.classeId)), r)) {
      if (restantes.has(`${d}|${cr.id}`)) continue
      const classe = tle.find((c) => c.id === cr.classeId)!
      const sp = proposition(classe, planning.get(`${d}|${cr.id}`))
      if (sp) await creerDepuisProgression(classe, d, cr, sp)
    }
  }
  await put('meta', { id: 'ajust-tle-mestizaje-2026', le: new Date().toISOString() })
}
