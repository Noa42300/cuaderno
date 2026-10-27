// Générateur de fiche de séance — 100 % local et déterministe.
// Produit une fiche complète (CLAUDE.md §7-8) : objectifs & compétences, progression, organisation,
// matériel, déroulement à la 1re personne avec répliques, différenciation, correction, erreurs
// fréquentes & remédiation, exercices (exemple résolu en tête), diaporama.
// Les passages entre [crochets] dépendent du document choisi : à compléter.

import { uid } from '../db/db'
import type { Activite, Cecrl, Diapo, Etape, Exercice, Seance } from '../db/types'
import { POINTS_LANGUE } from '../data/grammaire'
import { DESCRIPTEURS, bandeCecrl } from '../data/officiel'
import type { Rituel } from '../data/rituels'
import type { ActiviteEntree } from '../data/activites'

export { POINTS_LANGUE }

export const PHONOLOGIE = [
  'La jota [x] : jefe, mujer, México, gente',
  'La r simple et la rr roulée : pero / perro',
  'L’accent tonique : mírame, canción, árbol',
  'B et V se prononcent pareil : vivir, beber',
  'La ll et la y : llamar, yo, playa',
  'Le c / z [θ] en Espagne et le seseo en Amérique latine',
  'Les voyelles pures, sans diphtonguer ni nasaliser : bien, tango',
]

const PRAGMATIQUE: Record<Activite, string> = {
  CO: 'Restituer l’essentiel : Se trata de… / El documento habla de… / He entendido que…',
  CE: 'Repérer et justifier avec le texte : En la línea… / Según el texto…',
  EOC: 'Présenter et décrire : En el primer plano se ve… / Me parece que… / Creo que…',
  EOI: 'Réagir et interagir : Estoy de acuerdo · No estoy de acuerdo · ¿Y tú qué piensas?',
  EE: 'Structurer un écrit : Primero… Luego… Además… Por último…',
}

export type TypeSeance = 'decouverte' | 'approfondissement' | 'langue' | 'preparation' | 'tache' | 'bilan'
  | 'tle-galerie' | 'tle-choix' | 'tle-etude' | 'tle-problematique' | 'tle-format' | 'tle-atelier' | 'tle-restitution' | 'tle-synthese'
export const TYPES_SEANCE: Record<TypeSeance, string> = {
  decouverte: 'Découverte d’un document',
  approfondissement: 'Approfondissement & production',
  langue: 'Point de langue',
  preparation: 'Préparation de la tâche finale',
  tache: 'Tâche finale (évaluation)',
  bilan: 'Bilan & remédiation',
  'tle-galerie': 'Galerie de documents (lancement)',
  'tle-choix': 'Choix du document & groupes',
  'tle-etude': 'Étude du document en groupe',
  'tle-problematique': 'Axe d’attaque & problématique',
  'tle-format': 'Choix du format de restitution',
  'tle-atelier': 'Atelier de production',
  'tle-restitution': 'Restitutions devant la classe',
  'tle-synthese': 'Synthèse croisée de l’axe',
}

export interface ParamsGenerateur {
  titre: string
  theme: string
  programme: string
  activite: Activite
  secondaires: Activite[]
  point: string // clé de POINTS_LANGUE
  lexique: string // mots séparés par des virgules (générateur libre)
  docNature: string
  docTitre: string
  docSource: string
  cecrlDe: Cecrl
  cecrlVers: Cecrl
  duree: number
  // — Facultatif (rempli par la progression)
  type?: TypeSeance
  college?: boolean
  lancement?: boolean // 1re séance de la séquence
  problematique?: string
  tacheFinale?: string
  progressionRef?: string
  videoUrl?: string
  docAChoisir?: boolean
  lexiquePaires?: [string, string][] // [espagnol, français]
  rituels?: Rituel[]
  activiteEntree?: ActiviteEntree
  traductions?: [string, string][] // [français, espagnol]
  pointsSequence?: string[]
  /** Terminales : le dossier de documents de la séquence */
  dossier?: { nature: string; titre: string; source: string; al: Activite; video?: string; aChoisir?: boolean }[]
}

/** Nature du document, en espagnol, pour les répliques et exemples. */
function natureEs(n: string) {
  const t = n.toLowerCase()
  if (t.includes('chanson') || t.includes('clip')) return 'una canción'
  if (t.includes('bande-annonce')) return 'un tráiler de película'
  if (t.includes('film') || t.includes('photogramme')) return 'una película'
  if (t.includes('peinture') || t.includes('fresque') || t.includes('gravure')) return 'una obra de arte'
  if (t.includes('bande dessinée')) return 'un cómic'
  if (t.includes('publicité')) return 'un anuncio'
  if (t.includes('affiche')) return 'un cartel'
  if (t.includes('photo')) return 'una fotografía'
  if (t.includes('poème')) return 'un poema'
  if (t.includes('littéraire') || t.includes('légende')) return 'un texto literario'
  if (t.includes('audio') || t.includes('enregistrement')) return 'una grabación'
  if (t.includes('reportage') || t.includes('interview')) return 'un reportaje'
  if (t.includes('musique')) return 'una pieza musical'
  if (t.includes('infographie')) return 'una infografía'
  if (t.includes('carte') || t.includes('plan')) return 'un mapa'
  if (t.includes('recette')) return 'una receta'
  if (t.includes('architecture')) return 'un monumento'
  if (t.includes('artisanat')) return 'unas artesanías'
  return 'un documento'
}

const hashChaine = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/** Répartit la durée totale entre les étapes selon des poids (multiples de 5 min). */
function repartir(duree: number, poids: number[]) {
  const total = poids.reduce((a, b) => a + b, 0)
  const brut = poids.map((p) => Math.max(5, Math.round((duree * p) / total / 5) * 5))
  brut[poids.indexOf(Math.max(...poids))] += duree - brut.reduce((a, b) => a + b, 0)
  return brut
}

interface EtapeGen { titre: string; poids: number; al: Activite[]; contenu: string[]; modalite: string; role: string }

