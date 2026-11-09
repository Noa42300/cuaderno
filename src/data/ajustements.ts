// Ajustements ponctuels de la progression, demandés par la prof, appliqués une seule fois sur l'appareil.

import { all, get, getReglages, put, uid } from '../db/db'
import { creneauxDuJour, nouvelleSeance } from '../db/modeles'
import type { Classe, Creneau, Seance } from '../db/types'
import { progressionDuNiveau } from '../lib/progression'
import { DESCRIPTEURS } from './officiel'
import { PROGRESSION_REF_5E, SEANCES_5E_D } from './seances5eD'

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
  const [classes, creneaux, seances, r] = await Promise.all([all<Classe>('classes'), all<Creneau>('creneaux'), all<Seance>('seances'), getReglages()])
  const classe = classes.find((c) => c.nom.replace(/\s/g, '').toLowerCase().startsWith('5ed'))
  if (classe) {
    for (const e of SEANCES_5E_D) {
      const cr = creneauxDuJour(e.date, creneaux.filter((c) => c.classeId === classe.id), r)[0]
      const existante = seances.find((s) => s.classeId === classe.id && s.date === e.date && (!cr || s.creneauId === cr.id))
      if (existante && existante.modifieLe !== existante.creeLe) continue // modifiée par la prof : on n'y touche pas
      const base = existante ?? nouvelleSeance(classe, e.date, cr)
      const al = e.activites
      await put<Seance>('seances', {
        ...base,
        titre: e.titre, statut: e.statut ?? 'prevue', activites: al, cecrlDe: 'A1', cecrlVers: 'A1+', dureeMin: e.etapes.reduce((t, x) => t + x.duree, 0),
        programme: 'Axe 1 — Portrait, autoportrait', cleProgression: '',
        competences: ['Programme : Axe 1 — Portrait, autoportrait (associé à l’axe 6 — Le Mexique) · BO n° 22 du 29 mai 2025', 'Niveau visé : A1 → A1+', '', 'Compétences travaillées (CECRL, niveau A1) :',
          ...al.map((x) => `• ${x} — ${DESCRIPTEURS.A1[x]}`), '', 'Socle commun (cycle 4) : D1 — comprendre, s’exprimer en utilisant une langue étrangère ; D2 — méthodes et outils pour apprendre.'].join('\n'),
        progressionRef: PROGRESSION_REF_5E,
        organisation: e.etapes.map((x) => `• ${x.titre} (${x.duree} min) — ${x.modalite}. Mon rôle : ${x.role}.`).join('\n'),
        materiel: e.materiel.join('\n'),
        objectifs: e.objectifs,
        support: { ...e.support, url: '' },
        tache: e.tache, traceEcrite: e.traceEcrite,
        deroulement: e.etapes.map((x) => ({ id: uid(), titre: x.titre, duree: x.duree, activites: x.al, contenu: x.contenu.join('\n') })),
        differenciation: { fragiles: e.fragiles, aLaise: e.aLaise },
        obstacles: e.obstacles.join('\n'), correction: e.correction,
        exercices: e.exercices.map((x) => ({ id: uid(), consigne: x.consigne, exemple: x.exemple, items: x.items.join('\n'), corrige: x.corrige.join('\n') })),
        diapos: e.diapos.map((x) => ({ id: uid(), titre: x.titre, texte: x.texte, image: '', aReveler: x.aReveler.join('\n') })),
        creeLe: base.creeLe, modifieLe: base.creeLe,
      })
    }
    // Reprise de la progression : séquence « ¡Hola! Así soy yo », point de langue genre / nombre (6e séance).
    const index = progressionDuNiveau('5e').findIndex((s) => s.cle === '5e:1:6')
    if (index >= 0) await put<Classe>('classes', { ...classe, depart: { date: '2026-11-23', index } })
  }
  await put('meta', { id: 'ajust-5eD-2026-11-09', le: new Date().toISOString() })
}
