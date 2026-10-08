#!/usr/bin/env python3
"""Transcription mot par mot de la chanson (faster-whisper, large-v3-turbo, CPU int8).

Usage (sur ta machine, Python 3.10+ et `pip install faster-whisper`) :
    python tools/transcribe.py                       # lit audio/song.mp3, écrit audio/transcript.json
    python tools/transcribe.py --audio autre.mp3 --out autre.json

Le premier lancement télécharge le modèle depuis Hugging Face (environ 1,6 Go).
Le sandbox ne peut pas le faire : lance ce script sur ton PC.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def build_prompt(lyrics_path: Path) -> str:
    """Prompt initial : noms propres et paroles, pour orthographier correctement."""
    data = json.loads(lyrics_path.read_text(encoding="utf-8"))
    words = data.get("transcription_initial_prompt_words", [])
    first_chorus = next(
        (s["lines"] for s in data["sections"] if s["id"] == "chorus_1"), []
    )
    return ", ".join(words) + ". " + " ".join(first_chorus)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--audio", default=str(ROOT / "audio" / "song.mp3"))
    ap.add_argument("--lyrics", default=str(ROOT / "lyrics" / "paroles.json"))
    ap.add_argument("--out", default=str(ROOT / "audio" / "transcript.json"))
    ap.add_argument("--model", default="large-v3-turbo")
    ap.add_argument("--threads", type=int, default=8)
    args = ap.parse_args()

    audio = Path(args.audio)
    if not audio.exists():
        print(f"Fichier introuvable : {audio}. Dépose le MP3 dans audio/song.mp3.", file=sys.stderr)
        return 1

    from faster_whisper import WhisperModel

    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=args.threads)
    segments, info = model.transcribe(
        str(audio),
        language="fr",
        word_timestamps=True,
        initial_prompt=build_prompt(Path(args.lyrics)),
        # Évite les hallucinations sur les silences (« Sous-titrage ST' 501 », etc.)
        condition_on_previous_text=False,
        vad_filter=False,
    )

    words = []
    segs = []
    for seg in segments:
        segs.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip()})
        for w in seg.words or []:
            words.append({
                "word": w.word.strip(),
                "start": round(w.start, 3),
                "end": round(w.end, 3),
                "prob": round(w.probability, 3),
            })

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps({"model": args.model, "language": info.language, "duration": info.duration,
                    "segments": segs, "words": words}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"{len(words)} mots, {len(segs)} segments -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
