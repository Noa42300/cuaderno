// Banque de points de langue : règle, obstacles fréquents & remédiation, exercice avec exemple résolu.

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
  presentarse: {
    label: 'Se présenter : llamarse, tener, ser, vivir',
    objectif: 'Se présenter : me llamo…, tengo … años, soy…, vivo en…',
    regle: 'LLAMARSE : me llamo, te llamas, se llama\nTENER : tengo, tienes, tiene (l’âge : tengo doce años)\nSER : soy, eres, es (nationalité, caractère)\nVIVIR : vivo, vives, vive (vivo en Lyon)',
    obstacles: '« Soy doce años » (calque de « j’ai… ») → je rappelle : l’âge se dit avec TENER.\n« Me llamo es… » → je fais répéter la structure seule : « Me llamo Ana ».',
    exercice: {
      consigne: 'Complète avec me llamo, tengo, soy ou vivo.',
      exemple: '___ Lucía. → Me llamo Lucía.',
      items: ['___ trece años.', '___ en Burdeos.', '___ francés.', '___ Pablo.', '___ un hermano y una hermana.'],
      corrige: ['Tengo', 'Vivo', 'Soy', 'Me llamo', 'Tengo'],
    },
  },
  genero_numero: {
    label: 'Genre et nombre (articles, adjectifs)',
    objectif: 'Accorder articles et adjectifs : el / la / los / las, -o / -a / -os / -as',
    regle: 'Masculin : el chico alto · Féminin : la chica alta\nPluriel : + s après voyelle (los chicos altos), + es après consonne (los profesores)\nAttention : el día, la mano, el problema',
    obstacles: 'Genre calqué sur le français (« la leche » ≠ « le lait ») → je fais surligner les noms qui changent de genre.\nAdjectif non accordé → je fais entourer le nom et flécher l’adjectif.',
    exercice: {
      consigne: 'Mets au pluriel.',
      exemple: 'el chico simpático → los chicos simpáticos',
      items: ['la casa blanca', 'el profesor alto', 'la ciudad bonita', 'el ojo azul', 'el lápiz rojo'],
      corrige: ['las casas blancas', 'los profesores altos', 'las ciudades bonitas', 'los ojos azules', 'los lápices rojos'],
    },
  },
  reflexivos: {
    label: 'Verbes pronominaux (la rutina)',
    objectif: 'Raconter sa journée : me levanto, me ducho, me acuesto',
    regle: 'Le pronom se place avant le verbe conjugué :\nme levanto · te levantas · se levanta · nos levantamos · os levantáis · se levantan\nÀ l’infinitif, il s’accroche : voy a levantarme',
    obstacles: 'Oubli du pronom (« levanto a las siete ») → je fais répéter avec le geste.\nPronom mal accordé (« me levantas ») → je fais le tableau des pronoms en couleur.',
    exercice: {
      consigne: 'Conjugue le verbe pronominal au présent.',
      exemple: 'Yo (levantarse) a las siete. → Yo me levanto a las siete.',
      items: ['Tú (ducharse) por la mañana.', 'Mi padre (afeitarse) cada día.', 'Nosotros (acostarse) a las diez.', 'Ellas (peinarse) en el baño.', 'Yo (vestirse) rápido.'],
      corrige: ['te duchas', 'se afeita', 'nos acostamos', 'se peinan', 'me visto'],
    },
  },
  posesivos: {
    label: 'Adjectifs possessifs',
    objectif: 'Parler de sa famille : mi, tu, su, nuestro, vuestro, su',
    regle: 'mi / mis · tu / tus · su / sus · nuestro(a)(s) · vuestro(a)(s) · su / sus\nLe possessif s’accorde avec l’objet possédé : mis hermanos, nuestra casa',
    obstacles: '« Su » ambigu (son / leur) → je précise : « su casa = la casa de él / de ellos ».\nAccent sur « tú » (pronom) / « tu » (possessif) → je fais comparer deux phrases.',
    exercice: {
      consigne: 'Complète avec le possessif qui convient.',
      exemple: '(yo) ___ hermana se llama Ana. → Mi hermana se llama Ana.',
      items: ['(tú) ___ padres son simpáticos.', '(nosotros) ___ casa es grande.', '(él) ___ abuelos viven en Sevilla.', '(vosotros) ___ profesora es española.', '(yo) ___ primos tienen diez años.'],
      corrige: ['Tus', 'Nuestra', 'Sus', 'Vuestra', 'Mis'],
    },
  },
  perfecto: {
    label: 'Passé composé (pretérito perfecto)',
    objectif: 'Raconter des faits passés liés au présent : he visto, hemos estudiado',
    regle: 'HABER au présent + participe passé (-ado / -ido)\nhe, has, ha, hemos, habéis, han + hablado / comido / vivido\nIrréguliers : visto, hecho, dicho, escrito, puesto, vuelto, abierto',
    obstacles: 'Participe accordé comme en français (« hemos vistas ») → je rappelle : avec haber, le participe ne s’accorde jamais.\nPronom placé entre haber et le participe → je montre : « lo he visto ».',
    exercice: {
      consigne: 'Conjugue au passé composé.',
      exemple: 'Hoy yo (ver) el Guernica. → Hoy yo he visto el Guernica.',
      items: ['Esta semana nosotros (estudiar) a Picasso.', 'Tú nunca (estar) en Madrid.', 'Ellos (escribir) una carta.', 'Hoy la clase (hacer) un mural.', 'Yo (abrir) el libro.'],
      corrige: ['hemos estudiado', 'has estado', 'han escrito', 'ha hecho', 'he abierto'],
    },
  },
  condicional: {
    label: 'Conditionnel (condicional)',
    objectif: 'Faire des hypothèses et exprimer des souhaits : sería, podríamos',
    regle: 'Infinitif + -ía, -ías, -ía, -íamos, -íais, -ían → hablaría, comería\nIrréguliers (même radical que le futur) : tendría, haría, podría, saldría, diría\nSi + subjonctif imparfait, conditionnel : Si pudiera, viajaría.',
    obstacles: '« Si podría » (calque du français fautif) → je rappelle : jamais de conditionnel après « si ».\nConfusion avec l’imparfait (-ía) des verbes en -er/-ir → je compare comía / comería.',
    exercice: {
      consigne: 'Mets le verbe au conditionnel.',
      exemple: 'Yo (viajar) por los Andes. → Yo viajaría por los Andes.',
      items: ['Nosotros (proteger) más la naturaleza.', 'Tú (poder) ayudar.', 'La IA (hacer) nuestro trabajo.', 'Ellos (tener) más tiempo.', 'Yo (decir) la verdad.'],
      corrige: ['protegeríamos', 'podrías', 'haría', 'tendrían', 'diría'],
    },
  },
}
