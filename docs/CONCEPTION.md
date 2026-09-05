# Site de mariage A&L : conception technique

## 1. Le film (ce qu'on produit avant de coder)

Une seule vidéo montée, 9:16, environ 18 s, sans son intégré. Quatre clips :

| # | Clip | Source | Durée | Rôle |
|---|------|--------|-------|------|
| 1 | Oiseaux sur les vagues | Frames-to-Video sur la photo oiseaux | 6 s | Ouverture, mouvement |
| 2 | Mains sur la plage | Tournage réel ou Frames-to-Video | 5 s | Émotion, "nous" |
| 3 | Mains vers la lune | Frames-to-Video, start = photo lune, end = aplat pêche + soleil doré en bas | 5 s | Le pont : déjà sur fond pêche, c'est lui qui fait passer du réel au papier |
| 4 | Aplat pêche final | Dernière image du clip 3, tenue 1 s | 1 s | Point de raccord avec le site |

Le clip 3 est le plus important. Sa dernière image doit être identique au fond du site : même hex pêche, même grain, soleil doré à la même position que sur la carte. On exporte cette dernière image en PNG, elle devient le `poster` et le fond du hero. C'est ça qui rend la coupure vidéo/site invisible.

Montage dans Scenebuilder (Flow) ou n'importe quel éditeur. Exports :
- `intro-portrait.mp4` 1080x1920 H.264, cible 5 Mo max
- `intro-portrait.webm` AV1 ou VP9, même cadrage
- `intro-poster.png` (dernière image)
- Optionnel plus tard : `intro-landscape.mp4` 16:9 pour desktop

Musique : une seule piste, `theme.mp3` + `theme.ogg`, démarre au tap, continue sur le scroll, boucle avec fondu.

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
gate → intro → bridge → envelope → scroll
```

- **gate** : fond pêche, monogramme, "toucher pour ouvrir / tap to open". Le tap fait trois choses dans le même geste : débloque l'audio (Howler), demande la permission gyroscope (iOS l'exige dans un geste utilisateur), lance `video.play()`. La vidéo est préchargée pendant la gate (`preload="auto"`).
- **intro** : vidéo plein écran, `object-fit: cover`, `playsinline`, non muette après le tap. Bouton "passer" discret après 3 s. À `timeupdate` proche de la fin (dernières 300 ms), on rend visible le DOM hero derrière la vidéo avec exactement le poster en fond, puis on fond la vidéo à 0 en 400 ms. La vidéo est retirée du DOM ensuite.
- **bridge** : timeline GSAP, 4 s. Les deux hirondelles entrent par les bords, trajectoire courbe, battement d'ailes via 2 ou 3 images alternées. Elles déposent l'enveloppe au centre. Le soleil doré monte de 40 px. Scroll bloqué (`overflow: hidden` sur body).
- **envelope** : Draggable GSAP sur le sceau, axe vertical. Au-delà de 80 px de glissement (ou d'un tap simple, fallback), le sceau se fend (deux moitiés PNG qui s'écartent), le rabat s'ouvre, la carte glisse vers le haut, le ruban se déploie autour (scale 0.9 vers 1 + léger rebond). La carte devient le hero. Scroll débloqué.
- **scroll** : sections, voir 5.

`prefers-reduced-motion` : on saute intro, bridge et envelope, on arrive sur le hero directement. Même chose si la vidéo échoue à charger (fallback poster).

Rejouer : petit bouton en fin de page "revoir le film" qui remet la phase à `gate`.

## 5. Le scroll

Sections, dans l'ordre : hero (Save the Date) · invitation · photos d'enfance · date, heure, lieu, Maps · compte à rebours · programme · infos pratiques · gift registry · RSVP · fin (monogramme, soleil plein).

Effets, et seulement ceux-là :
- **Soleil qui monte** : un seul `sun-gold.png` fixé en bas de l'écran, ScrollTrigger scrub du haut de page jusqu'au haut de la section RSVP, translateY de +30 % vers 0. Position finale : la moitié haute du disque à l'écran (maquette 2), pour que le contenu qui passe dessus reste lisible. (Réglé à l'étape 2 avec la vraie découpe, `DECISIONS.md`.)
- **Lisibilité du texte sur le soleil**, deux règles solidaires (ajout du 2026-09-05, `DECISIONS.md`) : le haut de la découpe est fondu par un `mask-image` en dégradé, les rayons se dissolvent dans le fond pêche et le disque reste plein ; et tout texte de section porte un halo de la couleur du fond (deux `text-shadow` flous, aucun cadre). Les deux bornes du fondu sont des variables CSS sur `.sun`.
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
