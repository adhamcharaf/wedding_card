# ADR-0001 — Pile technique

- **Date** : 2026-09-03
- **Statut** : accepté
- **Décideurs** : Adham, avec Claude (planification)

## Contexte

Faire-part de mariage numérique, un seul développeur assisté par IA, mise en ligne visée bien avant janvier 2027. Le rendu doit être premium et sobre, 60 fps sur mobile milieu de gamme, sans coût d'outils commerciaux.

## Décision

Vite + React + TypeScript, GSAP (ScrollTrigger, Draggable), Zustand, Howler.js, Supabase pour le RSVP, Vercel pour l'hébergement. L'intro est une vidéo pré-produite (Google Flow / Veo, tournage réel pour les mains), pas une scène 3D temps réel. Les transitions et l'enveloppe sont en 2D (PNG + GSAP).

## Alternatives envisagées

| Option | Avantages | Inconvénients | Écartée parce que |
| --- | --- | --- | --- |
| React Three Fiber + Theatre.js + postprocessing | tout temps réel, interactif | assets 3D à produire sans Blender, performance mobile incertaine, temps de dev élevé | le rendu cinéma est plus sûr et plus beau en vidéo, pour une fraction du coût |
| Next.js | conventions, images optimisées | SEO inutile, complexité inutile | site 100 % client |
| Framer Motion à la place de GSAP | API React | pas de ScrollTrigger équivalent, pas de Draggable | GSAP couvre scroll, drag et timelines |
| Formulaire RSVP via Google Forms | zéro backend | rupture visuelle, pas de style | Supabase insert-only reste simple |

## Conséquences

**Positives** : pas de pipeline 3D, un seul système d'animation, déploiement trivial.
**À surveiller** : poids de la vidéo, raccord vidéo/DOM, permissions iOS (son, gyroscope).

## Révision

À reconsidérer si la vidéo générée ne tient pas la qualité visée après les tests Flow, ou si la personnalisation par invité devient nécessaire (elle imposerait un routage par lien).
