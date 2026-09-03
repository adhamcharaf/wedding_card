import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Ornament } from '../icons'
import { Reveal } from '../Reveal'

export function Invitation() {
  const t = useT()
  return (
    <section className="section" id="invitation">
      <Reveal className="stack">
        <p className="lead">{t(wedding.text.invitation)}</p>
        <Ornament />
        <p className="subtitle">{t(wedding.text.celebration)}</p>
      </Reveal>
    </section>
  )
}
