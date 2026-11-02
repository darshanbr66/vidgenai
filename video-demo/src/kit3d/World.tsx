import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";

// Shared 3D building blocks (Three.js inside Remotion). Everything is driven by the frame
// number only, so every render of a frame is identical.

export const W = 1080;
export const H = 1920;

export type Cam3 = { pos: [number, number, number]; target: [number, number, number]; fov?: number };

// Places the camera for this frame
const CameraRig: React.FC<{ cam: Cam3 }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov ?? 40;
    c.near = 0.1;
    c.far = 600;
    c.aspect = W / H;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  });
  return null;
};

// Renders through a bloom + tone mapping + vignette chain instead of the plain renderer
const Post: React.FC<{ bloom: number; threshold: number }> = ({ bloom, threshold }) => {
  const { gl, scene, camera } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
    c.addPass(new RenderPass(scene, camera));
    const bloomFx = new BloomEffect({ intensity: bloom, luminanceThreshold: threshold, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.75 });
    c.addPass(new EffectPass(camera, bloomFx, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }), new VignetteEffect({ darkness: 0.45, offset: 0.3 }), new SMAAEffect()));
    c.setSize(W, H);
    return c;
  }, [gl, scene, camera, bloom, threshold]);
  useLayoutEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => composer.render(), 1);
  return null;
};

// A full-frame 3D layer. Put it under the SVG character layer.
export const World3D: React.FC<{ cam: Cam3; bloom?: number; threshold?: number; fog?: [string, number]; shadows?: boolean; children: React.ReactNode }> = ({
  cam,
  shadows = true,
  bloom = 1.2,
  threshold = 0.55,
  fog,
  children,
}) => (
  <ThreeCanvas
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0 }}
    shadows={shadows ? "soft" : false}
    gl={{ antialias: false, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
    camera={{ fov: cam.fov ?? 40, position: cam.pos, near: 0.1, far: 600 }}
  >
    <CameraRig cam={cam} />
    {fog && <fogExp2 attach="fog" args={[fog[0], fog[1]]} />}
    {children}
    <Post bloom={bloom} threshold={threshold} />
  </ThreeCanvas>
);

// Projects a world point into 1080x1920 screen space with the same camera, so SVG characters
// drawn over the 3D layer stay locked to the 3D ground as the camera moves.
export const project = (cam: Cam3, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 40, W / H, 0.1, 600);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p);
  const dist = v.distanceTo(c.position);
  v.project(c);
  // pixels per world unit at that depth, for scaling characters
  const ppu = H / (2 * Math.tan(((cam.fov ?? 40) * Math.PI) / 360) * dist);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, ppu, behind: v.z > 1 };
};

// Seeded random so layouts never change between renders
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
