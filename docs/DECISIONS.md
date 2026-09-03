# Décisions prises en chemin

> Décisions de mise en œuvre, prises pendant une étape et validées par Adham. Les décisions d'architecture restent dans `adr/`.

| Date | Étape | Décision | Pourquoi |
| --- | --- | --- | --- |
| 2026-09-03 | 1 | Dépôt déplacé hors de OneDrive, dans `C:\Users\adham\projet\al-wedding` | `node_modules` synchronisé = lenteurs et verrous EPERM avec npm et Vite. |
| 2026-09-03 | 1 | Branche `master` renommée `main` | `CLAUDE.md` : push sur `main` = déploiement Vercel. |
| 2026-09-03 | 1 | Grain animé par `transform` sur un calque débordant d'une tuile, pas par `background-position` | Respecte la règle transform/opacity de `CLAUDE.md`, évite un repaint plein écran 8 fois par seconde. `CONCEPTION.md` et `LESSONS.md` mis à jour. |
| 2026-09-03 | 1 | ESLint conservé alors que le template create-vite 9 livre oxlint | `PLAN.md` prévoit ESLint. Config reprise de l'ancien template react-ts : typescript-eslint, react-hooks, react-refresh. |
| 2026-09-03 | 1 | Phase initiale du store : `scroll` | Pas d'écran d'accueil avant l'étape 4. Passera à `gate` à ce moment-là. |
| 2026-09-03 | 1 | Langue mémorisée par le middleware `persist` de Zustand, clé localStorage `al-wedding`, seule `lang` persistée | Inclus dans Zustand, pas de dépendance. La phase repart de zéro à chaque visite. |
| 2026-09-03 | 1 | Fins de ligne LF forcées par `.gitattributes` | Git sur Windows convertissait en CRLF et avertissait à chaque commit. |
| 2026-09-03 | 1 | Tuile de grain placeholder générée procédurellement : 256 px, gris + alpha, 31 Ko | Asset manquant = placeholder nommé. Le générateur reste hors dépôt, l'asset définitif vient de la maquette. |
| 2026-09-03 | 1 | Favicon placeholder SVG dans `public/placeholders/` | Même règle. Le `<title>` reste « Adham & Lara », identique dans les deux langues. |
