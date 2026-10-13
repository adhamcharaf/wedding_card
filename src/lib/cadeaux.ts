/**
 * Cadeaux déjà offerts de la liste d'Adham, via `/api/cadeaux` (docs/CONCEPTION.md §5).
 * Rien n'identifie la personne qui offre.
 */

interface Reponse {
  ok?: boolean
  deja?: boolean
  offerts?: string[]
}

async function lire(reponse: Response): Promise<Required<Reponse>> {
  const corps = (await reponse.json()) as Reponse
  if (!reponse.ok || corps.ok !== true || !Array.isArray(corps.offerts)) throw new Error(String(reponse.status))
  return { ok: true, deja: corps.deja === true, offerts: corps.offerts }
}

/** Les identifiants des cadeaux déjà offerts. */
export async function cadeauxOfferts(): Promise<string[]> {
  return (await lire(await fetch('/api/cadeaux'))).offerts
}

/** Marque un cadeau comme offert. `deja` : quelqu'un l'avait offert juste avant. */
export async function offrir(cadeau: string): Promise<{ deja: boolean; offerts: string[] }> {
  const r = await lire(
    await fetch('/api/cadeaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cadeau }),
    }),
  )
  return { deja: r.deja, offerts: r.offerts }
}
