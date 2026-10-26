# CLAUDE.md — Cuaderno, cahier journal de professeure d’espagnol

Mémoire commune du projet. **À tenir à jour à chaque décision.**
Utilisatrice : professeure d’espagnol, second degré (collège + lycée), non développeuse.
→ Expliquer simplement, en français, par petites étapes vérifiables.

## 1. Principes non négociables

- **100 % local** : toutes les données dans IndexedDB du navigateur. Aucun serveur, aucun compte,
  aucun analytics, aucune requête externe (polices auto-hébergées via @fontsource, pas de Google Fonts).
- **Aucune donnée d’élève ne quitte l’appareil.** Seule exception : la sauvegarde JSON que la prof
  télécharge elle-même.
- **PWA hors ligne**, installable Mac (Safari « Ajouter au Dock » / Chrome) et iPhone/iPad
  (Safari › Partager › « Sur l’écran d’accueil »).
- **GitHub Pages** : `base: './'` (sous-dossier), routage par hash (`#/jour/2026-10-26`),
  déploiement auto sur push `main` (`.github/workflows/deploy.yml`).
- **Mise à jour auto** : `registerType: 'autoUpdate'` + skipWaiting/clientsClaim ; `src/pwa.ts`
  recharge la page sur `controllerchange`, vérifie les mises à jour toutes les 30 min et au retour
  au premier plan. Les formulaires s’enregistrent automatiquement (0,6 s) pour qu’un rechargement ne
  perde rien.
- **Verrou PIN** (4–8 chiffres) : seule une empreinte PBKDF2 salée est stockée. C’est un verrou
  d’usage, **pas un chiffrement** — le dire honnêtement. Reverrouillage après N min en arrière-plan.
- **Synchro publique (plus tard)** : `journal.json` produit par `sanitizeForPublic()`
  (`src/db/sanitize.ts`), en **liste blanche**. Exclus : élèves, observations, pièces jointes,
  réglages/PIN, rappels, bilans, différenciation, notes de séquence. Les prénoms d’élèves trouvés dans
  les textes sont masqués « [élève] ». Relecture = fusion non destructive (à implémenter).

## 2. Stack

Vite 8 · React 19 · TypeScript 7 · Tailwind CSS 4 (config CSS dans `src/index.css`) ·
vite-plugin-pwa · idb. PDF prévu : html2canvas + jsPDF, téléchargement par ancre `<a download>`
(pas `window.open`, qui échoue en PWA installée) + impression navigateur en secours.

Commandes : `npm run dev`, `npm run build`, `npm run icons` (régénère les PNG depuis
`public/favicon.svg`, nécessite Playwright en local ; PNG versionnés).

## 3. Arborescence

```
src/
  db/types.ts      modèle de données (source de vérité)
  db/db.ts         ouverture IndexedDB + MIGRATIONS versionnées, CRUD, réglages
  db/modeles.ts    fabriques (nouvelleSeance), créneaux du jour, prochain cours
  db/backup.ts     export/import JSON complet, téléchargement
  db/sanitize.ts   sanitizeForPublic()
  lib/             dates (A/B, fecha), pin, hooks (useQuery, routeur hash), programmes
  components/      Shell (nav latérale Mac / onglets iPhone), Logo, ui
  views/           Verrou, VueJour, EditeurSeance, VueReglages, BientotLa
```

## 4. Modèle de données (IndexedDB `cuaderno`, version 1)

Stores : `classes`, `creneaux`, `seances`, `devoirs`, `rappels`, `sequences`, `eleves`🔒,
`observations`🔒, `piecesJointes`🔒, `meta` (réglages). 🔒 = sensible, jamais publié.

- **Classe** : nom, niveau (6e→Tle), option (LV1/LV2/LLCER…), effectif, CECRL visé, couleur, heures/semaine.
- **Créneau** (EDT récurrent) : classe, jour (1=lundi…6), début, fin, salle, semaine `toutes|A|B`.
  Alternance A/B calculée depuis `reglages.lundiSemaineA`.
- **Séance** : classe, date (null = bibliothèque), créneau, séquence, titre, statut
  (prévue/faite/annulée), durée, activités langagières, CECRL de→vers, objectifs (culturel, lexical,
  grammatical, phonologique, pragmatique), programme, support (titre, nature, source, url),
  videoUrl (UNE vidéo), tâche, trace écrite, déroulement (étapes : titre, durée, AL, contenu),
  différenciation (fragiles / à l’aise), obstacles, correction, bilan.
