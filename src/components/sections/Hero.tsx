import { useLayoutEffect, useRef } from 'react'
import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useT } from '../../i18n/useT'
import { gsap } from '../../lib/gsap'
import { useAppStore } from '../../store/useAppStore'
import { Sun } from '../Sun'

/**
 * La carte Save the Date, dessinée d'un seul tenant par Adham, texte compris
 * (identique dans les deux langues). Un petit soleil dans son coin, le grand
 * soleil dessous.
 *
 * Deux arrivées possibles. Depuis la fin du film, la carte « s'imprime » sur
 * le papier que la vidéo vient de laisser à l'écran : elle se pose en se
 * fondant, le petit soleil arrive en tournant, le grand monte du bas. En
 * arrivée directe (reduced-motion, film en erreur), un simple fondu.
 */
export function Hero() {
  const t = useT()
  const reduced = useReducedMotion()
  const impression = useAppStore((s) => s.impression)
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) return

    const ctx = gsap.context(() => {
      if (!impression) {
        gsap.fromTo('.card', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out' })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.fromTo('.card', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
        .fromTo('.card__art', { scale: 1.06, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.3 }, 0)
        .fromTo('.card__sun', { rotation: -120, scale: 0.4, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.9 }, 0.6)
        .fromTo('.sun', { xPercent: -50, yPercent: 40, autoAlpha: 0 }, { xPercent: -50, yPercent: 0, autoAlpha: 1, duration: 1.2 }, 0.5)
    }, el)
    return () => ctx.revert()
  }, [impression, reduced])

  const titre = `${t(wedding.text.hero.saveTheDate)}, ${wedding.couple.a} ${wedding.couple.ampersand} ${wedding.couple.b}, ${wedding.dateLabel}`

  return (
    <section className="section section--hero" id="hero" ref={ref}>
      <h1 className="sr-only">{titre}</h1>
      <div className="card">
        <Sun />
        <img className="card__art" src={assets.card.src} alt={titre} width={assets.card.width} height={assets.card.height} />
        <img
          className="card__sun"
          src={assets.sun.src}
          alt=""
          width={assets.sun.width}
          height={assets.sun.height}
        />
      </div>
    </section>
  )
}
