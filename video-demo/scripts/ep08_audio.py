from audio_kit import *

# Episode 8 (comedy version): The Secret of the Enchanted Jungle
t = Soundtrack("ep08", duration=50.0, seed=818)

DRACO_PITCH = 1.2
KIKO_PITCH = 1.3

# ---- timed moments (seconds); Episode.tsx uses the same numbers ----
GREEN_T = 0.4        # the snowflake pendant turns green
MAP_T = 0.6
DRACO_JUMP_T = 0.7
LEAF_T = 2.45        # a leaf flutters down...
LEAF_LAND_T = 2.9    # ...onto Draco's nose
FIRE_T = 3.77        # ah-CHOO (frame 113): a tiny fireball
BOBO_JUMP_T = 3.87   # Bobo leaps backwards
WIPE_T = 5.6         # a swirl of leaves takes them into the jungle
SCENE2_T = 6.0
EYES_T = 8.2         # Bobo spots the bananas: enormous eyes
RUN_T = 9.2          # he charges
SWOOP_T = 9.8        # Kiko swoops down
GRAB_T = 10.1        # and grabs the banana first
SKID_T = 10.25       # Bobo skids to a stop
HANG_T = 10.5        # Kiko lands upside down on the branch
SCENE3_T = 14.0
FADE_T = 19.6        # the jungle loses its magic
DEADPAN_T = 24.35    # Lumi's look after Bobo's banana question
SCENE4_T = 25.0
POSE_T = 25.4        # Draco's heroic pose
INHALE_T = 27.6
POOF_T = 28.4        # ...a tiny puff of smoke
BLUSH_T = 30.6       # Draco blushes
SYMBOLS_T = 31.0     # Kiko spots the glowing symbols
PEND_GREEN_T = 31.9
SCENE5_T = 32.6
RAISE_T = 32.8
LIGHT_T = 33.3
SYM_FIRST_T = 33.6
SYM_STEP = 0.3
OPEN_T = 35.3
RISE_T = 35.7
HOME_T = 37.3
BLOOM_T = 37.5
TOSS_T = 38.5        # Kiko tosses Bobo a banana
BITE_T = 39.1        # munch
TURN_T = 39.9        # Bobo looks up: the bunch is only leaves!
SCENE6_T = 42.4
GIVE_T = 42.5
DESERT_T = 44.45
END_T = 47.6


def chirp(f0, f1, dur, vol, shape=1.2):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.geomspace(f0, f1, n)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / dur) ** shape * vol).astype(np.float32)


def slide_whistle(f0, f1, dur, vol=0.05):
    """A cartoon slide whistle, with a little vibrato."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.geomspace(f0, f1, n) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return (x * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


def boing(vol=0.06, f0=220):
    n = int(0.55 * SR)
    tt = np.arange(n) / SR
    f = f0 + 320 * np.exp(-tt * 5) * (1 + 0.3 * np.sin(2 * np.pi * 12 * tt))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5) * np.minimum(tt / 0.005, 1) * vol).astype(np.float32)


def pop(vol=0.1):
    n = int(0.2 * SR)
    tt = np.arange(n) / SR
    f = 1100 * np.exp(-tt * 30) + 250
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 35) * vol).astype(np.float32)


def squeak(vol=0.05):
    return chirp(900, 1900, 0.16, vol, 0.8)


def patter(t0, t1, every=0.09, vol=0.05):
    """Fast cartoon footsteps for Bobo's charge."""
    s = t0
    k = 0
    while s < t1:
        add(t.sfx, chirp(260 + (k % 2) * 60, 180, 0.06, vol), s)
        s += every
        k += 1


def skid(dur=0.45, vol=0.08):
    x = noise_band(dur, 600, 5000, 1.0)
    tt = np.arange(len(x)) / SR
    return (x * np.exp(-tt * 3) * np.minimum(tt / 0.01, 1) * vol).astype(np.float32)


def fwoosh(vol=0.08):
    x = noise_band(0.5, 200, 3000, 1.0)
    tt = np.arange(len(x)) / SR
    return (x * np.sin(np.pi * tt / 0.5) ** 0.7 * vol).astype(np.float32)


def puff(vol=0.06):
    """A sad little 'pff' of smoke."""
    x = noise_band(0.28, 300, 1800, 1.0)
    tt = np.arange(len(x)) / SR
    return (x * np.exp(-tt * 12) * np.minimum(tt / 0.01, 1) * vol).astype(np.float32)


def munch(t0, vol=0.06):
    for k in range(3):
        x = noise_band(0.09, 800, 4500, 1.0)
        tt = np.arange(len(x)) / SR
        add(t.sfx, (x * np.exp(-tt * 30) * vol).astype(np.float32), t0 + k * 0.16)


def crickets_beat(t0, dur, vol=0.012):
    crickets(t.sfx, t0, t0 + dur, vol=vol)


