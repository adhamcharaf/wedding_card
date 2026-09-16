import { wedding } from '../../content/wedding'
import { nommer, useT } from '../../i18n/useT'
import { useAppStore } from '../../store/useAppStore'
import { Ornament } from '../icons'
import { Reveal } from '../Reveal'

export function Invitation() {
  const t = useT()
  const prenom = useAppStore((s) => s.prenom)
  const phrase = prenom ? nommer(t(wedding.text.invitationNamed), prenom) : t(wedding.text.invitation)
  return (
    <section className="section" id="invitation">
      <Reveal className="stack">
        <p className="lead">{phrase}</p>
        <Ornament />
        <p className="subtitle">{t(wedding.text.celebration)}</p>
      </Reveal>
    </section>
  )
}
