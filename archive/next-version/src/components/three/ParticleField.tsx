"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MOTION, PALETTE } from "@/lib/motion";

/* ============================================================================
 *  AMBIENT PARTICLE FIELD
 *  ---------------------------------------------------------------------------
 *  A custom-shader THREE.Points cloud. Deliberately NOT using drei — a raw
 *  ShaderMaterial keeps the dependency surface small and gives us per-particle
 *  size, drift speed and depth falloff for the price of ~40 lines of GLSL.
 *
 *  Every tunable lives in MOTION.three.
 * ========================================================================== */

/* --- VERTEX ---------------------------------------------------------------
 * Handles the ambient drift, the scroll push, and perspective size falloff.
 * ------------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScroll;
  uniform float uDepthFade;

  attribute float aScale;   // per-particle size multiplier (0.3 – 1.0)
  attribute float aSpeed;   // per-particle drift rate, so nothing moves in lockstep

  varying float vAlpha;

  void main() {
    vec3 p = position;

    /* Organic breathing. Two out-of-phase waves seeded by the particle's own
     * position, so neighbours drift apart instead of pulsing as a sheet. */
    p.y += sin(uTime * aSpeed + p.x * 0.45) * 0.38;
    p.x += cos(uTime * aSpeed * 0.75 + p.z * 0.35) * 0.28;

    /* Scroll pushes the whole field toward the camera — a slow flythrough as
     * the visitor leaves the hero. Driven from JS, see useFrame below. */
    p.z += uScroll;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    /* Perspective attenuation: distant particles get smaller. Dividing by
     * -mv.z (positive in front of the camera) is the standard trick. */
    gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;

    /* Fade particles out as they approach the far plane, so the field has no
     * hard edge — it just dissolves into the navy. */
    vAlpha = smoothstep(uDepthFade, 0.0, -mv.z) * aScale;
  }
`;

/* --- FRAGMENT -------------------------------------------------------------
 * Turns each square point sprite into a soft round dot with a hot core.
 * No texture file required.
 * ------------------------------------------------------------------------ */
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    float halo = smoothstep(0.5, 0.0, d);   // soft outer falloff
    float core = smoothstep(0.16, 0.0, d);  // bright centre

    float a = (halo * 0.5 + core * 0.5) * vAlpha * uOpacity;
    if (a < 0.01) discard;                  // cheap early-out, saves overdraw

    gl_FragColor = vec4(uColor, a);
  }
`;

export default function ParticleField() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  /* Smoothed pointer + scroll state. We lerp toward the raw input every frame
   * rather than using it directly — that lag IS the premium feel. */
  const eased = useRef({ x: 0, y: 0, scroll: 0 });

  /* --- Geometry: generated once, never on re-render --------------------- */
  const { positions, scales, speeds } = useMemo(() => {
    const { count, spread } = MOTION.three;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      /* Cubed random on x biases particles toward the centre, leaving the
       * screen edges quieter so the headline always has clean space. */
      const r = Math.random() * 2 - 1;
      positions[i * 3 + 0] = Math.pow(Math.abs(r), 1.4) * Math.sign(r) * spread.x;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * spread.y;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * spread.z;

      scales[i] = 0.3 + Math.random() * 0.7;
      speeds[i] = 0.15 + Math.random() * 0.5;
    }

    return { positions, scales, speeds };
  }, []);

  /* --- Uniforms: stable object, mutated in useFrame (never re-created) --- */
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: MOTION.three.size },
      uPixelRatio: { value: 1 },
      uScroll: { value: 0 },
      uDepthFade: { value: MOTION.three.spread.z + 16 },
      uColor: { value: new THREE.Color(PALETTE.bone) },
      uOpacity: { value: MOTION.three.opacity },
    }),
    []
  );

  useFrame((state, delta) => {
    const { pointer, viewport, clock } = state;
    const cfg = MOTION.three;

    /* Keep point size correct on retina + on monitor changes. */
    uniforms.uPixelRatio.value = viewport.dpr;

    /* Ambient drift clock. driftSpeed=0 freezes the field. */
    uniforms.uTime.value = clock.elapsedTime * cfg.driftSpeed;

    /* --- Scroll → depth push ------------------------------------------- */
    const rawScroll =
      typeof window !== "undefined"
        ? Math.min(window.scrollY / window.innerHeight, 1.5)
        : 0;
    eased.current.scroll +=
      (rawScroll * cfg.scrollDepth - eased.current.scroll) * cfg.scrollEase;
    uniforms.uScroll.value = eased.current.scroll;

    /* --- Pointer → parallax tilt ---------------------------------------- */
    /* `pointer` is normalised -1..1 across the canvas. We ease toward it so
     * the field has inertia instead of snapping. */
    eased.current.x += (pointer.x - eased.current.x) * cfg.pointerEase;
    eased.current.y += (pointer.y - eased.current.y) * cfg.pointerEase;

    if (groupRef.current) {
      groupRef.current.rotation.y = eased.current.x * cfg.pointerTilt;
      groupRef.current.rotation.x = -eased.current.y * cfg.pointerTilt;
    }

    /* --- Slow structural rotation of the wireframe core ------------------ */
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * cfg.coreSpeed;
      coreRef.current.rotation.x += delta * cfg.coreSpeed * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          /* Additive blending makes overlapping particles bloom into each
           * other. On a dark navy ground this reads as light, not as paint. */
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* --- Floating wireframe structure ---------------------------------
          A slowly tumbling icosahedron far behind the particles. Reads as
          "architecture" without ever resolving into a recognisable object.
          Toggle with MOTION.three.showCore. */}
      {MOTION.three.showCore && (
        <mesh ref={coreRef} position={[0, 0, -9]} scale={7}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={PALETTE.bone}
            wireframe
            transparent
            opacity={MOTION.three.coreOpacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
