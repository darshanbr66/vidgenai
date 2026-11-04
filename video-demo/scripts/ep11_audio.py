from audio_kit import *
from score_kit import *

# Episode 11: The Secret of the Whispering Underwater Cave
# Six new cues in keys and instruments not used for Episodes 9 or 10; dialogue at Episode 10's pace.
DUR = 70.4
t = Soundtrack("ep11", duration=DUR, seed=1111)

# ---- timed moments (seconds); src/ep11/Episode.tsx uses the same numbers ----
L1_T = 0.60          # Nimbus: "Bye-bye!"
BUBBLE_T = 0.30      # the seashell wraps everyone in a bubble
DEPART_T = 2.62      # the bubble drops through the clouds...
SPLASH_T = 3.62      # ...into the sea
CUT_1B = 3.72
FISH_T = 4.82        # a banana-yellow fish swims by
L2_T = 5.12
GRAB_T = 6.62        # Bobo grabs; the fish darts off and he squishes against the bubble
L3_T = 7.07
L4_T = 9.15
L5_T = 11.71
SPIN_T = 13.34       # Draco "swims": the whole bubble rolls over
CUT_2 = 15.40
L6_T = 16.00
L7_T = 20.30         # "Help us... help us..."
HIDE_T = 20.74       # Bobo hides behind Draco; Draco's wings shake
L8_T = 22.73
L9_T = 24.82
CUT_3 = 27.13
PEEK_T = 27.43
L10_T = 27.93
HIC1_T = 29.78       # hic! a giant bubble swallows Bobo
KIKO_JUMP_T = 30.88
KIKO_BOING_T = 31.23
L11_T = 31.78
CUT_4 = 35.14
L12_T = 35.34
LIFT_T = 39.28       # a hiccup bubble lifts Lumi to the first piece
PIECE1_T = 40.58
L13_T = 41.08        # Kiko holds up a jellyfish
L14_T = 43.25
PIECE2_T = 44.51     # the jellyfish swims off; the real second piece was under it
STEAM_T = 45.25      # Draco's fireball: one tiny steam bubble
STEAM_POP_T = 46.05
CUT_5 = 46.75
L15_T = 46.95
L16_T = 49.44
BREATH_T = 51.76
BUBBLES_T = 52.21    # a chain of calm, controlled bubbles
BOBO_LIFT_T = 52.61
BOBO_DROP_T = 53.41  # Bobo lands on Draco
PIECE3_T = 54.01
L17_T = 54.11
COMBINE_T = 56.86
CUT_6 = 57.56
L18_T = 57.96
BANANA_T = 60.70
SNATCH_T = 61.40
PROJECT_T = 62.30
L19_T = 62.70
END_T = 66.06
L20_T = 66.36

for lid, who, at in [("l1", "nimbus", L1_T), ("l2", "bobo", L2_T), ("l3", "kiko", L3_T), ("l4", "bobo", L4_T), ("l5", "draco", L5_T), ("l6", "coralie", L6_T), ("l7", "whisper", L7_T),
                     ("l8", "kiko", L8_T), ("l9", "draco", L9_T), ("l10", "bloop", L10_T), ("l11", "bobo", L11_T), ("l12", "coralie", L12_T), ("l13", "kiko", L13_T), ("l14", "coralie", L14_T),
                     ("l15", "bloop", L15_T), ("l16", "lumi", L16_T), ("l17", "bobo", L17_T), ("l18", "coralie", L18_T), ("l19", "lumi", L19_T), ("l20", "narrator", L20_T)]:
    t.line(lid, who, at)

M = t.music
S = t.sfx
n = note


def slide(f0, f1, dur, vol=0.04):
    """A cartoon slide whistle."""
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


# =====================================================================
# CUE 1 "Into the Blue" (0-14.8 s): magical, dreamy, adventurous. A-flat major, 92 BPM, 6/8.
# Harp arpeggios, soft choir, celesta melody, warm strings; a playful xylophone for the banana fish.
# =====================================================================
c1 = Cue(0.0, CUT_2 + 0.2, bpm=92, fade_in=0.01, fade_out=0.6)
E8 = c1.beat / 2
chords = [("Ab2", "Eb3", "C4"), ("F2", "C3", "Ab3"), ("Db3", "Ab3", "F4"), ("Eb2", "Bb2", "G3")]
bars = int((CUT_2 - 0.2) / (6 * E8)) + 1
for b in range(bars):
    at = 0.15 + b * 6 * E8
    ch = chords[b % 4]
    c1.put(strings([hz(x) for x in ch], 6 * E8 + 0.4, 0.035, attack=0.5, release=0.4, tone=2200), at)
    for k in range(6):
        c1.put(harp(hz(ch[k % 3]) * 2, 1.8, 0.03), at + k * E8)
