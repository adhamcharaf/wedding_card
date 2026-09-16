# ADR-0003 — RSVP dans un Google Sheet, via une fonction Vercel

- **Date** : 2026-09-15
- **Statut** : accepté
- **Décideurs** : Adham, avec Claude
- **Remplace** : la partie « Supabase pour le RSVP » de l'ADR-0001

## Contexte

Adham veut lire les réponses dans un fichier tableur toujours à jour, qu'il partage et trie lui-même (doublons compris). 250 invités au plus, prénom et nom séparés, message obligatoire, clôture le 15 décembre 2026, pas de notification. Le site reste 100 % client, sans compte pour les invités, à coût nul, et sans clé secrète dans le navigateur.

## Décision

Le Google Sheet est la base de données. Le formulaire envoie à une fonction Vercel du même projet (`api/rsvp.ts`), qui valide, applique la clôture, et transmet chaque réponse à un script Apps Script attaché au fichier (`tools/sheets/Code.gs`), protégé par un secret partagé. Adresse du script et secret vivent dans les variables d'environnement Vercel.

## Alternatives envisagées

| Option | Avantages | Inconvénients | Écartée parce que |
| --- | --- | --- | --- |
| Supabase, insertion directe avec la clé publique | prévu à l'origine, gratuit | clé publique dans le site, aucune limite ni validation côté serveur, lecture dans un tableau de bord puis export à la main | le fichier partagé n'est jamais « à jour » de lui-même |
| Fonction Vercel devant Supabase | validation serveur, clé cachée | une base de plus à gérer pour aboutir à un export tableur | même chose : un export, pas un fichier vivant |
| Service de formulaire (Formspree, Tally) | rien à héberger | 50 réponses par mois en gratuit, données chez un tiers, domaine externe à autoriser | trop limité, et une dépendance de plus |
| Navigateur → Apps Script directement, sans fonction | encore moins de code | adresse du script visible dans le site, réponse illisible (redirection Google), CSP à ouvrir | la fonction cache l'adresse et garde la CSP fermée |

## Conséquences

**Positives** : zéro coût, zéro base, un fichier que Lara et Adham ouvrent sur leur téléphone, export Excel à tout moment, clôture appliquée côté serveur, CSP inchangée.
**À surveiller** : le script Apps Script doit être republié (« nouvelle version ») après toute modification ; Google impose un quota d'exécutions largement suffisant pour 250 lignes ; pas de limitation de débit, acceptée pour un lien transmis de la main à la main.

## Révision

À reconsidérer si une notification par réponse devient souhaitée (une ligne dans le script suffit : `MailApp.sendEmail`) ou si le lien devait circuler publiquement.
