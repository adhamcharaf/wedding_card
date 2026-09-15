import { useEffect, useState } from 'react'
import { assets } from '../../content/assets'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

/** Liste de mariage, coordonnées bancaires et dessin du couple (docs/mockups/3.png). */
export function Registry() {
  const t = useT()
  const r = wedding.text.registry
  const [copie, setCopie] = useState(false)

  useEffect(() => {
    if (!copie) return
    const id = window.setTimeout(() => setCopie(false), 2000)
    return () => window.clearTimeout(id)
  }, [copie])

  function copierIban() {
    navigator.clipboard
      ?.writeText(wedding.bank.iban.replace(/\s/g, ''))
      .then(() => setCopie(true))
      .catch(() => {})
  }

  return (
    <section className="section" id="registry">
      <Reveal className="stack">
        <h2 className="section__title">{t(r.title)}</h2>
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
        <p className="registry__note">{t(r.inStore)}</p>

        <div className="bank">
          <h3 className="bank__title">{t(r.bankTitle)}</h3>
          <dl className="bank__rows">
            <div className="bank__row">
              <dt>{t(r.holder)}</dt>
              <dd>{wedding.bank.holder}</dd>
            </div>
            <div className="bank__row">
              <dt>{t(r.bankName)}</dt>
              <dd>{wedding.bank.name}</dd>
            </div>
            <div className="bank__row">
              <dt>IBAN</dt>
              <dd className="bank__code">{wedding.bank.iban}</dd>
            </div>
            <div className="bank__row">
              <dt>SWIFT</dt>
              <dd className="bank__code">{wedding.bank.swift}</dd>
            </div>
          </dl>
          <button className="btn bank__copy" type="button" onClick={copierIban} aria-live="polite">
            {copie ? t(r.copied) : t(r.copy)}
          </button>
        </div>

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
