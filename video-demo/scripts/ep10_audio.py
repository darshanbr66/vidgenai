from audio_kit import *
from score_kit import *

# Episode 10: The Secret of the Floating Sky City
# Six new cues (score_kit). Different keys, meters, tempos and instruments from Episode 9 and from each other.
DUR = 57.4
t = Soundtrack("ep10", duration=DUR, seed=1010)

# ---- timed moments (seconds); src/ep10/Episode.tsx uses the same numbers ----
L1_T = 0.5
CUT_A2 = 3.0        # on the cloud staircase
L2_T = 3.2
L3_T = 5.5          # Kiko wobbles at the edge...
DROP_T = 6.6        # ...and drops out of sight
L4_T = 6.92         # Bobo screams
L5_T = 7.65         # Kiko pops back up, hanging by his tail
CUT_B = 8.9
L6_T = 9.1
TAKEOFF_T = 10.6
SPIN_T = 11.1
CRASH_T = 12.35     # lands on Bobo
L7_T = 12.95
CUT_C = 15.8
PEEK_T = 15.9
L8_T = 16.4
TICKLE_T = 17.75
L9_T = 18.0
CHOO_T = 18.62      # the sneeze
L10_T = 19.25
HELP_T = 19.6       # Lumi pulls a cloud under Bobo
LAND_T = 20.6
L11_T = 21.0
CUT_D = 23.4
FLIP_T = 24.0       # gravity flips
REACH1_T = 24.9
REACH2_T = 25.55
L12_T = 26.0
FADE_T = 27.0
L13_T = 27.2
L14_T = 29.3
CUT_E = 32.0
FIRE_T = 32.45      # Draco's "fire": a smoke ring
RING_T = 32.9
KIKO_MOVE_T = 33.9
POP_T = 34.4        # Bobo's platform springs up
PLAT_LAND_T = 35.2
L15_T = 35.6
CUT_F = 37.9
L16_T = 38.1
L17_T = 39.75
BREATH_T = 42.35
BLOW_T = 42.95
BLOWN_T = 43.4      # Bobo blown backwards...
BASKET_T = 44.15    # ...into the fruit basket
FREE_T = 44.6       # the Sky Crystal is free
LIGHT_T = 45.2      # the city lights up
CUT_G = 46.0
CLOUD_T = 46.9      # Bobo spots a banana cloud
L18_T = 47.3
SWIPE_T = 48.7      # Kiko steals it
CHOMP_T = 48.8
LAUGH_T = 48.95
SHELL_T = 50.1
PROJECT_T = 50.6
L19_T = 50.9
L20_T = 54.0
END_T = 53.8

# ---- voices: slower than Episode 9, with room around every punchline ----
for lid, who, at in [("l1", "lumi", L1_T), ("l2", "bobo", L2_T), ("l3", "kiko", L3_T), ("l4", "bobo", L4_T), ("l5", "kiko", L5_T), ("l6", "draco", L6_T), ("l7", "bobo", L7_T),
                     ("l8", "nimbus", L8_T), ("l9", "nimbus", L9_T), ("l10", "kiko", L10_T), ("l11", "bobo", L11_T), ("l12", "bobo", L12_T), ("l13", "lumi", L13_T), ("l14", "nimbus", L14_T),
                     ("l15", "bobo", L15_T), ("l16", "nimbus", L16_T), ("l17", "lumi", L17_T), ("l18", "bobo", L18_T), ("l19", "lumi", L19_T), ("l20", "narrator", L20_T)]:
    t.line(lid, who, at)

M = t.music


def slide(f0, f1, dur, vol=0.04):
    """A cartoon slide whistle."""
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)

S = t.sfx
n = note

