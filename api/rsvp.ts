/**
 * Réception des réponses RSVP (docs/CONCEPTION.md §7, ADR-0003).
 *
 * Fonction Vercel, même projet que le site, appelée par le formulaire sur
 * `/api/rsvp`. Elle vérifie la réponse, refuse tout après la date de
 * clôture, et transmet une ligne au Google Sheet d'Adham via le script
 * attaché au fichier (`tools/sheets/Code.gs`). L'adresse du script et le
 * secret partagé vivent dans les variables d'environnement Vercel, jamais
 * dans le navigateur.
 *
 * Fonction volontairement sans import : Vercel compile les fichiers de `api/`
 * un par un, sans empaqueter ce qu'ils importent (docs/LESSONS.md).
 */

/**
 * Clôture des réponses : fin du 15 décembre 2026, heure d'Abidjan (UTC+0).
 * Même valeur que `rsvpClosesAt` dans `src/content/wedding.ts`, qui pilote
 * l'affichage ; les deux se changent ensemble.
 */
const CLOTURE = Date.parse('2026-12-16T00:00:00+00:00')

/** Longueurs maximales, pour ne pas laisser remplir le Sheet de romans. */
const MAX_NOM = 80
const MAX_MESSAGE = 1000

interface Reponse {
  firstName: string
  lastName: string
  attending: boolean
  message: string
  lang: 'fr' | 'en'
}

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

/** Chaîne nettoyée et bornée, ou null si absente ou vide. */
function texte(valeur: unknown, max: number): string | null {
  if (typeof valeur !== 'string') return null
  const propre = valeur.replace(/\s+/g, ' ').trim()
  return propre.length > 0 && propre.length <= max ? propre : null
}

/** Valide le corps reçu. `null` si une réponse n'est pas exploitable. */
function lire(corps: unknown): Reponse | null {
  if (!corps || typeof corps !== 'object') return null
  const c = corps as Record<string, unknown>
  const firstName = texte(c.firstName, MAX_NOM)
  const lastName = texte(c.lastName, MAX_NOM)
  const message = texte(c.message, MAX_MESSAGE)
  const lang = c.lang === 'fr' ? 'fr' : 'en'
  if (!firstName || !lastName || !message || typeof c.attending !== 'boolean') return null
  return { firstName, lastName, attending: c.attending, message, lang }
}

export async function POST(request: Request): Promise<Response> {
  if (Date.now() >= CLOTURE) return json({ error: 'closed' }, 410)

  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return json({ error: 'invalid' }, 400)
  }

  // Piège à robots : un champ invisible que seul un script remplit. On
  // répond « merci » sans rien enregistrer.
  if (typeof (corps as Record<string, unknown>)?.website === 'string' && (corps as Record<string, unknown>).website) {
    return json({ ok: true })
  }

  const reponse = lire(corps)
  if (!reponse) return json({ error: 'invalid' }, 400)

  const url = process.env.RSVP_SHEET_URL
  const secret = process.env.RSVP_SECRET
  if (!url || !secret) return json({ error: 'config' }, 500)

  // Le script Google répond par une redirection vers un domaine de contenu :
  // on la suit, et on lit le JSON qu'il renvoie.
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: JSON.stringify({
        secret,
        date: new Date().toISOString(),
        prenom: reponse.firstName,
        nom: reponse.lastName,
        presence: reponse.attending ? 'Oui' : 'Non',
        message: reponse.message,
        langue: reponse.lang,
      }),
      redirect: 'follow',
    })
    const resultat = (await r.json()) as { ok?: boolean; error?: string }
    if (!r.ok || !resultat.ok) return json({ error: 'sheet' }, 502)
  } catch {
    return json({ error: 'sheet' }, 502)
  }

  return json({ ok: true })
}