export function genererSeance(p: ParamsGenerateur): Partial<Seance> {
  if (p.type?.startsWith('tle-')) return genererSeanceTle(p)
  const type = p.type ?? 'decouverte'
  const lyc = p.cecrlVers.startsWith('B') || p.cecrlVers.startsWith('C')
  const pl = POINTS_LANGUE[p.point] ?? POINTS_LANGUE.aucun
  const avecPoint = p.point !== 'aucun' && !!POINTS_LANGUE[p.point]
  const doc = p.docTitre || '[titre du document]'
  const leDoc = p.docTitre ? `« ${p.docTitre} »` : 'le document'
  const nEs = natureEs(p.docNature)
  const theme = p.theme || p.titre || '[thème]'
  const a = p.activite
  const paires: [string, string][] = p.lexiquePaires?.length
    ? p.lexiquePaires
    : p.lexique.split(/[,;\n]/).map((m) => m.trim()).filter(Boolean).map((m) => [m, ''] as [string, string])
  const mots = paires.map(([es]) => es)
  const activites = [...new Set<Activite>([a, ...p.secondaires])]
  const video = !!p.videoUrl

  // ——— Entrée en classe : l'activité prévue pour ce cours (Rituales), sinon un rituel adapté au niveau.
  const act = p.activiteEntree
  const rituel: EtapeGen = act ? {
    titre: `Entrée en activité — ${act.titre}`, poids: 1, al: ['EOI'], modalite: 'Classe entière', role: 'je projette, je lance et je fais parler un maximum d’élèves',
    contenu: [
      lyc ? 'Les élèves s’installent ; l’activité est déjà projetée au tableau.' : 'J’accueille les élèves à la porte en espagnol.',
      lyc ? '— « Buenos días. Tenéis la actividad en la pantalla: os escucho. »' : '— « ¡Buenos días! Sentaos, por favor. »',
      `${act.type} (${act.duree} min) : ${act.consigne}`,
      ...act.e.map((l) => `   ${l}`),
      ...(act.s?.length ? ['Solution / pistes :', ...act.s.map((l) => `   ${l}`)] : []),
    ],
  } : {
    titre: 'Rituel d’entrée en classe', poids: 1, al: ['EOI'], modalite: 'Classe entière', role: 'j’accueille, j’anime et je fais parler un maximum d’élèves',
    contenu: [
      lyc ? 'Les élèves s’installent ; je lance la question du jour.' : 'J’accueille les élèves à la porte en espagnol.',
      lyc ? '— « Buenos días. Empezamos. »' : '— « ¡Buenos días! Sentaos, por favor. »',
      ...(p.rituels ?? []).flatMap((r) => [`${r.titre} : ${r.consigne}`, ...r.repliques]),
      ...(p.traductions?.length
        ? ['Je projette les phrases à traduire ; deux élèves passent au tableau, la classe corrige.', ...p.traductions.map(([fr, es]) => `   « ${fr} » → ${es}`)]
        : []),
    ],
  }

  const consigneDecouverte: Record<Activite, string[]> = {
    CO: [
      `Première écoute de ${leDoc} sans consigne de détail : je veux juste le sens global.`,
      '— « Primera escucha: ¿quién habla? ¿dónde? ¿de qué habla? »',
      lyc ? '' : '— « Pas de panique : on ne cherche pas à tout comprendre. On repère les mots transparents. »',
      'Deuxième écoute : je distribue la grille de repérage (qui, où, quand, quoi, pourquoi).',
      '— « Segunda escucha: completad la tabla con lo que entendéis. »',
      'Troisième écoute, fractionnée : je m’arrête sur le passage clé.',
      '— « Escuchad bien esta frase. ¿Qué palabra se repite? »',
    ],
    CE: [
      `Je distribue ${leDoc}. Lecture silencieuse, crayon en main.`,
      '— « Leed el texto en silencio y subrayad las palabras que entendéis. »',
      lyc ? '— « ¿Cuál es la idea principal del texto? »' : '— « Soulignez en vert les personnes et les lieux, en bleu les dates. »',
      'Je fais un premier tour : qui, quoi, où, quand.',
      '— « ¿De quién habla el texto? Justifica con una frase del texto. »',
      'Deuxième lecture ciblée avec le questionnaire de la fiche.',
    ],
    EOC: [
      `Je projette ${leDoc} en grand et je laisse une minute d’observation silencieuse.`,
      '— « Tenéis un minuto para observar. Luego, cada uno dice una frase. »',
      '— « ¿Qué hay en el primer plano? ¿Y al fondo? »',
      '— « ¿Qué sentimientos expresa? ¿Por qué? »',
      'J’interroge un maximum d’élèves, je reformule et j’écris les structures utiles au tableau.',
      lyc ? '— « Ahora, en un minuto, presenta el documento como si fueras guía de museo. »' : '— « ¿Quién puede decir dos frases seguidas? »',
    ],
    EOI: [
      `Je présente la situation à partir de ${leDoc}.`,
      '— « Vamos a hacer un juego de rol. Trabajáis por parejas. »',
      'Je distribue les cartes de rôle (A / B) et je laisse 3 minutes de préparation, sans rédiger de phrases complètes.',
      '— « Solo palabras clave, ¡nada de frases completas! »',
      'Je circule et je débloque : je propose des amorces aux binômes en difficulté.',
      'Deux ou trois binômes passent devant la classe ; les autres notent une phrase qu’ils ont aimée.',
    ],
    EE: [
      `Je fais lire ${leDoc} comme modèle d’écrit.`,
      '— « ¿Cómo está organizado el texto? ¿Cuántas partes tiene? »',
      'Je fais repérer les connecteurs et je les note au tableau (Primero, Luego, Además, Por último).',
      '— « Ahora os toca a vosotros: vais a escribir un texto parecido. »',
      'Rédaction guidée ; je circule et j’annote au crayon sans corriger à la place des élèves.',
    ],
  }

  const anticipation: EtapeGen = {
    titre: p.lancement ? 'Lancement de la séquence & anticipation' : 'Anticipation', poids: 1.4, al: ['EOC', 'EOI'], modalite: 'Classe entière', role: 'je fais émettre des hypothèses et je note les idées au tableau',
    contenu: [
      ...(p.lancement && p.problematique ? [
        `J’écris la problématique au tableau : « ${p.problematique} »`,
        '— « Esta es la pregunta de nuestra nueva secuencia. ¿Qué os sugiere? »',
        p.tacheFinale ? `J’annonce la tâche finale : ${p.tacheFinale}` : '',
      ] : []),
      `Je projette ${a === 'CO' ? 'une image extraite de la vidéo' : 'le document'} sans le titre${lyc ? '' : ' et j’écris les amorces « Veo… / Creo que… / Me parece que… »'}.`,
      '— « Mirad bien. ¿Qué veis? ¿Qué os llama la atención? »',
      `— « Según vosotros, ¿de qué va a tratar ${nEs.replace(/^unas /, 'estas ').replace(/^una /, 'esta ').replace(/^un /, 'este ')}? »`,
      lyc ? '— « Justificad vuestras hipótesis: ¿qué elementos os permiten decir eso? »' : '— « Muy bien. Repite la frase completa, por favor. »',
    ],
  }

  const miseEnCommun: EtapeGen = {
    titre: 'Mise en commun & reformulation', poids: 2, al: ['EOC', 'EOI'], modalite: 'Classe entière', role: 'je questionne, je reformule et je valide ; je fais vérifier les hypothèses',
    contenu: [
      'Je fais restituer ce qui a été compris, en commençant par les élèves qui ont le moins d’éléments.',
      '— « ¿Qué habéis entendido? Empezamos por lo más importante. »',
      '— « ¿Estáis de acuerdo con vuestro compañero? »',
      '— « ¿Teníamos razón al principio? »',
      `Je fais formuler une phrase de synthèse : « ${lyc ? 'El documento muestra que' : 'Se trata de'} … ».`,
    ],
  }

  const fixationLexique: EtapeGen = {
    titre: 'Fixation du vocabulaire', poids: 1.2, al: ['EOC'], modalite: 'Classe entière puis individuel', role: 'je fais répéter, je corrige la prononciation',
    contenu: [
      mots.length ? `J’écris au tableau les mots clés : ${mots.slice(0, 6).join(', ')}.` : 'J’écris au tableau les mots clés repérés.',
      '— « Repetid conmigo. » (répétition en chœur puis individuelle)',
      '— « ¿Quién hace una frase con esta palabra? »',
    ],
  }

  const pointLangueEtape = (court: boolean): EtapeGen => ({
    titre: `Point de langue — ${pl.label}`, poids: court ? 1.8 : 2.5, al: ['CE', 'EE'], modalite: 'Classe entière', role: 'je guide l’observation ; les élèves formulent la règle',
    contenu: [
      'Je repars d’exemples tirés du document et je les écris au tableau.',
      '— « Mirad estas frases. ¿Qué observáis? ¿Qué tienen en común? »',
      '— « Qu’est-ce qui change d’une phrase à l’autre ? Pourquoi ? »',
      'Je fais formuler la règle par les élèves avant de la valider.',
      ...pl.regle.split('\n').map((l) => `   ${l}`),
      '— « ¿Quién me da otro ejemplo? »',
    ],
  })

  const entrainement: EtapeGen = {
    titre: 'Entraînement', poids: 1.6, al: ['EE'], modalite: 'Individuel puis correction collective', role: 'je circule, j’aide les élèves fragiles, je donne le défi aux plus rapides',
    contenu: [
      'Je distribue la fiche d’exercices et je lis l’exemple à voix haute avant de lancer.',
      '— « Mirad el ejemplo: así se hace. ¿Alguna pregunta? »',
      'Je circule. Les élèves qui terminent vite passent au défi.',
      '— « ¡Muy bien! Ahora intenta el desafío. »',
      'Correction collective rapide : un élève lit, la classe valide.',
    ],
  }

  const trace: EtapeGen = {
    titre: 'Trace écrite & devoirs', poids: 1, al: ['EE'], modalite: 'Individuel', role: 'je projette la leçon et je vérifie les cahiers',
    contenu: [
      'Je projette la trace écrite ; les élèves la collent ou la recopient.',
      '— « Copiad la lección en el cuaderno, por favor. »',
      '— « Para la próxima clase: aprender la lección y el vocabulario. »',
      '— « ¡Hasta luego! »',
    ],
  }

  let etapes: EtapeGen[]
  switch (type) {
    case 'approfondissement':
      etapes = [
        rituel,
        { titre: 'Rappel de la séance précédente', poids: 1, al: ['EOC'], modalite: 'Classe entière', role: 'j’interroge des élèves différents de la dernière fois', contenu: ['— « ¿Qué documento estudiamos la clase pasada? ¿De qué trataba? »', '— « ¿Quién me recuerda tres palabras nuevas? »'] },
        {
          titre: `Deuxième exploitation de ${leDoc}`, poids: 2.6, al: [a, 'CE'], modalite: 'Binômes', role: 'je relance avec des questions d’interprétation',
          contenu: [
            'Je redonne le document et je pose des questions d’interprétation.',
            '— « ¿Por qué el autor ha elegido este título? »',
            '— « ¿Qué quiere transmitir? ¿Con qué elementos? »',
            lyc ? '— « ¿Qué relación hay con la problemática de la secuencia? »' : '— « ¿Te gusta? ¿Por qué? »',
            'Les binômes notent trois idées, puis on met en commun.',
          ],
        },
        {
          titre: 'Production (micro-tâche)', poids: 2.4, al: lyc ? ['EOI', 'EOC'] : ['EOI'], modalite: 'Binômes puis passages devant la classe', role: 'je circule, je note les erreurs fréquentes pour la correction',
          contenu: [
            lyc ? '— « Por parejas: uno defiende una idea, el otro la contraria. Tenéis cinco minutos. »' : '— « Por parejas: preparad un pequeño diálogo con las palabras nuevas. »',
            'Je donne une carte d’amorces aux binômes qui en ont besoin.',
            'Trois binômes passent ; la classe dit ce qu’elle a compris.',
            '— « ¡Muy bien! ¿Quién puede añadir algo? »',
          ],
        },
        trace,
      ]
      break
    case 'langue':
      etapes = [
        rituel,
        { titre: 'Observation du corpus', poids: 1.2, al: ['CE'], modalite: 'Classe entière', role: 'je fais observer sans donner la règle', contenu: ['Je projette 4 ou 5 phrases tirées des documents de la séquence.', '— « Leed estas frases. ¿Qué palabras se repiten? ¿Qué cambia? »'] },
        pointLangueEtape(false),
        entrainement,
        { titre: 'Réemploi à l’oral', poids: 1.4, al: ['EOC'], modalite: 'Classe entière (tour de classe)', role: 'je corrige en reformulant, sans bloquer la parole', contenu: ['Chaque élève fait une phrase personnelle avec la structure du jour.', '— « Ahora tú: una frase sobre ti, con la estructura de hoy. »'] },
        trace,
      ]
      break
    case 'preparation':
      etapes = [
        rituel,
        { titre: 'Révision du vocabulaire (jeu)', poids: 1.4, al: ['EOI'], modalite: 'Équipes', role: 'j’anime le jeu et je compte les points', contenu: ['Jeu « Pasapalabra » : je donne une définition, la première équipe qui trouve le mot marque un point.', '— « Empieza por A… »', mots.length ? `Mots révisés : ${mots.join(', ')}.` : ''] },
        { titre: 'Présentation de la tâche finale & des critères', poids: 1.2, al: ['CE'], modalite: 'Classe entière', role: 'j’explique la grille d’évaluation', contenu: [p.tacheFinale ? `Je relis la tâche finale : ${p.tacheFinale}` : 'Je relis la consigne de la tâche finale.', 'Je distribue la grille d’évaluation et je la commente critère par critère.', '— « ¿Está claro? ¿Alguna duda? »'] },
        { titre: 'Préparation en autonomie', poids: 3, al: ['EE', 'EOC'], modalite: 'Individuel ou binômes', role: 'je circule, je conseille, je fais répéter à voix basse', contenu: ['Les élèves préparent leur production à partir de la fiche « boîte à outils ».', '— « Usad la caja de herramientas: vocabulario, estructuras, conectores. »', 'Je passe voir chaque élève au moins une fois.'] },
        { titre: 'Répétition', poids: 1.4, al: ['EOC'], modalite: 'Binômes', role: 'j’écoute deux ou trois répétitions et je donne un conseil précis', contenu: ['Chaque élève s’entraîne devant son binôme, qui coche la grille.', '— « Tu compañero te da un consejo para mejorar. »'] },
        { titre: 'Consignes pour la prochaine séance', poids: 0.6, al: ['CE'], modalite: 'Classe entière', role: 'je rappelle les attendus', contenu: ['— « La próxima clase es la tarea final. ¡Preparaos bien! »'] },
      ]
      break
    case 'tache':
      etapes = [
        { titre: 'Accueil & consignes', poids: 0.8, al: ['CE'], modalite: 'Classe entière', role: 'je rassure et je rappelle la grille', contenu: ['— « Hoy es el gran día: la tarea final. Tranquilos, lo habéis preparado bien. »', 'Je rappelle les critères de la grille et l’ordre de passage.'] },
        {
          titre: 'Réalisation de la tâche finale (évaluation)', poids: 5, al: [a], modalite: a === 'EE' ? 'Individuel, en silence' : a === 'EOI' ? 'Binômes, passages successifs' : 'Passages individuels',
          role: 'j’évalue avec la grille ; je ne corrige pas pendant la prise de parole',
          contenu: [
            p.tacheFinale ? `Tâche : ${p.tacheFinale}` : 'Tâche : [consigne].',
            a === 'EE' ? '— « Tenéis 30 minutos. Releed vuestro texto antes de entregarlo. »' : '— « Adelante, te escuchamos. »',
            'Pendant les passages, les autres élèves ont une grille d’écoute (une question à poser à la fin).',
          ],
        },
        { titre: 'Auto-évaluation & bilan', poids: 1.2, al: ['EE'], modalite: 'Individuel', role: 'je recueille les ressentis et j’annonce la suite', contenu: ['Les élèves remplissent la fiche d’auto-évaluation.', '— « ¿Qué ha sido lo más fácil? ¿Y lo más difícil? »'] },
      ]
      break
    case 'bilan':
      etapes = [
        rituel,
        { titre: 'Retour sur la tâche finale', poids: 1.6, al: ['CE'], modalite: 'Classe entière', role: 'je valorise les réussites et je relève les erreurs fréquentes (anonymes)', contenu: ['Je rends les grilles et je projette 5 erreurs fréquentes relevées pendant la tâche (sans nom).', '— « ¿Dónde está el error? ¿Cómo lo corregimos? »'] },
        { titre: 'Remédiation ciblée', poids: 2.4, al: ['EE'], modalite: 'Groupes de besoin', role: 'je travaille avec le groupe le plus fragile pendant que les autres sont en autonomie', contenu: ['Exercice de remédiation sur le point de langue le moins maîtrisé.', 'Les élèves à l’aise rédigent une version enrichie de leur production.'] },
        { titre: 'Ouverture culturelle (quiz)', poids: 1.6, al: ['CO', 'EOI'], modalite: 'Équipes', role: 'j’anime le quiz', contenu: ['Quiz de fin de séquence sur les documents et la culture étudiés.', '— « Pregunta número uno… »'] },
        { titre: 'Bilan de la séquence', poids: 1, al: ['EOC'], modalite: 'Classe entière', role: 'je fais formuler ce qui a été appris', contenu: p.problematique ? [`Je reviens à la problématique : « ${p.problematique} »`, '— « Ahora, ¿qué podemos responder? »'] : ['— « ¿Qué hemos aprendido en esta secuencia? »'] },
      ]
      break
    default:
      etapes = [
        rituel,
        anticipation,
        { titre: `Découverte du document (${a})`, poids: 3.5, al: [a], modalite: a === 'EOI' ? 'Binômes' : 'Individuel puis classe entière', role: a === 'CO' ? 'je gère les écoutes et je fractionne' : 'je guide le repérage et je circule', contenu: consigneDecouverte[a].filter(Boolean) },
        miseEnCommun,
        ...(avecPoint ? [pointLangueEtape(true)] : [fixationLexique]),
        trace,
      ]
  }

  const durees = repartir(p.duree, etapes.map((e) => e.poids))
  const deroulement: Etape[] = etapes.map((e, i) => ({ id: uid(), titre: e.titre, duree: durees[i], activites: e.al, contenu: e.contenu.filter(Boolean).join('\n') }))

  // ——— Objectifs & compétences
  const bande = bandeCecrl(p.cecrlVers)
  const competences = [
    p.programme && `Programme : ${p.programme}`,
    p.problematique && `Problématique : ${p.problematique}`,
    `Niveau visé : ${p.cecrlDe === p.cecrlVers ? p.cecrlVers : `${p.cecrlDe} → ${p.cecrlVers}`}`,
    '',
    `Compétences travaillées (CECRL, niveau ${bande}) :`,
    ...activites.map((x) => `• ${x} — ${DESCRIPTEURS[bande][x]}`),
    '',
    p.college !== false && !lyc
      ? 'Socle commun (cycle 4) : D1 — comprendre, s’exprimer en utilisant une langue étrangère ; D2 — méthodes et outils pour apprendre ; D3 — formation de la personne et du citoyen ; D5 — représentations du monde et activité humaine.'
      : 'Lycée : activités langagières de réception, production, interaction et médiation au service de l’axe étudié.',
  ].filter((x): x is string => typeof x === 'string').join('\n')

  const organisation = [
    `Disposition : ${type === 'tache' && a === 'EE' ? 'rangées, travail individuel' : type === 'approfondissement' || type === 'preparation' ? 'îlots de deux, face au tableau' : 'classe en U ou face au tableau, vidéoprojecteur allumé'}.`,
    ...etapes.map((e, i) => `• ${e.titre} (${durees[i]} min) — ${e.modalite}. Mon rôle : ${e.role}.`),
  ].join('\n')

  const materiel = [
    (video || a === 'CO') && 'Vidéoprojecteur et enceintes (tester le son avant le cours)',
    p.docTitre && `Document : ${p.docNature ? `${p.docNature} — ` : ''}${p.docTitre}${p.docSource ? ` (${p.docSource})` : ''}${p.docAChoisir ? ' — à choisir / imprimer' : ''}`,
    a === 'CE' && 'Document imprimé (1 par élève) + surligneurs',
    a === 'EOI' && 'Cartes de rôle A / B',
    'Fiche d’exercices (1 par élève)',
    'Leçon à coller (1 par élève)',
    (type === 'preparation' || type === 'tache') && 'Grille d’évaluation (1 par élève)',
    type === 'preparation' && 'Fiche « boîte à outils » (vocabulaire, structures, connecteurs)',
    'Cahier, trousse, colle',
  ].filter(Boolean).join('\n')

  // ——— Exercices
  const exercices: Exercice[] = []
  const exGram = (k: string, consigneAlt?: string) => {
    const g = POINTS_LANGUE[k]
    if (!g || k === 'aucun') return
    exercices.push({ id: uid(), consigne: consigneAlt ?? g.exercice.consigne, exemple: g.exercice.exemple, items: g.exercice.items.join('\n'), corrige: g.exercice.corrige.join('\n') })
  }
  const exLexique = () => {
    const avecTrad = paires.filter(([, fr]) => fr)
    if (avecTrad.length < 3) return
    const [ex, ...reste] = avecTrad
    exercices.push({
      id: uid(), consigne: 'Traduis en espagnol (avec l’article quand il y en a un).',
      exemple: `${ex[1]} → ${ex[0]}`, items: reste.slice(0, 7).map(([, fr]) => fr).join('\n'), corrige: reste.slice(0, 7).map(([es]) => es).join('\n'),
    })
  }
  const exComprehension = () => exercices.push({
    id: uid(), consigne: 'Réponds en espagnol par une phrase complète.',
    exemple: `¿Qué tipo de documento es? → Es ${nEs}${p.docSource ? ` (${p.docSource.split(/[,(]/)[0].trim()})` : ''}.`,
    items: a === 'CO'
      ? '¿Quién canta / habla?\n¿Dónde pasa la escena?\n¿Qué pasa?\n¿Qué sentimiento expresa el documento? ¿Por qué?'
      : a === 'EOC'
        ? '¿Qué ves en el primer plano?\n¿Qué hay al fondo?\n¿Qué colores dominan?\n¿Qué sientes al verlo? ¿Por qué?'
        : '¿De quién habla el documento?\n¿Dónde y cuándo pasa?\n¿Qué pasa?\n¿Cuál es el mensaje?',
    corrige: `Es ${nEs}.\n[Réponses selon le document]`,
  })
  switch (type) {
    case 'langue': exGram(p.point); exLexique(); break
    case 'preparation': for (const k of p.pointsSequence ?? [p.point]) exGram(k); exLexique(); break
    case 'tache':
      exercices.push({
        id: uid(), consigne: 'Auto-évaluation : coche ce que tu as réussi (✔ acquis · ~ en cours · ✘ pas encore).',
        exemple: 'J’ai réalisé la tâche demandée. → ✔', items: grille(a).join('\n'), corrige: '—',
      })
      break
    case 'bilan': exGram(p.pointsSequence?.[0] ?? p.point, 'Remédiation — ' + (POINTS_LANGUE[p.pointsSequence?.[0] ?? p.point]?.exercice.consigne ?? '')); exLexique(); break
    default: exComprehension(); if (avecPoint && type === 'decouverte') exGram(p.point); exLexique()
  }

  // ——— Diaporama
  const diapos: Diapo[] = [{ id: uid(), titre: p.titre || theme, texte: p.problematique ? `¿${p.problematique.replace(/^¿|\?$/g, '')}?` : 'Hoy es…', image: '', aReveler: '' }]
  if (act) diapos.push({ id: uid(), titre: act.titre, texte: act.e.join('\n'), image: '', aReveler: (act.s ?? []).join('\n') })
  else if (p.traductions?.length && type !== 'tache')
    diapos.push({ id: uid(), titre: 'Traduce', texte: p.traductions.map(([fr]) => `• ${fr}`).join('\n'), image: '', aReveler: p.traductions.map(([, es]) => es).join('\n') })
  if (type === 'decouverte' || type === 'approfondissement')
    diapos.push(
      { id: uid(), titre: '¿Qué veis?', texte: `${p.docNature || 'Documento'} : ${doc}${p.docSource ? ` — ${p.docSource}` : ''}`, image: '', aReveler: lyc ? 'En el primer plano se ve…\nMe parece que…\nEl documento muestra que…' : 'Veo…\nCreo que…\nMe parece que…' },
      { id: uid(), titre: a === 'CO' ? 'Escuchamos' : a === 'CE' ? 'Leemos' : a === 'EE' ? 'Escribimos' : 'Hablamos', texte: '', image: '', aReveler: '¿Quién?\n¿Dónde?\n¿Cuándo?\n¿Qué?\n¿Por qué?' },
    )
  if (avecPoint && (type === 'langue' || type === 'decouverte')) diapos.push({ id: uid(), titre: pl.label, texte: 'Observa:', image: '', aReveler: pl.regle })
  if (mots.length) diapos.push({ id: uid(), titre: 'Vocabulario', texte: '', image: '', aReveler: paires.map(([es, fr]) => (fr ? `${es} = ${fr}` : es)).join('\n') })
  if (type === 'preparation' || type === 'tache') diapos.push({ id: uid(), titre: 'Tarea final', texte: p.tacheFinale ?? '', image: '', aReveler: grille(a).join('\n') })
  diapos.push({ id: uid(), titre: 'Para la próxima clase', texte: type === 'preparation' ? '¡Preparad la tarea final!' : 'Aprender la lección y el vocabulario.', image: '', aReveler: '' })

  const phono = PHONOLOGIE[hashChaine(p.titre + p.theme) % PHONOLOGIE.length]

  return {
    titre: p.titre,
    programme: p.programme,
    activites,
    cecrlDe: p.cecrlDe,
    cecrlVers: p.cecrlVers,
    dureeMin: p.duree,
    competences,
    progressionRef: p.progressionRef ?? '',
    organisation,
    materiel,
    videoUrl: p.videoUrl ?? '',
    objectifs: {
      culturel: `${theme.charAt(0).toUpperCase()}${theme.slice(1)}${p.docTitre ? ` — à travers ${leDoc}` : ''}.`,
      lexical: paires.length ? paires.map(([es]) => es).join(', ') : '[champ lexical à préciser]',
      grammatical: type === 'preparation' || type === 'bilan' ? (p.pointsSequence ?? []).map((k) => POINTS_LANGUE[k]?.label).filter(Boolean).join(' · ') : pl.objectif,
      phonologique: phono,
      pragmatique: PRAGMATIQUE[a],
    },
    support: { titre: p.docTitre, nature: p.docNature, source: p.docSource, url: '' },
    tache: type === 'tache' || type === 'preparation' ? (p.tacheFinale ?? '') : {
      CO: `Je restitue en espagnol l’essentiel de ${leDoc} (qui, où, quoi, pourquoi) en trois phrases.`,
      CE: 'Je réponds au questionnaire en justifiant avec des citations du texte.',
      EOC: `Je présente ${leDoc} à la classe pendant ${lyc ? '1 min 30' : '1 min'}, sans lire mes notes.`,
      EOI: 'Avec mon binôme, je joue la scène en réagissant aux propos de l’autre.',
      EE: `J’écris un texte de ${lyc ? '120' : '50'} mots environ, avec trois connecteurs.`,
    }[a],
    traceEcrite: [
      p.titre || theme,
      p.docTitre && `${p.docNature || 'Documento'} : ${doc}${p.docSource ? ` (${p.docSource})` : ''}`,
      type === 'decouverte' || type === 'approfondissement' ? `${lyc ? 'El documento muestra que' : 'Se trata de'} [résumé en une ou deux phrases, construit avec la classe].` : '',
      paires.length ? `Vocabulario : ${paires.map(([es]) => es).join(' · ')}` : '',
      avecPoint && type !== 'tache' ? `\n${pl.label}\n${pl.regle}` : '',
    ].filter(Boolean).join('\n'),
    deroulement,
    differenciation: {
      fragiles: [
        {
          CO: 'Grille de repérage pré-remplie en partie, liste de mots transparents, réécoute du passage clé.',
          CE: 'Texte avec les mots difficiles glosés en marge ; questions fermées (vrai/faux) avant les questions ouvertes.',
          EOC: 'Amorces affichées (Veo… / Creo que… / Me parece que…) et une minute de préparation avec mots-clés.',
          EOI: 'Carte de rôle avec questions toutes faites et banque de mots.',
          EE: 'Texte à trous ou plan avec amorces de phrases et banque de mots.',
        }[a],
        type === 'langue' || type === 'bilan' ? 'Tableau de conjugaison / règle sous les yeux pendant l’exercice ; items réduits (3 au lieu de 5).' : '',
        type === 'tache' ? 'Temps de préparation supplémentaire et droit à une fiche de mots-clés.' : '',
      ].filter(Boolean).join('\n'),
      aLaise: [
        {
          CO: 'Repérer les émotions et l’intention de l’auteur, reformuler sans notes.',
          CE: 'Question d’interprétation : ¿Cuál es el mensaje del autor? Justifica.',
          EOC: 'Donner un avis argumenté et faire un lien avec un autre document de la séquence.',
          EOI: 'Carte « imprévu » pour relancer l’échange.',
          EE: 'Défi : un temps du passé et deux connecteurs supplémentaires.',
        }[a],
        type === 'langue' ? 'Défi : écrire trois phrases personnelles avec la structure du jour.' : '',
      ].filter(Boolean).join('\n'),
    },
    obstacles: [
      (type === 'langue' || type === 'decouverte' || type === 'bilan') && pl.obstacles,
      type === 'preparation' && (p.pointsSequence ?? []).map((k) => POINTS_LANGUE[k]?.obstacles).filter(Boolean).join('\n'),
      {
        CO: 'Les élèves veulent tout comprendre et décrochent → je rassure en français, je fractionne et je cible les mots transparents.',
        CE: 'Lecture mot à mot → je fais d’abord repérer les mots connus et transparents, puis deviner le sens global.',
        EOC: 'Blocage à l’oral / réponses en un mot → je fais reformuler en phrase complète avec une amorce.',
        EOI: 'Le binôme bascule en français → je passe et je relance en espagnol : « ¿Cómo se dice en español? »',
        EE: 'Traduction mot à mot depuis le français → je rappelle : « Utilise ce que tu sais dire, simplement. »',
      }[a],
      'Accentuation oubliée → je fais entendre la syllabe forte et je fais placer l’accent.',
      'Faux-amis fréquents (embarazada ≠ embarrassée, constipado ≠ constipé, exquisito = délicieux) → je les signale dès qu’ils apparaissent.',
    ].filter(Boolean).join('\n'),
    correction: [
      ...exercices.filter((e) => e.corrige && e.corrige !== '—').map((e) => `${e.consigne}\n${e.corrige.split('\n').map((c, i) => `${String.fromCharCode(97 + i)}) ${c}`).join(' · ')}`),
      type === 'tache' || type === 'preparation'
        ? `Production attendue : ${p.tacheFinale ?? ''}\nCritères : ${grille(a).join(' · ')}`
        : `Production attendue (exemple) : « ${lyc ? 'El documento muestra que' : 'Se trata de'} [contenu attendu]. »`,
    ].join('\n\n'),
    exercices,
    diapos,
  }
}

