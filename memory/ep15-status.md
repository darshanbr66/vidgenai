---
name: ep15-status
description: Episode 15 (Floating Flower Garden) is built but NOT rendered/validated yet; finish it on the ASUS laptop before Episode 16
metadata:
  type: project
---

As of 2026-11-05, Episode 15 "The Secret of the Floating Flower Garden" (prompt `video-demo/prompt/15.md`) is fully built: `src/ep15/` (Episode.tsx, world.tsx, props.tsx, cues.json, timeline.json, episode.json), `scripts/ep15_audio.py`, `audio-src/ep15/`, `public/ep15/audio.wav`, the Ep15 composition in `src/Root.tsx` and `npm run render:ep15` (4077 frames, 135.9 s). Preview stills of all seven scenes were reviewed. New character Petal (voice `bf_alice`, pitch 1.25, registered in voices.py/audio_kit.py). Episode length limit widened to 150 s in `audio_kit.py` and `lumi-studio/tools/inspect_video.py`.

**Not done yet:** the final render was stopped at frame 2100 of 4077 because the old laptop ran out of memory and overheated. The finished chunks live in `build/` (gitignored), so on the ASUS laptop just run `npm run render:ep15` from `video-demo/` (it renders all chunks). Then validate the MP4 (full decode, `build/ep15/check/analyse.py`-style checks as in ep14, `inspect_video.py`), append `src/ep15/episode.json` to `series.json` as episode 15, and only then move on to `prompt/16.md`.

**Why:** the user moved production to the ASUS laptop (Ryzen 7, RTX 3050) because the old laptop overheated during long renders.

**How to apply:** treat Episode 15 as incomplete until `out/ep15-floating-flower-garden.mp4` exists and passes validation. On the ASUS, `--concurrency=4` in `tools/render_chunks.sh` can likely go higher. Related: [[render-safely]], [[youtube-video-series]].
