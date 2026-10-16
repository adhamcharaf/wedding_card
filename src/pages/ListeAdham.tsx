import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Background } from '../components/Background'
import { LangToggle } from '../components/LangToggle'
import { wedding } from '../content/wedding'
import { useDocumentLang, useT } from '../i18n/useT'
import { cadeauxOfferts, offrir } from '../lib/cadeaux'

type Cadeau = (typeof wedding.adhamList)[number]
/** Fenêtre par-dessus la liste : on confirme, ça part, c'est fait, ou ça a échoué. */
type Fenetre = { etape: 'confirmer' | 'envoi' | 'merci' | 'deja' | 'erreur'; cadeau: Cadeau } | null

/**
 * Page `/adham` : les envies du marié (docs/CONCEPTION.md §5). Un aparté,
 * ouvert par une phrase sous la liste de mariage. Même fond, même typographie
 * et même sobriété que la page du compte, ni film ni musique ; le seul trait
 * d'humour est l'intro d'Adham. Le nom de chaque cadeau ouvre sa fiche produit,
 * à part. « Je l'offre » retire un cadeau de la liste pour tous les invités,
 * sans enregistrer qui l'offre (`/api/cadeaux`, onglet « Cadeaux » du Sheet).
 */
export function ListeAdham() {
  useDocumentLang()
  const t = useT()
  const a = wedding.text.adham
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
  const question = fenetre?.etape === 'confirmer' || fenetre?.etape === 'envoi'

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
          <span className="vline" aria-hidden="true" />
          <p className="adham__quote">
            {t(a.intro)}
            <span className="adham__by">{wedding.couple.a}</span>
          </p>

          {restants.length === 0 ? (
            <p className="adham__tout">{t(a.allGiven)}</p>
          ) : (
            <ul className="adham__list">
              {restants.map((item) => (
                <li className="adham__item" key={item.id}>
                  <a className="adham__name" href={item.url} target="_blank" rel="noopener noreferrer">
                    {t(item.name)}
                  </a>
                  {offerts && (
                    <button type="button" className="adham__offer" onClick={() => setFenetre({ etape: 'confirmer', cadeau: item })}>
                      {t(a.offer)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="adham__closing">{t(a.closing)}</p>
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
              {question && <p className="popup__gift">{t(fenetre.cadeau.name)}</p>}
              <p className="popup__text" id="cadeau-texte">
                {question
                  ? t(a.confirm)
                  : fenetre.etape === 'merci'
                    ? t(a.thanks)
                    : fenetre.etape === 'deja'
                      ? t(a.already)
                      : t(wedding.text.rsvp.errorGeneric)}
              </p>
              {question ? (
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
