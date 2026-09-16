# Plan de développement

> Chaque étape se termine par une validation explicite d'Adham. Aucune étape ne démarre avant que la précédente soit validée. Protocole : `VALIDATION.md`.

## Suivi

| # | Étape | Statut | Validée le |
| --- | --- | --- | --- |
| 1 | Squelette, contenu bilingue, fond | ✅ | 2026-09-03 |
| 2 | Scroll complet avec soleil | ✅ | 2026-09-13 |
| 3 | RSVP Google Sheet | ✅ | 2026-09-16 |
| 4 | Film d'intro et raccord | 🟡 | |
| 5 | Fusionnée dans la 4 : l'enveloppe est dans le film (décision du 2026-09-12) | | |
| 6 | Finitions : gyroscope, hirondelles, compte à rebours | ⬜ | |
| 7 | Performance et mise en ligne | 🟡 | |

Légende : ⬜ à faire · 🟡 en cours · ✅ validée

---

## Étape 1 — Squelette, contenu bilingue, fond

**Objectif** : une page qui tourne, avec le fond pêche granuleux, le toggle FR/EN et tout le contenu dans un seul fichier.

**Livrables**
- Projet Vite + React + TS, ESLint, scripts `dev`, `build`, `lint`, `typecheck`
- `src/content/wedding.ts` rempli avec les textes visibles dans `docs/mockups/`
- Store Zustand : `phase`, `lang`
- Hook `useT()`, bouton FR/EN, langue par défaut anglais (détection du navigateur retirée le 2026-09-13), mémorisée en localStorage
- Fond pêche dégradé + grain animé, colonne 480 px centrée sur desktop
- `.env.example`, `.gitignore`, `.claude/settings.json`

**Critères de validation**
- `npm run dev` affiche la page sur le téléphone via l'IP locale
- Le toggle change tous les textes affichés
- Le grain bouge doucement et ne fait pas chuter le défilement
- Console navigateur vide

## Étape 2 — Scroll complet avec soleil

**Objectif** : toutes les sections du site avec leur contenu, le soleil posé sur la page, les apparitions de texte. Pas d'intro, on arrive directement sur le hero.

**Livrables**
- Sections : hero, invitation, date/lieu + Maps, compte à rebours (statique), programme, infos pratiques, gift registry, RSVP (formulaire non branché), fin
- Soleil immobile posé à cheval sur le bas du hero, moitié visible au premier écran
- Apparitions fondu + translateY, une seule fois
- Typographies chargées (deux WOFF2 max)

**Critères de validation**
- Le scroll est fluide sur téléphone, sans à-coups
- Au premier écran on voit la moitié du soleil, le reste se découvre au scroll sans qu'il bouge, et il ne réapparaît plus une fois dépassé
- Chaque section correspond à sa maquette en esprit (pas au pixel)

## Étape 3 — RSVP Google Sheet

**Objectif** : le formulaire ajoute une ligne au Google Sheet d'Adham (ADR-0003, `CONCEPTION.md` §7).

**Livrables**
- `api/rsvp.ts` : validation, piège à robots, clôture au 15 décembre, transmission au script
- `tools/sheets/Code.gs` : script à coller dans le Sheet, avec ses étapes d'installation — Adham le publie
- Formulaire branché : prénom, nom, présence, message obligatoire, envoi, états chargement / merci / erreur / clos, bilingue
- `.env.example` : `RSVP_SHEET_URL`, `RSVP_SECRET`

**Critères de validation**
- Une réponse envoyée depuis le téléphone apparaît dans le Sheet
- Un envoi avec un champ vide est refusé avec un message clair, sans rien écrire
- Aucune adresse ni secret dans le dépôt ni dans le navigateur

**Validée le 2026-09-16** : envoi de test depuis le téléphone d'Adham arrivé dans le Sheet, fusion dans `main`, fonction de production vérifiée.

## Étape 4 — Film d'intro et raccord

**Objectif** : après le tap de l'écran d'accueil, le film de l'enveloppe joue et se termine sans coupure visible sur le hero, où la carte s'imprime. Remplace l'enveloppe DOM et l'intro au scroll (décisions du 2026-09-12).

**Livrables**
- `public/video/intro.mp4` sans piste audio et son poster, référencés dans `assets.ts`
- Machine à phases `gate → intro → scroll`, écran d'accueil sur l'enveloppe fermée, pas de bouton « passer », scroll bloqué jusqu'à la fin
- Raccord : hero imprimé sur les 300 dernières ms, vidéo fondue en 700 ms, fallback direct si la vidéo échoue
- Impression de la carte en GSAP dans `Hero.tsx`
- Bouton « revoir le film » en fin de page
- `prefers-reduced-motion` = arrivée directe sur le hero

**Critères de validation**
- Sur téléphone : tap, film, la carte s'imprime sur le papier sans saut visible, scroll
- Impossible de scroller avant la fin du film
- « Revoir le film » relance tout depuis l'écran d'accueil
- Avec « réduire les animations » on arrive directement sur le hero
- Console vide

**Où on en est (2026-09-14)** : film regénéré avec Seedance 2.5 en deux plans, fin en post-production, version complète de 18 s retenue et fusionnée dans `main`.

## Étape 6 — Finitions

**Livrables**
- Parallaxe gyroscope sur le hero (permission demandée dans le tap de la gate), suivi souris sur desktop
- Une hirondelle traverse à chaque entrée de section
- Compte à rebours animé chiffre par chiffre

**Critères de validation**
- Incliner le téléphone déplace soleil, carte et ruban à des vitesses différentes
- Pas de saccade au scroll après ajout des hirondelles

## Étape 7 — Performance et mise en ligne

**Livrables**
- Images WebP, polices en swap
- `vercel.json` si nécessaire, variables d'environnement documentées
- Lighthouse mobile

**Critères de validation**
- Lighthouse mobile > 85 en performance
- Le lien Vercel fonctionne sur un téléphone en 4G en moins de 3 s jusqu'à l'écran d'accueil

**Où on en est (2026-09-15)** : ménage du dépôt, en-têtes de sécurité et de cache dans `vercel.json`, `noindex` et aperçu de lien dans `index.html`. Images gardées en PNG (DECISIONS.md). Poster de l'accueil allégé et fonction RSVP à Paris (2026-09-16). Reste : mesure Lighthouse sur la version en ligne et test 4G.
