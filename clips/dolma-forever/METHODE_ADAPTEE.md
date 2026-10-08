# Méthode adaptée : clip « Dolma Forever » (Suno, 3:59)

Adaptation de la méthode « Connexion terminée » (clip de 4:15 généré par une équipe d'agents) à la chanson Suno
[`(soft duduk intro, percussions qui montent doucement)`](https://suno.com/s/6d0gOkzMpM9DFNuI) de titispeed.

## Choix retenus

| choix | valeur |
|---|---|
| Concept | **B : livre de recettes animé**. Le clip est un livre de cuisine qui se feuillette ; chaque section est une page |
| Chanteuse | **virtuelle**, une cuisinière, photo collée dans le livre et lip-sync (méthode d'origine : variantes bouche ouverte / yeux fermés) |
| Format | **16:9, 1920×1080, 30 i/s** |
| Durée | 3:59 (chanson complète) |

Points restés ouverts : nom et apparence de la cuisinière, graphie de « beureK » à l'écran.

---

## 1. Ce qui change, ce qui reste

| Élément de la méthode d'origine | Pour ce clip |
|---|---|
| Horloge narrative 1995 → 2026 | Pas d'horloge : la structure est celle du **livre**, une page par section, avec un numéro de page qui défile |
| Lina chante dans les fenêtres d'une époque | La cuisinière chante depuis une **photo collée** dans le livre (cadre photo, bord de papier, ombre) |
| Captures d'archives (Wayback Machine) comme modèles | Remplacées par des **références de livres de cuisine** : mise en page d'époque, cartes d'ingrédients, tampons, marges annotées |
| ~16 agents, deux vagues | Version allégée : 4 agents « modules » + 8 agents « pages » (une par partie de la chanson) |
| Moteur `renderAt(t)` + rendu Chrome headless + ffmpeg | **Inchangé** : la partie la plus réutilisable, valable pour n'importe quelle chanson |

Ce qui reste : la vidéo est une page web dont chaque image est une fonction pure du temps. Les paroles sont
synchronisées mot par mot, les beats et l'énergie pilotent les coupes, et chaque référence chantée est visible au
moment où elle est chantée.

---

## 2. Ce qu'il te faut

1. **Le MP3 de la chanson.** Le lien Suno ne donne que la page, et le sandbox ne peut pas télécharger l'audio (les
   serveurs de Suno ne répondent pas d'ici). Dépose le fichier dans le dépôt :
   `clips/dolma-forever/audio/song.mp3` (environ 4 à 10 Mo, bien sous la limite de 128 Mo). Tu peux le faire en
   ajoutant le fichier au dépôt sur GitHub, sur la branche `arena/2748952e-clip-arm`.
2. **Une photo de la cuisinière** (ou une clé Gemini pour la générer, voir étape 5). Si tu veux qu'elle ressemble à
   quelqu'un, il faut une vraie photo de référence, pas une génération.
3. **Facultatif** : des photos de famille, de plats, de cuisine (si tu veux les intégrer comme souvenirs dans le pont).

---

## 3. Contraintes techniques à connaître

- **Rendu final sur ta machine.** Le sandbox n'a ni Chrome ni ffmpeg, et ne peut pas télécharger les binaires depuis
  Google ou ffmpeg.org. Il a accès à npm et PyPI : les outils Python et Node se posent ici, mais le rendu 1080p
  (Chrome headless + ffmpeg) se lancera sur ton PC.
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
├─ README.md · .gitignore
└─ (à créer ensuite)  core/ pages/ tools/ docs/ assets/ out/ (ignoré)
```

### Étape 1 : décoder l'audio (sur ta machine, ~5 min)
- Transcription mot par mot avec faster-whisper `large-v3-turbo` ; passer les mots de
  `transcription_initial_prompt_words` dans l'`initial_prompt` pour les orthographier correctement.
- Alignement des 25 lignes chantées (`paroles.json`) sur les mots horodatés, par index proportionnel.
- librosa : tempo (annoncé 120–135 BPM, à mesurer), beats, énergie, bande voix 250–3500 Hz pour le lip-sync, 16 bandes
  de spectre à 30 i/s.
- Sortie : `audio/analysis.js`, `core/lyrics-data.js`, et les vrais timings des sections (qui remplacent les
  `estimated_start_s`).

### Étape 2 : moteur
Reprendre `engine.js`, `main.js`, `base.css`, `index.html`, `snap.js`, `render.js`. Adapter la mise en page (taille de
page, marges, grain papier) et la palette.

### Étape 3 : storyboard
Une entrée par ligne chantée : ce qui est sur la page à ce moment, l'ingrédient ou la photo mis en avant, le style des
sous-titres. Première version en §6.

### Étape 4 : vague 1, 4 agents « modules »
| agent | livrable |
|---|---|
| `livre` | le livre lui-même : reliure, pages qui se tournent, numéros, marges, grain et papier vieilli, transitions de page sur les beats |
| `ingredients` | illustrations animées des plats et ingrédients (feuilles de vigne, lavash, kefta, soudjouk, pasteurma), fiches « ingrédients » et étapes numérotées |
| `cuisinière` | la chanteuse : photo collée, lip-sync (fermée / ouverte / clignement selon l'énergie de la voix), cadre photo et ombre |
| `sous_titres` | karaoké mot par mot en écriture manuscrite ou typo de livre de cuisine, tampons, annotations à la main, écho de l'outro |

Chaque agent se teste sur son banc `?lab=nom`, fait au moins 4 allers-retours « je regarde, je corrige » avec
`snap.js`, et écrit sa doc `docs/<module>.md`.

### Étape 5 : images (si besoin)
- Portrait de la cuisinière (référence) puis variantes : bouche ouverte, yeux fermés, pour le lip-sync. Outil :
  `tools/gen_image.py` avec une clé Gemini, ou ta propre photo.
- Illustrations des plats : soit générées (fond transparent, style aquarelle ou gravure de livre de cuisine), soit
  dessinées en SVG par l'agent `ingredients`. Pas de logo ni d'interface de marque.

### Étape 6 : vague 2, 8 agents « pages »
Une par partie : intro · couplet 1 · couplet 2 · refrain 1 · couplet 3 · pont · refrain 2 · outro. Chaque agent travaille
depuis les docs (jamais les gros fichiers source), fait au moins 6 allers-retours visuels et rend un tableau de
couverture ligne → page.

### Étape 7 : contrôle et rendu
```bash
node tools/snap.js --range 0:240:2 --sheet wip --scale 0.25      # planche de contrôle
node tools/render.js --preview --out out/apercu.mp4              # aperçu 960x540
node tools/render.js --out "out/dolma-forever 1080p.mp4"         # master 1080p (sur ta machine)
```
Puis une version web légère (crf 20, maxrate 14M) pour partager le clip.

---

## 5. Storyboard de départ (concept B, à caler sur l'audio)

Les temps sont des estimations à partir de la structure Suno (3:59 au total). Ils seront remplacés par les vrais
timings après l'analyse.

| section | temps estimé | page du livre à l'écran |
|---|---|---|
| Intro | 0–14 s | **Couverture** : le livre s'ouvre sur un tonir fumant dessiné. Titre « Dolma Forever » tamponné au rythme des percussions. « Hayastan… » écrit à la main en première ligne. |
| Couplet 1 (dolma) | 14–45 s | **Page « Dolma »** : liste d'ingrédients qui se coche au fur et à mesure (riz, viande, herbes, feuilles de vigne). Une feuille se roule par temps. La cuisinière, photo collée en coin, chante la ligne. |
| Couplet 2 (lavash) | 45–76 s | **Page « Lavash »** : étapes numérotées (1. pâte, 2. tonir, 3. claquer). Un dessin de pâte qui s'étire et dore à chaque mot. « UNESCO dans le cœur » : tampon « patrimoine » générique, sans logo. |
| Refrain 1 | 76–104 s | **Page « Menu »** : les plats en colonne, chaque nom (dolma, keufté, beureK, soudjouk, pasteurma) s'allume au moment où il est chanté. Le karaoké est écrit à la main en marge. |
| Couplet 3 (kefta) | 104–134 s | **Page « Kefta »** : boulettes qui roulent sur la page, sauce tomate qui mijote (ligne de vapeur animée). « Fromage qui file » : une photo de beureK, fromage étiré en gros plan. |
| Pont (duduk solo) | 134–166 s | **Pages « Souvenirs »** : photos anciennes collées, papier jauni, scotch qui se décolle. Le livre ralentit, grain plus fort. Soudjouk qui sèche au vent, pasteurma rouge. La cuisinière ne chante pas, elle regarde la page. |
| Refrain 2 (plus fort) | 166–200 s | **Double page « Fête »** : confettis, plats qui sortent de la page, marges annotées de plus en plus vite, chœurs. |
| Outro | 200–239 s | **Dernière page « Fin de la recette »** : la table se vide, les pages se referment une à une, la lumière baisse. « Dolma forever… » reste en tampon. L'écho « beureK… keufté… pasteurmaaa… lavashhhh… » s'efface dans le noir. |

---

## 6. Points de vigilance

- **Graphie** : « beureK » dans les paroles, « r roulé » indiqué entre parenthèses. À l'écran, une seule graphie à
  choisir.
- **Transcriptions des noms** : soudjouk (aussi sujuk), pasteurma (pastırma), keufté (kefta, kofta), tonir, lavash.
  Le texte officiel reste tel quel dans `paroles.json`.
- **Représentation** : c'est une chanson sur la cuisine arménienne et la fierté d'un héritage. Les images doivent
  rester authentiques (tonir, lavash, vraies cuisines, vraies tables de famille) et éviter les clichés de carte
  postale.
- **Droits** : la chanson est générée par Suno ; vérifie que ton abonnement te donne les droits d'exploitation
  commerciale si tu publies le clip. Les images générées suivent les conditions du fournisseur.
- **Pas de logo ni d'interface de marque** dans les images générées.
