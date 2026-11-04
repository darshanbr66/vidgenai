"""Original synthesized orchestra and comedy sound effects, first used for Episode 9.

Episodes 3 to 8 all scored their music with audio_kit.run(): one music-box timbre, one pad,
one bass, 80 BPM, the same 8-step arpeggio and three F major progressions, so every episode
sounded like the same track. This kit adds many different instruments and a Cue helper so each
scene can have its own tempo, key, rhythm and instrumentation:

    cue = Cue(t0=0.0, t1=6.2, bpm=116)
    cue.put(oud(note("D4")), cue.b(0))       # times inside a cue are seconds from t0; cue.b(beats)
    cue.mute(3.0, 3.3)                        # comedic drop-out (absolute seconds)
    cue.render(t.music)

Everything is generated from numbers (no samples), so it is original and royalty-free.
"""
import numpy as np
from scipy import signal

from audio_kit import SR, add, note_hz

R = np.random.default_rng(909)
NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def note(name):
    """'C4' = 60, 'F#3', 'Bb2'"""
    base = NAMES[name[0]]
    i = 1
    while i < len(name) and name[i] in "#b":
        base += 1 if name[i] == "#" else -1
        i += 1
    return base + 12 * (int(name[i:]) + 1)


def hz(n):
    return note_hz(note(n) if isinstance(n, str) else n)


def _t(dur):
    return np.arange(int(dur * SR)) / SR


def _env(dur, a=0.01, r=0.1, curve=1.0):
    t = _t(dur)
    e = np.minimum(t / max(a, 1e-4), 1) * np.clip((dur - t) / max(r, 1e-4), 0, 1)
    return e**curve


def _lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR * 0.45) / (SR / 2))
    return signal.lfilter(b, a, x)


def _hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), btype="high")
    return signal.lfilter(b, a, x)


def _bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], btype="band")
    return signal.lfilter(b, a, x)


def _noise(dur):
    return R.standard_normal(int(dur * SR))


def _phase(f):
    """Phase (radians) of a frequency curve given per sample."""
    return 2 * np.pi * np.cumsum(f) / SR


def _saw(ph):
    return 2 * ((ph / (2 * np.pi)) % 1.0) - 1


def _f32(x, vol):
    return (x * vol).astype(np.float32)


# ---------- plucked strings (Karplus-Strong) ----------
def ks(freq, dur=1.2, t60=1.0, bright=0.5, vol=0.2):
    n = int(dur * SR)
    N = max(2, int(round(SR / freq)))
    exc = _lp(R.standard_normal(N + 1), 800 + 9000 * bright, 1)
    x = np.zeros(n)
    x[: N + 1] = exc[: min(N + 1, n)]
    g = 10 ** (-3 / (freq * t60))
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -g * 0.5
    a[N + 1] = -g * 0.5
    y = signal.lfilter([1.0], a, x)
    y /= np.max(np.abs(y)) + 1e-9
    return _f32(y * _env(dur, 0.002, 0.03), vol)


def oud(freq, dur=1.0, vol=0.12):
    """Bright plucked lute with a woody body."""
    x = ks(freq, dur, t60=0.9, bright=0.65, vol=1.0)
    body = _bp(x, 220, 700) * 0.6
    return _f32(x + body, vol)


def pizz(freq, dur=0.45, vol=0.12):
    """Pizzicato string: short, round."""
    x = ks(freq, dur, t60=0.28, bright=0.3, vol=1.0)
    return _f32(_lp(x, 2500), vol)


def harp(freq, dur=2.5, vol=0.08):
    return ks(freq, dur, t60=2.2, bright=0.42, vol=vol)


def harp_gliss(track, t0, notes, step=0.045, vol=0.05):
    for i, m in enumerate(notes):
        add(track, harp(note_hz(m), 2.0, vol), t0 + i * step)


