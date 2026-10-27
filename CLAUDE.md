# CLAUDE.md — Cuaderno, cahier journal de professeure d’espagnol

Mémoire commune du projet. **À tenir à jour à chaque décision.**

- **Utilisatrice finale** : professeure d’espagnol (collège + lycée), non développeuse.
- **Commanditaire** (qui pilote avec Claude) : sa fille, professeure des écoles, qui a son propre
  cahier journal (CE1-CE2) et l’a donné comme **modèle d’organisation** (photos du 27/10/2026) :
  barre latérale riche, vue Semaine en cartes par jour, clic sur un cours = fiche complète dépliée
  et pré-remplie, documents à imprimer (Aperçu / PDF / Imprimer), Tableau en cursive, etc.
- Expliquer simplement, en français, par petites étapes vérifiables. Libellés de navigation **en espagnol**
  (sous-titre français).
- Dépôt : `Noa42300/cuaderno`. **Chaque modification validée est commitée et poussée directement sur
  `main`** → GitHub Actions publie sur https://noa42300.github.io/cuaderno/ ; l’appli installée se met
  à jour seule. Toujours `npm run build` avant de pousser.

## 1. Principes non négociables

- **100 % local** : données dans IndexedDB du navigateur. Aucun serveur, compte ni analytics.
  Polices auto-hébergées (@fontsource : Fraunces, Atkinson Hyperlegible, Playwrite FR Trad).
- **Aucune donnée d’élève ne quitte l’appareil** (sauf la sauvegarde JSON téléchargée par la prof).
- **PWA hors ligne** (Mac : Safari › Fichier › Ajouter au Dock ; iPhone : Partager › Sur l’écran d’accueil).
- **GitHub Pages** : `base: './'`, routage par hash, déploiement auto sur `main`.
- **Mise à jour auto** (`src/pwa.ts`) ; formulaires enregistrés automatiquement (0,6 s).
- **Pas de code PIN** (supprimé à la demande, 2026-10-26).
- **Liens vidéo** : uniquement des liens trouvés par recherche web (jamais inventés), marqués
  « à vérifier avant projection ». Une vidéo précise, jamais une page de résultats.
- `sanitizeForPublic()` (liste blanche) prête pour une future synchro `journal.json`.

## 2. Stack

Vite 8 · React 19 · TypeScript 7 · Tailwind CSS 4 (config dans `src/index.css`) · vite-plugin-pwa · idb ·
PDF : html2canvas-pro + jsPDF (chargés à la demande, `src/lib/pdf.ts`), téléchargement par ancre,
impression navigateur en secours. Commandes : `npm run dev | build | icons`.

## 3. Arborescence

```
src/
  data/officiel.ts        programmes en vigueur 2026-27, axes, niveaux visés, volumes horaires,
                          descripteurs CECRL, vacances 2026-27 (zones A/B/C), jours fériés, périodes
  data/programmations.ts  6 séquences / niveau (5e, 4e, 3e, 1re, Tle) : période, axe, problématique,
                          3 documents authentiques (+ vidéo vérifiée si trouvée), 2 points de langue,
                          lexique [es, fr], tâche finale
  data/grammaire.ts       19 points de langue : règle, erreurs fréquentes & remédiation, exercice
                          (exemple résolu + 5 items + corrigé)
  data/rituels.ts         rituels par niveau, phrases à traduire (FR→ES), refranes, trabalenguas ;
                          rituelDuJour() déterministe (date + classe)
  data/ressources.ts      ressources d’espagnol (sites pérennes)
  data/classesInitiales.ts les 10 classes 2026-27, ajoutées une fois au 1er lancement
  lib/generateur.ts       génère une fiche COMPLÈTE selon le type de séance
  lib/progression.ts      moteur : cours de l’EDT ↔ séances de la progression
  lib/pdf.ts, dates.ts, hooks.ts, programmes.ts
  components/             Shell (barre bleu marine), DocumentsListe, Logo, ui
  views/                  Journee (Hoy, Semana), FicheSeance, Documents, Agenda (Calendario),
                          Programmation (Programación, Progresión), Sequences, Generateur,
                          Annexes (Recursos, Rituales, Volumen), Pizarra, Eleves, Reunions, VueReglages
```

## 4. Navigation (barre latérale, libellés espagnols)

Hoy · Semana · Calendario │ Programación · Progresión · Secuencias · Generador │ Recursos · Rituales ·
Pizarra │ Alumnos · Reuniones · Volumen horario │ Ajustes. (« EDT classe » du modèle primaire : retiré.)
iPhone : barre du bas Hoy · Semana · Rituales · Pizarra · Más (menu complet).

## 5. Les classes 2026-2027

5e D (LV2, A1+) · 4e C, 4e D (LV2, A2) · 3e B, 3e C, 3e D (LV2, A2) · 1re A, 1re B (LVB, B1) ·
Tle A, Tle B (LVB, B1). Heures : 2 h 30 collège, 2 h lycée (à confirmer). Effectifs : non renseignés.
**Emploi du temps : à fournir par la prof** (rien ne s’affiche dans Hoy/Semana sans lui).

