# Dolma Forever : clip musical

Clip 16:9 1080p sur la chanson Suno [titispeed, « (soft duduk intro, percussions qui montent doucement) »](https://suno.com/s/6d0gOkzMpM9DFNuI)
(3:59). Concept : un **livre de recettes animé**, chaque section de la chanson est une page, avec une cuisinière
virtuelle qui chante depuis une photo collée.

## Contenu

| fichier | rôle | état |
|---|---|---|
| `METHODE_ADAPTEE.md` | méthode, pipeline, agents, points de vigilance | à jour |
| `STORYBOARD.md` | une entrée par ligne chantée (L01…L25, E01) | à jour |
| `lyrics/paroles.json` | paroles officielles, sections, prononciation | à jour |
| `tools/transcribe.py` | transcription mot par mot (faster-whisper) | à lancer sur ta machine |
| `tools/sync.py` | analyse audio + alignement + timings + données du moteur | prêt, testé sur chanson de test |
| `tools/test_engine_state.js` | teste l'état du clip à un instant t | prêt, teste les données générées |
| `core/engine-state.js` | état pur à l'instant t (ligne, mot, section, beat, énergie) | prêt, testé |
| `audio/song.mp3` | la chanson | **à ajouter** |
| `timings/timings.json`, `timings/TIMINGS.md` | temps de chaque ligne | générés par `sync.py` |
| `core/lyrics-data.js`, `core/audio-analysis.js` | données pour le navigateur | générés par `sync.py` |

## Pour lancer la synchronisation

Il faut `audio/song.mp3` (la chanson) et, sur ta machine, Python 3.10+ :

```bash
pip install librosa soundfile numpy faster-whisper
python3 tools/transcribe.py      # → audio/transcript.json
python3 tools/sync.py            # → timings, données du moteur, contrôle
node tools/test_engine_state.js  # → vérifie l'état du clip sur les données générées
```

Les corrections à l'oreille vont dans `timings/overrides.json`, par exemple `{"L05": {"start": 46.2}}`. Puis on relance
`sync.py`.

## Ce qu'il manque

1. **Le MP3** : dépose-le dans `audio/song.mp3`, sur la branche `arena/2748952e-clip-arm`. Le sandbox ne peut pas
   télécharger la chanson depuis Suno.
2. **Une photo de la cuisinière** si tu veux qu'elle ressemble à quelqu'un (sinon elle est générée).
3. **Facultatif** : une photo de famille pour la ligne L20.

## Taille

Le dépôt doit rester sous 128 Mo. Le `.gitignore` exclut `out/`, les vidéos rendues (le master 1080p pèse environ 2 Go)
et les intermédiaires d'analyse. Les données générées restent petites (environ 1 Mo).