# ---------- mallets and bells ----------
def marimba(freq, dur=0.9, vol=0.12):
    t = _t(dur)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t * 16) + 0.08 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t * 35)
    click = _bp(_noise(dur), 1500, 6000) * np.exp(-t * 300) * 0.15
    return _f32((x + click) * np.minimum(t / 0.002, 1), vol)


def xylo(freq, dur=0.5, vol=0.09):
    t = _t(dur)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 12) + 0.25 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-t * 25)
    return _f32(x * np.minimum(t / 0.001, 1), vol)


def glock(freq, dur=1.6, vol=0.06):
    t = _t(dur)
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d) for m, a, d in ((1, 1, 2.2), (2.76, 0.32, 5), (5.4, 0.12, 9), (8.93, 0.05, 14)))
    return _f32(x * np.minimum(t / 0.001, 1), vol)


def celesta(freq, dur=1.4, vol=0.06):
    t = _t(dur)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.6) + 0.3 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 5) + 0.1 * np.sin(6 * np.pi * freq * t) * np.exp(-t * 8)
    return _f32(x * np.minimum(t / 0.004, 1), vol)


# ---------- sustained instruments ----------
def strings(freqs, dur, vol=0.05, attack=0.35, release=0.5, tone=3200, trem=0.0, vib=5.2):
    """A small string section: three detuned sawtooth voices per note, vibrato, soft attack."""
    t = _t(dur)
    out = np.zeros(len(t))
    for f in freqs:
        for k, d in enumerate((-0.006, 0.0, 0.0055)):
            fv = f * (1 + d) * (1 + 0.004 * np.sin(2 * np.pi * (vib + k * 0.37) * t + k) * np.minimum(t / 0.4, 1))
            out += _saw(_phase(fv) + R.uniform(0, 6.28))
    out = _lp(out, tone, 2)
    if trem:
        out *= 0.55 + 0.45 * np.sin(2 * np.pi * trem * t) ** 2
    return _f32(out * _env(dur, attack, release) / (3 * len(freqs)) * 2.2, vol)


def brass(freq, dur, vol=0.07, scoop=True, wah=0.0):
    """Warm brass: brightness follows loudness, a small pitch scoop at the start."""
    t = _t(dur)
    f = freq * (1 - (0.02 * np.exp(-t * 30) if scoop else 0)) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t) * np.minimum(t / 0.3, 1))
    x = _saw(_phase(f))
    e = _env(dur, 0.04, 0.12)
    dark = _lp(x, 700, 2)
    bright = _lp(x, 3200, 2)
    open_ = e if not wah else np.clip(0.2 + 0.8 * np.minimum(t / (dur * wah), 1), 0, 1) * e
    return _f32((dark * (1 - open_) + bright * open_) * e, vol)


def flute(freq, dur, vol=0.06, vib_delay=0.18):
    t = _t(dur)
    f = freq * (1 + 0.006 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - vib_delay) / 0.2, 0, 1))
    ph = _phase(f)
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = _bp(_noise(dur), 1200, 7000) * 0.07
    e = _env(dur, 0.06, 0.1)
    return _f32((x + breath) * e, vol)


def tuba(freq, dur=0.4, vol=0.12, bend=0.0):
    t = _t(dur)
    f = freq * (1 + bend * t / dur)
    ph = _phase(f)
    x = 0.7 * np.sin(ph) + 0.4 * _lp(_saw(ph), 450, 2)
    return _f32(x * _env(dur, 0.025, 0.08), vol)


def bassoon(freq, dur=0.25, vol=0.08, bend=0.0):
    t = _t(dur)
    ph = _phase(freq * (1 + bend * t / dur))
    pulse = np.where((ph / (2 * np.pi)) % 1.0 < 0.32, 1.0, -0.47)
    return _f32(_bp(pulse, 120, 1600) * _env(dur, 0.015, 0.05), vol)


