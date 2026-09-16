/**
 * Script attaché au Google Sheet des réponses RSVP (docs/CONCEPTION.md §7, ADR-0003).
 *
 * Le site n'appelle jamais ce script directement : la fonction Vercel
 * `api/rsvp.ts` lui transmet chaque réponse avec le secret partagé, et le
 * script ajoute une ligne dans la première feuille du fichier.
 *
 * Installation, une seule fois (cinq minutes) :
 *   1. Créer un Google Sheet vide, par exemple « RSVP mariage ».
 *   2. Menu Extensions → Apps Script. Remplacer tout le contenu par ce fichier.
 *   3. Remplacer la valeur de SECRET ci-dessous par une longue chaîne au hasard
 *      (une trentaine de caractères), et garder la même pour Vercel (RSVP_SECRET).
 *   4. Déployer → Nouveau déploiement → type « Application web » :
 *        Exécuter en tant que : Moi
 *        Qui a accès : Tout le monde
 *      Autoriser l'accès quand Google le demande.
 *   5. Copier l'URL de l'application web (.../exec) : c'est RSVP_SHEET_URL pour Vercel.
 *
 * Après toute modification du script, refaire « Déployer → Gérer les
 * déploiements → modifier → Nouvelle version », sinon l'URL sert l'ancien code.
 */

var SECRET = 'remplacer-par-le-secret-partage'

var ENTETES = ['Date', 'Prénom', 'Nom', 'Présence', 'Message', 'Langue']

function doPost(e) {
  var verrou = LockService.getScriptLock()
  try {
    var donnees = JSON.parse(e.postData.contents)
    if (!SECRET || SECRET === 'remplacer-par-le-secret-partage' || donnees.secret !== SECRET) {
      return reponse({ error: 'forbidden' })
    }

    // Deux réponses en même temps ne doivent pas s'écrire sur la même ligne.
    verrou.waitLock(10000)
    var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    if (feuille.getLastRow() === 0) {
      feuille.appendRow(ENTETES)
      feuille.getRange(1, 1, 1, ENTETES.length).setFontWeight('bold')
      feuille.setFrozenRows(1)
    }
    feuille.appendRow([
      new Date(donnees.date),
      String(donnees.prenom || ''),
      String(donnees.nom || ''),
      String(donnees.presence || ''),
      String(donnees.message || ''),
      String(donnees.langue || ''),
    ])
    return reponse({ ok: true })
  } catch (err) {
    return reponse({ error: String(err) })
  } finally {
    try {
      verrou.releaseLock()
    } catch (ignore) {}
  }
}

/** Une visite de l'URL dans un navigateur confirme seulement que le script est en ligne. */
function doGet() {
  return reponse({ ok: true, info: 'RSVP en ligne' })
}

function reponse(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON)
}
