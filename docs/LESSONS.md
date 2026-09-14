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

### Une section en `min-height: 100dvh` avec peu de contenu fait un écran de vide
- **Contexte** : fin de page, phrase de fin et demi-soleil poussés en bas d'une section haute d'un écran.
- **Symptôme** : sur téléphone, un écran entier de pêche vide avant la fin ; « pas cadré, bricolé ».
- **Cause** : `min-height: 100dvh` était un réflexe hérité du hero, où il a un sens. Ailleurs il crée du vide.
- **Règle** : une section fait la hauteur de son contenu. Seul le hero occupe l'écran.

### Sur iPhone, l'écran affiché peut dépasser `100lvh`
- **Contexte** : calque de fond fixe en `height: 100lvh` après la correction de la bande claire.
- **Symptôme** : une ligne de rupture derrière la barre de Safari, sans grain et d'une teinte proche.
- **Règle** : un calque fixe de fond déborde franchement sous le viewport (`bottom: -60vh`), le dégradé reste calé sur `100lvh` et le reste prend la teinte de fin. On ne fait pas confiance aux unités de viewport pour un bord d'écran.

### Un élément plus large que l'écran décale toute la page sur iOS
- **Contexte** : demi-soleil de fin en `min(118vw, 600px)`.
- **Symptôme** : sur iPhone, une bande vide à droite, tout le contenu paraît décalé vers la gauche. Rien en headless.
- **Cause** : iOS ignore `overflow-x: hidden` posé sur le body seul ; le débordement élargit le viewport de mise en page.
- **Règle** : aucun élément au-delà de 100 vw, et `overflow-x: clip` sur `html`. Vérifier `document.documentElement.scrollWidth === innerWidth` dans les tests.

### Le filtre de sortie de Seedance refuse les aplats couleur peau
- **Contexte** : film d'intro regénéré avec Seedance 2.5 (BytePlus ModelArk), plan 2 se terminant sur la carte pêche plein cadre.
- **Symptôme** : `OutputVideoSensitiveContentDetected` sur huit tentatives, en modes « références » comme « première/dernière image », alors que tout plan se terminant sur l'enveloppe passait.
- **Cause** : plusieurs secondes d'aplat lisse couleur pêche plein cadre ressemblent à un gros plan de peau pour le classifieur. Le sceau et ses initiales n'y étaient pour rien.
- **Règle** : ne jamais demander au modèle une image finale uniforme ; finir le plan avec un liseré visible (carte à 90 %) et une texture papier marquée, puis faire le plein cadre et le fondu en post-production. Une tâche refusée n'est pas facturée.

### Une tâche ModelArk en cours ne s'annule pas
- **Contexte** : sonde du filtre d'entrée en soumettant trois tâches de 4 s pour les annuler aussitôt.
- **Symptôme** : `DELETE` renvoie 409 dès que la tâche est passée en cours, moins d'une seconde après la création ; une tâche a abouti et a été facturée.
- **Règle** : pas de sonde par soumission. Le filtre d'entrée de la console et celui de l'API n'ont pas toujours le même verdict ; en cas de refus console, réessayer par l'API avant de changer l'image.

### La musique en Web Audio attend tout le fichier avant de jouer
- **Contexte** : musique lancée au tap via Howler en Web Audio, fichier de 2,4 Mo, film de 3,3 Mo préchargé en même temps.
- **Symptôme** : sur téléphone, la musique démarrait plusieurs minutes après le tap, une fois le film fini et le RSVP rempli.
- **Cause** : en Web Audio, Howler télécharge le fichier entier puis le décode avant la première note ; sur une connexion mobile partagée avec la vidéo, c'est long. `play()` reste en attente et part quand le fichier arrive.
- **Règle** : musique en flux (`html5: true`), fichier léger (96 kbit/s), préchargée dès la gate. Le Web Audio n'a de sens que pour des sons courts.

### Une pochette incrustée dans le mp3 retarde la première note
- **Contexte** : mp3 fourni avec une image de 1280 x 720 incrustée en tête de fichier (tag ID3, 480 Ko), copiée telle quelle par ffmpeg dans les exports.
- **Symptôme** : le navigateur ne lit les métadonnées qu'après avoir reçu une grande partie du fichier ; en flux, la musique part avec des secondes de retard.
- **Règle** : exporter l'audio avec `-vn -map_metadata -1`, en AAC m4a avec `-movflags +faststart` (en-tête en tête de fichier) et un mp3 propre en secours. Le Chromium de test ne décode pas l'AAC : vérifier la latence sur téléphone.
