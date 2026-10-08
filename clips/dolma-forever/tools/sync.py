#!/usr/bin/env python3
"""Synchronise la chanson, les paroles et le storyboard. Une seule source de vérité : lyrics/paroles.json.

Entrées (dans le dossier du clip) :
  audio/song.mp3              la chanson (obligatoire)
  audio/transcript.json       transcription mot par mot (tools/transcribe.py) : alignement automatique
  timings/overrides.json      corrections manuelles, prioritaires : {"L05": {"start": 46.2}, "sections": {...}}
  lyrics/paroles.json         paroles officielles, sections, lignes, prononciation

Sorties :
  audio/analysis.json         features à 30 i/s : rms, voix, basses, onsets, 16 bandes, beats, tempo
  core/audio-analysis.js      mêmes features, pour le moteur du navigateur (window.AUDIO_ANALYSIS)
  core/lyrics-data.js         lignes et mots horodatés (window.LYRICS_DATA)
  timings/timings.json        temps de chaque ligne et section, avec la source de chaque temps
  timings/TIMINGS.md          tableau lisible : id, temps, section, texte (référencé par STORYBOARD.md)

Usage :
  python tools/sync.py                      # tout
  python tools/sync.py --check              # vérifie seulement timings.json (sans audio)
  python tools/sync.py --features-only      # analyse audio seule
"""
import argparse
import difflib
import json
import math
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
SR = 22050
HOP = SR // FPS  # 735 : une trame STFT = une image vidéo
N_FFT = 2048


# ---------------------------------------------------------------- paroles

def norm(token: str) -> str:
    """Forme comparable : minuscules, sans accents ni ponctuation."""
    t = unicodedata.normalize("NFKD", token)
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.lower().replace("œ", "oe").replace("æ", "ae")
    return "".join(c for c in t if c.isalnum())


def load_lines(lyrics: dict):
    """Renvoie la liste des lignes : id, section, texte, mots normalisés (les indications entre parenthèses sont exclues)."""
    lines = []
    n = 0
    for sec in lyrics["sections"]:
        for text in sec.get("lines", []):
            n += 1
            clean = re.sub(r"\([^)]*\)", "", text).strip()
            pairs = [(tok, norm(tok)) for tok in clean.split()]
            pairs = [(tok, w) for tok, w in pairs if w]
            lines.append({"id": f"L{n:02d}", "section": sec["id"], "text": text, "clean": clean,
                          "tokens": [t for t, _ in pairs], "norm": [w for _, w in pairs]})
        for k, text in enumerate(sec.get("echo", []), start=1):
            clean = re.sub(r"\([^)]*\)", "", text).strip()
            pairs = [(tok, norm(tok)) for tok in clean.split()]
            pairs = [(tok, w) for tok, w in pairs if w]
            lines.append({"id": f"E{k:02d}", "section": sec["id"], "text": text, "clean": clean,
                          "tokens": [t for t, _ in pairs], "norm": [w for _, w in pairs], "echo": True})
    return lines


# ---------------------------------------------------------------- analyse audio

