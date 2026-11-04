#!/usr/bin/env bash
# Resumable chunked render of an episode. Each 300-frame chunk renders in a fresh browser, is checked
# (frame count) and kept; finished chunks are skipped on rerun, so a crash only costs one chunk.
# Then the chunks are joined without re-encoding and the soundtrack is muxed in once.
# Usage: EP=ep11 COMP=Ep11 TOTAL=1998 OUTFILE=out/ep11-whispering-cave.mp4 bash tools/render_chunks.sh
set -u
cd "$(dirname "$0")/.."
: "${EP:?set EP, e.g. ep11}" "${COMP:?set COMP, e.g. Ep11}" "${TOTAL:?set TOTAL frames}" "${OUTFILE:?set OUTFILE}"
BIN=node_modules/@remotion/compositor-win32-x64-msvc
PARTS=build/$EP/parts
CHUNK=300
mkdir -p "$PARTS"
list=$PARTS/list.txt; : > "$list"
for ((s=0; s<TOTAL; s+=CHUNK)); do
  e=$(( s + CHUNK - 1 )); (( e >= TOTAL )) && e=$(( TOTAL - 1 ))
  want=$(( e - s + 1 ))
  part=$PARTS/part_$(printf %04d $s).mp4
  have=$($BIN/ffprobe.exe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$part" 2>/dev/null || echo 0)
  if [[ "$have" == "$want" ]]; then echo "chunk $s-$e: already done ($have frames), skipping"; else
    for attempt in 1 2 3; do
      echo "chunk $s-$e: rendering (attempt $attempt)"
      rm -f "$part.tmp.mp4"
      npx remotion render "$COMP" "$part.tmp.mp4" --frames=$s-$e --gl=angle --image-format=png --crf=16 --muted --concurrency=4 --log=error
      have=$($BIN/ffprobe.exe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$part.tmp.mp4" 2>/dev/null || echo 0)
      if [[ "$have" == "$want" ]]; then mv -f "$part.tmp.mp4" "$part"; echo "chunk $s-$e: OK ($have frames)"; break; fi
      echo "chunk $s-$e: FAILED (got '$have' of $want frames)"
    done
    [[ "$have" == "$want" ]] || { echo "RENDER FAILED at chunk $s-$e"; exit 1; }
  fi
  echo "file 'part_$(printf %04d $s).mp4'" >> "$list"
done
echo "joining chunks and adding the soundtrack"
$BIN/ffmpeg.exe -v error -y -f concat -safe 0 -i "$list" -i "public/$EP/audio.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "build/$EP/final.tmp.mp4" || { echo "JOIN FAILED"; exit 1; }
mv -f "build/$EP/final.tmp.mp4" "$OUTFILE"
echo "DONE $OUTFILE"