def thud(vol=0.1):
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    f = 80 + 60 * np.exp(-tt * 18)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) * vol).astype(np.float32)


def leaves(vol=0.04, dur=0.6):
    x = noise_band(dur, 1500, 7000, 1.0)
    tt = np.arange(len(x)) / SR
    grain = (rng.random(len(x)) > 0.7).astype(np.float32) * 0.6 + 0.4
    return (x * grain * np.sin(np.pi * tt / dur) * vol).astype(np.float32)


def stone_scrape(dur=0.8, vol=0.06):
    x = noise_band(dur, 80, 900, 1.0)
    tt = np.arange(len(x)) / SR
    return (x * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * tt)) * np.sin(np.pi * tt / dur) * vol).astype(np.float32)


def hum(f0, dur, vol=0.02):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in (1, 2, 3)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt))
    edge = np.minimum(tt / 0.5, 1) * np.minimum((dur - tt) / 0.6, 1)
    return (x * np.clip(edge, 0, 1) * vol).astype(np.float32)


def swell(dur, lo, hi, vol):
    x = noise_band(dur, lo, hi, vol)
    tt = np.arange(len(x)) / SR
    return (x * (tt / dur) ** 2).astype(np.float32)


def crystal(t0, notes, step, vol):
    for k, m in enumerate(notes):
        add(t.sfx, music_box(note_hz(m), 1.8, vol), t0 + k * step)
        add(t.sfx, ping(note_hz(m + 24), vol * 0.35, 5.0, 1.2), t0 + k * step + 0.01)


def bird_call(t0, vol=0.016):
    for i, (a, b) in enumerate(((2400, 3400), (3400, 2600), (2600, 3800))):
        add(t.sfx, chirp(a, b, 0.09, vol), t0 + i * 0.11)


def jungle_air(t0, t1, vol=0.008):
    d = t1 - t0
    x = noise_band(d, 200, 1400, vol)
    tt = np.arange(len(x)) / SR
    edge = np.minimum(tt / 1.0, 1) * np.minimum((d - tt) / 1.0, 1)
    add(t.sfx, (x * np.clip(edge, 0, 1)).astype(np.float32), t0)


# ---- voices ----
t.line("l1", "draco", 0.6, pitch=DRACO_PITCH)
t.line("l2", "draco", 2.95, pitch=DRACO_PITCH)
t.line("l3", "bobo", 4.55)
t.line("l4", "bobo", 8.45)
t.line("l5", "kiko", 10.7, pitch=KIKO_PITCH)
t.line("l6", "kiko", 11.75, pitch=KIKO_PITCH)
t.line("l7", "kiko", 14.2, pitch=KIKO_PITCH)
t.line("l8", "lumi", 15.45)
t.line("l9", "kiko", 17.95, pitch=KIKO_PITCH)
t.line("l10", "bobo", 21.4)
t.line("l11", "draco", 25.6, pitch=DRACO_PITCH)
t.line("l12", "bobo", 29.2)
t.line("l13", "bobo", 40.1)
t.line("l14", "kiko", 41.45, pitch=KIKO_PITCH)
t.line("l15", "kiko", 42.5, pitch=KIKO_PITCH)
t.line("l16", "draco", 44.6, pitch=DRACO_PITCH)
t.line("l17", "narrator", 47.3)

# ---- music: bouncy adventure, a hush for the problem, a big bloom, then playful again ----
run(t, JOY, 0.0, SCENE2_T, 0.06)
run(t, HOPE, SCENE2_T, FADE_T, 0.05)
run(t, TENDER, FADE_T, SCENE5_T, 0.04)
run(t, HOPE, SCENE5_T, BLOOM_T, 0.04)
run(t, JOY, BLOOM_T, SCENE6_T + 2.0, 0.07)
run(t, HOPE, SCENE6_T + 2.0, END_T, 0.04)
ending_chord(t, END_T - 0.4)

# ---- ambience ----
wnd = noise_band(WIPE_T, 250, 2200, 0.009)
add(t.sfx, (wnd * np.minimum(np.linspace(WIPE_T, 0, len(wnd)) / 0.6, 1)).astype(np.float32), 0.0)
jungle_air(WIPE_T, 50.0)
for s in (6.6, 8.0, 12.9, 15.2, 18.8, 38.9, 41.0, 44.0, 46.4):
    bird_call(s, 0.014)

