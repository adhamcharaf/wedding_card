import { useEffect, useRef, useState } from 'react'
import { assets, choisirFilm } from '../content/assets'
import { wedding } from '../content/wedding'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/**
 * Fenêtre, en secondes avant la fin, où le hero commence à s'imprimer derrière
 * la vidéo. iOS n'émet `timeupdate` que 4 fois par seconde : la fenêtre doit
 * être plus large que cet intervalle pour être attrapée.
 */
const RACCORD = 0.45
/** Durée du fondu de sortie de la vidéo, alignée sur le CSS. */
const FONDU_MS = 700

/**
 * iOS ignore `preload="auto"` : au tap, la vidéo partait chercher ses octets
 * et le film démarrait avec un temps mort. On télécharge donc le fichier en
 * mémoire dès l'affichage de la gate, une seule fois par visite, et la vidéo
 * lit depuis ce blob : le tap démarre sans rien attendre du réseau.
 */
const filmsEnMemoire = new Map<string, Promise<string>>()
function prechargerFilm(src: string): Promise<string> {
  let p = filmsEnMemoire.get(src)
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => URL.createObjectURL(blob))
    filmsEnMemoire.set(src, p)
  }
  return p
}

/**
 * Écran d'accueil et film d'intro (docs/CONCEPTION.md §4).
 * La gate, c'est la première image du film (les oiseaux qui apportent
 * l'enveloppe, ou l'enveloppe fermée en version courte, `?film=court`) : la
 * vidéo est dans le DOM dès le départ, arrêtée dessus (c'est aussi son
 * poster), avec « toucher pour ouvrir » par-dessus. Le tap la lance dans le même geste (iOS l'exige).
 * Pas de bouton pour passer. Sur les dernières 300 ms, le hero s'imprime
 * derrière et la vidéo se fond. Sans son pour l'instant.
 * Remonté à neuf à chaque « revoir le film » via la clé `tour` (App.tsx).
 */
export function Intro() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const finirIntro = useAppStore((s) => s.finirIntro)
  const reduced = useReducedMotion()
  // Choisi une fois par visite : l'adresse ne change pas pendant la session.
  const [film] = useState(choisirFilm)
  const intro = assets.films[film]

  const video = useRef<HTMLVideoElement>(null)
  const [finie, setFinie] = useState(false)
  const [montee, setMontee] = useState(true)

  // Le fichier arrive en mémoire pendant que l'enveloppe est à l'écran. Si le
  // téléchargement échoue, on retombe sur l'URL réseau au moment du tap.
  useEffect(() => {
    let actif = true
    prechargerFilm(intro.src)
      .then((url) => {
        const v = video.current
        if (actif && v && !v.src) v.src = url
      })
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [intro.src])

  // Reduced-motion : ni gate ni film, on arrive sur le hero.
  useEffect(() => {
    if (reduced && phase !== 'scroll') finirIntro(false)
  }, [reduced, phase, finirIntro])

  function terminer(impression: boolean) {
    if (finie) return
    setFinie(true)
    finirIntro(impression)
    window.setTimeout(() => setMontee(false), FONDU_MS)
  }

  function ouvrir() {
    setPhase('intro')
    const v = video.current
    if (!v) return terminer(false)
    // Tap avant la fin du préchargement : on lit depuis le réseau, tant pis pour l'attente.
    if (!v.src) v.src = intro.src
    v.play().catch(() => terminer(false))
  }

  function surTemps() {
    const v = video.current
    if (!v || phase !== 'intro' || !Number.isFinite(v.duration)) return
    if (v.duration - v.currentTime <= RACCORD) terminer(true)
  }

  if (!montee) return null

  return (
    <div className="intro">
      <video
        ref={video}
        className={finie ? 'intro__video is-finie' : 'intro__video'}
        poster={intro.poster}
        width={intro.width}
        height={intro.height}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={surTemps}
        onEnded={() => terminer(true)}
        onError={() => terminer(false)}
      />

      {phase === 'gate' && (
        <button type="button" className={`gate gate--${film}`} onClick={ouvrir}>
          <span className="gate__hint">{t(wedding.text.gate)}</span>
        </button>
      )}
    </div>
  )
}
