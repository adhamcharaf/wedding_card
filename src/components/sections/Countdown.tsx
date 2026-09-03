import { wedding } from '../../content/wedding'
import { useCountdown } from '../../hooks/useCountdown'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

const pad = (n: number) => String(n).padStart(2, '0')

/** Compte à rebours mis à jour chaque seconde, sans animation (l'animation vient à l'étape 6). */
export function Countdown() {
  const t = useT()
  const c = useCountdown(wedding.date)
  const cells = [
    { value: String(c.days), label: wedding.text.countdown.days },
    { value: pad(c.hours), label: wedding.text.countdown.hours },
    { value: pad(c.minutes), label: wedding.text.countdown.minutes },
    { value: pad(c.seconds), label: wedding.text.countdown.seconds },
  ]

  return (
    <section className="section" id="countdown">
      <Reveal className="stack">
        <h2 className="section__title">{t(wedding.text.countdown.title)}</h2>
        {c.done ? (
          <p className="lead">{t(wedding.text.countdown.today)}</p>
        ) : (
          <div className="countdown" role="timer">
            {cells.map((cell) => (
              <div className="countdown__cell" key={t(cell.label)}>
                <span className="countdown__num">{cell.value}</span>
                <span className="countdown__label">{t(cell.label)}</span>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}
