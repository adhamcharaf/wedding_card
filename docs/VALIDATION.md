# Protocole de validation

## Déroulement d'une étape

1. **Annonce** : l'assistant dit ce qu'il va faire, les fichiers qu'il va créer ou modifier, les dépendances qu'il veut installer, et attend l'accord avant d'écrire du code.
2. **Réalisation** : il réalise l'étape, et rien d'autre. Un commit par tâche cohérente, message en français, phrase d'intention (« Afficher le soleil qui monte au scroll »).
3. **Compte rendu**, à la fin :
   - fichiers créés ou modifiés ;
   - ce qui fonctionne, une phrase par point ;
   - la procédure de vérification pas à pas, rédigée pour être suivie sur un téléphone, sans connaissance technique ;
   - ce qui reste en suspens et les écarts par rapport au plan ;
   - les décisions prises en chemin.
4. **Vérification** : Adham suit la procédure et constate par lui-même.
5. **Décision** :
   - **validée** → tableau de `PLAN.md` mis à jour (statut + date), proposition de l'étape suivante ;
   - **à corriger** → correction sans passer à la suite ; erreur comprise = entrée dans `LESSONS.md` ;
   - **à revoir sur le fond** → retour à l'annonce.

## Non-dépassement

Si une étape en exige une autre non prévue, l'assistant s'arrête et le signale au lieu d'élargir le périmètre.

## Ce qu'une validation n'est pas

- « Le code compile » : nécessaire, pas suffisant.
- L'avis de l'assistant sur son propre travail.
- Implicite : sans « validé » explicite, l'étape reste ouverte.

## Toujours vérifier, en plus des critères de l'étape

- `npm run lint` et `npm run typecheck` passent
- La console du navigateur est vide sur téléphone (Safari iOS via l'inspecteur Mac, ou Chrome Android via `chrome://inspect`) ou, à défaut, sur desktop en mode responsive
- Le site fonctionne sur le téléphone d'Adham, pas seulement sur desktop
