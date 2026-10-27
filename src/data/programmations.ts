// Programmations annuelles d'espagnol LV2 / LVB, construites sur les programmes en vigueur en 2026-2027
// (voir officiel.ts). 6 séquences par niveau, une par période environ.
// Vidéos : liens trouvés par recherche le 2026-10-27 (YouTube) — à vérifier avant projection.
// `aChoisir` : document dont la nature est fixée mais que la prof choisit (article de presse récent, photo…).

import type { Activite } from '../db/types'

export interface DocProg {
  nature: string
  titre: string
  source: string
  al: Activite
  video?: string
  aChoisir?: boolean
}

export interface SeqProg {
  id: string
  periode: number
  titre: string
  axe: string
  problematique: string
  culturel: string
  points: [string, string] // clés de POINTS_LANGUE
  lexique: [string, string][] // [espagnol, français]
  docs: [DocProg, DocProg, DocProg]
  /** Terminales : batterie de 6-7 documents au choix des groupes */
  dossier?: DocProg[]
  tache: { al: Activite; texte: string }
}

export type NiveauProg = '5e' | '4e' | '3e' | '1re' | 'Tle'

const V = {
  colorEsperanza: 'https://www.youtube.com/watch?v=Nb1VOQRs-Vs',
  clandestino: 'https://www.youtube.com/watch?v=rSEUH4KRfN8',
  latinoamerica: 'https://www.youtube.com/watch?v=DkFJE8ZdeG8',
  justino: 'https://www.youtube.com/watch?v=tX5lpwTj3uA',
  recuerdame: 'https://www.youtube.com/watch?v=x-PPybL6p9Q',
  vivirMiVida: 'https://www.youtube.com/watch?v=YXnjy5YlDwk',
  soyYo: 'https://www.youtube.com/watch?v=bxWxXncl53U',
  campeones: 'https://www.youtube.com/watch?v=POxh1o6EufI',
  jaulaDeOro: 'https://www.youtube.com/watch?v=dpoqS4uUb8o',
  roma: 'https://www.youtube.com/watch?v=ZXUWVDllIjE',
  laberinto: 'https://www.youtube.com/watch?v=_z6InvrJGpQ',
  no: 'https://www.youtube.com/watch?v=HEyV8D1gHdI',
}

