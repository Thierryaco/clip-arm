# Storyboard : Dolma Forever (concept : livre de recettes animé, 16:9 1080p)

Chaque ligne chantée a un identifiant (L01 … L35, et E01 pour l'écho de l'outro). **Les temps ne sont pas écrits ici** :
ils viennent de `timings/TIMINGS.md`, généré par `tools/sync.py` à partir de l'audio. Si la chanson change, on relance
le script et le storyboard reste valide.

**Règles communes**
- Une image pour chaque ligne chantée : ce qui est dessiné doit être lisible en une demi-seconde.
- Les changements de page tombent sur un beat (`analysis.beats`), jamais entre deux beats.
- La cuisinière est présente sur les lignes chantées (photo collée, lip-sync selon `voice`).
- Un refrain chanté deux fois (L10–L13, L21–L24) : le second passage (L10b–L13b, L21b–L24b) se suit au karaoké, sans case en plus.
- Le mot actif s'allume en karaoké (`wordIndex` de `EngineState.stateAt`).
- Aucun logo ni interface de marque : les tampons sont génériques.

---

## État de réalisation (temps de `timings/timings.json`, pages de `pages/book.js`)

| Section | Temps (s) | Page | Illustration |
|---|---|---|---|
| intro | 4,76 – 40,40 | Couverture (tampon, karaoké L01) | `assets/plats/cover_tonir.jpg` |
| verse_1 | 40,40 – 54,86 | « Dolma » (p. 2) | `assets/plats/dolma.jpg` |
| verse_2_lavash | 54,86 – 70,30 | « Lavash » (p. 3) | `assets/plats/lavash.jpg` |
| chorus_1 | 70,30 – 100,20 | « Menu » (p. 4) | `assets/plats/menu.jpg` |
| verse_3 | 100,20 – 117,16 | « Kefta » (p. 5) | `assets/plats/kefta.jpg` |
| bridge | 117,16 – 131,80 | « Souvenirs » (p. 6) | `assets/plats/souvenirs.jpg` |
| chorus_2 | 131,80 – 155,12 | « Fête » (p. 7) | `assets/plats/fete.jpg` |
| outro | 155,12 – 196,76 | « Fin de la recette » (p. 8) | `assets/plats/fin.jpg` |
| outro_reprise | 196,76 – 239,92 | « Encore ! » (p. 9), deux colonnes, cuisinière dans le coin bas-droit (choix du 8 oct. 2026) | bouche et clignement (lip-sync) |

Écart avec le plan initial : la reprise finale n'est pas un « menu » qui se superpose, mais une page « Encore ! » où les dix lignes se cochent en deux colonnes. Les titres de pages sont provisoires (à valider).

## Couverture et couplet 1 : page « Dolma »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L01 | Hayastan, l'odeur des épices appelle… | **Couverture** : titre « Dolma Forever » en tampon, le mot « Hayastan » écrit à la main en première ligne. | la couverture s'ouvre sur le premier beat ; les percussions font monter le grain |
| L02 | Feuilles de vigne tendres, roulées avec soin | Page « Dolma » : liste d'ingrédients. « Feuilles de vigne » se coche, une feuille se roule à chaque temps. La cuisinière, photo collée en coin. | une feuille par temps |
| L03 | Dolma qui brille dans l'assiette, pur bonheur | Un dolma dessiné apparaît sur la page, reflet qui glisse sur le mot « brille ». | reflet sur le temps fort |
| L04 | Riz parfumé, viande hachée, herbes qui dansent | Trois cases (riz, viande, herbes) se cochent une à une. Les herbes oscillent. | une case par temps |
| L05 | Un petit paquet vert, saveur d'enfance immense | Gros plan sur un dolma vert, annotation manuscrite en marge : « comme chez maman ». | zoom léger sur chaque temps |

## Couplet 2 : page « Lavash »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L06 | Lavash fin comme une caresse, cuit au tonir chaud | Étape 1 numérotée. Dessin du tonir ; la flamme pulse avec les basses (`bass`). | la flamme suit `bass` |
| L07 | Étendu, claqué contre le mur, doré en un éclair | La pâte s'étire, puis claque contre le mur. Elle passe du blanc au doré. | claquement sur `onset` |
| L08 | Pain de tous les jours, UNESCO dans le cœur | Étape 2 : tampon « patrimoine » générique (sans logo), cœur dessiné à la main. | tampon sur le temps fort |
| L09 | Avec lui tout s'enroule, tout se partage, tout est meilleur | Le lavash enveloppe les autres ingrédients, qui se replient dedans. | enroulement sur chaque temps |

## Refrain 1 : page « Menu »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L10 | Oh dolma, keufté, beureK (r roulé !) | Titre « Menu » en grand. « Oh dolma » en tête. « r roulé » en annotation manuscrite. | le titre rebondit sur le beat |
| L11 | Bouboules keufté qui fondent en bouche | Boulettes de keufté sur la page, rebond sur chaque temps. « Fondent » s'estompe. | rebond |
| L12 | Soudjouk qui craque, pasteurma qui pique | Soudjouk et pasteurma en colonne. Craquement (secousse) sur `onset` ; pastille rouge pour « pique ». | secousse sur `onset` |
| L13 | À table en Arménie, on rit, on savoure, on vit ! | Double page : table dessinée, la cuisinière dans la photo centrale. Les couverts se posent sur les temps. | un couvert par temps |