# =====================================================================
# CUE 1 "Skyward" (0-15.8 s): magical adventurous orchestra. E major, 100 BPM, 6/8 lilt.
# Horn melody over string ostinato, harp, timpani; the stair climb is mickey-moused with rising pizzicato.
# =====================================================================
c1 = Cue(0.0, CUT_C + 0.2, bpm=100, fade_in=0.01, fade_out=0.6)
E8 = c1.beat / 2
c1.put(timpani(hz("E2"), 0.12), 0.0)
harp_gliss(M, 0.05, [n(x) for x in ("E3", "G#3", "B3", "E4", "G#4", "B4", "E5", "G#5", "B5", "E6")], step=0.05, vol=0.04)
chords = [("E3", "G#3", "B3"), ("C#3", "E3", "G#3"), ("A2", "C#3", "E3"), ("B2", "D#3", "F#3")]
for bar in range(4):
    at = 0.2 + bar * 6 * E8
    c1.put(strings([hz(x) for x in chords[bar]], 6 * E8 + 0.3, 0.045, attack=0.25, release=0.3), at)
    for k in range(6):
        c1.put(pizz(hz(chords[bar][k % 3]) * 2, 0.4, 0.06), at + k * E8)
horn = [("B3", 0, 2), ("E4", 2, 1), ("G#4", 3, 2), ("B4", 5, 1), ("C#5", 6, 3), ("B4", 9, 2), ("G#4", 11, 1), ("A4", 12, 2), ("B4", 14, 1), ("E5", 15, 6)]
for m, b, d in horn:
    c1.put(brass(hz(m), d * E8 * 0.95, 0.05), 0.2 + b * E8)
    c1.put(flute(hz(m) * 2, d * E8 * 0.95, 0.018), 0.2 + b * E8)
# the climb: each step a rising pizzicato note
steps = ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"]
for k in range(8):
    c1.put_at(pizz(hz(steps[k]), 0.35, 0.07), CUT_A2 + 0.1 + k * 0.32)
c1.put_at(strings([hz("B2"), hz("F#3")], 1.8, 0.04, attack=0.4, release=0.4, trem=9), L2_T)     # nervous tremolo
# Kiko's fake fall: a dead stop, a slide whistle down, a scream stab, and a giggling bassoon
c1.mute(DROP_T - 0.05, L5_T)
add(S, slide(1500, 380, 0.55, 0.045), DROP_T)
for k, m in enumerate(("E4", "E4", "D4", "C#4", "D4", "E4")):
    c1.put_at(bassoon(hz(m), 0.12, 0.06), L5_T + 0.05 + k * 0.15)
# Draco: "Flying is easy!" -- a mock-heroic fanfare, a woodwind spin, a crash
for m, at, d in (("E4", 0, 0.15), ("G#4", 0.15, 0.15), ("B4", 0.3, 0.15), ("E5", 0.45, 0.6)):
    c1.put_at(brass(hz(m), d, 0.05), TAKEOFF_T - 0.3 + at)
for k in range(14):
    c1.put_at(clarinet(hz("E5") * 2 ** (((k * 5) % 12) / 12), 0.08, 0.035), SPIN_T + k * 0.085)
c1.mute(CRASH_T, L7_T + 2.6)
c1.put_at(pizz(hz("E2"), 0.5, 0.12), L7_T + 2.6)
c1.put_at(pizz(hz("B1"), 0.5, 0.12), L7_T + 2.85)
c1.render(M)

# =====================================================================
# CUE 2 "Hello, Nimbus" (15.8-23.6 s): cute and whimsical. C major, 112 BPM, 3/4.
# Ukulele strums, clarinet melody, glockenspiel; a held breath for the sneeze; harp for the soft landing.
# =====================================================================
c2 = Cue(CUT_C - 0.15, CUT_D + 0.2, bpm=112, fade_in=0.35, fade_out=0.5)
q = c2.beat
uke = [("C4", "E4", "G4", "C5"), ("A3", "E4", "A4", "C5"), ("F3", "C4", "F4", "A4"), ("G3", "D4", "G4", "B4")]
for b in range(int((CHOO_T - CUT_C) / (3 * q)) + 1):
    for k in range(3):
        at = 0.15 + (b * 3 + k) * q
        if at + c2.t0 < TICKLE_T:
            strum(c2.buf, at, [hz(x) for x in uke[b % 4]], vol=0.035 if k else 0.05)
