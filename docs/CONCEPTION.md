# Site de mariage A&L : conception technique

## 1. Le film (mis à jour le 2026-09-14)

Deux plans générés avec Seedance 2.5 (API BytePlus ModelArk, script `tools/video/seedance.py`, masters et prompts dans `assets/seedance/`), 9:16, 720p, 8 s chacun, en mode « première image + dernière image » : les images de début et de fin sont imposées, donc le raccord entre les plans est exact et le sceau n'est jamais redessiné.

- Plan 1, `video1-oiseaux-720p.mp4` : deux oiseaux apportent l'enveloppe au-dessus de la mer au soleil couchant, elle grandit jusqu'à remplir l'écran et devenir l'enveloppe pêche gaufrée fermée.
- Plan 2, `video2-enveloppe-720p.mp4` : le rabat se soulève avec le sceau de cire A&L intact, la carte pêche sort et s'arrête à 90 % du cadre.
- Fin faite en post-production (ffmpeg) : zoom de 0,5 s sur la dernière image jusqu'au plein cadre, puis fondu de 0,5 s vers le fond papier du site, tenu 0,8 s. Le filtre de sortie de ByteDance refuse toute vidéo qui se termine sur un aplat pêche plein cadre (pris pour de la peau), d'où cette fin hors modèle.

Fichier servi : `public/video/intro.mp4` (plans 1 et 2, 18 s, 3,3 Mo), H.264 CRF 23, sans piste audio. Une version courte (plan 2 seul) a été comparée le 2026-09-14 et écartée. Sa première image, `public/video/intro-poster.jpg`, sert de poster : c'est l'écran d'accueil, les oiseaux.

La dernière image est un dégradé pêche à moins de 5 % du fond du site. C'est ce qui rend la coupure invisible : sur les 450 dernières millisecondes, le hero s'imprime derrière la vidéo pendant qu'elle se fond en 700 ms.

Format : le 9:16 est affiché en `object-fit: cover` sur des téléphones en 9:19,5. La composition étant centrée et symétrique, le rognage des côtés ne coupe que des fleurs gaufrées. Sur un écran plus large qu'un 9:16 (ordinateur, tablette), le film reste dans un cadre 9:16 centré, pleine hauteur, le fond pêche remplissant les côtés (ajout du 2026-09-14).

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
- Howler.js : musique (en place depuis le 2026-09-14, lancée au tap de la gate)
- Google Sheet via une fonction Vercel : liste des invités et réponses RSVP (ADR-0003, ADR-0004)
- Pas de R3F, pas de Theatre.js, pas de postprocessing

## 4. Machine à phases

```
gate → intro → scroll
```

