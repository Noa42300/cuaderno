// Ajustements ponctuels de la progression, demandés par la prof, appliqués une seule fois sur l'appareil.

import { all, get, put } from '../db/db'
import type { Classe } from '../db/types'
import { progressionDuNiveau } from '../lib/progression'

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
