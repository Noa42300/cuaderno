// Références officielles (vérifiées le 2026-10-27 — à revérifier si un nouveau BO paraît).
// Sources : BO n° 22 du 29 mai 2025 (arrêté du 5 mai 2025), programmes de cycle 4
// (BO n° 31 du 30 juillet 2020), calendrier scolaire 2026-2027 (Onisep).

import type { ISODate, Niveau } from '../db/types'

export interface Programme {
  niveaux: Niveau[]
  titre: string
  texte: string
  enVigueur: string
  niveauVise: string
  organisation: string
  axes: string[]
}

export const PROGRAMMES_OFFICIELS: Programme[] = [
  {
    niveaux: ['5e'],
    titre: 'Cinquième — nouveau programme d’espagnol (collège)',
    texte: 'Arrêté du 5 mai 2025, BO n° 22 du 29 mai 2025 — annexe 9 (programme d’espagnol pour les classes de collège)',
    enVigueur: 'Rentrée 2026 (application progressive : 6e en 2025, 5e en 2026, 4e en 2027, 3e en 2028)',
    niveauVise: 'A1+ en LVB (LV2) · A2 en LVA',
    organisation: '5 axes à traiter sur les 6, dont l’axe 6 obligatoirement. Deux axes peuvent être associés dans une même séquence autour d’une problématique commune.',
    axes: [
      'Axe 1 — Portrait, autoportrait',
      'Axe 2 — Le quotidien : lieux, rythmes, saisons',
      'Axe 3 — École et loisirs',
      'Axe 4 — Le réel et l’imaginaire',
      'Axe 5 — Des langues, des lieux, des histoires',
      'Axe 6 — Le Mexique',
    ],
  },
  {
    niveaux: ['4e', '3e'],
    titre: '4e – 3e — programme de langues vivantes du cycle 4',
    texte: 'Programme du cycle 4, BO n° 31 du 30 juillet 2020 (version consolidée). Le nouveau programme s’appliquera en 4e à la rentrée 2027 et en 3e à la rentrée 2028.',
    enVigueur: 'Toujours en vigueur en 4e et 3e en 2026-2027',
    niveauVise: 'Fin de cycle 4 : A2 en LV2 dans les cinq activités langagières (B1 pour certaines activités en LV1)',
    organisation: 'Quatre thématiques culturelles, travaillées sur le cycle. Socle commun : domaine 1 « Les langages pour penser et communiquer » (comprendre, s’exprimer en utilisant une langue étrangère).',
    axes: ['Langages', 'École et société', 'Voyages et migrations', 'Rencontres avec d’autres cultures'],
  },
  {
    niveaux: ['1re'],
    titre: 'Première — nouveau programme d’espagnol (lycée GT)',
    texte: 'Arrêté du 5 mai 2025, BO n° 22 du 29 mai 2025 — annexe 10 (programme d’espagnol pour les classes de lycée général et technologique)',
    enVigueur: 'Rentrée 2026 (remplace le programme du BO spécial n° 1 du 22 janvier 2019)',
    niveauVise: 'Fin de cycle terminal : B1 en LVB, B2 en LVA',
    organisation: 'Voie générale : 5 axes sur 6 dans l’année, dans l’ordre choisi ; deux axes peuvent être associés. Voie technologique : au moins 3 axes, l’axe 6 vivement recommandé.',
    axes: [
      'Axe 1 — Identités et échanges',
      'Axe 2 — Diversité et inclusion',
      'Axe 3 — Art et pouvoir',
      'Axe 4 — Innovations scientifiques et responsabilité',
      'Axe 5 — L’être humain et la nature',
      'Axe 6 — L’espace andin',
    ],
  },
  {
    niveaux: ['Tle'],
    titre: 'Terminale — nouveau programme d’espagnol (lycée GT)',
    texte: 'Arrêté du 5 mai 2025, BO n° 22 du 29 mai 2025 — annexe 10',
    enVigueur: 'Rentrée 2026',
    niveauVise: 'B1 en LVB · B2 en LVA (fin de cycle terminal)',
    organisation: 'Voie générale : 5 axes sur 6 ; voie technologique : au moins 3 axes, l’axe 6 vivement recommandé.',
    axes: [
      'Axe 1 — Espace privé et espace public',
      'Axe 2 — Territoire et mémoire',
      'Axe 3 — Fictions et réalités',
      'Axe 4 — Enjeux et formes de la communication',
      'Axe 5 — Citoyenneté et mondes virtuels',
      'Axe 6 — La richesse des métissages dans le monde hispanique',
    ],
  },
]

