import { useLayoutEffect, useRef } from 'react'
import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useT } from '../../i18n/useT'
import { gsap } from '../../lib/gsap'
import { useAppStore } from '../../store/useAppStore'
import { Sun } from '../Sun'

/**
 * La carte Save the Date dans son cadre ruban (docs/mockups/HERO_Section.png).
 *
 * Deux arrivées possibles. Depuis la fin du film, la carte « s'imprime » sur
 * le papier que la vidéo vient de laisser à l'écran : le ruban se pose, le
 * cœur descend, le petit soleil arrive en tournant, le grand monte du bas, le
 * texte s'écrit. En arrivée directe (reduced-motion, film en erreur), un
 * simple fondu. Réglé dans l'atelier tools/animation (Impression.tsx).
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
        .fromTo('.card__ribbon', { scale: 1.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 }, 0)
        .fromTo(
          '.card__heart',
          { xPercent: -50, yPercent: -60, autoAlpha: 0 },
          { xPercent: -50, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)' },
          0.5,
        )
        .fromTo('.card__sun', { rotation: -120, scale: 0.4, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.9 }, 0.7)
        .fromTo('.sun', { xPercent: -50, yPercent: 40, autoAlpha: 0 }, { xPercent: -50, yPercent: 0, autoAlpha: 1, duration: 1.2 }, 0.6)
        .fromTo('.card__body > *', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 1.1)
    }, el)
    return () => ctx.revert()
  }, [impression, reduced])

  return (
    <section className="section section--hero" id="hero" ref={ref}>
      <div className="card">
        <Sun />
        <img
          className="card__ribbon"
          src={assets.ribbon.src}
          alt=""
          width={assets.ribbon.width}
          height={assets.ribbon.height}
        />
        <img
          className="card__heart"
          src={assets.heart.src}
          alt=""
          width={assets.heart.width}
          height={assets.heart.height}
        />
        <img
          className="card__sun"
          src={assets.sun.src}
          alt=""
          width={assets.sun.width}
          height={assets.sun.height}
        />
        <div className="card__body">
          <h1 className="card__title">{t(wedding.text.hero.saveTheDate)}</h1>
          <p className="card__name">{wedding.couple.a}</p>
          <p className="card__amp">{wedding.couple.ampersand}</p>
          <p className="card__name">{wedding.couple.b}</p>
          <p className="card__date">{wedding.dateLabel}</p>
        </div>
      </div>
    </section>
  )
}
