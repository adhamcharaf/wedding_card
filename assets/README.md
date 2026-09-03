# Sources fournies par Adham

Images d'origine, sur fond blanc, non servies par le site. Les découpes utilisées vivent dans `public/images/`.

| Source | Découpe | Traitement |
| --- | --- | --- |
| grand soleil (ancien `card.png`, remplacé depuis) | `public/images/sun-gold.png` | fond blanc retiré, réduit à 1200 px puis recadré (968×957), 256 couleurs |
| `heart_birds.JPG` | `public/images/heart.png` | fond blanc retiré, recadré (473×539), 256 couleurs |
| `card.png` (cadre ruban) | `public/images/ribbon.png` | fond blanc et ombre portée grise retirés, réduit à 1000 px, 256 couleurs |
| `bride_broom.png` | `public/images/couple.png` | trait noir converti en encre sur transparent, texte « Bride & Groom » inclus |
| `baby_adham.png`, `baby_lara.png` | `public/images/baby-adham.png`, `baby-lara.png` | fond blanc retiré, petits trous refermés. La source de Lara a des taches blanches dans la robe |
| `sun.JPG` | non utilisé | même soleil en plus petit |

Le détourage est automatique (remplissage du fond depuis les bords, bord adouci sur 2 px). Un PNG déjà transparent, exporté depuis la maquette, donnera un bord plus net : il suffit de le déposer dans `public/images/` sous le même nom.
