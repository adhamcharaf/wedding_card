import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'
import { Sun } from '../Sun'

/** La carte Save the Date dans son cadre ruban (docs/mockups/HERO_Section.png). */
export function Hero() {
  const t = useT()
  return (
    <section className="section section--hero" id="hero">
      <Reveal className="card">
        <Sun />
        <img
          className="card__ribbon"
          src={assets.ribbon.src}
          alt=""
          width={assets.ribbon.width}
          height={assets.ribbon.height}
        />
        <img
          className="card__heart"
          src={assets.heart.src}
          alt=""
          width={assets.heart.width}
          height={assets.heart.height}
        />
        <img
          className="card__sun"
          src={assets.sun.src}
          alt=""
          width={assets.sun.width}
          height={assets.sun.height}
        />
        <div className="card__body">
          <h1 className="card__title">{t(wedding.text.hero.saveTheDate)}</h1>
          <p className="card__name">{wedding.couple.a}</p>
          <p className="card__amp">{wedding.couple.ampersand}</p>
          <p className="card__name">{wedding.couple.b}</p>
          <p className="card__date">{wedding.dateLabel}</p>
        </div>
      </Reveal>
    </section>
  )
}
