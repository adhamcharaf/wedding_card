import { useEffect, useState } from 'react'

/** Vrai une fois la page défilée au-delà de `seuil` pixels. */
export function useDefile(seuil: number): boolean {
  const [passe, setPasse] = useState(false)
  useEffect(() => {
    const surScroll = () => setPasse(window.scrollY > seuil)
    surScroll()
    window.addEventListener('scroll', surScroll, { passive: true })
    return () => window.removeEventListener('scroll', surScroll)
  }, [seuil])
  return passe
}
