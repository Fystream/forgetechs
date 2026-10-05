"use client";

/* ----------------------------------------------------------------------------
 *  Central GSAP registration.
 *  Import gsap from HERE, never from "gsap" directly, so plugins are guaranteed
 *  to be registered exactly once before any component builds a timeline.
 *
 *  NOTE: requires GSAP >= 3.13, where SplitText / ScrollTrigger / CustomEase
 *  became free for everyone. `mask: "lines"` (used in Hero.tsx) is a 3.13 API.
 * -------------------------------------------------------------------------- */

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

/* ★ THE SIGNATURE EASE ★
 * One curve used across the whole entrance so every element decelerates with
 * the same personality. This is what makes a site feel authored rather than
 * assembled from defaults.
 *
 * These are cubic-bezier control points: x1, y1, x2, y2.
 *   "0.16, 1, 0.3, 1"    → hard launch, long luxurious glide (current)
 *   "0.22, 1, 0.36, 1"   → slightly softer entry
 *   "0.65, 0, 0.35, 1"   → symmetrical, more mechanical
 * Reference for the target feel: https://easings.net/#easeOutExpo
 */
CustomEase.create("signature", "0.16, 1, 0.3, 1");

/* Secondary ease for elements that need a touch of overshoot. */
CustomEase.create("signature-back", "0.34, 1.4, 0.44, 1");

export { gsap, useGSAP, ScrollTrigger, SplitText, CustomEase };
