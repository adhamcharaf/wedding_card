# Site de mariage A&L : conception technique

## 1. Le film (mis à jour le 2026-09-12)

Une seule vidéo générée, 9:16, 8 s : une enveloppe pêche gaufrée, le sceau de cire A&L, le rabat qui s'ouvre, la carte qui sort et remplit l'écran, jusqu'à un aplat pêche texturé. Fichier `public/video/intro.mp4`, 720 x 1280 H.264, 2,3 Mo, piste audio retirée (pas de son pour l'instant). Sa première image, `public/video/intro-poster.jpg`, sert de poster : c'est l'enveloppe fermée de l'écran d'accueil.

La dernière image est un dégradé pêche à moins de 5 % du fond du site (#f4c286 en haut, #e6965d en bas). C'est ce qui rend la coupure invisible : sur les 300 dernières millisecondes, le hero s'imprime derrière la vidéo pendant qu'elle se fond en 700 ms.

Format : le 9:16 est affiché en `object-fit: cover` sur des téléphones en 9:19,5. La composition étant centrée et symétrique, le rognage des côtés ne coupe que des fleurs gaufrées.

L'enveloppe, le sceau et la sortie de la carte sont dans la vidéo : il n'y a plus de phases DOM `bridge` ni `envelope`, ni de découpes d'hirondelles, d'enveloppe ou de sceau.

## 2. Découpes PNG à préparer

Toutes en PNG transparent, exportées depuis la maquette :
- `swallow-left.png`, `swallow-right.png` (les deux hirondelles roses du cœur)
- `envelope-closed.png`, `envelope-open.png` (ou enveloppe + rabat séparé)
- `seal.png` (sceau de cire A&L)
- `sun-gold.png` (soleil baroque, entier)
- `ribbon.png` (le cadre ruban bleu/rouge, sans le papier)
- `heart.png` (le cœur folklorique, sans les hirondelles)
- `paper-grain.png` (tuile 512x512 de grain, fond transparent)
- Icônes ligne : horloge, pin, cœur couple (SVG)

## 3. Stack

- Vite + React + TypeScript
- GSAP + ScrollTrigger + Draggable (enveloppe, scroll, hirondelles)
- Zustand : une seule store, la phase
- Howler.js : musique
- Supabase : table RSVP
- Pas de R3F, pas de Theatre.js, pas de postprocessing

## 4. Machine à phases

```
gate → intro → scroll
```

- **gate** : l'enveloppe fermée, c'est-à-dire la vidéo arrêtée sur sa première image (son poster), avec « toucher pour ouvrir / tap to open » posé sous le sceau, en brun avec un halo crème pour rester lisible sur le papier gaufré. Toute la surface est le bouton. Pendant la gate, le fichier vidéo est téléchargé en mémoire (`fetch` puis blob), car iOS ignore `preload="auto"` : le tap lance `video.play()` dans le même geste (iOS l'exige) depuis le blob, sans attendre le réseau, et débloquera l'audio le jour où il y en aura. Le bouton FR/EN reste accessible au-dessus.
- **intro** : vidéo plein écran, `object-fit: cover`, `playsinline`, muette. Pas de bouton pour passer (choix d'Adham, le film fait 8 s). À `timeupdate` sur les 300 dernières ms, la phase passe à `scroll` : le hero s'imprime derrière (voir 5) pendant que la vidéo se fond en 700 ms, puis elle est retirée du DOM. Si la vidéo échoue, on arrive directement sur le hero, sans impression.
- **scroll** : sections, voir 5. Scroll bloqué (`html.is-locked`) tant qu'on n'y est pas, `ScrollTrigger.refresh()` au déblocage.

`prefers-reduced-motion` : on saute gate et intro, on arrive sur le hero directement.

Rejouer : bouton « revoir le film » en fin de page, qui remonte l'intro à neuf (`rejouer()` dans le store, clé `tour` sur le composant).

## 5. Le scroll

Sections, dans l'ordre (croquis de Lara, 2026-09-13) : hero (Save the Date) · photos d'enfance · invitation · date, heure, lieu, Maps · compte à rebours · liste de mariage avec le dessin du couple · RSVP · fin (phrase, « revoir le film », demi-soleil avec les initiales dans le disque).

Effets, et seulement ceux-là :
- **Impression de la carte** (arrivée depuis le film) : le ruban se pose (scale 1,4 → 1, fondu, 1,2 s), le cœur descend avec un léger rebond, le petit soleil arrive en tournant (−120° → 0), le grand soleil monte du bas, les lignes de texte s'écrivent en cascade. Une timeline GSAP dans `Hero.tsx`, réglée dans l'atelier `tools/animation` (`Impression.tsx`). En arrivée directe, simple fondu.
- **Soleil posé sous la carte** : un seul `sun-gold.png`, immobile, accroché au bas du ruban (`--sun-gap`), donc à la même place par rapport à la carte quelle que soit la taille de l'écran. On en voit le haut au premier écran, le reste se découvre en descendant sans qu'il bouge ; une fois dépassé, il ne revient pas. Il n'y a plus de soleil au-delà du hero. Largeur 78 % de l'écran (`--sun-size`). Aucune animation, aucun ScrollTrigger.
- **Lisibilité sur le soleil** : réglée par l'espacement, pas par un effet. Le padding bas du hero réserve exactement la place du soleil, donc aucun texte ne passe sur l'or. Ni fondu, ni halo (décision du 2026-09-05, `DECISIONS.md`).
- **Hirondelle qui traverse** : un ScrollTrigger par entrée de section, une hirondelle passe une fois, toujours de gauche à droite, 1,2 s.
- **Grain** : `paper-grain.png` répété sur un calque fixe qui déborde d'une tuile à droite et en bas, déplacé par `transform: translate3d` en CSS keyframes (8 positions, `steps`), opacité 0.15. Seul `transform` est animé, jamais `background-position` (décision de l'étape 1, `DECISIONS.md`). Pas de `feTurbulence` SVG, trop lourd sur mobile.
- **Parallaxe gyroscope** sur le hero : `deviceorientation`, gamma/beta lissés, soleil, carte, ruban à trois amplitudes (4, 8, 12 px). Désactivé sur desktop, remplacé par un suivi souris léger.
- **Compte à rebours** : chiffres qui défilent verticalement à chaque changement (GSAP), pas de flip 3D.
- **Photos d'enfance qui sautillent** (ajout du 2026-09-03, `DECISIONS.md`) : section « These two are getting married » entre l'invitation et la date. Les deux photos oscillent de ±4° autour du pied avec un petit saut à chaque changement d'appui, en alternance, CSS keyframes sur `transform`, cycle de 1,4 s, en pause hors écran, désactivé sous `prefers-reduced-motion`.
- Apparition des textes : fondu + 12 px de translateY, une fois, pas de répétition au retour.

Desktop : le site reste une colonne mobile de 480 px max, centrée sur un fond pêche plein écran avec le grain. Pas de mise en page desktop spécifique en V1.

## 6. Contenu et bilingue

Un seul fichier `src/content/wedding.ts`. Aucune chaîne dans les composants.

```ts
export const wedding = {
  couple: { a: "Adham", b: "Lara", monogram: "A&L" },
  date: "2027-01-08T20:30:00+00:00",
  venue: { name: "Indian by nature", city: { fr: "Abidjan, Côte d'Ivoire", en: "Abidjan, Ivory Coast" }, mapsUrl: "" },
  text: {
    gate: { fr: "Toucher pour ouvrir", en: "Tap to open" },
    invitation: { fr: "...", en: "With full hearts, we joyfully invite you to our wedding" },
    // etc. une clé par bloc de texte
  },
  registry: [{ label: { fr: "Cilya's home", en: "Cilya's home" }, url: "" }],
  program: [{ time: "20:30", label: { fr: "", en: "" } }],
};
```

Langue : `navigator.language` au premier chargement, bouton FR/EN en haut à droite, choix mémorisé en localStorage. Hook `useT()` qui renvoie la bonne clé. Le RSVP et ses messages d'erreur passent aussi par là.

## 7. RSVP (Supabase)

Table `rsvp` :

```sql
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  attending boolean not null,
  guests int default 0 check (guests between 0 and 6),
  message text,
  lang text
);
alter table rsvp enable row level security;
create policy "anon insert" on rsvp for insert to anon with check (true);
```

Aucune policy de lecture pour anon : le formulaire écrit, personne ne lit depuis le site. Vous consultez dans le dashboard Supabase. Clé anon dans `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Champ honeypot caché contre les bots, désactivation du bouton pendant l'envoi, message de confirmation bilingue.

## 8. Performance

- Vidéo préchargée pendant la gate, jamais en autoplay avant le tap
- Toutes les images en WebP sauf les découpes transparentes (PNG, compressées)
- Polices : deux fichiers WOFF2 max (une serif italique, une serif texte), `font-display: swap`
- GSAP uniquement sur transform et opacity
- Cible : Lighthouse mobile > 85, première interaction < 2 s sur 4G

## 9. Ordre de réalisation pour Claude Code

1. Squelette : Vite, routes de phase, store Zustand, fichier de contenu, i18n, fond pêche + grain
2. Scroll complet avec tous les contenus et le soleil qui monte (sans vidéo)
3. RSVP Supabase
4. Bridge et enveloppe (avec des placeholders PNG si les découpes ne sont pas prêtes)
5. Intégration vidéo et raccord poster
6. Gyroscope, hirondelles au scroll, compte à rebours animé
7. Optimisation et déploiement Vercel

Chaque étape doit être déployable seule. La vidéo arrive en dernier parce que c'est l'asset qui prendra le plus de temps à produire.
