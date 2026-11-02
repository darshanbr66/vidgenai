"""Builds the full soundtrack for Episode 3, "The Rainbow Butterfly's Secret".

Voices (from ep03_voices.py) are trimmed, pitched per character and placed on the
timeline; music and sound effects are synthesized here. Writes:
  public/ep03/audio.wav      - final stereo mix
  src/ep03/timeline.json     - where each line landed + per-frame mouth levels
"""
import json
import os
import wave

import numpy as np
from scipy import signal

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 44100
FPS = 30
DURATION = 45.0
N = int(SR * DURATION)
rng = np.random.default_rng(33)

# id, speaker, pitch factor, start (s)
LINES = [
    ("l1", "lumi", 1.14, 0.9),
    ("l2", "lumi", 1.14, 8.2),
    ("f1", "butterfly", 1.25, 11.0),
    ("f2", "butterfly", 1.25, 14.4),
    ("l3", "lumi", 1.14, 19.0),
    ("n1", "narrator", 1.0, 21.7),
    ("n2", "narrator", 1.0, 24.9),
    ("n3", "narrator", 1.0, 27.6),
    ("f3", "butterfly", 1.25, 33.2),
    ("l4", "lumi", 1.14, 35.8),
    ("n4", "narrator", 1.0, 40.3),
]
DEW_T = 23.4  # the dew becomes a glowing orb
KIND_T = 26.93  # the ladybug is safe
SMILE_T = 28.5  # the butterfly smiles
CONVERGE_T = 29.4  # the three orbs circle the flower
BURST_T = 31.0  # the flower lights up
FILL_T = 32.33  # the butterfly's wings fill with color
RING_T = 39.0  # the butterfly draws its circle
STAR_T = 41.6  # the circle becomes the golden star
END_T = 43.2  # the closing text


# ---------- helpers ----------
def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return signal.resample_poly(x, SR, sr)


def trim(x, edge=0.03):
    env = np.convolve(np.abs(x), np.ones(441) / 441, mode="same")
    idx = np.flatnonzero(env > 0.008)
    return x[max(idx[0] - int(edge * SR), 0) : idx[-1] + int(edge * SR)]


def pitch_up(x, factor):
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
    shape = np.minimum(t / 1.0, 1) * np.minimum((dur - t) / 1.0, 1)
    return (x * np.clip(shape, 0, 1) * vol / len(freqs)).astype(np.float32)


def bass(freq, dur=3.0, vol=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return (x * np.minimum(t / 0.02, 1) * np.exp(-t * 1.2) * vol).astype(np.float32)


def ping(freq, vol=0.06, decay=9.0, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.76 * t)
    return (x * np.minimum(t / 0.002, 1) * np.exp(-t * decay) * vol).astype(np.float32)


def sparkle(track, t0, dur, density=14, vol=0.04, lo=2200, hi=5200):
    for _ in range(int(dur * density)):
        add(track, ping(rng.uniform(lo, hi), vol * rng.uniform(0.4, 1.0)), t0 + rng.uniform(0, dur))


def gliss(track, t0, notes, step=0.07, vol=0.07, decay=3.0):
    for i, m in enumerate(notes):
        add(track, ping(note_hz(m), vol, decay, 2.0), t0 + i * step)


def noise_band(dur, lo, hi, vol):
    n = int(dur * SR)
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return (signal.lfilter(b, a, rng.standard_normal(n)) * vol).astype(np.float32)


def whoosh(dur=1.2, vol=0.2):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 512
    for i in range(0, n, hop):
        fc = 400 + 3500 * i / n
        b, a = signal.butter(2, [fc * 0.6 / (SR / 2), fc * 1.4 / (SR / 2)], btype="band")
        out[i : i + hop] = signal.lfilter(b, a, noise[i : i + hop])
    return (out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * vol).astype(np.float32)


def flutter(dur, rate=17.0, vol=0.05):
    """Butterfly wings: soft airy puffs, one per wingbeat."""
    x = noise_band(dur, 700, 4200, 1.0)
    t = np.arange(len(x)) / SR
    beats = np.maximum(np.sin(2 * np.pi * rate * t), 0) ** 2
    edge = np.minimum(t / 0.05, 1) * np.minimum((dur - t) / 0.08, 1)
    return (x * beats * np.clip(edge, 0, 1) * vol).astype(np.float32)


def water_drop(vol=0.14):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    f = 700 + 1100 * (t / 0.28) ** 0.6
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20) * np.minimum(t / 0.002, 1) * vol).astype(np.float32)


def boom(vol=0.28):
    """A round, warm bloom of low sound under the rainbow's arrival."""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 60 + 90 * np.exp(-t * 6)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4) * np.minimum(t / 0.01, 1) * vol).astype(np.float32)


def crickets(track, t0, t1, vol=0.008):
    t = t0
    while t < t1:
        n = int(0.12 * SR)
        tt = np.arange(n) / SR
        c = np.sin(2 * np.pi * 4600 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0.2) * np.sin(np.pi * tt / 0.12)
        for k in range(rng.integers(2, 4)):
            add(track, (c * vol).astype(np.float32), t + k * 0.16)
        t += rng.uniform(0.9, 1.6)


