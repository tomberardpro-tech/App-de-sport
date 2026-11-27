# Design system — Salle

Référence unique pour garder l'app cohérente. Les maquettes validées sont sur le canvas « Croquis app salle ».

**Règle d'or : aucune valeur en dur.** Couleurs, arrondis, espacements, tailles de texte et durées d'animation viennent de `src/styles/tokens.css`. Les classes de base sont dans `src/index.css`, les composants dans `src/ds/`.

## Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#F7F1EA` | Fond de page (crème chaud) |
| `--surface` | `#FFFFFF` | Cartes, champs, menu, tiroirs |
| `--border` | `#ECE9E2` | Contour des cartes |
| `--divider` | `#F0EDE6` | Séparateurs dans une liste |
| `--ink` | `#1C1C1A` | Texte, bouton principal, **élément sélectionné** |
| `--muted` | `#6E6C66` | Texte secondaire, légendes |
| `--track` / `--track-strong` | `#EEECE6` / `#E6E3DC` | Fonds de barres, étapes non atteintes |
| `--accent` | `#E8956A` | Orange doux : **petites touches uniquement** (barre de progression, point final d'une courbe, étoile favorite, jour courant) |
| `--accent-soft` / `--accent-ink` | `#FCEBDF` / `#9A4518` | Pastilles (« +5 kg », « Reste 900 kcal ») |
| `--placeholder` | `#F1D5C0` | Emplacement photo |
| `--danger` | `#C2553F` | Suppression |

Pas de vert, pas de dégradé décoratif (sauf la carte photo « Cette semaine »).

## Arrondis — 4 tailles seulement

| Token | Valeur | Éléments |
|---|---|---|
| `--r-sheet` | 16 px | Tiroirs du bas |
| `--r-card` | 12 px | Cartes, photos, barre de menu |
| `--r-control` | 8 px | Boutons, champs, vignettes, filtres, jours |
| `--r-badge` | 6 px | Pastilles, segments internes, onglet actif du menu |

Arrondi intérieur = arrondi extérieur − marge (ex. menu 12 px, marge 6 px → onglet 6 px).

## Typographie

- **Inter** pour tout, **Caveat** pour les annotations manuscrites.
- Titre de page (`.title`) : 30 px, **une ligne légère + une ligne grasse** (« Bonjour, **Tom** », « Mes **machines** »). Composant `<Title light bold sub note />`.
- Titre de section (`.h2`) 17 px semi-gras · titre d'élément (`.item-title`) 14 px semi-gras · légende (`.cap`) 12 px gris · valeur (`.value`) 22 px · grande valeur (`.value--big`) 36 px.

## Composants (`src/ds/components.tsx`)

| Composant | Rôle |
|---|---|
| `Title`, `SectionHead` | Titres de page / section (« Modifier › ») |
| `.btn` / `.btn--light` / `.btn--sm` | Bouton principal noir 52 px / secondaire blanc / petit |
| `IconButton` (`.icb`) | Bouton icône carré 44 px (36 px en `small`) |
| `.card`, `.card--list` + `.list-row` | Carte blanche ; liste dans une carte avec séparateurs |
| `.option` | Carte de choix (objectif…) ; `aria-pressed="true"` = fond pêche + contour orange doux |
| `.tile` | Vignette d'icône 38 px dans une ligne de liste |
| `.badge` / `.badge--neutral` | Pastille orange douce / neutre |
| `.chip` | Filtre ; `aria-pressed="true"` = noir |
| `Segmented` | Choix exclusif (Homme/Femme, Petit/Moyen/Grand) |
| `Stepper` | − valeur + (poids, reps, âge…) |
| `Steps` | Barre de progression de l'onboarding |
| `Ring`, `LineChart` | Anneau des calories, courbe fine noire avec point orange |
| `Sheet` | Tiroir du bas (rendu en portail au-dessus de tout) |
| `BottomNav` | Menu 4 icônes, onglet actif noir |
| `Toaster` | Toast + confettis (`useUi().showToast / celebrate`) |
| `Icon` (`src/ds/Icon.tsx`) | Icônes en trait 1,7 px ; en ajouter ici, jamais d'emoji |

## Annotations manuscrites (`.note`)

- Petites, noires, penchées de −4°, pivot en bas.
- **Onboarding** : une phrase liée à l'étape (« tu pourras changer d'avis », « ça reste sur ton téléphone »…).
- **Dans l'app** : phrase du jour via `phraseOfDay(offset)` (`src/lib/seed.ts`), un décalage différent par écran.
- Placement : en haut à gauche de l'en-tête, ou accrochée en haut à droite du titre (`note` de `Title`).

## Mouvement et micro-interactions

Durées et courbes : `--d-fast` 80 ms, `--d-base` 160 ms, `--d-slow` 260 ms (courtes : l’app doit rester vive), `--ease-out`, `--ease-spring`.

| Classe / outil | Effet |
|---|---|
| `:active` sur boutons | Léger enfoncement (scale 0,95) |
| `.screen-enter`, `.stagger` | Écran et cartes qui apparaissent en glissant, l'une après l'autre |
| `.pop` | Apparition élastique (coche, étoile favorite, série ajoutée) |
| `Bump` | Un chiffre qui rebondit quand il change |
| `.wiggle` | Widgets qui tremblent en mode édition |
| `haptic(ms)` | Petite vibration (Android) |
| `celebrate()` | Confettis + toast pour un nouveau record |

`prefers-reduced-motion` coupe toutes les animations.

## Mise en page

- Marges latérales 22 px (`--page-x`), espace vertical 18 px entre blocs, 12 px dans une grille.
- Grille de widgets sur 2 colonnes : petit = 1 colonne, moyen = 2 colonnes, grand = 2 colonnes et plus haut.
- Zone tactile minimale : 44 px.

## Comportement « app native »

- Pas de zoom (pincement, double-tap, focus d'un champ) : viewport bloqué, `touch-action: manipulation`, champs en 16 px minimum.
- Pas de sélection de texte ni de menu « copier » à l'appui long, sauf dans les champs de saisie.
- Les éléments fixés à l'écran (barre de saisie, tiroirs) passent par `Fixed` / `Sheet` (portail) pour ne pas bouger avec l'animation d'entrée.
- Un tiroir ouvert bloque le défilement de la page derrière.
- Les boutons − / + accélèrent quand on reste appuyé.