cl = [("E5", 0, 1), ("G5", 1, 1), ("C6", 2, 2), ("B5", 4, 1), ("A5", 5, 1), ("G5", 6, 3)]
for m, b, d in cl:
    c2.put(clarinet(hz(m), d * q * 0.9, 0.04), 0.15 + b * q)
for k, m in enumerate(("C6", "E6", "G6")):
    c2.put_at(glock(hz(m), 1.2, 0.035), L8_T + 1.35 + k * 0.1)
c2.mute(TICKLE_T, L10_T)                                        # ah... ah... (silence)
# after the sneeze: Bobo flies (a wobbly violin glissando), Lumi helps, a soft landing
c2.put_at(strings([hz("C4")], 1.2, 0.03, attack=0.1, release=0.3), L10_T)
for k, m in enumerate(("G4", "E4", "C4", "D4", "E4", "G4")):
    c2.put_at(pizz(hz(m), 0.3, 0.07), L10_T + 0.05 + k * q / 2)
harp_gliss(M, LAND_T - 0.1, [n(x) for x in ("C6", "G5", "E5", "C5", "G4", "E4", "C4")], step=0.05, vol=0.04)
c2.put_at(strings([hz(x) for x in ("F3", "A3", "C4")], 2.0, 0.03, attack=0.5, release=0.5), L11_T)
c2.render(M)

# =====================================================================
# CUE 3 "Upside Down" (23.4-32.2 s): bouncy and odd. B-flat major in 7/8 (2+2+3), 126 BPM (eighths 252).
# Tuba, marimba, woodblocks, kazoo; a backwards swell when gravity flips; the music sags as the crystal fades.
# =====================================================================
c3 = Cue(CUT_D - 0.1, CUT_E + 0.2, bpm=252, fade_in=0.3, fade_out=0.5)
e = c3.beat
groups = [0, 2, 4]
bars = int((FADE_T + 0.6 - CUT_D) / (7 * e)) + 1
bass = ["Bb1", "F2", "Bb1", "Eb2", "F2", "C2", "F2", "Bb1"]
for b in range(bars):
    at0 = 0.1 + b * 7 * e
    for gi, gs in enumerate(groups):
        c3.put(tuba(hz(bass[(b * 3 + gi) % 8]), 0.2, 0.11), at0 + gs * e)
        c3.put(woodblock(1150 if gi == 0 else 860, 0.045), at0 + gs * e)
        c3.put(marimba(hz("D4"), 0.4, 0.04), at0 + (gs + 1) * e)
        c3.put(marimba(hz("F4"), 0.4, 0.035), at0 + (gs + 1) * e)
kaz = ["Bb4", "C5", "D5", "F5", "Eb5", "D5", "C5", "D5", "Bb4", None, "F4", "G4", "A4", "Bb4"]
for k, m in enumerate(kaz):
    if m and 0.1 + k * e * 1.0 + 0.6 < FADE_T - c3.t0:
        c3.put(kazoo(hz(m), e * 0.9, 0.035), 0.6 + k * e)
add(S, reverse_swell(0.7, 0.05), FLIP_T - 0.7)
for at in (REACH1_T, REACH2_T):                                # reach... and the banana bobs away
    add(S, xylo(hz("C6"), 0.3, 0.06), at)
    add(S, xylo(hz("G5"), 0.3, 0.05), at + 0.12)
    add(S, xylo(hz("C5"), 0.3, 0.04), at + 0.24)
c3.mute(FADE_T + 0.05, CUT_E + 0.3)
# the crystal fading: a sagging, detuning chord and a low worried flute
sag = strings([hz(x) for x in ("Bb3", "D4", "F4")], CUT_E - FADE_T, 0.04, attack=0.3, release=0.6)
tt = np.arange(len(sag)) / SR
idx = np.clip(np.cumsum(1 - 0.06 * tt / tt[-1]), 0, len(sag) - 1).astype(int)
add(M, sag[idx].astype(np.float32), FADE_T)
add(M, flute(hz("D5"), 1.4, 0.03), L14_T + 0.2)
add(M, flute(hz("C#5"), 1.6, 0.03), L14_T + 1.6)
c3.render(M)

