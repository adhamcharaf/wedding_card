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
  ribbon: { src: '/placeholders/ribbon.svg', width: 400, height: 560 },
  couple: { src: '/placeholders/couple.svg', width: 300, height: 300 },
} as const
