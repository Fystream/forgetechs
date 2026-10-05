"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, PALETTE } from "@/lib/motion";

/* ============================================================================
 *  FLUID CURSOR
 *  ---------------------------------------------------------------------------
 *  Three layers, each moving at a different rate — that difference is what
 *  makes it feel like a substance rather than three divs:
 *
 *    1. TRAIL  — a canvas-drawn tapering ribbon. A chain of points where each
 *                eases toward the one ahead of it (verlet-ish rope).
 *    2. RING   — lags behind the pointer, swells over interactive elements.
 *    3. DOT    — tracks the pointer near-instantly, the "true" position.
 *
 *  Auto-disables on coarse pointers and for prefers-reduced-motion.
 *
 *  ★ ALL PHYSICS LIVE IN  MOTION.cursor  ★
 *    linkEase   — how liquid the ribbon is (lower = looser)
 *    leadEase   — how tightly the head chases the pointer
 *    trailLength / trailWidth / trailAlpha — the ribbon's shape
 * ========================================================================== */

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Enable the CSS that hides the native cursor, but only once we've confirmed
   * this device actually gets our custom one. */
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !ok) return;

    document.body.dataset.customCursor = "on";
    return () => {
      delete document.body.dataset.customCursor;
    };
  }, []);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      const root = rootRef.current;
      if (!canvas || !ring || !dot || !root) return;

      const fine = window.matchMedia("(pointer: fine)").matches;
      const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!fine || !ok) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cfg = MOTION.cursor;
      gsap.set(root, { autoAlpha: 1 });

      /* --- Canvas sizing (DPR-aware) ------------------------------------ */
      let dpr = 1;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);

      /* --- State --------------------------------------------------------- */
      const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      /* The rope. Every segment starts stacked at the centre and unspools on
       * the first pointer move. */
      const trail = Array.from({ length: cfg.trailLength }, () => ({
        x: pointer.x,
        y: pointer.y,
      }));

      /* Ring/dot positioning uses quickTo so GSAP owns the transform and we
       * never fight it from RAF. */
      const ringX = gsap.quickTo(ring, "x", {
        duration: cfg.ringSettle,
        ease: "power3.out",
      });
      const ringY = gsap.quickTo(ring, "y", {
        duration: cfg.ringSettle,
        ease: "power3.out",
      });
      const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });

      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        ringX(e.clientX);
        ringY(e.clientY);
        dotX(e.clientX);
        dotY(e.clientY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      /* --- Interactive-element state ------------------------------------- */
      /* Anything marked data-cursor="hover" (every <Magnetic>, plus links)
       * swells the ring and hollows the dot. */
      const onOver = (e: PointerEvent) => {
        const target = (e.target as HTMLElement)?.closest?.('[data-cursor="hover"]');
        gsap.to(ring, {
          scale: target ? cfg.ringHoverScale : 1,
          borderColor: target
            ? "rgba(253,253,253,0.9)"
            : "rgba(253,253,253,0.35)",
          duration: cfg.stateDuration,
          ease: "power3.out",
        });
        gsap.to(dot, {
          scale: target ? 0 : 1,
          duration: cfg.stateDuration,
          ease: "power3.out",
        });
      };
      window.addEventListener("pointerover", onOver, { passive: true });

      /* Hide the whole rig when the pointer leaves the window. */
      const onLeave = () => gsap.to(root, { autoAlpha: 0, duration: 0.3 });
      const onEnter = () => gsap.to(root, { autoAlpha: 1, duration: 0.3 });
      document.addEventListener("pointerleave", onLeave);
      document.addEventListener("pointerenter", onEnter);

      /* --- The render loop ------------------------------------------------ */
      const render = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        /* Head of the rope chases the real pointer. */
        trail[0].x += (pointer.x - trail[0].x) * cfg.leadEase;
        trail[0].y += (pointer.y - trail[0].y) * cfg.leadEase;

        /* Every other segment chases the one in front of it. This single loop
         * is the whole fluid effect — lower linkEase, looser rope. */
        for (let i = 1; i < trail.length; i++) {
          trail[i].x += (trail[i - 1].x - trail[i].x) * cfg.linkEase;
          trail[i].y += (trail[i - 1].y - trail[i].y) * cfg.linkEase;
        }

        /* Draw segment-by-segment so width and alpha can taper toward the tail.
         * Quadratic curves through segment midpoints keep the ribbon smooth
         * instead of faceted. */
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < trail.length - 1; i++) {
          const t = 1 - i / trail.length; // 1 at head → 0 at tail

          const xc = (trail[i].x + trail[i + 1].x) / 2;
          const yc = (trail[i].y + trail[i + 1].y) / 2;

          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);

          ctx.lineWidth = cfg.trailWidth * t;
          /* t² fades the tail faster than it thins, which stops the end of the
           * ribbon looking like a hard-cut sliver. */
          ctx.strokeStyle = `rgba(253, 253, 253, ${cfg.trailAlpha * t * t})`;
          ctx.stroke();
        }

        raf = requestAnimationFrame(render);
      };

      let raf = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("pointerenter", onEnter);
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[100] opacity-0"
      aria-hidden="true"
    >
      {/* Ribbon. `screen` blend keeps it luminous over the navy without ever
          punching a hole in the typography. */}
      <canvas ref={canvasRef} className="absolute inset-0 mix-blend-screen" />

      {/* Lagging ring. -50% margins centre it on its own transform origin so
          GSAP's x/y can be raw viewport coordinates. */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border will-change-transform"
        style={{
          width: MOTION.cursor.ringSize,
          height: MOTION.cursor.ringSize,
          marginLeft: -MOTION.cursor.ringSize / 2,
          marginTop: -MOTION.cursor.ringSize / 2,
          borderColor: "rgba(253,253,253,0.35)",
        }}
      />

      {/* Instant dot. */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          width: MOTION.cursor.dotSize,
          height: MOTION.cursor.dotSize,
          marginLeft: -MOTION.cursor.dotSize / 2,
          marginTop: -MOTION.cursor.dotSize / 2,
          backgroundColor: PALETTE.bone,
        }}
      />
    </div>
  );
}
