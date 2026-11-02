"""Builds the full soundtrack for "The Little Star That Fell Into the Forest".

Voices (from tts.ps1) are trimmed, pitch-shifted per character and placed on the
timeline; music and sound effects are synthesized here. Writes:
  public/story/audio.wav     - final stereo mix
  src/story/timeline.json    - where each line landed + per-frame mouth levels
"""
import json
import os
import wave

import numpy as np
from scipy import signal

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR = 44100
FPS = 30
DURATION = 40.0
N = int(SR * DURATION)
rng = np.random.default_rng(7)

# id, speaker, pitch factor, desired start (s)
LINES = [
    ("n1", "narrator", 1.0, 0.25),
    ("l1", "lumi", 1.24, 3.7),
    ("l2", "lumi", 1.24, 7.6),
    ("b1", "bobo", 1.42, 14.2),
    ("b2", "bobo", 1.42, 22.4),
    ("l3", "lumi", 1.24, 31.0),
    ("n2", "narrator", 1.0, 35.9),
]
POP_T = 26.0


# ---------- helpers ----------
def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return signal.resample_poly(x, SR, sr)


def compress_silence(x, max_gap=0.22, edge=0.03):
    """Trim leading/trailing silence and shorten long internal pauses."""
    env = np.convolve(np.abs(x), np.ones(441) / 441, mode="same")
    loud = env > 0.012
    idx = np.flatnonzero(loud)
    x = x[max(idx[0] - int(edge * SR), 0) : idx[-1] + int(edge * SR)]
    loud = loud[max(idx[0] - int(edge * SR), 0) : idx[-1] + int(edge * SR)]
    out, run = [], 0
    for i, v in enumerate(loud):
        run = 0 if v else run + 1
        if run < max_gap * SR:
            out.append(x[i])
    return np.array(out, dtype=np.float32)


def pitch_up(x, factor):
    """Raise pitch (and tempo) by resampling: cartoon-voice style."""
    if factor == 1.0:
        return x
    return signal.resample(x, int(len(x) / factor)).astype(np.float32)


def reverb(x, seconds=1.4, mix=0.15):
    n = int(seconds * SR)
    ir = rng.standard_normal(n).astype(np.float32) * np.exp(-np.linspace(0, 7, n)).astype(np.float32)
    b, a = signal.butter(2, 4000 / (SR / 2))
    ir = signal.lfilter(b, a, ir)
    ir /= np.sqrt(np.sum(ir**2))
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


def add(track, x, t):
    i = int(t * SR)
    if i >= len(track):
        return
    x = x[: len(track) - i]
    track[i : i + len(x)] += x


def env_adsr(n, a=0.005, decay=3.0):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t * decay)


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------- instruments ----------
def music_box(freq, dur=2.2, vol=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    partials = [(1, 1.0), (2, 0.35), (3, 0.12), (4.2, 0.08), (5.4, 0.04)]
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * (2.4 + m * 0.9)) for m, a in partials)
    return (x * np.minimum(t / 0.003, 1) * vol).astype(np.float32)


def pad(freqs, dur, vol=0.035):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n, dtype=np.float32)
    for f in freqs:
        for d in (-0.003, 0, 0.003):
            x += np.sin(2 * np.pi * f * (1 + d) * t + rng.uniform(0, 6.28))
    shape = np.minimum(t / 1.2, 1) * np.minimum((dur - t) / 1.2, 1)
    return (x * np.clip(shape, 0, 1) * vol / len(freqs)).astype(np.float32)


def bass(freq, dur=3.0, vol=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return (x * env_adsr(n, 0.02, 1.2) * vol).astype(np.float32)


def ping(freq, vol=0.06, decay=9.0, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.76 * t)
    return (x * env_adsr(n, 0.002, decay) * vol).astype(np.float32)


def sparkle(track, t0, dur, density=14, vol=0.04, lo=2200, hi=5200):
    for _ in range(int(dur * density)):
        add(track, ping(rng.uniform(lo, hi), vol * rng.uniform(0.4, 1.0)), t0 + rng.uniform(0, dur))


def noise_band(dur, lo, hi, vol):
    n = int(dur * SR)
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return (signal.lfilter(b, a, rng.standard_normal(n)) * vol).astype(np.float32)


def whoosh(dur=1.2, vol=0.25, up=True):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 512
    for i in range(0, n, hop):
        p = i / n
        fc = 400 + (3500 if up else -300) * p if up else 2500 - 2000 * p
        b, a = signal.butter(2, [max(fc * 0.6, 80) / (SR / 2), min(fc * 1.4, 18000) / (SR / 2)], btype="band")
        out[i : i + hop] = signal.lfilter(b, a, noise[i : i + hop])
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return (out * shape * vol).astype(np.float32)


def pop():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 700 * np.exp(-t * 18) + 140
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)
    click = rng.standard_normal(n) * np.exp(-t * 300) * 0.5
    return ((body + click) * 0.55).astype(np.float32)


def rustle(dur=0.45, vol=0.06):
    x = noise_band(dur, 1500, 7000, vol)
    n = len(x)
    am = np.abs(np.sin(np.linspace(0, 9 * np.pi, n))) ** 2
    return (x * am * np.sin(np.pi * np.linspace(0, 1, n))).astype(np.float32)


def crickets(track, t0, t1, vol=0.012):
    t = t0
    while t < t1:
        n = int(0.12 * SR)
        tt = np.arange(n) / SR
        chirp = np.sin(2 * np.pi * 4600 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0.2) * np.sin(np.pi * tt / 0.12)
        for k in range(rng.integers(2, 4)):
            add(track, (chirp * vol).astype(np.float32), t + k * 0.16)
        t += rng.uniform(0.7, 1.4)


