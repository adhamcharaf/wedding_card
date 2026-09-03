import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap } from '../lib/gsap'

interface RevealProps {
  children: ReactNode
  className?: string
}

/**
 * Apparition d'un bloc à l'entrée dans l'écran : fondu et 12 px de translateY,
 * une seule fois (docs/CONCEPTION.md §5). Sans effet sous prefers-reduced-motion.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      )
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={ref} className={className ? `reveal ${className}` : 'reveal'}>
      {children}
    </div>
  )
}
