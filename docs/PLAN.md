# Plan de développement

> Chaque étape se termine par une validation explicite d'Adham. Aucune étape ne démarre avant que la précédente soit validée. Protocole : `VALIDATION.md`.

## Suivi

| # | Étape | Statut | Validée le |
| --- | --- | --- | --- |
| 1 | Squelette, contenu bilingue, fond | ✅ | 2026-09-03 |
| 2 | Scroll complet avec soleil | 🟡 | |
| 3 | RSVP Supabase | ⬜ | |
| 4 | Intro au scroll : l'histoire en trois temps, dézoom vers la carte | 🟡 | |
| 5 | Fusionnée dans la 4 : plus de vidéo ni d'enveloppe (décision du 2026-09-12) | | |
| 6 | Finitions : gyroscope, hirondelles, compte à rebours | ⬜ | |
| 7 | Performance et mise en ligne | ⬜ | |

Légende : ⬜ à faire · 🟡 en cours · ✅ validée

---

## Étape 1 — Squelette, contenu bilingue, fond

**Objectif** : une page qui tourne, avec le fond pêche granuleux, le toggle FR/EN et tout le contenu dans un seul fichier.

**Livrables**
- Projet Vite + React + TS, ESLint, scripts `dev`, `build`, `lint`, `typecheck`
- `src/content/wedding.ts` rempli avec les textes visibles dans `docs/mockups/`
- Store Zustand : `phase`, `lang`
- Hook `useT()`, bouton FR/EN, langue par défaut depuis `navigator.language`, mémorisée en localStorage
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

## Étape 3 — RSVP Supabase

**Objectif** : le formulaire écrit dans Supabase.

**Livrables**
- `supabase/schema.sql` avec la table, RLS et la policy insert (section 7 de `CONCEPTION.md`) — Adham l'exécute
- Client Supabase, envoi, état chargement, message de confirmation bilingue, honeypot
- Gestion d'erreur lisible

**Critères de validation**
- Une réponse envoyée depuis le téléphone apparaît dans la table sur le dashboard Supabase
- Un second envoi sans nom est refusé avec un message clair
- La clé anon n'apparaît pas dans le dépôt

## Étape 4 — Intro au scroll

**Objectif** : après le tap de l'écran d'accueil, le scroll raconte l'histoire d'Adham et Lara en trois temps, puis la caméra recule et révèle la carte, qui est le hero. Remplace l'enveloppe et la vidéo (décision du 2026-09-12).

**Livrables**
- Atelier `tools/animation/` (Remotion) : une composition par temps, rendus validés par Adham avant portage
- Personnages doodle en cut-out (tête, buste, jambes), respiration, balancement décalé, tête qui suit le buste
- Section d'intro épinglée, une timeline GSAP pilotée par le scroll : temps 1, 2, 3, puis dézoom vers la carte
- Plans de décor en profondeur, placeholders SVG tant que les dessins ne sont pas là
- Écran `gate` (tap = musique), bouton « passer », `prefers-reduced-motion` = arrivée directe sur le hero
- Textes des trois temps dans `wedding.ts`

**Critères de validation**
- Sur téléphone, un mouvement de pouce traverse l'intro, un scroll lent la savoure, on peut remonter
- La carte finale est le hero au pixel près, sans saut
- Aucune couture visible sur les personnages, pas de saccade au scroll
- Avec « réduire les animations » on arrive directement sur le hero

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
