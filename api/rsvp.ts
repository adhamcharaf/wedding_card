/**
 * RSVP par groupe d'invités (docs/CONCEPTION.md §7, ADR-0004).
 *
 * Fonction Vercel, même projet que le site, appelée par l'écran d'accueil et
 * le formulaire sur `/api/rsvp` :
 *   GET  ?code=4821  → le groupe de ce code (membres, présences, mots), ou 404.
 *   POST             → la réponse du groupe (présence et mot par membre).
 * Elle vérifie tout, refuse les envois après la clôture, et parle au script
 * attaché au Google Sheet d'Adham (`tools/sheets/Code.gs`), qui ne renvoie
 * jamais que le groupe demandé. L'adresse du script et le secret partagé
 * vivent dans les variables d'environnement Vercel, jamais dans le navigateur.
 *
 * Fonction volontairement sans import : Vercel compile les fichiers de `api/`
 * un par un, sans empaqueter ce qu'ils importent (docs/LESSONS.md).
 */

/**
 * Clôture des réponses : fin du 15 décembre 2026, heure d'Abidjan (UTC+0).
 * Même valeur que `rsvpClosesAt` dans `src/content/wedding.ts`, qui pilote
 * l'affichage ; les deux se changent ensemble. On peut encore consulter sa
 * réponse après, plus la changer.
 */
const CLOTURE = Date.parse('2026-12-16T00:00:00+00:00')

/** Longueurs maximales, pour ne pas laisser remplir le Sheet de romans. */
const MAX_NOM = 80
const MAX_MOT = 1000
/** Un groupe ne dépasse pas une grande famille. */
const MAX_MEMBRES = 20
/** Un code faux attend un peu avant sa réponse : deviner un code par essais successifs devient long. */
const DELAI_CODE_FAUX_MS = 800

const CODE = /^\d{4}$/

interface Membre {
  prenom: string
  nom: string
  presence: 'Oui' | 'Non'
  mot: string
}

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

const attendre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Chaîne nettoyée et bornée ; `null` si absente, vide ou trop longue. */
function texte(valeur: unknown, max: number): string | null {
  if (typeof valeur !== 'string') return null
  const propre = valeur.replace(/\s+/g, ' ').trim()
  return propre.length > 0 && propre.length <= max ? propre : null
}

/** Les membres reçus, ou `null` si la réponse n'est pas exploitable. */
function lireMembres(valeur: unknown): Membre[] | null {
  if (!Array.isArray(valeur) || valeur.length === 0 || valeur.length > MAX_MEMBRES) return null
  const membres: Membre[] = []
  for (const brut of valeur) {
    if (!brut || typeof brut !== 'object') return null
    const m = brut as Record<string, unknown>
    const prenom = texte(m.prenom, MAX_NOM)
    // Le nom est facultatif : la liste d'Adham a des invités connus par leur seul prénom.
    const nom = m.nom === undefined || m.nom === '' ? '' : texte(m.nom, MAX_NOM)
    if (!prenom || nom === null || (m.presence !== 'Oui' && m.presence !== 'Non')) return null
    const mot = m.mot === undefined || m.mot === '' ? '' : texte(m.mot, MAX_MOT)
    if (mot === null) return null
    membres.push({ prenom, nom, presence: m.presence, mot })
  }
  // Un mot obligatoire pour le groupe, pas pour chacun.
  if (!membres.some((m) => m.mot)) return null
  return membres
}

/** Parle au script du Sheet. Renvoie son JSON, ou lève si le script ne répond pas. */
async function sheet(corps: Record<string, unknown>): Promise<{ ok?: boolean; error?: string; groupe?: unknown }> {
  const url = process.env.RSVP_SHEET_URL
  const secret = process.env.RSVP_SECRET
  if (!url || !secret) throw new Error('config')
  // Le script Google répond par une redirection vers un domaine de contenu :
  // on la suit, et on lit le JSON qu'il renvoie.
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: JSON.stringify({ secret, ...corps }),
    redirect: 'follow',
  })
  if (!r.ok) throw new Error(String(r.status))
  return (await r.json()) as { ok?: boolean; error?: string; groupe?: unknown }
}

/** Le script ne répond pas, ou les variables manquent : le formulaire affichera une erreur. */
function panne(err: unknown): Response {
  const config = err instanceof Error && err.message === 'config'
  return json({ error: config ? 'config' : 'sheet' }, config ? 500 : 502)
}

export async function GET(request: Request): Promise<Response> {
  const code = new URL(request.url).searchParams.get('code') ?? ''
  if (!CODE.test(code)) {
    await attendre(DELAI_CODE_FAUX_MS)
    return json({ error: 'inconnu' }, 404)
  }
  try {
    const resultat = await sheet({ action: 'chercher', code })
    if (resultat.error === 'inconnu') {
      await attendre(DELAI_CODE_FAUX_MS)
      return json({ error: 'inconnu' }, 404)
    }
    if (!resultat.ok || !resultat.groupe) return json({ error: 'sheet' }, 502)
    return json({ ok: true, groupe: resultat.groupe })
  } catch (err) {
    return panne(err)
  }
}

export async function POST(request: Request): Promise<Response> {
  if (Date.now() >= CLOTURE) return json({ error: 'closed' }, 410)

  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return json({ error: 'invalid' }, 400)
  }
  if (!corps || typeof corps !== 'object') return json({ error: 'invalid' }, 400)
  const c = corps as Record<string, unknown>

  // Piège à robots : un champ invisible que seul un script remplit. On
  // répond « merci » sans rien enregistrer.
  if (typeof c.website === 'string' && c.website) return json({ ok: true })

  const code = typeof c.code === 'string' && CODE.test(c.code) ? c.code : null
  const membres = lireMembres(c.membres)
  if (!code || !membres) return json({ error: 'invalid' }, 400)
  const langue = c.lang === 'fr' ? 'fr' : 'en'

  try {
    const resultat = await sheet({ action: 'repondre', code, membres, langue, date: new Date().toISOString() })
    if (resultat.error === 'inconnu') {
      await attendre(DELAI_CODE_FAUX_MS)
      return json({ error: 'inconnu' }, 404)
    }
    if (!resultat.ok || !resultat.groupe) return json({ error: 'sheet' }, 502)
    return json({ ok: true, groupe: resultat.groupe })
  } catch (err) {
    return panne(err)
  }
}
