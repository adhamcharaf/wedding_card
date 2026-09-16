import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { wedding } from '../../content/wedding'
import { nommer, useT } from '../../i18n/useT'
import { CODE, CodeInconnu, chercherGroupe, nomComplet, repondre, type Groupe, type Presence } from '../../lib/groupe'
import { useAppStore } from '../../store/useAppStore'
import { noteAvecLien } from '../NoteWhatsApp'
import { Reveal } from '../Reveal'

/**
 * `code` : pas de code reconnu, on le demande ici. `chargement` : on retrouve
 * le groupe. `saisie` : la liste à remplir. `envoi` : en route. `resume` :
 * la réponse déjà donnée, modifiable. `panne` : le serveur ne répond pas.
 * `clos` : après la clôture.
 */
type Etat = 'code' | 'chargement' | 'saisie' | 'envoi' | 'resume' | 'panne' | 'clos'
/** Fenêtre par-dessus le formulaire : il manque quelque chose, ou l'envoi a échoué. */
type Fenetre = { type: 'manquant'; champs: string[] } | { type: 'erreur' } | null
/** Ce que l'invité remplit pour chaque membre, dans l'ordre du groupe. */
interface Saisie {
  presence: Presence
  mot: string
  /** Champ du mot déplié à la main (il l'est aussi s'il contient déjà un mot, ou pour la personne qui tient le téléphone). */
  ouvert: boolean
}

const memeNom = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

/**
 * Formulaire RSVP par groupe (docs/CONCEPTION.md §7, ADR-0004). Le code
 * d'invitation, vérifié à l'accueil, donne la liste du groupe : chaque
 * membre a Oui / Non et, s'il le souhaite, un mot ; un seul envoi pour tous,
 * au moins un mot dans le groupe. La réponse reste modifiable jusqu'à la
 * clôture, et chacun peut revenir ajouter son mot sans effacer les autres.
 */