def choir(freqs, dur, vol=0.05, attack=0.6, release=0.8):
    """Soft 'aah' voices: sawtooth through vowel formants."""
    t = _t(dur)
    src = np.zeros(len(t))
    for f in freqs:
        for k, d in enumerate((-0.005, 0.004)):
            fv = f * (1 + d) * (1 + 0.005 * np.sin(2 * np.pi * (5.4 + k * 0.5) * t + k))
            src += _saw(_phase(fv) + R.uniform(0, 6.28))
    x = _bp(src, 600, 900) + 0.55 * _bp(src, 1000, 1350) + 0.22 * _bp(src, 2300, 2800)
    return _f32(x * _env(dur, attack, release) / (2 * len(freqs)) * 2.6, vol)


# ---------- percussion ----------
def dum(vol=0.16):
    """Low hand-drum stroke."""
    t = _t(0.5)
    f = 70 + 70 * np.exp(-t * 25)
    x = np.sin(_phase(f)) * np.exp(-t * 7) + _lp(_noise(0.5), 400) * np.exp(-t * 40) * 0.3
    return _f32(x, vol)


def tek(vol=0.07):
    """Sharp rim slap."""
    t = _t(0.15)
    x = _bp(_noise(0.15), 2000, 7000) * np.exp(-t * 45) + 0.5 * np.sin(2 * np.pi * 620 * t) * np.exp(-t * 35)
    return _f32(x, vol)


def frame_drum(vol=0.14):
    t = _t(0.7)
    f = 58 + 30 * np.exp(-t * 18)
    return _f32(np.sin(_phase(f)) * np.exp(-t * 4.5) + _lp(_noise(0.7), 250) * np.exp(-t * 20) * 0.25, vol)


def shaker(vol=0.025, dur=0.09):
    t = _t(dur)
    return _f32(_bp(_noise(dur), 4500, 11000) * np.sin(np.pi * t / dur) ** 2, vol)


def tamb(vol=0.03):
    t = _t(0.3)
    jingle = sum(np.sin(2 * np.pi * f * t + R.uniform(0, 6)) for f in (5100, 6700, 8300, 9600)) * 0.2
    return _f32((_hp(_noise(0.3), 5000) * 0.6 + jingle) * np.exp(-t * 14), vol)


def zill(vol=0.03):
    t = _t(1.4)
    return _f32((np.sin(2 * np.pi * 2630 * t) + 0.6 * np.sin(2 * np.pi * 3910 * t) + 0.3 * np.sin(2 * np.pi * 6100 * t)) * np.exp(-t * 3.2), vol)


def woodblock(freq=900, vol=0.08):
    t = _t(0.18)
    return _f32((np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.3 * t)) * np.exp(-t * 38) * np.minimum(t / 0.0005, 1), vol)


def snap(vol=0.05):
    t = _t(0.12)
    return _f32(_bp(_noise(0.12), 1600, 5000) * np.exp(-t * 70), vol)


def timpani(freq, vol=0.14, dur=2.2):
    t = _t(dur)
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d) for m, a, d in ((1, 1, 1.4), (1.5, 0.5, 2.0), (1.99, 0.3, 2.6), (2.44, 0.15, 3.5)))
    x += _lp(_noise(dur), 900) * np.exp(-t * 30) * 0.4
    return _f32(x, vol)


def timp_roll(freq, dur, vol=0.1, rise=True):
    out = np.zeros(int((dur + 1.5) * SR), dtype=np.float32)
    n = int(dur / 0.07)
    for i in range(n):
        k = i / max(1, n - 1)
        add(out, timpani(freq, vol * ((0.25 + 0.75 * k) if rise else 1) * R.uniform(0.85, 1.0), 1.4), i * 0.07)
    return out


def snare_roll(dur, vol=0.04):
    t = _t(dur)
    x = _bp(_noise(dur), 1200, 7000) * (0.55 + 0.45 * np.sin(2 * np.pi * 26 * t) ** 2)
    return _f32(x * (t / dur) ** 1.6, vol)


def cymbal_swell(dur, vol=0.05):
    t = _t(dur)
    return _f32(_hp(_noise(dur), 3500) * (t / dur) ** 2.2, vol)


