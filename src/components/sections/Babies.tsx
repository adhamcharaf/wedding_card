import { useLayoutEffect, useRef } from 'react'
import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useT } from '../../i18n/useT'
import { gsap } from '../../lib/gsap'
import { Reveal } from '../Reveal'

/**
 * « These two are getting married » : les deux photos d'enfance sautillent
 * d'un pied sur l'autre, en alternance (docs/CONCEPTION.md §5). L'animation
 * est en CSS, transform seulement, et ne joue que quand la section est à l'écran.
 */
export function Babies() {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          toggleClass: { targets: el, className: 'is-playing' },
        },
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="section" id="babies">
      <Reveal className="stack">
        <h2 className="script script--title">{t(wedding.text.babies.title)}</h2>
        <div className="babies" ref={ref}>
          <img
            className="babies__photo"
            src={assets.babyA.src}
            alt={t(wedding.text.babies.altA)}
            width={assets.babyA.width}
            height={assets.babyA.height}
          />
          <img
            className="babies__photo"
            src={assets.babyB.src}
            alt={t(wedding.text.babies.altB)}
            width={assets.babyB.width}
            height={assets.babyB.height}
          />
        </div>
      </Reveal>
    </section>
  )
}
