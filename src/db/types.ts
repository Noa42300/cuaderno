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
  /** Point de départ de la progression : à cette date, la classe en est à la séance n° `index` (0 = 1re). */
  depart?: { date: ISODate; index: number }
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

/** Exercice d'une fiche élève : TOUJOURS un exemple résolu en tête. */
export interface Exercice {
  id: ID
  consigne: string
  exemple: string // ex. « Frida ___ mexicana. → Frida es mexicana. »
  items: string // une ligne = un item
  corrige: string // une ligne = une réponse
}

/** Diapositive à projeter. `aReveler` : une ligne = un élément révélé au clic. */
export interface Diapo {
  id: ID
  titre: string
  texte: string
  image: string // URL https://… ou « pj:<id> » (image en pièce jointe)
  aReveler: string
}

export interface Seance {
  id: ID
  classeId: ID
  date: ISODate | null // null = séance de bibliothèque (non posée)
  creneauId: ID | null
  debut: HHMM | '' // horaire (copié du créneau, ou saisi hors EDT)
  fin: HHMM | ''
  sequenceId: ID | null
  ordre: number // position dans la séquence
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
  competences: string // objectifs & compétences (BO, CECRL, socle)
  progressionRef: string // place dans la programmation / progression
  organisation: string // organisation & rôle de l'enseignant
  materiel: string // matériel & supports
  /** Clé de la séance de progression d'où vient cette fiche (ex. « 5e:2:3 ») */
  cleProgression: string
  support: { titre: string; nature: string; source: string; url: string }
  videoUrl: string // UNE vidéo précise
  tache: string
  traceEcrite: string
  deroulement: Etape[]
  differenciation: { fragiles: string; aLaise: string }
  obstacles: string
  correction: string
  exercices: Exercice[]
  diapos: Diapo[]
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

export type TypeRappel = 'reunion' | 'conseil' | 'equipe' | 'peda' | 'parents' | 'examen' | 'sortie' | 'formation' | 'ap' | 'autre'
export const TYPES_RAPPEL: Record<TypeRappel, string> = {
  reunion: 'Réunion',
  conseil: 'Conseil de classe',
  equipe: 'Réunion d’équipe (langues)',
  peda: 'Conseil pédagogique',
  parents: 'Rencontre parents',
  examen: 'Examen / bac blanc / DNB',
  sortie: 'Sortie / voyage',
  formation: 'Formation',
  ap: 'AP',
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
  dateDebut: ISODate | ''
  dateFin: ISODate | ''
  couleur: string
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
  /** Plage horaire affichée dans l'agenda */
  heureDebutAgenda: HHMM
  heureFinAgenda: HHMM
  /** Zone de vacances scolaires */
  zone: 'A' | 'B' | 'C'
  rentree: ISODate
  finAnnee: ISODate
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
