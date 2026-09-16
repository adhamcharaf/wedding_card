/**
 * Script attaché au Google Sheet des invités (docs/CONCEPTION.md §7, ADR-0004).
 *
 * Le site n'appelle jamais ce script directement : la fonction Vercel
 * `api/rsvp.ts` lui parle avec le secret partagé, pour retrouver un groupe
 * d'invités à partir de son code, et pour enregistrer la réponse du groupe.
 *
 * Deux onglets, créés au besoin par le script :
 *   « Invités » : une ligne par personne. Adham remplit Code, Groupe, Prénom,
 *     Nom ; le site remplit Présence, Mot, Répondu le, Langue. C'est l'état
 *     à jour, et le tableau de bord.
 *   « Journal » : une ligne par personne à chaque envoi, jamais modifiée.
 *     Si quelqu'un écrase par erreur, tout est encore là.
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
 *   6. Recharger le Sheet : un menu « RSVP » apparaît. « Préparer les onglets »
 *      crée Invités et Journal. Remplir Groupe, Prénom, Nom, puis
 *      « Générer les codes manquants » : un code à 4 chiffres par groupe.
 *
 * Après toute modification du script, refaire « Déployer → Gérer les
 * déploiements → modifier → Nouvelle version », sinon l'URL sert l'ancien code.
 * L'URL ne change pas : rien à refaire côté Vercel.
 */

var SECRET = 'remplacer-par-le-secret-partage'

var ONGLET_INVITES = 'Invités'
var ONGLET_JOURNAL = 'Journal'
var ENTETES_INVITES = ['Code', 'Groupe', 'Prénom', 'Nom', 'Présence', 'Mot', 'Répondu le', 'Langue']
var ENTETES_JOURNAL = ['Date', 'Code', 'Groupe', 'Prénom', 'Nom', 'Présence', 'Mot', 'Langue']

/** Colonnes de l'onglet Invités, à partir de 0. */
var COL = { code: 0, groupe: 1, prenom: 2, nom: 3, presence: 4, mot: 5, reponduLe: 6, langue: 7 }

// ---------- Menu du Sheet ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('RSVP')
    .addItem('Préparer les onglets', 'preparer')
    .addItem('Générer les codes manquants', 'genererCodes')
    .addToUi()
}

function preparer() {
  onglet(ONGLET_INVITES, ENTETES_INVITES)
  onglet(ONGLET_JOURNAL, ENTETES_JOURNAL)
  SpreadsheetApp.getUi().alert('Onglets « ' + ONGLET_INVITES + ' » et « ' + ONGLET_JOURNAL + ' » prêts.')
}

/**
 * Donne un code à 4 chiffres à chaque groupe qui n'en a pas encore : même
 * groupe (même texte dans la colonne Groupe), même code. Les codes existants
 * ne bougent pas.
 */
function genererCodes() {
  var feuille = onglet(ONGLET_INVITES, ENTETES_INVITES)
  var lignes = feuille.getLastRow() - 1
  if (lignes <= 0) return
  var plage = feuille.getRange(2, 1, lignes, 2)
  var valeurs = plage.getValues()
  var pris = {}
  var parGroupe = {}
  valeurs.forEach(function (l) {
    var code = normaliserCode(l[COL.code])
    if (code) {
      pris[code] = true
      parGroupe[String(l[COL.groupe]).trim()] = code
    }
  })
  var nouveaux = 0
  valeurs.forEach(function (l) {
    var groupe = String(l[COL.groupe]).trim()
    if (normaliserCode(l[COL.code]) || !groupe) return
    if (!parGroupe[groupe]) {
      var code
      do {
        code = String(1000 + Math.floor(Math.random() * 9000))
      } while (pris[code])
      pris[code] = true
      parGroupe[groupe] = code
    }
    l[COL.code] = parGroupe[groupe]
    nouveaux++
  })
  // Le code reste du texte : un 0 en tête ne disparaît pas, même si on n'en génère pas.
  feuille.getRange(2, 1, lignes, 1).setNumberFormat('@')
  plage.setValues(valeurs)
  SpreadsheetApp.getUi().alert(nouveaux + ' ligne(s) ont reçu un code.')
}

// ---------- Appels du site ----------