# =====================================================================
# CUE 4 "The Wind Tower" (32-38.1 s): mysterious adventure with suspense. F-sharp minor, 88 BPM.
# Spiccato low strings, frame drum, breathy flute, wind chimes; comic tiny brass for Draco's smoke ring.
# =====================================================================
c4 = Cue(CUT_E - 0.2, CUT_F + 0.2, bpm=88, fade_in=0.4, fade_out=0.5)
q = c4.beat
ost = ["F#2", "C#3", "F#3", "C#3", "D3", "C#3", "A2", "C#3"]
for k in range(int((CUT_F - CUT_E) / (q / 2)) + 1):
    at = 0.2 + k * q / 2
    c4.put(pizz(hz(ost[k % 8]), 0.25, 0.08), at)
    if k % 4 == 0:
        c4.put(frame_drum(0.1), at)
c4.put(strings([hz("F#2"), hz("C#3")], CUT_F - CUT_E + 0.2, 0.035, attack=0.6, release=0.3, tone=1500, trem=8), 0.1)
for m, b, d in (("C#5", 0, 2), ("D5", 2, 1), ("C#5", 3, 1), ("A4", 4, 3)):
    c4.put(flute(hz(m), d * q * 0.95, 0.035), 0.3 + b * q)
wind_chimes(S, CUT_E + 0.1, 1.5, vol=0.02, seed=4)
c4.put_at(brass(hz("F#4"), 0.18, 0.04, wah=0.5), FIRE_T + 0.05)        # a tiny "wah" for the smoke ring
c4.put_at(brass(hz("F4"), 0.4, 0.035, wah=0.5), FIRE_T + 0.28)
for k, m in enumerate(("C#5", "C#5", "C#5")):                          # Kiko tiptoes
    c4.put_at(pizz(hz(m), 0.2, 0.06), KIKO_MOVE_T - 0.4 + k * 0.17)
c4.mute(POP_T, L15_T - 0.05)
c4.render(M)

