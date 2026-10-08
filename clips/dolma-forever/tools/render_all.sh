#!/usr/bin/env bash
# Rendu complet de « Dolma Forever » en une commande.
# Ce script : récupère le dépôt (branche de travail), installe ce qui manque (ffmpeg, Chrome via puppeteer),
# puis lance tools/render.mjs. Sortie : clips/dolma-forever/tmp/render/dolma-forever.mp4 (1920×1080, 30 i/s, audio).
#
# Usage (une seule ligne dans un terminal Linux, ou dans une cellule « ! » de Colab) :
#   curl -fsSL https://raw.githubusercontent.com/Thierryaco/clip-arm/arena/6075c539-clip-arm/clips/dolma-forever/tools/render_all.sh | bash
# Options : à ajouter après « bash -s -- » (sinon le script ne les reçoit pas) :
#   ... | bash -s -- --preview            (960×540, rapide)
#   ... | bash -s -- --from 40 --to 60    (un extrait)
# Variables facultatives : WORK (dossier de travail, défaut ~/dolma-forever-render), REPO_URL et BRANCH (dépôt et branche),
#                          CHROME_PATH (Chrome déjà installé), FFMPEG (ffmpeg déjà installé).
set -euo pipefail

main() {
  export DEBIAN_FRONTEND=noninteractive
  local REPO_URL="${REPO_URL:-https://github.com/Thierryaco/clip-arm.git}"
  local BRANCH="${BRANCH:-arena/6075c539-clip-arm}"
  local WORK="${WORK:-$HOME/dolma-forever-render}"
  local SUDO=""
  if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi

  echo "== 1/4 Dépôt (branche $BRANCH)"
  mkdir -p "$WORK"
  if [ -d "$WORK/clip-arm/.git" ]; then
    git -C "$WORK/clip-arm" fetch -q origin "$BRANCH"
    git -C "$WORK/clip-arm" checkout -q "$BRANCH"
    git -C "$WORK/clip-arm" pull -q --ff-only origin "$BRANCH"
  else
    git clone -q -b "$BRANCH" "$REPO_URL" "$WORK/clip-arm"
  fi
  local CLIP="$WORK/clip-arm/clips/dolma-forever"

  echo "== 2/4 Outils (Node.js, ffmpeg)"
  local NODE_MAJOR=0
  if command -v node >/dev/null 2>&1; then NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]'); fi
  if [ "$NODE_MAJOR" -lt 18 ]; then
    # Node absent ou trop ancien (Puppeteer demande Node 18+) : on installe une version récente.
    if ! command -v npm >/dev/null 2>&1 && command -v apt-get >/dev/null 2>&1; then
      $SUDO apt-get update -qq && $SUDO apt-get install -y -qq npm
    fi
    if command -v npm >/dev/null 2>&1; then
      $SUDO npm install -g --silent n && $SUDO n 20 >/dev/null
      hash -r
    fi
    NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
    if [ "$NODE_MAJOR" -lt 18 ]; then echo "Node.js 18+ est requis : installez-le (https://nodejs.org) puis relancez."; exit 1; fi
  fi
  if [ -z "${FFMPEG:-}" ] && ! command -v ffmpeg >/dev/null 2>&1; then
    if command -v apt-get >/dev/null 2>&1; then
      $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg
    else
      echo "ffmpeg est requis : installez-le (https://ffmpeg.org) puis relancez."; exit 1
    fi
  fi

  echo "== 3/4 Dépendances de rendu (puppeteer)"
  local RDIR="$WORK/render"
  mkdir -p "$RDIR"
  cp "$CLIP/tools/render.mjs" "$RDIR/render.mjs"
  cd "$RDIR"
  [ -f package.json ] || echo '{"name":"dolma-render","private":true,"type":"module"}' > package.json
  if [ ! -d node_modules/puppeteer ]; then
    # Si un Chrome est déjà fourni (CHROME_PATH), on évite le téléchargement de Chrome.
    if [ -n "${CHROME_PATH:-}" ]; then export PUPPETEER_SKIP_DOWNLOAD=1; fi
    npm install --silent puppeteer
  fi

  echo "== 4/4 Rendu"
  export CLIP_DIR="$CLIP"
  node "$RDIR/render.mjs" "$@"
  echo "Terminé. Vidéo : $CLIP/tmp/render/"
}

# Le script est souvent lancé avec « curl … | bash » : stdin est alors le script lui-même.
# On coupe stdin pour que les commandes lancées ici ne puissent pas le consommer.
main "$@" < /dev/null
