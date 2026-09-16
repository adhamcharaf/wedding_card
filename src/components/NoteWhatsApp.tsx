import type { ReactNode } from 'react'
import { wedding } from '../content/wedding'

/**
 * Le mot « WhatsApp » d'un texte devient un lien vers la conversation avec
 * les mariés, quand `wedding.contact.whatsapp` est renseigné. Sinon le texte
 * reste tel quel.
 */
export function noteAvecLien(texte: string): ReactNode {
  const numero = wedding.contact.whatsapp
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
