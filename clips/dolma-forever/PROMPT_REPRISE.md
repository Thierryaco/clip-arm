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
- **Branche de travail (obligatoire)** : `arena/2748952e-clip-arm`. Ne jamais travailler sur une autre branche.
- **Dossier du clip** : `clips/dolma-forever/`.
- **Dernier commit** : `235c2e3` (« E01 : garde sa place »).
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
- Node 22 est présent. Python 3.11 est présent. Pas de Chrome ni de ffmpeg.
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
