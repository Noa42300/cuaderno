// Rituels de début de cours, par niveau. Le « rituel du jour » est tiré de façon déterministe
// à partir de la date : il change chaque jour mais reste le même si on recharge la page.

import type { ISODate } from '../db/types'
import { fechaEs } from '../lib/dates'
import type { NiveauProg } from './programmations'

export interface Rituel { titre: string; consigne: string; repliques: string[] }

/** Rituels communs (adaptés par niveau dans `RITUELS`). */
const FECHA_SIMPLE: Rituel = {
  titre: 'La fecha',
  consigne: 'Un élève écrit la date au tableau, la classe la lit en chœur.',
  repliques: ['— « ¿Qué día es hoy? »', '— « Hoy es lunes, dos de noviembre. »', '— « ¿Y mañana? »'],
}
const TIEMPO: Rituel = {
  titre: 'El tiempo',
  consigne: 'On regarde par la fenêtre et on décrit la météo.',
  repliques: ['— « ¿Qué tiempo hace hoy? »', '— « Hace frío / hace sol / llueve / está nublado. »'],
}
const EMOCIONES: Rituel = {
  titre: '¿Qué tal estás?',
  consigne: 'Tour de classe rapide : chacun dit comment il va, avec une raison.',
  repliques: ['— « ¿Qué tal estás hoy? »', '— « Estoy cansado porque… »', '— « Estoy contenta porque… »'],
}
const PALABRA: Rituel = {
  titre: 'La palabra del día',
  consigne: 'J’affiche un mot de la séquence ; les élèves le font deviner ou l’utilisent dans une phrase.',
  repliques: ['— « La palabra de hoy es… ¿Quién hace una frase? »'],
}
const LO_QUE_HICIMOS: Rituel = {
  titre: 'Lo que hicimos',
  consigne: 'Récapitulatif de la séance précédente par deux élèves.',
  repliques: ['— « ¿Qué hicimos la clase pasada? »', '— « Vimos… / Aprendimos… / Hablamos de… »'],
}
const ACTUALIDAD: Rituel = {
  titre: 'Noticia del día',
  consigne: 'Un élève présente en une minute une actualité du monde hispanique (préparée à la maison).',
  repliques: ['— « ¿Qué noticia nos traes hoy? »', '— « ¿Qué opináis vosotros? »'],
}
const DEBATE: Rituel = {
  titre: 'La pregunta del día',
  consigne: 'Question ouverte liée à l’axe : trois élèves réagissent, les autres rebondissent.',
  repliques: ['— « ¿Estáis de acuerdo? ¿Por qué? »', '— « Yo creo que… / No creo que… »'],
}

export const RITUELS: Record<NiveauProg, Rituel[]> = {
  '5e': [FECHA_SIMPLE, TIEMPO, EMOCIONES, PALABRA],
  '4e': [FECHA_SIMPLE, TIEMPO, EMOCIONES, PALABRA, LO_QUE_HICIMOS],
  '3e': [FECHA_SIMPLE, EMOCIONES, LO_QUE_HICIMOS, PALABRA],
  '1re': [LO_QUE_HICIMOS, ACTUALIDAD, DEBATE],
  Tle: [LO_QUE_HICIMOS, ACTUALIDAD, DEBATE],
}

