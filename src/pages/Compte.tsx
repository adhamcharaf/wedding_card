import { useEffect, useState, type MouseEvent } from 'react'
import { Background } from '../components/Background'
import { LangToggle } from '../components/LangToggle'
import { wedding } from '../content/wedding'
import { useDocumentLang, useT } from '../i18n/useT'

/**
 * Page `/compte` : les coordonnées bancaires, hors de la page principale pour
 * ne pas alourdir la liste de mariage. Même fond, même typographie, ni film
 * ni musique.
 */
export function Compte() {
  useDocumentLang()
  const t = useT()
  const b = wedding.text.bank
  const [copie, setCopie] = useState(false)

  useEffect(() => {
    if (!copie) return
    const id = window.setTimeout(() => setCopie(false), 2000)
    return () => window.clearTimeout(id)
  }, [copie])

  /** Revenir à la liste de mariage telle qu'on l'a quittée quand on vient du site ; sinon, la page d'accueil. */
  function retour(event: MouseEvent<HTMLAnchorElement>) {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
      event.preventDefault()
      window.history.back()
    }
  }

  function copierIban() {
    navigator.clipboard
      ?.writeText(wedding.bank.iban.replace(/\s/g, ''))
      .then(() => setCopie(true))
      .catch(() => {})
  }

  return (
    <>
      <Background />
      <LangToggle />
      <main className="column">
        <section className="section compte">
          <h1 className="section__title">{t(b.title)}</h1>
          <span className="vline" aria-hidden="true" />
          <dl className="compte__rows">
            <div>
              <dt>{t(b.holder)}</dt>
              <dd>{wedding.bank.holder}</dd>
            </div>
            <div>
              <dt>{t(b.bankName)}</dt>
              <dd>{wedding.bank.name}</dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd className="compte__code">{wedding.bank.iban}</dd>
            </div>
            <div>
              <dt>SWIFT</dt>
              <dd className="compte__code">{wedding.bank.swift}</dd>
            </div>
          </dl>
          <button className="btn" type="button" onClick={copierIban} aria-live="polite">
            {copie ? t(b.copied) : t(b.copy)}
          </button>
          <a className="compte__back" href="/" onClick={retour}>
            {t(b.back)}
          </a>
        </section>
      </main>
    </>
  )
}
