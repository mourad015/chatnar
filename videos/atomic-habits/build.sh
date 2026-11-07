#!/usr/bin/env bash
# Renders atomic-habits.mp4: 4 parallel frame workers + synthesized soundtrack.
set -e
cd "$(dirname "$0")"
TMP=${TMP_DIR:-$(mktemp -d)}
FR=2700; Q=$((FR/4))
python3 music.py
for k in 0 1 2 3; do node render.js $((k*Q)) $(((k+1)*Q)) "$TMP/part$k.mp4" & done; wait
printf "file '%s'\n" "$TMP"/part{0,1,2,3}.mp4 > "$TMP/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$TMP/list.txt" -i music.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart atomic-habits.mp4
rm -f music.wav
echo done
