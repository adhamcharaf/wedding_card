"""
Liste des invités d'Adham → lignes de l'onglet « Invités » du Sheet et liens WhatsApp (ADR-0004).

Entrée : `<partie>.txt` à côté de ce script, une personne par ligne, une ligne
vide entre les groupes. Sortie : `<partie>-invites.tsv` (Code, Groupe, Prénom,
Nom, à coller dans l'onglet Invités) et `<partie>-liens.txt` (un lien par
groupe). `codes.json` garde les codes déjà attribués pour qu'une partie
suivante ne les reprenne pas.

Les fichiers d'entrée et de sortie contiennent des noms d'invités : ils
restent hors du dépôt (lancer le script depuis un dossier privé).
"""
import random, re, sys, csv, json, os
S = os.path.dirname(os.path.abspath(__file__))
PARTIE = sys.argv[1]
DOMAINE = 'https://adhamlara-wedding.online'
RESERVES = {'4821', '7350', '9102'}  # codes de test
PARTICULES = {'el', 'al', 'abou', 'abu', 'abdel', 'ben', 'bou'}

def cap(mot):
    return '-'.join(p[:1].upper() + p[1:].lower() for p in mot.split('-'))

def personne(ligne):
    """→ (prénom, nom, à_compléter)"""
    brut = re.sub(r'\s+', ' ', ligne).strip()
    m = re.match(r'^(\S+) (mari|femme|copine|copain|fiancée?) de (.+)$', brut, re.I)
    if m:  # « Mehdi mari de Raw » : le prénom est connu, le nom non
        return cap(m.group(1)), '', True
    if re.match(r'^(fiancée?|gars|femme|mari|copine|copain) de ', brut, re.I):  # « Fiancé de Hadi » : rien de connu
        mots = brut.split(' ')
        return mots[0][:1].upper() + mots[0][1:].lower() + ' de ' + ' '.join(cap(x) for x in mots[2:]), '', True
    mots = [cap(x) for x in brut.split(' ')]
    if len(mots) == 1:
        return mots[0], '', True
    if len(mots) == 2:
        return mots[0], mots[1], False
    if mots[1].lower() in PARTICULES:
        return mots[0], ' '.join(mots[1:]), False
    return ' '.join(mots[:-1]), mots[-1], False

def nom_groupe(membres):
    noms = {n for _, n, _ in membres if n}
    complets = [f'{p} {n}'.strip() for p, n, _ in membres]
    if len(membres) == 1:
        return complets[0]
    if len(noms) == 1 and all(n for _, n, _ in membres):
        (n,) = noms
        prenoms = [p for p, _, _ in membres]
        return f'Famille {n}' if len(membres) > 2 else f'{prenoms[0]} & {prenoms[1]} {n}'
    if len(membres) > 2:  # noms différents : les prénoms suffisent
        prenoms = [p for p, _, _ in membres]
        return ', '.join(prenoms[:-1]) + ' & ' + prenoms[-1]
    return ' & '.join(complets)

texte = open(f'{S}/{PARTIE}.txt', encoding='utf-8').read()
groupes = [[personne(l) for l in bloc.strip().split('\n') if l.strip()] for bloc in re.split(r'\n\s*\n', texte.strip())]

# Codes déjà attribués par une partie précédente : on ne les reprend pas.
pris = set(RESERVES)
deja = f'{S}/codes.json'
codes = json.load(open(deja)) if os.path.exists(deja) else {}
pris |= set(codes.values())
rng = random.Random(f'adham-lara-{PARTIE}')

lignes, liens, a_completer = [], [], []
for membres in groupes:
    g = nom_groupe(membres)
    if g not in codes:
        while True:
            c = str(rng.randint(1000, 9999))
            if c not in pris:
                break
        pris.add(c); codes[g] = c
    c = codes[g]
    for p, n, todo in membres:
        lignes.append([c, g, p, n])
        if todo:
            a_completer.append(f'{c}  {g} : « {p} » sans nom')
    liens.append(f'{g}\t{DOMAINE}/{c}')

json.dump(codes, open(deja, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(f'{S}/{PARTIE}-invites.tsv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, delimiter='\t'); w.writerow(['Code', 'Groupe', 'Prénom', 'Nom']); w.writerows(lignes)
open(f'{S}/{PARTIE}-liens.txt', 'w', encoding='utf-8').write('Groupe\tLien\n' + '\n'.join(liens) + '\n')
print(f'{len(groupes)} groupes, {len(lignes)} personnes')
print('À compléter :'); print('\n'.join(a_completer))
