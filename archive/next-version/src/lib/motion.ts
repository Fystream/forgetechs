/* ============================================================================
 *  MOTION CONFIG  —  THE TUNING DASHBOARD
 *  ---------------------------------------------------------------------------
 *  Every duration, ease, distance, stagger and physics constant in the hero
 *  lives in this one file. Components never hard-code a number.
 *
 *  If you want to change how the site *feels*, you change it here. Nowhere else.
 *
 *  START HERE →  MOTION.entrance.timeScale  (one dial, whole intro)
 * ========================================================================== */

export const MOTION = {
  /* ==========================================================================
   *  1. ENTRANCE TIMELINE
   *  The cinematic page-load sequence. Read alongside Hero.tsx, where these
   *  values are consumed by a single labelled master timeline.
   * ======================================================================== */
  entrance: {
    /* ★★★ MASTER SPEED DIAL ★★★
     * Multiplies the playback rate of the ENTIRE entrance timeline.
     *   1.0  = as authored
     *   1.4  = snappier / more confident
     *   0.7  = slower, heavier, more cinematic
     * Tweak this FIRST before touching individual durations. */
    timeScale: 1.0,

    /* Dead air before anything moves. Buys the fonts + WebGL a beat to settle,
     * and makes the reveal feel deliberate rather than reactive. */
    startDelay: 0.15,

    /* --- The curtain (full-bleed panel that wipes away to reveal the page) --- */
    curtain: {
      duration: 1.25,
      ease: "expo.inOut",
      /* How the curtain leaves. 'up' = slides off the top edge.
       * Try yPercent: 100 in Hero.tsx for a downward exit instead. */
      yPercent: -100,
    },

    /* --- Brand mark (top-left typographic logo) --- */
    logo: {
      duration: 1.0,
      y: 18, // px it rises from
      ease: "signature", // custom ease, registered in lib/gsap.ts
    },

    /* --- Navigation links --- */
    nav: {
      duration: 0.85,
      y: 14,
      stagger: 0.055, // gap between each link. Raise for a lazier cascade.
      ease: "signature",
    },

    /* --- Eyebrow / kicker line above the headline --- */
    eyebrow: {
      duration: 0.9,
      y: 12,
      ease: "signature",
    },

    /* --- THE HEADLINE. The hero moment. Masked line-by-line reveal. --- */
    headline: {
      duration: 1.3,
      /* Each line starts this far below its mask (110 = fully hidden + margin).
       * Below 100 and you'll see the line peeking before it animates. */
      yPercent: 112,
      /* Gap between headline lines. This single number does more for the
       * "expensive" feel than anything else in the file. 0.08–0.16 is the
       * sweet spot; higher reads as slow, lower reads as cheap. */
      stagger: 0.12,
      ease: "signature",
      /* Slight rotation on each line adds organic weight. 0 = dead flat. */
      rotate: 3,
    },

    /* --- Supporting paragraph --- */
    paragraph: {
      duration: 1.0,
      y: 16,
      ease: "signature",
    },

    /* --- Call-to-action cluster --- */
    cta: {
      duration: 0.9,
      y: 14,
      stagger: 0.08,
      ease: "signature",
    },

    /* --- Bottom spec row (the four capability cells) --- */
    specs: {
      duration: 0.95,
      y: 20,
      stagger: 0.075,
      ease: "signature",
    },

    /* --- Background hairline grid columns --- */
    grid: {
      duration: 1.8,
      stagger: 0.06,
      ease: "power3.inOut",
    },

    /* --- WebGL canvas fade-in --- */
    canvas: {
      duration: 2.2,
      ease: "power2.out",
    },

    /* ------------------------------------------------------------------
     *  BEATS — where each step STARTS on the master timeline.
     *  These are GSAP position parameters. Negative = overlap with the
     *  previous tween (things happen together). Positive = a gap.
     *
     *  "<"      → start when the previous tween starts
     *  "<0.2"   → 0.2s after the previous tween starts
     *  "-=0.8"  → 0.8s before the timeline currently ends (overlap)
     *
     *  Overlap is the whole trick. Sequential animation feels like a
     *  slideshow; overlapping animation feels choreographed.
     * ------------------------------------------------------------------ */
    beats: {
      curtain: 0, // t=0, the sequence opens here
      canvas: "<0.3", // WebGL starts fading up while the curtain is still moving
      grid: "<0.1",
      logo: "-=0.75", // brand appears before the curtain fully clears
      nav: "<0.15",
      eyebrow: "-=0.55",
      headline: "-=0.45", // headline overlaps the eyebrow — key to the flow
      paragraph: "-=0.85",
      cta: "-=0.7",
      specs: "-=0.75",
    },
  },

  /* ==========================================================================
   *  2. MAGNETIC CURSOR ATTRACTION
   *  Used by <Magnetic> to pull elements toward the pointer on proximity.
   * ======================================================================== */
  magnetic: {
    /* Detection radius in px, measured from the element's CENTRE.
     * The pull begins the moment the cursor enters this circle — it does NOT
     * wait for hover. That pre-hover pull is what reads as "alive".
     *   80  = tight, subtle, only near-misses register
     *   140 = generous, obvious, playful
     *   220 = elements start feeling twitchy across the layout */
    radius: 130,

    /* ★ MAGNETIC INTENSITY ★
     * Fraction of the cursor→centre offset the element travels.
     *   0.15 = barely-there premium restraint
     *   0.35 = confident, noticeable (default)
     *   0.6+ = cartoonish, elements fly off their grid position */
    strength: 0.35,

    /* Independent multiplier for the inner label, so text drifts FURTHER than
     * its container. This parallax between button and label is the detail that
     * separates a good magnetic button from a great one. 1.0 = no parallax. */
    labelStrength: 1.45,

    /* How long the element takes to reach its target position. This is the
     * "weight" of the physics.
     *   0.25 = light, immediate, electric
     *   0.6  = heavy, syrupy, luxurious (default)
     *   1.2  = laggy, dreamlike */
    settle: 0.55,

    /* Return-to-origin duration when the cursor leaves the radius.
     * Deliberately slower than `settle` — releasing should feel like a spring
     * relaxing, not a snap. */
    release: 0.9,
    releaseEase: "elastic.out(1, 0.4)",

    ease: "power3.out",

    /* Scale bump applied while the cursor is inside the radius. 1 = disabled. */
    hoverScale: 1.04,
  },

  /* ==========================================================================
   *  3. FLUID CURSOR + TRAIL
   *  Canvas-drawn tapering tail, plus a lagging ring and an instant dot.
   * ======================================================================== */
  cursor: {
    /* Number of segments in the tail. More = longer, smoother, heavier ribbon.
     *   12 = short flick   |   26 = default   |   50 = long liquid streamer */
    trailLength: 26,

    /* How aggressively the HEAD of the tail chases the real pointer.
     * 0..1. Higher = tighter tracking, less lag. */
    leadEase: 0.32,

    /* How each following segment chases the one ahead of it.
     * 0..1. LOWER = looser, more fluid, more rope-like. This is the single
     * value that controls how "liquid" the trail feels. */
    linkEase: 0.28,

    /* Stroke width at the head of the trail, in px. Tapers to 0 at the tail. */
    trailWidth: 5.5,

    /* Global opacity of the trail ribbon. Keep it low — the trail should be
     * felt more than seen. */
    trailAlpha: 0.5,

    /* Lag on the outer ring. Higher = the ring trails further behind the dot. */
    ringSettle: 0.45,
    ringSize: 34, // px diameter at rest
    ringHoverScale: 1.9, // scale when over an interactive element
    dotSize: 5,

    /* Duration of the ring's scale/state transitions. */
    stateDuration: 0.4,
  },

  /* ==========================================================================
   *  4. THREE.JS AMBIENT FIELD
   * ======================================================================== */
  three: {
    /* Particle count. Scale down for low-end devices.
     *   1200 = sparse and elegant
     *   2600 = default
     *   6000 = dense nebula (watch mobile GPUs) */
    count: 2600,

    /* Volume the particles occupy, in world units. z is depth toward camera. */
    spread: { x: 22, y: 13, z: 18 },

    /* Base point size before per-particle variation + depth attenuation. */
    size: 24,

    /* Overall opacity of the whole field. The field is atmosphere, not
     * content — it should sit just at the edge of perception. */
    opacity: 0.55,

    /* Speed of the ambient drift (the slow sine/cosine breathing).
     * 0 = a frozen starfield. 0.35 = default. 1.0 = agitated. */
    driftSpeed: 0.35,

    /* --- Mouse parallax --- */
    /* Max rotation (radians) the field tilts toward the pointer. */
    pointerTilt: 0.16,
    /* How fast the field catches up to the pointer. Lower = heavier, more
     * expensive-feeling drag. */
    pointerEase: 0.025,

    /* --- Scroll response --- */
    /* World units the field pushes toward camera over one viewport of scroll.
     * Creates a flythrough as the user leaves the hero. */
    scrollDepth: 7,
    scrollEase: 0.06,

    /* Slowly rotating wireframe structure behind the particles.
     * Set to false for a pure particle field. */
    showCore: true,
    coreSpeed: 0.045,
    coreOpacity: 0.13,
  },
} as const;

/* Brand colour tokens shared between CSS and WebGL. Keep in sync with
 * globals.css @theme — GLSL can't read CSS custom properties. */
export const PALETTE = {
  midnight: "#091529",
  bone: "#fdfdfd",
} as const;
