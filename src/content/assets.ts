/**
 * Chemins des images. Les découpes définitives vivent dans public/images/,
 * les provisoires dans public/placeholders/. Quand une découpe arrive, on
 * change le chemin ici, une ligne par asset, sans toucher aux composants.
 * Les dimensions servent à réserver la place avant le chargement
 * (docs/LESSONS.md, « ScrollTrigger décalé après chargement »).
 */
export const assets = {
  sun: { src: '/images/sun-gold.png', width: 1000, height: 985 },
  /** La carte Save the Date complète, dessinée par Adham, texte compris (identique dans les deux langues). */
  card: { src: '/images/card.png', width: 1000, height: 1540 },
  /** Dessin au trait, texte « Bride & Groom » inclus dans l'image. */
  couple: { src: '/images/couple.png', width: 377, height: 572 },
  babyA: { src: '/images/baby-adham.png', width: 350, height: 560 },
  babyB: { src: '/images/baby-lara.png', width: 526, height: 560 },
  /** Demi-soleil de fin de page, dessiné par Adham, initiales gravées dans l'image. */
  sunEnd: { src: '/images/sun-end.png', width: 1200, height: 591 },
  /**
   * Les deux versions du film d'intro (Seedance 2.5, masters dans assets/seedance/),
   * sans piste audio, poster = première image = écran d'accueil.
   * `complet` : les oiseaux apportent l'enveloppe, puis elle s'ouvre, 18 s.
   * `court` : l'enveloppe fermée s'ouvre directement, 10 s.
   * Le choix se fait par l'adresse (`?film=court`), voir `choisirFilm`.
   */
  films: {
    complet: { src: '/video/intro-complet.mp4', poster: '/video/intro-complet-poster.jpg', width: 720, height: 1280 },
    court: { src: '/video/intro-court.mp4', poster: '/video/intro-court-poster.jpg', width: 720, height: 1280 },
  },
} as const

export type Film = keyof typeof assets.films

/** `?film=court` dans l'adresse choisit la version courte ; tout le reste, la complète. */
export function choisirFilm(): Film {
  if (typeof window === 'undefined') return 'complet'
  return new URLSearchParams(window.location.search).get('film') === 'court' ? 'court' : 'complet'
}
