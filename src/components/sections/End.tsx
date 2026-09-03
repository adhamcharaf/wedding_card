import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

/** Fin de page : le monogramme se pose sur le soleil plein. Le bouton « revoir le film » arrive à l'étape 5. */
export function End() {
  const t = useT()
  return (
    <section className="section section--end" id="end">
      <Reveal className="stack">
        <p className="subtitle">{t(wedding.text.end.closing)}</p>
        <p className="end__monogram">{wedding.couple.monogram}</p>
      </Reveal>
    </section>
  )
}