/** Grille d'évaluation simple par activité langagière. */
export function grille(a: Activite) {
  const commun = ['J’ai réalisé la tâche demandée.', 'J’ai utilisé le vocabulaire de la séquence.', 'J’ai utilisé correctement les points de langue étudiés.']
  const specifique: Record<Activite, string[]> = {
    CO: ['J’ai identifié la situation (qui, où, quoi).', 'J’ai compris des informations précises.'],
    CE: ['J’ai compris l’idée générale du texte.', 'J’ai justifié avec des citations.'],
    EOC: ['J’ai parlé sans lire mes notes.', 'Ma prononciation était compréhensible.', 'J’ai relié mes idées (y, pero, porque, además).'],
    EOI: ['J’ai posé des questions et j’ai répondu.', 'J’ai réagi à ce que disait mon camarade.', 'J’ai parlé uniquement en espagnol.'],
    EE: ['Mon texte est organisé (connecteurs).', 'J’ai relu mon texte (accents, accords, conjugaison).'],
  }
  return [...commun, ...specifique[a]]
}

// ═════════════════════════════ TERMINALES ═════════════════════════════
// Modèle de la prof : batterie de 6-7 documents → choix par groupe → étude → axe d'attaque & problématique
// → choix du format (mini-pièce, podcast, diaporama, exposé) → restitution aux camarades. Niveau B2 :
// aucune activité « petite classe », consignes et répliques exigeantes, autonomie des groupes.

