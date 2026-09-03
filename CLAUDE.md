# CLAUDE.md

> Fichier de référence du projet, lu à chaque session. Court : des pointeurs, pas des copier-collers.

## Contexte

Faire-part de mariage numérique pour Adham & Lara (8 janvier 2027, Abidjan). Un seul lien public, pas de personnalisation par invité. Site 100 % client, mobile first, bilingue FR/EN. Expérience : un film d'intro, une enveloppe qu'on ouvre, puis un scroll sobre avec les infos et un RSVP. Détail complet dans `docs/CONCEPTION.md`.

## Stack (ADR-0001)

Vite + React + TypeScript · GSAP (ScrollTrigger, Draggable) · Zustand · Howler.js · Supabase (RSVP) · Vercel. Pas de 3D, pas de meta-framework.

## Démarrage local

    npm install
    cp .env.example .env
    npm run dev

## Règles impératives

### TOUJOURS
- Annoncer le plan de l'étape et attendre l'accord avant d'écrire du code (`docs/VALIDATION.md`).
- Une étape à la fois, dans l'ordre de `docs/PLAN.md`.
- Tout texte visible vit dans `src/content/wedding.ts` avec des clés `{ fr, en }`. Aucune chaîne dans les composants.
- Animer uniquement `transform` et `opacity`. Seuls les effets listés dans `docs/CONCEPTION.md` existent.
- Respecter `prefers-reduced-motion`.
- Asset manquant = placeholder nommé dans `public/placeholders/`, jamais un blocage.
- Consigner chaque erreur comprise dans `docs/LESSONS.md`, immédiatement.

### JAMAIS
- Committer un secret. `.env.example` documente les variables, jamais les valeurs.
- Déployer, créer un projet Supabase ou Vercel, ou exécuter du SQL sur Supabase : tu génères, Adham applique.
- Ajouter une dépendance hors stack sans demander.
- Lancer vidéo ou audio avant le tap sur l'écran d'accueil.
- Élargir le périmètre d'une étape : tu t'arrêtes et tu le signales.
- Rediscuter une décision actée dans `docs/adr/`.

## Frontière humain / IA

| Interdit à l'assistant | Qui le fait |
| --- | --- |
| Exécuter du SQL sur Supabase | Adham, depuis le SQL Editor |
| Déployer sur Vercel | Adham (push sur `main` = déploiement auto) |
| Créer des comptes ou clés externes | Adham |
| Produire ou choisir les assets (vidéo, PNG, musique) | Adham |

## Avant d'agir, consulter

| Situation | Document |
| --- | --- |
| Avant de coder quoi que ce soit | `docs/LESSONS.md` |
| Ce qu'on construit et comment | `docs/CONCEPTION.md` |
| Où on en est | `docs/PLAN.md` |
| Comment une étape se valide | `docs/VALIDATION.md` |
| Décisions d'architecture | `docs/adr/` |
| Questions non tranchées | `docs/points-ouverts.md` |
| Direction visuelle | `docs/mockups/` |

## Ton attendu

- Concis. Pas de reformulation de la demande.
- Choix techniques expliqués en une ou deux phrases, en français simple.
- Désaccord signalé plutôt qu'exécuté en silence.
- Une étape à la fois, avec ses critères de validation et une procédure de vérification suivable sur téléphone.
