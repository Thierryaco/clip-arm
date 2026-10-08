# Prompt de reprise : clip « Dolma Forever »

Copie tout ce document dans une nouvelle conversation pour reprendre le projet.

---

Tu reprends un projet de clip musical. Lis d'abord ce prompt en entier, puis les fichiers indiqués, avant d'agir.

## 1. Le projet en une phrase

Clip 16:9 1920×1080 sur la chanson Suno « (soft duduk intro, percussions qui montent doucement) » (titispeed, 3:59,
lien : https://suno.com/s/6d0gOkzMpM9DFNuI). Concept retenu : **un livre de recettes animé**. Chaque section de la
chanson est une page du livre. Une cuisinière virtuelle, entièrement générée, chante depuis une photo (générée elle aussi) collée dans le livre (lip-sync).

## 2. Où est tout

- **Dépôt** : `Thierryaco/clip-arm` (public ou privé selon l'utilisateur, accès via `gh` et `git`).
- **Branche de travail (obligatoire)** : la branche de la session. Pour la session du 8 oct. 2026 : `arena/6075c539-clip-arm` (voir §12). Ne jamais travailler sur une autre branche.
- **Dossier du clip** : `clips/dolma-forever/`.
- **Dernier commit du travail d'origine** : `cf182c7` (« Reprise : notes Colab »). Le commit `235c2e3` cité plus bas est plus ancien. Les commits de la session 8 oct. 2026 sont décrits au §12.
- **Chanson** : `clips/dolma-forever/audio/song.mp3` (239,9 s, stéréo 48 kHz). Copie du fichier
  `kenji dolma.mp3` du dépôt public `Thierryaco/congenial-dollop` (commit `cce08aee…`).

### Fichiers du clip

| fichier | rôle | état |
|---|---|---|
| `README.md` | mode d'emploi du dossier | à jour |
| `METHODE_ADAPTEE.md` | méthode (inspirée de « Connexion terminée »), pipeline, agents, points de vigilance | à jour sauf le détail des temps (voir `timings/`) |
| `STORYBOARD.md` | une entrée par identifiant de ligne (L01–L35, E01) | à jour |
| `lyrics/paroles.json` | source de vérité des paroles, en sections | à jour (sections + reprise finale) |
| `audio/song.mp3` | la chanson | présent |
| `audio/transcript.json` | transcription faster-whisper mot par mot (fournie par l'utilisateur, faite sur Colab) | présent |
| `audio/analysis.json` | features audio à 30 i/s | **ignoré par Git**, régénéré par `sync.py` |
| `timings/overrides.json` | corrections manuelles des temps | à jour |
| `timings/timings.json` | temps de chaque ligne et section (généré) | généré |
| `timings/TIMINGS.md` | tableau lisible des temps (généré) | généré |
| `core/engine-state.js` | état pur à l'instant t : ligne, mot, section, beat, énergie | testé |
| `core/lyrics-data.js` | lignes et mots horodatés pour le navigateur (généré) | généré |
| `core/audio-analysis.js` | features audio pour le navigateur (généré) | généré |
| `tools/transcribe.py` | transcription sur la machine de l'utilisateur | prêt |
| `tools/sync.py` | pipeline : analyse audio → alignement → timings → données moteur | prêt, testé |
| `tools/test_engine_state.js` | tests de `engine-state.js` sur les données réelles | passe |
| `.gitignore` | exclut `out/`, les vidéos, `audio/analysis.json`, `*.wav` | à jour |

## 3. Ce qui a été fait

1. **Méthode adaptée** au concept « livre de recettes » (16:9, 1080p, 30 i/s, chanteuse virtuelle, storyboard, pipeline
   en étapes, vagues d'agents allégées : 4 modules + 8 pages).
2. **Paroles structurées** en 8 sections officielles (25 lignes chantées + écho E01).
3. **Pipeline de synchronisation** (`sync.py`), testé sur une chanson synthétique : toutes les lignes retrouvées à moins de
   50 ms. Corrections de bugs faites en route : alignement monotone ligne par ligne (les refrains répétés ne sautent plus),
   interpolation locale à la ligne (un mot omis ne fait plus sauter une ligne), mots affichés avec leur forme d'origine,
   fins de mots recalculées après correction.
4. **Synchronisation sur la vraie chanson** : transcription faite par l'utilisateur sur Colab (367 mots), puis
   `sync.py`. Résultat : 36 lignes, 9 sections, zéro erreur de cohérence.
5. **Découverte** : la version chantée diffère des paroles Suno. Passages ajoutés, validés par l'utilisateur :
   - « Aïe aïe aïe » (≈ 2:35 à 3:01) remplace « Hay hay hay » (L25). **Validé.**
   - Reprise finale (section `outro_reprise`, L26–L35), reconstituée à partir du refrain et de l'outro, et validée
     dans ses grandes lignes : L26–L29 jouées deux fois, puis deux « R roulé » (L34, L35). Le « r roulé » est chanté.
   - L'écho E01 reste à 3:04, décision validée (il ne suit pas le texte exact de Suno).
6. **Corrections validées à l'écoute** : L14–L20, L25 (`overrides.json`).
7. **Moteur d'état** (`engine-state.js`) : fonctions pures, même t → même résultat. Testé.

## 4. Les temps actuels (durée 239,92 s, tempo mesuré ≈ 106 BPM)

| section | début | | ligne | début | texte |
|---|---|---|---|---|---|
| intro | 0:04.8 | | L01 | 0:04.8 | Hayastan, l'odeur des épices appelle… |
| verse_1 | 0:40.4 | | L02–L05 | 0:40.4 | couplet dolma |
| verse_2_lavash | 0:54.9 | | L06–L09 | 0:54.9 | couplet lavash |
| chorus_1 | 1:10.3 | | L10–L13 | 1:10.3 | refrain |
| verse_3 | 1:40.2 | | L14–L17 | 1:40.2 | couplet kefta (validé) |
| bridge | 1:57.2 | | L18–L20 | 1:57.2 | pont duduk (validé) |
| chorus_2 | 2:11.8 | | L21–L24 | 2:11.8 | refrain 2 |
| outro | 2:35.1 | | L25 | 2:35.1 | Hay hay hay / Aïe aïe (validé) |
| | | | E01 | 3:04.0 | écho (gardé à sa place) |
| outro_reprise | 3:16.8 | | L26–L35 | 3:16.8 | reprise finale |

## 5. Limites connues

- **52 % des mots reconnus** par la transcription. Les temps de L14–L35 viennent des corrections (`overrides.json`), validées
  à l'oreille pour L14–L20 et L25, et seulement déduites des segments pour L21–L24 et L26–L35.
- **L32** (3:34) est interpolé : la transcription n'a rien capté à cet endroit.
- **Le tempo mesuré** oscille entre 106 et 108 BPM selon l'analyse. La fourchette « 120–135 BPM » du prompt Suno est une
  consigne de style, pas une mesure. La grille de beats est donc à vérifier à l'écoute avant de l'utiliser pour les
  coupes.
- La transcription écrit parfois « Sous-titrage Société Radio-Canada » à 3:53 : c'est une hallucination, rien n'est chanté.
- Les paroles affichées sont **nettoyées** : les annotations entre parenthèses sont retirées de l'affichage. Le « r roulé »
  de la reprise est donc écrit en toutes lettres (« Dolma, keufté, beureK, R roulé »).

## 6. Ce qu'il reste à faire (dans l'ordre)

1. **Vérifier avec l'utilisateur** les derniers points à l'écoute : L21–L24 et L26–L35 (mots, nombre de lignes, ordre).
   Les corrections vont dans `timings/overrides.json` (`{"L32": {"start": 214.3}}`), puis `python3 tools/sync.py`.
2. **Construire les pages visuelles** (`pages/`, un fichier par page ou par section, ou un module `pages.js`) :
   - un moteur `renderAt(t)` pur : même `t` → même image, aucune animation liée au temps réel ; partir de
     `core/engine-state.js` ;
   - le livre : couverture, pages « Dolma », « Lavash », « Menu », « Kefta », « Souvenirs », « Fête », « Fin de la recette »,
     reprise finale. Les contenus sont décrits ligne par ligne dans `STORYBOARD.md` ;
   - le karaoké mot par mot (`wordIndex`), les changements de page sur les beats (`beat.phase`), l'énergie (`voice`, `bass`,
     `onset`) pour les secousses et les rebonds.
3. **Personnage** (partiellement fait, voir §10) : tout est généré et animé. L'utilisateur ne fournit **aucune photo**. Produire d'abord un portrait de
   référence (plusieurs candidats, l'utilisateur choisit), puis les variantes bouche ouverte et yeux fermés par édition
   d'image à partir de la référence. Le lip-sync bascule entre ces images selon `voice`. Outil : génération d'image de
   l'agent. Si elle n'est pas disponible, demander à l'utilisateur une clé Gemini, qui ne doit jamais être écrite dans
   le dépôt.
4. **Illustrations des plats** : soit générées, soit en SVG. Pas de logo ni d'interface de marque.
5. **Aperçu et contrôle** : une planche de contrôle (images à intervalles réguliers), puis vérifier les temps clés
   (L10, L14, L25, L26, L34).
6. **Rendu** : ce sandbox n'a **ni Chrome ni ffmpeg**, et ne peut pas télécharger le modèle Whisper ni les images Google.
   Le rendu 1080p se fait sur la machine de l'utilisateur (Chrome headless avec puppeteer-core, ffmpeg en H.264).
   Le master fait environ 2 Go : il ne va **pas** sur GitHub (limite 100 Mo par fichier). Une version web légère
   (crf 20, maxrate 14 M) peut être versionnée si elle reste sous 100 Mo, mais ce n'est pas nécessaire.

## 7. Commandes utiles

```bash
# Synchroniser (depuis la racine du dépôt)
python3 tools/sync.py                 # analyse + alignement + timings + données moteur
python3 tools/sync.py --check         # vérifie seulement timings.json
node tools/test_engine_state.js       # tests de l'état du clip

# Transcrire (sur la machine de l'utilisateur, si la transcription doit être refaite)
python3 tools/transcribe.py           # → audio/transcript.json
```

Dépendances Python pour `sync.py` : `pip install librosa soundfile numpy`. Pour `transcribe.py` :
`pip install faster-whisper`. Le modèle Whisper vient de Hugging Face : le sandbox ne peut pas le télécharger.

## 8. Contraintes d'environnement (à connaître)

- Hôtes autorisés depuis le sandbox : `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`,
  `pypi.org`, `files.pythonhosted.org`. **Pas** Suno, Hugging Face, Google, openai.com.
- `gh` et `git` fonctionnent. Ne jamais demander de token à l'utilisateur.
- Node 22 est présent. Python 3.11 est présent. Pas de Chrome ni de ffmpeg au départ : voir §12 pour les installer depuis npm et PyPI.
- L'environnement Python de test (`/tmp/venv`) n'est pas persisté : réinstaller les dépendances si besoin.
- Les fichiers hors `/home/user` ne sont pas sauvegardés. Tout le travail est dans `/home/user/clip-arm`.

## 9. Préférences de l'utilisateur (à respecter)

- Il parle français, et veut des réponses courtes et concrètes, sans jargon inutile.
- Il ne veut pas de limite de 128 Mo : seule compte la limite de GitHub.
- Tout le visuel est **généré et animé** : ne jamais lui demander de photo de la cuisinière, de famille ou de plats.
- Il veut **tout** garder : les passages ajoutés par Suno (« Aïe », « R roulé », reprise) ne doivent pas être ignorés.
- Il valide ce qu'il entend à l'oreille. Il ne veut pas qu'on invente des paroles : quand la transcription est douteuse,
  il faut le dire et lui demander de vérifier.
- Il a des fichiers sur GitHub et travaille depuis l'interface web : donne-lui les étapes exactes (où cliquer, quelle
  branche).
- Le texte de l'utilisateur sur Suno est la référence, mais la **chanson chantée** fait foi pour le timing.

## 10. Mise à jour : personnage (fait après le document initial)

- **Portrait de référence choisi** : `assets/cuisiniere/reference.jpg` (896×1168). Généré entièrement, candidat 2 retenu
  par l'utilisateur. Femme d'environ 40 ans, foulard rouge, tablier crème, farine sur la joue.
- **Variantes lip-sync** : `assets/cuisiniere/bouche_ouverte.jpg` et `assets/cuisiniere/yeux_fermes.jpg`.
  Le générateur d'images **ne conserve pas le cadrage** d'une édition à l'autre (la tête tourne, le zoom change). Les
  variantes brutes ont donc été recalées sur la référence (ORB + transformation de similarité, OpenCV), et seule la zone
  de la bouche (ou des yeux) a été reprise, avec un contour doux. Le reste de chaque image est exactement la référence.
  Les variantes brutes ont été supprimées du dépôt (régénérables si besoin).
- **À faire avec ces images** : les basculer dans le moteur selon `voice` (bouche) et un clignement aléatoire mais
  déterministe (yeux, à partir d'une fonction de `t`, pas de `Math.random`). Vérifier à l'image près sur L02 et L26.
- Ne **pas** refaire de génération de variante sans recalage : le cadrage dérivera à nouveau.
- Pour toute nouvelle image du personnage (autre expression, autre plan) : générer, recaler, puis coller la zone seulement.

## 11. Mise à jour : moteur de pages (livre de recettes, concept B)

Fichiers (`pages/`) :
- `index.html` : `?t=<secondes>` affiche une image fixe ; `?play` lit `../audio/song.mp3` en temps réel.
- `book.js` : expose `window.BOOK.renderAt(t)`. Couverture (`intro`, puis avant la première section) ; page « Dolma » (`verse_1`, L02–L05, ingrédients cochés à L02 et L04, karaoké, portrait de la cuisinière : bouche selon `voice`, clignement `t % 3.7 < 0.14`) ; « Page à venir » pour les autres sections.
- `book.css` : mise en page 1920×1080. Pas de transition ni d'animation CSS.
- `fonts/` : Caveat 600, Playfair Display 400 et 600 (SIL OFL, @fontsource).
- `tools/snap.mjs` : capture d'écran à des temps donnés. Variables : `CLIP_DIR`, `CHROME_PATH`. Prérequis : `puppeteer-core`.

Assets ajoutés (`assets/plats/`) : `cover_tonir.jpg`, `dolma.jpg` (illustrations générées, validées à l'œil).
Assets cuisinière (`assets/cuisiniere/`) : `reference.jpg` (personnage choisi), `bouche_ouverte.jpg`, `yeux_fermes.jpg` (collages recalés). Validation utilisateur des bords des zones collées : à faire.

État visuel :
- Couverture (t=5, 20) : validée à l'œil. Tampon « DOLMA FOREVER » en une ligne, karaoké en bas de la colonne de droite.
- Page « Dolma » (t=45) : validée à l'œil. Paroles affichées sous « Chanté : ». Bug corrigé : le filtre utilisait `l.section`, absent de l'état ; il passe par `lineById[l.id].section`.

Captures de contrôle : `tmp/snaps/` (ignoré par Git, ne pas versionner). Commande :
`CLIP_DIR=$PWD CHROME_PATH=<chrome> node tools/snap.mjs <t…> --out tmp/snaps` (après `npm i puppeteer-core` dans le dossier du clip ; voir §12)
(Chromium et puppeteer-core ne sont pas persistés : à réinstaller si la session repart de zéro.)

À faire ensuite : pages restantes (Lavash, Menu, Kefta, Souvenirs, Fête, Fin de la recette, reprise finale) et leurs illustrations (generate_image) ; recaler `STORYBOARD.md` sur les temps finaux ; rendu 1080p sur la machine de l'utilisateur.

### Mise à jour : pages de recettes (suite de la section 11)

- `pages/book.js` : `buildRecipePage(secId, cfg)` construit une page par section (table `RECIPE_PAGES`) : lavash (p. 3), menu (p. 4), kefta (p. 5), souvenirs (p. 6), fête (p. 7), fin de la recette (p. 8, sans illustration), reprise « Encore ! » (p. 9, deux colonnes, avec cuisinière depuis le 8 oct. 2026 : voir §12).
- Liste : une case par ligne chantée, cochée à `line.start`. Hauteur de chaque ligne estimée (≈ 0,42 em par caractère) pour éviter les chevauchements.
- Illustrations ajoutées (`assets/plats/`) : `lavash.jpg`, `menu.jpg`, `kefta.jpg`, `souvenirs.jpg` (cadrage `pos: '30% 85%'`), `fete.jpg`. Vérifiées à l'œil.
- Captures vérifiées : t = 60 (lavash), 90 (menu), 107 (kefta), 125 (souvenirs), 140 (fête), 160 (fin), 210 (reprise).
- À valider : titres et numéros de page (Lavash, Menu, Kefta, Souvenirs, Fête, Fin de la recette, Encore !) ; texte des cases = paroles officielles telles quelles (« beureK », « R roulé… »).
- Reste à faire : illustration pour la page « Fin de la recette » (actuellement sans image), relecture de la reprise à l'écoute, recalage de STORYBOARD.md, rendu 1080p sur la machine de l'utilisateur.

### Mise à jour : inscriptions en arménien

- Police : Noto Serif Armenian (SIL OFL, @fontsource), `pages/fonts/noto-serif-armenian-armenian-{400,600}-normal.woff2`, famille CSS `NotoArm`.
- Couverture : « Հայաստան · Խոհարան » au-dessus de « Livre de cuisine ».
- Sous-titre arménien sous chaque titre de page : Տոլմա (Dolma), Լավաշ (lavash), Ճաշացանկ (menu), Քյուֆթա (kefta), Հիշողություններ (souvenirs), Խնջույք (fête), Բարի ախորժակ (fin), Կրկին (reprise).
- Graphies confirmées par sources : Տոլմա, Լավաշ, Քյուֆթա, Բաստուրմա, Սուջուխ, Բյորեկ. À faire relire par une personne arménophone : Խոհարան, Ճաշացանկ, Խնջույք, Հիշողություններ, Բարի ախորժակ, Կրկին.

### Mise à jour : page de fin

- Illustration `assets/plats/fin.jpg` ajoutée (table du soir presque vidée, bougie, lavash, citron, thé). Vérifiée à l'œil ; page « Fin de la recette » (p. 8) vérifiée à t = 160 s.
- Il ne reste plus de page sans illustration. Restent : relecture de la reprise à l'écoute, recalage de `STORYBOARD.md`, rendu 1080p sur la machine de l'utilisateur, et relecture des graphies arméniennes listées plus haut.

### Rendu vidéo : `tools/render.mjs`

- Chaque image est produite par `BOOK.renderAt(t)` (Chrome headless via puppeteer-core), puis envoyée à ffmpeg (H.264 `crf 18`, preset `slow`, AAC 320 kb/s, audio `audio/song.mp3`).
- Commandes (depuis `clips/dolma-forever`) :
  - aperçu rapide : `CHROME_PATH=<chrome> node tools/render.mjs --preview --from 40 --to 60`
  - master 1080p, 30 i/s, toute la chanson : `CHROME_PATH=<chrome> node tools/render.mjs`
  - sortie par défaut : `tmp/render/dolma-forever.mp4` (ignoré par Git, ne pas versionner).
- `FFMPEG=<chemin>` si ffmpeg n'est pas dans le PATH.
- Test effectué dans le sandbox sur 4 s en aperçu 960×540 (vidéo et audio présents, image à t = 42 s correcte). Le master 1080p n'a pas été produit ici : ffmpeg et Chrome sont sur la machine de l'utilisateur.

### Rendu en une commande : `tools/render_all.sh`

Sur la machine de l'utilisateur (terminal Linux, ou cellule « ! » de Colab), une seule ligne :

    curl -fsSL https://raw.githubusercontent.com/Thierryaco/clip-arm/arena/6075c539-clip-arm/clips/dolma-forever/tools/render_all.sh | bash -s --

Le script clone la branche, installe ffmpeg (apt) et puppeteer (qui télécharge Chrome), puis lance `render.mjs`.
Options : `--preview` (960×540, rapide), `--from 40 --to 60` (extrait). Sortie : `clips/dolma-forever/tmp/render/` (ignoré par Git).
Testé dans le sandbox sur un extrait de 2 s en aperçu (sans téléchargement de Chrome, avec CHROME_PATH et FFMPEG fournis). Le téléchargement de Chrome et l'appel `raw.githubusercontent.com` n'ont pas pu être testés ici.

Sur Colab : le fichier est créé sur le disque temporaire de la session (`/root/dolma-forever-render/...`), pas sur le disque de l'utilisateur. Le télécharger avant la fin de la session (cellule Python : `from google.colab import files; files.download(chemin)`). Le master est long à rendre sur Colab : garder l'onglet ouvert, ou faire le rendu par morceaux (`--from/--to`). Non testé sur Colab.

## 12. Mise à jour : session du 8 oct. 2026 (branche `arena/6075c539-clip-arm`)

**Branche et dépôt.** Cette session est fixée sur `arena/6075c539-clip-arm`. Le travail de `arena/2748952e-clip-arm` y a été reporté jusqu'à `cf182c7` (fast-forward). `arena/2748952e-clip-arm` n'a pas été modifiée. Commits de la session : `e9776cd` (rendu en une commande, docs à jour), puis le commit des décisions ci-dessous. Si le dépôt local repart d'un clone sans cet historique, la branche distante fait foi.

**Décisions prises (réponses de l'utilisateur, 8 oct. 2026).**
1. **Refrains** : le second passage est affiché au karaoké (L10b–L13b, L21b–L24b), sans case en plus : huit cases de plus ne tiennent pas sur la page « Menu » sans refaire la mise en page. Temps du premier mot (transcription) : 1:21,70 ; 1:24,90 ; 1:27,40 ; 1:29,90 ; 2:24,06 ; 2:26,40 ; 2:29,30 ; 2:31,67. Le reste de chaque ligne suit le même écart. **À vérifier à l'écoute.**
2. **L25** : « Aïe aïe aïe… aïdé à table ! Dolma forever… » (remplace « Hay hay hay, … »). « Aïe aïe aïe » (2:35) validé à l'écoute. Mots 4 à 8 à 3:00,94 ; 3:01,15 ; 3:01,40 ; 3:02,40 ; 3:03,30 (transcription). **À vérifier à l'écoute.**
3. **Reprise à 3:28** : « Dolma, keufté, beureK, R roulé » (L30 gardé). « Pour un café de repas », entendu par la transcription, n'est pas ajouté.
4. **Cuisinière sur « Encore ! »** : ajoutée (`cook: true`), dans le coin bas-droit comme sur les autres pages. La colonne droite de la liste passe à 440 px pour ne pas la recouvrir. Cela remplace le choix du §11 (« sans cuisinière »).

**Vérifié.**
- `python3 tools/sync.py --check` : 36 lignes + 8 passages répétés, 0 erreur. `node tools/test_engine_state.js` : passe (44 lignes).
- `python3 tools/sync.py --reuse-analysis` : sans librosa, garde `core/audio-analysis.js`. Sans changement de contenu, il reproduit à l'octet près les fichiers committés.
- Captures (Chromium 153) : t = 85 (menu : L11b au karaoké), 146,5 (fête : L22b), 183 (L25 : « Dolma » en cours), 210 (Encore : L30, cuisinière visible), 218,5 (Encore : L33, karaoké sans chevauchement).
- Lip-sync L02 : bouche fermée à 40,40 s, ouverte à 40,47 s, clignement à 40,70–40,83 s.
- Rendu séquentiel et rendu isolé identiques au pixel près sur 40–46 s (PSNR ≥ 55 dB) : `render.mjs` n'a pas besoin de changer.

**Ce qui reste à écouter ou à décider.**
1. L26–L29 : jouées une fois ou deux fois ? La transcription ne les donne qu'une fois (3:16–3:28). Le §3 et `paroles.json` disent deux fois.
2. L31 à 3:31,5 : la transcription entend « Soudjouk qui craque », pas « Bouboules keufté… ». L32 (3:34,3) est interpolé.
3. E01 (3:04) : aucun mot transcrit entre 3:03 et 3:17. L'écho est-il chanté là ?
4. Annotation « r roulé » de L10 et L21 : non affichée (texte nettoyé).
5. Graphies arméniennes : relecture par une personne arménophone (§11).

**Points de finition (proposés, non faits).**
- Lip-sync nerveux : environ 5 bascules par seconde pendant le couplet 1 ; 29 tenues sur 74 durent moins de 3 images. Proposition : tenir la bouche ouverte au moins 0,1 s.
- Clignement toutes les 3,7 s, très régulier. Proposition : rythme irrégulier mais déterministe (fonction de l'index du clignement, sans `Math.random`).
- Page « Encore ! » : espace un peu grand après L29 (la hauteur de « À table en Arménie… » est estimée sur deux lignes, alors qu'elle tient sur une). Cosmétique.

**Commandes.**
- Temps : `python3 tools/sync.py --reuse-analysis` (sans librosa) ; `python3 tools/sync.py` régénère aussi l'analyse audio (numpy et librosa requis).
- Corrections dans `timings/overrides.json` : début d'une ligne `{"L14": {"start": 100.2}}` ; un temps par mot `{"L25": {"words": [...]}}` ; passage répété `"repeats": {"L10": {"start": 81.7}}` (crée `L10b`, karaoké seulement).
- Captures : `npm i puppeteer-core` dans `clips/dolma-forever/`, puis `CLIP_DIR=$PWD CHROME_PATH=<chrome> node tools/snap.mjs <t…> --out tmp/snaps`.
- Sandbox (hors dépôt, non persistés) : Chromium 153 via npm `@sparticuz/chromium` (décompresser `bin/al2023.tar.br` dans `/tmp/al2023`, `LD_LIBRARY_PATH=/tmp/al2023/lib`) ; ffmpeg 7.0.2 via PyPI `imageio-ffmpeg`.
- Rendu sur la machine de l'utilisateur : `curl -fsSL https://raw.githubusercontent.com/Thierryaco/clip-arm/arena/6075c539-clip-arm/clips/dolma-forever/tools/render_all.sh | bash -s -- --preview` (sans `--preview` : master 1080p). Testé le 8 oct. 2026 : `tools/render_all.sh` clone la branche depuis GitHub (commit `aa0b2b1`) et rend un extrait de 2 s en aperçu (H.264 960×540, AAC) ; Chrome et ffmpeg étaient fournis par le sandbox. L'URL `raw.githubusercontent.com` n'est pas accessible depuis le sandbox : elle n'a pas été testée telle quelle.
