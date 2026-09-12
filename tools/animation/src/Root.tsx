import { Composition } from 'remotion'
import { DUREE_REVELATION, Revelation } from './Revelation'
import { DUREE_TEMPS, Temps2 } from './Temps'

export const FPS = 30
export const LARGEUR = 1080
export const HAUTEUR = 1920

const commun = { fps: FPS, width: LARGEUR, height: HAUTEUR }

export function Root() {
  return (
    <>
      <Composition id="Temps2" component={Temps2} durationInFrames={FPS * DUREE_TEMPS} {...commun} />
      <Composition id="Revelation" component={Revelation} durationInFrames={FPS * DUREE_REVELATION} {...commun} />
    </>
  )
}
