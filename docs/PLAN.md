# Plan de développement

> Chaque étape se termine par une validation explicite d'Adham. Aucune étape ne démarre avant que la précédente soit validée. Protocole : `VALIDATION.md`.

## Suivi

| # | Étape | Statut | Validée le |
| --- | --- | --- | --- |
| 1 | Squelette, contenu bilingue, fond | ✅ | 2026-09-03 |
| 2 | Scroll complet avec soleil | ⬜ | |
| 3 | RSVP Supabase | ⬜ | |
| 4 | Bridge et enveloppe | ⬜ | |
| 5 | Vidéo d'intro et raccord | ⬜ | |
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

**Objectif** : toutes les sections du site avec leur contenu, le soleil qui monte au scroll, les apparitions de texte. Pas d'intro, on arrive directement sur le hero.

**Livrables**
- Sections : hero, invitation, date/lieu + Maps, compte à rebours (statique), programme, infos pratiques, gift registry, RSVP (formulaire non branché), fin
- Soleil fixe en bas, ScrollTrigger scrub, plein au RSVP
- Apparitions fondu + translateY, une seule fois
- Typographies chargées (deux WOFF2 max)

**Critères de validation**
- Le scroll est fluide sur téléphone, sans à-coups
- Le soleil finit sa montée exactement à la section RSVP
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

## Étape 4 — Bridge et enveloppe

**Objectif** : les hirondelles apportent l'enveloppe, l'utilisateur ouvre le sceau, la carte devient le hero.

**Livrables**
- Machine à phases complète avec écran `gate` (sans vidéo : le tap mène au bridge)
- Timeline GSAP du bridge avec les découpes PNG (ou placeholders)
- Draggable sur le sceau, fallback tap, animation d'ouverture et de sortie de carte
- Scroll bloqué jusqu'à l'ouverture, `prefers-reduced-motion` respecté

**Critères de validation**
- Sur téléphone : tap, hirondelles, enveloppe, glissement du sceau, carte, scroll
- Impossible de scroller avant d'avoir ouvert
- Avec "réduire les animations" activé dans iOS, on arrive directement sur le hero

## Étape 5 — Vidéo d'intro et raccord

**Objectif** : le film joue après le tap et se termine sans coupure visible sur le bridge.

**Livrables**
- Préchargement pendant la gate, lecture au tap avec le son, bouton "passer" après 3 s
- Fondu vidéo vers DOM sur les 300 dernières ms, poster identique à la dernière image
- Musique Howler lancée au tap, continue sur le scroll
- Fallback poster si la vidéo échoue

**Critères de validation**
- La coupure vidéo/site est invisible sur téléphone
- Le son démarre au tap, pas avant
- Le bouton "revoir le film" en fin de page relance tout

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
- Images WebP, vidéo sous 5 Mo, polices en swap
- `vercel.json` si nécessaire, variables d'environnement documentées
- Lighthouse mobile

**Critères de validation**
- Lighthouse mobile > 85 en performance
- Le lien Vercel fonctionne sur un téléphone en 4G en moins de 3 s jusqu'à la gate
