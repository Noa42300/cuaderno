// Ressources pour la prof d'espagnol (sites connus et pérennes ; liens vers les pages d'accueil).

export interface Ressource { nom: string; url: string; desc: string }
export interface Categorie { titre: string; icone: string; items: Ressource[] }

export const RESSOURCES: Categorie[] = [
  {
    titre: 'Textes officiels & pédagogie', icone: '📜',
    items: [
      { nom: 'Bulletin officiel', url: 'https://www.education.gouv.fr/bulletin-officiel', desc: 'Programmes (BO n° 22 du 29 mai 2025), notes de service.' },
      { nom: 'Éduscol', url: 'https://eduscol.education.fr/', desc: 'Ressources d’accompagnement des programmes de langues vivantes.' },
      { nom: 'La Clé des langues — espagnol', url: 'https://cle.ens-lyon.fr/espagnol', desc: 'ENS de Lyon : dossiers culturels, programmes, ressources pour le lycée.' },
      { nom: 'eTwinning', url: 'https://www.etwinning.net/', desc: 'Projets d’échanges avec des classes espagnoles et latino-américaines.' },
    ],
  },
  {
    titre: 'Documents audio & vidéo', icone: '🎧',
    items: [
      { nom: 'Audio-Lingua', url: 'https://audio-lingua.ac-versailles.fr/', desc: 'Enregistrements courts de locuteurs natifs, classés par niveau CECRL.' },
      { nom: 'Videoele', url: 'https://www.videoele.com/', desc: 'Vidéos didactiques A1 → B1 avec activités.' },
      { nom: 'RTVE Play', url: 'https://www.rtve.es/play/', desc: 'Télévision publique espagnole : reportages, séries, journaux.' },
      { nom: 'Radio Ambulante', url: 'https://radioambulante.org/', desc: 'Podcast narratif latino-américain (B1-B2), avec transcriptions.' },
      { nom: 'LyricsTraining', url: 'https://lyricstraining.com/es', desc: 'Chansons à trous pour travailler la compréhension de l’oral.' },
    ],
  },
  {
    titre: 'Presse', icone: '📰',
    items: [
      { nom: 'BBC Mundo', url: 'https://www.bbc.com/mundo', desc: 'Actualité internationale en espagnol, articles accessibles.' },
      { nom: 'El País', url: 'https://elpais.com/', desc: 'Quotidien espagnol de référence.' },
      { nom: 'Practica español', url: 'https://www.practicaespanol.com/', desc: 'Agence EFE : actualité adaptée aux apprenants, par niveau.' },
    ],
  },
  {
    titre: 'Art & culture', icone: '🎨',
    items: [
      { nom: 'Museo del Prado', url: 'https://www.museodelprado.es/', desc: 'Velázquez, Goya… œuvres en très haute définition.' },
      { nom: 'Museo Reina Sofía', url: 'https://www.museoreinasofia.es/', desc: 'Guernica et l’art moderne espagnol.' },
      { nom: 'Google Arts & Culture', url: 'https://artsandculture.google.com/', desc: 'Visites virtuelles de musées et d’œuvres hispaniques.' },
      { nom: 'Centro Virtual Cervantes', url: 'https://cvc.cervantes.es/', desc: 'Instituto Cervantes : littérature, culture, ressources pour la classe.' },
    ],
  },
  {
    titre: 'Langue : dictionnaires & conjugaison', icone: '📚',
    items: [
      { nom: 'Diccionario de la lengua española (RAE)', url: 'https://dle.rae.es/', desc: 'Le dictionnaire de référence.' },
      { nom: 'WordReference', url: 'https://www.wordreference.com/es/', desc: 'Dictionnaire bilingue et forums.' },
      { nom: 'Linguee', url: 'https://www.linguee.fr/francais-espagnol/', desc: 'Traductions en contexte.' },
      { nom: 'Reverso — conjugaison espagnole', url: 'https://conjugador.reverso.net/conjugacion-espanol.html', desc: 'Tous les temps, tous les verbes.' },
    ],
  },
  {
    titre: 'Didactique ELE & activités', icone: '🧩',
    items: [
      { nom: 'ProfeDeELE', url: 'https://www.profedeele.es/', desc: 'Fiches d’activités prêtes à l’emploi, par niveau.' },
      { nom: 'TodoELE', url: 'https://www.todoele.net/', desc: 'Banque de ressources et d’actualités pour professeurs d’espagnol.' },
      { nom: 'Wordwall', url: 'https://wordwall.net/fr', desc: 'Jeux interactifs à projeter (vocabulaire, grammaire).' },
      { nom: 'LearningApps', url: 'https://learningapps.org/', desc: 'Exercices interactifs gratuits.' },
      { nom: 'Lumni', url: 'https://www.lumni.fr/', desc: 'Vidéos éducatives (France TV), dont l’espagnol.' },
    ],
  },
]
