from audio_kit import *
from score_kit import *

# Episode 13: The Mystery of the Rainbow Bridge
# Six new cues in keys, meters and instruments not used for Episodes 9-12. Dialogue measured per voice (about 4.4 syllables/s).
DUR = 115.6
t = Soundtrack("ep13", duration=DUR, seed=1313)

# ---- timed moments (seconds); src/ep13/Episode.tsx uses the same numbers ----
FLARE_T = 0.0        # the Master Clock's rainbow-bridge image flares up
L1_T = 0.7           # Tock: "Goodbye, friends! Come back by purple o'clock!"
L2_T = 3.3
JUMP_T = 5.2         # everyone jumps into the image
CUT_1 = 6.4
LAND_T = 6.9         # out of the rainbow portal onto the arrival island
RED_PALE_T = 9.0     # the red band goes pale
BOBO_STEP_T = 10.4   # Bobo steps onto the bridge...
HOLE_T = 10.9        # ...and it turns see-through under his feet
L3_T = 11.3
KIKO_JUMP_T = 13.6   # Kiko "falls through"
L4_T = 13.8
KIKO_UP_T = 14.6     # ...and bounces back up on a cloud: "Just kidding!"
BLUE_GREY_T = 15.6   # the blue band greys, the yellow one flickers
L5_T = 16.2          # Draco: "Stand back! My dragon magic will fix it!"
PUFF_T = 18.9        # ...a tiny puff of smoke
L6_T = 20.0          # Bobo: banana safety rail
CUT_2 = 24.2
WIGGLE_T = 24.6      # a colourful cloud wiggles
PEEK_T = 25.3        # Pico pops out (and changes colour)
L7_T = 25.8
L8_T = 28.1
KIKO_SNEAK_T = 32.0
L9_T = 33.0          # "Boo!"
FLASH_T = 33.4       # Pico flashes through every colour
FLASH_LEN = 1.5
L10_T = 35.4
L11_T = 38.8         # "Um... even I forgot!"
CUT_3 = 40.8
L12_T = 41.2
FLOWER_T = 44.1      # the red flower island
ORB_RED_T = 44.9
FALLS_T = 45.9       # the blue waterfall island
ORB_BLUE_T = 46.7
SUN_T = 47.6         # the golden sunshine island
L13_T = 48.0         # "Ooh! A giant orange! Breakfast!"
SWAP_T = 49.7        # Kiko swaps the orb for a stone
BITE_T = 50.3        # CLONK
L14_T = 51.4
FLY_T = 53.5
CATCH_T = 54.3       # Draco is caught in a colourful cloud
L15_T = 55.2
L16_T = 56.7
CUT_4 = 58.4
L17_T = 59.0         # the seven colours, each one lights as it is named
WORDS = [1.63, 2.24, 2.68, 3.23, 3.84, 4.25, 5.15]
L18_T = 65.1
ORBS_T = 67.5        # orbs fly into the gate in rainbow order (orange is missing)
ORB_STEP = 0.3
BANANA_T = 69.4      # Bobo puts a banana in the orange socket
GOLD_T = 69.6
L19_T = 70.3
L20_T = 72.7
KIKO_ORANGE_T = 74.6 # Kiko gives back the real orange orb
OPEN_T = 75.2
L21_T = 75.6
CUT_5 = 77.6
L22_T = 78.2
L23_T = 80.8
RING_T = 83.5        # Kiko sets the seven orbs around the pedestal
FLAME_T = 84.3       # Draco's small, careful flame
TRIP_T = 85.3        # Bobo trips: a little burst of rainbow energy
BURST_T = 85.6
GLOW_T = 86.0        # Pico finds its courage
L24_T = 86.4         # "Rainbow... shine!"
RESTORE_T = 87.9     # the Rainbow Heart shines again
L25_T = 89.9         # "I look like a banana that went on vacation!"
CUT_6 = 93.8
PRANK_T = 96.8
HIDE_T = 97.3        # Pico changes colour and hides in a rainbow flower
L26_T = 97.9
RBANANA_T = 100.2
L27_T = 100.5
STEAL_T = 103.1      # Kiko takes the first bite
L28_T = 103.5
LAUGH_T = 104.1
PROJECT_T = 105.7    # the heart projects a music box in an enchanted castle
L29_T = 106.3
END_T = 110.3
L30_T = 110.7