export const programmeDe = (n: Niveau) => PROGRAMMES_OFFICIELS.find((p) => p.niveaux.includes(n))

/** Volumes horaires officiels (élève, par semaine). */
export const VOLUMES_OFFICIELS = [
  { niveau: 'Collège — LV2 (5e, 4e, 3e)', volume: '2 h 30 / semaine', note: 'Horaire du cycle 4 pour la LV2.' },
  { niveau: 'Première générale — LVA + LVB', volume: '4 h 30 / semaine (enveloppe globale)', note: 'Répartition entre LVA et LVB décidée par l’établissement (souvent 2 h pour la LVB).' },
  { niveau: 'Terminale générale — LVA + LVB', volume: '4 h / semaine (enveloppe globale)', note: 'Souvent 2 h pour la LVB.' },
]

/** Descripteurs CECRL (grille d'autoévaluation du Conseil de l'Europe), par activité et niveau. */
export const DESCRIPTEURS: Record<'A1' | 'A2' | 'B1' | 'B2', Record<'CO' | 'CE' | 'EOC' | 'EOI' | 'EE', string>> = {
  A1: {
    CO: 'Peut comprendre des mots familiers et des expressions très courantes au sujet de soi-même, de sa famille et de l’environnement concret et immédiat, si les gens parlent lentement et distinctement.',
    CE: 'Peut comprendre des noms familiers, des mots ainsi que des phrases très simples, par exemple dans des annonces, des affiches ou des catalogues.',
    EOC: 'Peut utiliser des expressions et des phrases simples pour décrire son lieu d’habitation et les gens qu’il connaît.',
    EOI: 'Peut communiquer de façon simple, à condition que l’interlocuteur soit disposé à répéter ou à reformuler ses phrases plus lentement et à l’aider à formuler ce qu’il essaie de dire.',
    EE: 'Peut écrire une courte carte postale simple, porter des détails personnels dans un questionnaire.',
  },
  A2: {
    CO: 'Peut comprendre des expressions et un vocabulaire très fréquent relatifs à ce qui le concerne de très près ; peut saisir l’essentiel d’annonces et de messages simples et clairs.',
    CE: 'Peut lire des textes courts très simples et trouver une information particulière prévisible dans des documents courants.',
    EOC: 'Peut utiliser une série de phrases ou d’expressions pour décrire en termes simples sa famille et d’autres gens, ses conditions de vie, sa formation, son activité.',
    EOI: 'Peut communiquer lors de tâches simples et habituelles ne demandant qu’un échange d’information simple et direct sur des sujets et activités familiers.',
    EE: 'Peut écrire des notes et messages simples et courts ; peut écrire une lettre personnelle très simple.',
  },
  B1: {
    CO: 'Peut comprendre les points essentiels quand un langage clair et standard est utilisé et s’il s’agit de sujets familiers ; peut comprendre l’essentiel de nombreuses émissions sur l’actualité ou sur des sujets qui l’intéressent.',
    CE: 'Peut comprendre des textes rédigés essentiellement dans une langue courante ; peut comprendre la description d’événements, l’expression de sentiments et de souhaits.',
    EOC: 'Peut s’exprimer de manière simple afin de raconter des expériences et des événements, ses rêves, ses espoirs ou ses buts ; peut brièvement donner les raisons et explications de ses opinions ou projets.',
    EOI: 'Peut faire face à la majorité des situations rencontrées en voyage ; peut prendre part sans préparation à une conversation sur des sujets familiers ou d’intérêt personnel.',
    EE: 'Peut écrire un texte simple et cohérent sur des sujets familiers ou qui l’intéressent personnellement ; peut écrire des lettres personnelles pour décrire expériences et impressions.',
  },
  B2: {
    CO: 'Peut comprendre des conférences et des discours assez longs et même suivre une argumentation complexe si le sujet est relativement familier.',
    CE: 'Peut lire des articles et des rapports sur des questions contemporaines dans lesquels les auteurs adoptent une attitude particulière ou un certain point de vue.',
    EOC: 'Peut s’exprimer de façon claire et détaillée sur une gamme étendue de sujets ; peut développer un point de vue et expliquer les avantages et inconvénients de différentes possibilités.',
    EOI: 'Peut communiquer avec un degré de spontanéité et d’aisance qui rend possible une interaction normale avec un locuteur natif ; peut participer activement à une conversation et défendre ses opinions.',
    EE: 'Peut écrire des textes clairs et détaillés sur une grande gamme de sujets ; peut écrire un essai ou un rapport en transmettant une information ou en exposant des raisons.',
  },
}