- **gate** : la vidéo arrêtée sur sa première image (son poster), les oiseaux qui apportent l'enveloppe. Dans la bande de ciel, un accueil léger (décision du 2026-09-16) : d'abord le choix de la langue en deux boutons (Français / English), puis le code d'invitation, un champ « votre prénom (facultatif) » et le bouton « Ouvrir ». Le code à 4 chiffres (ADR-0004) est lu dans le lien (`/4821` ou `?c=4821`, `src/lib/groupe.ts`) et vérifié auprès de `/api/rsvp` pendant que le film se télécharge : reconnu, on ne le voit jamais ; inconnu ou absent, un champ apparaît avec « pas de code ? écrivez-nous sur WhatsApp », et « Ouvrir » reste grisé tant qu'un code n'est pas reconnu (si le serveur ne répond pas, on ouvre quand même et le formulaire le redemandera). Le code reconnu est mémorisé (`code` dans le store) ; un lien avec un autre code l'emporte sur le code mémorisé. Le prénom est mémorisé (`prenom` dans le store, localStorage) et personnalise l'invitation, le formulaire (le mot de cette personne est déjà ouvert) et la phrase de fin ; vide, rien ne change. Le bouton FR/EN n'est pas affiché pendant l'accueil. Pendant ce temps, musique et film sont téléchargés en mémoire en parallèle (`src/lib/precharge.ts`, `fetch` en flux avec progression, puis blob), une fois le poster affiché : iOS ignore `preload="auto"`. « Ouvrir » reste grisé, avec le message « l'enveloppe est en route » et un trait de progression, tant que les deux ne sont pas là ; en cas d'échec ou après 30 s, il s'active et on lira en flux. Le tap lance `video.play()` et la musique dans le même geste (iOS l'exige), depuis les blobs : les deux partent ensemble. En revisite ou pour « revoir le film », l'accueil ne redemande rien : « Bonjour {prénom} » et « Ouvrir ».
- **intro** : vidéo plein écran, `object-fit: cover`, `playsinline`, muette. La musique (`public/audio/intro-loop.m4a`, mp3 en secours, le morceau à partir de 1 min 32 jusqu'à sa fin, en boucle, mise en mémoire pendant la gate en même temps que le film, Howler en lecture HTML5) part dans le geste du tap, jamais avant, et continue sur tout le site ; un bouton haut-parleur en haut à gauche la coupe. Pas de bouton pour passer (choix d'Adham). À `timeupdate` sur les 450 dernières ms, la phase passe à `scroll` : le hero s'imprime derrière (voir 5) pendant que la vidéo se fond en 700 ms, puis elle est retirée du DOM. Si la vidéo échoue, on arrive directement sur le hero, sans impression.
- **scroll** : sections, voir 5. Scroll bloqué (`html.is-locked`) tant qu'on n'y est pas, `ScrollTrigger.refresh()` au déblocage.

`prefers-reduced-motion` : l'accueil (langue, code, prénom) reste, « Ouvrir » est actif tout de suite et mène au hero directement, sans film ; la musique part quand même.

Rejouer : bouton « revoir le film » en fin de page, qui remonte l'intro à neuf (`rejouer()` dans le store, clé `tour` sur le composant).

## 5. Le scroll

Une seule page en plus : `/compte`, les coordonnées bancaires, ouverte depuis la liste de mariage (`src/pages/Compte.tsx`, choisie dans `main.tsx` sur le chemin, `vercel.json` la renvoie sur `index.html`).

Sections, dans l'ordre (croquis de Lara, 2026-09-13) : hero (Save the Date) · photos d'enfance · invitation · date, heure, lieu, Maps · compte à rebours · liste de mariage avec le dessin du couple · RSVP · fin (phrase, « revoir le film », demi-soleil dessiné avec les initiales gravées, `sun-end.png`).

Effets, et seulement ceux-là :
- **Impression de la carte** (arrivée depuis le film) : la carte dessinée d'un seul tenant (`card.png`, texte compris) se pose en se fondant (scale 1,06 → 1, 1,3 s), le petit soleil arrive en tournant (−120° → 0), le grand soleil monte du bas. Une timeline GSAP dans `Hero.tsx`. En arrivée directe, simple fondu. (L'atelier Remotion `tools/animation`, qui décrivait l'ancienne version en morceaux, a été retiré du dépôt le 2026-09-15.)
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
    gate: { open: { fr: "Ouvrir", en: "Open" }, firstName: { fr: "Votre prénom", en: "Your first name" } },
    invitation: { fr: "...", en: "With full hearts, we joyfully invite you to our wedding" },
    // etc. une clé par bloc de texte
  },
  registry: [{ label: { fr: "Cilya home", en: "Cilya home" }, url: "" }],
  bank: { holder: "", name: "", iban: "", swift: "" },
};
```

Langue : choisie à l'accueil (Français / English, décision du 2026-09-16 ; anglais par défaut avant ce choix, plus de détection du navigateur), puis bouton FR/EN en haut à droite pour changer, choix mémorisé en localStorage. Hook `useT()` qui renvoie la bonne clé. Le RSVP et ses messages d'erreur passent aussi par là.

## 7. RSVP par groupe (Google Sheet, ADR-0003 et ADR-0004)

Le Google Sheet d'Adham est la base, dans les deux sens : l'onglet « Invités » (une ligne par personne : Code, Groupe, Prénom, Nom, Présence, Mot, Répondu le, Langue) est la liste qu'Adham remplit et le tableau de bord qu'il lit ; l'onglet « Journal » garde une ligne par personne à chaque envoi. Les deux sont créés par le menu « RSVP » du Sheet (`tools/sheets/Code.gs`), qui génère aussi un code à 4 chiffres par groupe. La liste n'est jamais dans le dépôt.

Chemin d'une réponse :

1. L'accueil (ou le formulaire, si l'accueil est passé sans code reconnu) demande le groupe du code : `GET /api/rsvp?code=4821`, même origine. La fonction `api/rsvp.ts` interroge le script Apps Script (`action: chercher`) avec le secret partagé et renvoie le groupe seul (nom, membres, présences, mots), ou 404 après 0,8 s si le code est inconnu. Une seule recherche par visite (`src/lib/groupe.ts` la garde en cache), fraîche à chaque « Modifier ».
2. Le formulaire (`src/components/sections/Rsvp.tsx`) affiche la liste du groupe : pour chaque membre, Oui / Non (rien de coché au départ) et « Laisser un mot », qui déplie un champ ; le champ de la personne dont le prénom a été donné à l'accueil est déjà ouvert. Sous la liste, les deux notes (soirée entre adultes, personne supplémentaire par WhatsApp). Un seul envoi pour tout le groupe.
3. `POST /api/rsvp` avec le code et la liste des membres (présence obligatoire pour chacun, mot facultatif, au moins un mot dans le groupe, longueurs bornées). La fonction ignore les envois où le piège à robots est rempli, refuse tout après la clôture (fin du 15 décembre 2026, réponse 410 ; date dans `api/rsvp.ts` et `wedding.rsvpClosesAt`, à changer ensemble), et transmet au script (`action: repondre`), qui met à jour les lignes du groupe (une personne absente de l'onglet est ignorée : on ne crée jamais d'invité) et ajoute au Journal. Adresse et secret vivent dans les variables Vercel `RSVP_SHEET_URL` et `RSVP_SECRET`, jamais dans le navigateur.
4. Le site affiche le remerciement puis le récapitulatif (« votre réponse du 12 novembre », chaque membre avec son choix et son mot) et un bouton « Modifier », jusqu'à la clôture. Un membre qui revient voit le récapitulatif, modifie, ajoute son mot, renvoie : les autres mots restent. Il manque une réponse ou tout mot : une fenêtre par-dessus le formulaire nomme les manques (« la réponse de Kadi », « un mot de l'un d'entre vous »), le curseur se pose sur le premier et les manques restent soulignés jusqu'à l'envoi suivant.

Les places sont comptées par groupe (décision du 2026-09-16) : pas de nom libre, une personne en plus se demande sur WhatsApp. Pas de limitation de débit au-delà du délai sur code faux : 10 000 codes pour une centaine de groupes, piège à robots et bornes de taille suffisent.

En local, `vite` ne sert pas `api/` : la fonction se teste avec le serveur de test du scratchpad, qui l'empaquette et simule le script Google avec quelques groupes.

Adresse publique : `https://adhamlara-wedding.online` (domaine Namecheap, DNS chez Vercel), `wedding-card-lyart-beta.vercel.app` en secours. Le site est marqué non indexable. Le lien envoyé à chaque groupe porte son code : `https://adhamlara-wedding.online/4821` (`vercel.json` renvoie `/:code(4 chiffres)` sur `index.html`).

## 8. Performance

- Vidéo préchargée pendant la gate, jamais en autoplay avant le tap
- Toutes les images en WebP sauf les découpes transparentes (PNG, compressées)
- Polices : deux fichiers WOFF2 max (une serif italique, une serif texte), `font-display: swap`
- GSAP uniquement sur transform et opacity
- Cible : Lighthouse mobile > 85, première interaction < 2 s sur 4G

## 9. Ordre de réalisation pour Claude Code

1. Squelette : Vite, routes de phase, store Zustand, fichier de contenu, i18n, fond pêche + grain
2. Scroll complet avec tous les contenus et le soleil qui monte (sans vidéo)
3. RSVP Google Sheet
4. Bridge et enveloppe (avec des placeholders PNG si les découpes ne sont pas prêtes)
5. Intégration vidéo et raccord poster
6. Gyroscope, hirondelles au scroll, compte à rebours animé
7. Optimisation et déploiement Vercel

Chaque étape doit être déployable seule. La vidéo arrive en dernier parce que c'est l'asset qui prendra le plus de temps à produire.
