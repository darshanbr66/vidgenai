---
name: 3d-upgrade
description: "Since Episode 5 (2026-11-02) the series uses a 2.5D approach: Three.js 3D worlds inside Remotion with the original 2D SVG characters on top; why Blender was ruled out on this PC"
metadata:
  node_type: memory
  type: project
  originSessionId: fd00f0a2-7f91-4e84-8be6-07a266b2f2d2
  modified: 2026-11-02T09:32:16.125Z
---

Episode 5 (`ep05-moon-kingdom.mp4`, 50 s) was the first with real 3D. The shared kit lives in `video-demo/src/kit3d/` (World3D, sky, castle, magic, overlay), and Lumi Studio's `worker/guide.md` now tells future episodes how to use it. Episodes may now be 40–50 s; the limits in `audio_kit.py` and `inspect_video.py` were widened. Draco and Moonia have fixed voices in `voices.py` and `audio_kit.py`.

**Why:** the user asked for "cinematic 3D" with free tools. The PC is an i5-1235U with integrated Intel UHD graphics and 16 GB RAM, and has no NVIDIA card. Blender Cycles would take days per episode; Eevee would take hours and need a 1 GB install. Above all, the user's top rule is that Lumi, Bobo and Draco must look exactly the same, and 3D models would redesign them. Three.js in Remotion renders at about 0.15 s per frame (full episode about 4 min) with `--gl=angle`. `LUMI_GL=swangle` is the CPU fallback, about 2x slower.

**How to apply:** keep the characters 2D and pin them to 3D ground with `place()`. Don't suggest Blender or 3D character models unless the hardware changes. Watch contact sheets for cropping and for 3D props right in front of the camera. Related: [[youtube-video-series]], [[lumi-studio-app]].

Episode 6 (`ep06-underwater-kingdom.mp4`, 2026-11-02) rechecked the hardware (same i5-1235U, Intel UHD, no Blender) and stayed on Three.js. It added a reusable sea world in `src/ep06/world.tsx`: `seaMat()` gives every surface caustics plus a shared color-fade/color-wave uniform. It also added Coralie (`src/ep06/props.tsx`, voice `af_sarah` pitch 1.16, registered in `voices.py`/`audio_kit.py`) and `AirBubble` for characters underwater. Lessons: keep sand albedo low (white sand plus bloom washes out the frame), and check that group shots aren't parked next to big rocks that hide props.

Episode 7 (`ep07-snowflake-kingdom.mp4`) did the same with a snow world in `src/ep07/world.tsx`: `snowMat()` (sparkle and color fade), a PMREM environment made from a painted canvas so the ice reflects, and northern-light shader curtains. Lesson: snow scenes need a deep blue-hour palette (bluish snow albedo, dark hemisphere ground color) or everything turns white and the color-loss beat is lost.
