// Générateur de squelette de séance — 100 % local et déterministe.
// Il produit une trame conforme (CLAUDE.md §7-8) que la prof relit et personnalise.
// Les passages entre [crochets] sont à compléter.

import { uid } from '../db/db'
import type { Activite, Cecrl, Diapo, Etape, Exercice, Seance } from '../db/types'

export interface PointLangue {
  label: string
  objectif: string
  regle: string
  obstacles: string
  exercice: { consigne: string; exemple: string; items: string[]; corrige: string[] }
}

export const POINTS_LANGUE: Record<string, PointLangue> = {
  aucun: {
    label: '— Aucun point de grammaire ciblé —',
    objectif: '',
    regle: '',
    obstacles: '',
    exercice: { consigne: '', exemple: '', items: [], corrige: [] },
  },
  ser_estar: {
    label: 'Ser / estar',
    objectif: 'Ser (identité, nationalité, caractère, profession) / estar (lieu, état passager)',
    regle: 'SER → ce qui définit : identité, origine, caractère, profession.\nESTAR → où l’on est et comment on est en ce moment : lieu, état.\nEx. : Frida es mexicana. Frida está triste.',
    obstacles: '« Es cansada » au lieu de « está cansada » → je demande : « ¿Es para siempre o ahora? » et je fais reformuler.\nLieu avec ser (« Madrid es en España ») → je rappelle : la localisation = estar.',
    exercice: {
      consigne: 'Complète avec la bonne forme de SER ou ESTAR.',
      exemple: 'Frida ___ mexicana. → Frida es mexicana.',
      items: ['Diego Rivera ___ pintor.', 'Hoy Frida ___ enferma.', 'La Casa Azul ___ en Coyoacán.', 'Nosotros ___ muy contentos.', 'Mis amigos ___ simpáticos.'],
      corrige: ['es', 'está', 'está', 'estamos', 'son'],
    },
  },
  gustar: {
    label: 'Gustar / encantar',
    objectif: 'Exprimer ses goûts : me gusta(n), me encanta(n), no me gusta(n) nada',
    regle: 'Ce qui plaît est le SUJET : me gusta + singulier / infinitif, me gustan + pluriel.\nme · te · le · nos · os · les + gusta(n)\nEx. : Me gusta la música. Me gustan los tacos.',
    obstacles: '« Yo gusto » calqué sur le français → je montre la structure : « A mí me gusta… » (ce qui plaît = sujet).\nAccord oublié (« me gusta los perros ») → je souligne le pluriel au tableau.',
    exercice: {
      consigne: 'Complète avec gusta ou gustan.',
      exemple: 'Me ___ el fútbol. → Me gusta el fútbol.',
      items: ['Te ___ los videojuegos.', 'A Lucía le ___ bailar.', 'Nos ___ las películas de terror.', 'No me ___ nada el café.', '¿Os ___ los perros?'],
      corrige: ['gustan', 'gusta', 'gustan', 'gusta', 'gustan'],
    },
  },
  presente_reg: {
    label: 'Présent des verbes réguliers',
    objectif: 'Conjuguer au présent les verbes en -ar, -er, -ir',
    regle: '-AR : hablo, hablas, habla, hablamos, habláis, hablan\n-ER : como, comes, come, comemos, coméis, comen\n-IR : vivo, vives, vive, vivimos, vivís, viven',
    obstacles: 'Pronom sujet systématique (« yo hablo, tú hablas ») → je rappelle : la terminaison suffit.\nConfusion -er/-ir à nosotros/vosotros → je fais le tableau comparatif.',
    exercice: {
      consigne: 'Conjugue le verbe entre parenthèses au présent.',
      exemple: 'Yo (hablar) español. → Yo hablo español.',
      items: ['Nosotros (vivir) en Lyon.', 'Mi hermana (comer) en el comedor.', 'Tú (estudiar) mucho.', 'Ellos (escribir) un correo.', 'Vosotros (bailar) muy bien.'],
      corrige: ['vivimos', 'come', 'estudias', 'escriben', 'bailáis'],
    },
  },
  presente_irr: {
    label: 'Présent : diphtongues et verbes irréguliers',
    objectif: 'Conjuguer les verbes à diphtongue (e>ie, o>ue) et à affaiblissement (e>i)',
    regle: 'La voyelle change quand elle est accentuée (pas à nosotros/vosotros) :\nquerer → quiero · poder → puedo · pedir → pido\nnosotros queremos / podemos / pedimos',
    obstacles: 'Diphtongue à nosotros (« pueremos ») → je montre « la botte » : la diphtongue n’entre pas dans nous/vous.\nOubli de la diphtongue (« podo ») → je fais répéter à l’oral en tapant l’accent.',
    exercice: {
      consigne: 'Conjugue au présent (attention à la diphtongue !).',
      exemple: 'Yo (querer) un helado. → Yo quiero un helado.',
      items: ['Tú (poder) venir.', 'Nosotros (empezar) a las ocho.', 'Ella (dormir) mucho.', 'Ellos (pedir) agua.', 'Vosotros (jugar) al fútbol.'],
      corrige: ['puedes', 'empezamos', 'duerme', 'piden', 'jugáis'],
    },
  },
  hay_estar: {
    label: 'Hay / está(n) — localiser',
    objectif: 'Décrire un lieu : hay (existence) / está(n) (localisation précise)',
    regle: 'HAY + un, una, unos, nombre, sans article → existence.\nEL / LA / LOS + nom + ESTÁ(N) → localisation.\nEx. : En la plaza hay una fuente. La fuente está en el centro.',
    obstacles: '« Hay la catedral » → je rappelle : jamais d’article défini après hay.\nPrépositions (a la derecha de, delante de…) → je les mime avec un objet.',
    exercice: {
      consigne: 'Complète avec hay, está ou están.',
      exemple: 'En mi barrio ___ un parque. → En mi barrio hay un parque.',
      items: ['El museo ___ al lado de la iglesia.', 'En la foto ___ muchas personas.', 'Los niños ___ delante de la casa.', 'En la mesa ___ dos libros.', 'La estación ___ lejos.'],
      corrige: ['está', 'hay', 'están', 'hay', 'está'],
    },
  },
  preterito: {
    label: 'Passé simple (pretérito indefinido)',
    objectif: 'Raconter des faits passés et terminés',
    regle: '-AR : hablé, hablaste, habló, hablamos, hablasteis, hablaron\n-ER/-IR : comí, comiste, comió, comimos, comisteis, comieron\nIrréguliers : fui, hice, tuve, estuve…',
    obstacles: 'Oubli de l’accent (« hablo » / « habló ») → je fais entendre la différence : présent vs passé.\nConfusion fui (ser/ir) → je montre que le contexte tranche.',
    exercice: {
      consigne: 'Conjugue au passé simple.',
      exemple: 'Ayer yo (visitar) el museo. → Ayer yo visité el museo.',
      items: ['En 1939 Frida (pintar) Las dos Fridas.', 'El año pasado nosotros (viajar) a México.', 'Ellos (comer) en un restaurante.', 'Tú (escribir) una carta.', 'Ayer (ir) yo al cine.'],
      corrige: ['pintó', 'viajamos', 'comieron', 'escribiste', 'fui'],
    },
  },
  imperfecto: {
    label: 'Imparfait (pretérito imperfecto)',
    objectif: 'Décrire et parler des habitudes dans le passé',
    regle: '-AR : -aba, -abas, -aba, -ábamos, -abais, -aban\n-ER/-IR : -ía, -ías, -ía, -íamos, -íais, -ían\nIrréguliers : ser (era), ir (iba), ver (veía)',
    obstacles: 'Imparfait / passé simple → je dessine la frise : décor (imperfecto) / action ponctuelle (indefinido).\n« Yo era » vs « yo estaba » → ser/estar s’applique aussi au passé.',
    exercice: {
      consigne: 'Conjugue à l’imparfait.',
      exemple: 'De pequeño yo (jugar) en la calle. → De pequeño yo jugaba en la calle.',
      items: ['Mis abuelos (vivir) en el campo.', 'Antes nosotros (ir) a la playa.', 'La casa (ser) muy grande.', 'Tú (tener) un perro.', 'Ella siempre (leer) por la noche.'],
      corrige: ['vivían', 'íbamos', 'era', 'tenías', 'leía'],
    },
  },
  futuro: {
    label: 'Futur / ir a + infinitif',
    objectif: 'Parler de projets et faire des prévisions',
    regle: 'Futur proche : IR A + infinitif → Voy a viajar.\nFutur : infinitif + -é, -ás, -á, -emos, -éis, -án → viajaré\nIrréguliers : tendré, haré, podré, saldré, diré…',
    obstacles: 'Oubli du « a » dans « voy a » → je fais répéter la structure en rythme.\nAccents du futur oubliés → je les fais entourer.',
    exercice: {
      consigne: 'Mets le verbe au futur.',
      exemple: 'Mañana yo (estudiar). → Mañana yo estudiaré.',
      items: ['El año que viene nosotros (viajar) a Perú.', 'Tú (tener) un buen trabajo.', 'Ellos (vivir) en Madrid.', 'Yo (hacer) los deberes.', 'Mi hermano (ser) médico.'],
      corrige: ['viajaremos', 'tendrás', 'vivirán', 'haré', 'será'],
    },
  },
  obligacion: {
    label: 'Obligation : tener que / hay que',
    objectif: 'Exprimer l’obligation personnelle et impersonnelle',
    regle: 'Obligation personnelle : TENER QUE + infinitif → Tengo que estudiar.\nObligation générale : HAY QUE + infinitif → Hay que respetar el medio ambiente.',
    obstacles: '« Tengo de » / « tengo estudiar » → j’écris la structure avec QUE en couleur.',
    exercice: {
      consigne: 'Complète avec la bonne forme de tener que ou avec hay que.',
      exemple: 'Yo ___ hacer los deberes. → Yo tengo que hacer los deberes.',
      items: ['Para aprobar, ___ estudiar.', 'Tú ___ ordenar tu cuarto.', 'Nosotros ___ salir a las siete.', 'En clase ___ levantar la mano.', 'Ellos ___ llamar a su madre.'],
      corrige: ['hay que', 'tienes que', 'tenemos que', 'hay que', 'tienen que'],
    },
  },
  subjuntivo: {
    label: 'Subjonctif présent (souhait, opinion négative)',
    objectif: 'Exprimer un souhait et une opinion négative',
    regle: 'Formation : radical de la 1re pers. du présent + voyelle inversée\n-AR → -e : hable · -ER/-IR → -a : coma, viva\nEmplois : Quiero que + subj. · No creo que + subj. · Ojalá + subj.',
    obstacles: '« Quiero que vienes » → je rappelle : deux sujets différents = subjonctif.\n« Creo que » + subjonctif (faux) → creo que = indicatif, no creo que = subjonctif.',
    exercice: {
      consigne: 'Conjugue au subjonctif présent.',
      exemple: 'Quiero que tú (hablar) más. → Quiero que tú hables más.',
      items: ['No creo que (ser) fácil.', 'Ojalá (llover) mañana.', 'Mis padres quieren que yo (estudiar).', 'Es importante que nosotros (participar).', 'No pienso que ellos (tener) razón.'],
      corrige: ['sea', 'llueva', 'estudie', 'participemos', 'tengan'],
    },
  },
  imperativo: {
    label: 'Impératif affirmatif',
    objectif: 'Donner des conseils et des consignes',
    regle: 'TÚ : 3e pers. du présent → habla, come, escribe\nVOSOTROS : infinitif -r → -d : hablad, comed\nUSTED(ES) : subjonctif → hable(n)\nIrréguliers (tú) : ven, haz, pon, sal, di, ve, ten, sé',
    obstacles: 'Pronoms enclitiques (« siéntate ») → je montre l’accent qui apparaît.\nConfusion tú / usted → je fais le jeu « profe / copain ».',
    exercice: {
      consigne: 'Mets à l’impératif (tú).',
      exemple: '(Escuchar) la canción. → Escucha la canción.',
      items: ['(Leer) el texto.', '(Venir) aquí.', '(Hacer) los ejercicios.', '(Abrir) la ventana.', '(Hablar) más alto.'],
      corrige: ['Lee', 'Ven', 'Haz', 'Abre', 'Habla'],
    },
  },
  comparatifs: {
    label: 'Comparatifs',
    objectif: 'Comparer : más / menos … que, tan … como',
    regle: 'MÁS + adjectif + QUE · MENOS + adjectif + QUE · TAN + adjectif + COMO\nIrréguliers : mejor, peor, mayor, menor\nEx. : Madrid es más grande que Sevilla.',
    obstacles: '« Más bueno » → je rappelle mejor / peor.\n« Tan … que » → égalité = tan … como.',
    exercice: {
      consigne: 'Complète avec más … que, menos … que ou tan … como.',
      exemple: 'Madrid es (+ grande) Toledo. → Madrid es más grande que Toledo.',
      items: ['El tren es (+ rápido) el autobús.', 'Mi barrio es (− ruidoso) el centro.', 'Lucía es (= alta) su hermana.', 'Este libro es (+ bueno) el otro.', 'La ciudad es (− tranquila) el pueblo.'],
      corrige: ['más rápido que', 'menos ruidoso que', 'tan alta como', 'mejor que', 'menos tranquila que'],
    },
  },
}