export const PROGRAMMATIONS: Record<NiveauProg, SeqProg[]> = {
  '5e': [
    {
      id: '5e-1', periode: 1, titre: '¡Hola! Así soy yo', axe: 'Axe 1 — Portrait, autoportrait',
      problematique: '¿Cómo me presento a los demás?',
      culturel: 'découvrir Frida Kahlo, Mafalda et la musique colombienne',
      points: ['presentarse', 'genero_numero'],
      lexique: [['llamarse', 's’appeler'], ['tener … años', 'avoir … ans'], ['el cumpleaños', 'l’anniversaire'], ['alto / bajo', 'grand / petit'], ['moreno / rubio', 'brun / blond'], ['simpático', 'sympathique'], ['los ojos', 'les yeux'], ['el pelo', 'les cheveux'], ['vivir en', 'habiter à'], ['el hermano', 'le frère']],
      docs: [
        { nature: 'Bande dessinée', titre: 'Mafalda — les personnages se présentent', source: 'Quino (Argentine)', al: 'CE' },
        { nature: 'Œuvre d’art (peinture)', titre: 'Autorretrato con collar de espinas y colibrí (1940)', source: 'Frida Kahlo', al: 'EOC' },
        { nature: 'Chanson / clip', titre: 'Soy yo (2015)', source: 'Bomba Estéreo (Colombie)', al: 'CO', video: V.soyYo },
      ],
      tache: { al: 'EOC', texte: 'Je me présente dans une courte vidéo pour un correspondant mexicain : nom, âge, physique, caractère, goûts.' },
    },
    {
      id: '5e-2', periode: 2, titre: '¡Viva el Día de Muertos!', axe: 'Axe 6 — Le Mexique',
      problematique: '¿Cómo celebran los mexicanos a sus muertos?',
      culturel: 'comprendre le Día de Muertos, fête mexicaine inscrite au patrimoine immatériel de l’UNESCO',
      points: ['hay_estar', 'presente_reg'],
      lexique: [['el altar', 'l’autel'], ['la ofrenda', 'l’offrande'], ['la calavera', 'la tête de mort'], ['el pan de muerto', 'le pain des morts'], ['la vela', 'la bougie'], ['la flor de cempasúchil', 'l’œillet d’Inde'], ['recordar', 'se souvenir'], ['el esqueleto', 'le squelette'], ['los antepasados', 'les ancêtres'], ['celebrar', 'fêter']],
      docs: [
        { nature: 'Clip (film d’animation)', titre: 'Coco (2017) — « Recuérdame »', source: 'Disney•Pixar, chanté par Carlos Rivera', al: 'CO', video: V.recuerdame },
        { nature: 'Œuvre d’art (gravure)', titre: 'La Calavera Catrina (vers 1910)', source: 'José Guadalupe Posada', al: 'EOC' },
        { nature: 'Poèmes traditionnels', titre: 'Calaveritas literarias', source: 'tradition mexicaine', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Nous fabriquons l’altar de muertos de la classe ; je présente l’élément que j’ai apporté et je dis pourquoi.' },
    },
    {
      id: '5e-3', periode: 3, titre: 'Mi día a día', axe: 'Axe 2 — Le quotidien : lieux, rythmes, saisons',
      problematique: '¿Vivimos al mismo ritmo en España y en Francia?',
      culturel: 'comparer les horaires et les rythmes de vie en Espagne et en France',
      points: ['reflexivos', 'presente_irr'],
      lexique: [['levantarse', 'se lever'], ['ducharse', 'se doucher'], ['desayunar', 'prendre le petit-déjeuner'], ['comer', 'déjeuner'], ['cenar', 'dîner'], ['acostarse', 'se coucher'], ['por la mañana', 'le matin'], ['por la tarde', 'l’après-midi'], ['por la noche', 'le soir, la nuit'], ['¿Qué hora es?', 'Quelle heure est-il ?']],
      docs: [
        { nature: 'Infographie', titre: 'Los horarios de comida en España', source: 'presse espagnole', al: 'CE', aChoisir: true },
        { nature: 'Chanson / clip', titre: 'Vivir mi vida (2013)', source: 'Marc Anthony', al: 'CO', video: V.vivirMiVida },
        { nature: 'Photographies', titre: 'Navidad en verano en Argentina', source: 'hémisphère sud', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'J’écris à mon correspondant pour décrire ma journée type et je la compare à la sienne.' },
    },
    {
      id: '5e-4', periode: 3, titre: '¿Qué haces después de clase?', axe: 'Axe 3 — École et loisirs',
      problematique: '¿Qué tienen en común los colegios de aquí y de allá?',
      culturel: 'découvrir l’école et les loisirs des jeunes hispanophones',
      points: ['gustar', 'obligacion'],
      lexique: [['las asignaturas', 'les matières'], ['el recreo', 'la récréation'], ['el horario', 'l’emploi du temps'], ['los deberes', 'les devoirs'], ['jugar al fútbol', 'jouer au football'], ['tocar la guitarra', 'jouer de la guitare'], ['leer', 'lire'], ['el fin de semana', 'le week-end'], ['me aburre', 'ça m’ennuie'], ['me encanta', 'j’adore']],
      docs: [
        { nature: 'Bande dessinée', titre: 'Mafalda va al colegio', source: 'Quino', al: 'CE' },
        { nature: 'Document authentique', titre: 'El horario de un colegio español', source: 'collège espagnol', al: 'CE', aChoisir: true },
        { nature: 'Enregistrement audio', titre: 'Un adolescent parle de ses loisirs', source: 'Audio-Lingua (audio-lingua.eu)', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Avec mon binôme, nous comparons nos emplois du temps et nos loisirs, comme deux correspondants qui se rencontrent.' },
    },
    {
      id: '5e-5', periode: 4, titre: 'Alebrijes y leyendas', axe: 'Axe 4 — Le réel et l’imaginaire',
      problematique: '¿Qué criaturas imaginan los mexicanos?',
      culturel: 'découvrir les alebrijes d’Oaxaca et les légendes mexicaines',
      points: ['ser_estar', 'comparatifs'],
      lexique: [['el alebrije', 'l’alebrije (créature fantastique)'], ['la cabeza', 'la tête'], ['las alas', 'les ailes'], ['la cola', 'la queue'], ['las patas', 'les pattes'], ['tiene', 'il / elle a'], ['parece', 'il / elle ressemble à'], ['da miedo', 'ça fait peur'], ['la leyenda', 'la légende'], ['el fantasma', 'le fantôme']],
      docs: [
        { nature: 'Artisanat (photographies)', titre: 'Les alebrijes de Pedro Linares', source: 'Mexico / Oaxaca', al: 'EOC' },
        { nature: 'Légende (texte adapté)', titre: 'La Llorona', source: 'tradition mexicaine', al: 'CE', aChoisir: true },
        { nature: 'Images de film', titre: 'Coco — Dante et Pepita, les alebrijes', source: 'Disney•Pixar (2017)', al: 'EOC' },
      ],
      tache: { al: 'EE', texte: 'J’invente mon alebrije : je le dessine, je le décris par écrit puis je le présente à la classe.' },
    },
    {
      id: '5e-6', periode: 5, titre: '¡Vámonos a México!', axe: 'Axe 5 — Des langues, des lieux, des histoires (+ axe 6)',
      problematique: '¿Qué descubrir en México?',
      culturel: 'découvrir des lieux emblématiques du Mexique et l’héritage du náhuatl',
      points: ['hay_estar', 'futuro'],
      lexique: [['la pirámide', 'la pyramide'], ['la playa', 'la plage'], ['el mercado', 'le marché'], ['visitar', 'visiter'], ['el viaje', 'le voyage'], ['el avión', 'l’avion'], ['voy a', 'je vais (+ infinitif)'], ['el chocolate', 'le chocolat (mot náhuatl)'], ['el aguacate', 'l’avocat (mot náhuatl)'], ['la capital', 'la capitale']],
      docs: [
        { nature: 'Photographies', titre: 'Teotihuacán : la Pirámide del Sol', source: 'site archéologique, Mexique', al: 'EOC' },
        { nature: 'Texte informatif', titre: 'Palabras del náhuatl en español', source: 'chocolate, tomate, aguacate…', al: 'CE', aChoisir: true },
        { nature: 'Chanson traditionnelle', titre: 'Cielito lindo', source: 'Quirino Mendoza y Cortés (1882)', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente l’itinéraire de voyage que j’ai préparé pour ma famille au Mexique.' },
    },
  ],

  '4e': [
    {
      id: '4e-1', periode: 1, titre: 'Mi familia', axe: 'Rencontres avec d’autres cultures',
      problematique: '¿Cómo son las familias en el mundo hispano?',
      culturel: 'découvrir Fernando Botero et les noms de famille hispaniques',
      points: ['posesivos', 'ser_estar'],
      lexique: [['los padres', 'les parents'], ['el hermano mayor', 'le frère aîné'], ['la hermana menor', 'la sœur cadette'], ['los abuelos', 'les grands-parents'], ['el primo', 'le cousin'], ['el tío', 'l’oncle'], ['hijo único', 'fils unique'], ['el apellido', 'le nom de famille'], ['parecerse a', 'ressembler à'], ['llevarse bien con', 's’entendre bien avec']],
      docs: [
        { nature: 'Œuvre d’art (peinture)', titre: 'Una familia', source: 'Fernando Botero (Colombie)', al: 'EOC' },
        { nature: 'Bande dessinée', titre: 'Mafalda y su familia', source: 'Quino', al: 'CE' },
        { nature: 'Article', titre: 'Los dos apellidos en España', source: 'presse / site culturel', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente ma famille (réelle ou imaginaire) à partir de mon arbre généalogique.' },
    },
    {
      id: '4e-2', periode: 2, titre: '¡Qué rico!', axe: 'Rencontres avec d’autres cultures',
      problematique: '¿Qué nos dice la comida de un país?',
      culturel: 'découvrir la gastronomie espagnole et la poésie de Pablo Neruda',
      points: ['gustar', 'imperativo'],
      lexique: [['el gazpacho', 'le gaspacho'], ['la tortilla', 'l’omelette'], ['las tapas', 'les tapas'], ['el aceite de oliva', 'l’huile d’olive'], ['cortar', 'couper'], ['mezclar', 'mélanger'], ['añadir', 'ajouter'], ['rico', 'délicieux'], ['picante', 'épicé'], ['la receta', 'la recette']],
      docs: [
        { nature: 'Poème', titre: 'Oda al tomate (1954) — extraits', source: 'Pablo Neruda', al: 'CE' },
        { nature: 'Reportage vidéo', titre: 'La Tomatina de Buñol', source: 'reportage TV', al: 'CO', aChoisir: true },
        { nature: 'Recette', titre: 'Receta del gazpacho andaluz', source: 'recette authentique', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente une recette hispanique en vidéo pour le « recetario » de la classe.' },
    },
    {
      id: '4e-3', periode: 2, titre: 'Navidad en España', axe: 'Rencontres avec d’autres cultures',
      problematique: '¿Qué tradiciones tienen los españoles en Navidad?',
      culturel: 'découvrir la Lotería de Navidad, les douze raisins et les Rois mages',
      points: ['presente_irr', 'futuro'],
      lexique: [['el décimo', 'le billet de loterie'], ['el Gordo', 'le gros lot'], ['las uvas', 'les raisins'], ['Nochevieja', 'la Saint-Sylvestre'], ['los Reyes Magos', 'les Rois mages'], ['el roscón', 'la couronne des Rois'], ['el turrón', 'le touron'], ['compartir', 'partager'], ['la suerte', 'la chance'], ['regalar', 'offrir']],
      docs: [
        { nature: 'Publicité', titre: 'Anuncio de la Lotería de Navidad 2015 — Justino', source: 'Loterías y Apuestas del Estado (Leo Burnett Madrid)', al: 'CO', video: V.justino },
        { nature: 'Article', titre: 'Las doce uvas de Nochevieja', source: 'presse espagnole', al: 'CE', aChoisir: true },
        { nature: 'Photographies', titre: 'La cabalgata de Reyes', source: 'Espagne, 5 janvier', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'J’écris une carte de vœux à un ami espagnol et je lui raconte ce que je vais faire pendant les fêtes.' },
    },
    {
      id: '4e-4', periode: 3, titre: 'Mi barrio, mi ciudad', axe: 'Voyages et migrations',
      problematique: '¿Cómo es una ciudad española?',
      culturel: 'découvrir Barcelone (Gaudí) et Madrid',
      points: ['hay_estar', 'comparatifs'],
      lexique: [['la plaza', 'la place'], ['la calle', 'la rue'], ['el ayuntamiento', 'la mairie'], ['la catedral', 'la cathédrale'], ['a la derecha', 'à droite'], ['a la izquierda', 'à gauche'], ['todo recto', 'tout droit'], ['cerca de', 'près de'], ['lejos de', 'loin de'], ['el barrio', 'le quartier']],
      docs: [
        { nature: 'Architecture (photographies)', titre: 'La Sagrada Familia', source: 'Antoni Gaudí, Barcelone', al: 'EOC' },
        { nature: 'Plan de ville', titre: 'Madrid : la Puerta del Sol y la Plaza Mayor', source: 'plan touristique', al: 'CE', aChoisir: true },
        { nature: 'Enregistrement audio', titre: 'Pedir el camino', source: 'Audio-Lingua (audio-lingua.eu)', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Je guide un touriste espagnol dans ma ville : il me demande son chemin, je lui réponds.' },
    },
    {
      id: '4e-5', periode: 4, titre: 'Campeones', axe: 'École et société',
      problematique: '¿Qué nos enseña el deporte?',
      culturel: 'découvrir le film Campeones et le sport comme école de la vie',
      points: ['preterito', 'obligacion'],
      lexique: [['el equipo', 'l’équipe'], ['el entrenador', 'l’entraîneur'], ['el partido', 'le match'], ['ganar', 'gagner'], ['perder', 'perdre'], ['entrenar', 's’entraîner'], ['superarse', 'se dépasser'], ['el respeto', 'le respect'], ['la discapacidad', 'le handicap'], ['el campeón', 'le champion']],
      docs: [
        { nature: 'Bande-annonce', titre: 'Campeones (2018)', source: 'Javier Fesser', al: 'CO', video: V.campeones },
        { nature: 'Biographie', titre: 'Rafa Nadal, un campeón', source: 'presse sportive', al: 'CE', aChoisir: true },
        { nature: 'Affiche de film', titre: 'Campeones (2018)', source: 'Javier Fesser', al: 'EOC' },
      ],
      tache: { al: 'EE', texte: 'J’écris l’article d’un journal sportif sur un champion ou une championne hispanique.' },
    },
    {
      id: '4e-6', periode: 5, titre: 'Recuerdos de infancia', axe: 'Langages',
      problematique: '¿Cómo era la infancia de nuestros abuelos?',
      culturel: 'découvrir Juan Ramón Jiménez (Platero y yo) et l’Espagne d’autrefois',
      points: ['imperfecto', 'comparatifs'],
      lexique: [['de pequeño', 'quand j’étais petit'], ['antes', 'avant'], ['ahora', 'maintenant'], ['el juguete', 'le jouet'], ['jugar', 'jouer'], ['el pueblo', 'le village'], ['el recuerdo', 'le souvenir'], ['echar de menos', 'regretter, manquer'], ['la infancia', 'l’enfance'], ['solía', 'j’avais l’habitude de']],
      docs: [
        { nature: 'Extrait littéraire', titre: 'Platero y yo (1914) — « Platero es pequeño, peludo, suave… »', source: 'Juan Ramón Jiménez', al: 'CE' },
        { nature: 'Bande dessinée', titre: 'Mafalda y los mayores', source: 'Quino', al: 'CE' },
        { nature: 'Photographies', titre: 'Fotografías de España en los años 60', source: 'archives', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je raconte un souvenir d’enfance (le mien ou celui d’un grand-parent).' },
    },
  ],

  '3e': [
    {
      id: '3e-1', periode: 1, titre: 'Muros que hablan', axe: 'Langages',
      problematique: '¿Por qué pintar en los muros?',
      culturel: 'découvrir le muralisme mexicain (Diego Rivera) et l’art urbain de Valparaíso',
      points: ['ser_estar', 'preterito'],
      lexique: [['el mural', 'la fresque murale'], ['el pintor', 'le peintre'], ['pintar', 'peindre'], ['denunciar', 'dénoncer'], ['el pueblo', 'le peuple'], ['representar', 'représenter'], ['en primer plano', 'au premier plan'], ['al fondo', 'au fond'], ['el mensaje', 'le message'], ['llamativo', 'frappant']],
      docs: [
        { nature: 'Œuvre d’art (fresque)', titre: 'Sueño de una tarde dominical en la Alameda Central (1947)', source: 'Diego Rivera', al: 'EOC' },
        { nature: 'Biographie', titre: 'Diego Rivera, el pintor del pueblo', source: 'texte informatif', al: 'CE', aChoisir: true },
        { nature: 'Photographies', titre: 'El arte urbano en Valparaíso (Chile)', source: 'street art', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente une fresque murale à la classe comme un guide de musée.' },
    },
    {
      id: '3e-2', periode: 2, titre: 'Clandestino', axe: 'Voyages et migrations',
      problematique: '¿Por qué la gente deja su país?',
      culturel: 'comprendre les migrations d’Amérique centrale vers les États-Unis',
      points: ['preterito', 'imperfecto'],
      lexique: [['emigrar', 'émigrer'], ['la frontera', 'la frontière'], ['el migrante', 'le migrant'], ['cruzar', 'traverser'], ['el sueño', 'le rêve'], ['la esperanza', 'l’espoir'], ['el peligro', 'le danger'], ['los papeles', 'les papiers'], ['huir', 'fuir'], ['sin papeles', 'sans-papiers']],
      docs: [
        { nature: 'Chanson / clip', titre: 'Clandestino (1998)', source: 'Manu Chao', al: 'CO', video: V.clandestino },
        { nature: 'Bande-annonce', titre: 'La jaula de oro (2013)', source: 'Diego Quemada-Díez', al: 'CO', video: V.jaulaDeOro },
        { nature: 'Article', titre: 'La Bestia, el tren de los migrantes', source: 'presse', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'J’écris le journal de bord d’un jeune migrant pendant son voyage.' },
    },
    {
      id: '3e-3', periode: 3, titre: 'Guernica', axe: 'Rencontres avec d’autres cultures',
      problematique: '¿Cómo puede el arte denunciar la guerra?',
      culturel: 'découvrir Guernica (Picasso) et Goya, l’art face à la guerre',
      points: ['perfecto', 'imperfecto'],
      lexique: [['la guerra', 'la guerre'], ['el bombardeo', 'le bombardement'], ['el caballo', 'le cheval'], ['el toro', 'le taureau'], ['gritar', 'crier'], ['sufrir', 'souffrir'], ['el dolor', 'la douleur'], ['la paz', 'la paix'], ['la víctima', 'la victime'], ['el horror', 'l’horreur']],
      docs: [
        { nature: 'Œuvre d’art (peinture)', titre: 'Guernica (1937)', source: 'Pablo Picasso, Museo Reina Sofía', al: 'EOC' },
        { nature: 'Œuvre d’art (peinture)', titre: 'El 3 de mayo de 1808 en Madrid (1814)', source: 'Francisco de Goya, Museo del Prado', al: 'EOC' },
        { nature: 'Texte historique', titre: '26 de abril de 1937 : el bombardeo de Gernika', source: 'texte informatif', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je suis guide au Museo Reina Sofía : je présente Guernica à un groupe de visiteurs.' },
    },
    {
      id: '3e-4', periode: 3, titre: 'Color esperanza', axe: 'École et société',
      problematique: '¿Cómo imaginas tu futuro?',
      culturel: 'découvrir Diego Torres et les projets des jeunes hispanophones',
      points: ['futuro', 'subjuntivo'],
      lexique: [['el futuro', 'l’avenir'], ['el trabajo', 'le travail'], ['la carrera', 'les études'], ['el sueño', 'le rêve'], ['cambiar', 'changer'], ['conseguir', 'obtenir, réussir'], ['ojalá', 'pourvu que'], ['ser feliz', 'être heureux'], ['el mundo', 'le monde'], ['tener ganas de', 'avoir envie de']],
      docs: [
        { nature: 'Chanson / clip', titre: 'Color esperanza (2001)', source: 'Diego Torres', al: 'CO', video: V.colorEsperanza },
        { nature: 'Témoignages', titre: 'Jóvenes hablan de su futuro', source: 'presse jeunesse', al: 'CE', aChoisir: true },
        { nature: 'Offres d’emploi', titre: 'Trabajos de verano en España', source: 'annonces authentiques', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'J’écris une lettre à moi-même dans dix ans.' },
    },
    {
      id: '3e-5', periode: 4, titre: 'Somos Latinoamérica', axe: 'Rencontres avec d’autres cultures',
      problematique: '¿Qué es Latinoamérica?',
      culturel: 'découvrir la diversité et la fierté latino-américaines (Calle 13, Machu Picchu)',
      points: ['comparatifs', 'hay_estar'],
      lexique: [['el continente', 'le continent'], ['la tierra', 'la terre'], ['el pueblo', 'le peuple'], ['orgulloso', 'fier'], ['la selva', 'la forêt tropicale'], ['los Andes', 'les Andes'], ['vender', 'vendre'], ['respirar', 'respirer'], ['la identidad', 'l’identité'], ['el país', 'le pays']],
      docs: [
        { nature: 'Chanson / clip', titre: 'Latinoamérica (2011)', source: 'Calle 13', al: 'CO', video: V.latinoamerica },
        { nature: 'Photographies', titre: 'Machu Picchu', source: 'Pérou', al: 'EOC' },
        { nature: 'Carte', titre: 'Mapa de América Latina : países y capitales', source: 'carte', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente un pays d’Amérique latine à la classe (exposé de 2 minutes).' },
    },
    {
      id: '3e-6', periode: 5, titre: '¡Viajamos a España!', axe: 'Voyages et migrations',
      problematique: '¿Cómo preparar un viaje?',
      culturel: 'découvrir l’Andalousie et l’Alhambra de Grenade',
      points: ['futuro', 'obligacion'],
      lexique: [['el billete', 'le billet'], ['reservar', 'réserver'], ['la habitación', 'la chambre'], ['el aeropuerto', 'l’aéroport'], ['la maleta', 'la valise'], ['el pasaporte', 'le passeport'], ['la visita guiada', 'la visite guidée'], ['el presupuesto', 'le budget'], ['¿Cuánto cuesta?', 'Combien ça coûte ?'], ['quisiera', 'je voudrais']],
      docs: [
        { nature: 'Dépliant touristique', titre: 'Folleto turístico de Andalucía', source: 'office de tourisme', al: 'CE', aChoisir: true },
        { nature: 'Photographies', titre: 'La Alhambra de Granada', source: 'Grenade', al: 'EOC' },
        { nature: 'Enregistrement audio', titre: 'Reservar un hotel', source: 'Audio-Lingua (audio-lingua.eu)', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Je réserve une chambre d’hôtel par téléphone et je demande des informations touristiques.' },
    },
  ],

  '1re': [
    {
      id: '1re-1', periode: 1, titre: '¿Quién soy yo?', axe: 'Axe 1 — Identités et échanges',
      problematique: '¿Cómo se construye la identidad entre dos culturas?',
      culturel: 'réfléchir à l’identité à travers Frida Kahlo, Bomba Estéreo et le spanglish',
      points: ['ser_estar', 'subjuntivo'],
      lexique: [['la identidad', 'l’identité'], ['las raíces', 'les racines'], ['pertenecer', 'appartenir'], ['el orgullo', 'la fierté'], ['sentirse', 'se sentir'], ['bilingüe', 'bilingue'], ['la comunidad', 'la communauté'], ['los antepasados', 'les ancêtres'], ['el mestizaje', 'le métissage'], ['reivindicar', 'revendiquer']],
      docs: [
        { nature: 'Chanson / clip', titre: 'Soy yo (2015)', source: 'Bomba Estéreo', al: 'CO', video: V.soyYo },
        { nature: 'Œuvre d’art (peinture)', titre: 'Las dos Fridas (1939)', source: 'Frida Kahlo', al: 'EOC' },
        { nature: 'Article', titre: 'El spanglish, la lengua de los latinos en EE. UU.', source: 'presse', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je présente un autoportrait identitaire (oral de 2 minutes, sans lire).' },
    },
    {
      id: '1re-2', periode: 2, titre: 'Todos somos diferentes', axe: 'Axe 2 — Diversité et inclusion',
      problematique: '¿Cómo construir una sociedad más inclusiva?',
      culturel: 'réfléchir à l’inclusion à partir du film Campeones et des combats pour l’égalité',
      points: ['subjuntivo', 'obligacion'],
      lexique: [['la inclusión', 'l’inclusion'], ['la discapacidad', 'le handicap'], ['la igualdad', 'l’égalité'], ['la discriminación', 'la discrimination'], ['el prejuicio', 'le préjugé'], ['aceptar', 'accepter'], ['integrar', 'intégrer'], ['respetar', 'respecter'], ['la diversidad', 'la diversité'], ['es necesario que', 'il faut que']],
      docs: [
        { nature: 'Bande-annonce', titre: 'Campeones (2018)', source: 'Javier Fesser', al: 'CO', video: V.campeones },
        { nature: 'Article', titre: 'El movimiento Ni una menos', source: 'presse', al: 'CE', aChoisir: true },
        { nature: 'Affiche de campagne', titre: 'Campaña contra el acoso escolar', source: 'campagne institutionnelle', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Débat : « ¿Cómo hacer nuestro instituto más inclusivo? »' },
    },
    {
      id: '1re-3', periode: 3, titre: 'El arte y el poder', axe: 'Axe 3 — Art et pouvoir',
      problematique: '¿El arte sirve o denuncia el poder?',
      culturel: 'analyser Velázquez et Diego Rivera : le peintre face au pouvoir',
      points: ['preterito', 'imperfecto'],
      lexique: [['el rey', 'le roi'], ['la corte', 'la cour'], ['el retrato', 'le portrait'], ['el poder', 'le pouvoir'], ['la propaganda', 'la propagande'], ['la censura', 'la censure'], ['el mecenas', 'le mécène'], ['glorificar', 'glorifier'], ['denunciar', 'dénoncer'], ['el encargo', 'la commande']],
      docs: [
        { nature: 'Œuvre d’art (peinture)', titre: 'Las Meninas (1656)', source: 'Diego Velázquez, Museo del Prado', al: 'EOC' },
        { nature: 'Œuvre d’art (fresque)', titre: 'El hombre controlador del universo (1934)', source: 'Diego Rivera', al: 'EOC' },
        { nature: 'Article', titre: 'La censura en el arte', source: 'presse', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'Je rédige le texte de l’audioguide d’une œuvre au service ou contre le pouvoir.' },
    },
    {
      id: '1re-4', periode: 3, titre: 'Ciencia con conciencia', axe: 'Axe 4 — Innovations scientifiques et responsabilité',
      problematique: '¿Hasta dónde puede llegar la ciencia?',
      culturel: 'découvrir Margarita Salas et les enjeux de l’intelligence artificielle',
      points: ['futuro', 'condicional'],
      lexique: [['la investigación', 'la recherche'], ['el científico', 'le scientifique'], ['la inteligencia artificial', 'l’intelligence artificielle'], ['descubrir', 'découvrir'], ['inventar', 'inventer'], ['la ética', 'l’éthique'], ['el progreso', 'le progrès'], ['los riesgos', 'les risques'], ['sería', 'ce serait'], ['la herramienta', 'l’outil']],
      docs: [
        { nature: 'Biographie', titre: 'Margarita Salas, científica española', source: 'presse / CSIC', al: 'CE', aChoisir: true },
        { nature: 'Reportage vidéo', titre: 'La inteligencia artificial en la vida diaria', source: 'RTVE', al: 'CO', aChoisir: true },
        { nature: 'Infographie', titre: 'La IA en cifras', source: 'presse', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Table ronde : « La inteligencia artificial, ¿amiga o enemiga? »' },
    },
    {
      id: '1re-5', periode: 4, titre: 'La Tierra nos habla', axe: 'Axe 5 — L’être humain et la nature',
      problematique: '¿Cómo proteger la naturaleza?',
      culturel: 'découvrir les combats écologistes en Amérique latine (Berta Cáceres, Amazonie)',
      points: ['subjuntivo', 'imperativo'],
      lexique: [['el medio ambiente', 'l’environnement'], ['la contaminación', 'la pollution'], ['la deforestación', 'la déforestation'], ['el cambio climático', 'le changement climatique'], ['reciclar', 'recycler'], ['proteger', 'protéger'], ['la sequía', 'la sécheresse'], ['sostenible', 'durable'], ['el activista', 'l’activiste'], ['la Amazonía', 'l’Amazonie']],
      docs: [
        { nature: 'Chanson / clip', titre: 'Latinoamérica (2011) — « Tú no puedes comprar el viento »', source: 'Calle 13', al: 'CO', video: V.latinoamerica },
        { nature: 'Article', titre: 'Berta Cáceres, defensora de los ríos (prix Goldman 2015)', source: 'presse', al: 'CE', aChoisir: true },
        { nature: 'Photographie', titre: 'La deforestación en la Amazonía', source: 'photo de presse', al: 'EOC', aChoisir: true },
      ],
      tache: { al: 'EOC', texte: 'Je prononce un discours d’une minute trente devant la « COP des jeunes ».' },
    },
    {
      id: '1re-6', periode: 5, titre: 'El mundo andino', axe: 'Axe 6 — L’espace andin',
      problematique: '¿Qué une a los pueblos andinos?',
      culturel: 'découvrir l’héritage inca, le quechua et l’Inti Raymi',
      points: ['preterito', 'comparatifs'],
      lexique: [['los Andes', 'les Andes'], ['el quechua', 'le quechua'], ['los incas', 'les Incas'], ['la Pachamama', 'la Terre-Mère'], ['la llama', 'le lama'], ['el altiplano', 'l’altiplano'], ['la herencia', 'l’héritage'], ['las tradiciones', 'les traditions'], ['el imperio', 'l’empire'], ['la cordillera', 'la cordillère']],
      docs: [
        { nature: 'Photographies', titre: 'Machu Picchu', source: 'Pérou', al: 'EOC' },
        { nature: 'Article', titre: 'El Inti Raymi, la fiesta del sol', source: 'presse / office de tourisme du Pérou', al: 'CE', aChoisir: true },
        { nature: 'Musique', titre: 'El cóndor pasa (1913)', source: 'Daniel Alomía Robles', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'Je rédige une page de carnet de voyage dans les Andes.' },
    },
  ],

  Tle: [
    {
      id: 'Tle-1', periode: 1, titre: 'Lo privado y lo público', axe: 'Axe 1 — Espace privé et espace public',
      problematique: '¿Dónde termina lo privado y empieza lo público?',
      culturel: 'analyser Roma d’Alfonso Cuarón et la condition des employées domestiques',
      points: ['subjuntivo', 'imperfecto'],
      lexique: [['el hogar', 'le foyer'], ['la empleada doméstica', 'l’employée de maison'], ['la intimidad', 'l’intimité'], ['la calle', 'la rue'], ['la protesta', 'la manifestation'], ['la desigualdad', 'l’inégalité'], ['mostrar', 'montrer'], ['esconder', 'cacher'], ['la clase social', 'la classe sociale'], ['invisible', 'invisible']],
      docs: [
        { nature: 'Bande-annonce', titre: 'Roma (2018)', source: 'Alfonso Cuarón', al: 'CO', video: V.roma },
        { nature: 'Article', titre: 'Las trabajadoras del hogar en México', source: 'presse', al: 'CE', aChoisir: true },
        { nature: 'Photogramme', titre: 'Roma : Cleo y la familia', source: 'Alfonso Cuarón (2018)', al: 'EOC' },
      ],
      tache: { al: 'EOC', texte: 'Je présente la place de Cleo entre espace privé et espace public (oral type bac).' },
    },
    {
      id: 'Tle-2', periode: 2, titre: 'Memoria y territorio', axe: 'Axe 2 — Territoire et mémoire',
      problematique: '¿Por qué es necesario recordar?',
      culturel: 'comprendre le travail de mémoire en Argentine et en Espagne',
      points: ['preterito', 'subjuntivo'],
      lexique: [['la dictadura', 'la dictature'], ['los desaparecidos', 'les disparus'], ['la memoria', 'la mémoire'], ['el olvido', 'l’oubli'], ['la justicia', 'la justice'], ['reclamar', 'réclamer'], ['buscar', 'chercher'], ['el golpe de Estado', 'le coup d’État'], ['el pañuelo', 'le foulard'], ['la verdad', 'la vérité']],
      docs: [
        { nature: 'Article', titre: 'Las Abuelas de Plaza de Mayo', source: 'presse argentine', al: 'CE', aChoisir: true },
        { nature: 'Photographie', titre: 'Los pañuelos blancos de la Plaza de Mayo', source: 'Buenos Aires', al: 'EOC', aChoisir: true },
        { nature: 'Article', titre: 'La Ley de Memoria Democrática (2022)', source: 'presse espagnole', al: 'CE', aChoisir: true },
      ],
      tache: { al: 'EE', texte: 'J’écris la lettre d’une grand-mère de la Plaza de Mayo à son petit-enfant retrouvé.' },
    },
    {
      id: 'Tle-3', periode: 3, titre: 'Entre ficción y realidad', axe: 'Axe 3 — Fictions et réalités',
      problematique: '¿Puede la ficción contar mejor la realidad?',
      culturel: 'découvrir le réalisme magique et El laberinto del fauno',
      points: ['imperfecto', 'condicional'],
      lexique: [['el realismo mágico', 'le réalisme magique'], ['el cuento', 'le conte'], ['el narrador', 'le narrateur'], ['la guerra civil', 'la guerre civile'], ['inventar', 'inventer'], ['escapar', 's’échapper'], ['el monstruo', 'le monstre'], ['el laberinto', 'le labyrinthe'], ['la posguerra', 'l’après-guerre'], ['refugiarse', 'se réfugier']],
      docs: [
        { nature: 'Bande-annonce', titre: 'El laberinto del fauno (2006)', source: 'Guillermo del Toro', al: 'CO', video: V.laberinto },
        { nature: 'Extrait littéraire', titre: 'Cien años de soledad (1967) — incipit', source: 'Gabriel García Márquez', al: 'CE' },
        { nature: 'Affiche de film', titre: 'El laberinto del fauno', source: 'Guillermo del Toro (2006)', al: 'EOC' },
      ],
      tache: { al: 'EE', texte: 'J’écris une courte nouvelle de réalisme magique (200 mots).' },
    },
    {
      id: 'Tle-4', periode: 4, titre: 'El poder de la comunicación', axe: 'Axe 4 — Enjeux et formes de la communication',
      problematique: '¿Cómo nos convence la publicidad?',
      culturel: 'analyser la campagne du « No » au Chili (1988) et la publicité espagnole',
      points: ['imperativo', 'subjuntivo'],
      lexique: [['el anuncio', 'la publicité'], ['el eslogan', 'le slogan'], ['convencer', 'convaincre'], ['la campaña', 'la campagne'], ['el voto', 'le vote'], ['la alegría', 'la joie'], ['manipular', 'manipuler'], ['el consumidor', 'le consommateur'], ['emocionar', 'émouvoir'], ['el plebiscito', 'le plébiscite']],
      docs: [
        { nature: 'Bande-annonce', titre: 'No (2012)', source: 'Pablo Larraín', al: 'CO', video: V.no },
        { nature: 'Publicité', titre: 'Anuncio de la Lotería de Navidad 2015 — Justino', source: 'Loterías y Apuestas del Estado', al: 'CO', video: V.justino },
        { nature: 'Bande dessinée', titre: 'Mafalda y la publicidad', source: 'Quino', al: 'CE' },
      ],
      tache: { al: 'EOC', texte: 'Je crée et je présente un spot publicitaire pour une cause qui me tient à cœur.' },
    },
    {
      id: 'Tle-5', periode: 4, titre: 'Ciudadanos conectados', axe: 'Axe 5 — Citoyenneté et mondes virtuels',
      problematique: '¿Las redes sociales nos hacen mejores ciudadanos?',
      culturel: 'réfléchir aux réseaux sociaux, au cyberharcèlement et à la désinformation',
      points: ['subjuntivo', 'obligacion'],
      lexique: [['las redes sociales', 'les réseaux sociaux'], ['el ciberacoso', 'le cyberharcèlement'], ['la desinformación', 'la désinformation'], ['las noticias falsas', 'les fausses informations'], ['compartir', 'partager'], ['denunciar', 'signaler, dénoncer'], ['la privacidad', 'la vie privée'], ['el algoritmo', 'l’algorithme'], ['la pantalla', 'l’écran'], ['comprometerse', 's’engager']],
      docs: [
        { nature: 'Article', titre: 'El ciberacoso entre adolescentes en España', source: 'presse', al: 'CE', aChoisir: true },
        { nature: 'Affiche de campagne', titre: 'Campaña contra las noticias falsas', source: 'campagne institutionnelle', al: 'EOC', aChoisir: true },
        { nature: 'Interview vidéo', titre: 'Un creador de contenido habla de su oficio', source: 'RTVE / presse', al: 'CO', aChoisir: true },
      ],
      tache: { al: 'EOI', texte: 'Débat : « ¿Hay que prohibir las redes sociales antes de los 16 años? »' },
    },
    {
      id: 'Tle-6', periode: 5, titre: 'La riqueza del mestizaje', axe: 'Axe 6 — La richesse des métissages dans le monde hispanique',
      problematique: '¿Qué aporta el mestizaje a la identidad hispana?',
      culturel: 'comprendre le métissage et le syncrétisme (Frida Kahlo, la Virgen de Guadalupe)',
      points: ['comparatifs', 'subjuntivo'],
      lexique: [['el mestizaje', 'le métissage'], ['los indígenas', 'les autochtones'], ['la mezcla', 'le mélange'], ['la herencia', 'l’héritage'], ['el sincretismo', 'le syncrétisme'], ['enriquecer', 'enrichir'], ['la conquista', 'la conquête'], ['convivir', 'cohabiter'], ['la lengua', 'la langue'], ['la cultura', 'la culture']],
      docs: [
        { nature: 'Œuvre d’art (peinture)', titre: 'Las dos Fridas (1939)', source: 'Frida Kahlo', al: 'EOC' },
        { nature: 'Article', titre: 'La Virgen de Guadalupe, símbolo del sincretismo', source: 'presse / texte informatif', al: 'CE', aChoisir: true },
        { nature: 'Chanson / clip', titre: 'Latinoamérica (2011)', source: 'Calle 13', al: 'CO', video: V.latinoamerica },
      ],
      tache: { al: 'EOC', texte: 'Je présente un exemple de métissage culturel (oral type bac, 5 minutes).' },
    },
  ],
}

/** Niveau de programmation correspondant à une classe (2nde, 6e : pas encore de programmation). */
export function niveauProg(niveau: string): NiveauProg | null {
  return (['5e', '4e', '3e', '1re', 'Tle'] as string[]).includes(niveau) ? (niveau as NiveauProg) : null
}

// ——— TERMINALES : séquences « dossier » (6-7 documents couvrant toutes les activités langagières).
// Les élèves choisissent un document par groupe, l'étudient, trouvent un axe d'attaque, formulent une
// problématique et restituent sous la forme de leur choix (mini-pièce, podcast, diaporama, exposé).

export const FORMATS_RESTITUTION = ['mini-pièce de théâtre', 'podcast', 'diaporama (PowerPoint)', 'exposé classique']
const TACHE_TLE = 'Par groupe, je rends compte de mon document et de notre problématique sous la forme choisie (mini-pièce de théâtre, podcast, diaporama ou exposé), 5 à 7 minutes, puis je réponds aux questions de la classe.'

const DOSSIERS_TLE: Record<string, DocProg[]> = {
  'Tle-1': [
    { nature: 'Bande-annonce', titre: 'Roma (2018)', source: 'Alfonso Cuarón', al: 'CO', video: V.roma },
    { nature: 'Photogramme', titre: 'Roma : Cleo y la familia', source: 'Alfonso Cuarón (2018)', al: 'EOC' },
    { nature: 'Extrait littéraire (théâtre)', titre: 'La casa de Bernarda Alba (1936) — acte I', source: 'Federico García Lorca', al: 'CE' },
    { nature: 'Article', titre: 'Las trabajadoras del hogar en México', source: 'presse', al: 'CE', aChoisir: true },
    { nature: 'Photographie', titre: 'Marcha « Ni una menos » (Buenos Aires, 2015)', source: 'photo de presse', al: 'EOC', aChoisir: true },
    { nature: 'Documentaire', titre: 'Las Sinsombrero (2015)', source: 'RTVE', al: 'CO', aChoisir: true },
    { nature: 'Infographie', titre: 'El reparto de las tareas domésticas en España', source: 'presse / statistiques', al: 'CE', aChoisir: true },
  ],
  'Tle-2': [
    { nature: 'Article', titre: 'Las Abuelas de Plaza de Mayo', source: 'presse argentine', al: 'CE', aChoisir: true },
    { nature: 'Photographie', titre: 'Los pañuelos blancos de la Plaza de Mayo', source: 'Buenos Aires', al: 'EOC', aChoisir: true },
    { nature: 'Œuvre d’art (peinture)', titre: 'Guernica (1937)', source: 'Pablo Picasso, Museo Reina Sofía', al: 'EOC' },
    { nature: 'Extrait littéraire', titre: 'Soldados de Salamina (2001) — extrait', source: 'Javier Cercas', al: 'CE' },
    { nature: 'Article', titre: 'La Ley de Memoria Democrática (2022)', source: 'presse espagnole', al: 'CE', aChoisir: true },
    { nature: 'Interview vidéo', titre: 'Testimonio de un nieto recuperado', source: 'presse / TV argentine', al: 'CO', aChoisir: true },
    { nature: 'Photographie', titre: 'Exhumación de una fosa común en España', source: 'photo de presse', al: 'EOC', aChoisir: true },
  ],
  'Tle-3': [
    { nature: 'Bande-annonce', titre: 'El laberinto del fauno (2006)', source: 'Guillermo del Toro', al: 'CO', video: V.laberinto },
    { nature: 'Extrait littéraire', titre: 'Cien años de soledad (1967) — incipit', source: 'Gabriel García Márquez', al: 'CE' },
    { nature: 'Extrait littéraire', titre: 'Como agua para chocolate (1989) — chapitre I', source: 'Laura Esquivel', al: 'CE' },
    { nature: 'Extrait littéraire', titre: 'Pedro Páramo (1955) — incipit', source: 'Juan Rulfo', al: 'CE' },
    { nature: 'Microrrelato', titre: 'El dinosaurio (1959)', source: 'Augusto Monterroso', al: 'CE' },
    { nature: 'Œuvre d’art (peinture)', titre: 'Peintures surréalistes', source: 'Remedios Varo', al: 'EOC', aChoisir: true },
    { nature: 'Affiche de film', titre: 'El laberinto del fauno', source: 'Guillermo del Toro (2006)', al: 'EOC' },
  ],
  'Tle-4': [
    { nature: 'Bande-annonce', titre: 'No (2012)', source: 'Pablo Larraín', al: 'CO', video: V.no },
    { nature: 'Publicité', titre: 'Anuncio de la Lotería de Navidad 2015 — Justino', source: 'Loterías y Apuestas del Estado', al: 'CO', video: V.justino },
    { nature: 'Affiche de campagne', titre: '« Chile, la alegría ya viene » — campagne du NO (1988)', source: 'Chili', al: 'EOC', aChoisir: true },
    { nature: 'Bande dessinée', titre: 'Mafalda y la publicidad', source: 'Quino', al: 'CE' },
    { nature: 'Unes de presse', titre: 'Portadas de El País y Clarín sobre un mismo hecho', source: 'presse', al: 'CE', aChoisir: true },
    { nature: 'Podcast', titre: 'Un episodio de Radio Ambulante', source: 'radioambulante.org', al: 'CO', aChoisir: true },
  ],
  'Tle-5': [
    { nature: 'Article', titre: 'El ciberacoso entre adolescentes en España', source: 'presse', al: 'CE', aChoisir: true },
    { nature: 'Affiche de campagne', titre: 'Campaña contra las noticias falsas', source: 'campagne institutionnelle', al: 'EOC', aChoisir: true },
    { nature: 'Interview vidéo', titre: 'Un creador de contenido habla de su oficio', source: 'RTVE / presse', al: 'CO', aChoisir: true },
    { nature: 'Dessin de presse', titre: 'Viñetas sobre la tecnología', source: 'Forges (Antonio Fraguas)', al: 'EOC', aChoisir: true },
    { nature: 'Infographie', titre: 'Los jóvenes españoles y las pantallas', source: 'presse / statistiques', al: 'CE', aChoisir: true },
    { nature: 'Reportage vidéo', titre: 'Un día sin móvil', source: 'RTVE', al: 'CO', aChoisir: true },
  ],
  'Tle-6': [
    { nature: 'Œuvre d’art (peinture)', titre: 'Las dos Fridas (1939)', source: 'Frida Kahlo', al: 'EOC' },
    { nature: 'Chanson / clip', titre: 'Latinoamérica (2011)', source: 'Calle 13', al: 'CO', video: V.latinoamerica },
    { nature: 'Œuvre d’art (fresque)', titre: 'La gran Tenochtitlan (1945)', source: 'Diego Rivera, Palacio Nacional (México)', al: 'EOC' },
    { nature: 'Extrait littéraire', titre: 'Comentarios Reales de los Incas (1609) — proemio', source: 'Inca Garcilaso de la Vega', al: 'CE' },
    { nature: 'Article', titre: 'La Virgen de Guadalupe, símbolo del sincretismo', source: 'presse / texte informatif', al: 'CE', aChoisir: true },
    { nature: 'Œuvre d’art (peinture)', titre: 'Pinturas de castas (siglo XVIII)', source: 'Nouvelle-Espagne', al: 'EOC', aChoisir: true },
  ],
}

for (const s of PROGRAMMATIONS.Tle) {
  s.dossier = DOSSIERS_TLE[s.id]
  s.tache = { al: 'EOC', texte: TACHE_TLE }
}