# =====================================================================
# CUE 5 "The Great Wind" (37.9-46.2 s): exciting, energetic orchestra. G minor -> G major, 138 BPM.
# Quiet fear, a warm encouragement, then driving strings, brass, snare and choir to a big release.
# =====================================================================
c5 = Cue(CUT_F - 0.1, CUT_G + 0.25, bpm=138, fade_in=0.4, fade_out=0.6)
q = c5.beat
c5.put_at(strings([hz("G2"), hz("D3"), hz("Bb3")], L17_T - CUT_F + 0.2, 0.035, attack=0.5, release=0.3, trem=12), CUT_F)
c5.put_at(strings([hz(x) for x in ("Eb3", "G3", "Bb3", "Eb4")], 1.3, 0.04, attack=0.4, release=0.3), L17_T)
c5.put_at(strings([hz(x) for x in ("C3", "Eb3", "G3", "C4")], 1.3, 0.04, attack=0.4, release=0.4), L17_T + 1.2)
c5.put_at(snare_roll(BLOW_T - BREATH_T, 0.05), BREATH_T)
c5.put_at(cymbal_swell(BLOW_T - BREATH_T, 0.04), BREATH_T)
drive = ["G2", "G2", "Bb2", "G2", "C3", "G2", "D3", "G2"]
k = 0
while BLOW_T + k * q / 4 < FREE_T:
    at = BLOW_T + k * q / 4
    c5.put_at(pizz(hz(drive[(k // 2) % 8]) * 2, 0.15, 0.06), at)
    if k % 4 == 0:
        c5.put_at(timpani(hz("G2"), 0.08, 0.6), at)
    k += 1
c5.put_at(strings([hz(x) for x in ("G3", "Bb3", "D4", "G4")], FREE_T - BLOW_T, 0.05, attack=0.1, release=0.1, trem=16), BLOW_T)
for m, at, d in (("D4", 0.0, 0.3), ("G4", 0.3, 0.3), ("Bb4", 0.6, 0.3), ("D5", 0.9, 0.7)):
    c5.put_at(brass(hz(m), d, 0.055), BLOW_T + at)
    c5.put_at(brass(hz(m) / 2, d, 0.035), BLOW_T + at)
c5.put_at(choir([hz("G4"), hz("D5")], FREE_T - BLOW_T, 0.03, attack=0.4, release=0.1), BLOW_T)
# release: G major tutti
c5.put_at(timpani(hz("G2"), 0.18), FREE_T)
c5.put_at(crash(0.055), FREE_T)
c5.put_at(strings([hz(x) for x in ("G3", "B3", "D4", "G4", "B4", "D5")], 1.8, 0.07, attack=0.04, release=0.8), FREE_T)
c5.put_at(choir([hz("B4"), hz("D5"), hz("G5")], 1.9, 0.045, attack=0.1, release=0.8), FREE_T)
for m, at, d in (("G4", 0.0, 0.3), ("B4", 0.3, 0.3), ("D5", 0.6, 0.3), ("G5", 0.9, 0.9)):
    c5.put_at(brass(hz(m), d, 0.055), LIGHT_T + at - 0.3)
harp_gliss(M, LIGHT_T, [n(x) for x in ("G3", "B3", "D4", "G4", "B4", "D5", "G5", "B5", "D6", "G6")], step=0.04, vol=0.04)
c5.render(M)

# =====================================================================
# CUE 6 "Sky City Celebration" (46-end): joyful and magical. A major, 120 BPM, then a watery teaser.
# Celesta, harp, bright strings, tambourine and handclaps; a dead stop for the stolen banana;
# shimmering harp and bubbles for the seashell; ends on an open chord.
# =====================================================================
c6 = Cue(CUT_G - 0.15, DUR, bpm=120, fade_in=0.4, fade_out=0.05)
q = c6.beat
prog = [("A3", "C#4", "E4"), ("D3", "F#3", "A3"), ("E3", "G#3", "B3"), ("A3", "C#4", "E4")]
for b in range(3):
    at = 0.15 + b * 4 * q
    c6.put(strings([hz(x) for x in prog[b]], 4 * q + 0.3, 0.045, attack=0.15, release=0.3), at)
    for k in range(8):
        c6.put(celesta(hz(prog[b][k % 3]) * 4, 0.8, 0.03), at + k * q / 2)
    for k in range(4):
        c6.put(tamb(0.025), at + k * q + q / 2)
        if k % 2 == 1:
            c6.put(clap(0.035), at + k * q)
for m, b, d in (("C#5", 0, 1), ("E5", 1, 1), ("A5", 2, 2), ("G#5", 4, 1), ("F#5", 5, 1), ("E5", 6, 2)):
    c6.put(flute(hz(m), d * q * 0.95, 0.035), 0.15 + b * q)
c6.mute(SWIPE_T, LAUGH_T)                                     # the banana disappears: silence, then laughter
for k in range(6):
    c6.put_at(clap(0.03), LAUGH_T + 0.1 + k * q / 2)
    c6.put_at(celesta(hz(("A5", "C#6", "E6")[k % 3]), 0.6, 0.03), LAUGH_T + 0.1 + k * q / 2)
# the seashell: mysterious, watery
c6.mute(SHELL_T - 0.2, SHELL_T)
c6.put_at(strings([hz(x) for x in ("D3", "A3", "E4")], DUR - SHELL_T, 0.035, attack=0.8, release=0.3), SHELL_T)
for k in range(int((DUR - SHELL_T - 0.5) / 0.22)):
    c6.put_at(harp(hz(("D4", "A4", "E5", "F#5", "A5", "E5", "A4", "F#4")[k % 8]), 1.6, 0.03), SHELL_T + 0.1 + k * 0.22)
bubbles(S, PROJECT_T, 2.5, vol=0.03, seed=7)
c6.put_at(choir([hz("A4"), hz("E5")], DUR - L20_T, 0.03, attack=0.6, release=0.2), L20_T - 0.2)
harp_gliss(M, END_T, [n(x) for x in ("D4", "E4", "A4", "B4", "E5", "F#5", "A5", "B5", "E6")], step=0.08, vol=0.03)
c6.render(M)

# =====================================================================
# Sound effects and ambience
# =====================================================================
add(S, desert_wind(CUT_A2 + 0.5, 0.01), 0.0)
gliss(S, 0.0, (76, 80, 83, 88, 92), step=0.05, vol=0.05)
sparkle(S, 0.0, 2.0, density=16, vol=0.025)
add(S, steady_wind(DUR - CUT_A2, 0.012), CUT_A2)                    # high-altitude air
for k in range(10):                                                 # soft steps on cloud
    add(S, pomf(0.03), CUT_A2 + 0.1 + k * 0.32)
add(S, whoosh(0.5, 0.05), L3_T)
add(S, whoosh(0.7, 0.08), DROP_T)
add(S, squeak(0.04), L5_T)
add(S, whoosh(0.8, 0.09), TAKEOFF_T)
add(S, whirl(1.2, 0.07), SPIN_T)
add(S, plop(0.1), CRASH_T)
add(S, bwomp(hz("E2"), 0.1, 0.5), CRASH_T + 0.05)
sparkle(S, PEEK_T, 0.6, density=10, vol=0.02)
add(S, squeak(0.03), TICKLE_T + 0.1)
add(S, achoo(0.08), CHOO_T)
add(S, gust(1.6, 0.13), CHOO_T)
add(S, whirl(1.3, 0.06), CHOO_T + 0.2)
add(S, whoosh(0.5, 0.05), HELP_T)
add(S, plop(0.09), LAND_T)
add(S, pomf(0.06), LAND_T + 0.05)
whistle_tune(S, FLIP_T + 0.6, [n(x) for x in ("F5", "D5", "Bb4", "D5", "F5", "Bb5")], step=0.17, vol=0.03)
add(S, boing(0.06, 260), FLIP_T + 0.1)
add(S, pop(0.05), FLIP_T + 0.2)
add(S, mirage_wobble(1.0, 0.025), FADE_T)
add(S, steady_wind(1.2, 0.03), CUT_E)
add(S, pop(0.05), FIRE_T)
add(S, fizzle(0.03, 0.4), FIRE_T + 0.05)
add(S, ping(note_hz(96), 0.03), RING_T + 0.35)                       # the ring settles like a halo
add(S, boing(0.08, 200), POP_T)
add(S, slide(500, 1600, 0.35, 0.045), POP_T + 0.05)
add(S, pomf(0.07), PLAT_LAND_T)
add(S, tumbleweed(0.8, 0.02), CUT_F)                                # wind rattling the tower
add(S, steady_wind(FREE_T - CUT_F, 0.02), CUT_F)
add(S, reverse_swell(0.6, 0.04), BREATH_T)
add(S, steady_wind(FREE_T - BLOW_T + 0.4, 0.08), BLOW_T)
add(S, whoosh(0.7, 0.09), BLOWN_T)
add(S, plop(0.1), BASKET_T)
for k in range(3):
    add(S, boing(0.03, 400 + k * 120), BASKET_T + 0.12 + k * 0.12)  # fruit bouncing
add(S, boom(0.16), FREE_T)
sparkle(S, FREE_T, 2.0, density=20, vol=0.03)
add(S, whoosh(1.2, 0.07), LIGHT_T)
gliss(S, CLOUD_T, (84, 88, 91, 96), step=0.05, vol=0.03)
add(S, whoosh(0.35, 0.08), SWIPE_T)
add(S, chomp(0.09), CHOMP_T)
gliss(S, SHELL_T, (88, 91, 95, 100), step=0.06, vol=0.03)
add(S, whoosh(0.6, 0.05), PROJECT_T - 0.2)
sparkle(S, END_T, 2.0, density=8, vol=0.015)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep10"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep10", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

t.finish(mouth_style="v2")
