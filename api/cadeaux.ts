/**
 * Cadeaux déjà offerts de la liste d'Adham (page `/adham`, docs/CONCEPTION.md §5).
 *
 * Fonction Vercel, même projet que le site :
 *   GET   → les identifiants des cadeaux déjà offerts.
 *   POST  → { cadeau } : marque ce cadeau comme offert, et renvoie la liste à jour.
 * Rien n'identifie la personne qui offre : ni nom, ni code d'invitation. Le
 * Sheet d'Adham garde l'identifiant du cadeau et la date (onglet « Cadeaux »,
 * `tools/sheets/Code.gs`) ; effacer la ligne remet le cadeau en liste.
 *
 * Fonction volontairement sans import : Vercel compile les fichiers de `api/`
 * un par un, sans empaqueter ce qu'ils importent (docs/LESSONS.md).
 */

/**
 * Identifiants acceptés : les cadeaux de `wedding.adhamList` dans
 * `src/content/wedding.ts`. Un cadeau ajouté là s'ajoute ici aussi.
 */
const CADEAUX = new Set(['box-hue', 'barres-hue', 'enceinte-denon', 'platine', 'echo-show', 'apple-tv'])

interface Resultat {
  ok?: boolean
  error?: string
  /** Le cadeau était déjà offert quand la demande est arrivée. */
  deja?: boolean
  offerts?: unknown
}

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

/** Parle au script du Sheet. Renvoie son JSON, ou lève si le script ne répond pas. */
async function sheet(corps: Record<string, unknown>): Promise<Resultat> {
  const url = process.env.RSVP_SHEET_URL
  const secret = process.env.RSVP_SECRET
  if (!url || !secret) throw new Error('config')
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: JSON.stringify({ secret, ...corps }),
    redirect: 'follow',
  })
  if (!r.ok) throw new Error(String(r.status))
  return (await r.json()) as Resultat
}

/** Ne garde que des identifiants connus : le Sheet peut contenir une ligne tapée à la main. */
function connus(valeur: unknown): string[] {
  return Array.isArray(valeur) ? valeur.filter((id): id is string => typeof id === 'string' && CADEAUX.has(id)) : []
}

function panne(err: unknown): Response {
  const config = err instanceof Error && err.message === 'config'
  return json({ error: config ? 'config' : 'sheet' }, config ? 500 : 502)
}

export async function GET(): Promise<Response> {
  try {
    const resultat = await sheet({ action: 'cadeaux' })
    if (!resultat.ok) return json({ error: 'sheet' }, 502)
    return json({ ok: true, offerts: connus(resultat.offerts) })
  } catch (err) {
    return panne(err)
  }
}

export async function POST(request: Request): Promise<Response> {
  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return json({ error: 'invalid' }, 400)
  }
  if (!corps || typeof corps !== 'object') return json({ error: 'invalid' }, 400)
  const c = corps as Record<string, unknown>

  // Piège à robots, comme pour le RSVP : un humain ne remplit jamais ce champ.
  if (typeof c.website === 'string' && c.website) return json({ ok: true, offerts: [] })

  const cadeau = typeof c.cadeau === 'string' && CADEAUX.has(c.cadeau) ? c.cadeau : null
  if (!cadeau) return json({ error: 'invalid' }, 400)

  try {
    const resultat = await sheet({ action: 'offrir', cadeau })
    if (!resultat.ok) return json({ error: 'sheet' }, 502)
    return json({ ok: true, deja: resultat.deja === true, offerts: connus(resultat.offerts) })
  } catch (err) {
    return panne(err)
  }
}
