import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

export function Practical() {
  const t = useT()
  return (
    <section className="section" id="practical">
      <Reveal className="stack">
        <h2 className="section__title">{t(wedding.text.practical.title)}</h2>
        <dl className="list">
          {wedding.practical.map((item) => (
            <div className="list__item" key={t(item.label)}>
              <dt className="list__time">{t(item.label)}</dt>
              <dd>{t(item.value)}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
