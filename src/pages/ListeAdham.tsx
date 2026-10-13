import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Background } from '../components/Background'
import { LangToggle } from '../components/LangToggle'
import { assets } from '../content/assets'
import { wedding } from '../content/wedding'
import { useDocumentLang, useT } from '../i18n/useT'

/**
 * Page `/adham` : la liste d'Adham, commentée par Lara (docs/CONCEPTION.md §5).
 * Hors de la page principale pour garder la liste de mariage sobre. Même fond,
 * même typographie que la page du compte, ni film ni musique. Un nom court
 * par cadeau : le modèle exact se lit sur la fiche produit, ouverte à part.
 */
export function ListeAdham() {
  useDocumentLang()
  const t = useT()
  const a = wedding.text.adham
  const sticker = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Le sticker attend d'être à l'écran pour surgir : sinon l'effet se jouerait hors de vue.
  useEffect(() => {
    const el = sticker.current
    if (!el) return
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return
        setVisible(true)
        observateur.disconnect()
      },
      { threshold: 0.6 },
    )
    observateur.observe(el)
    return () => observateur.disconnect()
  }, [])

  /** Revenir à la liste de mariage telle qu'on l'a quittée quand on vient du site ; sinon, la page d'accueil. */
  function retour(event: MouseEvent<HTMLAnchorElement>) {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
      event.preventDefault()
      window.history.back()
    }
  }

  return (
    <>
      <Background />
      <LangToggle />
      <main className="column">
        <section className="section adham">
          <h1 className="section__title">{t(a.title)}</h1>
          <p className="adham__subtitle">{t(a.subtitle)}</p>
          <span className="vline" aria-hidden="true" />
          <p className="adham__quote">
            {t(a.warning)}
            <span className="adham__by">{wedding.couple.b}</span>
          </p>

          <ul className="adham__list">
            {wedding.adhamList.map((item) => (
              <li className="adham__item" key={item.url}>
                <div className="adham__row">
                  <span className="adham__name">{t(item.name)}</span>
                  <a className="adham__see" href={item.url} target="_blank" rel="noopener noreferrer">
                    {t(a.see)}
                  </a>
                </div>
                <p className="adham__lara">{t(item.lara)}</p>
              </li>
            ))}
          </ul>

          <p className="adham__ps">{t(a.ps)}</p>
          <div ref={sticker} className={visible ? 'adham__cachette is-visible' : 'adham__cachette'}>
            <img
              className="adham__sticker"
              src={assets.adhamSticker.src}
              alt={t(a.stickerAlt)}
              width={assets.adhamSticker.width}
              height={assets.adhamSticker.height}
            />
          </div>

          <a className="compte__back" href="/" onClick={retour}>
            {t(wedding.text.bank.back)}
          </a>
        </section>
      </main>
    </>
  )
}
