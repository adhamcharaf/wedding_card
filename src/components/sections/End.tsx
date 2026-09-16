import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { nommer, useT } from '../../i18n/useT'
import { useAppStore } from '../../store/useAppStore'
import { Reveal } from '../Reveal'

/**
 * Fin de page (croquis de Lara) : la phrase de fin, le lien qui rejoue le
 * film, puis le demi-soleil dessiné avec les initiales gravées dans l'image.
 */
export function End() {
  const t = useT()
  const rejouer = useAppStore((s) => s.rejouer)
  const prenom = useAppStore((s) => s.prenom)
  const phrase = prenom ? nommer(t(wedding.text.end.closingNamed), prenom) : t(wedding.text.end.closing)

  function revoir() {
    window.scrollTo({ top: 0, behavior: 'instant' })
    rejouer()
  }

  return (
    <section className="section section--end" id="end">
      <Reveal className="stack">
        <p className="subtitle">{phrase}</p>
        <button type="button" className="end__replay" onClick={revoir}>
          {t(wedding.text.end.replay)}
        </button>
      </Reveal>
      <img
        className="end__sun"
        src={assets.sunEnd.src}
        alt={wedding.couple.monogram}
        width={assets.sunEnd.width}
        height={assets.sunEnd.height}
      />
    </section>
  )
}
