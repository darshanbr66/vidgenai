---
name: singing-and-cues
description: "Since ep14: characters can sing in their own Kokoro voice via scripts/sing_kit.py (TD-PSOLA), and the audio script writes src/epNN/cues.json so Episode.tsx shares one clock with the soundtrack"
metadata:
  type: project
---

Kokoro can only speak, so Episode 14 added `video-demo/scripts/sing_kit.py`: a spoken syllable ("Laaa.", "Aaaah.", generated as extra `src_*` lines in lines.json) is re-pitched note by note with TD-PSOLA, keeping the character's own timbre. `scripts/ep14_songs.py` shows off-key singing (sharp/flat notes, a voice crack, a sour slide) and one pure held note. Write notes at heard pitch / the speaker's PITCH factor, then place the clip with `t.line("sing1", "melody", ...)` so lip sync works. Verified by measuring f0 of the output, not by listening.

`scripts/ep14_audio.py` lays out the whole timeline from measured line lengths with `say()` / `ev()` helpers and writes every moment to `src/ep14/cues.json`; `src/ep14/Episode.tsx` imports it, so retiming the audio never desyncs the picture.

**Why:** the user asked for intentionally out-of-tune singing as a story point, and hand-copied timing constants between the audio script and Episode.tsx were error-prone.

**How to apply:** reuse both patterns for later episodes; tell the user plainly that the singing is re-pitched speech, not a real singing model. Related: [[dialogue-pace]], [[original-score-per-scene]], [[youtube-video-series]].