## Couplet 3 : page « Kefta »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L14 | Kefta en boules rondes, dorées à souhait | Boulettes rondes qui roulent sur la page, dorure progressive. | roulement |
| L15 | Dans la sauce tomate, un festin secret | La sauce tomate se répand sur la page, bulles qui montent. | bulles sur `bass` |
| L16 | BeureK croustillant, fromage qui file et coule | Gros plan : le fromage s'étire pendant la syllabe longue de « file ». | étirement suivant le mot |
| L17 | Chaque bouchée un voyage vers les montagnes | Carte au trait : pointillés qui montent vers des montagnes. | pointillés avancent sur chaque temps |

## Pont (duduk solo, plus lent) : pages « Souvenirs »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L18 | Soudjouk séché au vent des hauts plateaux | Photo ancienne collée, soudjouk suspendu, traits de vent. Le livre ralentit : grain plus fort. | ralenti (pas de coupe) |
| L19 | Pasteurma rouge, épices qui marquent l'âme | Gros plan sur la pasteurma, tache rouge qui s'étale sur le papier. | tache qui s'étale |
| L20 | Ces goûts d'autrefois restent gravés en nous | Photo de famille (générée), la cuisinière regarde la page et chante plus bas. | fondu lent |

## Refrain 2 (plus fort, chœurs) : double page « Fête »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L21 | Oh dolma, keufté, beureK (r roulé !) | Les plats sortent de la page, confettis, marges annotées plus vite. | coupes sur chaque temps |
| L22 | Bouboules keufté qui fondent en bouche | Boulettes qui rebondissent hors de la page. | rebond plus fort |
| L23 | Soudjouk qui craque, pasteurma qui pique | Secousses plus fortes, pastilles rouges en pluie. | secousses sur `onset` |
| L24 | À table en Arménie, on rit, on savoure, on vit ! | La table se remplit de personnages dessinés, la cuisinière au centre. | plans larges |

## Outro : dernière page « Fin de la recette »

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L25 | Aïe aïe aïe… aïdé à table ! Dolma forever… | Tampon « Dolma forever » final. Les couverts disparaissent un à un, les lumières baissent. | les claps (`onset`) font disparaître un couvert |
| E01 | (écho) beureK… keufté… pasteurmaaa… lavashhhh… | Les mots de l'écho s'effacent du plus fort au plus lointain, puis fondu au noir. | chaque mot s'efface à son temps |

---

## Reprise finale (audio uniquement) : page « Encore ! » (construite, voir le tableau ci-dessus)

Absente du texte Suno, présente dans la chanson. Structure : L26 à L29 jouées deux fois (à confirmer : la transcription ne les donne qu'une fois), puis deux « R roulé » à la fin.
Les mots viennent du refrain et des consignes de l'outro, à valider à l'écoute.

| id | texte | à l'écran | rythme |
|---|---|---|---|
| L26 | Dolma, keufté, beureK, R roulé | Retour de la page « Menu », mais les pages se superposent : une première couche de menu. Le « r roulé » s'écrit en marge. | une couche par temps |
| L27 | Bouboules keufté qui fondent en bouche | Les boulettes rebondissent hors du livre. | rebond |
| L28 | Soudjouk qui craque, pasteurma qui pique | Secousses et pastilles rouges, comme au refrain 2. | secousse sur `onset` |
| L29 | À table en Arménie, on rit, on savoure, on vit ! | La table revient, couverts posés un par un. | un couvert par temps |
| L30 | Dolma, keufté, beureK, R roulé | Deuxième passe : le menu revient, couche sur couche, plus vite. | une couche par temps |
| L31 | Bouboules keufté qui fondent en bouche | Les boulettes rebondissent de nouveau, plus haut. | rebond |
| L32 | Soudjouk qui craque, pasteurma qui pique | Pastilles rouges en pluie. | secousse sur `onset` |
| L33 | À table en Arménie, on rit, on savoure, on vit ! | Les personnages quittent la table, un à un. | un personnage par temps |
| L34 | R roulé… | Tampon « R » qui se répète, grandit à chaque coup. | un coup par temps |
| L35 | R roulé… | Dernier « R », qui s'estompe dans le noir. Le livre se referme. | fondu final |

## Points à valider (voir METHODE_ADAPTEE.md)
- Nom et apparence de la cuisinière (tout est généré et animé, aucune photo fournie).
- Reprise finale L26–L35 : confirmer les mots, l'ordre et le nombre de lignes de la seconde passe (L30–L33).
- E01 (écho) : gardé à sa place (après « Dolma forever »), décision validée.
- Graphie unique de « beureK » à l'écran.
- Décidé le 8 oct. 2026 : le second passage des refrains (1:22–1:33 et 2:24–2:35) est suivi au karaoké (L10b–L13b, L21b–L24b), sans case en plus. Temps du premier mot tirés de la transcription (±0,5 s) : à vérifier à l'écoute.
- Décidé le 8 oct. 2026 : L25 = « Aïe aïe aïe… aïdé à table ! Dolma forever… ». « Aïe aïe aïe » (2:35) validé à l'écoute ; « aïdé à table ! Dolma forever… » (3:01–3:03) d'après la transcription : à vérifier à l'écoute.
- Décidé le 8 oct. 2026 : à 3:28, « Dolma, keufté, beureK, R roulé » (L30 gardé). « Pour un café de repas », entendu par la transcription, n'est pas ajouté.
- Ouvert : L31 à 3:31,5. La transcription entend « Soudjouk qui craque », pas « Bouboules keufté… ». À écouter.
- Décidé le 8 oct. 2026 : cuisinière sur « Encore ! » (coin bas-droit ; la colonne droite est rétrécie pour la laisser libre).
- Ouvert : L26–L29 jouées une fois ou deux fois ? La transcription ne les donne qu'une fois (3:16–3:28).
- Ouvert : l'annotation « r roulé » de L10 et L21 n'est pas affichée (texte nettoyé), contrairement à la fiche L10 ci-dessus.
