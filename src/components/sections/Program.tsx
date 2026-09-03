import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

export function Program() {
  const t = useT()
  return (
    <section className="section" id="program">
      <Reveal className="stack">
        <h2 className="section__title">{t(wedding.text.program.title)}</h2>
        <ul className="list">
          {wedding.program.map((item) => (
            <li className="list__item" key={item.time}>
              <span className="list__time">{item.time}</span>
              <span>{t(item.label)}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