def crash(vol=0.06):
    t = _t(2.5)
    x = _hp(_noise(2.5), 2500) + 0.3 * sum(np.sin(2 * np.pi * f * t) for f in (3170, 4410, 5770))
    return _f32(x * np.exp(-t * 1.6), vol)


# ---------- comedy and Foley ----------
def sad_trombone(track, t0, notes=("G3", "F#3", "F3", "E3"), vol=0.07):
    """Four drooping plunger-mute notes; the last one wobbles."""
    for i, n in enumerate(notes):
        last = i == len(notes) - 1
        d = 0.75 if last else 0.3
        x = brass(hz(n), d, vol, scoop=False, wah=0.6)
        if last:
            tt = _t(d)
            x = (x * (0.65 + 0.35 * np.sin(2 * np.pi * 7 * tt))).astype(np.float32)
        add(track, x, t0 + i * 0.3)


def buzzer(vol=0.05, dur=0.45):
    t = _t(dur)
    sq = np.sign(np.sin(2 * np.pi * 110 * t)) + np.sign(np.sin(2 * np.pi * 116.5 * t))
    return _f32(_lp(sq, 2000) * _env(dur, 0.005, 0.05), vol)


def ding(vol=0.06):
    out = np.zeros(int(1.8 * SR), dtype=np.float32)
    add(out, glock(hz("E6"), 1.4, vol), 0)
    add(out, glock(hz("A6"), 1.6, vol), 0.13)
    return out


def record_scratch(vol=0.07, dur=0.32):
    t = _t(dur)
    fc = 900 + 2600 * np.sin(np.pi * t / dur) ** 2
    x = _noise(dur)
    out = np.zeros_like(x)
    hop = 256
    for i in range(0, len(x), hop):
        c = fc[i]
        b, a = signal.butter(2, [c * 0.7 / (SR / 2), c * 1.3 / (SR / 2)], btype="band")
        out[i : i + hop] = signal.lfilter(b, a, x[i : i + hop])
    return _f32(out * _env(dur, 0.01, 0.05), vol)


def tummy_rumble(vol=0.09, dur=0.7):
    t = _t(dur)
    f = 70 + 25 * np.sin(2 * np.pi * 3 * t) + 40 * t
    x = np.sin(_phase(f)) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t) ** 2) + _bp(_noise(dur), 80, 300) * 0.5
    return _f32(x * _env(dur, 0.05, 0.2), vol)


def bwomp(freq=hz("D2"), vol=0.12, dur=0.7):
    return tuba(freq, dur, vol, bend=-0.25)


def achoo(vol=0.08):
    t = _t(0.45)
    return _f32(_bp(_noise(0.45), 900, 5000) * np.exp(-t * 9) * np.minimum(t / 0.01, 1), vol)


def fizzle(vol=0.05, dur=0.6):
    t = _t(dur)
    x = _hp(_noise(dur), 3000) * (0.6 + 0.4 * (R.random(len(t)) > 0.8))
    return _f32(x * np.exp(-t * 6) * np.minimum(t / 0.01, 1), vol)


def pomf(vol=0.09):
    """Landing in soft sand."""
    t = _t(0.35)
    x = np.sin(_phase(90 + 60 * np.exp(-t * 30))) * np.exp(-t * 14) + _bp(_noise(0.35), 500, 4000) * np.exp(-t * 12) * 0.5
    return _f32(x, vol)


def sand_step(vol=0.03):
    t = _t(0.12)
    x = _bp(_noise(0.12), 700, 5000) * (R.random(len(t)) > 0.55) * np.exp(-t * 30)
    return _f32(x + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 40) * 0.3, vol)


def sand_pour(dur=0.9, vol=0.05):
    t = _t(dur)
    grains = _bp(_noise(dur), 1500, 8000) * (R.random(len(t)) > 0.65)
    return _f32(grains * np.sin(np.pi * t / dur) ** 0.6, vol)


