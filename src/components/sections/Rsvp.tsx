import type { FormEvent } from 'react'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { Reveal } from '../Reveal'

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6]

/** Formulaire RSVP. Non branché à cette étape : l'envoi arrive à l'étape 3. */
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

          <label className="field">
            <span className="field__label">{t(r.guests)}</span>
            <select className="field__input" name="guests" defaultValue="1">
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

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
