---
name: dialogue-pace
description: "The user found ep09 dialogue too fast; from ep10 voices run ~14% slower (measured in syllables/s) with longer gaps"
metadata:
  type: feedback
---

After ep09 the user said the talking and narration felt slightly too fast and asked for a 10–15% slower pace, natural pauses, and room after jokes.

**Why:** the characters' pitch-up in `audio_kit.pitch_up` resamples the audio, which also speeds it up by the pitch factor (1.14–1.32). So ep09's effective rate was about Kokoro speed × pitch ≈ 1.27, or 5.2 syllables/s.

**How to apply:** use Kokoro speeds around 0.84–0.9 (ep10 averaged 0.88), which gives about 4.5 syllables/s. Keep a median gap of about 0.4 s between lines, with longer pauses before punchlines. Measure the pace from `timeline.json` (syllables per second) rather than guessing. Use `t.finish(mouth_style="v2")` for lip sync. Episodes may now run up to 90 s; the limits in `audio_kit.py` and `inspect_video.py` were widened. ep11 first came out 9% fast because newer voices (af_sarah, af_jessica) speak faster at the same speed setting, so always measure; speeds of about 0.75–0.8 brought it back to 4.51 syllables/s. `build/ep11/retime.py` shows how to retime an episode after changing voice speed. Render with `--image-format=png --crf=16`: a measured A/B showed about +1.2 dB PSNR, a small gain. Related: [[youtube-video-series]], [[original-score-per-scene]].

Since ep12 the pace is calibrated per voice: generate the lines, measure each speaker's syllables per second, then set speed = speed × 4.5 / measured. ep12 landed at 4.50 syllables/s with every voice between 4.37 and 4.67.

Kokoro's response to `speed` is noisy per line (ep13: the same 7% change gave anywhere from 5% to 20% slower), so calibrate per line, not only per voice: measure every line with ≥6 syllables after trim + pitch-up, nudge outliers (speed × (4.5/measured)^0.8) and regenerate, 2–3 passes. `build/ep13/pace.py <ep>` prints per-line and per-speaker syllables/s. ep13 landed at 4.40 overall.

ep14 landed at 4.38 syllables/s (every voice 4.28-4.53) with `build/ep14/calib.py` (3 automatic passes of per-line nudging). `af_aoede` (Melody) speaks very fast: it needed speeds ~0.7 to reach 4.4.
