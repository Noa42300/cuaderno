// 5e D — séances validées par la prof le 9/11/2026 (après l'évaluation de CO sur le matériel scolaire).
// Jeudi 12 : évaluation EOI « nos conocemos » · Vendredi 13 : bilan & remédiation ·
// Lundi 16 : « ¿Cómo es Frida? » · Jeudi 19 : « ¿Quién es? » (interaction + autoportrait).
// Ensuite, la progression reprend la séquence « ¡Hola! Así soy yo » (point de langue genre/nombre,
// Soy yo, préparation et tâche finale : vidéo pour un correspondant mexicain).

import type { ISODate } from '../db/types'

export interface SeanceEcrite {
  date: ISODate
  statut?: 'prevue' | 'faite'
  titre: string
  activites: ('CO' | 'CE' | 'EOC' | 'EOI' | 'EE')[]
  etapes: { titre: string; duree: number; al: ('CO' | 'CE' | 'EOC' | 'EOI' | 'EE')[]; modalite: string; role: string; contenu: string[] }[]
  objectifs: { culturel: string; lexical: string; grammatical: string; phonologique: string; pragmatique: string }
  support: { titre: string; nature: string; source: string }
  materiel: string[]
  tache: string
  traceEcrite: string
  exercices: { consigne: string; exemple: string; items: string[]; corrige: string[] }[]
  diapos: { titre: string; texte: string; aReveler: string[] }[]
  fragiles: string
  aLaise: string
  obstacles: string[]
  correction: string
}

export const PROGRESSION_REF_5E = [
  'Séquence « ¡Hola! Así soy yo » — Axe 1 Portrait, autoportrait (associé à l’axe 6 Le Mexique, via Frida Kahlo)',
  'Problématique : ¿Cómo me presento a los demás?',
  'Déjà fait : évaluation de CO sur le matériel scolaire (lundi 9 novembre).',
  'Tâche finale (avant Noël) : je me présente dans une courte vidéo pour un correspondant mexicain (nom, âge, physique, caractère, goûts).',
].join('\n')

