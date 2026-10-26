import type { Sauvegarde } from './backup'
import type { Seance } from './types'

/**
 * Prépare un `journal.json` PUBLIABLE (synchro lecture seule).
 * Liste BLANCHE : seul ce qui est explicitement listé ici sort.
 * Tout le reste — élèves, observations, pièces jointes, réglages,
 * rappels (réunions, rencontres parents), bilans — est retiré.
 */
export interface JournalPublic {
  app: 'cuaderno-public'
  version: 1
  publieLe: string
  classes: Array<{ id: string; nom: string; niveau: string; cecrlVise: string; couleur: string; heuresHebdo: number }>
  sequences: unknown[]
  seances: Array<Omit<Seance, 'bilan' | 'differenciation'> & { differenciation: { fragiles: string; aLaise: string } }>
  devoirs: unknown[]
}

export function sanitizeForPublic(s: Sauvegarde): JournalPublic {
  const d = s.data as Record<string, Record<string, unknown>[] | undefined>
  const nomsEleves = (d.eleves ?? [])
    .flatMap((e) => [e.prenom, e.nom])
    .filter((x): x is string => typeof x === 'string' && x.trim().length >= 2)
  // Filet de sécurité : un prénom saisi par erreur dans un texte est masqué.
  const masquer = (t: unknown): string => {
    let out = typeof t === 'string' ? t : ''
    for (const n of nomsEleves) out = out.replace(new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '[élève]')
    return out
  }
  const masquerObjet = <T>(o: T): T => JSON.parse(JSON.stringify(o), (_k, v) => (typeof v === 'string' ? masquer(v) : v))

  return {
    app: 'cuaderno-public',
    version: 1,
    publieLe: new Date().toISOString(),
    classes: (d.classes ?? []).map((c) => ({
      id: String(c.id),
      nom: String(c.nom),
      niveau: String(c.niveau),
      cecrlVise: String(c.cecrlVise),
      couleur: String(c.couleur),
      heuresHebdo: Number(c.heuresHebdo),
    })),
    sequences: (d.sequences ?? []).map((q) => masquerObjet({ ...q, notes: '' })),
    seances: (d.seances ?? []).map((x) => {
      const { bilan: _b, ...reste } = x as unknown as Seance
      return masquerObjet({ ...reste, differenciation: { fragiles: '', aLaise: '' } })
    }),
    devoirs: (d.devoirs ?? []).map((x) => masquerObjet({ id: x.id, classeId: x.classeId, pourLe: x.pourLe, donneLe: x.donneLe, seanceId: x.seanceId, texte: x.texte })),
  }
}