export function Rsvp() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const prenom = useAppStore((s) => s.prenom) ?? ''
  const code = useAppStore((s) => s.code)
  const setCode = useAppStore((s) => s.setCode)
  const r = wedding.text.rsvp
  const clos = Date.now() >= Date.parse(wedding.rsvpClosesAt)

  const [etat, setEtat] = useState<Etat>(clos ? 'clos' : code ? 'chargement' : 'code')
  const [groupe, setGroupe] = useState<Groupe | null>(null)
  const [saisies, setSaisies] = useState<Saisie[]>([])
  const [codeSaisi, setCodeSaisi] = useState('')
  const [codeInconnu, setCodeInconnu] = useState(false)
  const [merci, setMerci] = useState(false)
  const [fenetre, setFenetre] = useState<Fenetre>(null)
  /** Ce qui manquait au dernier envoi, souligné jusqu'au suivant. */
  const [marques, setMarques] = useState<{ membres: number[]; mot: boolean }>({ membres: [], mot: false })
  const formulaire = useRef<HTMLFormElement>(null)

  /** Le groupe est là : sa réponse, ou la liste à remplir (préremplie si on modifie). */
  function afficher(g: Groupe, modifier: boolean) {
    setGroupe(g)
    setCode(g.code)
    setCodeInconnu(false)
    if (g.membres.some((m) => m.presence !== '') && !modifier) {
      setEtat('resume')
      return
    }
    setSaisies(g.membres.map((m) => ({ presence: m.presence, mot: m.mot, ouvert: false })))
    setMarques({ membres: [], mot: false })
    setEtat('saisie')
  }

  /** Code inconnu : on le redemande ici. Autre chose : le serveur ne répond pas. */
  function echouer(err: unknown, codeVoulu: string) {
    if (err instanceof CodeInconnu) {
      chargePour.current = null
      setCode(null)
      setCodeSaisi(codeVoulu)
      setCodeInconnu(true)
      setEtat('code')
    } else {
      setEtat('panne')
    }
  }

  /** Code dont le groupe est chargé ou en cours de chargement : l'effet ci-dessous ne le recharge pas. */
  const chargePour = useRef<string | null>(null)

  /** Passe en `chargement` puis retrouve le groupe. */
  function charger(codeVoulu: string, frais: boolean, modifier = false) {
    chargePour.current = codeVoulu
    setEtat('chargement')
    chercherGroupe(codeVoulu, frais).then(
      (g) => afficher(g, modifier),
      (err) => echouer(err, codeVoulu),
    )
  }

  // Le code arrive du store : mémorisé d'une visite précédente, ou vérifié par
  // l'accueil pendant que cette section attendait derrière le film (même
  // réponse, en cache). L'état initial est déjà `chargement` dans le premier cas.
  useEffect(() => {
    if (clos || !code || chargePour.current === code) return
    chargePour.current = code
    let actif = true
    chercherGroupe(code, false).then(
      (g) => actif && afficher(g, false),
      (err) => actif && echouer(err, code),
    )
    return () => {
      actif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // Échap ferme la fenêtre.
  useEffect(() => {
    if (!fenetre) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  })

  /** Ferme la fenêtre et pose le curseur sur le premier manque. */
  function fermer() {
    setFenetre(null)
    formulaire.current?.querySelector<HTMLElement>('.is-manquant input, .is-manquant textarea')?.focus()
  }

  function retrouver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (CODE.test(codeSaisi)) charger(codeSaisi, true)
  }

  function modifierSaisie(i: number, patch: Partial<Saisie>) {
    setSaisies((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  }

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!groupe || !code) return
    const donnees = new FormData(event.currentTarget)
    const website = String(donnees.get('website') ?? '')
    const sansReponse = groupe.membres.map((_, i) => i).filter((i) => saisies[i].presence === '')
    const sansMot = !saisies.some((s) => s.mot.trim() !== '')
    setMarques({ membres: sansReponse, mot: sansMot })
    if (sansReponse.length > 0 || sansMot) {
      const manques = sansReponse.map((i) => nommer(t(r.missingPresence), groupe.membres[i].prenom))
      if (sansMot) manques.push(t(r.missingWord))
      setFenetre({ type: 'manquant', champs: manques })
      return
    }
    setEtat('envoi')
    try {
      const g = await repondre(
        code,
        groupe.membres.map((m, i) => ({
          prenom: m.prenom,
          nom: m.nom,
          presence: saisies[i].presence as 'Oui' | 'Non',
          mot: saisies[i].mot.trim(),
        })),
        lang,
        website,
      )
      setGroupe(g)
      setMerci(true)
      setEtat('resume')
    } catch (err) {
      if (err instanceof Error && err.message === 'closed') {
        setEtat('clos')
      } else if (err instanceof CodeInconnu) {
        setCode(null)
        setCodeSaisi(code)
        setCodeInconnu(true)
        setEtat('code')
      } else {
        setEtat('saisie')
        setFenetre({ type: 'erreur' })
      }
    }
  }

  const presenceLibelle = (p: Presence) => (p === 'Oui' ? t(r.yes) : p === 'Non' ? t(r.no) : t(r.pending))
  const dateReponse = () => {
    const iso = groupe?.membres.map((m) => m.reponduLe).filter(Boolean).sort().at(-1)
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long' })
  }
  // Le mot de la personne qui tient le téléphone est ouvert d'office : le prénom de l'accueil arrive après le groupe.
  const motOuvert = (i: number) => saisies[i].ouvert || saisies[i].mot !== '' || (prenom !== '' && memeNom(groupe!.membres[i].prenom, prenom))
  const dejaRepondu = groupe?.membres.some((m) => m.presence !== '') ?? false

  return (
    <section className="section" id="rsvp">
      <Reveal className="stack">
        <h2 className="section__title">{t(r.title)}</h2>

        {etat === 'clos' && <p className="lead">{noteAvecLien(t(r.closed))}</p>}

        {etat === 'chargement' && (
          <p className="lead" role="status">
            {t(r.loading)}
          </p>
        )}

        {etat === 'panne' && (
          <>
            <p className="lead" role="alert">
              {t(r.errorGeneric)}
            </p>
            <button type="button" className="btn" onClick={() => code && charger(code, true)}>
              {t(r.retry)}
            </button>
          </>
        )}

        {etat === 'code' && (
          <>
            <p className="lead">{t(r.intro)}</p>
            <form className="form" onSubmit={retrouver} noValidate>
              <label className="field">
                <span className="field__label">{t(r.code)}</span>
                <input
                  className={codeInconnu ? 'field__input field__code is-manquant' : 'field__input field__code'}
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={codeSaisi}
                  onChange={(e) => {
                    setCodeSaisi(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setCodeInconnu(false)
                  }}
                  aria-invalid={codeInconnu}
                />
              </label>
              {codeInconnu && (
                <p className="form__note" role="alert">
                  {noteAvecLien(t(r.codeUnknown))}
                </p>
              )}
              <button className="btn btn--solid" type="submit" disabled={!CODE.test(codeSaisi)}>
                {t(r.find)}
              </button>
            </form>
          </>
        )}

        {etat === 'resume' && groupe && (
          <>
            {merci && (
              <p className="lead" role="status">
                {t(r.success)}
              </p>
            )}
            <p className="resume__title">{t(r.answered).replace('{date}', dateReponse())}</p>
            <ul className="resume">
              {groupe.membres.map((m, i) => (
                <li key={i} className="resume__item">
                  <span className="resume__nom">{nomComplet(m)}</span>
                  <span className="resume__presence">{presenceLibelle(m.presence)}</span>
                  {m.mot && <span className="resume__mot">« {m.mot} »</span>}
                </li>
              ))}
            </ul>
            <button type="button" className="btn" onClick={() => code && charger(code, true, true)}>
              {t(r.edit)}
            </button>
            <p className="form__note">{t(r.deadline)}</p>
          </>
        )}

        {(etat === 'saisie' || etat === 'envoi') && groupe && (
          <>
            <p className="lead">{t(r.intro)}</p>
            <form className="form" onSubmit={envoyer} noValidate ref={formulaire}>
              <ul className="membres">
                {groupe.membres.map((m, i) => {
                  const s = saisies[i]
                  const nom = nomComplet(m)
                  return (
                    <li key={i} className={marques.membres.includes(i) && s.presence === '' ? 'membre is-manquant' : 'membre'}>
                      <fieldset className="field">
                        <legend className="membre__nom">{nom}</legend>
                        <div className="choices">
                          <label className="choice">
                            <input type="radio" name={`presence-${i}`} checked={s.presence === 'Oui'} onChange={() => modifierSaisie(i, { presence: 'Oui' })} />
                            <span>{t(r.yes)}</span>
                          </label>
                          <label className="choice">
                            <input type="radio" name={`presence-${i}`} checked={s.presence === 'Non'} onChange={() => modifierSaisie(i, { presence: 'Non' })} />
                            <span>{t(r.no)}</span>
                          </label>
                        </div>
                      </fieldset>
                      {motOuvert(i) ? (
                        <label className={marques.mot && s.mot.trim() === '' ? 'field is-manquant' : 'field'}>
                          <span className="field__label">{nommer(t(r.wordFrom), m.prenom)}</span>
                          <textarea className="field__input" name={`mot-${i}`} rows={2} maxLength={1000} value={s.mot} onChange={(e) => modifierSaisie(i, { mot: e.target.value })} />
                        </label>
                      ) : (
                        <button type="button" className="membre__mot" onClick={() => modifierSaisie(i, { ouvert: true })}>
                          {t(r.addWord)}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="field__note">
                <p>{t(r.children)}</p>
                <p>{noteAvecLien(t(r.extraGuest))}</p>
              </div>

              {/* Piège à robots : un humain ne le voit pas, un script le remplit. */}
              <input className="form__hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <button className="btn btn--solid" type="submit" disabled={etat === 'envoi'}>
                {etat === 'envoi' ? t(r.sending) : t(r.send)}
              </button>
              {dejaRepondu && etat === 'saisie' && (
                <button type="button" className="form__cancel" onClick={() => setEtat('resume')}>
                  {t(r.cancel)}
                </button>
              )}

              <p className="form__note">{t(r.deadline)}</p>
            </form>
          </>
        )}
      </Reveal>

      {/* Portée dans body : aucun contexte d'empilement de la page ne peut passer devant. */}
      {fenetre &&
        createPortal(
          <div className="popup" role="alertdialog" aria-modal="true" aria-describedby="rsvp-popup-texte" onClick={fermer}>
            <div className="popup__card" onClick={(e) => e.stopPropagation()}>
              <p className="popup__text" id="rsvp-popup-texte">
                {fenetre.type === 'manquant' ? t(r.missing).replace('{fields}', fenetre.champs.join(', ')) : t(r.errorGeneric)}
              </p>
              <button type="button" className="btn btn--solid" onClick={fermer} autoFocus>
                {t(r.ok)}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
