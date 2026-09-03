import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

/** Liste de mariage et dessin du couple (docs/mockups/3.png). */
export function Registry() {
  const t = useT()
  return (
    <section className="section" id="registry">
      <Reveal className="stack">
        <h2 className="section__title">{t(wedding.text.registry.title)}</h2>
        <span className="vline" aria-hidden="true" />
        <ul className="list list--center">
          {wedding.registry.map((item) => (
            <li className="list__item" key={t(item.label)}>
              {item.url ? (
                <a className="link" href={item.url} target="_blank" rel="noopener noreferrer">
                  {t(item.label)}
                </a>
              ) : (
                <span>{t(item.label)}</span>
              )}
            </li>
          ))}
        </ul>
        <img
          className="couple"
          src={assets.couple.src}
          alt=""
          width={assets.couple.width}
          height={assets.couple.height}
        />
      </Reveal>
    </section>
  )
}
