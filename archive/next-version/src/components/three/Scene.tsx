"use client";

import { Canvas } from "@react-three/fiber";
import ParticleField from "./ParticleField";

/* ============================================================================
 *  WEBGL STAGE
 *  Fixed, full-viewport, sitting behind all content. Pointer events are OFF so
 *  the canvas never intercepts clicks — it reads the pointer passively via
 *  R3F's global pointer state, which still works through pointer-events: none.
 *
 *  Mounted through next/dynamic (ssr: false) in Hero.tsx — three.js touches
 *  `window` at import time and must never run on the server.
 * ========================================================================== */
export default function Scene() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
      data-anim="canvas"
      /* Starts invisible; the entrance timeline fades it up. See
       * MOTION.entrance.canvas + the `canvas` beat in Hero.tsx. */
      style={{ opacity: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 100 }}
        /* Cap DPR at 2 — beyond that you pay for pixels nobody can see. */
        dpr={[1, 2]}
        gl={{
          antialias: false, // points don't benefit from MSAA; this is free perf
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ParticleField />
      </Canvas>
    </div>
  );
}