# ---------- voices ----------
voice = {s: np.zeros(N, dtype=np.float32) for s in ("narrator", "lumi", "bobo")}
placed = []
prev_end = 0.0
for lid, speaker, factor, start in LINES:
    x = read_wav(os.path.join(ROOT, "audio-src", "raw", f"{lid}.wav"))
    x = pitch_up(compress_silence(x), factor)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.8
    start = max(start, prev_end + 0.15)
    add(voice[speaker], x, start)
    end = start + len(x) / SR
    placed.append({"id": lid, "speaker": speaker, "start": round(start, 3), "end": round(end, 3)})
    prev_end = end
    print(f"{lid:3} {speaker:9} {start:6.2f} -> {end:6.2f}  ({end - start:.2f}s)")

voice_mix = sum(voice.values())
voice_mix = reverb(voice_mix, 0.9, 0.1)

# ---------- music ----------
music = np.zeros(N, dtype=np.float32)
BEAT = 60 / 72
BAR = BEAT * 4
# F major: F, C/E, Dm, Bb
CHORDS = [[53, 57, 60], [52, 55, 60], [50, 53, 57], [46, 50, 53]]
ARP = [0, 1, 2, 3, 4, 3, 2, 1]  # index into a 2-octave chord spread
bars = int(np.ceil(DURATION / BAR))
for b in range(bars):
    t0 = b * BAR
    chord = CHORDS[b % 4]
    add(music, pad([note_hz(m) for m in chord], BAR + 1.0), t0)
    add(music, bass(note_hz(chord[0] - 12)), t0)
    tones = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24, chord[1] + 24]
    bright = 1.25 if t0 >= POP_T else 1.0
    for k, step in enumerate(ARP):
        t = t0 + k * BEAT / 2
        if t >= DURATION - 2.6:
            break
        add(music, music_box(note_hz(tones[step]), vol=0.1 * bright), t)
# final ringing chord
for m in (65, 69, 72, 77):
    add(music, music_box(note_hz(m), dur=3.0, vol=0.09), DURATION - 2.6)
add(music, pad([note_hz(m) for m in (53, 57, 60, 65)], 3.0, 0.03), DURATION - 3.0)
music = reverb(music, 2.2, 0.3)

# ---------- sound effects ----------
sfx = np.zeros(N, dtype=np.float32)
sparkle(sfx, 0.0, 1.6, density=10, vol=0.035)  # opening twinkle hook
for i, m in enumerate((84, 79)):  # little "uh-oh" when the gap is noticed
    add(sfx, music_box(note_hz(m), vol=0.12), 3.3 + i * 0.32)
sparkle(sfx, 6.5, 5.3, density=7, vol=0.028)  # the glowing trail
crickets(sfx, 6.0, 29.0)
add(sfx, noise_band(23.0, 200, 900, 0.01) * np.sin(np.pi * np.linspace(0, 1, int(23.0 * SR))) ** 0.5, 6.0)  # soft wind
sparkle(sfx, 13.2, 1.0, density=10, vol=0.04)  # the star is discovered
for t in (20.3, 21.4, 23.6, 24.4, 25.2):
    add(sfx, rustle(), t)
add(sfx, pop(), POP_T)
sparkle(sfx, POP_T, 0.8, density=40, vol=0.05)
add(sfx, whoosh(1.4, 0.18), POP_T + 0.05)
for i, m in enumerate((77, 81, 84, 89)):  # rising chime as it flies
    add(sfx, ping(note_hz(m), 0.07, 4.0, 1.5), POP_T + 0.15 + i * 0.12)
for i, m in enumerate((72, 77, 81, 84, 89, 93)):  # the star clicks back into place
    add(sfx, ping(note_hz(m), 0.06, 3.0, 2.0), 30.3 + i * 0.07)
sparkle(sfx, 30.3, 2.5, density=16, vol=0.03)
crickets(sfx, 36.0, 40.0, vol=0.008)
sparkle(sfx, 37.5, 2.0, density=8, vol=0.025)

# ---------- mix with ducking ----------
venv = np.abs(voice_mix)
b, a = signal.butter(1, 6 / (SR / 2))
venv = signal.filtfilt(b, a, venv)
duck = 1 - 0.55 * np.clip(venv / 0.05, 0, 1)
mix = voice_mix * 1.0 + music * duck * 0.9 + sfx * (0.6 + 0.4 * duck)
fade = np.ones(N)
fade[-int(0.8 * SR) :] = np.linspace(1, 0, int(0.8 * SR))
mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.89

# light stereo width: music/sfx slightly decorrelated, voices centred
side = signal.lfilter([1, -0.9], [1], music + sfx) * 0.04
stereo = np.stack([mix + side, mix - side], axis=1)
stereo = np.clip(stereo, -1, 1)

os.makedirs(os.path.join(ROOT, "public", "story"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public", "story", "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())

# ---------- lip sync: per-frame mouth openness per speaker ----------
mouth = {}
spf = SR // FPS
for s, x in voice.items():
    frames = int(DURATION * FPS)
    rms = np.array([np.sqrt(np.mean(x[i * spf : (i + 1) * spf] ** 2)) for i in range(frames)])
    level = np.clip(rms / 0.12, 0, 1) ** 0.7
    mouth[s] = [round(float(v), 2) for v in level]

os.makedirs(os.path.join(ROOT, "src", "story"), exist_ok=True)
with open(os.path.join(ROOT, "src", "story", "timeline.json"), "w") as f:
    json.dump({"lines": placed, "pop": POP_T, "mouth": mouth}, f)
print("wrote public/story/audio.wav and src/story/timeline.json")
