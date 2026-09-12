import { useEffect, useRef, useState } from 'react'
import { assets } from '../content/assets'
import { wedding } from '../content/wedding'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Fenêtre, en secondes avant la fin, où le hero commence à s'imprimer derrière la vidéo. */
const RACCORD = 0.3
/** Le bouton « passer » apparaît après ce délai. */
const DELAI_PASSER_MS = 3000
/** Durée du fondu de sortie de la vidéo, alignée sur le CSS. */
const FONDU_MS = 700

/**
 * Écran d'accueil et film d'intro (docs/CONCEPTION.md §4).
 * La vidéo est dans le DOM dès la gate, invisible, pour se précharger ; le tap
 * la lance dans le même geste (iOS l'exige). Sur les dernières 300 ms, le hero
 * s'imprime derrière et la vidéo se fond. Sans son pour l'instant.
 * Remonté à neuf à chaque « revoir le film » via la clé `tour` (App.tsx).
 */
export function Intro() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const finirIntro = useAppStore((s) => s.finirIntro)
  const reduced = useReducedMotion()

  const video = useRef<HTMLVideoElement>(null)
  const [passable, setPassable] = useState(false)
  const [finie, setFinie] = useState(false)
  const [montee, setMontee] = useState(true)

  // Reduced-motion : ni gate ni film, on arrive sur le hero.
  useEffect(() => {
    if (reduced && phase !== 'scroll') finirIntro(false)
  }, [reduced, phase, finirIntro])

  useEffect(() => {
    if (phase !== 'intro') return
    const id = window.setTimeout(() => setPassable(true), DELAI_PASSER_MS)
    return () => window.clearTimeout(id)
  }, [phase])

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
        className={`intro__video${phase === 'gate' ? ' is-cachee' : ''}${finie ? ' is-finie' : ''}`}
        src={assets.intro.src}
        poster={assets.intro.poster}
        width={assets.intro.width}
        height={assets.intro.height}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={surTemps}
        onEnded={() => terminer(true)}
        onError={() => terminer(false)}
      />

      {phase === 'gate' && (
        <button type="button" className="gate" onClick={ouvrir}>
          <span className="gate__monogram">{wedding.couple.monogram}</span>
          <span className="gate__hint">{t(wedding.text.gate)}</span>
        </button>
      )}

      {phase === 'intro' && passable && !finie && (
        <button type="button" className="intro__skip" onClick={() => terminer(true)}>
          {t(wedding.text.skip)}
        </button>
      )}
    </div>
  )
}
