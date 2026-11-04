"""Makes a character sing in their own Kokoro voice (from Episode 14).

Kokoro can only speak, so a spoken syllable ("Laaa.") is turned into sung notes with TD-PSOLA:
pitch marks are found on the voiced part of the syllable, and two-period grains are overlap-added at the
spacing of the wanted pitch. The grains keep the voice's own formants, so it still sounds like the character.
The vowel is held by walking back and forth through its steady middle, so a note can last any length.

    from sing_kit import load_syllable, sing, f0_track
    la = load_syllable("audio-src/ep14/raw/src_la.wav")
    x = sing([la], [(note_hz, 0.5, None)])  # (pitch in Hz or a function of time, seconds, syllable index)
"""
import numpy as np
from scipy import signal

from audio_kit import SR, read_wav, trim


def f0_track(x, hop=0.005, win=0.04, lo=90.0, hi=900.0):
    """Autocorrelation pitch per hop; 0 where unvoiced. Returns (times, f0)."""
    n, h = int(win * SR), int(hop * SR)
    times, f0 = [], []
    for i in range(0, max(1, len(x) - n), h):
        fr = x[i : i + n] * np.hanning(n)
        times.append((i + n / 2) / SR)
        if np.sqrt(np.mean(fr**2)) < 0.01:
            f0.append(0.0)
            continue
        ac = np.correlate(fr, fr, "full")[n - 1 :]
        a, b = int(SR / hi), int(SR / lo)
        k = a + int(np.argmax(ac[a:b]))
        f0.append(SR / k if ac[k] > 0.35 * ac[0] else 0.0)
    return np.array(times), np.array(f0)


class Syllable:
    """A spoken syllable with its pitch marks; `onset`/`hold`/`tail` are times in seconds into it."""

    def __init__(self, x):
        self.x = x
        t, f = f0_track(x)
        voiced = np.flatnonzero(f > 0)
        if len(voiced) < 4:
            raise SystemExit("syllable has no voiced part to sing")
        self.v0, self.v1 = t[voiced[0]], t[voiced[-1]]
        self.t, self.f = t, f
        fill = np.interp(np.arange(len(x)) / SR, t[voiced], f[voiced])
        # pitch marks: walk period by period, snapping to the local peak
        marks, p = [], int(self.v0 * SR)
        while p < int(self.v1 * SR):
            per = int(SR / fill[p])
            lo, hi = max(0, p - per // 3), min(len(x), p + per // 3)
            q = lo + int(np.argmax(x[lo:hi])) if hi > lo else p
            marks.append(q)
            p = max(q + per // 2, p + per)
        self.marks = np.array(marks)
        self.period = np.array([SR / fill[m] for m in self.marks])
        d = self.v1 - self.v0
        self.hold = (self.v0 + 0.3 * d, self.v0 + 0.8 * d)  # the steady middle of the vowel

    def src_time(self, tau, dur, attack=0.09, release=0.1):
        """Which moment of the spoken syllable to use at time tau of a sung note lasting dur."""
        h0, h1 = self.hold
        if tau < attack:
            return self.v0 + (h0 - self.v0) * tau / attack
        if tau > dur - release:
            return h1 + (self.v1 - h1) * (tau - (dur - release)) / release
        span = h1 - h0
        u = ((tau - attack) * 0.6) % (2 * span)  # slow back-and-forth so the vowel never loops audibly
        return h0 + (u if u < span else 2 * span - u)


def load_syllable(path):
    return Syllable(trim(read_wav(path)))


def sing(syllables, notes, vib=(5.5, 0.012), gap=0.02, breath=0.0):
    """notes: list of (pitch, seconds, syllable index); pitch is Hz or a function of note time -> Hz.
    vib = (rate Hz, depth as a fraction of pitch). Returns the sung audio (not pitch-shifted further)."""
    out = []
    for pitch, dur, si in notes:
        syl = syllables[si or 0]
        n = int(dur * SR)
        y = np.zeros(n + SR // 10, dtype=np.float32)
        tau = 0.0
        while tau < dur:
            hz = pitch(tau) if callable(pitch) else pitch
            hz *= 1 + vib[1] * np.sin(2 * np.pi * vib[0] * tau) * min(1.0, tau / 0.25)
            st = syl.src_time(tau, dur)
            j = int(np.argmin(np.abs(syl.marks - st * SR)))
            m, per = syl.marks[j], int(syl.period[j])
            a, b = max(0, m - per), min(len(syl.x), m + per)
            grain = syl.x[a:b] * np.hanning(b - a)
            o = int(tau * SR) - (m - a)
            if o >= 0 and o + len(grain) <= len(y):
                y[o : o + len(grain)] += grain
            tau += 1.0 / hz
        env = np.ones(len(y))
        fi, fo = int(0.012 * SR), int(0.06 * SR)
        env[:fi] = np.linspace(0, 1, fi)
        env[n - fo : n] = np.linspace(1, 0, fo)
        env[n:] = 0
        out.append((y * env)[:n])
        out.append(np.zeros(int(gap * SR), dtype=np.float32))
    x = np.concatenate(out)
    if breath:
        b, a = signal.butter(2, [2500 / (SR / 2), 7000 / (SR / 2)], "band")
        x = x + signal.lfilter(b, a, np.random.default_rng(3).standard_normal(len(x))).astype(np.float32) * breath * np.abs(x).max()
    return (x / (np.abs(x).max() + 1e-9) * 0.9).astype(np.float32)


def write_wav(path, x, sr=SR):
    import wave

    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
