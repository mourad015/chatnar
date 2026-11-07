#!/usr/bin/env bash
# Start a new Path Story video project from the engine + the reference example.
#   bash new_video.sh <source-video-or-audio> <project-dir>
# Creates <project-dir> with the engine, the example's script/shots/score to rewrite, and data/narration.wav.
set -euo pipefail
SK="$(cd "$(dirname "$0")/.." && pwd)"; SRC="$1"; P="$2"
[ -e "$P" ] && { echo "$P already exists — not overwriting"; exit 1; }
mkdir -p "$P/data" "$P/audio" "$P/review" "$P/renders"
cp -r "$SK/engine/." "$P/"
cp "$SK/example/why-lord/script.json" "$SK/example/why-lord/score.py" "$P/"; cp "$SK/example/why-lord/shots.js" "$P/src/shots.js"
ffmpeg -v error -y -i "$SRC" -vn -c:a aac -b:a 160k "$P/audio/source.m4a"
ffmpeg -v error -y -i "$SRC" -vn -ar 48000 -ac 2 "$P/data/narration.wav"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$P/data/narration.wav" | xargs printf "narration: %.2f s\n"
echo "project ready: $P  (rewrite script.json, src/shots.js, score.py — see SKILL.md)"
