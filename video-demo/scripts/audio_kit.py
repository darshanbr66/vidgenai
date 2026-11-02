"""Shared soundtrack tools for episodes made by Lumi Studio.

The instruments and the mix come straight from scripts/ep03_audio.py, so new episodes
sound like the series. An episode script makes a Soundtrack, places its voice lines,
writes its music and effects into `music` and `sfx`, then calls finish().

    from audio_kit import *
    t = Soundtrack("ep04", duration=45.0, seed=44)
    t.line("l1", "lumi", 0.9)
    run(t, HOPE, 0.0, 12.0, 0.08)
    gliss(t.sfx, 0.0, (72, 76, 79, 84, 88), step=0.06, vol=0.07)
    t.finish()
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 44100
FPS = 30
rng = np.random.default_rng(33)

# How much each speaker's voice is pitched up, matching earlier episodes
PITCH = {"lumi": 1.14, "bobo": 1.18, "narrator": 1.0, "butterfly": 1.25, "draco": 1.2, "moonia": 1.1}
MIN_DIALOGUE_GAP_DB = 8.0


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
    """A round, warm bloom of low sound for big magical moments."""
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
    """Soft dawn birdsong."""
    for i, (a, b) in enumerate([(3000, 3600), (3400, 2900), (2900, 3800)]):
        n = int(0.11 * SR)
        tt = np.arange(n) / SR
        f = np.linspace(a, b, n)
        add(track, (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.11) * vol).astype(np.float32), t0 + i * 0.15)


# ---------- chord progressions from the series ----------
HOPE = [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]  # F C Dm Bb
TENDER = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]  # Dm Bb C A
JOY = [[53, 57, 60], [46, 50, 53], [48, 52, 55], [53, 57, 60]]  # F Bb C F
BEAT = 60 / 80
BAR = BEAT * 4
ARP = [0, 2, 1, 3, 2, 4, 3, 1]


def play_bar(music, t0, chord, vol, arp=True):
    add(music, pad([note_hz(m) for m in chord], BAR + 1.0), t0)
    add(music, bass(note_hz(chord[0] - 12)), t0)
    if not arp:
        return
    tones = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24, chord[1] + 24]
    for k, step in enumerate(ARP):
        add(music, music_box(note_hz(tones[step]), vol=vol), t0 + k * BEAT / 2)


def run(soundtrack, chords, t0, t1, vol):
    t, b = t0, 0
    while t < t1 - 0.2:
        play_bar(soundtrack.music, t, chords[b % 4], vol)
        t += BAR
        b += 1


def forest_air(soundtrack, vol=0.008):
    """Quiet forest ambience across the whole episode."""
    d = soundtrack.duration
    add(soundtrack.sfx, noise_band(d, 200, 900, vol) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 0.3, 0.0)


def ending_chord(soundtrack, t0):
    """Ends on a suspended chord so the episode feels unfinished."""
    d = soundtrack.duration
    add(soundtrack.music, pad([note_hz(m) for m in (53, 58, 60, 65)], d - t0 + 0.4, 0.05), t0 - 0.2)
    for i, m in enumerate((65, 70, 72, 77, 82, 84)):
        add(soundtrack.music, music_box(note_hz(m), dur=2.6, vol=0.07), t0 + i * 0.42)


class Soundtrack:
    def __init__(self, episode, duration, seed=None):
        global rng
        if not 40.0 <= duration <= 50.0:
            raise SystemExit(f"duration must be 40-50 seconds, got {duration}")
        if seed is not None:
            rng = np.random.default_rng(seed)
        self.episode = episode
        self.duration = duration
        self.n = int(SR * duration)
        self.voice = {}
        self.music = np.zeros(self.n, dtype=np.float32)
        self.sfx = np.zeros(self.n, dtype=np.float32)
        self.placed = []
        self.prev_end = 0.0

    def line(self, line_id, speaker, start, pitch=None):
        """Places a voice line. Stops with an error if it overlaps the previous line."""
        factor = pitch if pitch is not None else PITCH.get(speaker, 1.0)
        path = os.path.join(ROOT, "audio-src", self.episode, "raw", f"{line_id}.wav")
        x = pitch_up(trim(read_wav(path)), factor)
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
        if start < self.prev_end + 0.1:
            raise SystemExit(f"{line_id} starts at {start:.2f}s but the previous line ends at {self.prev_end:.2f}s")
        end = start + len(x) / SR
        if end > self.duration:
            raise SystemExit(f"{line_id} ends at {end:.2f}s, past the end of the episode")
        track = self.voice.setdefault(speaker, np.zeros(self.n, dtype=np.float32))
        add(track, x, start)
        self.placed.append({"id": line_id, "speaker": speaker, "start": round(start, 3), "end": round(end, 3)})
        self.prev_end = end
        print(f"{line_id:4} {speaker:10} {start:6.2f} -> {end:6.2f}  ({end - start:.2f}s)")
        return end

    def finish(self):
        """Mixes with dialogue on top, then writes public/<ep>/audio.wav and src/<ep>/timeline.json."""
        if not self.placed:
            raise SystemExit("no voice lines were placed")
        voice_mix = reverb(sum(self.voice.values()), 0.9, 0.1)
        music = reverb(self.music, 2.2, 0.3)

        venv = np.abs(voice_mix)
        b_, a_ = signal.butter(1, 6 / (SR / 2))
        venv = signal.filtfilt(b_, a_, venv)
        duck = 1 - 0.6 * np.clip(venv / 0.04, 0, 1)
        bed_raw = music * duck * 0.9 + self.sfx * (0.55 + 0.45 * duck)
        mix = voice_mix + bed_raw
        fade = np.ones(self.n)
        fade[-int(0.8 * SR) :] = np.linspace(1, 0, int(0.8 * SR))
        mix = mix * fade
        gain = 0.89 / np.max(np.abs(mix))
        mix = mix * gain
        side = signal.lfilter([1, -0.9], [1], music + self.sfx) * 0.04 * gain
        stereo = np.clip(np.stack([mix + side, mix - side], axis=1), -1, 1)

        public = os.path.join(ROOT, "public", self.episode)
        os.makedirs(public, exist_ok=True)
        with wave.open(os.path.join(public, "audio.wav"), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((stereo * 32767).astype(np.int16).tobytes())

        # lip sync: per-frame mouth openness per speaker
        spf = SR // FPS
        frames = int(self.duration * FPS)
        mouth = {}
        for speaker, x in self.voice.items():
            rms = np.array([np.sqrt(np.mean(x[i * spf : (i + 1) * spf] ** 2)) for i in range(frames)])
            mouth[speaker] = [round(float(v), 2) for v in np.clip(rms / 0.12, 0, 1) ** 0.7]
        src = os.path.join(ROOT, "src", self.episode)
        os.makedirs(src, exist_ok=True)
        with open(os.path.join(src, "timeline.json"), "w") as f:
            json.dump({"lines": self.placed, "mouth": mouth}, f)

        # level check: dialogue must clearly beat everything underneath it
        problems = []
        bed = bed_raw * gain
        for p in self.placed:
            a, b = int(p["start"] * SR), int(p["end"] * SR)
            v = np.sqrt(np.mean((voice_mix[a:b] * gain) ** 2))
            u = np.sqrt(np.mean(bed[a:b] ** 2)) + 1e-9
            gap = 20 * np.log10(v / u)
            print(f"{p['id']:4} dialogue gap {gap:5.1f} dB")
            if gap < MIN_DIALOGUE_GAP_DB:
                problems.append(f"{p['id']} is only {gap:.1f} dB above the music and effects (needs {MIN_DIALOGUE_GAP_DB:.0f})")
        print(f"peak {np.max(np.abs(stereo)):.2f}")
        print(f"wrote public/{self.episode}/audio.wav and src/{self.episode}/timeline.json")
        if problems:
            raise SystemExit("LEVEL PROBLEMS, lower the music or effects there:\n" + "\n".join(problems))
