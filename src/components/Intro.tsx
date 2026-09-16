import { useEffect, useRef, useState, type FormEvent } from 'react'
import { assets } from '../content/assets'
import { LANGS, wedding, type Lang } from '../content/wedding'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { nommer, useT } from '../i18n/useT'
import { demarrerMusique, prechargerMusique } from '../lib/musique'
import { telechargerEnMemoire, type Progression } from '../lib/precharge'
import { useAppStore } from '../store/useAppStore'

/**
 * Fenêtre, en secondes avant la fin, où le hero commence à s'imprimer derrière
 * la vidéo. iOS n'émet `timeupdate` que 4 fois par seconde : la fenêtre doit
 * être plus large que cet intervalle pour être attrapée.
 */
const RACCORD = 0.45
/** Durée du fondu de sortie de la vidéo, alignée sur le CSS. */
const FONDU_MS = 700
/** Au-delà, on propose « Ouvrir » même si tout n'est pas en mémoire : on lira en flux. */
const ATTENTE_MAX_MS = 30000
/** Longueur maximale du prénom. */
const PRENOM_MAX = 40

/**
 * iOS ignore `preload="auto"` : au tap, la vidéo partait chercher ses octets
 * et le film démarrait avec un temps mort. On télécharge donc le fichier en
 * mémoire dès l'affichage de l'accueil, une seule fois par visite, et la
 * vidéo lit depuis ce blob : le tap démarre sans rien attendre du réseau.
 */