def sand_hiss(dur=1.2, vol=0.06):
    """A gust full of sand."""
    t = _t(dur)
    x = _bp(_noise(dur), 1800, 9000) * (0.7 + 0.3 * (R.random(len(t)) > 0.7))
    return _f32(x * np.sin(np.pi * t / dur) ** 1.4, vol)


def desert_wind(dur, vol=0.012):
    """Soft rolling wind with slow gusts and a faint whistle."""
    t = _t(dur)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t + 1) * np.sin(2 * np.pi * 0.047 * t + 2)
    body = _bp(_noise(dur), 180, 1300)
    whistle = _bp(_noise(dur), 620, 700, 2) * 2.2 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))
    edge = np.minimum(t / 1.0, 1) * np.minimum((dur - t) / 1.0, 1)
    return _f32((body + whistle) * gust * np.clip(edge, 0, 1), vol)


def mirage_wobble(dur=0.9, vol=0.04):
    """The banana mirage melting away: glassy, wobbling high tones."""
    t = _t(dur)
    x = sum(np.sin(_phase(f * (1 + 0.03 * np.sin(2 * np.pi * 7 * t + i)) * (1 - 0.25 * t / dur))) for i, f in enumerate((1320, 1760, 2210)))
    return _f32(x * _env(dur, 0.05, 0.4) / 3, vol)


def radar_bloop(up_=True, vol=0.035):
    t = _t(0.14)
    f = np.linspace(700, 1300, len(t)) if up_ else np.linspace(1300, 800, len(t))
    return _f32(np.sin(_phase(f)) * np.sin(np.pi * t / 0.14), vol)


def stone_rumble(dur=1.4, vol=0.08):
    t = _t(dur)
    x = _lp(_noise(dur), 220) * 3 * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2) + _bp(_noise(dur), 300, 1200) * 0.4
    return _f32(x * _env(dur, 0.1, 0.4), vol)


def strain(dur=0.6, vol=0.05, f0=hz("C3")):
    """A rising comic 'hnnnng' of effort."""
    return bassoon(f0, dur, vol, bend=0.35)


def clink(vol=0.08):
    """Teeth on solid gold: a bright ting and a little teeth-rattle."""
    t = _t(0.8)
    ting = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in ((3150, 1, 6), (4720, 0.6, 8), (6930, 0.35, 11)))
    rattle = np.sin(2 * np.pi * 1450 * t) * (np.sin(2 * np.pi * 34 * t) > 0) * np.exp(-t * 7) * 0.35
    return _f32(ting + rattle, vol)


def blink_ping(vol=0.03):
    return glock(hz("B6"), 0.4, vol)


def tumbleweed(dur=1.2, vol=0.03):
    t = _t(dur)
    x = _bp(_noise(dur), 600, 3500) * (0.4 + 0.6 * (np.sin(2 * np.pi * 6 * t) > 0.3))
    return _f32(x * np.sin(np.pi * t / dur), vol)


# ---------- a section of music with its own tempo ----------
class Cue:
    """One scene's music. Times passed to put() are seconds from the cue start; b(beats) converts beats."""

    def __init__(self, t0, t1, bpm, fade_in=0.25, fade_out=0.45):
        self.t0, self.t1, self.beat = t0, t1, 60.0 / bpm
        self.fade_in, self.fade_out = fade_in, fade_out
        self.buf = np.zeros(int((t1 - t0 + fade_out + 0.05) * SR), dtype=np.float32)
        self.mutes = []

    def b(self, beats):
        return beats * self.beat

    def put(self, x, sec):
        if sec < 0 or sec > self.t1 - self.t0 + self.fade_out:
            return
        add(self.buf, x, sec)

    def put_at(self, x, abs_sec):
        self.put(x, abs_sec - self.t0)

    def mute(self, a, b, ramp=0.03):
        """Silence the cue between absolute times a and b (for a comic pause)."""
        self.mutes.append((a, b, ramp))

    def render(self, track):
        n = len(self.buf)
        t = np.arange(n) / SR
        g = np.minimum(t / max(self.fade_in, 1e-3), 1) * np.clip((self.t1 - self.t0 + self.fade_out - t) / max(self.fade_out, 1e-3), 0, 1)
        for a, b, ramp in self.mutes:
            a -= self.t0
            b -= self.t0
            m = np.clip(np.maximum((a - t) / ramp, (t - b) / ramp), 0, 1)
            g = g * m
        add(track, (self.buf * g).astype(np.float32), self.t0)


