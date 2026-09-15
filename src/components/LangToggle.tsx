import { LANGS, wedding } from '../content/wedding'
import { useDefile } from '../hooks/useDefile'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Au-delà de ce défilement, le bouton s'efface : la langue se choisit au début. */
const SEUIL_PX = 160

/** Bouton FR/EN en haut à droite, visible sur la gate, le film et le hero. */
export function LangToggle() {
  const lang = useAppStore((state) => state.lang)
  const setLang = useAppStore((state) => state.setLang)
  const t = useT()
  const cache = useDefile(SEUIL_PX)

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
