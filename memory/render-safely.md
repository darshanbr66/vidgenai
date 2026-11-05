---
name: render-safely
description: "Render full episodes with tools/render_chunks.sh (resumable 300-frame chunks); TaskStop leaves Remotion children running, so kill the process tree and verify"
metadata:
  type: feedback
---

The ep10 full render crashed and hung (`Target closed`) because two renders ran at once. Stopping a background bash task with TaskStop had killed only the bash wrapper, and its Remotion node and headless Chrome kept rendering on the integrated GPU.

**Why:** the user asked for the render status to be checked honestly and fixed safely without losing work. One long single-process render on this laptop is fragile.

**How to apply:** render with `EP=epNN COMP=EpNN TOTAL=<frames> OUTFILE=out/epNN-<slug>.mp4 bash tools/render_chunks.sh` from `video-demo/`. It renders 300-frame chunks at concurrency 4 into `build/epNN/parts/`, verifies each chunk's frame count, skips finished chunks on rerun, then joins them with stream copy and muxes `public/epNN/audio.wav`. Before starting, check that no `remotion render` process is running. To stop a render, `taskkill /T /F` every process whose command line matches `remotion render|remotion-cli.js" render|render_chunks`, then confirm no headless Chrome or ffmpeg is left. Related: [[dialogue-pace]], [[youtube-video-series]].