lines = [("l1", "tock", L1_T), ("l2", "lumi", L2_T), ("l3", "bobo", L3_T), ("l4", "kiko", L4_T), ("l5", "draco", L5_T), ("l6", "bobo", L6_T), ("l7", "pico", L7_T), ("l8", "pico", L8_T),
         ("l9", "kiko", L9_T), ("l10", "bobo", L10_T), ("l11", "pico", L11_T), ("l12", "pico", L12_T), ("l13", "bobo", L13_T), ("l14", "draco", L14_T), ("l15", "draco", L15_T), ("l16", "kiko", L16_T),
         ("l17", "pico", L17_T), ("l18", "lumi", L18_T), ("l19", "lumi", L19_T), ("l20", "bobo", L20_T), ("l21", "draco", L21_T), ("l22", "pico", L22_T), ("l23", "lumi", L23_T), ("l24", "pico", L24_T),
         ("l25", "bobo", L25_T), ("l26", "kiko", L26_T), ("l27", "bobo", L27_T), ("l28", "bobo", L28_T), ("l29", "lumi", L29_T), ("l30", "narrator", L30_T)]
for lid, who, at in lines:
    t.line(lid, who, at)

M = t.music
S = t.sfx
n = note


def slide(f0, f1, dur, vol=0.04):
    """A slide whistle."""
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


def fade_glass(t0, notes, vol=0.03, step=0.12):
    """A colour draining away: a falling run of glass tones."""
    for k, m in enumerate(notes):
        add(S, glass(hz(m), 1.4, vol * (1 - k * 0.12)), t0 + k * step)


def color_blips(t0, dur, count, vol=0.03):
    """Pico's colour change: quick rising chime-blips, one per colour."""
    scale = ["C6", "D6", "E6", "G6", "A6", "C7", "D7", "E7"]
    for k in range(count):
        at = t0 + k * dur / count
        add(S, celesta(hz(scale[k % 8]), 0.5, vol), at)
        add(S, pop(vol * 0.6), at)


# =====================================================================
# CUE 1 "The Bridge Above the Clouds" (0-24.4 s): magical, uplifting orchestra. A lydian, 76 BPM, 6/8.
# Harp arpeggios, shimmering glockenspiel and celesta, swelling strings and a horn melody.
# Comic stops: Kiko's fake fall and Draco's puff.
# =====================================================================
c1 = Cue(0.0, CUT_2 + 0.2, bpm=76 * 3, fade_in=0.02, fade_out=0.6)   # beat = an eighth note of 6/8
e = c1.beat
bar = 6 * e
prog = [("A2", ("A3", "C#4", "E4", "B4")), ("D3", ("F#3", "A3", "D4", "G#4")), ("E3", ("G#3", "B3", "D#4", "F#4")), ("A2", ("E3", "A3", "C#4", "D#4"))]
add(S, boom(0.12), 0.0)                                                 # a sound on frame 0
harp_gliss(S, 0.0, [n(x) for x in ("A4", "C#5", "D#5", "E5", "G#5", "A5", "C#6", "E6")], step=0.04, vol=0.05)
for b in range(int((CUT_2 + 0.2) / bar) + 1):
    at = 0.05 + b * bar
    root, ch = prog[b % 4]
    c1.put(strings([hz(x) for x in ch[:3]], bar + 0.5, 0.03, attack=0.8, release=0.6, tone=2600), at)
    c1.put(pizz(hz(root), 0.6, 0.07), at)
    for k in range(6):
        c1.put(harp(hz(ch[(0, 1, 2, 3, 2, 1)[k]]) * 2, 1.6, 0.024), at + k * e)
    if b % 2 == 0:
        c1.put(glock(hz(ch[3]) * 4, 1.4, 0.016), at + 3 * e)
melody = [("E4", 0, 3), ("A4", 3, 2), ("B4", 5, 1), ("C#5", 6, 4), ("D#5", 10, 2), ("E5", 12, 6), ("C#5", 18, 3), ("B4", 21, 3), ("A4", 24, 6)]
for m, b0, d in melody:
    c1.put_at(brass(hz(m), d * e * 0.95, 0.03, scoop=False), LAND_T + 0.2 + b0 * e)