def boing(vol=0.07, f0=200):
    """A cartoon spring."""
    t = _t(0.6)
    f = f0 + 320 * np.exp(-t * 5) * (1 + 0.3 * np.sin(2 * np.pi * 12 * t))
    return _f32(np.sin(_phase(f)) * np.exp(-t * 5) * np.minimum(t / 0.005, 1), vol)


def pop(vol=0.08):
    t = _t(0.2)
    return _f32(np.sin(_phase(1100 * np.exp(-t * 30) + 250)) * np.exp(-t * 35), vol)


def squeak(vol=0.04):
    t = _t(0.16)
    return _f32(np.sin(_phase(np.geomspace(900, 1900, len(t)))) * np.sin(np.pi * t / 0.16) ** 0.8, vol)


# ---------- added for Episode 10 ----------
def clarinet(freq, dur, vol=0.05):
    """Woody reed: mostly odd harmonics, gentle vibrato."""
    t = _t(dur)
    ph = _phase(freq * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.15) / 0.2, 0, 1)))
    x = np.sin(ph) + 0.42 * np.sin(3 * ph) + 0.2 * np.sin(5 * ph) + 0.08 * np.sin(7 * ph)
    return _f32(_lp(x, 3500) * _env(dur, 0.03, 0.06), vol)


def ukulele(freq, dur=0.8, vol=0.08):
    return ks(freq, dur, t60=0.6, bright=0.75, vol=vol)


def strum(track, t0, freqs, vol=0.05, spread=0.018):
    for i, f in enumerate(freqs):
        add(track, ukulele(f, 0.9, vol), t0 + i * spread)


def kazoo(freq, dur, vol=0.04):
    """A buzzy, silly voice-like horn for the upside-down music."""
    t = _t(dur)
    ph = _phase(freq * (1 + 0.012 * np.sin(2 * np.pi * 6.5 * t)))
    x = _saw(ph)
    x = _bp(x, 400, 1600) + 0.5 * _bp(x, 2200, 3200)
    return _f32(x * _env(dur, 0.03, 0.05), vol)


def clap(vol=0.04):
    t = _t(0.2)
    x = _bp(_noise(0.2), 900, 4000)
    env = np.exp(-t * 40) + 0.6 * np.exp(-np.maximum(t - 0.012, 0) * 45) * (t > 0.012) + 0.4 * np.exp(-np.maximum(t - 0.024, 0) * 30) * (t > 0.024)
    return _f32(x * env, vol)


def wind_chimes(track, t0, dur, vol=0.025, seed=0):
    r = np.random.default_rng(seed)
    t = 0.0
    while t < dur:
        f = float(r.choice([2093, 2349, 2637, 3136, 3520, 4186]))
        add(track, glock(f, 1.4, vol * r.uniform(0.5, 1.0)), t0 + t)
        t += r.uniform(0.08, 0.3)


def gust(dur=1.4, vol=0.12):
    """A huge sneeze wind: a roaring rising-falling band of air."""
    t = _t(dur)
    x = _noise(dur)
    out = np.zeros_like(x)
    hop = 512
    for i in range(0, len(x), hop):
        k = i / len(x)
        fc = 300 + 2200 * np.sin(np.pi * min(1, k * 1.4)) ** 1.5
        b, a = signal.butter(2, [fc * 0.5 / (SR / 2), min(fc * 1.8, SR * 0.45) / (SR / 2)], btype="band")
        out[i : i + hop] = signal.lfilter(b, a, x[i : i + hop])
    return _f32(out * np.minimum(t / 0.04, 1) * np.exp(-t * 1.6) * 2, vol)


