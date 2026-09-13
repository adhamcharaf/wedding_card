/**
 * Chemins des images. Les découpes définitives vivent dans public/images/,
 * les provisoires dans public/placeholders/. Quand une découpe arrive, on
 * change le chemin ici, une ligne par asset, sans toucher aux composants.
 * Les dimensions servent à réserver la place avant le chargement
 * (docs/LESSONS.md, « ScrollTrigger décalé après chargement »).
 */
export const assets = {
  sun: { src: '/images/sun-gold.png', width: 968, height: 957 },
  heart: { src: '/images/heart.png', width: 473, height: 539 },
  ribbon: { src: '/images/ribbon.png', width: 943, height: 1223 },
  /** Dessin au trait, texte « Bride & Groom » inclus dans l'image. */
  couple: { src: '/images/couple.png', width: 377, height: 572 },
  babyA: { src: '/images/baby-adham.png', width: 350, height: 560 },
  babyB: { src: '/images/baby-lara.png', width: 526, height: 560 },
  /** Demi-soleil de fin de page, dessiné par Adham, initiales gravées dans l'image. */
  sunEnd: { src: '/images/sun-end.png', width: 1200, height: 591 },
  /** Film d'intro (enveloppe, sceau, carte), sans piste audio. Le poster est sa première image : l'enveloppe fermée de la gate. */
  intro: { src: '/video/intro.mp4', poster: '/video/intro-poster.jpg', width: 720, height: 1280 },
} as const
