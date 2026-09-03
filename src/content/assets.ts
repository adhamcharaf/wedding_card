/**
 * Chemins des images. Placeholders SVG pour l'instant (public/placeholders/).
 * Quand les découpes PNG définitives arrivent dans public/images/, on change
 * le chemin ici, une ligne par asset, sans toucher aux composants.
 * Les dimensions servent à réserver la place avant le chargement
 * (docs/LESSONS.md, « ScrollTrigger décalé après chargement »).
 */
export const assets = {
  sun: { src: '/placeholders/sun-gold.svg', width: 600, height: 600 },
  ribbon: { src: '/placeholders/ribbon.svg', width: 400, height: 560 },
  heart: { src: '/placeholders/heart.svg', width: 400, height: 360 },
  couple: { src: '/placeholders/couple.svg', width: 300, height: 300 },
} as const