def steady_wind(dur, vol=0.06):
    t = _t(dur)
    x = _bp(_noise(dur), 250, 2400) * (0.8 + 0.2 * np.sin(2 * np.pi * 3 * t)) + _bp(_noise(dur), 900, 1000, 2) * 2
    return _f32(x * _env(dur, 0.3, 0.5), vol)


def whirl(dur=1.2, vol=0.06):
    """Spinning around and around: a whoosh that pans in fast loops."""
    t = _t(dur)
    x = _bp(_noise(dur), 500, 4000) * (0.3 + 0.7 * np.sin(2 * np.pi * (4 + 6 * t / dur) * t) ** 2)
    return _f32(x * _env(dur, 0.05, 0.2), vol)


def chomp(vol=0.08):
    t = _t(0.18)
    return _f32((np.sin(2 * np.pi * 180 * t) * np.exp(-t * 40) + _bp(_noise(0.18), 1500, 5000) * np.exp(-t * 60) * 0.5), vol)


def plop(vol=0.08):
    """Landing in something soft and bouncy."""
    t = _t(0.5)
    f = 140 + 220 * np.exp(-t * 14)
    return _f32(np.sin(_phase(f)) * np.exp(-t * 7) + _bp(_noise(0.5), 300, 2000) * np.exp(-t * 20) * 0.3, vol)


def whistle_tune(track, t0, notes, step=0.16, vol=0.035):
    """Kiko whistling casually: a pure tone with a little slide into each note."""
    for i, m in enumerate(notes):
        f0 = note_hz(m)
        d = step * 0.95
        tt = _t(d)
        f = f0 * (1 - 0.03 * np.exp(-tt * 40)) * (1 + 0.006 * np.sin(2 * np.pi * 6 * tt))
        add(track, _f32(np.sin(_phase(f)) * _env(d, 0.02, 0.04), vol), t0 + i * step)


def bubbles(track, t0, dur, vol=0.03, seed=1):
    r = np.random.default_rng(seed)
    t = 0.0
    while t < dur:
        n = int(0.09 * SR)
        tt = np.arange(n) / SR
        f = r.uniform(500, 1200) * (1 + 2.5 * tt / 0.09)
        add(track, _f32(np.sin(_phase(f)) * np.sin(np.pi * tt / 0.09), vol * r.uniform(0.5, 1)), t0 + t)
        t += r.uniform(0.05, 0.18)


def reverse_swell(dur=0.8, vol=0.05):
    """A sucked-in, backwards cymbal for the moment gravity flips."""
    t = _t(dur)
    return _f32(_hp(_noise(dur), 2500) * (t / dur) ** 3 + np.sin(_phase(np.linspace(200, 900, len(t)))) * (t / dur) ** 2 * 0.3, vol)


# ---------- added for Episode 11 ----------
def hiccup(vol=0.09, f0=420):
    """A tiny cartoon hiccup: a quick glottal 'hic' that jumps up in pitch."""
    t = _t(0.16)
    f = f0 * (1 + 1.2 * np.minimum(t / 0.05, 1))
    voice = np.sin(_phase(f)) + 0.4 * np.sin(2 * _phase(f))
    x = _bp(voice, 500, 3000) * np.exp(-t * 22) * np.minimum(t / 0.004, 1) + _bp(_noise(0.16), 1500, 5000) * np.exp(-t * 60) * 0.4
    return _f32(x, vol)


def bloop(vol=0.07, f0=300):
    """An underwater bubble blooping: a rising sine 'bloop'."""
    t = _t(0.22)
    f = f0 * (1 + 2.2 * (t / 0.22) ** 1.5)
    return _f32(np.sin(_phase(f)) * np.sin(np.pi * t / 0.22) ** 0.8, vol)