export const PHONOLOGIE = [
  'La jota [x] : jefe, mujer, Méjico/México, gente',
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

export interface ParamsGenerateur {
  titre: string
  theme: string // ce dont parle la séance (culturel)
  programme: string
  activite: Activite
  secondaires: Activite[]
  point: string // clé de POINTS_LANGUE
  lexique: string
  docNature: string
  docTitre: string
  docSource: string
  cecrlDe: Cecrl
  cecrlVers: Cecrl
  duree: number
}

const hashChaine = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/** Répartit la durée totale entre les étapes selon des poids. */
function repartir(duree: number, poids: number[]) {
  const total = poids.reduce((a, b) => a + b, 0)
  const brut = poids.map((p) => Math.max(5, Math.round((duree * p) / total / 5) * 5))
  // L'écart d'arrondi va à l'étape la plus longue (la découverte du document).
  brut[poids.indexOf(Math.max(...poids))] += duree - brut.reduce((a, b) => a + b, 0)
  return brut
}

function etape(titre: string, duree: number, activites: Activite[], contenu: string[]): Etape {
  return { id: uid(), titre, duree, activites, contenu: contenu.join('\n') }
}

export function genererSeance(p: ParamsGenerateur): Partial<Seance> {
  const lyc = p.cecrlVers.startsWith('B') || p.cecrlVers.startsWith('C')
  const pl = POINTS_LANGUE[p.point] ?? POINTS_LANGUE.aucun
  const doc = p.docTitre || '[titre du document]'
  const leDoc = p.docTitre ? `« ${p.docTitre} »` : 'le document'
  const theme = p.theme || p.titre || '[thème]'
  const mots = p.lexique.split(/[,;\n]/).map((m) => m.trim()).filter(Boolean)
  const a = p.activite
  const activites = [...new Set([a, ...p.secondaires])]
  const avecPoint = p.point !== 'aucun'

  // Durées réparties dans l'ordre des étapes ci-dessous.
  const durees = repartir(p.duree, avecPoint ? [1, 1.4, 3.5, 2, 2, 1.6, 1] : [1, 1.5, 4.5, 2.5, 2, 1])
  let k = 0
  const d = () => durees[k++]

  const deroulement: Etape[] = []

  deroulement.push(etape('Mise en route — rituel', d(), ['EOI'], [
    'J’accueille les élèves à la porte en espagnol, puis j’envoie un élève au tableau pour écrire la date.',
    '— « ¡Buenos días a todos! ¿Qué tal estáis hoy? »',
    '— « ¿Qué día es hoy? ¿Quién escribe la fecha en la pizarra? »',
    '— « ¿Qué hicimos la clase pasada? ¿Quién se acuerda? »',
    mots.length ? `Je réactive deux ou trois mots de la dernière fois (${mots.slice(0, 3).join(', ')}) en les faisant réutiliser dans une phrase.` : 'Je fais réactiver le lexique de la séance précédente : deux ou trois élèves font une phrase.',
  ]))

  deroulement.push(etape('Anticipation', d(), ['EOC', 'EOI'], [
    `Je projette ${a === 'CO' ? 'une image extraite de la vidéo' : 'le document'} sans le titre${lyc ? '' : ' et j’écris au tableau les amorces « Veo… / Creo que… / Me parece que… »'}.`,
    '— « Mirad bien. ¿Qué veis? ¿Qué os llama la atención? »',
    `— « Según vosotros, ¿de qué va a tratar ${a === 'CO' ? 'el vídeo' : 'el documento'}? »`,
    lyc ? '— « Justificad vuestras hipótesis: ¿qué elementos os permiten decir eso? »' : '— « Muy bien. Repite la frase completa, por favor. »',
    'Je note les hypothèses au tableau dans un coin : on les vérifiera ensuite.',
  ]))

  const decouverte: Record<Activite, string[]> = {
    CO: [
      `Première écoute de ${doc} sans consigne de détail : je veux juste le sens global.`,
      '— « Primera escucha: ¿quién habla? ¿dónde? ¿de qué habla? »',
      lyc ? '' : '— « Pas de panique : on ne cherche pas à tout comprendre. On repère les mots transparents. »',
      'Deuxième écoute : je distribue la grille de repérage (qui, où, quand, quoi, pourquoi).',
      '— « Segunda escucha: completad la tabla con lo que entendéis. »',
      'Troisième écoute, fractionnée : je m’arrête sur le passage clé.',
      '— « Escuchad bien esta frase. ¿Qué palabra repite? »',
    ],
    CE: [
      `Je distribue ${doc}. Lecture silencieuse, crayon en main.`,
      '— « Leed el texto en silencio y subrayad las palabras que entendéis. »',
      lyc ? '— « Primera pregunta: ¿cuál es la idea principal del texto? »' : '— « Soulignez en vert les noms de personnes et de lieux, en bleu les dates. »',
      'Je fais un premier tour : qui, quoi, où, quand.',
      '— « ¿De quién habla el texto? Justifica con una frase del texto. »',
      'Deuxième lecture ciblée avec le questionnaire (fiche d’exercices).',
    ],
    EOC: [
      `Je projette ${doc} en grand et je laisse une minute d’observation silencieuse.`,
      '— « Tenéis un minuto para observar. Luego, cada uno dice una frase. »',
      '— « ¿Qué hay en el primer plano? ¿Y en el fondo? »',
      '— « ¿Qué sentimientos expresa? ¿Por qué? »',
      'J’interroge un maximum d’élèves, je reformule et j’écris les structures utiles au tableau.',
      lyc ? '— « Ahora, en un minuto, presenta el documento como si fueras guía de museo. »' : '— « ¿Quién puede decir dos frases seguidas? »',
    ],
    EOI: [
      `Je présente la situation à partir de ${doc}.`,
      '— « Vamos a hacer un juego de rol. Trabajáis por parejas. »',
      'Je distribue les cartes de rôle (A / B) et je laisse 3 minutes de préparation, sans rédiger de phrases complètes.',
      '— « Solo palabras clave, ¡nada de frases completas! »',
      'Je circule et je débloque : je propose des amorces aux binômes en difficulté.',
      '— « ¿Qué le puedes preguntar a tu compañero? »',
      'Deux ou trois binômes passent devant la classe ; les autres notent une phrase qu’ils ont aimée.',
    ],
    EE: [
      `Je fais lire ${doc} comme modèle d’écrit.`,
      '— « ¿Cómo está organizado el texto? ¿Cuántas partes tiene? »',
      'Je fais repérer les connecteurs et je les note au tableau (Primero, Luego, Además, Por último).',
      '— « Ahora os toca a vosotros. Vais a escribir un texto parecido. »',
      'Rédaction guidée, je circule et j’annote au crayon sans corriger à la place des élèves.',
      '— « Relee tu frase: ¿el verbo está bien conjugado? »',
    ],
  }
  deroulement.push(etape(`Découverte du document (${a})`, d(), [a], decouverte[a].filter(Boolean)))

  deroulement.push(etape('Mise en commun & reformulation', d(), ['EOC', 'EOI'], [
    'Je fais restituer à l’oral ce qui a été compris, en partant des élèves qui ont le moins d’éléments.',
    '— « ¿Qué habéis entendido / leído? Empezamos por lo más importante. »',
    '— « ¿Estáis de acuerdo con vuestro compañero? »',
    'Je vérifie les hypothèses notées au tableau au début.',
    '— « ¿Teníamos razón al principio? »',
    `Je fais formuler une phrase de synthèse : « ${lyc ? 'El documento muestra que' : 'Se trata de'} … ».`,
  ]))

  if (avecPoint)
    deroulement.push(etape(`Point de langue — ${pl.label}`, d(), ['CE'], [
      `Je repars d’exemples tirés du document et je les écris au tableau.`,
      '— « Mirad estas frases. ¿Qué observáis? ¿Qué tienen en común? »',
      '— « Qu’est-ce qui change d’une phrase à l’autre ? Pourquoi ? »',
      'Je fais formuler la règle par les élèves avant de la valider.',
      `Règle validée : ${pl.regle.split('\n')[0]}`,
      '— « ¿Quién me da otro ejemplo? »',
    ]))

  deroulement.push(etape('Entraînement', d(), avecPoint ? ['EE'] : ['EE', 'EOC'], [
    'Je distribue la fiche d’exercices. Je fais lire l’exemple à voix haute avant de lancer.',
    '— « Mirad el ejemplo: así se hace. ¿Alguna pregunta? »',
    'Je circule. Les élèves qui terminent vite passent au défi.',
    '— « ¡Muy bien! Ahora intenta el desafío. »',
    'Correction collective rapide : un élève lit, la classe valide.',
  ]))

  deroulement.push(etape('Trace écrite & devoirs', d(), ['EE'], [
    'Je projette la trace écrite ; les élèves la collent ou la recopient.',
    '— « Copiad la lección en el cuaderno, por favor. »',
    '— « Para la próxima clase: aprender la lección y el vocabulario. »',
    '— « ¡Hasta el [jour du prochain cours]! »',
  ]))

  const phono = PHONOLOGIE[hashChaine(p.titre + p.theme) % PHONOLOGIE.length]

  const exercices: Exercice[] = []
  if (avecPoint)
    exercices.push({ id: uid(), consigne: pl.exercice.consigne, exemple: pl.exercice.exemple, items: pl.exercice.items.join('\n'), corrige: pl.exercice.corrige.join('\n') })
  exercices.push({
    id: uid(),
    consigne: a === 'CO' || a === 'CE' ? 'Vrai ou faux ? Justifie avec le document.' : 'Réponds en espagnol par une phrase complète.',
    exemple: a === 'CO' || a === 'CE'
      ? `Le document parle de ${theme}. → Verdadero : « [citation du document] »`
      : '¿De qué trata el documento? → El documento trata de [tema].',
    items: a === 'CO' || a === 'CE'
      ? '[affirmation 1]\n[affirmation 2]\n[affirmation 3]\n[affirmation 4]'
      : '¿Qué ves en el documento?\n¿Qué sientes al verlo?\n¿Te gusta? ¿Por qué?',
    corrige: '[à compléter]',
  })
  if (mots.length >= 2)
    exercices.push({
      id: uid(),
      consigne: 'Écris une phrase avec chaque mot du vocabulaire.',
      exemple: `${mots[0]} → [phrase modèle avec « ${mots[0]} »]`,
      items: mots.slice(1).join('\n'),
      corrige: 'Phrases libres : vérifier le sens et l’accord.',
    })

  const diapos: Diapo[] = [
    { id: uid(), titre: p.titre || theme, texte: 'Hoy es [la fecha]', image: '', aReveler: '' },
    {
      id: uid(), titre: '¿Qué veis?', texte: `${p.docNature || 'Documento'} : ${doc}${p.docSource ? ` — ${p.docSource}` : ''}`, image: '',
      aReveler: lyc ? 'En el primer plano se ve…\nMe parece que…\nEl documento muestra que…' : 'Veo…\nCreo que…\nMe parece que…',
    },
    {
      id: uid(), titre: a === 'CO' ? 'Escuchamos' : a === 'CE' ? 'Leemos' : a === 'EE' ? 'Escribimos' : 'Hablamos',
      texte: a === 'CO' ? '¿Quién? ¿Dónde? ¿Qué? ¿Por qué?' : 'Consigna : [à compléter]', image: '',
      aReveler: '¿Quién?\n¿Dónde?\n¿Cuándo?\n¿Qué?\n¿Por qué?',
    },
  ]
  if (avecPoint) diapos.push({ id: uid(), titre: pl.label, texte: 'Observa :', image: '', aReveler: pl.regle })
  if (mots.length) diapos.push({ id: uid(), titre: 'Vocabulario', texte: '', image: '', aReveler: mots.join('\n') })
  diapos.push({ id: uid(), titre: 'Para la próxima clase', texte: 'Aprender la lección y el vocabulario.', image: '', aReveler: '' })

  return {
    titre: p.titre,
    programme: p.programme,
    activites,
    cecrlDe: p.cecrlDe,
    cecrlVers: p.cecrlVers,
    dureeMin: p.duree,
    objectifs: {
      culturel: `Découvrir ${theme}${p.docTitre ? ` à travers ${leDoc}${p.docSource && !theme.includes(p.docSource) ? ` (${p.docSource})` : ''}` : ''}.`,
      lexical: mots.length ? mots.join(', ') : '[champ lexical à préciser]',
      grammatical: pl.objectif,
      phonologique: phono,
      pragmatique: PRAGMATIQUE[a],
    },
    support: { titre: p.docTitre, nature: p.docNature, source: p.docSource, url: '' },
    tache: {
      CO: `Je restitue en espagnol l’essentiel de ${leDoc} (qui, où, quoi, pourquoi) en trois phrases.`,
      CE: 'Je réponds au questionnaire en justifiant avec des citations du texte.',
      EOC: `Je présente ${leDoc} à la classe pendant ${lyc ? '1 min 30' : '1 min'}, sans lire mes notes.`,
      EOI: 'Avec mon binôme, je joue la scène en réagissant aux propos de l’autre.',
      EE: `J’écris un texte de ${lyc ? '120' : '50'} mots environ sur ${theme}, avec trois connecteurs.`,
    }[a],
    traceEcrite: [
      `${p.titre || theme}`,
      `${p.docNature || 'Documento'} : ${doc}${p.docSource ? ` (${p.docSource})` : ''}`,
      `Se trata de [résumé en une ou deux phrases, construit avec la classe].`,
      mots.length ? `Vocabulario : ${mots.join(' · ')}` : '',
      avecPoint ? `\n${pl.label}\n${pl.regle}` : '',
    ].filter(Boolean).join('\n'),
    deroulement,
    differenciation: {
      fragiles: {
        CO: 'Je donne une grille de repérage pré-remplie en partie et une liste de mots transparents ; je fais réécouter le passage clé.',
        CE: 'Je donne un texte avec les mots difficiles glosés en marge et des questions fermées (vrai/faux) avant les questions ouvertes.',
        EOC: 'J’affiche les amorces (Veo… / Creo que… / Me parece que…) et je laisse une minute de préparation avec mots-clés.',
        EOI: 'Je donne une carte de rôle avec des questions toutes faites ; le binôme peut s’appuyer sur la banque de mots.',
        EE: 'Je fournis un texte à trous / un plan avec amorces de phrases et une banque de mots.',
      }[a],
      aLaise: {
        CO: 'Je demande de repérer les émotions et l’intention de l’auteur, puis de reformuler sans notes.',
        CE: 'Questions d’interprétation : ¿Cuál es el mensaje del autor? Justifica.',
        EOC: 'Je demande de donner son avis argumenté et de faire un lien avec un autre document vu en classe.',
        EOI: 'Je donne une carte « imprévu » pour relancer l’échange.',
        EE: 'Défi : utiliser un temps du passé et deux connecteurs supplémentaires.',
      }[a],
    },
    obstacles: [
      pl.obstacles,
      {
        CO: 'Les élèves veulent tout comprendre et décrochent → je rassure en français, je fractionne et je cible les mots transparents.',
        CE: 'Lecture mot à mot → je fais d’abord repérer les mots connus et transparents, puis deviner le sens global.',
        EOC: 'Blocage à l’oral / réponses en un mot → je fais reformuler en phrase complète avec une amorce.',
        EOI: 'Le binôme bascule en français → je passe et je relance en espagnol : « ¿Cómo se dice en español? »',
        EE: 'Traduction mot à mot depuis le français → je rappelle : « Utilise ce que tu sais dire, simplement. »',
      }[a],
      'Accentuation oubliée → je fais entendre la syllabe forte et je fais placer l’accent.',
    ].filter(Boolean).join('\n'),
    correction: [
      avecPoint ? `${pl.label} : ${pl.exercice.corrige.join(' · ')}` : '',
      `Production attendue (exemple) : « ${lyc ? 'El documento muestra que' : 'Se trata de'} [contenu attendu]. »`,
    ].filter(Boolean).join('\n'),
    exercices,
    diapos,
  }
}
