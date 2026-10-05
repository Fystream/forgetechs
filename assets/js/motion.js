/* ============================================================================
 *  MOTION CONFIG  —  THE TUNING DASHBOARD
 *  ---------------------------------------------------------------------------
 *  Every duration, ease, distance, stagger and physics constant on the site
 *  lives in this one file. No other file hard-codes a number.
 *
 *  If you want to change how the site *feels*, you change it here. Nowhere else.
 *
 *  START HERE →  MOTION.entrance.timeScale  (one dial, whole intro)
 *
 *  ── THE SPEED PASS (October 2026) ────────────────────────────────────────
 *  Everything below was retuned for one brief: no lag, it should feel fast.
 *  The old values were tuned for "luxurious" — heavy magnets, an elastic
 *  release, a cursor ring that trailed the pointer, a curtain that held the
 *  click for 0.4s. Each was a small, deliberate delay; together they made the
 *  site feel like it was catching up with you. The rules now:
 *    - anything answering a click or a hover stays under ~0.3s, ease-out
 *    - nothing trails the pointer on purpose
 *    - the intro gets out of the way: the page is readable in well under a
 *      second and the call to action is never waiting on decoration
 *  If you slow something back down, have a reason the visitor would agree with.
 *
 *  Loaded as a plain <script> before every other site script. Everything hangs
 *  off the single global `CI` so nothing leaks into window.
 * ========================================================================== */

window.CI = window.CI || {};

