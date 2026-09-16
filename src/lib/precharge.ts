/**
 * Téléchargement d'un fichier en mémoire avec suivi de progression.
 * Sert à la musique et au film pendant l'écran d'accueil : l'invité voit
 * le trait avancer, et le tap n'est proposé que quand tout est là.
 */
export interface Progression {
  recus: number
  total: number
}

export async function telechargerEnMemoire(
  url: string,
  signal?: AbortSignal,
  surProgres?: (p: Progression) => void,
): Promise<string> {
  const reponse = await fetch(url, { signal })
  if (!reponse.ok || !reponse.body) throw new Error(String(reponse.status))
  const total = Number(reponse.headers.get('content-length')) || 0
  const lecteur = reponse.body.getReader()
  const morceaux: Uint8Array[] = []
  let recus = 0
  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    morceaux.push(value)
    recus += value.byteLength
    surProgres?.({ recus, total: Math.max(total, recus) })
  }
  const blob = new Blob(morceaux as BlobPart[], { type: reponse.headers.get('content-type') ?? '' })
  return URL.createObjectURL(blob)
}