wind_chimes(S, LAND_T, 2.4, vol=0.02, seed=13)
c1.put_at(cymbal_swell(1.4, 0.03), LAND_T - 1.4)
# the colours draining: falling glass runs
fade_glass(RED_PALE_T, ["E6", "C#6", "A5", "E5"])
fade_glass(BLUE_GREY_T, ["D#6", "B5", "F#5", "D#5"])
# Kiko's fake fall: the music stops, a slide whistle down... and up
c1.mute(KIKO_JUMP_T - 0.05, KIKO_UP_T + 0.5)
add(S, slide(1400, 300, 0.75, 0.035), KIKO_JUMP_T + 0.05)
add(S, boing(0.06, 180), KIKO_UP_T - 0.1)
add(S, slide(400, 1500, 0.35, 0.03), KIKO_UP_T)
# Draco's fanfare... and the tiny puff
for k, m in enumerate(("A3", "C#4", "E4", "A4")):
    c1.put_at(brass(hz(m), 0.18 if k < 3 else 0.5, 0.04), L5_T + 1.2 + k * 0.17)
c1.put_at(snare_roll(PUFF_T - L5_T - 1.9, 0.03), L5_T + 1.9)
c1.mute(PUFF_T - 0.02, L6_T + 0.3)
add(S, fizzle(0.035, 0.5), PUFF_T)
add(S, pomf(0.035), PUFF_T + 0.05)
c1.render(M)

# =====================================================================
# CUE 2 "Hello, Pico" (24-41 s): cute and playful. G-flat major, 116 BPM, 2/4.
# Clarinet and flute chatter, pizzicato strings, a little xylophone; a hush, then Pico's colour blips.
# =====================================================================
c2 = Cue(CUT_2 - 0.2, CUT_3 + 0.2, bpm=116, fade_in=0.5, fade_out=0.5)
q = c2.beat
bass2 = ["Gb2", "Db3", "Bb2", "Db3", "Cb3", "Gb2", "Ab2", "Db3"]
k = 0
while c2.t0 + 0.2 + k * q < CUT_3:
    at = 0.2 + k * q
    c2.put(pizz(hz(bass2[k % 8]), 0.3, 0.07), at)
    c2.put(pizz(hz(("Bb3", "Db4", "Gb4", "Db4")[k % 4]), 0.2, 0.035), at + q / 2)
    k += 1
woods = [("Bb4", 0, 1), ("Db5", 1, 1), ("Gb5", 2, 2), ("F5", 4, 1), ("Eb5", 5, 1), ("Db5", 6, 2), ("Bb4", 8, 1), ("Cb5", 9, 1), ("Db5", 10, 3)]
for m, b0, d in woods:
    c2.put_at(clarinet(hz(m), d * q * 0.5, 0.03), PEEK_T + 0.2 + b0 * q / 2)
for m, b0, d in (("Gb5", 0, 1), ("Ab5", 1, 1), ("Bb5", 2, 2), ("Db6", 4, 2), ("Bb5", 6, 1), ("Gb5", 7, 3)):
    c2.put_at(flute(hz(m), d * q * 0.5, 0.025), L8_T + 0.3 + b0 * q / 2)
for k2, m in enumerate(("Gb5", "Bb5", "Db6")):
    c2.put_at(xylo(hz(m), 0.4, 0.04), PEEK_T + k2 * 0.08)
# Kiko sneaks: tip-toe bassoon, then a dead stop for "Boo!"
for k2, m in enumerate(("Db3", "Eb3", "F3", "Gb3")):
    c2.put_at(bassoon(hz(m), 0.12, 0.05), KIKO_SNEAK_T + 0.1 + k2 * 0.22)
c2.mute(L9_T - 0.1, FLASH_T + FLASH_LEN + 0.1)
color_blips(FLASH_T, FLASH_LEN, 8, 0.03)
add(S, whirl(FLASH_LEN, 0.03), FLASH_T)
c2.mute(L11_T - 0.4, L11_T + 1.4)                                      # a beat of silence before "even I forgot!"
add(S, squeak(0.03), L11_T + 1.35)
c2.render(M)

