import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { useAppStore } from '../../store/useAppStore'
import { Reveal } from '../Reveal'

/** Fin de page : la phrase de fin, le monogramme, et le bouton qui rejoue le film. */
export function End() {
  const t = useT()
  const rejouer = useAppStore((s) => s.rejouer)

  function revoir() {
    window.scrollTo({ top: 0, behavior: 'instant' })
    rejouer()
  }

  return (
    <section className="section section--end" id="end">
      <Reveal className="stack">
        <p className="subtitle">{t(wedding.text.end.closing)}</p>
        <p className="end__monogram">{wedding.couple.monogram}</p>
        <button type="button" className="btn" onClick={revoir}>
          {t(wedding.text.end.replay)}
        </button>
      </Reveal>
    </section>
  )
}
