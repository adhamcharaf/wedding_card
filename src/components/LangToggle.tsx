import { useEffect, useState } from 'react'
import { LANGS, wedding } from '../content/wedding'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Au-delà de ce défilement, le bouton s'efface : la langue se choisit au début. */
const SEUIL_PX = 160

/** Bouton FR/EN en haut à droite, visible sur la gate, le film et le hero. */
export function LangToggle() {
  const lang = useAppStore((state) => state.lang)
  const setLang = useAppStore((state) => state.setLang)
  const t = useT()
  const [cache, setCache] = useState(false)

  useEffect(() => {
    const surScroll = () => setCache(window.scrollY > SEUIL_PX)
    window.addEventListener('scroll', surScroll, { passive: true })
    return () => window.removeEventListener('scroll', surScroll)
  }, [])

  return (
    <div className={cache ? 'lang is-hidden' : 'lang'} role="group" aria-label={t(wedding.lang.label)}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          className="lang__btn"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {wedding.lang.names[code]}
        </button>
      ))}
    </div>
  )
}