- **Devoir** : classe, donné le, pour le, séance liée, texte. Date par défaut = prochain cours de la classe.
- **Rappel** : date, heure, type (réunion, conseil, sortie, AP, parents, autre), titre.
- **Séquence** : titre, niveau, classes, programme, projet final, tâche finale, évaluation, CECRL.
- **Élève / Observation** : locaux uniquement ; observations datées par activité langagière.

**Migrations** : ne jamais modifier une migration livrée ; ajouter une fonction à `MIGRATIONS`
dans `db.ts`. Toute évolution du modèle → mettre à jour cette section.

## 5. Volumes horaires

`heuresHebdo` déclaré par classe, comparé à l’EDT (créneaux A/B comptés pour moitié) dans
Réglages › Mes classes. À venir : heures faites (séances « faite ») / prévues sur l’année.

## 6. Charte graphique

- Tokens dans `src/index.css` (`:root` / `.dark`), utilisés via Tailwind (`bg-surface`, `text-primary`…).
- Clair : fond crème `#FBF4E6`, encre `#2B2B2B`, terracotta `#C84B31` (aplats décoratifs uniquement :
  4,26:1 sur crème, insuffisant pour du texte), **teja foncée `#B03F27` pour textes/boutons** (5,35:1),
  grenat `#A11C3A`, safran `#E9A500` (fond seulement, texte encre dessus), ocre `#D98A2B`,
  azulejo `#1C6E8C` (accent froid, 5,24:1).
- Sombre : fond `#1E1A17`, primaire `#E5775C`, azulejo `#5FB3D1`, grenat `#E8778C`.
- Typo : **Fraunces** (titres, caractère) · **Atkinson Hyperlegible** (corps, lisibilité maximale,
  y compris en vidéoprojection).
- Motifs : `.azulejo` (carreau en fond, discret), `.frise` (triangles teja/safran). Pas de drapeau.
- Contrastes AA obligatoires ; responsive : barre latérale ≥ md, barre d’onglets en bas sur iPhone
  (safe-area iOS gérée).

## 7. Cadre pédagogique (chaque séance)

- 5 activités langagières : **CO, CE, EOC, EOI, EE**.
- Niveau CECRL (de → vers), objectifs culturel / linguistiques (lexique, grammaire, phonologie) /
  pragmatique, document support authentique (Espagne **et** Amérique latine), tâche, trace écrite.
- Référence programmes (`src/lib/programmes.ts`) : cycle 4 = Langages, École et société, Voyages et
  migrations, Rencontres avec d’autres cultures ; Seconde = 8 axes de « L’art de vivre ensemble » ;
  cycle terminal = 8 axes de « Gestes fondateurs et mondes en mouvement ». **LLCER : à compléter
  avec la prof.** Vérifier en cas de nouveau BO.
- Vidéo : **un lien vers UNE vidéo précise** (contrôle `problemeVideo()` : refuse pages de résultats).

## 8. Règles de rédaction des contenus (quand Claude rédige une séance)

- **Toujours à la 1re personne** : « je distribue », « je fais réagir en espagnol », « je circule ».
  Jamais « l’enseignant… », jamais de ton générique ou « IA ».
- Déroulement détaillé : chaque étape contient **plusieurs répliques orales** courtes et concrètes,
  en français et/ou espagnol, format `— « … »`.
- **Différenciation** explicite (fragiles / à l’aise), **jamais de prénom associé à un trouble**.
- **Obstacles & remédiation** : erreurs typiques (ser/estar, genre des noms, faux-amis, conjugaison,
  accentuation, gustar…) + comment débloquer sur le moment.
- **Correction** attendue (réponses, production visée).
- Fiches élèves : **un exemple résolu en tête de chaque exercice**.

## 9. Feuille de route

- [x] Étape 1 : projet, PWA, IndexedDB, PIN, thème, navigation, Vue Jour, éditeur de séance,
  réglages (classes, EDT A/B, jours, PIN, sauvegarde, journal.json).
- [ ] Documents à imprimer (fiche de prép A4, diaporama à révéler, trace écrite, fiche d’exercices,
  pièces jointes) + aperçu plein écran, PDF, impression.
- [ ] Séquences & bibliothèque (poser une séance sur un jour/une classe).
- [ ] Progressions annuelles par niveau.
- [ ] Rituels de début de cours.
- [ ] Suivi élèves + observations (local).
- [ ] Générateur de squelette de séance (local, déterministe).
- [ ] Suivi des volumes horaires annuels.
- [ ] Synchro lecture seule `journal.json` (fusion non destructive).

## 10. Décisions prises

- 2026-10-26 : nom « Cuaderno » ; routage par hash ; polices auto-hébergées ; teja foncée pour le
  texte (contraste AA) ; alternance semaines A/B prise en charge ; PIN = verrou, pas chiffrement.