c1.put(choir([hz("Ab4"), hz("Eb5")], 3.0, 0.025, attack=0.8, release=1.0), 0.1)
mel = [("C6", 0, 2), ("Eb6", 2, 1), ("Ab6", 3, 3), ("G6", 6, 2), ("F6", 8, 1), ("Eb6", 9, 3)]
for m, b, d in mel:
    c1.put(celesta(hz(m), d * E8 * 1.6, 0.035), 0.15 + b * E8)
# the banana fish: a sneaky little xylophone tune, then a squishy bonk
for k, m in enumerate(("Eb5", "F5", "G5", "Ab5", "C6", "Ab5")):
    c1.put_at(xylo(hz(m), 0.3, 0.05), FISH_T + k * 0.14)
c1.mute(GRAB_T, L3_T - 0.1)
c1.put_at(strings([hz(x) for x in ("Ab3", "C4", "Eb4")], 2.4, 0.03, attack=0.6, release=0.6), L4_T)
# Draco's big swim: rising strings into a rolling whirl
for k in range(10):
    c1.put_at(pizz(hz("Ab3") * 2 ** (k / 6), 0.25, 0.06), SPIN_T - 1.2 + k * 0.12)
c1.render(M)

# =====================================================================
# CUE 2 "Coralie's Welcome" (14.6-25.7 s): gentle underwater orchestra. D-flat major, 70 BPM.
# Flute melody over strings and harp; the whispers drain the music to a low drone; trembling strings for Draco.
# =====================================================================
c2 = Cue(CUT_2 - 0.2, CUT_3 + 0.2, bpm=70, fade_in=0.5, fade_out=0.5)
q = c2.beat
for b, ch in enumerate([("Db3", "F3", "Ab3"), ("Bb2", "Db3", "F3"), ("Gb2", "Bb2", "Db3")]):
    at = 0.2 + b * 2 * q * 2
    if at + c2.t0 < L7_T:
        c2.put(strings([hz(x) for x in ch] + [hz(ch[0]) * 2], 4 * q + 0.3, 0.04, attack=0.6, release=0.6), at)
for m, b, d in (("Ab5", 0, 2), ("Bb5", 2, 1), ("Ab5", 3, 1), ("F5", 4, 2), ("Db6", 6, 2), ("C6", 8, 3)):
    if 0.2 + b * q + c2.t0 < L7_T - 0.3:
        c2.put(flute(hz(m), d * q * 0.95, 0.035), 0.2 + b * q)
for k in range(8):
    c2.put(harp(hz(("Db4", "F4", "Ab4", "Db5")[k % 4]), 1.6, 0.028), 0.25 + k * 0.28)
c2.mute(L7_T - 0.25, L8_T - 0.2)
add(M, reverse_swell(1.0, 0.03), L7_T - 1.0)
add(M, strings([hz("Db2"), hz("Ab2")], L8_T - L7_T + 0.5, 0.035, attack=0.6, release=0.5, tone=900), L7_T)
add(M, glass(hz("D5"), 2.0, 0.025), L7_T + 0.2)            # an eerie, out-of-key glass note
add(M, glass(hz("Db5"), 2.0, 0.02), L7_T + 1.0)
c2.put_at(strings([hz("Db3"), hz("Ab3")], CUT_3 - L8_T + 0.2, 0.03, attack=0.3, release=0.3, trem=14), L8_T)   # shaking wings
for k, m in enumerate(("Ab4", "Ab4", "Bb4", "Ab4")):
    c2.put_at(pizz(hz(m), 0.25, 0.06), L8_T + 0.05 + k * 0.2)
for m, at, d in (("Db4", 0, 0.15), ("F4", 0.15, 0.15), ("Ab4", 0.3, 0.5)):
    c2.put_at(brass(hz(m), d, 0.045), L9_T + at)            # a not-so-mighty "dragon technique" fanfare
