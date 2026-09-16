/**
 * Le groupe d'invités derrière un code (docs/CONCEPTION.md §7, ADR-0004).
 * L'écran d'accueil vérifie le code pendant que le film se télécharge, et le
 * formulaire réutilise la même réponse : une seule recherche par visite,
 * sauf demande explicite d'une version fraîche.
 */

export type Presence = 'Oui' | 'Non' | ''

export interface Membre {
  prenom: string
  nom: string
  presence: Presence
  mot: string
  /** ISO, ou '' tant que la personne n'a pas de réponse. */
  reponduLe: string
}

export interface Groupe {
  code: string
  nom: string
  membres: Membre[]
}

/** Réponse envoyée pour un membre. */
export interface Reponse {
  prenom: string
  nom: string
  presence: 'Oui' | 'Non'
  mot: string
}

/** Un code d'invitation : exactement 4 chiffres. */
export const CODE = /^\d{4}$/

/** Le code ne correspond à aucune invitation (404). Les autres erreurs sont des pannes. */
export class CodeInconnu extends Error {
  constructor() {
    super('inconnu')
  }
}

let cache: { code: string; promesse: Promise<Groupe> } | null = null

/** Le code écrit dans le lien : `/4821` ou `?c=4821`. */
export function codeDepuisUrl(): string | null {
  const { pathname, searchParams } = new URL(window.location.href)
  const chemin = pathname.replace(/^\//, '')
  if (CODE.test(chemin)) return chemin
  const param = searchParams.get('c') ?? ''
  return CODE.test(param) ? param : null
}

async function lire(reponse: Response): Promise<Groupe> {
  if (reponse.status === 404) throw new CodeInconnu()
  const corps = (await reponse.json()) as { ok?: boolean; groupe?: Groupe }
  if (!reponse.ok || corps.ok !== true || !corps.groupe) throw new Error(String(reponse.status))
  return corps.groupe
}

export function chercherGroupe(code: string, frais = false): Promise<Groupe> {
  if (!frais && cache?.code === code) return cache.promesse
  const promesse = fetch(`/api/rsvp?code=${code}`).then(lire)
  cache = { code, promesse }
  // Une panne ne reste pas en cache : le prochain appel réessaie.
  promesse.catch((err) => {
    if (!(err instanceof CodeInconnu) && cache?.promesse === promesse) cache = null
  })
  return promesse
}

/** Envoie la réponse du groupe et renvoie son état à jour, qui devient la version en cache. */
export async function repondre(code: string, membres: Reponse[], lang: string, website = ''): Promise<Groupe> {
  const reponse = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, membres, lang, website }),
  })
  if (reponse.status === 410) throw new Error('closed')
  const groupe = await lire(reponse)
  cache = { code, promesse: Promise.resolve(groupe) }
  return groupe
}