let filmEnMemoire: Promise<string> | null = null
function prechargerFilm(src: string, surProgres?: (p: Progression) => void): Promise<string> {
  filmEnMemoire ??= telechargerEnMemoire(src, undefined, surProgres)
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

/** Écran d'accueil : le choix de la langue, puis le prénom ; `pret` en revisite ou pour « revoir le film ». */
type Etape = 'langue' | 'prenom' | 'pret'

/**
 * Écran d'accueil et film d'intro (docs/CONCEPTION.md §4).
 * L'accueil, c'est la première image du film, les oiseaux qui apportent
 * l'enveloppe : la vidéo est dans le DOM dès le départ, arrêtée dessus (c'est
 * aussi son poster). Par-dessus, dans la bande de ciel : la langue, un prénom
 * facultatif qui personnalise le site, et « Ouvrir », proposé seulement quand
 * musique et film sont en mémoire (un trait montre la progression). Le tap
 * lance les deux dans le même geste (iOS l'exige), donc ensemble.
 * Pas de bouton pour passer. Sur les dernières 450 ms, le hero s'imprime
 * derrière et la vidéo se fond.
 * Remonté à neuf à chaque « revoir le film » via la clé `tour` (App.tsx).
 */
export function Intro() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const finirIntro = useAppStore((s) => s.finirIntro)
  const setLang = useAppStore((s) => s.setLang)
  const prenom = useAppStore((s) => s.prenom)
  const setPrenom = useAppStore((s) => s.setPrenom)
  const reduced = useReducedMotion()
  const intro = assets.intro
  const g = wedding.text.gate

  const video = useRef<HTMLVideoElement>(null)
  const [finie, setFinie] = useState(false)
  const [montee, setMontee] = useState(true)
  const [etape, setEtape] = useState<Etape>(() => (prenom === null ? 'langue' : 'pret'))
  const [saisie, setSaisie] = useState('')
  const [pret, setPret] = useState(false)
  const [progres, setProgres] = useState(0)

  // Musique et film arrivent en mémoire, en parallèle, une fois le poster
  // affiché. « Ouvrir » attend qu'ils soient là ; en cas d'échec ou au bout
  // de 30 s, on le propose quand même et on lira en flux.
  useEffect(() => {
    let actif = true
    const etat: Record<'musique' | 'film', Progression> = { musique: { recus: 0, total: 0 }, film: { recus: 0, total: 0 } }
    let affiche = 0
    const maj = () => {
      // Tant qu'un des deux fichiers n'a pas annoncé sa taille, le trait reste à zéro :
      // sinon le premier arrivé le remplirait à tort.
      const total = etat.musique.total + etat.film.total
      if (!actif || etat.musique.total === 0 || etat.film.total === 0) return
      const part = Math.min(1, (etat.musique.recus + etat.film.recus) / total)
      if (part - affiche >= 0.01 || part === 1) {
        affiche = part
        setProgres(part)
      }
    }
    const limite = window.setTimeout(() => {
      if (actif) setPret(true)
    }, ATTENTE_MAX_MS)

    // Revisite ou « revoir le film » : les fichiers sont déjà en mémoire, pas d'attente du poster.
    const dejaLance = filmEnMemoire !== null
    ;(dejaLance ? Promise.resolve() : attendreImage(intro.poster))
      .then(() =>
        Promise.all([
          prechargerMusique((p) => {
            etat.musique = p
            maj()
          }),
          prechargerFilm(intro.src, (p) => {
            etat.film = p
            maj()
          }).then((url) => {
            const v = video.current
            if (actif && v && !v.src) v.src = url
          }),
        ]),
      )
      .catch(() => {})
      .finally(() => {
        if (!actif) return
        setProgres(1)
        setPret(true)
      })

    return () => {
      actif = false
      window.clearTimeout(limite)
    }
  }, [intro.src, intro.poster])

  function terminer(impression: boolean) {
    if (finie) return
    setFinie(true)
    finirIntro(impression)
    window.setTimeout(() => setMontee(false), FONDU_MS)
  }

  function choisirLangue(code: Lang) {
    setLang(code)
    setEtape('prenom')
  }

  function ouvrir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pret && !reduced) return
    if (etape === 'prenom') setPrenom(saisie.trim().slice(0, PRENOM_MAX))
    // Dans le geste du tap, comme la vidéo : iOS n'autorise le son qu'ainsi.
    demarrerMusique()
    // Reduced-motion : pas de film, on arrive sur le hero.
    if (reduced) return terminer(false)
    setPhase('intro')
    const v = video.current
    if (!v) return terminer(false)
    // Mise en mémoire échouée : on lit depuis le réseau, tant pis pour l'attente.
    if (!v.src) v.src = intro.src
    v.play().catch(() => terminer(false))
  }

  function surTemps() {
    const v = video.current
    if (!v || phase !== 'intro' || !Number.isFinite(v.duration)) return
    if (v.duration - v.currentTime <= RACCORD) terminer(true)
  }

  if (!montee) return null

  const ouvrable = pret || reduced

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
        <div className="gate">
          {etape === 'langue' ? (
            <div className="gate__panel">
              <div className="gate__langs" role="group" aria-label={t(wedding.lang.label)}>
                {LANGS.map((code) => (
                  <button key={code} type="button" lang={code} className="btn gate__lang" onClick={() => choisirLangue(code)}>
                    {wedding.lang.longNames[code]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form className="gate__panel" onSubmit={ouvrir}>
              {etape === 'prenom' ? (
                <label className="gate__field">
                  <span className="sr-only">{t(g.firstName)}</span>
                  <input
                    className="field__input gate__input"
                    name="prenom"
                    type="text"
                    autoComplete="given-name"
                    maxLength={PRENOM_MAX}
                    placeholder={`${t(g.firstName)} (${t(g.optional)})`}
                    value={saisie}
                    onChange={(e) => setSaisie(e.target.value)}
                  />
                </label>
              ) : (
                prenom && <p className="gate__hello">{nommer(t(g.hello), prenom)}</p>
              )}

              <button type="submit" className="btn btn--solid gate__open" disabled={!ouvrable}>
                {t(g.open)}
              </button>

              {!ouvrable && (
                <div className="gate__loading" role="status">
                  <span className="gate__message">{t(g.loading)}</span>
                  <span className="gate__bar" aria-hidden="true">
                    <span className="gate__bar-fill" style={{ transform: `scaleX(${progres})` }} />
                  </span>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