## 6. Progression automatique (cœur de l’appli)

- Chaque séquence = 11 séances : découverte doc 1 → approfondissement → point de langue 1 → doc 2 →
  approfondissement → point de langue 2 → doc 3 → approfondissement → préparation tâche finale →
  tâche finale (évaluation) → bilan & remédiation. Clé : `niveau:séquence:séance` (`+` = « suite »).
- `planningClasse()` : sans recalage, la progression suit les **périodes** (une séquence prévue par
  période) et répartit ses séances sur tous les cours de la période ; s’il y a plus de cours que de
  séances, une séance s’étale sur deux cours (« (suite) » = approfondissement). Si la classe a été
  **recalée** (`classe.depart = {date, index}`, page Progresión), ordre strict à partir de ce point.
- Vacances (zone dans Ajustes) et jours fériés exclus.
- Un cours sans fiche affiche le **titre proposé** ; au clic, `creerDepuisProgression()` génère et
  enregistre la fiche complète. « ↻ Régénérer depuis la progression » dans la fiche.

## 7. La fiche de séance (modèle du cahier journal)

Rubriques repliables : Objectifs & compétences (programme, problématique, niveau visé, descripteurs
CECRL officiels par activité, socle cycle 4) · Programmation / progression · Organisation & rôle de
l’enseignant (disposition + modalité et rôle pour chaque étape) · **Déroulement** (ouvert) · Matériel /
support · Vidéo explicative · Différenciation · Correction / attendus · Erreurs fréquentes & remédiation ·
Tâche & trace écrite · Fiche d’exercices · Diaporama · Bilan · **Documents à imprimer** (fiche de prép A4,
diaporama, leçon à coller, exercices, corrigé, pièces jointes — Aperçu / PDF / Imprimer).
Modèle de données : champs `competences`, `progressionRef`, `organisation`, `materiel`, `cleProgression`
ajoutés à `Seance` (complétés par `normaliserSeance()` pour les anciennes fiches). IndexedDB toujours v1.

## 8. Règles de rédaction (générateur et Claude)

- **1re personne** (« je distribue », « je circule »), jamais « l’enseignant… ».
- Chaque étape : plusieurs **répliques orales** `— « … »`, en espagnol surtout.
- Différenciation fragiles / à l’aise, **jamais de prénom associé à un trouble**.
- Erreurs fréquentes (ser/estar, genre, faux-amis, accentuation, gustar…) + remédiation immédiate.
- Fiches élèves : **exemple résolu en tête de chaque exercice**.
- Les éléments qui dépendent d’un document à choisir restent entre **[crochets]**.

## 9. Programmes (vérifiés le 27/10/2026)

- 5e : nouveau programme (BO n° 22 du 29 mai 2025, annexe 9) — 6 axes dont « Le Mexique » (obligatoire).
- 4e-3e : programme du cycle 4 (BO n° 31 du 30 juillet 2020) — Langages, École et société, Voyages et
  migrations, Rencontres avec d’autres cultures (nouveau programme en 4e en 2027, 3e en 2028).
- 1re et Tle : nouveau programme (BO n° 22 du 29 mai 2025, annexe 10), 6 axes par niveau
  (1re : … axe 6 L’espace andin ; Tle : … axe 6 La richesse des métissages dans le monde hispanique).
- Calendrier 2026-27 : source Onisep. Volumes : LV2 collège 2 h 30 ; 1re 4 h 30 et Tle 4 h (LVA+LVB).

## 10. Charte graphique

- **Barre latérale bleu marine** (dégradé `#16305A → #0F2140`), item actif liseré safran `#E9A500`.
- Couleur principale `#1F3A5F` (sombre : `#9DB8E0`) ; fond crème `#FBF4E6`, encre `#2B2B2B` ;
  terracotta `#C84B31` en décor (frise), azulejo `#1C6E8C`, grenat `#A11C3A`.
- Fraunces (titres) · Atkinson Hyperlegible (texte) · Playwrite FR Trad (cursive de la Pizarra).
- Contrastes AA, responsive Mac / iPhone.

## 11. Feuille de route

- [x] Étape 1 : socle PWA, données locales, réglages.
- [x] Étape 2 : agenda, séquences, générateur, documents PDF, suppression du PIN.
- [x] Étape 3 (27/10/2026) : refonte sur le modèle du cahier journal — 10 classes, programmations et
  progressions par niveau, fiches complètes auto-remplies, Hoy/Semana, Rituales, Pizarra, Recursos,
  Alumnos, Reuniones, Volumen horario, barre bleu marine en espagnol.
- [ ] Saisir l’emploi du temps réel de la prof ; confirmer zone, LV2/LVB, horaires.
- [ ] Documents « à choisir » : compléter avec la prof (articles récents, photos).
- [ ] Recherche globale ; synchro `journal.json`.

## 12. Décisions

- 2026-10-26 : nom « Cuaderno », hash routing, polices locales, PIN supprimé, bleu marine.
- 2026-10-27 : cible = la mère (prof d’espagnol) ; modèle = cahier journal primaire de la fille ;
  progression alignée sur les périodes ; liens vidéo uniquement issus de recherches.
