import { LANGS, wedding } from '../content/wedding'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Bouton FR/EN en haut à droite. */
export function LangToggle() {
  const lang = useAppStore((state) => state.lang)
  const setLang = useAppStore((state) => state.setLang)
  const t = useT()

  return (
    <div className="lang" role="group" aria-label={t(wedding.lang.label)}>
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
