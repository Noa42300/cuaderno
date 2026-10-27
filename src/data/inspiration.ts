// Données de l'assistant « Inspiración » :
// — NOTIONS : notions-clés de chaque axe / thématique, pour relier un axe terminé au suivant ;
// — BANQUE : séquences alternatives (en plus de la programmation), avec documents authentiques réels.
// Les documents marqués `aChoisir` sont à sélectionner par la prof (article récent, photo…).

import type { NiveauProg, SeqProg } from './programmations'

/** Notions par axe (clé = début du libellé de l'axe, sans accents ni majuscules). */
export const NOTIONS: [string, string[]][] = [
  // Terminale
  ['espace prive et espace public', ['intimité', 'famille', 'société', 'inégalités', 'femmes', 'ville', 'engagement']],
  ['territoire et memoire', ['mémoire', 'histoire', 'dictature', 'identité', 'territoire', 'transmission', 'justice']],
  ['fictions et realites', ['fiction', 'imaginaire', 'histoire', 'mémoire', 'littérature', 'cinéma', 'guerre']],
  ['enjeux et formes de la communication', ['médias', 'publicité', 'propagande', 'engagement', 'image', 'démocratie']],
  ['citoyennete et mondes virtuels', ['réseaux', 'citoyenneté', 'engagement', 'démocratie', 'image', 'jeunesse']],
  ['la richesse des metissages', ['identité', 'métissage', 'histoire', 'territoire', 'langues', 'art']],
  // Première
  ['identites et echanges', ['identité', 'migrations', 'langues', 'échanges', 'métissage', 'jeunesse']],
  ['diversite et inclusion', ['inclusion', 'égalité', 'handicap', 'femmes', 'discriminations', 'identité']],
  ['art et pouvoir', ['art', 'pouvoir', 'propagande', 'histoire', 'dictature', 'image']],
  ['innovations scientifiques et responsabilite', ['science', 'progrès', 'éthique', 'technologie', 'nature', 'femmes']],
  ['l’etre humain et la nature', ['nature', 'écologie', 'territoire', 'engagement', 'peuples autochtones']],
  ['l’espace andin', ['territoire', 'peuples autochtones', 'histoire', 'identité', 'nature', 'langues']],
  // Cinquième
  ['portrait, autoportrait', ['identité', 'art', 'famille', 'corps']],
  ['le quotidien', ['vie quotidienne', 'famille', 'ville', 'saisons']],
  ['ecole et loisirs', ['école', 'loisirs', 'jeunesse', 'sport']],
  ['le reel et l’imaginaire', ['imaginaire', 'légendes', 'art', 'fiction']],
  ['des langues, des lieux, des histoires', ['langues', 'voyages', 'histoire', 'territoire']],
  ['le mexique', ['traditions', 'art', 'histoire', 'territoire', 'identité']],
  // Cycle 4 (4e – 3e)
  ['langages', ['art', 'langues', 'image', 'expression']],
  ['ecole et societe', ['école', 'jeunesse', 'sport', 'avenir', 'société']],
  ['voyages et migrations', ['voyages', 'migrations', 'ville', 'territoire']],
  ['rencontres avec d’autres cultures', ['traditions', 'art', 'identité', 'histoire', 'famille']],
]