def bird(track, t0, vol=0.022):
    """Soft dawn birdsong for the rainbow forest."""
    for i, (a, b) in enumerate([(3000, 3600), (3400, 2900), (2900, 3800)]):
        n = int(0.11 * SR)
        tt = np.arange(n) / SR
        f = np.linspace(a, b, n)
        add(track, (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.11) * vol).astype(np.float32), t0 + i * 0.15)


# ---------- voices ----------
voice = {s: np.zeros(N, dtype=np.float32) for s in ("narrator", "lumi", "butterfly")}
placed = []
prev_end = 0.0
for lid, speaker, factor, start in LINES:
    x = pitch_up(trim(read_wav(os.path.join(ROOT, "audio-src", "ep03", "raw", f"{lid}.wav"))), factor)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
    if start < prev_end + 0.1:
        raise SystemExit(f"{lid} overlaps the previous line, which ends at {prev_end:.2f}s")
    add(voice[speaker], x, start)
    end = start + len(x) / SR
    placed.append({"id": lid, "speaker": speaker, "start": round(start, 3), "end": round(end, 3)})
    prev_end = end
    print(f"{lid:3} {speaker:9} {start:6.2f} -> {end:6.2f}  ({end - start:.2f}s)")

voice_mix = reverb(sum(voice.values()), 0.9, 0.1)

# ---------- music: bright start, a tender minor middle, then a joyful major arrival ----------
music = np.zeros(N, dtype=np.float32)
BEAT = 60 / 80
BAR = BEAT * 4
ARP = [0, 2, 1, 3, 2, 4, 3, 1]


def play_bar(t0, chord, vol, arp=True):
    add(music, pad([note_hz(m) for m in chord], BAR + 1.0), t0)
    add(music, bass(note_hz(chord[0] - 12)), t0)
    if not arp:
        return
    tones = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24, chord[1] + 24]
    for k, step in enumerate(ARP):
        add(music, music_box(note_hz(tones[step]), vol=vol), t0 + k * BEAT / 2)


HOPE = [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]  # F C Dm Bb
TENDER = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]  # Dm Bb C A
JOY = [[53, 57, 60], [46, 50, 53], [48, 52, 55], [53, 57, 60]]  # F Bb C F


def run(chords, t0, t1, vol):
    t, b = t0, 0
    while t < t1 - 0.2:
        play_bar(t, chords[b % 4], vol)
        t += BAR
        b += 1


run(HOPE, 0.0, 6.0, 0.08)
run(TENDER, 6.0, 21.0, 0.06)
run(HOPE, 21.0, BURST_T, 0.075)
run(JOY, BURST_T, RING_T, 0.125)
# back to an open question; ends on a suspended chord so it feels unfinished
add(music, pad([note_hz(m) for m in (53, 58, 60, 65)], DURATION - RING_T + 0.4, 0.05), RING_T - 0.2)
for i, m in enumerate((65, 70, 72, 77, 82, 84)):
    add(music, music_box(note_hz(m), dur=2.6, vol=0.07), RING_T + i * 0.42)
for m in (65, 70, 72, 77):
    add(music, music_box(note_hz(m), dur=3.0, vol=0.08), END_T)
music = reverb(music, 2.2, 0.3)

# ---------- sound effects ----------
sfx = np.zeros(N, dtype=np.float32)
gliss(sfx, 0.0, (72, 76, 79, 84, 88), step=0.06, vol=0.07)  # the map flares: the opening hook
sparkle(sfx, 0.0, 1.4, density=16, vol=0.035)
sparkle(sfx, 3.8, 2.4, density=10, vol=0.03)  # the path of sparkles
add(sfx, whoosh(0.8, 0.07), 3.6)  # the map folds into the key
# forest ambience
add(sfx, noise_band(45.0, 200, 900, 0.008) * np.sin(np.pi * np.linspace(0, 1, int(45.0 * SR))) ** 0.3, 0.0)
crickets(sfx, 0.0, 6.5)
for t in (6.6, 9.9, 13.2, 20.2, 24.2, 37.8, 42.3):
    bird(sfx, t)
