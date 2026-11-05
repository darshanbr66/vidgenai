---
name: lumi-studio-app
description: "Lumi Studio, the user's private local web app that turns a prompt into a finished episode by running claude -p; where it lives, its safeguards and what has been tested"
metadata:
  node_type: memory
  type: project
  originSessionId: 1017b849-76a4-4d82-9c16-0f693eee8707
  modified: 2026-10-31T11:58:47.809Z
---

Built 2026-10-31 at the user's request so they can make [[youtube-video-series]] episodes from a prompt without opening Claude Code. Start with `Lumi Studio.bat` in the project root (http://localhost:4173). Code is in `lumi-studio/`; see its README.

- Episodes come from a background `claude -p` session following `lumi-studio/worker/guide.md`. Story continuity lives in `video-demo/series.json`, and shared code in `src/kit/`, `scripts/audio_kit.py` and `scripts/voices.py`.
- The worker must run with `--permission-mode dontAsk`. Tested: `acceptEdits` let `echo x > file` through, even with a narrow Bash allow rule.
- The real test run took 17.8 min at about $3 at API rates. Its video is a test only (`lumi-studio/data/test-renders/`), not an episode, and its source was removed, so Episode 4 is still next.

**Why:** the user wants prompt-in, video-out for personal use, and expected good quality rather than just a working pipeline.

**How to apply:** change series-wide rules in `worker/guide.md`. Test app changes with `node test/run-tests.mjs` (stand-in Claude, no usage). Test jobs use ep99 and leave the series alone, so use them instead of generating real episodes ahead of the user's instruction.

**Watch out:** `node test/run-tests.mjs` snapshots `video-demo/` at the start and restores it at the end, which is what its "the project is exactly as it was" check verifies. Never edit episode files while it runs: on 2026-11-02 a background test run silently reverted a whole ep08 rewrite. If a test times out partway, it can leave `ep99` files behind (`audio-src/ep99`, `public/ep99`, `src/ep99`, `scripts/ep99_audio.py`, and an `Ep99` import and `<Composition>` in `src/Root.tsx`), so remove them. The run takes more than 5 minutes, and the "second reviewer rework" test can time out when the machine is busy rendering.