def analyse_audio(audio_path: Path):
    import numpy as np
    import librosa

    y, sr = librosa.load(str(audio_path), sr=SR, mono=True)
    duration = len(y) / sr
    n_frames = int(math.ceil(duration * FPS))

    S = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP, center=True)) ** 2  # (1025, T)
    freqs = librosa.fft_frequencies(sr=sr, n_fft=N_FFT)

    def band(lo, hi):
        m = (freqs >= lo) & (freqs < hi)
        return S[m].sum(axis=0)

    def norm01(x, pct=99.5):
        ref = np.percentile(x, pct) + 1e-9
        return np.clip(x / ref, 0, 1)

    rms = norm01(np.sqrt(S.mean(axis=0)))
    voice = norm01(band(250, 3500))           # bande vocale : pilote la bouche
    bass = norm01(band(20, 250))              # basses : pilote les rebonds
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    onset = norm01(onset_env)

    mel = librosa.feature.melspectrogram(S=S, sr=sr, n_mels=16, fmin=50, fmax=11000)
    db = librosa.power_to_db(mel, ref=np.max(mel) if np.max(mel) > 0 else 1.0)
    bands = np.clip((db + 80.0) / 80.0, 0, 1)  # (16, T)

    tempo, beat_frames = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, hop_length=HOP,
                                                 start_bpm=125, units="frames")
    tempo = float(np.atleast_1d(tempo)[0])
    beat_times = [round(float(t), 3) for t in librosa.frames_to_time(beat_frames, sr=sr, hop_length=HOP)]

    def fit(x):
        x = np.asarray(x, dtype=float)
        if len(x) < n_frames:
            x = np.pad(x, (0, n_frames - len(x)))
        return x[:n_frames]

    def r(x):
        return [round(float(v), 3) for v in fit(x)]

    return {
        "fps": FPS,
        "duration": round(duration, 3),
        "frames": n_frames,
        "tempo": round(tempo, 1),
        "beats": beat_times,
        "rms": r(rms),
        "voice": r(voice),
        "bass": r(bass),
        "onset": r(onset),
        "bands": [[round(float(v), 3) for v in fit(bands[b])] for b in range(16)],
    }


# ---------------------------------------------------------------- alignement

def lcs_pairs(x, y):
    """Paires (i, j) de la plus longue sous-séquence commune de x et y (ordre conservé)."""
    m, k = len(x), len(y)
    dp = [[0] * (k + 1) for _ in range(m + 1)]
    for i in range(m - 1, -1, -1):
        for j in range(k - 1, -1, -1):
            if x[i] and x[i] == y[j]:
                dp[i][j] = dp[i + 1][j + 1] + 1
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
    pairs, i, j = [], 0, 0
    while i < m and j < k:
        if x[i] and x[i] == y[j] and dp[i][j] == dp[i + 1][j + 1] + 1:
            pairs.append((i, j)); i += 1; j += 1
        elif dp[i + 1][j] >= dp[i][j + 1]:
            i += 1
        else:
            j += 1
    return pairs


