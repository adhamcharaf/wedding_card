import { Composition } from 'remotion'
import { Scene2 } from './Scene2'

export const FPS = 30
export const LARGEUR = 1080
export const HAUTEUR = 1920

export function Root() {
  return (
    <Composition
      id="Scene2"
      component={Scene2}
      durationInFrames={FPS * 6}
      fps={FPS}
      width={LARGEUR}
      height={HAUTEUR}
    />
  )
}
