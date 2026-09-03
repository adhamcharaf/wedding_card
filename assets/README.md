# Sources fournies par Adham

Images d'origine, sur fond blanc, non servies par le site. Les découpes utilisées vivent dans `public/images/`.

| Source | Découpe | Traitement |
| --- | --- | --- |
| `card.png` | `public/images/sun-gold.png` | fond blanc retiré, réduit à 1200 px puis recadré (968×957), 256 couleurs |
| `heart_birds.JPG` | `public/images/heart.png` | fond blanc retiré, recadré (473×539), 256 couleurs |
| `sun.JPG` | non utilisé | même soleil que `card.png`, en plus petit |

Le détourage est automatique (remplissage du fond depuis les bords, bord adouci sur 2 px). Un PNG déjà transparent, exporté depuis la maquette, donnera un bord plus net : il suffit de le déposer dans `public/images/` sous le même nom.
