import { useEffect, useState } from 'react'
import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { ScrollTrigger } from '../../lib/gsap'
import { Reveal } from '../Reveal'

/**
 * Liste de mariage et dessin du couple (docs/mockups/3.png). Le compte en
 * banque ouvre sa propre page. Sous la liste officielle, un lien discret
 * déplie la liste d'Adham, commentée par Lara (docs/CONCEPTION.md §5).
 */
export function Registry() {
  const t = useT()
  const a = wedding.text.registry.adham
  const [ouverte, setOuverte] = useState(false)

  // La page change de hauteur : les déclencheurs des sections suivantes sont recalculés.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [ouverte])

  return (
    <section className="section" id="registry">
      <Reveal className="stack">
        <h2 className="section__title">{t(wedding.text.registry.title)}</h2>
        <span className="vline" aria-hidden="true" />
        <ul className="list list--center">
          {wedding.registry.map((item) => (
            <li className="list__item" key={t(item.label)}>
              {item.url.startsWith('/') ? (
                <a className="link" href={item.url}>
                  {t(item.label)}
                </a>
              ) : item.url ? (
                <a className="link" href={item.url} target="_blank" rel="noopener noreferrer">
                  {t(item.label)}
                </a>
              ) : (
                <span>{t(item.label)}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="registry__note">{t(wedding.text.registry.inStore)}</p>

        <button
          type="button"
          className="adham__toggle"
          aria-expanded={ouverte}
          aria-controls="liste-adham"
          onClick={() => setOuverte((o) => !o)}
        >
          {t(ouverte ? a.hide : a.teaser)}
        </button>

        {ouverte && (
          <div className="adham" id="liste-adham">
            <h3 className="adham__title">{t(a.title)}</h3>
            <p className="adham__subtitle">{t(a.subtitle)}</p>
            <p className="adham__quote">
              {t(a.warning)}
              <span className="adham__by">{wedding.couple.b}</span>
            </p>
            <ul className="adham__list">
              {wedding.adhamList.map((item) => (
                <li className="adham__item" key={item.url}>
                  <a className="link adham__name" href={item.url} target="_blank" rel="noopener noreferrer">
                    {t(item.name)}
                  </a>
                  <span className="adham__lara">{t(item.lara)}</span>
                </li>
              ))}
            </ul>
            <p className="adham__quote">
              {t(a.outro)}
              <span className="adham__by">{wedding.couple.b}</span>
            </p>
            <p className="adham__quote adham__quote--ps">
              {t(a.ps)}
              <span className="adham__by">{wedding.couple.a}</span>
            </p>
          </div>
        )}

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