def glass(freq, dur=2.2, vol=0.04):
    """Glass harmonica: pure, slowly blooming bell tone."""
    t = _t(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.12 * np.sin(2 * np.pi * freq * 2.01 * t) + 0.05 * np.sin(2 * np.pi * freq * 3.0 * t)
    return _f32(x * np.minimum(t / 0.12, 1) * np.exp(-t * 1.1) * (1 + 0.08 * np.sin(2 * np.pi * 5 * t)), vol)


def underwater(x, depth=0.5):
    """Muffle a sound as if heard underwater, with a slow wobble."""
    t = np.arange(len(x)) / SR
    a = _lp(x, 900 + 2200 * (1 - depth), 2)
    return _f32(a * (1 + 0.15 * np.sin(2 * np.pi * 0.7 * t)), 1.0)


def current(dur, vol=0.03):
    """A gentle ocean current: low rolling swell."""
    t = _t(dur)
    x = _lp(_noise(dur), 300, 2) * 2.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.18 * t + 1))
    return _f32(x * _env(dur, 1.0, 1.0), vol)


def tom(freq=110, vol=0.12):
    t = _t(0.6)
    f = freq * (1 + 0.6 * np.exp(-t * 20))
    return _f32(np.sin(_phase(f)) * np.exp(-t * 6) + _lp(_noise(0.6), 600) * np.exp(-t * 30) * 0.3, vol)


def tick(vol=0.05, high=True):
    return woodblock(1900 if high else 1450, vol)


# ---------- added for Episode 12 ----------
def tubular(freq, dur=3.0, vol=0.05):
    """Tubular bell: inharmonic partials and a long ring."""
    t = _t(dur)
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d) for m, a, d in ((1, 1, 0.9), (2.76, 0.5, 1.6), (5.4, 0.25, 2.6), (8.9, 0.12, 4)))
    return _f32(x * np.minimum(t / 0.002, 1), vol)


def harpsichord(freq, dur=0.8, vol=0.06):
    x = ks(freq, dur, t60=0.7, bright=0.9, vol=1.0)
    t = _t(dur)
    click = _bp(_noise(dur), 3000, 9000) * np.exp(-t * 200) * 0.3
    return _f32(_hp(x, 180) + click, vol)


def oboe(freq, dur, vol=0.045):
    t = _t(dur)
    ph = _phase(freq * (1 + 0.005 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.12) / 0.2, 0, 1)))
    pulse = np.where((ph / (2 * np.pi)) % 1.0 < 0.18, 1.0, -0.22)
    return _f32((_bp(pulse, 900, 1700) + 0.6 * _bp(pulse, 2600, 3400)) * _env(dur, 0.04, 0.06), vol)


def ratchet(dur=0.5, vol=0.04, rate=28):
    """Clockwork ratchet: fast little clicks."""
    out = np.zeros(int(dur * SR), dtype=np.float32)
    for k in range(int(dur * rate)):
        add(out, woodblock(2400 + (k % 2) * 300, vol * 0.8), k / rate)
    return out


def chime(freq=None, vol=0.09):
    f = freq or note_hz(52)
    return tubular(f, 4.0, vol)


def rewind_fx(dur=0.5, vol=0.06):
    """A tape rewinding: a fast chattering whistle sweeping down then up."""
    t = _t(dur)
    f = 2400 - 1600 * np.sin(np.pi * t / dur)
    chatter = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t))
    return _f32(np.sin(_phase(f)) * chatter * _env(dur, 0.02, 0.05) * 0.6 + _bp(_noise(dur), 2000, 6000) * 0.3 * _env(dur, 0.02, 0.05), vol)


def flutter_wings(dur=0.6, vol=0.04, rate=14):
    """Tiny owl wings: soft feathery puffs."""
    t = _t(dur)
    x = _bp(_noise(dur), 500, 3000) * np.maximum(np.sin(2 * np.pi * rate * t), 0) ** 2
    return _f32(x * _env(dur, 0.05, 0.1), vol)


def gear_grind(dur=0.8, vol=0.05):
    t = _t(dur)
    x = _bp(_noise(dur), 200, 1500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * t))) + 0.3 * np.sin(2 * np.pi * 95 * t)
    return _f32(x * _env(dur, 0.05, 0.15), vol)
