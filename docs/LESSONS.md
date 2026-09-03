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
- **Règle** : tuile PNG en `position: fixed`, `background-position` animé par keyframes `steps()`.

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

(au fil de l'eau)
