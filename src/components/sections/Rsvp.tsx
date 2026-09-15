import type { FormEvent } from 'react'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

/** Le mot « WhatsApp » de la note devient un lien wa.me quand le numéro est renseigné. */
function noteAvecLien(texte: string, numero: string) {
  const i = texte.indexOf('WhatsApp')
  if (!numero || i < 0) return texte
  return (
    <>
      {texte.slice(0, i)}
      <a className="link" href={`https://wa.me/${numero}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      {texte.slice(i + 'WhatsApp'.length)}
    </>
  )
}

/**
 * Formulaire RSVP. Une invitation vaut pour une personne (décision du 2026-09-15) :
 * pas de nombre de personnes. Non branché à cette étape : l'envoi arrive à l'étape 3.
 */
export function Rsvp() {
  const t = useT()
  const r = wedding.text.rsvp

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <section className="section" id="rsvp">
      <Reveal className="stack">
        <h2 className="section__title">{t(r.title)}</h2>
        <p className="lead">{t(r.intro)}</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">{t(r.name)}</span>
            <input className="field__input" name="name" type="text" autoComplete="name" required />
          </label>

          <fieldset className="field">
            <legend className="field__label">{t(r.attending)}</legend>
            <div className="choices">
              <label className="choice">
                <input type="radio" name="attending" value="yes" defaultChecked />
                <span>{t(r.yes)}</span>
              </label>
              <label className="choice">
                <input type="radio" name="attending" value="no" />
                <span>{t(r.no)}</span>
              </label>
            </div>
          </fieldset>

          <div className="field__note">
            <p>{t(r.children)}</p>
            <p>{noteAvecLien(t(r.extraGuest), wedding.contact.whatsapp)}</p>
          </div>

          <label className="field">
            <span className="field__label">{t(r.message)}</span>
            <textarea className="field__input" name="message" rows={3} />
          </label>

          <button className="btn btn--solid" type="submit" disabled>
            {t(r.send)}
          </button>
          <p className="form__note">{t(r.comingSoon)}</p>
        </form>
      </Reveal>
    </section>
  )
}