export const BANQUE: (SeqProg & { niveaux: NiveauProg[] })[] = [
  // ——— Terminale
  {
    niveaux: ['Tle'], id: 'b-tle-1', periode: 0, titre: 'La casa y la calle', axe: 'Axe 1 — Espace privé et espace public',
    problematique: '¿Qué lugar ocupan las mujeres entre la casa y la calle?',
    culturel: 'étudier l’enfermement domestique chez Lorca et la conquête de l’espace public par les femmes',
    points: ['imperfecto', 'subjuntivo'],
    lexique: [['el encierro', 'l’enfermement'], ['la honra', 'l’honneur'], ['el luto', 'le deuil'], ['la libertad', 'la liberté'], ['la manifestación', 'la manifestation'], ['reivindicar', 'revendiquer'], ['la igualdad', 'l’égalité'], ['romper el silencio', 'briser le silence'], ['el qué dirán', 'le qu’en-dira-t-on'], ['salir a la calle', 'descendre dans la rue']],
    docs: [
      { nature: 'Extrait littéraire (théâtre)', titre: 'La casa de Bernarda Alba (1936) — acte I', source: 'Federico García Lorca', al: 'CE' },
      { nature: 'Documentaire', titre: 'Las Sinsombrero (2015)', source: 'RTVE', al: 'CO', aChoisir: true },
      { nature: 'Photographie', titre: 'Marcha « Ni una menos » (Buenos Aires, 2015)', source: 'photo de presse', al: 'EOC', aChoisir: true },
    ],
    tache: { al: 'EOC', texte: 'Je présente comment une femme de mon choix a « pris la parole » dans l’espace public (oral type bac).' },
  },
  {
    niveaux: ['Tle'], id: 'b-tle-3', periode: 0, titre: 'Lo maravilloso en lo cotidiano', axe: 'Axe 3 — Fictions et réalités',
    problematique: '¿Por qué el realismo mágico mezcla lo real y lo imaginario?',
    culturel: 'découvrir le réalisme magique (Laura Esquivel, Juan Rulfo) et le surréalisme de Remedios Varo',
    points: ['preterito', 'condicional'],
    lexique: [['el fantasma', 'le fantôme'], ['la receta', 'la recette'], ['el hechizo', 'le sortilège'], ['lo sobrenatural', 'le surnaturel'], ['el pueblo', 'le village'], ['soñar', 'rêver'], ['la muerte', 'la mort'], ['la emoción', 'l’émotion'], ['de repente', 'soudain'], ['como si', 'comme si']],
    docs: [
      { nature: 'Extrait littéraire', titre: 'Como agua para chocolate (1989) — chapitre I', source: 'Laura Esquivel', al: 'CE' },
      { nature: 'Extrait littéraire', titre: 'Pedro Páramo (1955) — incipit', source: 'Juan Rulfo', al: 'CE' },
      { nature: 'Œuvre d’art (peinture)', titre: 'Peintures surréalistes', source: 'Remedios Varo', al: 'EOC', aChoisir: true },
    ],
    tache: { al: 'EE', texte: 'J’écris une recette « magique » à la manière de Laura Esquivel (200 mots).' },
  },
  {
    niveaux: ['Tle'], id: 'b-tle-4', periode: 0, titre: '¿Quién cuenta la verdad?', axe: 'Axe 4 — Enjeux et formes de la communication',
    problematique: '¿Cómo informarse en la era de la sobreinformación?',
    culturel: 'comparer des unes de presse et découvrir le journalisme narratif latino-américain',
    points: ['subjuntivo', 'obligacion'],
    lexique: [['la portada', 'la une'], ['el titular', 'le gros titre'], ['la fuente', 'la source'], ['contrastar', 'vérifier, recouper'], ['el bulo', 'la rumeur, l’intox'], ['el periodista', 'le journaliste'], ['la libertad de prensa', 'la liberté de la presse'], ['objetivo', 'objectif'], ['manipular', 'manipuler'], ['es imprescindible que', 'il est indispensable que']],
    docs: [
      { nature: 'Unes de presse', titre: 'Portadas de El País y Clarín sobre un mismo hecho', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Podcast', titre: 'Un episodio de Radio Ambulante', source: 'radioambulante.org', al: 'CO', aChoisir: true },
      { nature: 'Bande dessinée', titre: 'Mafalda lee el periódico', source: 'Quino', al: 'CE' },
    ],
    tache: { al: 'EOC', texte: 'Avec mon groupe, je présente un journal télévisé de 3 minutes en distinguant faits et opinions.' },
  },
  {
    niveaux: ['Tle'], id: 'b-tle-5', periode: 0, titre: 'Generación pantalla', axe: 'Axe 5 — Citoyenneté et mondes virtuels',
    problematique: '¿Somos libres frente a las pantallas?',
    culturel: 'réfléchir à la dépendance aux écrans à partir de dessins de presse espagnols',
    points: ['subjuntivo', 'condicional'],
    lexique: [['la pantalla', 'l’écran'], ['el móvil', 'le portable'], ['la adicción', 'l’addiction'], ['desconectarse', 'se déconnecter'], ['el algoritmo', 'l’algorithme'], ['la huella digital', 'l’empreinte numérique'], ['el ciberacoso', 'le cyberharcèlement'], ['la privacidad', 'la vie privée'], ['compartir', 'partager'], ['deberíamos', 'nous devrions']],
    docs: [
      { nature: 'Dessin de presse', titre: 'Viñetas sobre la tecnología', source: 'Forges (Antonio Fraguas)', al: 'EOC', aChoisir: true },
      { nature: 'Infographie', titre: 'Los jóvenes españoles y las pantallas', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Reportage vidéo', titre: 'Un día sin móvil', source: 'RTVE', al: 'CO', aChoisir: true },
    ],
    tache: { al: 'EOI', texte: 'Débat : « ¿Deberíamos desconectarnos un día por semana? »' },
  },
  {
    niveaux: ['Tle'], id: 'b-tle-6', periode: 0, titre: 'Mestizaje en los muros', axe: 'Axe 6 — La richesse des métissages dans le monde hispanique',
    problematique: '¿Cómo cuenta el muralismo el encuentro de culturas?',
    culturel: 'lire l’histoire du Mexique métis dans les fresques de Diego Rivera',
    points: ['preterito', 'comparatifs'],
    lexique: [['el mural', 'la fresque'], ['los aztecas', 'les Aztèques'], ['la conquista', 'la conquête'], ['el mercado', 'le marché'], ['la mezcla', 'le mélange'], ['el mestizo', 'le métis'], ['la herencia', 'l’héritage'], ['representar', 'représenter'], ['el pueblo', 'le peuple'], ['la identidad', 'l’identité']],
    docs: [
      { nature: 'Œuvre d’art (fresque)', titre: 'La gran Tenochtitlan (1945)', source: 'Diego Rivera, Palacio Nacional (México)', al: 'EOC' },
      { nature: 'Texte informatif', titre: 'El muralismo mexicano', source: 'texte informatif', al: 'CE', aChoisir: true },
      { nature: 'Chanson / clip', titre: 'Latinoamérica (2011)', source: 'Calle 13', al: 'CO', video: 'https://www.youtube.com/watch?v=DkFJE8ZdeG8' },
    ],
    tache: { al: 'EOC', texte: 'Je présente une fresque comme le guide du Palacio Nacional, en montrant les traces du métissage.' },
  },
  // ——— Première
  {
    niveaux: ['1re'], id: 'b-1re-1', periode: 0, titre: 'Entre aquí y allá', axe: 'Axe 1 — Identités et échanges',
    problematique: '¿Qué se gana y qué se pierde al emigrar?',
    culturel: 'comprendre l’émigration latino-américaine vers les États-Unis',
    points: ['preterito', 'subjuntivo'],
    lexique: [['emigrar', 'émigrer'], ['la frontera', 'la frontière'], ['el sueño americano', 'le rêve américain'], ['echar de menos', 'regretter, manquer'], ['las raíces', 'les racines'], ['adaptarse', 's’adapter'], ['los papeles', 'les papiers'], ['la nostalgia', 'la nostalgie'], ['integrarse', 's’intégrer'], ['dejar atrás', 'laisser derrière soi']],
    docs: [
      { nature: 'Chanson / clip', titre: 'Clandestino (1998)', source: 'Manu Chao', al: 'CO', video: 'https://www.youtube.com/watch?v=rSEUH4KRfN8' },
      { nature: 'Bande-annonce', titre: 'La jaula de oro (2013)', source: 'Diego Quemada-Díez', al: 'CO', video: 'https://www.youtube.com/watch?v=dpoqS4uUb8o' },
      { nature: 'Témoignage', titre: 'Testimonio de un « dreamer »', source: 'presse', al: 'CE', aChoisir: true },
    ],
    tache: { al: 'EE', texte: 'J’écris la lettre d’un jeune migrant à sa famille restée au pays.' },
  },
  {
    niveaux: ['1re'], id: 'b-1re-2', periode: 0, titre: 'Mujeres que rompen moldes', axe: 'Axe 2 — Diversité et inclusion',
    problematique: '¿Cómo han luchado las mujeres por la igualdad?',
    culturel: 'découvrir des créatrices oubliées (les Sinsombrero) et Frida Kahlo',
    points: ['imperfecto', 'subjuntivo'],
    lexique: [['la igualdad', 'l’égalité'], ['el machismo', 'le machisme'], ['luchar', 'lutter'], ['olvidar', 'oublier'], ['la pintora', 'la peintre'], ['romper moldes', 'casser les codes'], ['el derecho', 'le droit'], ['visibilizar', 'rendre visible'], ['la brecha', 'l’écart'], ['ojalá', 'pourvu que']],
    docs: [
      { nature: 'Documentaire', titre: 'Las Sinsombrero (2015)', source: 'RTVE', al: 'CO', aChoisir: true },
      { nature: 'Œuvre d’art (peinture)', titre: 'Autorretrato con pelo cortado (1940)', source: 'Frida Kahlo', al: 'EOC' },
      { nature: 'Article', titre: 'La brecha salarial en España', source: 'presse', al: 'CE', aChoisir: true },
    ],
    tache: { al: 'EOC', texte: 'Je présente une femme hispanique qui a « cassé les codes » (oral de 3 minutes).' },
  },
  {
    niveaux: ['1re'], id: 'b-1re-3', periode: 0, titre: 'Goya frente al poder', axe: 'Axe 3 — Art et pouvoir',
    problematique: '¿Puede un pintor de la corte criticar al poder?',
    culturel: 'analyser l’œuvre de Goya, peintre du roi et témoin critique de son temps',
    points: ['preterito', 'imperfecto'],
    lexique: [['el pintor de cámara', 'le peintre de la cour'], ['la familia real', 'la famille royale'], ['el retrato', 'le portrait'], ['burlarse de', 'se moquer de'], ['la guerra', 'la guerre'], ['fusilar', 'fusiller'], ['el grabado', 'la gravure'], ['la razón', 'la raison'], ['los monstruos', 'les monstres'], ['denunciar', 'dénoncer']],
    docs: [
      { nature: 'Œuvre d’art (peinture)', titre: 'La familia de Carlos IV (1800)', source: 'Francisco de Goya, Museo del Prado', al: 'EOC' },
      { nature: 'Œuvre d’art (peinture)', titre: 'El 3 de mayo de 1808 en Madrid (1814)', source: 'Francisco de Goya, Museo del Prado', al: 'EOC' },
      { nature: 'Œuvre d’art (gravure)', titre: 'El sueño de la razón produce monstruos (1799)', source: 'Francisco de Goya, Los Caprichos', al: 'EOC' },
    ],
    tache: { al: 'EE', texte: 'Je rédige la notice du musée pour une œuvre de Goya en montrant son regard sur le pouvoir.' },
  },
  {
    niveaux: ['1re'], id: 'b-1re-4', periode: 0, titre: 'Medellín, la ciudad que se reinventó', axe: 'Axe 4 — Innovations scientifiques et responsabilité',
    problematique: '¿Puede la innovación cambiar una ciudad?',
    culturel: 'découvrir la transformation de Medellín (Metrocable, bibliothèques-parcs)',
    points: ['perfecto', 'futuro'],
    lexique: [['el teleférico', 'le téléphérique'], ['el barrio', 'le quartier'], ['la violencia', 'la violence'], ['transformar', 'transformer'], ['la biblioteca', 'la bibliothèque'], ['el transporte', 'le transport'], ['la innovación', 'l’innovation'], ['mejorar', 'améliorer'], ['los habitantes', 'les habitants'], ['ha cambiado', 'a changé']],
    docs: [
      { nature: 'Photographies', titre: 'El Metrocable de Medellín', source: 'Colombie', al: 'EOC', aChoisir: true },
      { nature: 'Article', titre: 'Los parques biblioteca de Medellín', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Reportage vidéo', titre: 'Medellín, de ciudad violenta a ciudad innovadora', source: 'reportage TV', al: 'CO', aChoisir: true },
    ],
    tache: { al: 'EOC', texte: 'Je présente un projet innovant pour ma ville, inspiré de Medellín.' },
  },
  {
    niveaux: ['1re'], id: 'b-1re-5', periode: 0, titre: 'El agua es vida', axe: 'Axe 5 — L’être humain et la nature',
    problematique: '¿El agua es un bien común o una mercancía?',
    culturel: 'comprendre la « guerre de l’eau » de Cochabamba (Bolivie, 2000) et le film También la lluvia',
    points: ['subjuntivo', 'imperativo'],
    lexique: [['el agua potable', 'l’eau potable'], ['la sequía', 'la sécheresse'], ['privatizar', 'privatiser'], ['la protesta', 'la protestation'], ['el bien común', 'le bien commun'], ['la empresa', 'l’entreprise'], ['los recursos', 'les ressources'], ['derrochar', 'gaspiller'], ['ahorrar', 'économiser'], ['es urgente que', 'il est urgent que']],
    docs: [
      { nature: 'Film (extraits)', titre: 'También la lluvia (2010)', source: 'Icíar Bollaín', al: 'CO', aChoisir: true },
      { nature: 'Article', titre: 'La guerra del agua de Cochabamba (2000)', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Photographie', titre: 'El lago Titicaca', source: 'Pérou / Bolivie', al: 'EOC', aChoisir: true },
    ],
    tache: { al: 'EOI', texte: 'Jeu de rôle : réunion entre habitants, maire et entreprise sur la gestion de l’eau.' },
  },
  {
    niveaux: ['1re'], id: 'b-1re-6', periode: 0, titre: 'El quechua, una lengua viva', axe: 'Axe 6 — L’espace andin',
    problematique: '¿Cómo sobreviven las lenguas y culturas andinas?',
    culturel: 'découvrir le quechua, ses mots passés en espagnol et les paysages andins',
    points: ['presente_irr', 'comparatifs'],
    lexique: [['la lengua originaria', 'la langue autochtone'], ['hablar quechua', 'parler quechua'], ['la cordillera', 'la cordillère'], ['el salar', 'le désert de sel'], ['la llama', 'le lama'], ['la papa', 'la pomme de terre'], ['transmitir', 'transmettre'], ['desaparecer', 'disparaître'], ['la comunidad', 'la communauté'], ['el orgullo', 'la fierté']],
    docs: [
      { nature: 'Article', titre: 'El quechua hoy', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Musique', titre: 'El cóndor pasa (1913)', source: 'Daniel Alomía Robles', al: 'CO', aChoisir: true },
      { nature: 'Photographies', titre: 'El salar de Uyuni', source: 'Bolivie', al: 'EOC', aChoisir: true },
    ],
    tache: { al: 'EE', texte: 'J’écris un article pour défendre une langue en danger.' },
  },
  // ——— Collège
  {
    niveaux: ['3e'], id: 'b-3e-1', periode: 0, titre: 'El Camino de Santiago', axe: 'Voyages et migrations',
    problematique: '¿Por qué miles de personas caminan hasta Santiago?',
    culturel: 'découvrir le Chemin de Saint-Jacques, ses étapes et ses pèlerins',
    points: ['futuro', 'preterito'],
    lexique: [['el peregrino', 'le pèlerin'], ['la etapa', 'l’étape'], ['el albergue', 'le gîte'], ['la mochila', 'le sac à dos'], ['caminar', 'marcher'], ['la concha', 'la coquille'], ['la catedral', 'la cathédrale'], ['cansado', 'fatigué'], ['llegar', 'arriver'], ['el camino', 'le chemin']],
    docs: [
      { nature: 'Carte', titre: 'El Camino francés', source: 'carte des étapes', al: 'CE', aChoisir: true },
      { nature: 'Photographies', titre: 'La catedral de Santiago de Compostela', source: 'Galice', al: 'EOC' },
      { nature: 'Témoignage', titre: 'Diario de un peregrino', source: 'blog / presse', al: 'CE', aChoisir: true },
    ],
    tache: { al: 'EE', texte: 'J’écris le carnet de route d’un pèlerin sur trois étapes.' },
  },
  {
    niveaux: ['3e', '4e'], id: 'b-3e-2', periode: 0, titre: '¡Fallas y fiestas!', axe: 'Rencontres avec d’autres cultures',
    problematique: '¿Qué nos enseñan las fiestas de España?',
    culturel: 'découvrir les Fallas de Valence et San Fermín',
    points: ['presente_irr', 'hay_estar'],
    lexique: [['la falla', 'la falla (sculpture)'], ['quemar', 'brûler'], ['los fuegos artificiales', 'le feu d’artifice'], ['el ninot', 'la figurine'], ['el encierro', 'le lâcher de taureaux'], ['la fiesta', 'la fête'], ['el desfile', 'le défilé'], ['disfrazarse', 'se déguiser'], ['la tradición', 'la tradition'], ['divertirse', 's’amuser']],
    docs: [
      { nature: 'Photographies', titre: 'Las Fallas de Valencia', source: 'Valence, mars', al: 'EOC', aChoisir: true },
      { nature: 'Reportage vidéo', titre: 'La Cremà', source: 'reportage TV', al: 'CO', aChoisir: true },
      { nature: 'Affiche', titre: 'Cartel de San Fermín', source: 'Pampelune', al: 'EOC', aChoisir: true },
    ],
    tache: { al: 'EOC', texte: 'Je présente une fête hispanique comme un reporter en direct.' },
  },
  {
    niveaux: ['3e'], id: 'b-3e-3', periode: 0, titre: 'Pantallas y adolescentes', axe: 'École et société',
    problematique: '¿Las pantallas nos acercan o nos alejan?',
    culturel: 'réfléchir aux usages numériques des adolescents espagnols',
    points: ['obligacion', 'subjuntivo'],
    lexique: [['el móvil', 'le portable'], ['las redes sociales', 'les réseaux sociaux'], ['conectarse', 'se connecter'], ['el videojuego', 'le jeu vidéo'], ['pasar tiempo', 'passer du temps'], ['la pantalla', 'l’écran'], ['aburrirse', 's’ennuyer'], ['hay que', 'il faut'], ['peligroso', 'dangereux'], ['útil', 'utile']],
    docs: [
      { nature: 'Infographie', titre: 'Los adolescentes y el móvil', source: 'presse', al: 'CE', aChoisir: true },
      { nature: 'Bande dessinée', titre: 'Viñetas sobre las pantallas', source: 'dessin de presse', al: 'EOC', aChoisir: true },
      { nature: 'Enregistrement audio', titre: 'Jóvenes hablan de su móvil', source: 'Audio-Lingua', al: 'CO', aChoisir: true },
    ],
    tache: { al: 'EOI', texte: 'Débat en groupe : « ¿Hay que prohibir el móvil en el colegio? »' },
  },
  {
    niveaux: ['5e'], id: 'b-5e-1', periode: 0, titre: 'Animales fantásticos', axe: 'Axe 4 — Le réel et l’imaginaire',
    problematique: '¿Qué animales imaginan los artistas hispanos?',
    culturel: 'découvrir les animaux imaginaires de l’art hispanique (alebrijes, Dalí)',
    points: ['ser_estar', 'genero_numero'],
    lexique: [['el animal', 'l’animal'], ['las alas', 'les ailes'], ['los cuernos', 'les cornes'], ['largo', 'long'], ['corto', 'court'], ['enorme', 'énorme'], ['volar', 'voler'], ['nadar', 'nager'], ['tiene', 'il a'], ['es de colores', 'il est multicolore']],
    docs: [
      { nature: 'Artisanat (photographies)', titre: 'Alebrijes de Oaxaca', source: 'Mexique', al: 'EOC', aChoisir: true },
      { nature: 'Œuvre d’art (peinture)', titre: 'Los elefantes (1948)', source: 'Salvador Dalí', al: 'EOC' },
      { nature: 'Devinettes', titre: 'Adivinanzas de animales', source: 'tradition orale', al: 'CO', aChoisir: true },
    ],
    tache: { al: 'EOC', texte: 'Je présente mon animal fantastique à la classe.' },
  },
]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^axe \d+ — /, '')

export function notionsDe(axe: string): string[] {
  const a = norm(axe)
  return NOTIONS.find(([k]) => a.startsWith(norm(k)))?.[1] ?? []
}
