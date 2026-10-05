"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";

/* ============================================================================
 *  MAGNETIC
 *  ---------------------------------------------------------------------------
 *  Wraps any element and pulls it toward the cursor on PROXIMITY — the pull
 *  starts while the cursor is still approaching, not on hover. That pre-hover
 *  reaction is the entire effect; hover-triggered versions feel dead.
 *
 *  Two layers move at different rates (container + inner label) to create a
 *  parallax that sells depth.
 *
 *  ★ ALL PHYSICS LIVE IN  MOTION.magnetic  ★
 *    radius         — how close the cursor must get
 *    strength       — how far the element travels
 *    labelStrength  — extra drift on the inner label
 *    settle         — weight / how fast it chases
 *    release        — the spring back to origin
 * ========================================================================== */

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /* Per-instance overrides. A nav link should be subtler than a hero CTA — pass
   * `strength={0.2}` there and leave the CTA on the default. */
  radius?: number;
  strength?: number;
  labelStrength?: number;
};

export default function Magnetic({
  children,
  className = "",
  radius = MOTION.magnetic.radius,
  strength = MOTION.magnetic.strength,
  labelStrength = MOTION.magnetic.labelStrength,
}: MagneticProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const label = labelRef.current;
      if (!wrap || !label) return;

      /* Skip entirely on touch / coarse pointers and for reduced-motion users.
       * There is no cursor to be magnetic toward. */
      const fine = window.matchMedia("(pointer: fine)").matches;
      const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!fine || !ok) return;

      const cfg = MOTION.magnetic;

      /* quickTo builds a reusable, pre-compiled tween. Calling it every
       * pointermove is dramatically cheaper than creating a new gsap.to()
       * per event — this is what keeps the effect at 60fps. */
      const xTo = gsap.quickTo(wrap, "x", { duration: cfg.settle, ease: cfg.ease });
      const yTo = gsap.quickTo(wrap, "y", { duration: cfg.settle, ease: cfg.ease });
      const lxTo = gsap.quickTo(label, "x", { duration: cfg.settle, ease: cfg.ease });
      const lyTo = gsap.quickTo(label, "y", { duration: cfg.settle, ease: cfg.ease });

      let engaged = false;

      const onMove = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          /* Linear falloff: full strength at the centre, zero at the rim.
           * Without this the element would JUMP the instant the cursor crosses
           * the radius boundary. For a punchier, more abrupt magnet try:
           *   const falloff = Math.pow(1 - dist / radius, 0.6);
           */
          const falloff = 1 - dist / radius;

          xTo(dx * strength * falloff);
          yTo(dy * strength * falloff);

          /* The label travels FURTHER than its container. Subtract the
           * container's own movement so the value is a true offset. */
          const extra = strength * falloff * (labelStrength - 1);
          lxTo(dx * extra);
          lyTo(dy * extra);

          if (!engaged) {
            engaged = true;
            gsap.to(wrap, {
              scale: cfg.hoverScale,
              duration: cfg.settle,
              ease: cfg.ease,
            });
          }
        } else if (engaged) {
          /* RELEASE — deliberately elastic and slower than the attraction.
           * A snap back to zero reads as a bug; a spring reads as physics. */
          engaged = false;
          gsap.to([wrap, label], {
            x: 0,
            y: 0,
            duration: cfg.release,
            ease: cfg.releaseEase,
          });
          gsap.to(wrap, {
            scale: 1,
            duration: cfg.release,
            ease: cfg.releaseEase,
          });
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });

      /* Returning a cleanup fn from useGSAP is supported — gsap.context runs
       * it on unmount alongside reverting every tween created in this scope. */
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: wrapRef, dependencies: [radius, strength, labelStrength] }
  );

  return (
    <span
      ref={wrapRef}
      className={`inline-block will-change-transform ${className}`}
      /* Tells FluidCursor to swell the ring over this element. */
      data-cursor="hover"
    >
      <span ref={labelRef} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}
