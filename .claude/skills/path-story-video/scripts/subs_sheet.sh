#!/usr/bin/env bash
# Read burned-in subtitles: contact sheets of the subtitle band, 4 frames/s, time-stamped (look at them to transcribe).
#   bash subs_sheet.sh <video> <out-dir> [band_y_fraction=0.45] [band_h_fraction=0.1]
set -euo pipefail
V="$1"; O="$2"; Y="${3:-0.45}"; HB="${4:-0.1}"; mkdir -p "$O/cap"
ffmpeg -v error -y -i "$V" -vf "fps=4,crop=iw:ih*$HB:0:ih*$Y,scale=360:-1,drawtext=text='%{pts\:hms}':x=2:y=2:fontsize=12:fontcolor=yellow:box=1:boxcolor=black" "$O/cap/c%03d.png"
n=$(ls "$O/cap" | wc -l); k=0
for s in $(seq 1 50 "$n"); do ffmpeg -v error -y -start_number "$s" -i "$O/cap/c%03d.png" -vf tile=2x25 -frames:v 1 "$O/subs_$k.png"; k=$((k+1)); done
ls "$O"/subs_*.png
