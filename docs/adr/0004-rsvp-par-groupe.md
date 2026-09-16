# ADR-0004 — RSVP par groupe d'invités, avec un code dans le lien

- **Date** : 2026-09-16
- **Statut** : accepté
- **Décideurs** : Adham, avec Claude
- **Complète** : l'ADR-0003 (le Google Sheet reste la base)

## Contexte

Le formulaire libre de l'ADR-0003 avait deux défauts vus par Adham : n'importe qui ayant reçu le lien (un ami à qui on montre le site) pouvait répondre, et une famille de sept devait remplir sept fois. Adham connaît sa liste par groupes (couple, famille, ami seul) et peut attribuer un code à chacun.

## Décision

Chaque groupe reçoit un code à 4 chiffres, écrit dans le lien qu'Adham envoie (`adhamlara-wedding.online/4821`). Le code ouvre le faire-part et donne, au formulaire, la liste des membres du groupe : Oui / Non pour chacun, un mot facultatif pour chacun, au moins un mot par groupe, un seul envoi. La réponse reste modifiable jusqu'à la clôture, et chaque membre peut revenir ajouter son mot sans effacer les autres.

La liste vit dans le Google Sheet (onglet « Invités », une ligne par personne, créé par le script), jamais dans le dépôt : le site ne reçoit que le groupe du code demandé. Un onglet « Journal » garde chaque envoi.

## Alternatives envisagées

| Option | Avantages | Inconvénients | Écartée parce que |
| --- | --- | --- | --- |
| Code tapé à la main seulement, sans lien | moins de mécanique | une saisie de plus pour tout le monde, surtout les invités âgés | le lien porte le code ; le champ reste pour ceux qui arrivent sans |
| Code à 3 chiffres | plus court | avec une centaine de groupes sur 1 000 codes, un curieux tombe sur une vraie famille en une dizaine d'essais | 4 chiffres, et 0,8 s d'attente sur un code faux |
| Liste des invités dans le dépôt | pas de dépendance au Sheet pour la lecture | tous les noms dans le JavaScript public, un déploiement par changement | privée dans le Sheet, modifiable depuis le téléphone |
| Recherche par nom, sans code | rien à distribuer | un nom se devine, et révèle la liste | le code est la clé |
| Réponse figée après le premier envoi | plus simple | chaque changement de plan finirait en message WhatsApp | modification ouverte jusqu'au 15 décembre |

## Conséquences

**Positives** : personne ne répond sans invitation ; une réponse par famille ; plus de fautes de frappe ni de doublons dans les noms ; le Sheet est le tableau de bord ; un invité ajouté à la main dans l'onglet reçoit son code par le menu « RSVP » du Sheet, sans redéploiement.
**À surveiller** : le lien avec le code se transmet comme le code lui-même, c'est accepté ; deux membres qui modifient en même temps : le dernier envoi gagne, le Journal garde tout ; le script Apps Script doit être republié à chaque modification.

## Révision

À reconsidérer si Adham veut des invités hors liste (un « plus un » libre) : il faudrait un champ nom ouvert dans le groupe, ce qu'il a refusé le 2026-09-16.
