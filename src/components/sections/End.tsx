import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { useAppStore } from '../../store/useAppStore'
import { Reveal } from '../Reveal'

/**
 * Fin de page (croquis de Lara) : la phrase de fin, le bouton qui rejoue le
 * film, puis un demi-soleil qui sort du bas de l'écran avec les initiales
 * dans son disque.
 */
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
        <button type="button" className="end__replay" onClick={revoir}>
          {t(wedding.text.end.replay)}
        </button>
      </Reveal>
      <div className="end__sun" aria-hidden="true">
        <img src={assets.sun.src} alt="" width={assets.sun.width} height={assets.sun.height} />
        <span className="end__monogram">{wedding.couple.monogram}</span>
      </div>
    </section>
  )
}
