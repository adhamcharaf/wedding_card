import { useLayoutEffect, useRef } from 'react'
import { assets } from '../content/assets'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap } from '../lib/gsap'

interface SunProps {
  /** Sélecteur de la section où le soleil finit sa montée. */
  endSelector: string
}

/**
 * Soleil doré fixé en bas de l'écran (docs/CONCEPTION.md §5).
 * Il monte de +60 % vers 0 au fil du scroll, et il est plein quand le haut de la
 * section `endSelector` atteint le haut de l'écran. Sous prefers-reduced-motion,
 * il reste plein et immobile.
 */
export function Sun({ endSelector }: SunProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: 60 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            endTrigger: endSelector,
            end: 'top top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [endSelector, reduced])

  return (
    <div className="sun" ref={ref} aria-hidden="true">
      <img src={assets.sun.src} alt="" width={assets.sun.width} height={assets.sun.height} />
    </div>
  )
}
