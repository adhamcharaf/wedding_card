import { Howl, Howler } from 'howler'
import { assets } from '../content/assets'

/**
 * Musique du site (docs/CONCEPTION.md §4) : les deux premières minutes du
 * morceau, en boucle, lancées au tap sur l'écran d'accueil et jamais avant.
 *
 * Lecture HTML5 (`html5: true`), jamais Web Audio : en Web Audio, Howler
 * télécharge et décode tout le fichier avant la première note, ce qui prenait
 * des minutes sur mobile (docs/LESSONS.md). Le fichier est mis en mémoire
 * pendant la gate, avant le film, pour que le tap ne dépende pas du réseau.
 * Si le tap arrive avant, on lit en flux depuis le réseau : le film n'a pas
 * encore commencé à se télécharger, le flux a toute la bande passante.
 * Un seul Howl pour toute la visite.
 */
let howl: Howl | null = null
let enMemoire: Promise<string> | null = null
const telechargement = new AbortController()

/** m4a (AAC) partout où il est décodé, sinon le mp3 : décidé une fois, pour le blob comme pour le flux. */
function source(): { src: string; format: string } {
  return Howler.codecs('m4a') ? { src: assets.music.m4a, format: 'm4a' } : { src: assets.music.mp3, format: 'mp3' }
}

function creer(src: string, format?: string): Howl {
  // En flux réseau, `preload: 'metadata'` : Howler considère le son prêt dès
  // les métadonnées et le navigateur met en tampon au fil de la lecture. Avec
  // `true`, il attendrait « canplaythrough », que Chrome et Safari ne
  // déclenchent sur réseau lent qu'une fois presque tout le fichier reçu.
  return new Howl({
    src: [src],
    format: format ? [format] : undefined,
    html5: true,
    loop: true,
    volume: 0.8,
    preload: format ? true : 'metadata',
  })
}

/** À appeler dès la gate, avant le préchargement du film. Ne rejette jamais. */
export function prechargerMusique(): Promise<void> {
  enMemoire ??= fetch(source().src, { signal: telechargement.signal, priority: 'low' })
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => URL.createObjectURL(blob))
  return enMemoire
    .then((url) => {
      howl ??= creer(url, source().format)
    })
    .catch(() => {})
}

/** Depuis le début, dans le geste du tap (première visite ou « revoir le film »). */
export function demarrerMusique(): void {
  if (!howl) {
    // Tap avant la fin du préchargement : on abandonne la mise en mémoire,
    // qui prendrait toute la bande passante, et on lit en flux depuis le réseau.
    telechargement.abort()
    howl = creer(source().src)
  }
  howl.stop()
  howl.play()
}

export function couperMusique(coupe: boolean): void {
  howl?.mute(coupe)
}