# ---- scene 1: the pendant, the map, the sneeze ----
gliss(t.sfx, 0.0, (72, 76, 79, 84, 88), step=0.06, vol=0.07)
add(t.sfx, boom(0.1), 0.0)
sparkle(t.sfx, 0.0, 1.2, density=16, vol=0.03)
gliss(t.sfx, GREEN_T, (67, 71, 74, 79), step=0.08, vol=0.04)
add(t.sfx, boing(0.05, 300), DRACO_JUMP_T)
add(t.sfx, slide_whistle(1600, 700, 0.45, 0.025), LEAF_T)       # the leaf flutters down
add(t.sfx, pop(0.05), LEAF_LAND_T)
add(t.sfx, fwoosh(0.1), FIRE_T)
add(t.sfx, pop(0.09), FIRE_T + 0.35)
sparkle(t.sfx, FIRE_T + 0.35, 0.4, density=20, vol=0.025, lo=1500, hi=4000)
add(t.sfx, slide_whistle(500, 1500, 0.3, 0.04), BOBO_JUMP_T)      # Bobo leaps back
add(t.sfx, thud(0.08), BOBO_JUMP_T + 0.45)
add(t.sfx, leaves(0.06, 0.6), WIPE_T)
add(t.sfx, whoosh(0.9, 0.12), WIPE_T)

# ---- scene 2: the banana incident ----
crystal(SCENE2_T + 0.3, (72, 76, 79, 84, 88), 0.3, 0.03)
gliss(t.sfx, EYES_T, (84, 88, 91, 96, 100), step=0.04, vol=0.05)   # sparkly eyes
patter(RUN_T, SKID_T, vol=0.05)
add(t.sfx, leaves(0.05, 0.4), SWOOP_T - 0.2)
add(t.sfx, whoosh(0.6, 0.12), SWOOP_T)
add(t.sfx, pop(0.08), GRAB_T)
add(t.sfx, skid(0.45, 0.08), SKID_T)
add(t.sfx, boing(0.07, 180), HANG_T)
add(t.sfx, squeak(0.04), HANG_T + 0.25)

# ---- scene 3: Kiko, the missing Heart, and the banana question ----
for k, m in enumerate((76, 72, 69, 64, 60)):
    add(t.sfx, music_box(note_hz(m), 2.0, 0.035), FADE_T + k * 0.5)
crickets_beat(DEADPAN_T, 0.65, vol=0.016)

# ---- scene 4: the temple, Draco's big moment ----
add(t.sfx, hum(65, 2.5, 0.012), SCENE4_T)
gliss(t.sfx, POSE_T, (60, 64, 67, 72), step=0.1, vol=0.05)          # a heroic fanfare...
add(t.sfx, swell(0.7, 200, 2000, 0.05), INHALE_T)
add(t.sfx, puff(0.08), POOF_T)                                      # ...pff
add(t.sfx, slide_whistle(900, 300, 0.6, 0.035), POOF_T + 0.15)
add(t.sfx, squeak(0.03), POOF_T + 0.8)
gliss(t.sfx, SYMBOLS_T, (79, 83, 86), step=0.12, vol=0.035)
gliss(t.sfx, PEND_GREEN_T, (72, 76, 79, 84), step=0.07, vol=0.04)

# ---- scene 5: the symbols, the Heart, the bloom, the banana swap ----
gliss(t.sfx, RAISE_T, (76, 79, 84, 88), step=0.08, vol=0.045)
add(t.sfx, hum(98, OPEN_T - LIGHT_T + 0.4, 0.018), LIGHT_T)
sparkle(t.sfx, LIGHT_T, OPEN_T - LIGHT_T, density=14, vol=0.025)
for k, m in enumerate((72, 74, 76, 79, 81, 84)):
    add(t.sfx, music_box(note_hz(m), 1.6, 0.05), SYM_FIRST_T + k * SYM_STEP)
add(t.sfx, stone_scrape(0.9, 0.07), OPEN_T)
add(t.sfx, whoosh(1.8, 0.12), RISE_T)
crystal(RISE_T + 0.2, (67, 71, 74, 79, 83), 0.28, 0.03)
add(t.sfx, boom(0.26), BLOOM_T)
gliss(t.sfx, BLOOM_T, (65, 69, 72, 77, 81, 84, 89, 93), step=0.07, vol=0.08)
sparkle(t.sfx, BLOOM_T, 2.0, density=22, vol=0.035)
add(t.sfx, slide_whistle(600, 1200, 0.35, 0.035), TOSS_T)          # banana toss
add(t.sfx, pop(0.06), TOSS_T + 0.4)
munch(BITE_T, 0.07)
gliss(t.sfx, BITE_T + 0.5, (84, 88, 91), step=0.06, vol=0.03)      # bliss
add(t.sfx, boing(0.08, 160), TURN_T)                               # the double take

# ---- scene 6: the leaf pendant and the desert ----
add(t.sfx, ping(note_hz(88), 0.05), GIVE_T)
sparkle(t.sfx, GIVE_T, 0.7, density=10, vol=0.02)
add(t.sfx, swell(0.6, 300, 3000, 0.04), DESERT_T - 0.5)
gliss(t.sfx, DESERT_T - 0.15, (72, 76, 79, 84), step=0.05, vol=0.035)
add(t.sfx, slide_whistle(700, 350, 0.5, 0.025), 46.9)                # Bobo's disappointment
sparkle(t.sfx, END_T, 1.5, density=10, vol=0.02)

t.finish()
