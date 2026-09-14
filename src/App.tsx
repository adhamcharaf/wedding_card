import { useEffect } from 'react'
import { Background } from './components/Background'
import { Intro } from './components/Intro'
import { LangToggle } from './components/LangToggle'
import { ScrollHint } from './components/ScrollHint'
import { Babies } from './components/sections/Babies'
import { Countdown } from './components/sections/Countdown'
import { End } from './components/sections/End'
import { Hero } from './components/sections/Hero'
import { Invitation } from './components/sections/Invitation'
import { Registry } from './components/sections/Registry'
import { Rsvp } from './components/sections/Rsvp'
import { Venue } from './components/sections/Venue'
import { useDocumentLang } from './i18n/useT'
import { ScrollTrigger } from './lib/gsap'
import { useAppStore } from './store/useAppStore'

/** Gate, film d'intro, puis le scroll (docs/CONCEPTION.md §4). */
export default function App() {
  useDocumentLang()
  const phase = useAppStore((s) => s.phase)
  const tour = useAppStore((s) => s.tour)

  // Scroll bloqué tant que le film n'est pas fini ; les déclencheurs sont
  // recalculés au déblocage, la hauteur de page n'ayant pas été mesurée.
  useEffect(() => {
    const libre = phase === 'scroll'
    document.documentElement.classList.toggle('is-locked', !libre)
    if (libre) ScrollTrigger.refresh()
  }, [phase])

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
      <Intro key={tour} />
      <LangToggle />
      <ScrollHint />
      {/* Invisible tant que le film n'est pas fini, mais en page : les images se chargent et ScrollTrigger mesure juste. */}
      <main className={phase === 'scroll' ? 'column' : 'column is-attente'}>
        <Hero />
        <Babies />
        <Invitation />
        <Venue />
        <Countdown />
        <Registry />
        <Rsvp />
        <End />
      </main>
    </>
  )
}