# the sad butterfly: slow, tired wingbeats
add(sfx, flutter(2.4, rate=5.0, vol=0.04), 7.7)
add(sfx, flutter(1.5, rate=5.0, vol=0.035), 12.6)
add(sfx, flutter(3.0, rate=7.0, vol=0.04), 15.5)
add(sfx, flutter(2.0, rate=9.0, vol=0.04), 18.7)
sparkle(sfx, 13.4, 2.4, density=7, vol=0.022)  # the floating lights
# the three gifts
add(sfx, water_drop(), 22.73)
gliss(sfx, DEW_T, (76, 81, 84), step=0.09, vol=0.08)
sparkle(sfx, 22.75, 0.8, density=16, vol=0.03)
add(sfx, ping(note_hz(79), 0.05, 5.0, 1.0), 25.7)
gliss(sfx, KIND_T, (79, 84, 88), step=0.09, vol=0.08)
gliss(sfx, SMILE_T, (84, 88, 91), step=0.09, vol=0.08)
add(sfx, flutter(1.0, rate=10.0, vol=0.04), 28.2)
add(sfx, whoosh(1.6, 0.1), CONVERGE_T)
gliss(sfx, CONVERGE_T, (72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96), step=0.14, vol=0.045)
# the rainbow returns
add(sfx, boom(), BURST_T)
add(sfx, whoosh(1.5, 0.2), BURST_T)
gliss(sfx, BURST_T, (65, 69, 72, 77, 81, 84, 89, 93, 96, 101), step=0.08, vol=0.1, decay=2.2)
sparkle(sfx, BURST_T, 2.5, density=38, vol=0.05)
for m in (65, 69, 72, 77, 81):
    add(sfx, music_box(note_hz(m), dur=3.0, vol=0.12), BURST_T + 0.02)
gliss(sfx, FILL_T, (72, 74, 76, 79, 81, 84), step=0.16, vol=0.08)  # one note for each color
sparkle(sfx, FILL_T, 1.0, density=20, vol=0.035)
# flying happily
add(sfx, flutter(5.6, rate=17.0, vol=0.05), 34.0)
sparkle(sfx, 34.0, 5.0, density=12, vol=0.026)
add(sfx, flutter(1.8, rate=17.0, vol=0.055), RING_T)
gliss(sfx, RING_T, (72, 76, 79, 84, 88, 91), step=0.28, vol=0.05)
add(sfx, whoosh(0.8, 0.06), STAR_T - 0.7)
gliss(sfx, STAR_T, (77, 82, 84, 89, 94), step=0.08, vol=0.06, decay=2.5)
sparkle(sfx, STAR_T, 1.0, density=22, vol=0.022)
sparkle(sfx, END_T, 1.4, density=9, vol=0.025)

# ---------- mix with ducking so dialogue always sits on top ----------
venv = np.abs(voice_mix)
b_, a_ = signal.butter(1, 6 / (SR / 2))
venv = signal.filtfilt(b_, a_, venv)
duck = 1 - 0.6 * np.clip(venv / 0.04, 0, 1)
mix = voice_mix + music * duck * 0.9 + sfx * (0.55 + 0.45 * duck)
fade = np.ones(N)
fade[-int(0.8 * SR) :] = np.linspace(1, 0, int(0.8 * SR))
mix *= fade
gain = 0.89 / np.max(np.abs(mix))
mix = mix * gain

side = signal.lfilter([1, -0.9], [1], music + sfx) * 0.04 * gain
stereo = np.clip(np.stack([mix + side, mix - side], axis=1), -1, 1)

os.makedirs(os.path.join(ROOT, "public", "ep03"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public", "ep03", "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())

# ---------- lip sync: per-frame mouth openness per speaker ----------
mouth = {}
spf = SR // FPS
frames = int(DURATION * FPS)
for s, x in voice.items():
    rms = np.array([np.sqrt(np.mean(x[i * spf : (i + 1) * spf] ** 2)) for i in range(frames)])
    mouth[s] = [round(float(v), 2) for v in np.clip(rms / 0.12, 0, 1) ** 0.7]

os.makedirs(os.path.join(ROOT, "src", "ep03"), exist_ok=True)
with open(os.path.join(ROOT, "src", "ep03", "timeline.json"), "w") as f:
    json.dump({"lines": placed, "mouth": mouth}, f)

# ---------- level check: dialogue must clearly beat everything underneath it ----------
speech = venv > 0.02
bed = (music * duck * 0.9 + sfx * (0.55 + 0.45 * duck)) * gain
print(f"dialogue vs bed while speaking: {20 * np.log10(np.sqrt(np.mean((voice_mix[speech] * gain) ** 2)) / np.sqrt(np.mean(bed[speech] ** 2))):.1f} dB")
print(f"peak {np.max(np.abs(stereo)):.2f}")
for name, a, b in [("hook", 0.0, 0.8), ("burst", 31.0, 32.5), ("fill", 32.4, 33.1), ("joy music", 37.7, 38.9), ("star", 41.6, 42.3)]:
    s = mix[int(a * SR) : int(b * SR)]
    print(f"{name:10} rms {20 * np.log10(np.sqrt(np.mean(s**2))):6.1f} dB  peak {20 * np.log10(np.max(np.abs(s))):6.1f} dB")
for p in placed:
    a, b = int(p["start"] * SR), int(p["end"] * SR)
    v = voice_mix[a:b] * gain
    u = bed[a:b]
    print(f"{p['id']:10} voice rms {20 * np.log10(np.sqrt(np.mean(v**2))):6.1f} dB  bed rms {20 * np.log10(np.sqrt(np.mean(u**2))):6.1f} dB  gap {20 * np.log10(np.sqrt(np.mean(v**2)) / np.sqrt(np.mean(u**2))):5.1f} dB")
print("wrote public/ep03/audio.wav and src/ep03/timeline.json")