/** Phrases à traduire (français → espagnol), avec corrigé. */
export const TRADUCTIONS: Record<NiveauProg, [string, string][]> = {
  '5e': [
    ['Je m’appelle Lucas et j’ai douze ans.', 'Me llamo Lucas y tengo doce años.'],
    ['Mon anniversaire est le 3 mai.', 'Mi cumpleaños es el tres de mayo.'],
    ['J’ai les yeux bleus et les cheveux bruns.', 'Tengo los ojos azules y el pelo moreno.'],
    ['Il fait froid aujourd’hui.', 'Hoy hace frío.'],
    ['J’aime le football mais je n’aime pas les maths.', 'Me gusta el fútbol pero no me gustan las matemáticas.'],
    ['J’habite à Lyon avec ma famille.', 'Vivo en Lyon con mi familia.'],
    ['Ma sœur est grande et sympathique.', 'Mi hermana es alta y simpática.'],
    ['Je me lève à sept heures.', 'Me levanto a las siete.'],
    ['Dans la classe, il y a vingt-cinq élèves.', 'En la clase hay veinticinco alumnos.'],
    ['Nous mangeons à la cantine.', 'Comemos en el comedor.'],
  ],
  '4e': [
    ['Mon frère aîné s’appelle Hugo.', 'Mi hermano mayor se llama Hugo.'],
    ['Je m’entends bien avec mes cousins.', 'Me llevo bien con mis primos.'],
    ['Coupe les tomates et ajoute l’huile.', 'Corta los tomates y añade el aceite.'],
    ['Pendant les vacances, je vais voyager en Espagne.', 'Durante las vacaciones, voy a viajar a España.'],
    ['La mairie est à côté de la place.', 'El ayuntamiento está al lado de la plaza.'],
    ['Madrid est plus grande que Séville.', 'Madrid es más grande que Sevilla.'],
    ['Hier, notre équipe a gagné le match.', 'Ayer, nuestro equipo ganó el partido.'],
    ['Quand j’étais petit, je jouais dans la rue.', 'Cuando era pequeño, jugaba en la calle.'],
    ['Il faut respecter les autres.', 'Hay que respetar a los demás.'],
    ['Je veux jouer au foot mais je ne peux pas.', 'Quiero jugar al fútbol pero no puedo.'],
  ],
  '3e': [
    ['Picasso a peint Guernica en 1937.', 'Picasso pintó el Guernica en 1937.'],
    ['Au premier plan, on voit une femme qui crie.', 'En primer plano, se ve a una mujer que grita.'],
    ['Les migrants traversaient la frontière la nuit.', 'Los migrantes cruzaban la frontera de noche.'],
    ['Plus tard, je serai médecin.', 'Más tarde, seré médico.'],
    ['Pourvu qu’il fasse beau demain !', '¡Ojalá haga buen tiempo mañana!'],
    ['Cette semaine, nous avons étudié une chanson.', 'Esta semana hemos estudiado una canción.'],
    ['Je voudrais réserver une chambre pour deux nuits.', 'Quisiera reservar una habitación para dos noches.'],
    ['Il faut que tu étudies davantage.', 'Es necesario que estudies más.'],
    ['L’Amérique latine est un continent très riche.', 'Latinoamérica es un continente muy rico.'],
    ['Quand j’étais petit, j’avais peur des chiens.', 'Cuando era pequeño, tenía miedo de los perros.'],
  ],
  '1re': [
    ['Je ne crois pas que ce soit facile de vivre entre deux cultures.', 'No creo que sea fácil vivir entre dos culturas.'],
    ['Il faut que la société accepte les différences.', 'Es necesario que la sociedad acepte las diferencias.'],
    ['Velázquez peignait pour le roi Philippe IV.', 'Velázquez pintaba para el rey Felipe IV.'],
    ['Si j’étais scientifique, je ferais des recherches sur le climat.', 'Si fuera científico, investigaría el clima.'],
    ['Protégeons la planète avant qu’il ne soit trop tard.', 'Protejamos el planeta antes de que sea demasiado tarde.'],
    ['Les Incas ont construit Machu Picchu au XVe siècle.', 'Los incas construyeron Machu Picchu en el siglo XV.'],
    ['À mon avis, l’intelligence artificielle sera un outil utile.', 'En mi opinión, la inteligencia artificial será una herramienta útil.'],
    ['Bien que le film soit triste, il donne de l’espoir.', 'Aunque la película sea triste, da esperanza.'],
  ],
  Tle: [
    ['Cleo travaillait pour une famille de la classe moyenne.', 'Cleo trabajaba para una familia de clase media.'],
    ['Les grands-mères cherchent leurs petits-enfants depuis 1977.', 'Las abuelas buscan a sus nietos desde 1977.'],
    ['Il est essentiel que nous n’oubliions pas le passé.', 'Es imprescindible que no olvidemos el pasado.'],
    ['Si la fiction n’existait pas, la réalité serait plus dure.', 'Si la ficción no existiera, la realidad sería más dura.'],
    ['La publicité cherche à nous émouvoir pour nous convaincre.', 'La publicidad intenta emocionarnos para convencernos.'],
    ['Les réseaux sociaux devraient protéger les mineurs.', 'Las redes sociales deberían proteger a los menores.'],
    ['Le métissage a enrichi la culture latino-américaine.', 'El mestizaje ha enriquecido la cultura latinoamericana.'],
    ['Bien qu’elle soit invisible pour la famille, Cleo est essentielle.', 'Aunque sea invisible para la familia, Cleo es imprescindible.'],
  ],
}

export const REFRANES: [string, string][] = [
  ['Más vale tarde que nunca.', 'Mieux vaut tard que jamais.'],
  ['En boca cerrada no entran moscas.', 'Trop parler nuit.'],
  ['A quien madruga, Dios le ayuda.', 'L’avenir appartient à ceux qui se lèvent tôt.'],
  ['Dime con quién andas y te diré quién eres.', 'Dis-moi qui tu fréquentes, je te dirai qui tu es.'],
  ['No hay mal que por bien no venga.', 'À quelque chose malheur est bon.'],
  ['Poco a poco se va lejos.', 'Petit à petit, l’oiseau fait son nid.'],
  ['Quien no arriesga no gana.', 'Qui ne tente rien n’a rien.'],
  ['Ojos que no ven, corazón que no siente.', 'Loin des yeux, loin du cœur.'],
  ['Más vale prevenir que curar.', 'Mieux vaut prévenir que guérir.'],
  ['El que la sigue la consigue.', 'Qui persévère réussit.'],
]

export const TRABALENGUAS = [
  'Tres tristes tigres tragaban trigo en un trigal.',
  'Erre con erre cigarro, erre con erre barril, rápido corren los carros cargados de azúcar del ferrocarril.',
  'Pablito clavó un clavito. ¿Qué clavito clavó Pablito?',
  'El cielo está enladrillado, ¿quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.',
  'Como poco coco como, poco coco compro.',
]

const graine = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11)

/** Rituel du jour d'une classe : toujours le même pour une date et une classe données. */
export function rituelDuJour(niveau: NiveauProg, date: ISODate, classeId = '') {
  const g = graine(date + classeId)
  const pick = <T,>(t: T[], k = 0) => t[(g + k * 7) % t.length]
  const trad = TRADUCTIONS[niveau]
  const n = niveau === '1re' || niveau === 'Tle' ? 2 : 3
  const traductions = Array.from({ length: n }, (_, i) => trad[(g + i * 3) % trad.length])
  // La date du jour, en espagnol, dans les répliques de « La fecha ».
  const fecha = fechaEs(date).replace(/ de \d{4}$/, '')
  const dater = (r: Rituel): Rituel => ({ ...r, repliques: r.repliques.map((l) => l.replace('Hoy es lunes, dos de noviembre.', `Hoy es ${fecha}.`)) })
  return {
    rituels: [RITUELS[niveau][0], pick(RITUELS[niveau].slice(1), 1)].filter(Boolean).map(dater),
    traductions: [...new Map(traductions.map((t) => [t[0], t])).values()],
    refran: pick(REFRANES, 2),
    trabalenguas: pick(TRABALENGUAS, 3),
  }
}
