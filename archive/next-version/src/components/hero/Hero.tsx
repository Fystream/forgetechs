"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { MOTION } from "@/lib/motion";
import Nav from "./Nav";
import Magnetic from "@/components/ui/Magnetic";
import FluidCursor from "@/components/cursor/FluidCursor";

/* three.js touches `window` at import time — it must never render on the
 * server. ssr:false also keeps the WebGL bundle out of the critical path. */
const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

const WHATSAPP = "https://wa.me/919656916615";

/* Capability specs, not vanity metrics. These are commitments the studio can
 * actually honour today — swap for real counts (live sites, clients) the
 * moment those numbers exist and mean something. */
const SPECS = [
  { index: "01", value: "From ₹5,000", note: "One-time. Everything included." },
  { index: "02", value: "7 days", note: "Brief to live site." },
  { index: "03", value: "100% hand-coded", note: "No templates. No builders." },
  { index: "04", value: "Pulpally", note: "Wayanad, Kerala." },
] as const;

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);

  useGSAP(
    () => {
      const E = MOTION.entrance;
      const B = E.beats;

      /* --- Reduced motion: skip the choreography entirely ---------------- */
      /* Not a degraded version of the animation — no animation. Everything is
       * placed in its final state on the first paint. */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set('[data-anim]:not([data-anim="curtain"])', {
          opacity: 1,
          y: 0,
          scaleY: 1,
        });
        /* The headline is driven by a ref, not a data-anim hook, so it needs
         * its own reveal here — it starts `invisible` to prevent an unsplit
         * flash. autoAlpha handles visibility + opacity in one call. */
        gsap.set(headline.current, { autoAlpha: 1 });
        gsap.set('[data-anim="curtain"]', { display: "none" });
        return;
      }

      let ctx: gsap.Context | undefined;
      let cancelled = false;

      /* Wait for webfonts before SplitText measures line breaks. Splitting
       * against a fallback font produces line boxes that jump the moment the
       * real font swaps in — the single most common cause of broken masked
       * headline reveals. */
      document.fonts.ready.then(() => {
        if (cancelled || !headline.current) return;

        ctx = gsap.context(() => {
          /* `mask: "lines"` (GSAP 3.13+) wraps every line in its own
           * overflow-hidden div, so lines can slide up from nothing without us
           * writing a single wrapper element by hand. */
          splitRef.current = new SplitText(headline.current!, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
          });

          gsap.set(headline.current, { autoAlpha: 1 });

          /* ==============================================================
           *  MASTER ENTRANCE TIMELINE
           *  --------------------------------------------------------------
           *  ONE timeline owns the whole intro. Every step is placed with an
           *  explicit position parameter pulled from MOTION.entrance.beats,
           *  so the *choreography* is tunable independently of the *speeds*.
           *
           *  Mental model:
           *    duration (motion.ts)  → how long a step takes
           *    beat     (motion.ts)  → when that step starts
           *    timeScale             → global speed of everything
           *
           *  Debugging tip: `tl.progress(0.4)` in the console scrubs the
           *  whole sequence to 40% so you can inspect any frame.
           * ============================================================== */
          const tl = gsap.timeline({
            defaults: { ease: E.logo.ease },
            delay: E.startDelay,
          });

          /* ★ ONE DIAL FOR THE ENTIRE INTRO ★ */
          tl.timeScale(E.timeScale);

          /* --- BEAT 1 · CURTAIN — the reveal wipe --------------------- */
          tl.to(
            '[data-anim="curtain"]',
            {
              yPercent: E.curtain.yPercent,
              duration: E.curtain.duration,
              ease: E.curtain.ease,
            },
            B.curtain
          )

            /* --- BEAT 2 · WEBGL — fades up UNDER the departing curtain,
             * so the field is already breathing when it's revealed rather
             * than popping in afterwards. --------------------------------- */
            .to(
              '[data-anim="canvas"]',
              {
                opacity: 1,
                duration: E.canvas.duration,
                ease: E.canvas.ease,
              },
              B.canvas
            )

            /* --- BEAT 3 · GRID — hairline columns draw downward --------- */
            .fromTo(
              '[data-anim="grid-line"]',
              { scaleY: 0 },
              {
                scaleY: 1,
                duration: E.grid.duration,
                stagger: E.grid.stagger,
                ease: E.grid.ease,
              },
              B.grid
            )

            /* --- BEAT 4 · BRAND ---------------------------------------- */
            .fromTo(
              '[data-anim="logo"]',
              { opacity: 0, y: E.logo.y },
              { opacity: 1, y: 0, duration: E.logo.duration, ease: E.logo.ease },
              B.logo
            )

            /* --- BEAT 5 · NAV ------------------------------------------ */
            .fromTo(
              '[data-anim="nav-link"]',
              { opacity: 0, y: E.nav.y },
              {
                opacity: 1,
                y: 0,
                duration: E.nav.duration,
                stagger: E.nav.stagger,
                ease: E.nav.ease,
              },
              B.nav
            )

            /* --- BEAT 6 · EYEBROW -------------------------------------- */
            .fromTo(
              '[data-anim="eyebrow"]',
              { opacity: 0, y: E.eyebrow.y },
              {
                opacity: 1,
                y: 0,
                duration: E.eyebrow.duration,
                ease: E.eyebrow.ease,
              },
              B.eyebrow
            )

            /* --- BEAT 7 · HEADLINE — the moment ------------------------
             * Each masked line lifts from below with a slight rotation. The
             * stagger here (MOTION.entrance.headline.stagger) is the most
             * expensive-feeling number on the page. Treat it carefully. */
            .fromTo(
              splitRef.current.lines,
              { yPercent: E.headline.yPercent, rotate: E.headline.rotate },
              {
                yPercent: 0,
                rotate: 0,
                duration: E.headline.duration,
                stagger: E.headline.stagger,
                ease: E.headline.ease,
              },
              B.headline
            )

            /* --- BEAT 8 · PARAGRAPH ------------------------------------ */
            .fromTo(
              '[data-anim="paragraph"]',
              { opacity: 0, y: E.paragraph.y },
              {
                opacity: 1,
                y: 0,
                duration: E.paragraph.duration,
                ease: E.paragraph.ease,
              },
              B.paragraph
            )

            /* --- BEAT 9 · CTAs ----------------------------------------- */
            .fromTo(
              '[data-anim="cta"]',
              { opacity: 0, y: E.cta.y },
              {
                opacity: 1,
                y: 0,
                duration: E.cta.duration,
                stagger: E.cta.stagger,
                ease: E.cta.ease,
              },
              B.cta
            )

            /* --- BEAT 10 · SPEC ROW ------------------------------------ */
            .fromTo(
              '[data-anim="spec"]',
              { opacity: 0, y: E.specs.y },
              {
                opacity: 1,
                y: 0,
                duration: E.specs.duration,
                stagger: E.specs.stagger,
                ease: E.specs.ease,
              },
              B.specs
            );
        }, root);
      });

      return () => {
        cancelled = true;
        splitRef.current?.revert();
        ctx?.revert();
      };
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative">
      <FluidCursor />
      <Scene />

      {/* ================= CURTAIN =================
          Sits above everything, slides off on load. Solid navy so there is no
          flash of unstyled content while fonts and WebGL initialise. */}
      <div
        data-anim="curtain"
        className="fixed inset-0 z-[90] flex items-end justify-between bg-midnight px-6 pb-8 md:px-10"
      >
        <span className="label text-bone-28">Codes&#8212;it</span>
        <span className="label text-bone-28">Wayanad, IN</span>
      </div>

      <section className="relative flex min-h-svh flex-col overflow-hidden">
        {/* ================= HAIRLINE GRID =================
            Five vertical rules at 3% opacity. Invisible until you look for
            them, but they're why the layout feels anchored rather than
            floating. Every element below snaps to this rhythm. */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              data-anim="grid-line"
              /* Hidden below md — on a phone the rules crowd the type instead
                 of supporting it. */
              className="absolute top-0 hidden h-full w-px origin-top scale-y-0 bg-bone-06 md:block"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        {/* Radial vignette: lifts the centre, sinks the corners, keeps the
            particle field from competing with the headline. */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 45%, transparent 20%, rgba(9,21,41,0.55) 70%, rgba(9,21,41,0.9) 100%)",
          }}
          aria-hidden="true"
        />

        <Nav />

        {/* ================= HERO BODY ================= */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pt-32 pb-10 md:px-10 md:pt-36">
          {/* --- Eyebrow --- */}
          <div
            data-anim="eyebrow"
            className="mb-8 flex items-center gap-4 opacity-0 md:mb-10"
          >
            {/* Live dot. The only non-white accent in the hero, and it's
                earned — it signals availability. */}
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bone opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bone" />
            </span>
            <span className="label text-bone-45">
              Independent Web Studio &#183; Available for work
            </span>
          </div>

          {/* --- HEADLINE ---
              Starts invisible; SplitText masks each line, then the timeline
              lifts them. `text-[clamp()]` means the type scales fluidly with
              the viewport instead of snapping at breakpoints. */}
          <h1
            ref={headline}
            className="invisible max-w-[16ch] text-[clamp(2.75rem,9vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.045em]"
          >
            Small business.
            <br />
            <span className="text-sheen">Serious</span>{" "}
            {/* Instrument Serif is loaded italic-only — the <em> carries the
                voice switch that the wordmark established. */}
            <em className="font-serif font-normal italic tracking-[-0.02em] text-bone-70">
              website.
            </em>
          </h1>

          {/* --- Supporting copy + CTAs --- */}
          <div className="mt-10 flex flex-col gap-10 md:mt-14 md:flex-row md:items-end md:justify-between md:gap-16">
            <p
              data-anim="paragraph"
              className="max-w-[46ch] text-[15px] leading-relaxed text-bone-70 opacity-0 md:text-[17px]"
            >
              I&#8217;m <span className="text-bone">Falah</span>. I design and
              build every site by hand from Pulpally, Wayanad &#8212; fast,
              clean and search-ready &#8212; for the clinics, shops and
              homestays that keep Kerala running. No templates. No page
              builders. No bloat.
            </p>

            <div className="flex flex-shrink-0 items-center gap-6">
              {/* Primary CTA */}
              <div data-anim="cta" className="opacity-0">
                <Magnetic radius={150} strength={0.4}>
                  <a
                    href="#contact"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-bone px-7 py-4 text-[14px] font-medium tracking-[-0.01em] text-midnight"
                  >
                    <span className="relative">Start a project</span>
                    {/* Arrow slides right on hover — the smallest possible
                        signal of forward motion. */}
                    <span className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                      &#8594;
                    </span>
                  </a>
                </Magnetic>
              </div>

              {/* Secondary CTA — WhatsApp is how business actually gets done
                  here, so it sits at equal visual weight, not buried. */}
              <div data-anim="cta" className="opacity-0">
                <Magnetic radius={120} strength={0.32}>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block py-2 text-[14px] tracking-[-0.01em] text-bone-70 transition-colors duration-500 hover:text-bone"
                  >
                    Start on WhatsApp
                    <span className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-100 bg-bone-28 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-0" />
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SPEC ROW =================
            Four capability cells on the hairline grid. Honest specs — what the
            studio commits to — rather than invented traction numbers. */}
        <div className="relative z-10 border-t border-bone-06 px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {SPECS.map((spec, i) => (
              <div
                key={spec.index}
                data-anim="spec"
                className={`group flex flex-col gap-2 py-6 opacity-0 md:py-7 ${
                  i > 0 ? "md:border-l md:border-bone-06 md:pl-8" : ""
                } ${i % 2 === 1 ? "border-l border-bone-06 pl-5 md:pl-8" : ""}`}
              >
                <span className="label text-bone-28 transition-colors duration-500 group-hover:text-bone-70">
                  {spec.index}
                </span>
                <span className="text-[17px] tracking-[-0.02em] text-bone md:text-[20px]">
                  {spec.value}
                </span>
                <span className="text-[12px] leading-snug text-bone-45 md:text-[13px]">
                  {spec.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
