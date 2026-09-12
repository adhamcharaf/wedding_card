import { Composition } from 'remotion'
import { DUREE_IMPRESSION, Impression } from './Impression'

export const FPS = 30
export const LARGEUR = 1080
export const HAUTEUR = 1920

export function Root() {
  return (
    <Composition
      id="Impression"
      component={Impression}
      durationInFrames={FPS * DUREE_IMPRESSION}
      fps={FPS}
      width={LARGEUR}
      height={HAUTEUR}
    />
  )
}