export const SEANCES_5E_D: SeanceEcrite[] = [
  {
    date: '2026-11-09', statut: 'faite',
    titre: '¡Hola! Así soy yo — Évaluation CO : el material escolar',
    activites: ['CO'],
    etapes: [
      { titre: 'Consignes', duree: 5, al: ['CO'], modalite: 'Classe entière', role: 'je présente l’épreuve',
        contenu: ['— « Hoy, evaluación de comprensión oral: el material escolar. Escuchad bien: tres escuchas. »'] },
      { titre: 'Épreuve de compréhension orale', duree: 45, al: ['CO'], modalite: 'Individuel', role: 'je gère les trois écoutes, avec une pause entre chacune',
        contenu: ['Trois écoutes de l’enregistrement ; les élèves cochent / complètent leur fiche.'] },
      { titre: 'Ramassage', duree: 10, al: ['CO'], modalite: 'Individuel', role: 'je ramasse les copies',
        contenu: ['— « Dejad los bolígrafos, por favor. »'] },
    ],
    objectifs: { culturel: '', lexical: 'El material escolar.', grammatical: 'Hay / tengo ; un, una, unos, unas.', phonologique: '', pragmatique: 'Comprendre une description simple du contenu d’un cartable.' },
    support: { titre: 'Enregistrement : el material escolar', nature: 'Évaluation de CO', source: 'support de la prof' },
    materiel: ['Enregistrement + enceinte', 'Fiche d’évaluation (1 par élève)'],
    tache: 'Évaluation individuelle de compréhension orale sur le matériel scolaire.',
    traceEcrite: '',
    exercices: [],
    diapos: [],
    fragiles: '', aLaise: '', obstacles: [], correction: 'Correction collective le vendredi 13 novembre.',
  },
  {
    date: '2026-11-12',
    titre: '¡Hola! Así soy yo — Évaluation EOI : dialogue « Nos conocemos »',
    activites: ['EOI'],
    etapes: [
      { titre: 'Échauffement', duree: 5, al: ['EOI'], modalite: 'Classe entière', role: 'je relance la chaîne de questions le plus vite possible',
        contenu: ['J’accueille les élèves à la porte en espagnol.', '— « ¡Buenos días! Sentaos, por favor. »', 'Chaîne de questions rapide : chacun répond puis interroge son voisin.', '— « ¿Cómo te llamas? ¿Cuántos años tienes? ¿Dónde vives? »'] },
      { titre: 'Préparation en binômes', duree: 10, al: ['EOI'], modalite: 'Binômes', role: 'je circule ; mots-clés seulement, pas de phrases rédigées',
        contenu: ['Je rappelle la consigne et la grille d’évaluation.', '— « Vais a hablar en parejas para conoceros: saludar, presentarse, hacer preguntas y despedirse. »', '— « Solo palabras clave en el papel, ¡nada de frases completas! »'] },
      { titre: 'Passages évalués', duree: 40, al: ['EOI'], modalite: 'Binômes, passages successifs', role: 'j’évalue avec la grille ; je ne corrige pas pendant le dialogue ; je note les erreurs fréquentes pour vendredi',
        contenu: ['Chaque binôme dialogue 1 min 30 à 2 min devant moi.', '— « Adelante, os escuchamos. »', 'Pendant les passages, les autres élèves notent une question qu’ils ont entendue.'] },
      { titre: 'Bilan à chaud', duree: 5, al: ['EOC'], modalite: 'Classe entière', role: 'je recueille les ressentis',
        contenu: ['— « ¿Qué ha sido lo más fácil? ¿Y lo más difícil? »', '— « ¡Muy bien, chicos! El viernes corregimos juntos. »'] },
    ],
    objectifs: {
      culturel: 'Les salutations et la présentation dans le monde hispanique (tú / usted).',
      lexical: 'Saludos y despedidas, la edad, la ciudad, la familia, el material escolar.',
      grammatical: 'Llamarse, tener (l’âge), ser, vivir au présent ; les mots interrogatifs (¿cómo?, ¿cuántos?, ¿dónde?).',
      phonologique: 'L’intonation de la question.',
      pragmatique: 'Saluer, se présenter, poser des questions et y répondre, prendre congé.',
    },
    support: { titre: 'Dialogue « Nos conocemos »', nature: 'Évaluation d’interaction orale', source: 'production des élèves' },
    materiel: ['Grille d’évaluation EOI (1 par binôme)', 'Liste de passage', 'Carte d’amorces (élèves fragiles)'],
    tache: 'En binôme, je dialogue pour faire connaissance : saluer, se présenter (nom, âge, ville, famille), poser des questions, prendre congé.',
    traceEcrite: '',
    exercices: [{
      consigne: 'Grille d’évaluation (✔ acquis · ~ en cours · ✘ pas encore).',
      exemple: 'Je salue et je prends congé. → ✔',
      items: ['Je me présente (nom, âge, ville).', 'Je pose au moins trois questions.', 'Je réponds aux questions de mon camarade.', 'Je réagis (¿Y tú? ¡Qué bien!).', 'Je parle sans lire, avec une prononciation compréhensible.'],
      corrige: ['—'],
    }],
    diapos: [
      { titre: 'Nos conocemos', texte: 'Diálogo en parejas · 1 min 30', aReveler: ['Saludar', 'Presentarse', 'Preguntar', 'Despedirse'] },
      { titre: 'Preguntas útiles', texte: '', aReveler: ['¿Cómo te llamas?', '¿Cuántos años tienes?', '¿Dónde vives?', '¿Tienes hermanos?', '¿Qué hay en tu mochila?'] },
    ],
    fragiles: 'Carte d’amorces avec les questions écrites ; droit de regarder la carte une fois.',
    aLaise: 'Ajouter des questions sur les goûts (¿Te gusta…?) et sur la famille.',
    obstacles: ['« Soy doce años » → je le note pour vendredi : l’âge = TENER.', '« Me llamo es… » → structure à reprendre vendredi.', 'Lecture des notes → rappel : mots-clés seulement.'],
    correction: 'Production attendue (exemple) : — ¡Hola! ¿Cómo te llamas? — Me llamo Ana, ¿y tú? — Me llamo Hugo. ¿Cuántos años tienes? — Tengo doce años. ¿Dónde vives? — Vivo en Lyon. — ¡Adiós! — ¡Hasta luego!',
  },
  {
    date: '2026-11-13',
    titre: '¡Hola! Así soy yo — Bilan des évaluations & remédiation',
    activites: ['CO', 'EOI', 'EE'],
    etapes: [
      { titre: 'Entrée en activité : el intruso', duree: 5, al: ['EOC'], modalite: 'Classe entière', role: 'je fais justifier en espagnol',
        contenu: ['— « ¡Buenos días! Sentaos, por favor. »', 'Je projette : « lápiz · goma · perro · regla » · « mochila · estuche · tijeras · manzana » · « cuaderno · bolígrafo · libro · zapato ».', '— « ¿Cuál es el intruso? ¿Por qué? »', '— « El perro no es material escolar. »'] },
      { titre: 'Correction de l’évaluation de CO', duree: 15, al: ['CO'], modalite: 'Classe entière puis individuel', role: 'je fractionne l’écoute et je fais corriger au stylo vert',
        contenu: ['Je rends les copies et je repasse l’enregistrement de l’évaluation en m’arrêtant après chaque information.', '— « Escuchamos otra vez. ¿Qué hay en la mochila? »', '— « ¿Qué palabra no habéis entendido? »', 'J’écris au tableau les mots qui ont posé problème.'] },
      { titre: 'Retour sur les dialogues de jeudi', duree: 15, al: ['CE', 'EOC'], modalite: 'Classe entière', role: 'je projette les erreurs fréquentes (anonymes) et la classe corrige',
        contenu: ['Je projette cinq erreurs relevées jeudi, sans nom.', '— « ¿Dónde está el error? ¿Cómo lo corregimos? »', '« Soy doce años » → Tengo doce años · « Me llamo es Ana » → Me llamo Ana · « Vivo a Madrid » → Vivo en Madrid · « Tengo un hermana » → Tengo una hermana.'] },
      { titre: 'Remédiation en binômes', duree: 15, al: ['EOI'], modalite: 'Binômes', role: 'je passe avec la grille ; les élèves fragiles gardent la carte d’amorces',
        contenu: ['Les binômes rejouent le dialogue en intégrant les corrections, puis inversent les rôles.', '— « Ahora otra vez, sin mirar el papel. »', '— « ¡Mucho mejor! »'] },
      { titre: 'Auto-évaluation & annonce', duree: 10, al: ['EE'], modalite: 'Individuel', role: 'je recueille les « ya sé / todavía no sé » et j’annonce la suite',
        contenu: ['Chaque élève complète : « Ya sé… / Todavía no sé… ».', '— « La semana que viene vamos a conocer a una mujer muy famosa de México. Una pista: tiene unas cejas muy especiales… »'] },
    ],
    objectifs: {
      culturel: 'Teasing de la séance suivante : une artiste mexicaine (Frida Kahlo).',
      lexical: 'El material escolar ; la presentación.',
      grammatical: 'Tener pour l’âge ; llamarse ; vivir en ; un / una.',
      phonologique: 'La jota (ojos, mujer) et la rr (perro).',
      pragmatique: 'Se corriger, reformuler.',
    },
    support: { titre: 'Enregistrement de l’évaluation de CO (matériel scolaire)', nature: 'Enregistrement audio', source: 'évaluation du 9 novembre' },
    materiel: ['Enregistrement de l’évaluation de CO + enceinte', 'Copies corrigées', 'Erreurs fréquentes relevées jeudi (à projeter)', 'Fiche « Corrige l’erreur »'],
    tache: 'Je rejoue le dialogue « Nos conocemos » sans erreur et sans lire.',
    traceEcrite: 'Me presento\nMe llamo… · Tengo … años. · Vivo en… · Tengo … hermanos.\n\n¡Ojo!\nL’âge se dit avec TENER : Tengo doce años.\nVIVIR EN + ville : Vivo en Lyon.',
    exercices: [
      { consigne: 'Corrige l’erreur de chaque phrase.', exemple: 'Soy doce años. → Tengo doce años.',
        items: ['Me llamo es Ana.', 'Vivo a Madrid.', 'Tengo un hermana.', '¿Cuántos años tiene tú?', 'Mi mochila es azula.'],
        corrige: ['Me llamo Ana.', 'Vivo en Madrid.', 'Tengo una hermana.', '¿Cuántos años tienes?', 'Mi mochila es azul.'] },
      { consigne: 'Le matériel scolaire : traduis en espagnol, avec l’article.', exemple: 'un crayon → un lápiz',
        items: ['une gomme', 'une règle', 'un cahier', 'une trousse', 'des ciseaux', 'un stylo'],
        corrige: ['una goma', 'una regla', 'un cuaderno', 'un estuche', 'unas tijeras', 'un bolígrafo'] },
    ],
    diapos: [
      { titre: 'El intruso', texte: 'lápiz · goma · perro · regla\nmochila · estuche · tijeras · manzana\ncuaderno · bolígrafo · libro · zapato', aReveler: ['perro · manzana · zapato → no es material escolar'] },
      { titre: '¿Dónde está el error?', texte: '', aReveler: ['Soy doce años. → Tengo doce años.', 'Me llamo es Ana. → Me llamo Ana.', 'Vivo a Madrid. → Vivo en Madrid.', 'Tengo un hermana. → Tengo una hermana.'] },
      { titre: 'La semana que viene…', texte: 'Una mujer muy famosa de México.\nUna pista: tiene unas cejas muy especiales…', aReveler: [] },
    ],
    fragiles: 'Carte d’amorces pendant la remédiation ; correction de la CO guidée par des questions fermées.',
    aLaise: 'Enrichir le dialogue : goûts (¿Te gusta…?), famille, matériel (¿Qué hay en tu mochila?).',
    obstacles: ['Âge avec SER → TENER (je l’écris en rouge dans la trace écrite).', '« Vivo a » → VIVIR EN.', 'Genre : un / una hermana, una mochila.', 'Adjectif de couleur inventé (« azula ») → azul est invariable en genre.'],
    correction: 'Corrige l’erreur : Me llamo Ana · Vivo en Madrid · Tengo una hermana · ¿Cuántos años tienes? · Mi mochila es azul.\nMatériel : una goma · una regla · un cuaderno · un estuche · unas tijeras · un bolígrafo.',
  },
  {
    date: '2026-11-16',
    titre: '¿Cómo eres? — ¿Cómo es Frida? (décrire une personne)',
    activites: ['EOC', 'CE', 'EE'],
    etapes: [
      { titre: 'Entrée en activité : Veo, veo', duree: 5, al: ['EOI'], modalite: 'Classe entière', role: 'je réactive le matériel scolaire de l’évaluation',
        contenu: ['— « ¡Buenos días! Sentaos. »', 'Un élève choisit un objet de la classe, les autres devinent.', '— « Veo, veo. — ¿Qué ves? — Una cosita. — ¿Con qué letra empieza? »'] },
      { titre: 'Anticipation : ¿Quién es?', duree: 10, al: ['EOC'], modalite: 'Classe entière', role: 'je fais émettre des hypothèses avec les amorces au tableau',
        contenu: ['Je projette l’Autorretrato con collar de espinas y colibrí (1940), sans le titre.', 'J’écris les amorces : « Veo… / Es… / Tiene… ».', '— « ¿Quién es? ¿Es un hombre o una mujer? »', '— « ¿Qué ves? ¿Qué animales hay? »', '— « Se llama Frida Kahlo. Es una pintora mexicana. »'] },
      { titre: 'Découverte du lexique de la description', duree: 15, al: ['EOC', 'CO'], modalite: 'Classe entière', role: 'je montre sur l’œuvre, je fais répéter, je corrige la prononciation',
        contenu: ['Je montre chaque partie du visage sur l’œuvre : los ojos, las cejas, el pelo, la boca, la nariz.', '— « Frida tiene los ojos negros. ¿Y el pelo? »', '— « Tiene el pelo negro y largo. »', '— « ¿Y las cejas? — Tiene las cejas negras y muy marcadas. »', 'Répétition en chœur puis individuelle (attention à la jota de « ojos »).'] },
      { titre: 'Point de langue : SER ou TENER pour décrire', duree: 10, al: ['CE'], modalite: 'Classe entière', role: 'je fais observer et formuler la règle par les élèves',
        contenu: ['J’écris deux colonnes : « Frida es morena. Es seria. » / « Frida tiene el pelo negro. Tiene los ojos negros. »', '— « ¿Qué diferencia veis? »', 'Règle : SER + adjectif (moreno, alto, serio) · TENER + partie du corps (el pelo, los ojos).', '— « ¿Y el adjetivo? Negro, negra, negros, negras: ¿por qué cambia? »'] },
      { titre: 'Entraînement', duree: 15, al: ['EE'], modalite: 'Individuel puis correction collective', role: 'je circule ; les plus rapides font le défi',
        contenu: ['Je distribue la fiche ; je lis l’exemple résolu à voix haute.', '— « Mirad el ejemplo: así se hace. »', 'Défi : décrire un camarade en trois phrases, sans dire son nom.'] },
      { titre: 'Trace écrite & devoirs', duree: 5, al: ['EE'], modalite: 'Individuel', role: 'je projette la leçon',
        contenu: ['— « Copiad la lección, por favor. »', '— « Para el jueves: aprender el vocabulario de la cara. »', '— « ¡Hasta el jueves! »'] },
    ],
    objectifs: {
      culturel: 'Découvrir Frida Kahlo, peintre mexicaine, et l’autoportrait comme façon de se présenter (axes 1 et 6).',
      lexical: 'la cara, los ojos, las cejas, el pelo, la boca, la nariz ; moreno/a, rubio/a, alto/a, bajo/a, largo/a, corto/a, negro/a, azul, verde.',
      grammatical: 'SER + adjectif / TENER + partie du corps ; accord de l’adjectif en genre et en nombre.',
      phonologique: 'La jota [x] : ojos, mujer, roja.',
      pragmatique: 'Décrire physiquement une personne.',
    },
    support: { titre: 'Autorretrato con collar de espinas y colibrí (1940)', nature: 'Œuvre d’art (peinture)', source: 'Frida Kahlo' },
    materiel: ['Vidéoprojecteur', 'Image de l’œuvre (à ajouter en pièce jointe pour la projection hors ligne)', 'Fiche d’exercices (1 par élève)', 'Leçon à coller (1 par élève)'],
    tache: 'Je décris le portrait de Frida en trois phrases (SER / TENER).',
    traceEcrite: '¿Cómo es Frida?\nFrida Kahlo es una pintora mexicana.\nEs morena y seria. Tiene el pelo negro y largo, los ojos negros y las cejas muy marcadas.\n\nPara describir\nSER + moreno/a · rubio/a · alto/a · bajo/a · serio/a\nTENER + el pelo largo / corto / negro… · los ojos negros / azules / verdes\n\n¡Ojo! L’adjectif s’accorde : los ojos negros, la boca pequeña.\nVocabulario : la cara · los ojos · las cejas · el pelo · la boca · la nariz',
    exercices: [
      { consigne: 'Complète la description avec ES ou TIENE.', exemple: 'Frida ___ los ojos negros. → Frida tiene los ojos negros.',
        items: ['Frida ___ mexicana.', '___ el pelo largo y negro.', '___ las cejas muy marcadas.', '___ una mujer seria.', '___ un collar de espinas.'], corrige: ['es', 'Tiene', 'Tiene', 'Es', 'Tiene'] },
      { consigne: 'Accorde l’adjectif entre parenthèses.', exemple: 'el pelo (negro) → el pelo negro',
        items: ['los ojos (negro)', 'la boca (pequeño)', 'las cejas (negro)', 'el pelo (largo)', 'Frida es (moreno)'], corrige: ['los ojos negros', 'la boca pequeña', 'las cejas negras', 'el pelo largo', 'Frida es morena'] },
      { consigne: 'Traduis en espagnol, avec l’article.', exemple: 'le visage → la cara',
        items: ['les yeux', 'les cheveux', 'la bouche', 'les sourcils', 'le nez'], corrige: ['los ojos', 'el pelo', 'la boca', 'las cejas', 'la nariz'] },
    ],
    diapos: [
      { titre: '¿Quién es?', texte: '[Image : Autorretrato con collar de espinas y colibrí — Frida Kahlo, 1940]', aReveler: ['Veo a una mujer.', 'Es una pintora mexicana.', 'Se llama Frida Kahlo.'] },
      { titre: 'La cara', texte: '', aReveler: ['los ojos', 'las cejas', 'el pelo', 'la boca', 'la nariz'] },
      { titre: '¿SER o TENER?', texte: 'Frida es morena. · Frida tiene el pelo negro.', aReveler: ['SER + adjetivo: moreno, alto, serio', 'TENER + parte del cuerpo: el pelo, los ojos', 'negro → negra → negros → negras'] },
      { titre: 'Para el jueves', texte: 'Aprender el vocabulario de la cara.', aReveler: [] },
    ],
    fragiles: 'Banque de mots illustrée (visage légendé) ; amorces « Es… / Tiene… » affichées ; exercice 2 réduit à 3 items.',
    aLaise: 'Défi : décrire un camarade en trois phrases sans dire son nom ; ajouter « Me parezco a… ».',
    obstacles: ['« Tengo moreno » → je fais choisir : SER moreno / TENER el pelo moreno.', 'Accord oublié (« ojos negro ») → je fais entourer le nom et flécher l’adjectif.', 'Genre : el pelo, la boca, la nariz → je les colore (bleu / rouge) au tableau.', 'La jota de « ojos » prononcée [ʒ] → je la fais exagérer, comme un raclement.'],
    correction: 'ES / TIENE : es · Tiene · Tiene · Es · Tiene\nAccords : los ojos negros · la boca pequeña · las cejas negras · el pelo largo · Frida es morena\nTraduction : los ojos · el pelo · la boca · las cejas · la nariz\nProduction attendue : « Frida es mexicana. Es morena y seria. Tiene el pelo negro y los ojos negros. »',
  },
  {
    date: '2026-11-19',
    titre: '¿Cómo eres? — ¿Quién es? Adivinanzas y autorretrato',
    activites: ['CO', 'EOI', 'EE'],
    etapes: [
      { titre: 'Dessin dicté', duree: 8, al: ['CO'], modalite: 'Individuel', role: 'je décris lentement un visage, les élèves dessinent',
        contenu: ['— « Coged una hoja. Escuchad y dibujad. »', '— « Es un chico. Tiene la cara redonda. Tiene el pelo corto y rizado. Tiene los ojos grandes y una boca pequeña. »', 'On compare les dessins : — « ¿Quién tiene el dibujo correcto? »'] },
      { titre: 'Jeu « ¿Quién es? »', duree: 15, al: ['EOI'], modalite: 'Binômes', role: 'je circule et je relance en espagnol ; je réinvestis le dialogue de jeudi dernier',
        contenu: ['Chaque élève choisit un personnage sur la planche de visages ; son binôme pose des questions fermées.', '— « ¿Es una chica? — Sí. — ¿Tiene el pelo rubio? — No. — ¿Es alta? — Sí. »', '— « Solo en español, ¡y con la entonación de la pregunta! »'] },
      { titre: 'Le caractère', duree: 10, al: ['CE', 'EOC'], modalite: 'Classe entière', role: 'je fais deviner le sens par le mime',
        contenu: ['Je mime chaque adjectif : simpático, tímido, divertido, serio, alegre.', '— « ¿Cómo eres tú? — Soy un poco tímida. »', 'Accord : simpático → simpática ; alegre ne change pas.'] },
      { titre: 'Écrit : « Mi autorretrato »', duree: 17, al: ['EE'], modalite: 'Individuel', role: 'je circule et j’annote au crayon sans corriger à la place des élèves',
        contenu: ['Je projette le modèle de l’exemple résolu.', '— « Escribid vuestro autorretrato en cinco frases. »', '— « Relee: ¿ser o tener? ¿El adjetivo está bien concordado? »'] },
      { titre: 'Lecture de quelques autoportraits & devoirs', duree: 10, al: ['EOC'], modalite: 'Classe entière', role: 'je fais deviner qui a écrit le texte',
        contenu: ['Je lis trois autoportraits sans dire le nom ; la classe devine.', '— « ¿Quién es? »', '— « Para la próxima clase: terminar el autorretrato. Será la base de vuestro vídeo para un amigo mexicano. »'] },
    ],
    objectifs: {
      culturel: 'Se présenter à un correspondant mexicain (préparation de la tâche finale).',
      lexical: 'Physique (révision) ; caractère : simpático, tímido, divertido, serio, alegre.',
      grammatical: 'SER / TENER ; accord des adjectifs ; questions fermées (intonation).',
      phonologique: 'L’intonation montante de la question fermée.',
      pragmatique: 'Poser des questions pour identifier quelqu’un ; se décrire.',
    },
    support: { titre: 'Planche de visages « ¿Quién es? »', nature: 'Jeu', source: 'planche à imprimer' },
    materiel: ['Planche de visages (1 par binôme)', 'Feuilles blanches (dessin dicté)', 'Fiche d’exercices (1 par élève)', 'Leçon à coller'],
    tache: 'J’écris mon autoportrait en cinq phrases (physique et caractère).',
    traceEcrite: 'El carácter\nsimpático/a · tímido/a · divertido/a · serio/a · alegre\n\nPara adivinar\n¿Es un chico o una chica? · ¿Tiene el pelo…? · ¿Es alto/a?\n\nMi autorretrato\nMe llamo… Tengo … años. Soy… Tengo el pelo… y los ojos… Soy… (carácter)',
    exercices: [
      { consigne: 'Mets l’adjectif au féminin.', exemple: 'simpático → simpática',
        items: ['tímido', 'divertido', 'serio', 'trabajador', 'alegre'], corrige: ['tímida', 'divertida', 'seria', 'trabajadora', 'alegre'] },
      { consigne: 'Écris ton autoportrait en cinq phrases, en suivant le modèle.', exemple: 'Me llamo Lucía. Tengo doce años. Soy alta y morena. Tengo el pelo largo y los ojos verdes. Soy simpática y un poco tímida.',
        items: ['Me llamo…', 'Tengo … años.', 'Soy … (físico)', 'Tengo el pelo … y los ojos …', 'Soy … (carácter)'], corrige: ['Production libre : vérifier SER / TENER et les accords.'] },
    ],
    diapos: [
      { titre: 'Escucha y dibuja', texte: '', aReveler: ['Es un chico.', 'Tiene la cara redonda.', 'Tiene el pelo corto y rizado.', 'Tiene los ojos grandes y una boca pequeña.'] },
      { titre: '¿Quién es?', texte: 'Preguntas:', aReveler: ['¿Es un chico o una chica?', '¿Tiene el pelo rubio / moreno / largo?', '¿Tiene los ojos azules?', '¿Es alto/a?'] },
      { titre: 'El carácter', texte: '', aReveler: ['simpático/a', 'tímido/a', 'divertido/a', 'serio/a', 'alegre'] },
      { titre: 'Mi autorretrato', texte: 'Me llamo Lucía. Tengo doce años. Soy alta y morena. Tengo el pelo largo y los ojos verdes. Soy simpática y un poco tímida.', aReveler: [] },
    ],
    fragiles: 'Cadre d’écriture avec amorces ; planche de questions pour le jeu ; trois phrases au lieu de cinq.',
    aLaise: 'Ajouter les goûts (Me gusta…) et une comparaison (Me parezco a…) ; décrire aussi un membre de la famille.',
    obstacles: ['« Soy el pelo largo » → TENER el pelo largo.', 'Question sans intonation (phrase affirmative) → je fais monter la voix en fin de question.', 'Accord au féminin oublié (« Soy tímido » pour une fille) → je fais vérifier avec la règle -o / -a.'],
    correction: 'Féminin : tímida · divertida · seria · trabajadora · alegre\nAutoportrait attendu : « Me llamo Hugo. Tengo doce años. Soy alto y rubio. Tengo el pelo corto y los ojos azules. Soy divertido y un poco tímido. »',
  },
]
