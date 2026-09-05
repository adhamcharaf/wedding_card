import { useEffect } from 'react'
import { Background } from './components/Background'
import { LangToggle } from './components/LangToggle'
import { Babies } from './components/sections/Babies'
import { Countdown } from './components/sections/Countdown'
import { End } from './components/sections/End'
import { Hero } from './components/sections/Hero'
import { Invitation } from './components/sections/Invitation'
import { Practical } from './components/sections/Practical'
import { Program } from './components/sections/Program'
import { Registry } from './components/sections/Registry'
import { Rsvp } from './components/sections/Rsvp'
import { Venue } from './components/sections/Venue'
import { useDocumentLang } from './i18n/useT'
import { ScrollTrigger } from './lib/gsap'

/**
 * Étape 2 : le scroll complet, on arrive directement sur le hero.
 * La machine à phases (gate, intro, bridge, envelope) s'ajoute à l'étape 4.
 */
export default function App() {
  useDocumentLang()

  // Les polices et les images changent la hauteur de page après l'init :
  // on recalcule les déclencheurs (docs/LESSONS.md).
  useEffect(() => {
    let cancelled = false
    const refresh = () => ScrollTrigger.refresh()
    void document.fonts.ready.then(() => {
      if (!cancelled) refresh()
    })
    window.addEventListener('load', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <Background />
      <LangToggle />
      <main className="column">
        <Hero />
        <Invitation />
        <Babies />
        <Venue />
        <Countdown />
        <Program />
        <Practical />
        <Registry />
        <Rsvp />
        <End />
      </main>
    </>
  )
}
