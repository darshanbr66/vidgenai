"""Generates an episode's voice lines with Kokoro, the free offline voice model.

Reads audio-src/<episode>/lines.json, a list of
  {"id": "l1", "speaker": "lumi", "text": "Hello!", "speed": 0.9}
and writes audio-src/<episode>/raw/<id>.wav. "voice" may override the speaker's voice.

Usage: python scripts/voices.py <episode> <model-dir>
"""
import json
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
VOICES = {"lumi": "af_bella", "bobo": "am_puck", "narrator": "af_heart", "butterfly": "af_sky", "draco": "af_nova", "moonia": "bf_emma", "coralie": "af_sarah", "niva": "af_kore", "kiko": "am_liam", "zuzu": "bm_fable", "nimbus": "af_sky", "bloop": "af_jessica", "whisper": "af_nicole", "tock": "bm_george", "pico": "bf_lily", "melody": "af_aoede", "petal": "bf_alice"}

episode, model_dir = sys.argv[1], sys.argv[2]
folder = os.path.join(ROOT, "audio-src", episode)
with open(os.path.join(folder, "lines.json"), encoding="utf-8") as f:
    lines = json.load(f)

kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
os.makedirs(os.path.join(folder, "raw"), exist_ok=True)
for line in lines:
    voice = line.get("voice") or VOICES.get(line["speaker"])
    if not voice:
        raise SystemExit(f'{line["id"]}: speaker "{line["speaker"]}" needs a "voice" in lines.json')
    samples, sr = kokoro.create(line["text"], voice=voice, speed=line.get("speed", 0.88), lang="en-us")
    sf.write(os.path.join(folder, "raw", f'{line["id"]}.wav'), samples, sr, subtype="PCM_16")
    print(f'{line["id"]:4} {voice:10} {len(samples) / sr:5.2f}s  {line["text"]}')