CI.MOTION = {
  /* ==========================================================================
   *  1. ENTRANCE TIMELINE
   *  The page-load sequence. Read alongside site.js, where these values are
   *  consumed by a single labelled master timeline.
   * ======================================================================== */
  entrance: {
    /* ★★★ MASTER SPEED DIAL ★★★
     * Multiplies the playback rate of the ENTIRE entrance timeline. Every
     * duration and beat below is divided by this.
     *   1.0  = as authored (slow, cinematic)
     *   1.5  = what it used to be
     *   2.2  = current: brisk — readable in well under a second
     *   3.0  = barely an intro at all
     * Tweak this FIRST before touching individual durations. */
    timeScale: 2.2,

    /* Dead air before anything moves. None: someone who clicked to get here
     * has already decided to be here. */
    startDelay: 0,

    /* Longest the intro will wait for the webfonts before starting anyway
     * (seconds). This wait holds the whole page behind the curtain, so it is
     * the single largest piece of felt lag on arrival. Was 1.5. Inter Tight is
     * preloaded and the headline split is reverted after the intro, so a late
     * font can no longer leave broken line breaks behind. */
    fontWait: 0.45,

    /* --- The curtain (full-bleed panel that wipes away to reveal the page) --- */
    curtain: {
      duration: 1.25,
      ease: 'expo.inOut',
      /* How the curtain leaves. -100 = slides off the top edge.
       * Use 100 for a downward exit instead. */
      yPercent: -100,
    },

    /* --- Brand mark (top-left typographic logo) --- */
    logo: { duration: 1.0, y: 18, ease: 'signature' },

    /* --- Navigation links --- */
    nav: {
      duration: 0.85,
      y: 14,
      stagger: 0.055, // gap between each link. Raise for a lazier cascade.
      ease: 'signature',
    },

    /* --- Eyebrow / kicker line above the headline --- */
    eyebrow: { duration: 0.9, y: 12, ease: 'signature' },

    /* --- THE HEADLINE. The hero moment. Masked line-by-line reveal. --- */
    headline: {
      duration: 1.3,
      /* Each line starts this far below its mask (112 = fully hidden + margin).
       * Below 100 and you'll see the line peeking before it animates. */
      yPercent: 112,
      /* Gap between headline lines. 0.08–0.16 is the sweet spot; higher reads
       * as slow, lower reads as cheap. */
      stagger: 0.12,
      ease: 'signature',
      /* Slight rotation on each line adds organic weight. 0 = dead flat. */
      rotate: 3,
    },

    paragraph: { duration: 1.0, y: 16, ease: 'signature' },

    /* --- Hero imagery (the screenshot + its floating cards) ---
     * The image lifts and settles from a slight scale-down, then the cards
     * pop in after it. */
    media: { duration: 1.5, y: 42, scale: 0.94, ease: 'signature' },
    cards: { duration: 0.8, y: 14, scale: 0.9, stagger: 0.1, ease: 'signature-back' },
    cta: { duration: 0.9, y: 14, stagger: 0.08, ease: 'signature' },
    specs: { duration: 0.95, y: 20, stagger: 0.06, ease: 'signature' },
    grid: { duration: 1.8, stagger: 0.06, ease: 'power3.inOut' },
    canvas: { duration: 2.2, ease: 'power2.out' },

    /* --- THE HERO BUILD (homepage only) -----------------------------------
     * The screenshot assembles itself inside its browser frame: the address
     * types in, a wireframe draws, then the real page wipes down over it.
     * It runs in parallel with the headline rather than after it, so the
     * paragraph and the CTA never wait on it. Seconds here are BEFORE
     * entrance.timeScale — at 2.2 the whole build is about a second. */
    build: {
      /* After the frame starts to rise. */
      delay: 0.3,
      /* omegadental.in, character by character. */
      type: 0.45,
      /* Wireframe bars drawing left to right, staggered top to bottom. */
      skeleton: { duration: 0.4, stagger: 0.035, ease: 'signature' },
      /* Pause on the finished wireframe, just long enough to register. */
      hold: 0.08,
      /* The real page wiping down over the wireframe. Moving across the
       * screen, so ease-in-out rather than ease-out. */
      wipe: { duration: 0.7, ease: 'expo.inOut' },
      /* Wireframe fading out underneath the end of the wipe. */
      skeletonOut: 0.25,
      /* How far before the wipe finishes the glass cards start landing. */
      cardsOverlap: 0.2,
    },

    /* ------------------------------------------------------------------
     *  BEATS — where each step STARTS on the master timeline.
     *  GSAP position parameters. Negative = overlap with the previous tween.
     *
     *  "<"      → start when the previous tween starts
     *  "<0.2"   → 0.2s after the previous tween starts
     *  "-=0.8"  → 0.8s before the timeline currently ends (overlap)
     * ------------------------------------------------------------------ */
    beats: {
      curtain: 0, // t=0, the sequence opens here
      canvas: '<0.3',
      grid: '<0.1',
      logo: '-=0.75', // brand appears before the curtain fully clears
      nav: '<0.15',
      eyebrow: '-=0.55',
      headline: '-=0.45', // headline overlaps the eyebrow — key to the flow
      media: '<0.25', // image rises alongside the headline, not after it
      paragraph: '-=1.05',
      cta: '-=0.7',
      cards: '-=0.55',
      specs: '-=0.75',
    },
  },

  /* ==========================================================================
   *  2. PAGE TRANSITIONS  (multi-page navigation)
   *  The curtain drops before leaving, lifts on arrival.
   * ======================================================================== */
  transition: {
    /* How long the curtain takes to cover the screen BEFORE the browser is
     * even allowed to start loading the next page. Every millisecond here is
     * pure wait added to every click. Was 0.36s plus a 0.03s hold. */
    outDuration: 0.2,
    outEase: 'expo.inOut',
    holdBeforeNav: 0,
  },

  /* ==========================================================================
   *  3. SCROLL REVEALS
   * ======================================================================== */
  reveal: {
    duration: 0.45,
    y: 14,
    stagger: 0.035,
    ease: 'signature',
    /* Fires as soon as the element's top crosses 94% down the viewport — i.e.
     * almost as soon as it appears. It used to wait for 85%, so on a quick
     * scroll content arrived visibly late, which reads as the page lagging. */
    start: 'top 94%',
  },

  /* ==========================================================================
   *  4. MAGNETIC BUTTONS
   * ======================================================================== */
  magnetic: {
    /* Detection radius in px, measured from the element's CENTRE. */
    radius: 110,

    /* Fraction of the cursor→centre offset the element travels.
     * Elements may override this with data-mag-strength in the HTML. */
    strength: 0.25,

    /* Multiplies EVERY magnet's strength, including the per-element
     * data-mag-strength values in the HTML, so the whole site can be dialled
     * down from one place. 1 = as authored. The pull is kept, but subtle: a
     * button that slides far from where you aimed reads as lag. */
    strengthScale: 0.6,

    /* Extra drift for the inner label. 1.0 = none. */
    labelStrength: 1.15,

    /* How long the element takes to reach its target. This IS the lag.
     * Was 0.55 ("heavy, syrupy"). At 0.18 it keeps up with the pointer. */
    settle: 0.18,

    /* Return to rest. Was 0.9s with an elastic wobble — a button still
     * bouncing after you have moved on is the definition of lag. */
    release: 0.3,
    releaseEase: 'power3.out',

    ease: 'power3.out',
    hoverScale: 1.02, // scale bump while inside the radius. 1 = disabled.

    /* Press feedback. Fast down, a little slower up. */
    pressScale: 0.96,
    pressDown: 0.08,
    pressUp: 0.18,
  },

  /* ==========================================================================
   *  5. CURSOR — REMOVED
   *  A custom ring-and-dot cursor used to live here (cursor.js). The ring was
   *  built to trail the pointer — `ringSettle` literally set how far behind it
   *  lagged — and it replaced the system cursor, which never lags. Removed on
   *  request in October 2026, along with cursor.js and its CSS.
   * ======================================================================== */

  /* ==========================================================================
   *  INTERFACE RESPONSES
   *  Things that answer a direct action. All under ~0.35s, all ease-out.
   * ======================================================================== */

  /* FAQ accordion. Opening is an entrance, so ease-out: it moves the instant
   * you click. Was 0.55s ease-in-out, which spends its first frames barely
   * moving — exactly when you are watching for a response. */
  accordion: {
    open: 0.32,
    close: 0.24,
    ease: 'power3.out',
  },

  /* Mobile menu panel and its links. */
  mobileNav: {
    open: 0.38,
    close: 0.26,
    ease: 'expo.out',
    linkY: 12, // px each link rises from
    linkDuration: 0.34,
    linkStagger: 0.03,
    linkDelay: 0.08, // after the panel starts — was 0.25
  },

  /* Stat counters rolling up when scrolled into view. */
  counter: {
    duration: 0.9, // was 1.6
    ease: 'power3.out',
    start: 'top 94%',
  },

  /* ==========================================================================
   *  FLOURISHES
   *  All transform-only, all off for reduced-motion and touch.
   * ======================================================================== */
  flourish: {
    /* --- 3D tilt on the hero screenshot --- */
    tilt: {
      /* Maximum rotation in degrees at the far edge of the card. */
      max: 7,
      /* How fast the card chases the pointer, 0..1 per frame. Was 0.16, which
       * visibly trailed. 0.3 tracks the hand. */
      ease: 0.3,
      scale: 1.015, // slight lift toward the viewer on hover
      baseRotate: 0.7, // the resting tilt the card already had
      /* How fast it settles once the pointer leaves. Was 0.06. */
      restEase: 0.14,
    },

    /* --- Marquee reacting to scroll velocity --- */
    marquee: {
      boost: 0.055, // extra playback rate per pixel of scroll velocity
      maxRate: 7, // hard ceiling on playback rate
      maxSkew: 5, // degrees of lean at full tilt
      decay: 0.85, // how quickly it returns to normal, 0..1. Was 0.9.
    },

    /* --- Cursor spotlight inside the dark panels --- */
    spotlight: {
      ease: 0.3, // how closely the glow follows the pointer. Was 0.16.
    },

    /* --- Pointer parallax on the hero cards ---
     * Each [data-depth] element drifts toward the pointer by up to its own
     * data-depth in px. Different depths are what make it read as layers. */
    parallax: {
      ease: 0.16, // how quickly a card catches up, 0..1 per frame
      /* How far beyond the hero stage (in half-widths) the pointer still
       * pulls. Past this the cards drift home rather than stopping dead. */
      reach: 1.6,
    },

    /* --- Glowing edge on the light panels and pricing tiers --- */
    glow: {
      /* px outside the card at which the edge wakes up. */
      proximity: 64,
      /* Half-width of the lit arc, in degrees. 20 = a glint, 60 = a wash. */
      spread: 34,
      /* How fast the arc chases the pointer's angle. Was 0.09 — a slow glide
       * that read as the arc lagging behind the cursor. */
      ease: 0.2,
    },
  },

  /* ==========================================================================
   *  PROCESS RAIL BEAM
   *  A gold beam fills the rail as the steps scroll past.
   * ======================================================================== */
  rail: {
    start: 'top 75%',
    end: 'bottom 60%',
    /* Seconds the beam takes to catch up with the scrollbar. Was 0.6, so the
     * beam visibly trailed every scroll. 0.15 keeps a hint of smoothing
     * without the drag. */
    scrub: 0.15,
  },

  toast: {
    /* How long the confirmation stays up. Long enough to read six words. */
    hold: 2.4,
    inDuration: 0.25,
    outDuration: 0.18,
    y: 16, // px it rises from
  },

  /* ==========================================================================
   *  ROTATING HEADLINE WORD  (homepage hero)
   *  "Small business." cycles clinic / café / homestay / studio and lands back
   *  on business. Plays ONCE after the entrance, then stops. Hovering the
   *  headline replays it.
   * ======================================================================== */
  rotator: {
    startDelay: 0.3, // after the entrance finishes
    hold: 0.85, // how long each word sits still
    duration: 0.38, // the swap itself
    ease: 'signature',
    /* How far (% of the word's own height) the words travel. */
    travel: 105,
  },

  /* ==========================================================================
   *  AGENCY STRIKE-THROUGH  (price cards on home, services, pricing)
   * ======================================================================== */
  strike: {
    duration: 0.5,
    ease: 'expo.inOut', // a line travelling across the screen
    /* Card scrolled into view: draw almost as soon as it arrives. */
    delay: 0.15,
    /* Card already on screen at load (pricing page hero): wait for the
     * curtain and the card's rise, or the line draws unseen. */
    delayOnLoad: 1.0,
    start: 'top 90%',
  },

  /* ==========================================================================
   *  CURRENCY SWITCH
   *  Pressing ₹ / $ rolls every changed price over. It answers a click, so it
   *  must never feel like a wait.
   * ======================================================================== */
  currency: {
    out: 0.1, // old figure leaving
    in: 0.2, // new figure arriving
    lift: 35, // % of the element's own height it travels
  },

  /* A `three:` block of WebGL tuning used to sit here. three.js, scene.js and
   * the vendor bundle were all removed deliberately (see README). Do not
   * reintroduce WebGL. */
};

/* Brand colour tokens. Keep in sync with assets/css/tailwind.css @theme.
 *   paper = the surface   |   ink = everything drawn on it */
CI.PALETTE = {
  paper: '#fdfdfd',
  ink: '#091529',
};
