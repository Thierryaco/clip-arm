# Méthode adaptée : clip « Dolma Forever » (Suno, 3:59)

Adaptation de la méthode « Connexion terminée » (clip de 4:15 généré par une équipe d'agents) à la chanson Suno
[`(soft duduk intro, percussions qui montent doucement)`](https://suno.com/s/6d0gOkzMpM9DFNuI) de titispeed.

Ce document est la feuille de route. Les points marqués **À DÉCIDER** attendent ta réponse.

---

## 1. Ce qui change, ce qui reste

| Élément de la méthode d'origine | Pour ce clip |
|---|---|
| Horloge narrative : 1995 → 2026 (le PC qui évolue) | **Horloge du repas** : une journée de fête, de l'aube (pâte, feuilles de vigne) à la nuit (table vide, lumières éteintes). **À DÉCIDER** (voir §5) |
| Personnage chanteur (Lina, lip-sync sur photos) | **À DÉCIDER** : personnage virtuel, sans visage, ou pas de chanteur à l'écran |
| Captures d'archives (Wayback Machine) comme modèles | Remplacées par des **références visuelles** : cuisine arménienne, tonir, marchés, tables de fête, pastiches de livres de cuisine |
| ~16 agents, deux vagues | Version allégée : 4 agents « modules » + 8 agents « sections » (une par partie de la chanson) |
| Moteur `renderAt(t)` + rendu Chrome headless + ffmpeg | **Inchangé** : c'est la partie la plus utile, elle marche pour n'importe quelle chanson |

Ce qui reste : la vidéo est une page web dont chaque image est une fonction pure du temps. Les paroles sont
synchronisées mot par mot, les beats et l'énergie pilotent les coupes, et chaque référence chantée est visible au
moment où elle est chantée.

---

## 2. Ce qu'il te faut

1. **Le MP3 de la chanson.** Le lien Suno ne donne que la page, et le sandbox ne peut pas télécharger l'audio (les
   serveurs de Suno ne sont pas accessibles d'ici). Dépose le fichier dans le dépôt :
   `clips/dolma-forever/audio/song.mp3` (environ 4 à 10 Mo, bien sous la limite de 128 Mo). Tu peux le faire en
   ajoutant le fichier au dépôt sur GitHub, sur la branche `arena/2748952e-clip-arm`.
   Si tu n'as pas de droits d'écriture ou si le fichier ne passe pas, dis-le-moi et on trouvera une autre solution.
2. **Tes choix créatifs** (§5).
3. **Facultatif, pour les images** : une clé API Gemini (Nano Banana) si tu veux un personnage photoréaliste ou des
   plans générés. Elle se met en variable d'environnement sur ta machine, jamais dans le dépôt.

---

## 3. Contraintes techniques à connaître

- **Rendu final sur ta machine.** Le sandbox n'a ni Chrome ni ffmpeg, et ne peut pas télécharger les binaires depuis
  Google ou ffmpeg.org. Il a accès à npm et PyPI, donc les outils Python et Node se posent ici sans problème, mais le
  rendu 1080p (Chrome headless + ffmpeg) se lancera sur ton PC, comme dans la méthode d'origine.
- **Transcription.** faster-whisper télécharge son modèle depuis Hugging Face, qui ne fait pas partie des hôtes
  autorisés depuis ce sandbox (seuls GitHub, npm et PyPI le sont). La transcription se fera donc en local, ou il
  faudra fournir le modèle.
- **Taille.** Le master 1080p fait environ 2 Go, la version web 450 Mo. Ces fichiers ne doivent pas entrer dans Git :
  le `.gitignore` du dossier exclut `out/` et les vidéos. Pour rester sous 128 Mo, on ne versionne que le code, les
  paroles, la doc et le MP3 source.

---

## 4. Pipeline adapté

```
clips/dolma-forever/
├─ audio/song.mp3                 ← à fournir
├─ lyrics/paroles.json            ← fait : paroles structurées par section (+ timings à caler)
├─ METHODE_ADAPTEE.md             ← ce document
├─ STORYBOARD.md                  ← à faire après analyse audio (une entrée par ligne chantée)
├─ README.md
└─ (à créer ensuite)  core/ scenes/ tools/ docs/ assets/ out/ (ignoré)
```

### Étape 1 : décoder l'audio (sur ta machine, ~5 min)
- Transcription mot par mot avec faster-whisper `large-v3-turbo` ; passer les mots de
  `transcription_initial_prompt_words` dans l'`initial_prompt` pour les orthographier correctement.
- Alignement des 25 lignes chantées (`paroles.json`) sur les mots horodatés par index proportionnel.
- librosa : tempo (annoncé 120–135 BPM, à mesurer), beats, énergie, bande voix 250–3500 Hz pour le lip-sync, 16 bandes
  de spectre à 30 i/s.
- Sortie : `audio/analysis.js`, `core/lyrics-data.js`, et les vrais timings des sections (qui remplacent les
  `estimated_start_s`).

### Étape 2 : moteur
Reprendre `engine.js`, `main.js`, `base.css`, `index.html`, `snap.js`, `render.js` tels quels. Adapter seulement
l'horloge (`E.YEAR_KEYS` devient une table heure du repas → temps de la chanson) et la palette.

### Étape 3 : storyboard
Une entrée par ligne chantée : ce qui est à l'écran à ce moment, la référence illustrée, le style des sous-titres.
Première version proposée en §6.

### Étape 4 : vague 1, 4 agents « modules »
| agent | livrable |
|---|---|
| `cuisine` | décor (cuisine/tonir/table, lumière qui change avec l'horloge), plats 3D-like ou illustrés, ustensiles, plans caméra nommés |
| `typo_fx` | sous-titres karaoké mot par mot, cartes de recette, grain, transitions sur les beats, écho de l'outro |
| `personnage` | la chanteuse ou la voix (selon §5) : lip-sync, variantes bouche/yeux si photo |
| `cartes_textes` | fiches d'ingrédients, étiquettes, menus, tampons « fait main », pastiche de livre de cuisine, typo |

Chaque agent se teste sur son banc `?lab=nom`, fait au moins 4 allers-retours « je regarde, je corrige » avec
`snap.js`, et écrit sa doc `docs/<module>.md`.

### Étape 5 : vague 2, 8 agents « sections »
Une par partie : intro · couplet 1 · couplet 2 (lavash) · refrain 1 · couplet 3 (kefta) · pont (duduk) ·
refrain 2 (plus fort) · outro. Chaque agent travaille depuis les docs (jamais les gros fichiers source), fait au moins
6 allers-retours visuels et rend un tableau de couverture ligne → image.

### Étape 6 : contrôle et rendu
```bash
node tools/snap.js --range 0:240:2 --sheet wip --scale 0.25      # planche de contrôle
node tools/render.js --preview --out out/apercu.mp4              # aperçu 960x540
node tools/render.js --out "out/dolma-forever 1080p.mp4"         # master 1080p (sur ta machine)
```
Puis une version web légère (crf 20, maxrate 14M) pour partager le clip.

---

## 5. Concepts possibles (À DÉCIDER)

**A. « Horloge du repas » (recommandé)**
Une journée de fête arménienne, de l'aube à la nuit. Intro à l'aube dans la cuisine, couplets de préparation
(feuilles de vigne, lavash, kefta), refrains à la table, pont au crépuscule avec les souvenirs, outro dans la nuit,
table vide et lumières éteintes. La musique fait avancer la journée, comme la chronologie de la méthode d'origine
faisait avancer les années.

**B. « Livre de recettes animé »**
Le clip est un livre de cuisine qui se feuillette. Chaque section est une page : ingrédients qui s'animent, étapes
numérotées, tampons, traces de doigts sur le papier. Très graphique, très rythmé, peu de personnages.

**C. « Diaspora »**
Une famille à Paris (le français des paroles le justifie) qui prépare le repas à distance, avec des photos de
l'Arménie, des appels vidéo, des souvenirs. Plus émotionnel, plus narratif, plus risqué à traiter sans clichés.

Dans les trois cas, la chanteuse peut être virtuelle (comme Lina) ou absente. Si elle est là, il faut une référence
photo et une clé Gemini.

---

## 6. Storyboard de départ (à caler sur l'audio)

Les temps sont des estimations à partir de la structure Suno (3:59 au total). Ils seront remplacés par les vrais
timings après l'analyse.

| section | temps estimé | ce qui est à l'écran (concept A) |
|---|---|---|
| Intro | 0–14 s | Aube sur une cour arménienne, un tonir qui s'allume, fumée, duduk qui monte. Le titre « Dolma Forever » s'écrit au rythme des percussions. « Hayastan… » apparaît en premier. |
| Couplet 1 (dolma) | 14–45 s | Gros plans sur les mains qui roulent les feuilles de vigne, une par temps. Riz, viande, herbes : chaque mot de la ligne apparaît sur l'ingrédient qu'il nomme. |
| Couplet 2 (lavash) | 45–76 s | La pâte étirée puis claquée contre le mur du tonir, un claquement par temps. « Doré en un éclair » : la pâte passe du blanc au doré. « UNESCO dans le cœur » : une plaque de pierre gravée à l'écran (sans logo). |
| Refrain 1 | 76–104 s | Montage rapide des plats (dolma, keufté, beureK, soudjouk, pasteurma) sur chaque temps, chaque nom en gros dans le karaoké. La table se dresse. « À table en Arménie » : la famille s'assoit. |
| Couplet 3 (kefta) | 104–134 s | Boulettes rondes qui roulent, sauce tomate qui mijote, fromage qui file (beureK) : plan serré sur la coupe, le fromage s'étire au rythme de la voix. |
| Pont (duduk solo) | 134–166 s | Ralenti. Soudjouk qui sèche au vent des hauts plateaux, pasteurma rouge, souvenirs : photos anciennes, grand-mère qui roule les feuilles. Le temps ralentit, le grain augmente. |
| Refrain 2 (plus fort) | 166–200 s | Explosion de couleurs, plans plus larges, la table se remplit de monde, chœurs joyeux, coupes plus rapides. |
| Outro | 200–239 s | Dernière bouchée, la table se vide, les lumières baissent une à une. « Dolma forever… » reste à l'écran. L'écho « beureK… keufté… pasteurmaaa… lavashhhh… » s'éloigne et se fond dans le noir. |

---

## 7. Points de vigilance

- **Graphie** : « beureK » dans les paroles, « r roulé » indiqué entre parenthèses. À l'écran, une seule graphie (à
  choisir).
- **Transcriptions des noms** : soudjouk (aussi sujuk), pasteurma (pastırma), keufté (kefta, kofta), tonir, lavash.
  Le texte officiel est gardé tel quel dans `paroles.json`.
- **Représentation** : c'est une chanson sur la cuisine arménienne et la fierté d'un héritage. Les images doivent
  rester authentiques (tonir, lavash, vraies cuisines, vraies tables de famille) et éviter les clichés, sans
  carte postale stéréotypée.
- **Droits** : la chanson est générée par Suno ; vérifie que ton abonnement te donne bien les droits d'exploitation
  commerciale si tu veux publier le clip. Les images générées sont à toi selon les conditions du fournisseur.
- **Aucun logo ni interface de marque** dans les images générées (les images d'un tonir ou d'une table n'ont pas de
  besoin de logo).
