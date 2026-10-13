import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Background } from '../components/Background'
import { LangToggle } from '../components/LangToggle'
import { assets } from '../content/assets'
import { wedding } from '../content/wedding'
import { useDocumentLang, useT } from '../i18n/useT'
import { cadeauxOfferts, offrir } from '../lib/cadeaux'

type Cadeau = (typeof wedding.adhamList)[number]
/** Fenêtre par-dessus la liste : on confirme, ça part, c'est fait, ou ça a échoué. */
type Fenetre =
  | { etape: 'confirmer' | 'envoi'; cadeau: Cadeau }
  | { etape: 'merci' | 'deja' | 'erreur'; cadeau: Cadeau }
  | null

/** « La box Hue » au milieu d'une phrase : « la box Hue ». */
const enMinuscule = (nom: string) => nom.charAt(0).toLocaleLowerCase() + nom.slice(1)

/**
 * Page `/adham` : la liste d'Adham, commentée par Lara (docs/CONCEPTION.md §5).
 * Hors de la page principale pour garder la liste de mariage sobre. Même fond,
 * même typographie que la page du compte, ni film ni musique. Un nom court
 * par cadeau : le modèle exact se lit sur la fiche produit, ouverte à part.
 * « Je l'offre » retire un cadeau de la liste pour tous les invités, sans
 * enregistrer qui l'offre (`/api/cadeaux`, onglet « Cadeaux » du Sheet).
 */
export function ListeAdham() {
  useDocumentLang()
  const t = useT()
  const a = wedding.text.adham
  const sticker = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  /** Cadeaux déjà offerts ; `null` tant que la liste n'est pas connue : pas de bouton « Je l'offre » sans elle. */
  const [offerts, setOfferts] = useState<string[] | null>(null)
  const [fenetre, setFenetre] = useState<Fenetre>(null)

  // Les cadeaux déjà offerts disparaissent. Sans réponse du serveur, la liste
  // reste entière et les boutons « Je l'offre » ne s'affichent pas.
  useEffect(() => {
    let actif = true
    cadeauxOfferts().then(
      (ids) => actif && setOfferts(ids),
      () => {},
    )
    return () => {
      actif = false
    }
  }, [])

  // Échap ferme la fenêtre, sauf pendant l'envoi.
  useEffect(() => {
    if (!fenetre || fenetre.etape === 'envoi') return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFenetre(null)
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [fenetre])

  async function confirmer(cadeau: Cadeau) {
    setFenetre({ etape: 'envoi', cadeau })
    try {
      const r = await offrir(cadeau.id)
      setOfferts(r.offerts)
      setFenetre({ etape: r.deja ? 'deja' : 'merci', cadeau })
    } catch {
      setFenetre({ etape: 'erreur', cadeau })
    }
  }

  const restants = wedding.adhamList.filter((item) => !offerts?.includes(item.id))

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

          {restants.length === 0 ? (
            <p className="adham__tout">{t(a.allGiven)}</p>
          ) : (
            <ul className="adham__list">
              {restants.map((item) => (
                <li className="adham__item" key={item.id}>
                  <div className="adham__row">
                    <span className="adham__name">{t(item.name)}</span>
                    <a className="adham__see" href={item.url} target="_blank" rel="noopener noreferrer">
                      {t(a.see)}
                    </a>
                  </div>
                  <p className="adham__lara">{t(item.lara)}</p>
                  {offerts && (
                    <button type="button" className="adham__offer" onClick={() => setFenetre({ etape: 'confirmer', cadeau: item })}>
                      {t(a.offer)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

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

      {/* Même fenêtre que celle du RSVP, portée dans body. */}
      {fenetre &&
        createPortal(
          <div
            className="popup"
            role="alertdialog"
            aria-modal="true"
            aria-describedby="cadeau-texte"
            onClick={() => fenetre.etape !== 'envoi' && setFenetre(null)}
          >
            <div className="popup__card" onClick={(e) => e.stopPropagation()}>
              <p className="popup__text" id="cadeau-texte">
                {fenetre.etape === 'confirmer' || fenetre.etape === 'envoi'
                  ? t(a.confirm).replace('{gift}', enMinuscule(t(fenetre.cadeau.name)))
                  : fenetre.etape === 'merci'
                    ? t(a.thanks)
                    : fenetre.etape === 'deja'
                      ? t(a.already)
                      : t(wedding.text.rsvp.errorGeneric)}
              </p>
              {fenetre.etape === 'confirmer' || fenetre.etape === 'envoi' ? (
                <>
                  <button
                    type="button"
                    className="btn btn--solid"
                    disabled={fenetre.etape === 'envoi'}
                    onClick={() => confirmer(fenetre.cadeau)}
                    autoFocus
                  >
                    {fenetre.etape === 'envoi' ? t(wedding.text.rsvp.sending) : t(a.yes)}
                  </button>
                  <button type="button" className="popup__cancel" disabled={fenetre.etape === 'envoi'} onClick={() => setFenetre(null)}>
                    {t(a.cancel)}
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn--solid" onClick={() => setFenetre(null)} autoFocus>
                  {t(a.close)}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