export const bandeCecrl = (c: string): keyof typeof DESCRIPTEURS => (c.startsWith('B2') || c.startsWith('C') ? 'B2' : c.startsWith('B') ? 'B1' : c.startsWith('A2') ? 'A2' : 'A1')

// ——— Calendrier scolaire 2026-2027 (Onisep). Dates : premier jour de vacances → jour de reprise (exclu).
export interface Periode { nom: string; debut: ISODate; reprise: ISODate }
export const VACANCES: Record<'A' | 'B' | 'C', Periode[]> = {
  A: [
    { nom: 'Toussaint', debut: '2026-10-17', reprise: '2026-11-02' },
    { nom: 'Noël', debut: '2026-12-19', reprise: '2027-01-04' },
    { nom: 'Hiver', debut: '2027-02-13', reprise: '2027-03-01' },
    { nom: 'Printemps', debut: '2027-04-10', reprise: '2027-04-26' },
    { nom: 'Été', debut: '2027-07-03', reprise: '2027-09-01' },
  ],
  B: [
    { nom: 'Toussaint', debut: '2026-10-17', reprise: '2026-11-02' },
    { nom: 'Noël', debut: '2026-12-19', reprise: '2027-01-04' },
    { nom: 'Hiver', debut: '2027-02-20', reprise: '2027-03-08' },
    { nom: 'Printemps', debut: '2027-04-17', reprise: '2027-05-03' },
    { nom: 'Été', debut: '2027-07-03', reprise: '2027-09-01' },
  ],
  C: [
    { nom: 'Toussaint', debut: '2026-10-17', reprise: '2026-11-02' },
    { nom: 'Noël', debut: '2026-12-19', reprise: '2027-01-04' },
    { nom: 'Hiver', debut: '2027-02-06', reprise: '2027-02-22' },
    { nom: 'Printemps', debut: '2027-04-03', reprise: '2027-04-19' },
    { nom: 'Été', debut: '2027-07-03', reprise: '2027-09-01' },
  ],
}

/** Jours sans cours (fériés + pont de l'Ascension). Lundi de Pentecôte : selon l'établissement. */
export const FERIES: Record<ISODate, string> = {
  '2026-11-11': 'Armistice',
  '2027-03-29': 'Lundi de Pâques',
  '2027-05-06': 'Ascension',
  '2027-05-07': 'Pont de l’Ascension',
  '2027-05-17': 'Lundi de Pentecôte (selon l’établissement)',
}

export function enVacances(date: ISODate, zone: 'A' | 'B' | 'C'): string | null {
  if (FERIES[date]) return FERIES[date]
  const v = VACANCES[zone].find((p) => date >= p.debut && date < p.reprise)
  return v ? `Vacances de ${v.nom === 'Été' ? 'l’été' : v.nom}` : null
}

/** Périodes de l'année (entre deux vacances), pour les programmations. */
export function periodes(zone: 'A' | 'B' | 'C', rentree: ISODate) {
  const v = VACANCES[zone]
  const res: { nom: string; debut: ISODate; fin: ISODate }[] = []
  let debut = rentree
  v.forEach((p, i) => {
    res.push({ nom: `Période ${i + 1}`, debut, fin: p.debut })
    debut = p.reprise
  })
  return res
}