c2.render(M)

# =====================================================================
# CUE 3 "Bloop's Bounce" (25.5-33.3 s): cute, bouncy, playful. F major, 128 BPM.
# Marimba, ukulele, pizzicato and glockenspiel; a hiccup stops everything; a wobbly float for Bobo.
# =====================================================================
c3 = Cue(CUT_3 - 0.1, CUT_4 + 0.2, bpm=128, fade_in=0.3, fade_out=0.5)
q = c3.beat
uk = [("F3", "A3", "C4", "F4"), ("Bb3", "D4", "F4", "Bb4"), ("C4", "E4", "G4", "C5"), ("F3", "A3", "C4", "F4")]
k = 0
while c3.t0 + 0.2 + k * q < CUT_4:
    at = 0.2 + k * q
    if k % 2 == 0:
        strum(c3.buf, at, [hz(x) for x in uk[(k // 4) % 4]], vol=0.035)
    c3.put(marimba(hz(("F4", "A4", "C5", "A4", "Bb4", "D5", "C5", "A4")[k % 8]), 0.5, 0.045), at + q / 2)
    c3.put(pizz(hz(("F2", "C3", "Bb2", "C3")[k % 4]), 0.3, 0.08), at)
    k += 1
for kk, m in enumerate(("C6", "F6", "A6")):
    c3.put_at(glock(hz(m), 1.0, 0.035), PEEK_T + 0.6 + kk * 0.1)
c3.mute(HIC1_T - 0.02, HIC1_T + 0.45)
# Bobo floating upside down: a wobbly, wavering high tone
tt = np.arange(int(1.6 * SR)) / SR
wob = (np.sin(2 * np.pi * np.cumsum(880 * (1 + 0.05 * np.sin(2 * np.pi * 5 * tt))) / SR) * np.sin(np.pi * tt / 1.6) * 0.02).astype(np.float32)
add(M, wob, HIC1_T + 0.4)
c3.render(M)

# =====================================================================
# CUE 4 "The Whispering Crystals" (33.1-44.4 s): mysterious and curious. B dorian, 84 BPM.
# Glass harmonica, low strings, clarinet, wind chimes; comic stings for the jellyfish and the steam bubble.
# =====================================================================
c4 = Cue(CUT_4 - 0.1, CUT_5 + 0.2, bpm=84, fade_in=0.5, fade_out=0.5)
q = c4.beat
c4.put(strings([hz("B2"), hz("F#3")], CUT_5 - CUT_4 + 0.2, 0.035, attack=0.8, release=0.4, tone=1300), 0.1)
for k, m in enumerate(("B4", "D5", "F#5", "G#5", "F#5", "D5", "C#5", "B4")):
    c4.put(glass(hz(m), 2.0, 0.026), 0.2 + k * q)
for m, b, d in (("F#4", 8, 1), ("G#4", 9, 1), ("A4", 10, 2), ("G#4", 12, 1), ("E4", 13, 2)):
    c4.put(clarinet(hz(m), d * q * 0.95, 0.035), 0.2 + b * q)
wind_chimes(S, PIECE1_T, 1.2, vol=0.02, seed=11)
add(S, ding(0.05), PIECE1_T)
c4.put_at(clarinet(hz("B4"), 0.18, 0.04), L13_T + 1.7)
c4.put_at(clarinet(hz("F4"), 0.6, 0.04), L13_T + 1.9)     # a deflating "wah"
add(S, ding(0.045), PIECE2_T)
c4.mute(STEAM_T - 0.05, STEAM_POP_T + 0.2)
c4.render(M)

# =====================================================================
# CUE 5 "The Bubble Challenge" (44.2-54.8 s): energetic adventure with comic pauses. C minor -> C major, 144 BPM.
# Driving strings, toms, brass; a hush for Bloop's worry; a dead stop when Bobo lands on Draco.
# =====================================================================
c5 = Cue(CUT_5 - 0.1, CUT_6 + 0.2, bpm=144, fade_in=0.4, fade_out=0.5)
q = c5.beat
c5.put_at(strings([hz("C3"), hz("G3"), hz("Eb4")], L16_T - CUT_5 + 0.3, 0.035, attack=0.5, release=0.3, trem=10), CUT_5)
add(S, current(L16_T - CUT_5 + 1.5, 0.05), CUT_5)
c5.put_at(strings([hz(x) for x in ("Ab3", "C4", "Eb4")], 1.2, 0.04, attack=0.4, release=0.4), L16_T)
c5.put_at(strings([hz(x) for x in ("G3", "B3", "D4")], 1.2, 0.04, attack=0.4, release=0.4), L16_T + 1.1)
k = 0
while BUBBLES_T + k * q / 2 < COMBINE_T:
    at = BUBBLES_T + k * q / 2
    c5.put_at(pizz(hz(("C3", "C3", "Eb3", "C3", "G3", "C3", "Bb2", "C3")[k % 8]) * 2, 0.15, 0.06), at)
    if k % 2 == 0:
        c5.put_at(tom(110 if k % 4 == 0 else 150, 0.09), at)
    k += 1
c5.put_at(strings([hz(x) for x in ("C3", "G3", "C4", "Eb4")], COMBINE_T - BUBBLES_T, 0.045, attack=0.2, release=0.1, trem=16), BUBBLES_T)
for m, at, d in (("C4", 0.0, 0.25), ("Eb4", 0.25, 0.25), ("G4", 0.5, 0.25), ("C5", 0.75, 0.6)):
    c5.put_at(brass(hz(m), d, 0.05), BUBBLES_T + 0.2 + at)
c5.mute(BOBO_DROP_T, L17_T + 2.3)
add(S, bwomp(hz("C2"), 0.1, 0.5), BOBO_DROP_T + 0.05)
c5.put_at(snare_roll(COMBINE_T - L17_T - 2.0, 0.04), L17_T + 2.0)
c5.put_at(timpani(hz("C2"), 0.16), COMBINE_T)
c5.put_at(crash(0.05), COMBINE_T)
c5.put_at(strings([hz(x) for x in ("C3", "E3", "G3", "C4", "E4", "G4")], 1.4, 0.06, attack=0.05, release=0.6), COMBINE_T)
harp_gliss(M, COMBINE_T, [n(x) for x in ("C4", "E4", "G4", "C5", "E5", "G5", "C6", "E6")], step=0.045, vol=0.04)
c5.render(M)

# =====================================================================
# CUE 6 "The Singing Cave" (54.6-end): joyful magical orchestra. D major, 116 BPM; then a ticking-clock teaser.
# Strings, brass, choir, glockenspiel and tambourine; the crystals "sing" a chord; a dead stop for the banana theft.
# =====================================================================
c6 = Cue(CUT_6 - 0.15, DUR, bpm=116, fade_in=0.4, fade_out=0.05)
q = c6.beat
prog = [("D3", "F#3", "A3"), ("G3", "B3", "D4"), ("A3", "C#4", "E4"), ("D3", "F#3", "A3")]
for b in range(3):
    at = 0.15 + b * 4 * q
    c6.put(strings([hz(x) for x in prog[b]] + [hz(prog[b][0]) * 2], 4 * q + 0.3, 0.045, attack=0.15, release=0.3), at)
    for kk in range(4):
        c6.put(tamb(0.022), at + kk * q + q / 2)
for m, at, d in (("F#4", 0, 0.4), ("A4", 0.4, 0.4), ("D5", 0.8, 0.8), ("C#5", 1.6, 0.4), ("B4", 2.0, 0.4), ("A4", 2.4, 1.0)):
    c6.put(brass(hz(m), d, 0.045), 0.2 + at)
    c6.put(flute(hz(m) * 2, d, 0.022), 0.2 + at)
for kk, m in enumerate(("D6", "F#6", "A6", "D7", "A6", "F#6")):                   # the singing crystals
    add(S, glass(hz(m), 2.4, 0.03), CUT_6 + 0.1 + kk * 0.18)
c6.put(choir([hz("A4"), hz("D5"), hz("F#5")], 3.5, 0.035, attack=0.4, release=1.2), 0.2)
c6.mute(SNATCH_T, SNATCH_T + 0.5)
for kk in range(4):
    c6.put_at(clap(0.03), SNATCH_T + 0.55 + kk * q / 2)
# the teaser: a mysterious ticking clock in a forest
c6.mute(PROJECT_T - 0.25, PROJECT_T)
c6.put_at(strings([hz(x) for x in ("D3", "A3", "E4")], DUR - PROJECT_T, 0.035, attack=0.8, release=0.3), PROJECT_T)
k = 0
while PROJECT_T + 0.2 + k * 0.5 < DUR - 0.6:
    add(S, tick(0.035, k % 2 == 0), PROJECT_T + 0.2 + k * 0.5)
    k += 1
add(S, glock(hz("E6"), 2.0, 0.03), END_T)
add(S, glock(hz("A6"), 2.0, 0.025), END_T + 0.35)
harp_gliss(M, END_T, [n(x) for x in ("D4", "E4", "A4", "B4", "E5", "F#5", "A5", "B5")], step=0.09, vol=0.03)
c6.render(M)

# =====================================================================
# Sound effects and ambience
# =====================================================================
add(S, steady_wind(DEPART_T + 0.6, 0.012), 0.0)                       # still in the sky
gliss(S, BUBBLE_T, (79, 83, 86, 91, 95), step=0.05, vol=0.04)
add(S, bloop(0.06, 260), BUBBLE_T + 0.2)
add(S, whoosh(1.2, 0.09), DEPART_T)
add(S, boom(0.1), SPLASH_T)
add(S, noise_band(0.8, 400, 4000, 0.06), SPLASH_T)
bubbles(S, SPLASH_T, 1.6, vol=0.035, seed=3)
add(S, current(DUR - SPLASH_T, 0.02), SPLASH_T)                        # the sea, all the way through
k = 0
while SPLASH_T + 1.0 + k * 2.3 < DUR - 1:
    bubbles(S, SPLASH_T + 1.0 + k * 2.3, 0.5, vol=0.012, seed=20 + k)
    k += 1
add(S, bloop(0.05, 500), FISH_T + 0.1)
add(S, whoosh(0.35, 0.06), GRAB_T)
add(S, plop(0.08), GRAB_T + 0.1)                                      # squish against the bubble wall
add(S, whirl(1.6, 0.06), SPIN_T)
add(S, boing(0.05, 220), SPIN_T + 1.5)
add(S, whoosh(0.8, 0.05), CUT_2 + 0.2)                                # Coralie swims in
sparkle(S, CUT_2 + 0.3, 0.8, density=10, vol=0.02)
add(S, squeak(0.03), HIDE_T)
add(S, bloop(0.05, 420), PEEK_T)
add(S, hiccup(0.1, 430), HIC1_T)
add(S, bloop(0.08, 220), HIC1_T + 0.08)
add(S, whoosh(0.4, 0.05), KIKO_JUMP_T)
add(S, boing(0.09, 180), KIKO_BOING_T)
add(S, pomf(0.05), KIKO_BOING_T + 0.5)
add(S, hiccup(0.09, 470), LIFT_T)
add(S, bloop(0.07, 260), LIFT_T + 0.08)
sparkle(S, L13_T, 1.0, density=14, vol=0.025, lo=3000, hi=7000)     # jellyfish sparkle
add(S, bloop(0.05, 600), L14_T + 1.2)                                 # the jellyfish swims away
add(S, fizzle(0.02, 0.3), STEAM_T)
add(S, bloop(0.05, 700), STEAM_T + 0.05)
add(S, pop(0.07), STEAM_POP_T)
add(S, current(1.5, 0.06), CUT_5)
for k in range(5):                                                    # controlled bubbles
    add(S, bloop(0.05, 280 + k * 60), BUBBLES_T + k * 0.32)
add(S, hiccup(0.06, 500), BUBBLES_T - 0.1)
add(S, slide(500, 1400, 0.5, 0.04), BOBO_LIFT_T)
add(S, plop(0.1), BOBO_DROP_T)
add(S, ding(0.05), PIECE3_T)
add(S, whoosh(0.9, 0.07), COMBINE_T - 0.5)
add(S, boom(0.15), COMBINE_T)
sparkle(S, COMBINE_T, 2.0, density=20, vol=0.03)
gliss(S, BANANA_T, (84, 88, 91, 96), step=0.05, vol=0.03)
add(S, whoosh(0.35, 0.08), SNATCH_T)
add(S, chomp(0.08), SNATCH_T + 0.08)
add(S, whoosh(0.6, 0.05), PROJECT_T - 0.2)
sparkle(S, END_T, 2.0, density=8, vol=0.015)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep11"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep11", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

t.finish(mouth_style="v2")
