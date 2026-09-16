import { useState, type FormEvent } from 'react'
import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { useAppStore } from '../../store/useAppStore'
import { Reveal } from '../Reveal'

/** Le mot « WhatsApp » d'un texte devient un lien wa.me quand le numéro est renseigné. */
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

type Etat = 'saisie' | 'incomplet' | 'envoi' | 'merci' | 'erreur' | 'clos'

/**
 * Formulaire RSVP (docs/CONCEPTION.md §7). Une invitation vaut pour une
 * personne : prénom, nom, présence, un mot obligatoire. La réponse part vers
 * `/api/rsvp`, qui l'ajoute au Google Sheet d'Adham. Après la clôture, le
 * formulaire laisse place au message de fermeture.
 */
export function Rsvp() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const prenom = useAppStore((s) => s.prenom) ?? ''
  const r = wedding.text.rsvp
  const [etat, setEtat] = useState<Etat>(() =>
    Date.now() >= Date.parse(wedding.rsvpClosesAt) ? 'clos' : 'saisie',
  )

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const donnees = new FormData(event.currentTarget)
    const champ = (nom: string) => String(donnees.get(nom) ?? '').trim()
    const corps = {
      firstName: champ('firstName'),
      lastName: champ('lastName'),
      attending: donnees.get('attending') === 'yes',
      message: champ('message'),
      website: champ('website'),
      lang,
    }
    if (!corps.firstName || !corps.lastName || !corps.message) {
      setEtat('incomplet')
      return
    }
    setEtat('envoi')
    try {
      const reponse = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corps),
      })
      if (reponse.status === 410) {
        setEtat('clos')
        return
      }
      // Un vrai « ok » de la fonction, pas seulement un code 200 : une page
      // HTML renvoyée par erreur ne doit pas passer pour un succès.
      const resultat = (await reponse.json()) as { ok?: boolean }
      if (!reponse.ok || resultat.ok !== true) throw new Error(String(reponse.status))
      setEtat('merci')
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <section className="section" id="rsvp">
      <Reveal className="stack">
        <h2 className="section__title">{t(r.title)}</h2>

        {etat === 'clos' && <p className="lead">{noteAvecLien(t(r.closed), wedding.contact.whatsapp)}</p>}

        {etat === 'merci' && (
          <p className="lead" role="status">
            {t(r.success)}
          </p>
        )}

        {etat !== 'clos' && etat !== 'merci' && (
          <>
            <p className="lead">{t(r.intro)}</p>
            <form className="form" onSubmit={envoyer} noValidate>
              <label className="field">
                <span className="field__label">{t(r.firstName)}</span>
                <input className="field__input" name="firstName" type="text" autoComplete="given-name" maxLength={80} defaultValue={prenom} />
              </label>

              <label className="field">
                <span className="field__label">{t(r.lastName)}</span>
                <input className="field__input" name="lastName" type="text" autoComplete="family-name" maxLength={80} />
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
                <textarea className="field__input" name="message" rows={3} maxLength={1000} />
              </label>

              {/* Piège à robots : un humain ne le voit pas, un script le remplit. */}
              <input className="form__hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <button className="btn btn--solid" type="submit" disabled={etat === 'envoi'}>
                {etat === 'envoi' ? t(r.sending) : t(r.send)}
              </button>

              <p className="form__note">{t(r.deadline)}</p>

              {(etat === 'incomplet' || etat === 'erreur') && (
                <p className="form__status" role="alert">
                  {t(etat === 'incomplet' ? r.errorFields : r.errorGeneric)}
                </p>
              )}
            </form>
          </>
        )}
      </Reveal>
    </section>
  )
}
