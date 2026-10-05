"use client";

import Magnetic from "@/components/ui/Magnetic";

/* ============================================================================
 *  TYPOGRAPHIC WORDMARK
 *  ---------------------------------------------------------------------------
 *  No image, no SVG, no imported logo — the mark IS type, built from three
 *  deliberate moves:
 *
 *    1. WEIGHT + TRACKING CONTRAST — "CODES" set tight and medium, so it reads
 *       as engineered; the hyphen opened up and dropped to 28% opacity so it
 *       behaves as a hinge rather than a character.
 *    2. VOICE SWITCH — "IT" in Instrument Serif italic. One editorial gesture
 *       against an otherwise technical mark. This is the whole logo.
 *    3. SHEEN MASK — a gradient clipped to the text (.text-sheen) that dips to
 *       62% opacity mid-word, so the mark catches light like foil stamping.
 *
 *  Scales purely with font-size — set one value on the parent and the entire
 *  lockup, including the studio line, stays in proportion.
 * ========================================================================== */

export default function Logo() {
  return (
    <Magnetic
      /* The mark is small, so it needs a tighter radius and a gentler pull than
       * a full-size CTA — otherwise it drifts out of the header's optical grid. */
      radius={100}
      strength={0.28}
      labelStrength={1.3}
      className="origin-left"
    >
      <a
        href="#"
        aria-label="Codes-It — home"
        className="group flex items-baseline gap-[0.1em] text-[17px] leading-none no-underline"
      >
        <span className="text-sheen font-medium uppercase tracking-[-0.015em]">
          Codes
        </span>

        {/* The hinge. Opened tracking + low opacity turns punctuation into
            architecture. */}
        <span className="mx-[0.06em] font-light text-bone-28">&#8212;</span>

        {/* The voice switch. Slightly larger optical size because italic serif
            reads smaller than sans at the same px value. */}
        <span className="text-sheen font-serif text-[19px] italic">it</span>

        {/* Registration tick. Pure detail — signals a considered identity. */}
        <span className="label ml-[0.5em] translate-y-[-0.55em] text-[8px] text-bone-28 transition-colors duration-500 group-hover:text-bone-70">
          IN
        </span>
      </a>
    </Magnetic>
  );
}
