# Leçons : erreurs à ne plus reproduire

> À lire avant de coder, à chaque session. Une entrée dès qu'une erreur est comprise.

## Format

### Titre court
- **Contexte** : où et quand.
- **Symptôme** : ce qu'on a observé.
- **Cause** : la vraie raison.
- **Règle** : ce qu'on fait désormais.

---

## Pièges connus d'avance

### La vidéo ne démarre pas sur iPhone
- **Contexte** : lecture de l'intro.
- **Symptôme** : écran noir ou lecture en plein écran natif.
- **Cause** : iOS exige `playsinline`, et une lecture avec son doit être déclenchée dans un geste utilisateur.
- **Règle** : `<video playsinline preload="auto">`, `video.play()` appelé directement dans le handler du tap de la gate, jamais dans un `setTimeout` ou après un `await`.

### L'audio Howler reste muet sur iOS
- **Contexte** : musique lancée après le tap.
- **Symptôme** : rien ne se passe, aucune erreur.
- **Cause** : le contexte audio n'est débloqué que dans le geste lui-même.
- **Règle** : `Howler.ctx.resume()` puis `sound.play()` dans le même handler de tap que la vidéo.

### Le gyroscope ne répond pas sur iPhone
- **Contexte** : parallaxe sur le hero.
- **Symptôme** : aucun événement `deviceorientation`.
- **Cause** : iOS 13+ exige `DeviceOrientationEvent.requestPermission()` dans un geste utilisateur, et uniquement en HTTPS.
- **Règle** : demander la permission dans le tap de la gate. Sur `localhost` en HTTP depuis le téléphone, ça ne marchera pas : tester sur une preview Vercel.

### ScrollTrigger décalé après chargement
- **Contexte** : soleil qui monte, apparitions.
- **Symptôme** : les déclencheurs se font au mauvais endroit.
- **Cause** : polices, images ou vidéo modifient la hauteur de page après l'init.
- **Règle** : `ScrollTrigger.refresh()` après `document.fonts.ready` et après le déblocage du scroll. Dimensions réservées sur les images (`aspect-ratio`).

### La coupure vidéo/site est visible
- **Contexte** : fin de l'intro.
- **Symptôme** : un flash ou un saut de couleur.
- **Cause** : le poster n'est pas la dernière image exacte, ou l'encodage a décalé les couleurs, ou l'écran du téléphone n'a pas le même rendu que le PNG.
- **Règle** : le poster est extrait du MP4 encodé, pas du montage. Le fondu se fait sur 300 à 400 ms, pas en coupe sèche.

### Grain SVG qui tue les performances
- **Contexte** : fond papier.
- **Symptôme** : scroll saccadé sur téléphone.
- **Cause** : `feTurbulence` recalculé à chaque frame.
- **Règle** : tuile PNG répétée sur un calque fixe qui déborde d'une tuile, déplacé par `transform` en keyframes `steps()`. Jamais `background-position` : c'est un repaint plein écran à chaque pas, contraire à la règle transform/opacity de `CLAUDE.md`.

### Variables d'environnement Vite invisibles
- **Contexte** : Supabase.
- **Symptôme** : `undefined` au runtime.
- **Cause** : Vite n'expose que les variables préfixées `VITE_`, lues au build.
- **Règle** : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, et relancer `npm run dev` après modification du `.env`.

### Insert Supabase refusé
- **Contexte** : RSVP.
- **Symptôme** : erreur 401 ou 42501.
- **Cause** : RLS activé sans policy insert pour `anon`, ou colonne non nullable non renseignée.
- **Règle** : la policy est dans `supabase/schema.sql`, on vérifie qu'elle est appliquée avant de chercher dans le code.

### Draggable GSAP bloque le scroll
- **Contexte** : sceau de l'enveloppe.
- **Symptôme** : impossible de scroller après ouverture, ou geste capturé ailleurs.
- **Cause** : Draggable reste actif, ou `touch-action` non rétabli.
- **Règle** : `draggable.kill()` après ouverture et retirer `overflow: hidden` du body dans le même callback.

## Erreurs rencontrées sur le projet

### Le fond fixe recouvre le texte
- **Contexte** : étape 1. Le calque de fond (`position: fixed; z-index: 0`) est rendu par React à l'intérieur de `#root`, avant le contenu.
- **Symptôme** : monogramme et paragraphes invisibles alors qu'ils existent dans le DOM avec les bons styles. Seuls les éléments en `opacity` < 1 ou `position: fixed` s'affichent.
- **Cause** : ordre de peinture CSS. Dans un contexte d'empilement, un élément positionné en `z-index: 0` est peint après le contenu en flux non positionné, donc par-dessus. Un élément en `opacity` < 1 crée son propre contexte et repasse au-dessus, ce qui masque le problème.
- **Règle** : le fond est en `z-index: -1` dans `#root` isolé (`isolation: isolate`). Et on vérifie le rendu réel (capture headless ou téléphone), pas seulement le DOM : `getBoundingClientRect` ne dit pas si un élément est visible.

### Le chiffre 1 ressemble à un i
- **Contexte** : étape 2, compte à rebours et sélecteur du RSVP en Cormorant Garamond.
- **Symptôme** : « 1 » rendu comme un petit i sans point, « 126 » avec des chiffres qui dansent.
- **Cause** : Cormorant utilise par défaut des chiffres elzéviriens, à hauteur de bas de casse.
- **Règle** : `font-variant-numeric: lining-nums` sur le body, `tabular-nums` là où les chiffres changent (compte à rebours).

### Un heredoc bash groupé rejeté avant exécution
- **Contexte** : étape 1, écriture de huit fichiers sources en un seul script bash avec des heredocs.
- **Symptôme** : `unexpected EOF while looking for matching quote`, aucun fichier écrit.
- **Cause** : le script entier est analysé avant d'être exécuté ; une apostrophe dans un commentaire ou un texte français suffit à casser l'analyse hors des heredocs.
- **Règle** : un fichier par écriture, avec l'outil d'écriture dédié, jamais un script bash groupé pour du contenu avec des apostrophes.

### Le Chromium de l'environnement ne lit pas le H.264
- **Contexte** : étape 4, test du film d'intro sous Playwright, et rendus Remotion dans `tools/animation`.
- **Symptôme** : la balise vidéo passe en erreur avant le tap, la gate disparaît aussitôt ; Remotion refuse de démarrer le navigateur « Old Headless mode has been removed ».
- **Cause** : le Chromium de Playwright n'embarque pas les codecs propriétaires, et Remotion attend le binaire `headless_shell`, pas `chrome`.
- **Règle** : pour tester le parcours, servir un WebM VP9 équivalent à la place du MP4 via `page.route` ; pour Remotion, `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Le vrai H.264 se valide sur téléphone.

### Le film démarre avec un temps mort au tap
- **Contexte** : étape 4, écran d'accueil sur l'enveloppe fermée, `play()` au tap.
- **Symptôme** : au tap, un blanc d'une demi-seconde, « comme un changement de page », puis le film part.
- **Cause** : iOS Safari ignore `preload="auto"` et ne télécharge que les métadonnées ; les octets partent au moment de `play()`.
- **Règle** : télécharger la vidéo en mémoire pendant la gate (`fetch` → blob → `URL.createObjectURL`), une fois par visite, et lire depuis le blob. Élargir la fenêtre de raccord à 0,45 s : `timeupdate` ne tombe que 4 fois par seconde sur iOS.
