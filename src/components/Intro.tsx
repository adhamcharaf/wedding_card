import { useEffect, useRef, useState } from 'react'
import { assets } from '../content/assets'
import { wedding } from '../content/wedding'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useT } from '../i18n/useT'
import { demarrerMusique, prechargerMusique } from '../lib/musique'
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
 * mémoire dès l'affichage de la gate, une seule fois par visite, après la
 * musique, et la vidéo lit depuis ce blob : le tap démarre sans rien attendre
 * du réseau.
 */
let filmEnMemoire: Promise<string> | null = null
function prechargerFilm(src: string): Promise<string> {
  // Priorité basse : rien de ce qui s'affiche ne doit attendre derrière ces 3,3 Mo.
  filmEnMemoire ??= fetch(src, { priority: 'low' })
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => URL.createObjectURL(blob))
  return filmEnMemoire
}

/**
 * Résolu quand l'image est arrivée (ou en erreur), au plus tard après 3 s :
 * les gros téléchargements ne partent qu'une fois l'écran d'accueil affiché.
 */
function attendreImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
    window.setTimeout(resolve, 3000)
  })
}

/**
 * Écran d'accueil et film d'intro (docs/CONCEPTION.md §4).
 * La gate, c'est la première image du film, les oiseaux qui apportent
 * l'enveloppe : la vidéo est dans le DOM dès le départ, arrêtée dessus (c'est
 * aussi son poster), avec « toucher pour ouvrir » par-dessus. Le tap la lance dans le même geste (iOS l'exige).
 * La musique part dans le même geste et continue en boucle sur le site.
 * Pas de bouton pour passer. Sur les dernières 450 ms, le hero s'imprime
 * derrière et la vidéo se fond. Sans son pour l'instant.
 * Remonté à neuf à chaque « revoir le film » via la clé `tour` (App.tsx).
 */
export function Intro() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const finirIntro = useAppStore((s) => s.finirIntro)
  const reduced = useReducedMotion()
  const intro = assets.intro

  const video = useRef<HTMLVideoElement>(null)
  const [finie, setFinie] = useState(false)
  const [montee, setMontee] = useState(true)

  // Le fichier arrive en mémoire pendant que l'enveloppe est à l'écran. Si le
  // téléchargement échoue, on retombe sur l'URL réseau au moment du tap.
  useEffect(() => {
    let actif = true
    // Le poster d'abord, c'est l'écran d'accueil. Puis la musique (1,4 Mo) :
    // le tap doit avoir le son tout de suite. Le film (3,3 Mo) en dernier, il
    // peut lire depuis le réseau.
    attendreImage(intro.poster)
      .then(() => prechargerMusique())
      .then(() => prechargerFilm(intro.src))
      .then((url) => {
        const v = video.current
        if (actif && v && !v.src) v.src = url
      })
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [intro.src, intro.poster])

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
    // Dans le geste du tap, comme la vidéo : iOS n'autorise le son qu'ainsi.
    demarrerMusique()
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
        <button type="button" className="gate" onClick={ouvrir}>
          <span className="gate__hint">{t(wedding.text.gate)}</span>
        </button>
      )}
    </div>
  )
}
