// Modèle de données. Toute modification de structure = nouvelle version
// de base dans db.ts (migration) + mise à jour de CLAUDE.md.

export type ID = string
export type ISODate = string // 'YYYY-MM-DD'
export type HHMM = string // '08:00'

export const NIVEAUX = ['6e', '5e', '4e', '3e', '2nde', '1re', 'Tle'] as const
export type Niveau = (typeof NIVEAUX)[number]

export const CECRL = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'C1'] as const
export type Cecrl = (typeof CECRL)[number]

/** Les 5 activités langagières. */
export const ACTIVITES = {
  CO: 'Compréhension de l’oral',
  CE: 'Compréhension de l’écrit',
  EOC: 'Expression orale en continu',
  EOI: 'Expression orale en interaction',
  EE: 'Expression écrite',
} as const
export type Activite = keyof typeof ACTIVITES

export interface Classe {
  id: ID
  nom: string // « 5e B — LV2 »
  niveau: Niveau
  option: string // LV2, LV1, LLCER, Euro…
  effectif: number
  cecrlVise: Cecrl
  couleur: string // hex
  heuresHebdo: number // volume horaire hebdo (heures)
  archivee?: boolean
}

/** Jour ISO : 1 = lundi … 6 = samedi */
export type JourSemaine = 1 | 2 | 3 | 4 | 5 | 6
export type Alternance = 'toutes' | 'A' | 'B'

/** Créneau récurrent de l'emploi du temps. */
export interface Creneau {
  id: ID
  classeId: ID
  jour: JourSemaine
  debut: HHMM
  fin: HHMM
  salle: string
  semaine: Alternance
}

export interface Etape {
  id: ID
  titre: string // « Mise en route », « Découverte du document »…
  duree: number // minutes
  activites: Activite[]
  contenu: string // déroulement à la 1re personne + répliques
}

export type StatutSeance = 'prevue' | 'faite' | 'annulee'

export interface Seance {
  id: ID
  classeId: ID
  date: ISODate | null // null = séance de bibliothèque (non posée)
  creneauId: ID | null
  sequenceId: ID | null
  titre: string
  statut: StatutSeance
  dureeMin: number
  activites: Activite[]
  cecrlDe: Cecrl
  cecrlVers: Cecrl
  objectifs: {
    culturel: string
    lexical: string
    grammatical: string
    phonologique: string
    pragmatique: string
  }
  programme: string // thématique cycle 4 / axe lycée
  support: { titre: string; nature: string; source: string; url: string }
  videoUrl: string // UNE vidéo précise
  tache: string
  traceEcrite: string
  deroulement: Etape[]
  differenciation: { fragiles: string; aLaise: string }
  obstacles: string
  correction: string
  bilan: string // après la séance
  creeLe: string
  modifieLe: string
}

export interface Devoir {
  id: ID
  classeId: ID
  pourLe: ISODate
  donneLe: ISODate | null
  seanceId: ID | null
  texte: string
}

export type TypeRappel = 'reunion' | 'conseil' | 'sortie' | 'ap' | 'parents' | 'autre'
export const TYPES_RAPPEL: Record<TypeRappel, string> = {
  reunion: 'Réunion',
  conseil: 'Conseil de classe',
  sortie: 'Sortie',
  ap: 'AP',
  parents: 'Rencontre parents',
  autre: 'Autre',
}

export interface Rappel {
  id: ID
  date: ISODate
  heure: HHMM | ''
  titre: string
  type: TypeRappel
  note: string
}

export interface Sequence {
  id: ID
  titre: string
  niveau: Niveau
  classeIds: ID[]
  programme: string
  projetFinal: string
  tacheFinale: string
  evaluation: string
  cecrlVise: Cecrl
  notes: string
}

// ——— Données SENSIBLES (jamais publiées, jamais exportées hors appareil sauf sauvegarde perso)
export interface Eleve {
  id: ID
  classeId: ID
  prenom: string
  nom: string
  besoins: string // aménagements : donnée sensible
}

export interface Observation {
  id: ID
  eleveId: ID
  date: ISODate
  activite: Activite | 'general'
  texte: string
}

export interface PieceJointe {
  id: ID
  seanceId: ID
  nom: string
  type: string
  blob: Blob
}

export type Theme = 'systeme' | 'clair' | 'sombre'

export interface Reglages {
  id: 'reglages'
  theme: Theme
  joursTravailles: JourSemaine[]
  /** Un lundi de semaine A (pour l'alternance A/B). Vide = pas d'alternance. */
  lundiSemaineA: ISODate | ''
  pinHash: string
  pinSel: string
  verrouMinutes: number
}

export const STORES = [
  'classes',
  'creneaux',
  'seances',
  'devoirs',
  'rappels',
  'sequences',
  'eleves',
  'observations',
  'piecesJointes',
  'meta',
] as const
export type StoreName = (typeof STORES)[number]