# =====================================================================
# CUE 3 "Island Hopping" (40.6-58.6 s): cheerful adventure with rhythmic percussion. D mixolydian, 138 BPM.
# Marimba ostinato, hand drums, tambourine, ukulele strums and brass hits; stops for the clonk and the cloud.
# =====================================================================
c3 = Cue(CUT_3 - 0.2, CUT_4 + 0.2, bpm=138, fade_in=0.4, fade_out=0.5)
q = c3.beat
ost = ["D4", "F#4", "A4", "C5", "A4", "F#4", "G4", "A4"]
chords3 = [("D3", "F#3", "A3"), ("C3", "E3", "G3"), ("G2", "B2", "D3"), ("D3", "F#3", "A3")]
k = 0
while c3.t0 + 0.2 + k * q / 2 < CUT_4:
    at = 0.2 + k * q / 2
    c3.put(marimba(hz(ost[k % 8]), 0.5, 0.05), at)
    if k % 4 == 0:
        c3.put(dum(0.08), at)
    if k % 4 == 2:
        c3.put(tek(0.04), at)
    if k % 2 == 1:
        c3.put(shaker(0.006), at)
    if k % 8 == 0:
        ch = chords3[(k // 8) % 4]
        strum(c3.buf, at, [hz(x) * 2 for x in ch], vol=0.035)
        c3.put(tuba(hz(ch[0]) / 2, 0.35, 0.06), at)
    k += 1
for at in (FLOWER_T, FALLS_T, SUN_T):
    c3.put_at(crash(0.025), at)
    for k2, m in enumerate(("D4", "A4", "D5")):
        c3.put_at(brass(hz(m), 0.16, 0.035), at + k2 * 0.11)
add(S, ding(0.05), ORB_RED_T)
harp_gliss(S, ORB_RED_T, [n(x) for x in ("D6", "F#6", "A6")], step=0.05, vol=0.03)
add(S, ding(0.05), ORB_BLUE_T)
harp_gliss(S, ORB_BLUE_T, [n(x) for x in ("E6", "G6", "B6")], step=0.05, vol=0.03)
add(S, tummy_rumble(0.06), L13_T + 1.5)
add(S, whoosh(0.3, 0.05), SWAP_T)
c3.mute(SWAP_T + 0.3, BITE_T + 0.9)
add(S, clink(0.09), BITE_T)
add(S, bwomp(hz("C2"), 0.07, 0.5), BITE_T + 0.05)
for k2 in range(6):                                                    # Bobo's teeth buzzing
    add(S, tek(0.02), BITE_T + 0.12 + k2 * 0.05)
# Draco's take-off, the cloud, the deadpan
add(S, whoosh(0.7, 0.06), FLY_T)
c3.mute(CATCH_T, L15_T)
add(S, pomf(0.08), CATCH_T)
add(S, boing(0.05, 160), CATCH_T + 0.1)
add(S, squeak(0.02), CATCH_T + 0.5)
c3.mute(L16_T + 1.0, L16_T + 1.3)
add(S, pop(0.05), L16_T + 1.0)
c3.render(M)

# =====================================================================
# CUE 4 "The Rainbow Gate" (58.2-77.8 s): curious, mysterious, with colourful accents. G-sharp minor, 92 BPM.
# Low strings, celesta and glass-harmonica questions, woodblock; each colour named rings its own note.
# =====================================================================
c4 = Cue(CUT_4 - 0.2, CUT_5 + 0.2, bpm=92, fade_in=0.6, fade_out=0.5)
q = c4.beat
c4.put(strings([hz("G#2"), hz("D#3"), hz("B3")], L18_T - CUT_4 + 0.5, 0.03, attack=1.0, release=0.5, tone=1600), 0.2)
k = 0
while c4.t0 + 0.2 + k * q < ORBS_T:
    at = 0.2 + k * q
    c4.put(celesta(hz(("G#4", "B4", "D#5", "F#5", "E5", "D#5", "B4", "C#5")[k % 8]), 0.9, 0.03), at)
    if k % 2 == 0:
        c4.put(woodblock(700 if k % 4 else 900, 0.03), at)
    k += 1
rising = ["G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5"]
for i, w in enumerate(WORDS):                                            # each colour as it is named
    add(S, glass(hz(rising[i]) * 2, 1.6, 0.035), L17_T + w)
    add(S, blink_ping(0.02), L17_T + w)
# the orbs fly in, a rising scale... and the banana's honk
c4.put_at(strings([hz(x) for x in ("E3", "G#3", "B3", "D#4")], OPEN_T - ORBS_T + 1.5, 0.03, attack=0.4, release=0.6), ORBS_T)
for i in range(7):
    if i == 1:
        continue
    at = ORBS_T + (i if i < 1 else i - 1) * ORB_STEP
    add(S, glock(hz(rising[i]) * 2, 1.2, 0.035), at)
    add(S, whoosh(0.25, 0.02), at - 0.15)
c4.mute(BANANA_T - 0.1, L20_T + 1.8)
add(S, kazoo(hz("D3"), 0.35, 0.05), GOLD_T)
add(S, bwomp(hz("G#2"), 0.06, 0.6), GOLD_T + 0.05)
for k2, m in enumerate(("G#6", "B6", "D#7")):
    add(S, glock(hz(m), 1.0, 0.03), GOLD_T + 0.35 + k2 * 0.07)
add(S, pop(0.05), KIKO_ORANGE_T)
add(S, glock(hz("A#5"), 1.2, 0.04), KIKO_ORANGE_T + 0.1)
harp_gliss(S, OPEN_T, [n(x) for x in ("G#4", "B4", "D#5", "E5", "G#5", "B5", "D#6", "E6", "G#6")], step=0.05, vol=0.04)
add(S, reverse_swell(0.6, 0.04), OPEN_T - 0.6)
c4.put_at(brass(hz("B3"), 0.3, 0.035), L21_T + 0.2)
c4.put_at(brass(hz("E4"), 0.6, 0.035), L21_T + 0.5)
c4.render(M)

# =====================================================================
# CUE 5 "The Rainbow Heart" (77.4-94 s): emotional orchestral build to a magical climax. E-flat minor -> E-flat major, 70 BPM.
# Soft strings and choir, harp; a timpani roll and cymbal swell as everyone helps; full tutti when the heart shines.
# =====================================================================
c5 = Cue(CUT_5 - 0.2, CUT_6 + 0.2, bpm=70, fade_in=0.6, fade_out=0.6)
q = c5.beat
prog5 = [("Eb3", "Gb3", "Bb3"), ("Cb3", "Eb3", "Gb3"), ("Ab2", "Cb3", "Eb3"), ("Bb2", "D3", "F3")]
for b in range(4):
    at = 0.2 + b * 4 * q * 0.62
    ch = prog5[b]
    c5.put(strings([hz(x) for x in ch], 4 * q * 0.62 + 0.6, 0.032, attack=0.7, release=0.6, tone=2200), at)
for k in range(int((RING_T - CUT_5) / (q / 2))):
    c5.put(harp(hz(("Eb4", "Gb4", "Bb4", "Eb5", "Bb4", "Gb4")[k % 6]), 1.6, 0.02), 0.3 + k * q / 2)
for m, at, d in (("Bb4", L23_T + 0.1, 0.9), ("Eb5", L23_T + 1.0, 0.6), ("F5", L23_T + 1.6, 0.5), ("Gb5", L23_T + 2.1, 1.2)):
    c5.put_at(flute(hz(m), d, 0.028), at)
c5.put_at(choir([hz("Eb4"), hz("Bb4")], RESTORE_T - RING_T, 0.025, attack=1.0, release=0.4), RING_T)
c5.put_at(timp_roll(hz("Bb1"), RESTORE_T - RING_T, 0.06), RING_T)
c5.put_at(cymbal_swell(RESTORE_T - GLOW_T, 0.04), GLOW_T)
for k in range(int((RESTORE_T - RING_T) / (q / 4))):
    c5.put_at(strings([hz(("Bb3", "C4", "D4", "Eb4")[min(3, k // 6)])], q / 4, 0.022, attack=0.02, release=0.08, trem=10), RING_T + k * q / 4)
for i in range(7):
    add(S, ding(0.02), RING_T + i * 0.1)
add(S, fizzle(0.025, 0.4), FLAME_T)
add(S, chime(note_hz(63), 0.05), FLAME_T + 0.5)
add(S, squeak(0.04), TRIP_T)
add(S, pop(0.06), BURST_T)
sparkle(S, BURST_T, 0.6, density=20, vol=0.02)
c5.mute(L24_T - 0.1, RESTORE_T)                                          # silence on "Rainbow... shine!"
add(S, reverse_swell(1.2, 0.05), RESTORE_T - 1.2)
# RESTORE: tutti in E-flat major
add(S, boom(0.16), RESTORE_T)
add(S, crash(0.06), RESTORE_T)
c5.put_at(strings([hz(x) for x in ("Eb3", "G3", "Bb3", "Eb4", "G4")], CUT_6 - RESTORE_T + 0.3, 0.05, attack=0.05, release=0.8), RESTORE_T)
c5.put_at(choir([hz("G4"), hz("Bb4"), hz("Eb5")], 2.4, 0.04, attack=0.1, release=0.8), RESTORE_T)
for m, at, d in (("Eb4", 0, 0.4), ("G4", 0.4, 0.4), ("Bb4", 0.8, 0.4), ("Eb5", 1.2, 1.2)):
    c5.put_at(brass(hz(m), d, 0.045), RESTORE_T + at)
harp_gliss(S, RESTORE_T, [n(x) for x in ("Eb5", "G5", "Bb5", "Eb6", "G6", "Bb6", "Eb7")], step=0.05, vol=0.04)
sparkle(S, RESTORE_T, 2.2, density=22, vol=0.03)
c5.mute(L25_T - 0.4, L25_T + 3.3)                                        # let the joke land on its own
add(S, boing(0.04, 260), L25_T + 3.15)
c5.render(M)

# =====================================================================
# CUE 6 "Rainbow Celebration" (93.6-end): joyful and energetic. E major, 132 BPM, bright 4/4.
# Brass, strings, glockenspiel, claps and a bouncy bass; a dead stop for the prank and the stolen bite;
# then a music-box teaser in C-sharp minor, left unresolved.
# =====================================================================
c6 = Cue(CUT_6 - 0.2, PROJECT_T, bpm=132, fade_in=0.3, fade_out=0.5)
q = c6.beat
prog6 = [("E2", ("E4", "G#4", "B4")), ("C#2", ("C#4", "E4", "G#4")), ("A1", ("A3", "C#4", "E4")), ("B1", ("B3", "D#4", "F#4"))]
k = 0
while c6.t0 + 0.2 + k * q < PROJECT_T:
    at = 0.2 + k * q
    root, ch = prog6[(k // 4) % 4]
    c6.put(pizz(hz(root) * 2, 0.3, 0.09), at)
    if k % 2 == 1:
        c6.put(clap(0.025), at)
        c6.put(strings([hz(x) for x in ch], q * 0.6, 0.03, attack=0.02, release=0.15), at)
    if k % 4 == 0:
        c6.put(glock(hz(ch[2]) * 2, 1.2, 0.022), at)
    k += 1
for m, b0, d in (("B4", 0, 1), ("E5", 1, 1), ("G#5", 2, 2), ("F#5", 4, 1), ("E5", 5, 1), ("C#5", 6, 2), ("E5", 8, 1), ("F#5", 9, 1), ("G#5", 10, 2), ("B5", 12, 4)):
    c6.put(brass(hz(m), d * q * 0.9, 0.035), 0.3 + b0 * q)
harp_gliss(S, CUT_6, [n(x) for x in ("E5", "G#5", "B5", "E6", "G#6", "B6", "E7")], step=0.06, vol=0.04)
sparkle(S, CUT_6 + 0.2, 2.5, density=16, vol=0.025)
c6.mute(PRANK_T - 0.1, L26_T + 2.1)                                      # Kiko's sneaky prank, Pico vanishes
for k2, m in enumerate(("E3", "F#3", "G#3")):
    add(S, bassoon(hz(m), 0.12, 0.045), PRANK_T + k2 * 0.2)
color_blips(HIDE_T, 0.6, 5, 0.025)
add(S, whoosh(0.3, 0.04), HIDE_T + 0.1)
for k2 in range(3):                                                     # Pico giggles from the flower
    add(S, squeak(0.018), L26_T + 2.1 + k2 * 0.14)
for k2, m in enumerate(("E6", "G#6", "B6", "E7")):                       # the rainbow banana
    add(S, glock(hz(m), 1.2, 0.03), RBANANA_T + k2 * 0.07)
c6.mute(STEAL_T - 0.05, LAUGH_T)
add(S, chomp(0.08), STEAL_T)
add(S, record_scratch(0.04, 0.25), STEAL_T + 0.15)
for k2 in range(6):
    add(S, clap(0.02), LAUGH_T + k2 * 0.18)
c6.render(M)

# the teaser: a music box in an enchanted castle, C-sharp minor, unresolved
tz = Cue(PROJECT_T - 0.1, DUR, bpm=80, fade_in=0.2, fade_out=0.05)
q = tz.beat
tz.put(strings([hz(x) for x in ("C#3", "G#3", "E4")], DUR - PROJECT_T, 0.028, attack=1.0, release=0.4, tone=1800), 0.1)
mb = [("G#5", 0), ("C#6", 1), ("E6", 2), ("D#6", 3), ("C#6", 4), ("B5", 5), ("C#6", 6), ("G#5", 8), ("A5", 9), ("B5", 10), ("C#6", 11), ("D#6", 12), ("E6", 13), ("F#6", 14)]
for m, b0 in mb:
    tz.put(music_box(hz(m), 2.0, 0.05), 0.15 + b0 * q / 2)
tz.put_at(choir([hz("G#4"), hz("C#5")], DUR - L30_T, 0.02, attack=0.8, release=0.3), L30_T - 0.3)
for m, b0 in (("C#6", 0), ("E6", 1), ("G#6", 2), ("F#6", 3), ("D#6", 5)):
    tz.put_at(music_box(hz(m), 2.4, 0.045), END_T + b0 * 0.42)
tz.render(M)

# =====================================================================
# Sound effects and ambience
# =====================================================================
add(S, noise_band(CUT_1 + 0.3, 200, 1200, 0.006), 0.0)                   # forest air at the clock tower
for k in range(10):
    add(S, tick(0.01, k % 2 == 0), 0.3 + k * 0.5)
add(S, flutter_wings(0.9, 0.035), L1_T + 0.2)
add(S, whoosh(1.0, 0.08), JUMP_T)
add(S, reverse_swell(0.8, 0.05), CUT_1 - 0.8)
sparkle(S, CUT_1 - 0.5, 1.2, density=20, vol=0.03)
add(S, pop(0.06), LAND_T)
add(S, pomf(0.04), LAND_T + 0.15)
add(S, steady_wind(DUR - CUT_1, 0.012), CUT_1)                          # high, soft island wind the whole time
for at in (CUT_1 + 3.5, CUT_3 + 0.3, CUT_6 + 0.4):
    add(S, gust(1.6, 0.025), at)
for at in (12.2, 17.0, 19.6, 22.4):                                     # little clouds popping away from the bridge
    add(S, pomf(0.025), at)
    add(S, pop(0.02), at + 0.05)
add(S, squeak(0.03), BOBO_STEP_T)
add(S, glass(hz("C#6"), 1.2, 0.03), HOLE_T)
add(S, whoosh(0.4, 0.03), WIGGLE_T)
for k in range(4):
    add(S, pomf(0.02), WIGGLE_T + k * 0.15)
add(S, boing(0.05, 300), PEEK_T)
color_blips(PEEK_T + 0.05, 0.3, 2, 0.02)
for at in (FLOWER_T, FALLS_T, SUN_T):                                    # hops between islands on cloud steps
    add(S, whoosh(0.5, 0.04), at - 0.35)
    add(S, pomf(0.03), at)
add(S, noise_band(SUN_T - FALLS_T, 300, 3000, 0.008), FALLS_T)           # the (grey) waterfall
add(S, whoosh(0.5, 0.04), CUT_4)
add(S, whoosh(0.5, 0.04), CUT_5)
add(S, whoosh(1.2, 0.05), CUT_6)
add(S, boom(0.1), CUT_6 + 0.1)
add(S, noise_band(4.0, 400, 5000, 0.008), CUT_6 + 0.4)                   # rainbow light falls
wind_chimes(S, CUT_6 + 0.5, 2.0, vol=0.018, seed=31)
add(S, whoosh(0.6, 0.05), PROJECT_T - 0.2)
sparkle(S, PROJECT_T, 1.5, density=10, vol=0.02)
sparkle(S, END_T, 2.0, density=8, vol=0.015)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep13"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep13", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

t.finish(mouth_style="v2")
