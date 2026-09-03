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
 * Il monte de +30 % vers 0 au fil du scroll (CONCEPTION §5 disait +60 % pour
 * une géométrie de placeholder ; avec la vraie découpe et la position finale
 * à mi-disque, +30 % donne la pointe des rayons sur le hero). Il est plein
 * quand le haut de la section `endSelector` atteint le haut de l'écran.
 * Sous prefers-reduced-motion, il reste plein et immobile.
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
        { yPercent: 30 },
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
