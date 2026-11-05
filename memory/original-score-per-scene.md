---
name: original-score-per-scene
description: "From Episode 9 on, each episode needs a new original score with a different music cue per scene; never reuse the old audio_kit.run() bed"
metadata:
  type: feedback
---

The user complained (before ep09, 2026-11-03) that episodes reused the same background music. They were right: ep03–ep08 all scored music with `audio_kit.run()` (one music-box timbre, pad, bass, 80 BPM, the same arpeggio, three F major progressions, the same `ending_chord`).

**Why:** the user wants every episode to feel like a funny animated movie. Repetitive music made the episodes sound identical.

**How to apply:** score each scene as its own `Cue` from `video-demo/scripts/score_kit.py` (oud, pizzicato, marimba, tuba, bassoon, strings, brass, flute, choir, harp, hand drums, timpani, plus comedy stings like sad trombone, buzzer, record scratch and clink). Each cue gets a different key, tempo and instrumentation, and `cue.mute()` makes comic dead stops before punchlines. `scripts/ep09_audio.py` is the example. It also writes `build/ep09/music_stem.wav` so the score can be checked (tempo, brightness, and a no-loop correlation test). Use different keys and instruments than earlier episodes. Related: [[comedy-rules]], [[youtube-video-series]].