function doPost(e) {
  var verrou = LockService.getScriptLock()
  try {
    var donnees = JSON.parse(e.postData.contents)
    if (!SECRET || SECRET === 'remplacer-par-le-secret-partage' || donnees.secret !== SECRET) {
      return reponse({ error: 'forbidden' })
    }
    var code = normaliserCode(donnees.code)
    if (!code) return reponse({ error: 'invalid' })

    // Une seule écriture à la fois : deux membres d'un même groupe peuvent répondre ensemble.
    verrou.waitLock(10000)
    if (donnees.action === 'chercher') return reponse(chercher(code))
    if (donnees.action === 'repondre') return reponse(repondre(code, donnees))
    return reponse({ error: 'invalid' })
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

/** Le groupe d'un code, ou `{ error: 'inconnu' }`. Ne renvoie jamais d'autres lignes. */
function chercher(code) {
  var lignes = lignesDuCode(code)
  if (lignes.length === 0) return { error: 'inconnu' }
  return { ok: true, groupe: groupeDepuis(code, lignes) }
}

/**
 * Enregistre la présence et le mot de chaque membre reçu. On ne crée jamais
 * de ligne : une personne absente de l'onglet Invités est ignorée. Les
 * membres du groupe non mentionnés gardent leur réponse.
 */
function repondre(code, donnees) {
  var lignes = lignesDuCode(code)
  if (lignes.length === 0) return { error: 'inconnu' }
  var feuille = onglet(ONGLET_INVITES, ENTETES_INVITES)
  var journal = onglet(ONGLET_JOURNAL, ENTETES_JOURNAL)
  var date = donnees.date ? new Date(donnees.date) : new Date()
  var langue = String(donnees.langue || '')
  var membres = Array.isArray(donnees.membres) ? donnees.membres : []

  membres.forEach(function (m) {
    var cle = clePersonne(m.prenom, m.nom)
    lignes.forEach(function (l) {
      if (clePersonne(l.valeurs[COL.prenom], l.valeurs[COL.nom]) !== cle) return
      var presence = m.presence === 'Oui' ? 'Oui' : m.presence === 'Non' ? 'Non' : ''
      var mot = String(m.mot || '')
      feuille.getRange(l.rang, COL.presence + 1, 1, 4).setValues([[presence, mot, date, langue]])
      journal.appendRow([date, code, l.valeurs[COL.groupe], l.valeurs[COL.prenom], l.valeurs[COL.nom], presence, mot, langue])
      l.valeurs[COL.presence] = presence
      l.valeurs[COL.mot] = mot
      l.valeurs[COL.reponduLe] = date
      l.valeurs[COL.langue] = langue
    })
  })
  return { ok: true, groupe: groupeDepuis(code, lignes) }
}

// ---------- Outils ----------

function onglet(nom, entetes) {
  var classeur = SpreadsheetApp.getActiveSpreadsheet()
  var feuille = classeur.getSheetByName(nom)
  if (!feuille) {
    feuille = classeur.insertSheet(nom)
    feuille.appendRow(entetes)
    feuille.getRange(1, 1, 1, entetes.length).setFontWeight('bold')
    feuille.setFrozenRows(1)
    // Les codes sont du texte, pour garder un éventuel 0 en tête.
    feuille.getRange(2, 1, feuille.getMaxRows() - 1, 1).setNumberFormat('@')
  }
  return feuille
}

/** Toutes les lignes de l'onglet Invités qui portent ce code, avec leur rang (1 = en-tête). */
function lignesDuCode(code) {
  var feuille = onglet(ONGLET_INVITES, ENTETES_INVITES)
  var total = feuille.getLastRow() - 1
  if (total <= 0) return []
  var valeurs = feuille.getRange(2, 1, total, ENTETES_INVITES.length).getValues()
  var lignes = []
  valeurs.forEach(function (v, i) {
    if (normaliserCode(v[COL.code]) === code) lignes.push({ rang: i + 2, valeurs: v })
  })
  return lignes
}

function groupeDepuis(code, lignes) {
  return {
    code: code,
    nom: String(lignes[0].valeurs[COL.groupe] || ''),
    membres: lignes.map(function (l) {
      var v = l.valeurs
      return {
        prenom: String(v[COL.prenom] || ''),
        nom: String(v[COL.nom] || ''),
        presence: v[COL.presence] === 'Oui' ? 'Oui' : v[COL.presence] === 'Non' ? 'Non' : '',
        mot: String(v[COL.mot] || ''),
        reponduLe: v[COL.reponduLe] instanceof Date ? v[COL.reponduLe].toISOString() : '',
      }
    }),
  }
}

/** Le code tel qu'écrit dans la cellule (nombre ou texte), ou '' s'il n'a pas 4 chiffres. */
function normaliserCode(valeur) {
  var s = String(valeur == null ? '' : valeur).trim()
  return /^\d{4}$/.test(s) ? s : ''
}

/** Prénom et nom, sans casse ni espaces superflus : la clé d'une personne dans son groupe. */
function clePersonne(prenom, nom) {
  return (String(prenom || '').trim() + '|' + String(nom || '').trim()).toLowerCase()
}

function reponse(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON)
}
