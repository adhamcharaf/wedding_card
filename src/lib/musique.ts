import { Howl } from 'howler'
import { assets } from '../content/assets'

/**
 * Musique du site (docs/CONCEPTION.md §4) : les deux premières minutes du
 * morceau, en boucle, lancées au tap sur l'écran d'accueil et jamais avant.
 * Web Audio (pas de balise audio) : la boucle est sans coupure et iOS
 * débloque le contexte sur le geste du tap. Un seul Howl pour toute la visite.
 */
let howl: Howl | null = null

/** À appeler dès la gate : le fichier se charge pendant que l'invité regarde l'enveloppe. */
export function prechargerMusique(): Howl {
  howl ??= new Howl({ src: [assets.music.src], loop: true, volume: 0.8, preload: true })
  return howl
}

/** Depuis le début, à chaque tap sur la gate (première visite ou « revoir le film »). */
export function demarrerMusique(): void {
  const h = prechargerMusique()
  h.stop()
  h.play()
}

export function couperMusique(coupe: boolean): void {
  prechargerMusique().mute(coupe)
}