const FORMATS = ['una mini obra de teatro', 'un pódcast', 'una presentación (PowerPoint)', 'una exposición clásica']

function genererSeanceTle(p: ParamsGenerateur): Partial<Seance> {
  const type = p.type!
  const dossier = p.dossier ?? []
  const axe = p.programme.replace(/^Axe \d+ — /, '')
  const act = p.activiteEntree
  const entree: EtapeGen = act ? {
    titre: `Entrée en activité — ${act.titre}`, poids: 1.3, al: ['EOI'], modalite: 'Classe entière', role: 'je lance l’activité projetée et je distribue la parole',
    contenu: ['L’activité est projetée quand les élèves entrent.', '— « Buenos días. Tenéis la actividad en pantalla: os escucho. »', `${act.consigne}`, ...act.e.map((l) => `   ${l}`), ...(act.s?.length ? ['Pistes :', ...act.s.map((l) => `   ${l}`)] : [])],
  } : {
    titre: 'Entrée en activité', poids: 1, al: ['EOI'], modalite: 'Classe entière', role: 'je relance la réflexion de la séance précédente',
    contenu: ['— « ¿Dónde lo dejamos la última vez? ¿Qué ha avanzado cada grupo? »', '— « Un portavoz por grupo, treinta segundos cada uno. »'],
  }

  let etapes: EtapeGen[]
  switch (type) {
    case 'tle-galerie':
      etapes = [
        entree,
        { titre: 'Lancement de l’axe et du dispositif', poids: 1.2, al: ['CO'], modalite: 'Classe entière', role: 'je présente l’axe, le dispositif et les attendus',
          contenu: [
            `— « Hoy abrimos un nuevo eje: « ${axe} ». Os propongo ${dossier.length} documentos muy distintos: textos, imágenes, vídeos, datos. »`,
            '— « Vais a trabajar como investigadores: cada grupo elegirá un documento, lo estudiará a fondo, encontrará un ángulo de ataque y formulará una problemática. »',
            `— « Al final presentaréis vuestro trabajo a la clase en el formato que elijáis: ${FORMATS.join(', ')}. Entre cinco y siete minutos. »`,
            '— « El formato tiene que estar al servicio de la problemática, no al revés. »',
          ] },
        { titre: 'Galerie de documents', poids: 3.2, al: ['CE', 'CO', 'EOC'], modalite: 'Binômes, en circulation dans la salle', role: 'je fais tourner les binômes toutes les 3 minutes et je relance par des questions',
          contenu: [
            'Les documents sont affichés autour de la salle (vidéos et audios sur les ordinateurs, avec casques). Les binômes tournent toutes les 3 minutes avec la fiche « Primeras impresiones ».',
            '— « Tres minutos por documento: tipo, tema, una palabra clave y vuestro interés de una a tres estrellas. »',
            '— « No os quedéis en la superficie: ¿qué os llama la atención? ¿Qué os incomoda? »',
            ...dossier.map((d, i) => `   Doc ${i + 1} (${d.al}) — ${d.nature} : ${d.titre}${d.source ? ` (${d.source})` : ''}`),
          ] },
        { titre: 'Mise en commun des premières impressions', poids: 2, al: ['EOI'], modalite: 'Classe entière', role: 'je relève au tableau les notions qui émergent et je les relie à l’axe',
          contenu: [
            '— « ¿Qué documento os ha sorprendido más? ¿Por qué? »',
            '— « ¿Qué tienen en común todos estos documentos? ¿Qué hilo los une con el eje? »',
            'Je note au tableau les notions qui émergent (mémoire, pouvoir, identité…) : elles serviront de pistes de problématique.',
          ] },
        { titre: 'Consigne pour la prochaine séance', poids: 0.6, al: ['EE'], modalite: 'Individuel', role: 'je recueille les vœux',
          contenu: ['— « Para la próxima clase: clasificad vuestros tres documentos preferidos y justificad vuestra primera opción en dos frases. »'] },
      ]
      break
    case 'tle-choix':
      etapes = [
        entree,
        { titre: 'Vœux argumentés & constitution des groupes', poids: 2, al: ['EOC'], modalite: 'Classe entière', role: 'je forme des groupes de 3-4 hétérogènes, un document par groupe',
          contenu: ['Chaque élève défend son premier choix en 30 secondes.', '— « Elijo este documento porque me permite reflexionar sobre… »', 'Je constitue les groupes en équilibrant les profils ; un document différent par groupe.'] },
        { titre: 'Rôles dans le groupe', poids: 0.8, al: ['CE'], modalite: 'Groupes', role: 'j’explique les rôles, qui tourneront',
          contenu: ['— « Cada grupo reparte los roles: secretario, portavoz, responsable del tiempo y guardián del español. Los roles cambiarán en cada sesión. »'] },
        { titre: 'Première exploration du document', poids: 3, al: ['CE', 'CO'], modalite: 'Groupes', role: 'je passe dans chaque groupe et je vérifie la compréhension globale',
          contenu: ['Lecture / écoute / observation ; repérage du contexte (auteur, date, source, destinataire).', '— « ¿Quién habla? ¿A quién? ¿En qué contexto? ¿Con qué intención? »', '— « Si hay palabras que os bloquean, deducidlas por el contexto antes de buscarlas. »'] },
        { titre: 'Point d’étape', poids: 1, al: ['EOC'], modalite: 'Classe entière', role: 'je fais formuler une phrase de synthèse par groupe',
          contenu: ['— « Portavoces: en una sola frase, ¿de qué trata vuestro documento? »'] },
      ]
      break
    case 'tle-etude':
      etapes = [
        entree,
        { titre: 'Contextualisation (recherche guidée)', poids: 1.6, al: ['CE'], modalite: 'Groupes, avec tablettes / ordinateurs', role: 'je guide la recherche vers des sources fiables',
          contenu: ['— « Diez minutos para contextualizar: autor, época, acontecimientos. Fuentes fiables, por favor: prensa, museos, enciclopedias. »'] },
        { titre: 'Analyse avec la fiche méthode', poids: 3.4, al: ['CE', 'CO', 'EE'], modalite: 'Groupes', role: 'je circule comme personne-ressource : je questionne plus que je ne réponds',
          contenu: [
            'Les groupes avancent avec la fiche « Presentar · Describir · Analizar · Interpretar ».',
            '— « ¿Qué recursos utiliza el autor para provocar esta emoción? »',
            '— « ¿Por qué ha elegido este punto de vista y no otro? »',
            '— « ¿Y qué quiere decir eso? Id más allá de la descripción. »',
          ] },
        { titre: 'Flash langue : les outils de l’analyse', poids: 1, al: ['CE'], modalite: 'Classe entière', role: 'je donne les structures dont les groupes ont besoin',
          contenu: ['Je projette : « Se trata de… · El autor denuncia / pone de relieve… · Cabe destacar que… · Da la impresión de que… · Todo ello sugiere que… »'] },
        { titre: 'Bilan d’étape', poids: 1, al: ['EE'], modalite: 'Groupes', role: 'je relève les trois idées-clés de chaque groupe',
          contenu: ['— « Antes de iros: tres ideas clave por grupo, en el cuaderno de grupo. »'] },
      ]
      break
    case 'tle-problematique':
      etapes = [
        entree,
        { titre: 'Atelier : qu’est-ce qu’une bonne problématique ?', poids: 2, al: ['CE', 'EOI'], modalite: 'Classe entière', role: 'je fais comparer de bonnes et de mauvaises problématiques',
          contenu: [
            'Je projette deux questions sur Guernica et je fais choisir la meilleure :',
            '   A. ¿Qué se ve en el Guernica?',
            '   B. ¿Hasta qué punto una obra de arte puede convertirse en un arma contra la guerra?',
            '— « ¿Cuál es mejor? ¿Por qué? »',
            'Critères construits ensemble : ouverte (pas de oui/non), débattable, liée à l’axe, ancrée dans le document.',
          ] },
        { titre: 'Axe d’attaque & deux problématiques par groupe', poids: 2.6, al: ['EE', 'EOI'], modalite: 'Groupes', role: 'je valide ou je fais reformuler chaque proposition',
          contenu: [`— « ¿Qué ángulo os parece más fuerte para hablar de « ${axe} » a partir de vuestro documento? »`, '— « Formulad dos problemáticas: ¿En qué medida…? ¿Hasta qué punto…? ¿De qué manera…? »'] },
        { titre: 'Galerie des problématiques', poids: 1.4, al: ['CE', 'EOI'], modalite: 'Circulation', role: 'je fais voter et commenter',
          contenu: ['Chaque groupe affiche ses problématiques ; les autres laissent un post-it : « clara / demasiado amplia / ¿y si…? ».'] },
        { titre: 'Plan de la réponse', poids: 1, al: ['EE'], modalite: 'Groupes', role: 'je vérifie la cohérence plan / problématique',
          contenu: ['— « Elegid vuestra problemática definitiva y esbozad un plan en dos o tres partes. »'] },
      ]
      break
    case 'tle-format':
      etapes = [
        entree,
        { titre: 'Les quatre formats et leurs exigences', poids: 1.6, al: ['CO', 'CE'], modalite: 'Classe entière', role: 'je présente les formats et la grille d’évaluation',
          contenu: [
            '— « Mini obra de teatro: escenificáis el conflicto del documento; vuestros personajes tienen que defender posturas. »',
            '— « Pódcast: formato radio, con entrevista o debate ficticio; cuidado con la entonación, ¡no leáis! »',
            '— « Presentación: imágenes y palabras clave, nunca párrafos en las diapositivas. »',
            '— « Exposición clásica: introducción, problemática, plan anunciado, conclusión que responde. »',
            '— « Lo que se evalúa: la problemática, la calidad del análisis, la lengua y la eficacia del formato. »',
          ] },
        { titre: 'Choix argumenté du format', poids: 1.4, al: ['EOC'], modalite: 'Groupes puis classe entière', role: 'je vérifie que le format sert la problématique',
          contenu: ['— « Hemos elegido… porque nos permite… »', '— « ¿Ese formato ayuda de verdad a responder a vuestra problemática? »'] },
        { titre: 'Storyboard / plan détaillé & répartition', poids: 3, al: ['EE'], modalite: 'Groupes', role: 'je contrôle que chacun parle au moins 1 min 30',
          contenu: ['Chaque groupe produit un storyboard (théâtre, podcast) ou un plan détaillé (diaporama, exposé) et répartit la parole.', '— « Cada miembro tiene que hablar al menos minuto y medio. »'] },
      ]
      break
    case 'tle-atelier':
      etapes = [
        entree,
        { titre: 'Contrat de séance', poids: 0.8, al: ['EOC'], modalite: 'Groupes', role: 'je fais fixer un objectif précis à chaque groupe',
          contenu: ['— « ¿Qué tenéis que haber terminado al final de la hora? »'] },
        { titre: 'Production', poids: 4, al: ['EE', 'EOC'], modalite: 'Groupes', role: 'je suis « consultante linguistique » : je corrige, je propose des structures, je n’écris pas à leur place',
          contenu: ['Écriture du script / des diapositives, enregistrement des premières prises pour le podcast.', '— « Solo en español, también entre vosotros. »', '— « Esta frase es correcta, pero ¿podéis decirla de manera más natural? »'] },
        { titre: 'Flash langue (erreur la plus fréquente du jour)', poids: 0.8, al: ['CE'], modalite: 'Classe entière', role: 'je corrige collectivement une erreur relevée',
          contenu: ['Je projette une erreur relevée (anonyme) et la classe la corrige : concordance des temps, ser/estar, gallicismes…'] },
        { titre: 'Répétition éclair', poids: 1.2, al: ['EOC'], modalite: 'Groupes', role: 'j’écoute un passage par groupe et je donne un conseil précis',
          contenu: ['— « Ensayad el principio: el primer minuto es el que capta la atención. »'] },
      ]
      break
    case 'tle-restitution':
      etapes = [
        { titre: 'Accueil & ordre de passage', poids: 0.6, al: ['CO'], modalite: 'Classe entière', role: 'je rappelle les critères et la grille d’écoute',
          contenu: ['— « Hoy, presentaciones. El público tiene una misión: anotar la problemática, un argumento convincente y una pregunta. »'] },
        { titre: 'Restitutions', poids: 5, al: ['EOC', 'EOI'], modalite: 'Groupes devant la classe', role: 'j’évalue avec la grille ; je ne coupe pas pendant la prestation',
          contenu: ['Chaque groupe : 5 à 7 minutes, puis 3 minutes de questions de la classe.', '— « Adelante, os escuchamos. »', '— « Preguntas del público: ¿alguien quiere matizar o contradecir? »'] },
        { titre: 'Retours croisés', poids: 1.4, al: ['EOI'], modalite: 'Classe entière', role: 'je fais formuler des retours constructifs',
          contenu: ['— « Lo que más me ha convencido es… · Habría sido aún mejor si… »'] },
      ]
      break
    default: // tle-synthese
      etapes = [
        entree,
        { titre: 'Retour sur les restitutions', poids: 1.4, al: ['CE'], modalite: 'Classe entière', role: 'je valorise les réussites et je projette les erreurs fréquentes (anonymes)',
          contenu: ['Je rends les grilles et je projette cinq erreurs fréquentes à corriger collectivement.'] },
        { titre: 'Synthèse croisée de l’axe', poids: 3, al: ['EOI', 'EE'], modalite: 'Classe entière', role: 'j’anime la construction d’une carte mentale collective',
          contenu: [`— « Con todos los documentos y todas vuestras problemáticas, ¿qué respuesta damos a la gran pregunta del eje « ${axe} »? »`, 'Carte mentale au tableau : chaque groupe ajoute sa branche (document, problématique, réponse).'] },
        { titre: 'Trace écrite & auto-évaluation', poids: 1.6, al: ['EE'], modalite: 'Individuel', role: 'je vérifie les cahiers',
          contenu: ['Chaque élève recopie la carte mentale et remplit sa fiche d’auto-évaluation.', '— « ¿Qué habéis aprendido sobre el tema? ¿Y sobre vuestra manera de trabajar en grupo? »'] },
      ]
  }

  const durees = repartir(p.duree, etapes.map((e) => e.poids))
  const deroulement: Etape[] = etapes.map((e, i) => ({ id: uid(), titre: e.titre, duree: durees[i], activites: e.al, contenu: e.contenu.filter(Boolean).join('\n') }))
  const activites = [...new Set(etapes.flatMap((e) => e.al))]

  // ——— Exercices (exemple résolu en tête, toujours)
  const exercices: Exercice[] = []
  if (type === 'tle-galerie') exercices.push({ id: uid(), consigne: 'Primeras impresiones : pour chaque document, note le type, le thème, un mot-clé et ton intérêt (★ à ★★★).',
    exemple: 'Guernica (Picasso, 1937) → tipo: cuadro · tema: el bombardeo de una ciudad · palabra clave: el horror · interés: ★★★',
    items: dossier.map((d, i) => `Doc ${i + 1} — ${d.titre}`).join('\n'), corrige: '—' })
  if (type === 'tle-choix' || type === 'tle-etude') exercices.push({ id: uid(), consigne: 'Fiche méthode : analyse ton document en quatre temps.',
    exemple: 'Presentar → Se trata de un cuadro de Pablo Picasso pintado en 1937, tras el bombardeo de Guernica durante la Guerra Civil.',
    items: ['Presentar (tipo, autor, fecha, fuente, destinatario)', 'Describir (¿qué se ve / se oye / se cuenta?)', 'Analizar (recursos, punto de vista, tono, composición)', 'Interpretar (mensaje, relación con el eje)'].join('\n'), corrige: '—' })
  if (type === 'tle-problematique') exercices.push({ id: uid(), consigne: 'Transforme chaque question descriptive en vraie problématique.',
    exemple: '¿Qué se ve en el Guernica? → ¿Hasta qué punto una obra de arte puede convertirse en un arma contra la guerra?',
    items: ['¿Qué cuenta el tráiler de Roma?', '¿Quiénes son las Abuelas de Plaza de Mayo?', '¿Qué pasa en el anuncio de Justino?', '¿Qué muestra la foto de la marcha « Ni una menos »?'].join('\n'),
    corrige: ['¿En qué medida Roma hace visible a quienes la sociedad prefiere ignorar?', '¿Hasta qué punto la búsqueda de la verdad permite reconstruir una identidad robada?', '¿De qué manera la publicidad utiliza la emoción para vender valores?', '¿En qué medida la calle se convierte en un espacio de conquista para las mujeres?'].join('\n') })
  if (type === 'tle-format') exercices.push({ id: uid(), consigne: 'Pour chaque format, note un atout et un risque pour ta problématique.',
    exemple: 'Pódcast → atout : dar voz a varios personajes · risque : leer el guion sin entonación',
    items: ['Mini obra de teatro', 'Presentación (PowerPoint)', 'Exposición clásica'].join('\n'), corrige: '—' })
  if (type === 'tle-atelier') exercices.push({ id: uid(), consigne: 'Boîte à outils : complète avec le connecteur qui convient (si bien · no obstante · de ahí que · dado que).',
    exemple: '___ el documento es antiguo, sigue siendo actual. → Si bien el documento es antiguo, sigue siendo actual.',
    items: ['El tema es delicado; ___, merece debatirse.', '___ no había pruebas, el caso se cerró.', 'Nadie la escuchaba, ___ decidiera gritar.'].join('\n'), corrige: ['no obstante', 'Dado que', 'de ahí que'].join('\n') })
  if (type === 'tle-restitution' || type === 'tle-synthese') exercices.push({ id: uid(), consigne: 'Grille d’écoute / d’auto-évaluation (✔ acquis · ~ en cours · ✘ pas encore).',
    exemple: 'La problemática está claramente anunciada. → ✔', items: GRILLE_TLE.join('\n'), corrige: '—' })

  const diapos: Diapo[] = [{ id: uid(), titre: p.titre, texte: `Eje: ${axe}${p.problematique ? `\n${p.problematique}` : ''}`, image: '', aReveler: '' }]
  if (act) diapos.push({ id: uid(), titre: act.titre, texte: act.e.join('\n'), image: '', aReveler: (act.s ?? []).join('\n') })
  if (type === 'tle-galerie') {
    diapos.push({ id: uid(), titre: 'El dispositivo', texte: 'Un documento por grupo → análisis → ángulo de ataque → problemática → presentación (5-7 min)', image: '', aReveler: FORMATS.join('\n') })
    dossier.forEach((d, i) => diapos.push({ id: uid(), titre: `Documento ${i + 1}`, texte: `${d.nature} — ${d.titre}\n${d.source}`, image: '', aReveler: '' }))
  }
  if (type === 'tle-problematique') diapos.push({ id: uid(), titre: '¿Cuál es la mejor?', texte: 'A. ¿Qué se ve en el Guernica?\nB. ¿Hasta qué punto una obra de arte puede convertirse en un arma contra la guerra?', image: '', aReveler: 'abierta · debatible · ligada al eje · anclada en el documento' })
  if (type === 'tle-format' || type === 'tle-restitution') diapos.push({ id: uid(), titre: 'Criterios', texte: '', image: '', aReveler: GRILLE_TLE.join('\n') })

  return {
    titre: p.titre, programme: p.programme, activites, cecrlDe: 'B1', cecrlVers: 'B2', dureeMin: p.duree,
    competences: [
      `Programme : ${p.programme} (BO n° 22 du 29 mai 2025, annexe 10)`,
      p.problematique && `Problématique de l’axe : ${p.problematique}`,
      'Niveau visé : B1 → B2 (classe de très bon niveau)',
      '',
      'Compétences travaillées (CECRL, niveau B2) :',
      ...activites.map((x) => `• ${x} — ${DESCRIPTEURS.B2[x]}`),
      '',
      'Compétences transversales : travail collaboratif, recherche et évaluation de sources, problématisation, prise de parole en public, médiation (rendre compte d’un document à ses pairs).',
    ].filter((x): x is string => typeof x === 'string').join('\n'),
    progressionRef: p.progressionRef ?? '',
    organisation: ['Disposition : îlots de 3-4 élèves (un document par groupe) ; rôles tournants : secrétaire, porte-parole, gardien du temps, gardien de l’espagnol.',
      ...etapes.map((e, i) => `• ${e.titre} (${durees[i]} min) — ${e.modalite}. Mon rôle : ${e.role}.`)].join('\n'),
    materiel: ['Dossier documentaire imprimé (un jeu par groupe) ; vidéos et audios sur ordinateurs / tablettes avec casques',
      ...dossier.map((d, i) => `Doc ${i + 1} : ${d.nature} — ${d.titre} (${d.source})${d.aChoisir ? ' — à choisir / imprimer' : ''}${d.video ? ` — vidéo : ${d.video}` : ''}`),
      'Fiche méthode d’analyse · grille d’évaluation de la restitution',
      'Selon le format : téléphone / enregistreur (podcast), ordinateur (diaporama), accessoires (théâtre)'].join('\n'),
    videoUrl: p.videoUrl ?? dossier.find((d) => d.video)?.video ?? '',
    objectifs: {
      culturel: `${p.theme.charAt(0).toUpperCase()}${p.theme.slice(1)} — à travers un dossier de ${dossier.length} documents.`,
      lexical: (p.lexiquePaires ?? []).map(([es]) => es).join(', '),
      grammatical: 'Outils de l’analyse et de l’argumentation : subjonctif (opinion, concession), concordance des temps, connecteurs (si bien, no obstante, de ahí que…).',
      phonologique: 'Fluidité et intonation de la prise de parole en public (ne pas lire).',
      pragmatique: 'Présenter, analyser et problématiser un document ; argumenter, nuancer, réfuter ; rendre compte à un public.',
    },
    support: { titre: `Dossier : ${dossier.length} documents`, nature: 'Dossier documentaire', source: dossier.map((d) => d.titre).join(' · '), url: '' },
    tache: p.tacheFinale ?? '',
    traceEcrite: [
      p.titre,
      type === 'tle-problematique' ? 'Une bonne problématique est : ouverte · débattable · liée à l’axe · ancrée dans le document.\n¿En qué medida…? · ¿Hasta qué punto…? · ¿De qué manera…?' : '',
      type === 'tle-etude' ? 'Analyser un document : Presentar → Describir → Analizar → Interpretar\nSe trata de… · El autor denuncia / pone de relieve… · Cabe destacar que… · Todo ello sugiere que…' : '',
      type === 'tle-galerie' ? dossier.map((d, i) => `Doc ${i + 1} — ${d.titre}`).join('\n') : '',
      type === 'tle-synthese' ? `Carte mentale de l’axe « ${axe} » : documents, problématiques, réponses.` : '',
      p.lexiquePaires?.length ? `Vocabulario : ${p.lexiquePaires.map(([es]) => es).join(' · ')}` : '',
    ].filter(Boolean).join('\n\n'),
    deroulement,
    differenciation: {
      fragiles: 'Documents iconographiques ou courts orientés vers les groupes qui en ont besoin ; banque de structures d’analyse ; rôle de porte-parole préparé à l’avance ; droit à une fiche de mots-clés pendant la restitution.',
      aLaise: 'Documents littéraires ou oraux plus exigeants ; rôle de modérateur pendant les questions ; problématique croisant deux documents du dossier ; exigence de nuance (concession, réfutation).',
    },
    obstacles: [
      'Description sans analyse → je relance : « ¿Y qué quiere decir eso? ¿Por qué el autor hace esto? »',
      'Problématique trop large ou fermée (réponse oui / non) → je fais vérifier les quatre critères.',
      'Gallicismes : *realizar pour « se rendre compte » → darse cuenta ; *es por eso que → por eso ; *en qué medida que → en qué medida.',
      'Concordance des temps (quería que + subjonctif imparfait) → je la reprends en flash langue.',
      'Lecture du script pendant la restitution → règle : notes avec mots-clés uniquement.',
      'Parole inégale dans le groupe → rôles tournants, chaque élève parle au moins 1 min 30.',
    ].join('\n'),
    correction: [
      ...exercices.filter((e) => e.corrige && e.corrige !== '—').map((e) => `${e.consigne}\n${e.corrige}`),
      `Production attendue : ${p.tacheFinale ?? ''}`,
      `Critères : ${GRILLE_TLE.join(' · ')}`,
    ].join('\n\n'),
    exercices,
    diapos,
  }
}

const GRILLE_TLE = [
  'La problemática está claramente anunciada y es pertinente para el eje.',
  'El documento está presentado y analizado (no solo descrito).',
  'El formato elegido sirve la problemática.',
  'Cada miembro habla sin leer, con una lengua correcta y variada.',
  'La conclusión responde a la problemática.',
  'Respondemos a las preguntas del público.',
]
