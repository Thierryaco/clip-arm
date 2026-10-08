# Dolma Forever : clip musical

Clip 16:9 1080p sur la chanson Suno [titispeed, « (soft duduk intro, percussions qui montent doucement) »](https://suno.com/s/6d0gOkzMpM9DFNuI)
(3:59). Concept : un **livre de recettes animé**. Chaque section de la chanson est une page. Une cuisinière virtuelle,
générée, chante depuis une photo collée dans le livre (lip-sync).

Où en est le projet et ce qui reste à faire : [`PROMPT_REPRISE.md`](PROMPT_REPRISE.md) (sections 6 et 12).

## Contenu

| fichier | rôle |
|---|---|
| `PROMPT_REPRISE.md` | document de reprise : état, points à écouter, commandes |
| `METHODE_ADAPTEE.md` | méthode, pipeline, agents, points de vigilance |
| `STORYBOARD.md` | une entrée par ligne chantée (L01…L35, E01) |
| `lyrics/paroles.json` | paroles, sections, prononciation |
| `audio/song.mp3` | la chanson (239,9 s, stéréo 48 kHz ; copie de `kenji dolma.mp3`, dépôt `Thierryaco/congenial-dollop`) |
| `audio/transcript.json` | transcription mot par mot, faite sur Colab (52 % des mots reconnus) |
| `timings/overrides.json` | corrections manuelles des temps |
| `timings/timings.json`, `timings/TIMINGS.md` | temps de chaque ligne (générés par `sync.py`) |
| `core/engine-state.js` | état du clip à l'instant t (fonctions pures) |
| `core/lyrics-data.js`, `core/audio-analysis.js` | données pour le navigateur (générées par `sync.py`) |
| `pages/` | le livre : `book.js` (`renderAt(t)`), `book.css`, `index.html` |
| `assets/` | illustrations des plats et portrait de la cuisinière |
| `tools/` | `sync.py`, `transcribe.py`, `test_engine_state.js`, `snap.mjs`, `render.mjs`, `render_all.sh` |

## Commandes

```bash
python3 tools/sync.py --check     # vérifie timings/timings.json
python3 tools/sync.py             # recalcule les temps (après une correction dans timings/overrides.json)
node tools/test_engine_state.js   # tests du moteur
```

`sync.py` demande `pip install librosa soundfile numpy`. `transcribe.py` demande `pip install faster-whisper` ; le modèle
Whisper se télécharge depuis Hugging Face, donc la transcription se fait sur ta machine (elle est déjà faite).

Rendu, sur ta machine (terminal Linux, ou cellule `!` de Colab) :

```bash
curl -fsSL https://raw.githubusercontent.com/Thierryaco/clip-arm/arena/6075c539-clip-arm/clips/dolma-forever/tools/render_all.sh | bash -s -- --preview
```

Sans `--preview` : le master 1080p (environ 2 Go). Il reste hors dépôt : `tmp/` est ignoré par Git.

## Taille

Le dépôt doit rester sous la limite de GitHub (100 Mo par fichier). Le `.gitignore` exclut `out/`, `tmp/`, les vidéos
et `audio/analysis.json` (intermédiaire régénéré par `sync.py`).
