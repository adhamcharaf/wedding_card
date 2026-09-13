import { assets } from '../content/assets'

/**
 * Soleil doré fixé en bas de l'écran (docs/CONCEPTION.md §5).
 * Immobile : taille et position reprises de la dernière image de la vidéo
 * d'intro, pour que le raccord vidéo/site tombe juste (décision du 2026-09-05,
 * DECISIONS.md). Il n'y a plus de montée au scroll.
 */
export function Sun() {
  return (
    <div className="sun" aria-hidden="true">
      <img src={assets.sun.src} alt="" width={assets.sun.width} height={assets.sun.height} />
    </div>
  )
}
