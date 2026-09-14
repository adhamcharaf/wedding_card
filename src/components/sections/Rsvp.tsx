import { useState, type FormEvent } from 'react'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

/** Deux personnes au plus par réponse (décision du 2026-09-13). */
const MAX_GUESTS = 2
const GUEST_OPTIONS = Array.from({ length: MAX_GUESTS }, (_, i) => i + 1)

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

/** Formulaire RSVP. Non branché à cette étape : l'envoi arrive à l'étape 3. */
export function Rsvp() {
  const t = useT()
  const r = wedding.text.rsvp
  const [guests, setGuests] = useState(1)

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

          <label className="field">
            <span className="field__label">{t(r.guests)}</span>
            <select
              className="field__input"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <p className="field__note">{noteAvecLien(t(r.guestsNote), wedding.contact.whatsapp)}</p>

          {guests > 1 && (
            <label className="field">
              <span className="field__label">{t(r.guestName)}</span>
              <input className="field__input" name="guestName" type="text" autoComplete="off" required />
            </label>
          )}

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