def align_words(lines, asr_words, duration):
    """Attribue un temps de début à chaque mot des paroles.

    Alignement monotone, ligne par ligne : pour chaque ligne, on cherche ses mots dans une fenêtre de la
    transcription qui commence après le dernier mot retenu. Les refrains répétés ne peuvent donc pas
    « sauter » vers une autre occurrence. Une ligne est ancrée si la moitié de ses mots est reconnue.
    Les mots restants sont interpolés entre les ancres voisines (dans toute la chanson).
    """
    flat = []  # (line_index, forme normalisée, mot d'origine)
    for li, line in enumerate(lines):
        for w, tok in zip(line["norm"], line["tokens"]):
            flat.append((li, w, tok))
    a = [w for _, w, _ in flat]
    b_norm = [norm(x["word"]) for x in asr_words]

    start = [None] * len(a)
    end = [None] * len(a)
    anchored_lines = 0
    cursor = 0
    pos = 0
    for line in lines:
        n = len(line["norm"])
        if n == 0:
            continue
        # position de la ligne : celle qui maximise la sous-séquence commune avec la transcription,
        # la plus proche du curseur en cas d'égalité (les refrains répétés ne font pas sauter)
        best_score, best_pairs = 0, []
        for p in range(cursor, min(len(asr_words), cursor + 3 * n + 20)):
            seg = b_norm[p:p + n + 4]
            pairs = lcs_pairs(line["norm"], seg)
            if len(pairs) > best_score:
                best_score = len(pairs)
                best_pairs = [(i, p + j) for i, j in pairs]
        if best_score >= 0.5 * n:
            anchored_lines += 1
            for i, j in best_pairs:
                start[pos + i] = asr_words[j]["start"]
                end[pos + i] = asr_words[j]["end"]
            cursor = best_pairs[-1][1] + 1
        pos += n
    anchored = sum(1 for s_ in start if s_ is not None)
    ratio = anchored / max(1, len(a))
    if anchored == 0:
        raise SystemExit("Aucun mot des paroles n'a été reconnu : vérifie la transcription (audio/transcript.json).")

    # interpolation des mots non reconnus.
    # 1) à l'intérieur de la ligne (cas le plus fréquent : un mot omis par la transcription) ;
    # 2) sinon, entre les ancres voisines de toute la chanson (ligne entière non reconnue).
    line_of = [li for li, _, _ in flat]
    known = [i for i, s_ in enumerate(start) if s_ is not None]
    gaps = []
    for k in range(len(known) - 1):
        i, j = known[k], known[k + 1]
        if line_of[i] == line_of[j] and j == i + 1:
            gaps.append(start[j] - start[i])
    gaps.sort()
    dt = min(0.9, max(0.2, gaps[len(gaps) // 2])) if gaps else 0.42
    for i in range(len(a)):
        if start[i] is not None:
            continue
        li = line_of[i]
        prev_in = max((k for k in known if k < i and line_of[k] == li), default=None)
        nxt_in = min((k for k in known if k > i and line_of[k] == li), default=None)
        if prev_in is not None and nxt_in is not None:
            t = (i - prev_in) / (nxt_in - prev_in)
            start[i] = start[prev_in] + (start[nxt_in] - start[prev_in]) * t
        elif nxt_in is not None:
            start[i] = max(0.0, start[nxt_in] - dt * (nxt_in - i))
        elif prev_in is not None:
            start[i] = min(duration, start[prev_in] + dt * (i - prev_in))
        else:
            prev = max((k for k in known if k < i), default=None)
            nxt = min((k for k in known if k > i), default=None)
            if prev is None:
                start[i] = max(0.0, start[nxt] - dt * (nxt - i))
            elif nxt is None:
                start[i] = min(duration, start[prev] + dt * (i - prev))
            else:
                t = (i - prev) / (nxt - prev)
                start[i] = start[prev] + (start[nxt] - start[prev]) * t

    # ordre strictement croissant
    for i in range(1, len(start)):
        if start[i] < start[i - 1] + 0.02:
            start[i] = start[i - 1] + 0.02

    words_by_line = [[] for _ in lines]
    for k, (li, _, tok) in enumerate(flat):
        words_by_line[li].append({"w": tok, "s": round(start[k], 3)})

    out_lines = []
    for li, line in enumerate(lines):
        ws = words_by_line[li]
        if not ws:
            continue
        # fin du mot = début du suivant ; fin de ligne = fin du dernier mot (plafonnée)
        for j, word in enumerate(ws):
            nxt_start = ws[j + 1]["s"] if j + 1 < len(ws) else None
            word["e"] = nxt_start if nxt_start is not None else round(word["s"] + 0.45, 3)
        out_lines.append({"id": line["id"], "section": line["section"], "text": line["clean"],
                          "echo": bool(line.get("echo")), "words": ws})

    # fin de ligne : jusqu'au début de la ligne suivante (pas de chevauchement)
    for i, line in enumerate(out_lines):
        line["start"] = line["words"][0]["s"]
        last = line["words"][-1]
        line_end = last["s"] + max(0.6, min(1.5, 0.35 * len(line["words"])))
        if i + 1 < len(out_lines):
            line_end = min(line_end, out_lines[i + 1]["words"][0]["s"])
        line["end"] = round(min(line_end, duration), 3)
        for word in line["words"]:
            word["e"] = min(word["e"], line["end"])

    return out_lines, ratio


def apply_overrides(lines, overrides, lyrics):
    """Corrections manuelles : {"L05": {"start": 46.2}} décale la ligne (sa durée est conservée)."""
    changed = []
    by_id = {l["id"]: l for l in lines}
    for lid, ov in overrides.items():
        if lid == "sections" or lid.startswith("_"):
            continue
        if lid not in by_id:
            print(f"  ! override ignoré : {lid} n'existe pas", file=sys.stderr)
            continue
        line = by_id[lid]
        if "start" in ov:
            delta = float(ov["start"]) - line["start"]
            dur = line["end"] - line["start"]
            line["start"] = round(float(ov["start"]), 3)
            line["end"] = round(line["start"] + dur, 3)
            for w in line["words"]:
                w["s"] = round(w["s"] + delta, 3)
                w["e"] = round(w["e"] + delta, 3)
            changed.append(lid)
    return changed


def build_sections(lines, lyrics, duration):
    secs = []
    for sec in lyrics["sections"]:
        ls = [l for l in lines if l["section"] == sec["id"]]
        if not ls:
            continue
        secs.append({"id": sec["id"], "label": sec["label"],
                     "start": min(l["start"] for l in ls),
                     "end": max(l["end"] for l in ls),
                     "source": "audio"})
    # début de section = début de sa première ligne, fin = début de la section suivante
    for i, s in enumerate(secs):
        s["end"] = secs[i + 1]["start"] if i + 1 < len(secs) else round(duration, 3)
    return secs


# ---------------------------------------------------------------- sorties

def fmt(t):
    m, s = divmod(t, 60)
    return f"{int(m)}:{s:05.2f}"


def write_outputs(root, lines, sections, meta, lyrics, analysis, warnings):
    import json as _json
    timings = {
        "song": lyrics["song"]["title_suno"],
        "duration": meta["duration"],
        "source": meta["source"],
        "tempo": analysis["tempo"] if analysis else None,
        "sections": sections,
        "lines": [{"id": l["id"], "section": l["section"], "start": l["start"], "end": l["end"],
                   "echo": l["echo"], "text": l["text"],
                   "source": l.get("source", meta["source"]),
                   "words": l["words"]} for l in lines],
        "warnings": warnings,
    }
    (root / "timings").mkdir(exist_ok=True)
    (root / "timings" / "timings.json").write_text(_json.dumps(timings, ensure_ascii=False, indent=1), encoding="utf-8")

    md = ["# Temps des lignes (généré par tools/sync.py : ne pas éditer à la main)", "",
          f"Source : **{meta['source']}** · durée : {meta['duration']:.2f} s · tempo : "
          f"{analysis['tempo'] if analysis else '?'} BPM", "",
          "| id | début | fin | section | texte |", "|---|---|---|---|---|"]
    for l in lines:
        md.append(f"| {l['id']} | {fmt(l['start'])} | {fmt(l['end'])} | {l['section']} | {l['text']} |")
    md += ["", "## Sections", "", "| section | début | fin |", "|---|---|---|"]
    for s in sections:
        md.append(f"| {s['id']} | {fmt(s['start'])} | {fmt(s['end'])} |")
    if warnings:
        md += ["", "## Avertissements", ""] + [f"- {w}" for w in warnings]
    (root / "timings" / "TIMINGS.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    core = root / "core"
    core.mkdir(exist_ok=True)
    ld = {"duration": meta["duration"], "source": meta["source"],
          "lines": [{"id": l["id"], "section": l["section"], "text": l["text"], "echo": l["echo"],
                     "start": l["start"], "end": l["end"],
                     "words": [[w["w"], w["s"], w["e"]] for w in l["words"]]} for l in lines],
          "sections": sections}
    (core / "lyrics-data.js").write_text(
        "// Généré par tools/sync.py : ne pas éditer.\nwindow.LYRICS_DATA = "
        + _json.dumps(ld, ensure_ascii=False) + ";\n", encoding="utf-8")


def check_timings(root, lyrics):
    path = root / "timings" / "timings.json"
    if not path.exists():
        print("Pas de timings/timings.json : lance tools/sync.py d'abord.", file=sys.stderr)
        return 1
    t = json.loads(path.read_text(encoding="utf-8"))
    errs = []
    ids = [l["id"] for l in t["lines"]]
    expected = [l["id"] for l in load_lines(lyrics)]
    if ids != expected:
        errs.append(f"ids de lignes différents des paroles : {ids} vs {expected}")
    prev_end = 0
    for l in t["lines"]:
        if l["start"] < prev_end - 1e-6:
            errs.append(f"{l['id']} commence avant la fin de la précédente ({l['start']} < {prev_end})")
        if l["end"] <= l["start"]:
            errs.append(f"{l['id']} : fin <= début")
        if l["end"] > t["duration"] + 1e-6:
            errs.append(f"{l['id']} dépasse la durée de la chanson")
        prev_end = l["end"]
    for s in t["sections"]:
        if s["end"] <= s["start"]:
            errs.append(f"section {s['id']} vide")
    print(f"timings : {len(ids)} lignes, source={t['source']}, {len(errs)} erreur(s)")
    for e in errs:
        print("  ✗", e)
    return 1 if errs else 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=str(ROOT))
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--features-only", action="store_true")
    args = ap.parse_args()
    root = Path(args.root)
    lyrics = json.loads((root / "lyrics" / "paroles.json").read_text(encoding="utf-8"))

    if args.check:
        return check_timings(root, lyrics)

    audio = root / "audio" / "song.mp3"
    if not audio.exists():
        print(f"Pas de chanson : dépose le MP3 dans {audio.relative_to(root)}", file=sys.stderr)
        return 1

    print("1/3 analyse audio (30 i/s)…")
    analysis = analyse_audio(audio)
    (root / "audio").mkdir(exist_ok=True)
    (root / "audio" / "analysis.json").write_text(json.dumps(analysis), encoding="utf-8")
    (root / "core").mkdir(exist_ok=True)
    (root / "core" / "audio-analysis.js").write_text(
        "// Généré par tools/sync.py : ne pas éditer.\nwindow.AUDIO_ANALYSIS = "
        + json.dumps(analysis) + ";\n", encoding="utf-8")
    print(f"    durée {analysis['duration']:.2f} s · tempo {analysis['tempo']} BPM · {len(analysis['beats'])} beats")
    if args.features_only:
        return 0

    duration = analysis["duration"]
    warnings = []
    lines = load_lines(lyrics)
    tr_path = root / "audio" / "transcript.json"
    overrides_path = root / "timings" / "overrides.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8")) if overrides_path.exists() else {}

    print("2/3 alignement des paroles…")
    if not tr_path.exists():
        print("  Pas de transcription : lance tools/transcribe.py sur ta machine (audio/transcript.json).",
              file=sys.stderr)
        return 1
    asr = json.loads(tr_path.read_text(encoding="utf-8"))["words"]
    out_lines, ratio = align_words(lines, asr, duration)
    source = "audio"
    if ratio < 0.6:
        warnings.append(f"Seulement {ratio:.0%} des mots reconnus : vérifie les lignes à l'écoute.")

    changed = apply_overrides(out_lines, overrides, lyrics)
    for l in out_lines:
        if l["id"] in changed:
            l["source"] = "manuel"

    # comparaison avec les estimations du départ (paroles.json)
    print("3/3 sections et contrôle…")
    sections = build_sections(out_lines, lyrics, duration)
    for sec in lyrics["sections"]:
        est = sec.get("estimated_start_s")
        mes = next((s["start"] for s in sections if s["id"] == sec["id"]), None)
        if est is not None and mes is not None and abs(est - mes) > 8:
            warnings.append(f"Section « {sec['label']} » : {mes:.1f} s mesurés contre {est} s estimés (écart > 8 s).")

    meta = {"duration": duration, "source": source}
    write_outputs(root, out_lines, sections, meta, lyrics, analysis, warnings)
    print(f"ok : {len(out_lines)} lignes, {len(sections)} sections, {ratio:.0%} de mots ancrés")
    for w in warnings:
        print("  ! " + w)
    return check_timings(root, lyrics)


if __name__ == "__main__":
    raise SystemExit(main())
