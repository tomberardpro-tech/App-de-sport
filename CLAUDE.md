# Salle — app de suivi de salle et de diète

Web app installable (PWA) en React + TypeScript + Vite. Données stockées localement (zustand `persist` → localStorage, clé `salle-data`). Interface en français.

## Règles

- **Lire `DESIGN_SYSTEM.md` avant toute modification d'interface.** Utiliser les tokens de `src/styles/tokens.css` et les composants de `src/ds/`. Aucune couleur, arrondi ou taille en dur ; pas de nouvelle couleur sans l'ajouter aux tokens et au document.
- Un nouvel élément d'interface réutilisable va dans `src/ds/`, puis est documenté dans `DESIGN_SYSTEM.md`.
- Garder les micro-interactions cohérentes : `haptic()` sur les actions, `showToast()` pour confirmer, `celebrate()` réservé aux records.
- Si le format des données persistées change, incrémenter `version` dans `src/lib/store.ts` et ajouter une migration.

## Structure

- `src/styles/tokens.css` — tokens ; `src/index.css` — classes de base + animations
- `src/ds/` — composants et icônes
- `src/lib/` — types, store, calculs (`stats.ts`, `utils.ts`), données de départ (`seed.ts`), Open Food Facts (`off.ts`)
- `src/screens/` — Onboarding, Home (+ widgets, mode édition), Machines, MachineDetail, Diet, History, Settings

## Commandes

- `npm run dev` — serveur de dev
- `npm run build` — vérification TypeScript + build dans `dist/`
- `npm run preview` — sert le build
