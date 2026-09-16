import { Howl, Howler } from 'howler'
import { assets } from '../content/assets'
import { telechargerEnMemoire, type Progression } from './precharge'

/**
 * Musique du site (docs/CONCEPTION.md §4) : le morceau à partir de 1 min 32
 * jusqu'à sa fin, en boucle, lancé au tap sur l'écran d'accueil et jamais avant.
 *
 * Lecture HTML5 (`html5: true`), jamais Web Audio : en Web Audio, Howler
 * télécharge et décode tout le fichier avant la première note, ce qui prenait
 * des minutes sur mobile (docs/LESSONS.md). Le fichier est mis en mémoire
 * pendant la gate, avant le film, pour que le tap ne dépende pas du réseau.
 * L'écran d'accueil ne propose « Ouvrir » qu'une fois le fichier en mémoire ;
 * s'il a échoué, on lit en flux depuis le réseau.
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

/** À appeler dès la gate. Rejette si le téléchargement échoue : l'accueil sait alors qu'il lira en flux. */
export function prechargerMusique(surProgres?: (p: Progression) => void): Promise<void> {
  enMemoire ??= telechargerEnMemoire(source().src, telechargement.signal, surProgres)
  return enMemoire.then((url) => {
    howl ??= creer(url, source().format)
  })
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
