/* ============================================================================
 *  SITE ORCHESTRATOR
 *  ---------------------------------------------------------------------------
 *  Owns three things:
 *    1. The master ENTRANCE timeline (runs on every page)
 *    2. SCROLL REVEALS for inner-page sections
 *    3. PAGE TRANSITIONS — the curtain that stitches separate HTML documents
 *       into what feels like one continuous experience
 *
 *  Loaded last. Everything above it is config or a self-contained module.
 * ========================================================================== */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  /* ★ THE SIGNATURE EASE ★
   * One curve used across the whole site so every element decelerates with the
   * same personality. This is what makes a site feel authored rather than
   * assembled from defaults.
   *
   * Cubic-bezier control points: x1, y1, x2, y2.
   *   "0.16, 1, 0.3, 1"   → hard launch, long luxurious glide (current)
   *   "0.22, 1, 0.36, 1"  → slightly softer entry
   *   "0.65, 0, 0.35, 1"  → symmetrical, more mechanical
   */
  CustomEase.create('signature', '0.16, 1, 0.3, 1');
  CustomEase.create('signature-back', '0.34, 1.4, 0.44, 1');

  var M = CI.MOTION;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Helper: only add a tween if the selector actually matches something on
   * this page. Inner pages don't have every hero element, and GSAP logs a
   * console warning for empty targets. */
  function add(tl, sel, fromVars, toVars, pos) {
    var els = gsap.utils.toArray(sel);
    if (!els.length) return tl;
    return tl.fromTo(els, fromVars, toVars, pos);
  }

  /* ==========================================================================
   *  1. ENTRANCE
   * ======================================================================== */
  function buildEntrance() {
    var E = M.entrance;
    var B = E.beats;
    var curtain = document.querySelector('[data-anim="curtain"]');

    /* --- Reduced motion: skip the choreography entirely ------------------
     * Not a degraded version of the animation — no animation. Everything is
     * placed in its final state on the first paint. */
    if (reduced) {
      gsap.set('[data-anim]', { opacity: 1, y: 0, scaleY: 1 });
      gsap.set('[data-split]', { autoAlpha: 1 });
      gsap.set('[data-reveal]', { opacity: 1, y: 0 });
      /* The hero build's starting state is set in CSS under .js, so it has
       * to be undone explicitly: the finished page, no wireframe. Guarded
       * because only the homepage has one, and GSAP warns about empty
       * targets on the other five. */
      var builtShot = document.querySelector('.build-shot');
      var builtSkeleton = document.querySelector('.build-skeleton');
      if (builtShot) gsap.set(builtShot, { clipPath: 'none' });
      if (builtSkeleton) builtSkeleton.style.display = 'none';
      if (curtain) curtain.style.display = 'none';
      return;
    }

    var split = null;
    var splitLines = null;
    var headline = document.querySelector('[data-split]');

    if (headline) {
      /* `mask: "lines"` (GSAP 3.13+) wraps every line in its own
       * overflow-hidden div, so lines can slide up from nothing without us
       * writing a single wrapper element by hand.
       *
       * `ignore` keeps the rotating headline word in one piece: it is an
       * inline-grid of stacked words, and splitting inside it would scatter
       * them across line wrappers.
       *
       * `aria: 'none'` because the default sets an aria-label from the
       * element's textContent — which would read every hidden rotator word
       * aloud. The split is reverted once the intro finishes anyway. */
      split = new SplitText(headline, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        ignore: '[data-rotator]',
        aria: 'none',
      });
      splitLines = split.lines;
      gsap.set(headline, { autoAlpha: 1 });
    }

    /* ==================================================================
     *  MASTER ENTRANCE TIMELINE
     *  ------------------------------------------------------------------
     *  ONE timeline owns the whole intro. Every step is placed with an
     *  explicit position parameter pulled from CI.MOTION.entrance.beats,
     *  so the *choreography* is tunable independently of the *speeds*.
     *
     *  Mental model:
     *    duration (motion.js)  → how long a step takes
     *    beat     (motion.js)  → when that step starts
     *    timeScale             → global speed of everything
     *
     *  Debugging tip: type `CI.tl.progress(0.4)` in the console to scrub
     *  the whole sequence to 40% and inspect any frame.
     * ================================================================== */
    var tl = gsap.timeline({
      defaults: { ease: E.logo.ease },
      delay: E.startDelay,
    });

    /* ★ ONE DIAL FOR THE ENTIRE INTRO ★ */
    tl.timeScale(E.timeScale);
    CI.tl = tl; // exposed for console scrubbing

    /* --- BEAT 1 · CURTAIN — the reveal wipe --- */
    if (curtain) {
      tl.to(curtain, {
        yPercent: E.curtain.yPercent,
        duration: E.curtain.duration,
        ease: E.curtain.ease,
      }, B.curtain);
    }

    /* --- BEAT 2 · WEBGL — fades up UNDER the departing curtain, so the field
     * is already breathing when it's revealed rather than popping in after. */
    add(tl, '[data-anim="canvas"]',
      { opacity: 0 },
      { opacity: 1, duration: E.canvas.duration, ease: E.canvas.ease },
      B.canvas);

    /* --- BEAT 3 · GRID — hairline columns draw downward --- */
    add(tl, '[data-anim="grid-line"]',
      { scaleY: 0, opacity: 0 },
      { scaleY: 1, opacity: 1, duration: E.grid.duration, stagger: E.grid.stagger, ease: E.grid.ease },
      B.grid);

    /* --- BEAT 4 · BRAND --- */
    add(tl, '[data-anim="logo"]',
      { opacity: 0, y: E.logo.y },
      { opacity: 1, y: 0, duration: E.logo.duration, ease: E.logo.ease },
      B.logo);

    /* --- BEAT 5 · NAV --- */
    add(tl, '[data-anim="nav-link"]',
      { opacity: 0, y: E.nav.y },
      { opacity: 1, y: 0, duration: E.nav.duration, stagger: E.nav.stagger, ease: E.nav.ease },
      B.nav);

    /* --- BEAT 6 · EYEBROW --- */
    add(tl, '[data-anim="eyebrow"]',
      { opacity: 0, y: E.eyebrow.y },
      { opacity: 1, y: 0, duration: E.eyebrow.duration, ease: E.eyebrow.ease },
      B.eyebrow);

    /* --- BEAT 7 · HEADLINE — the moment.
     * Each masked line lifts from below with a slight rotation. The stagger
     * here (CI.MOTION.entrance.headline.stagger) is the most expensive-feeling
     * number on the page. Treat it carefully. */
    if (splitLines && splitLines.length) {
      tl.fromTo(splitLines,
        { yPercent: E.headline.yPercent, rotate: E.headline.rotate },
        {
          yPercent: 0, rotate: 0,
          duration: E.headline.duration,
          stagger: E.headline.stagger,
          ease: E.headline.ease,
        },
        B.headline);
    }

    /* --- BEAT 7b · HERO MEDIA — the screenshot --- */
    var hasMedia = !!document.querySelector('[data-anim="media"]');
    add(tl, '[data-anim="media"]',
      { opacity: 0, y: E.media.y, scale: E.media.scale },
      { opacity: 1, y: 0, scale: 1, duration: E.media.duration, ease: E.media.ease },
      B.media);
    /* Remembered so the hero build (below) can be pinned to it by absolute
     * time, without nudging anything that is positioned after this beat. */
    var mediaStart = hasMedia ? tl.recent().startTime() : null;

    /* --- BEAT 8 · PARAGRAPH --- */
    add(tl, '[data-anim="paragraph"]',
      { opacity: 0, y: E.paragraph.y },
      { opacity: 1, y: 0, duration: E.paragraph.duration, ease: E.paragraph.ease },
      B.paragraph);

    /* --- BEAT 9b · FLOATING CARDS — land after the image has settled ---
     * On the homepage they wait for the build instead, and are added there:
     * glass cards landing over a half-drawn wireframe looks like an error. */
    var build = document.querySelector('[data-build]');
    var cardFrom = { opacity: 0, y: E.cards.y, scale: E.cards.scale };
    var cardTo = {
      opacity: 1, y: 0, scale: 1,
      duration: E.cards.duration,
      stagger: E.cards.stagger,
      ease: E.cards.ease,
    };
    if (!build) add(tl, '[data-anim="card"]', cardFrom, cardTo, B.cards);

    /* --- BEAT 9 · CTAs --- */
    add(tl, '[data-anim="cta"]',
      { opacity: 0, y: E.cta.y },
      { opacity: 1, y: 0, duration: E.cta.duration, stagger: E.cta.stagger, ease: E.cta.ease },
      B.cta);

    /* --- BEAT 10 · SPEC ROW --- */
    add(tl, '[data-anim="spec"]',
      { opacity: 0, y: E.specs.y },
      { opacity: 1, y: 0, duration: E.specs.duration, stagger: E.specs.stagger, ease: E.specs.ease },
      B.specs);

    /* --- BEAT 11 · THE BUILD (homepage hero only) -------------------------
     * Address types in, wireframe draws, real page wipes down over it, then
     * the glass cards land on the finished page.
     *
     * Built as its own timeline and dropped in at an ABSOLUTE time (the media
     * beat plus a delay) after everything else is placed. Every beat above is
     * positioned relative to the timeline as it stood when it was added, so
     * inserting this last moves none of them: the paragraph and the CTA land
     * exactly when they always did. */
    if (build && mediaStart !== null) {
      var BD = E.build;
      var bt = gsap.timeline();
      var urlEl = document.querySelector('[data-type-url]');
      var bars = build.querySelectorAll('.sk');
      var shot = build.querySelector('.build-shot');
      var skeleton = build.querySelector('.build-skeleton');

      if (urlEl) {
        /* Emptied now, while the frame is still invisible, so nobody sees
         * the full address vanish before it types back in. */
        var fullUrl = urlEl.textContent;
        var typed = { n: 0 };
        urlEl.textContent = '';
        bt.to(typed, {
          n: fullUrl.length,
          duration: BD.type,
          ease: 'none',
          onStart: function () { urlEl.classList.add('is-typing'); },
          onUpdate: function () { urlEl.textContent = fullUrl.slice(0, Math.round(typed.n)); },
          onComplete: function () {
            urlEl.textContent = fullUrl;
            urlEl.classList.remove('is-typing');
          },
        }, 0);
      }

      if (bars.length) {
        /* From a sliver, not from nothing — a bar drawing across reads as a
         * pencil stroke; one popping out of zero reads as a glitch. */
        bt.fromTo(bars,
          { scaleX: 0.2, opacity: 0 },
          {
            scaleX: 1, opacity: 1,
            duration: BD.skeleton.duration,
            stagger: BD.skeleton.stagger,
            ease: BD.skeleton.ease,
          }, 0.1);
      }

      if (shot) {
        bt.fromTo(shot,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: BD.wipe.duration, ease: BD.wipe.ease },
          '+=' + BD.hold);
        if (skeleton) {
          bt.to(skeleton, { opacity: 0, duration: BD.skeletonOut, ease: 'power2.out' }, '>-' + BD.skeletonOut);
        }
      }

      var cardEls = gsap.utils.toArray('[data-anim="card"]');
      if (cardEls.length) bt.fromTo(cardEls, cardFrom, cardTo, '>-' + BD.cardsOverlap);

      bt.eventCallback('onComplete', function () {
        /* 'none', NOT clearProps: clearing would hand control back to the
         * stylesheet, whose .js rule clips the screenshot away entirely. */
        if (shot) gsap.set(shot, { clipPath: 'none' });
        if (skeleton) gsap.set(skeleton, { display: 'none' });
      });

      tl.add(bt, mediaStart + BD.delay);
    }

    /* --- WHEN THE INTRO IS OVER ------------------------------------------
     * Put the headline back the way it was authored. The line wrappers only
     * exist to mask the entrance; left in place they freeze the line breaks,
     * so a resized window keeps the old ones. Then start the word cycle,
     * which needs the original markup back to work on. */
    tl.eventCallback('onComplete', function () {
      if (split) {
        split.revert();
        gsap.set(headline, { autoAlpha: 1 }); // in case revert restored the hidden state
      }
      startRotator();
    });
  }

  /* ==========================================================================
   *  1b. ROTATING HEADLINE WORD
   *  "Small business." → clinic → café → homestay → studio → business.
   *  Plays once and stops on the real headline: motion that loops forever next
   *  to the main call to action pulls the eye away from it, and anything that
   *  moves for more than a few seconds ought to offer a way to stop it.
   *  Hovering the headline replays the cycle, on pointer devices only.
   *
   *  A fresh timeline per play rather than restart(): rewinding a sequence in
   *  which every word is both an "in" and an "out" depends on render order,
   *  and building ten tweens costs nothing.
   * ======================================================================== */
  function startRotator() {
    var root = document.querySelector('[data-rotator]');
    if (!root || reduced) return;
    var words = gsap.utils.toArray(root.querySelectorAll('.rotator-word'));
    if (words.length < 2) return;
    var R = M.rotator;
    var running = null;

    function play() {
      if (running && running.isActive()) return;

      /* From here on GSAP owns visibility (autoAlpha) rather than the
       * .is-on class, so a stylesheet rule never fights an inline style. */
      words.forEach(function (w, i) {
        gsap.set(w, { autoAlpha: i === 0 ? 1 : 0, yPercent: 0 });
      });

      running = gsap.timeline();
      var step = R.hold + R.duration;
      for (var i = 0; i < words.length; i++) {
        var leaving = words[i];
        var arriving = words[(i + 1) % words.length];
        var at = i * step + R.hold;
        running.to(leaving,
          { yPercent: -R.travel, autoAlpha: 0, duration: R.duration, ease: R.ease }, at);
        running.fromTo(arriving,
          { yPercent: R.travel, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: R.duration, ease: R.ease, immediateRender: false },
          at);
      }
    }

    gsap.delayedCall(R.startDelay, play);

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var h1 = root.closest('h1');
      if (h1) h1.addEventListener('mouseenter', play);
    }
  }

  /* ==========================================================================
   *  2. SCROLL REVEALS
   *  Anything with [data-reveal] lifts in as it enters the viewport.
   *  Group siblings with [data-reveal-group] to stagger them together.
   * ======================================================================== */
  function buildReveals() {
    if (reduced) return;
    var R = M.reveal;

    /* Grouped: children stagger as one gesture. */
    gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
      var kids = group.querySelectorAll('[data-reveal]');
      if (!kids.length) return;
      gsap.fromTo(kids,
        { opacity: 0, y: R.y },
        {
          opacity: 1, y: 0,
          duration: R.duration,
          stagger: R.stagger,
          ease: R.ease,
          scrollTrigger: { trigger: group, start: R.start, once: true },
        });
    });

    /* Ungrouped singles. */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      if (el.closest('[data-reveal-group]')) return;
      gsap.fromTo(el,
        { opacity: 0, y: R.y },
        {
          opacity: 1, y: 0,
          duration: R.duration,
          ease: R.ease,
          scrollTrigger: { trigger: el, start: R.start, once: true },
        });
    });
  }

  /* ==========================================================================
   *  3. PAGE TRANSITIONS
   *  Every page is a real HTML document. The curtain drops before we leave and
   *  lifts on arrival, so navigation reads as one continuous surface instead
   *  of a hard browser reload.
   *
   *  Falls back to normal link behaviour if anything is missing — the site
   *  never depends on this to be navigable.
   * ======================================================================== */
  function buildTransitions() {
    var curtain = document.querySelector('[data-anim="curtain"]');
    if (!curtain || reduced) return;

    var T = M.transition;
    var leaving = false;

    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a') : null;
      if (!link || leaving) return;

      var href = link.getAttribute('href');
      if (!href) return;

      /* Let the browser handle anything that isn't a plain same-tab
       * navigation to another page of this site. */
      if (
        href.charAt(0) === '#' ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        /^(https?:|mailto:|tel:)/i.test(href) ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
        e.button !== 0
      ) return;

      e.preventDefault();
      leaving = true;

      /* Curtain starts offscreen-top (where the entrance left it) and drops
       * back down to cover. Keep outDuration SHORT — the user is waiting. */
      gsap.set(curtain, { display: 'flex' });
      gsap.fromTo(curtain,
        { yPercent: -100 },
        {
          yPercent: 0,
          duration: T.outDuration,
          ease: T.outEase,
          onComplete: function () {
            gsap.delayedCall(T.holdBeforeNav, function () {
              window.location.href = href;
            });
          },
        });
    });

    /* Back/forward out of the bfcache restores the DOM as we left it —
     * curtain down. Lift it so the page isn't stuck behind a navy panel. */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) gsap.set(curtain, { yPercent: -100 });
    });
  }

  /* ==========================================================================
   *  4. STAT COUNTERS
   *  Any element with data-count rolls from 0 to that number when scrolled
   *  into view. Optional data-count-lead / data-count-tail wrap the figure
   *  ("<" 7, 1 " day", 10 "+").
   *
   *  Update the numbers in the HTML — never here.
   *
   *  THE MARKUP SHIPS THE REAL FIGURE, not a zero. It used to ship "0" and
   *  rely on this function to replace it, which meant a JS-off visitor read
   *  "0 live client sites" on the work page — the worst possible first number.
   *  So this function now zeroes an element only when it is still below the
   *  fold, and leaves anything already on screen alone: resetting a number the
   *  visitor can see, purely to roll it back up, reads as a glitch.
   * ======================================================================== */
  function buildCounters() {
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count) || 0;
      var lead = el.dataset.countLead || '';
      var tail = el.dataset.countTail || '';

      /* One batched read at boot — never inside a pointer or scroll handler. */
      if (reduced || el.getBoundingClientRect().top < window.innerHeight) {
        el.textContent = lead + target + tail;
        return;
      }

      el.textContent = lead + 0 + tail;
      var proxy = { v: 0 };
      gsap.to(proxy, {
        v: target,
        duration: M.counter.duration,
        ease: M.counter.ease,
        scrollTrigger: { trigger: el, start: M.counter.start, once: true },
        onUpdate: function () {
          el.textContent = lead + Math.round(proxy.v) + tail;
        },
      });
    });
  }

  /* ==========================================================================
   *  4b. AGENCY STRIKE-THROUGH
   *  The line through the agency price draws itself across as the card comes
   *  into view, so the comparison lands as something happening rather than
   *  arriving pre-crossed. The line is a ::after whose length is the custom
   *  property --strike (see .strike in tailwind.css); the stylesheet starts it
   *  at 0 under .js, and its resting value without JS is fully drawn.
   * ======================================================================== */
  function buildStrikes() {
    var strikes = gsap.utils.toArray('.strike');
    if (!strikes.length) return;

    if (reduced) {
      strikes.forEach(function (el) { el.style.setProperty('--strike', '1'); });
      return;
    }

    var S = M.strike;
    strikes.forEach(function (el) {
      /* One read per element, at boot — never inside a scroll handler. A card
       * already on screen at load sits behind the curtain at first, so it
       * waits for the curtain to clear instead of drawing unseen. */
      var onScreen = el.getBoundingClientRect().top < window.innerHeight;
      gsap.to(el, {
        '--strike': 1,
        duration: S.duration,
        ease: S.ease,
        delay: onScreen ? S.delayOnLoad : S.delay,
        scrollTrigger: { trigger: el, start: S.start, once: true },
      });
    });
  }

  /* ==========================================================================
   *  5. FAQ ACCORDION
   *  Height is animated by GSAP rather than CSS because "height: auto" cannot
   *  be transitioned. GSAP measures the natural height, animates to it, then
   *  sets height:auto so the panel stays correct if the window is resized or
   *  the text reflows.
   * ======================================================================== */
  function buildAccordion() {
    var items = gsap.utils.toArray('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('button');
      var panel = item.querySelector('.faq-panel');
      if (!btn || !panel) return;

      /* The markup ships NO aria-expanded, because without this script the
       * answer is plain visible prose and the button controls nothing — a
       * "collapsed" state announced over an open answer is worse than silence.
       * The state only exists once we are here to honour it. */
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';

        /* Close any other open item first — an accordion where everything can
         * be open at once is just a long page with extra clicks. */
        if (!open) {
          items.forEach(function (other) {
            if (other === item) return;
            var ob = other.querySelector('button');
            var op = other.querySelector('.faq-panel');
            if (ob && op && ob.getAttribute('aria-expanded') === 'true') {
              ob.setAttribute('aria-expanded', 'false');
              gsap.to(op, { height: 0, duration: M.accordion.close, ease: M.accordion.ease });
            }
          });
        }

        btn.setAttribute('aria-expanded', String(!open));

        gsap.to(panel, {
          height: open ? 0 : 'auto',
          duration: open ? M.accordion.close : M.accordion.open,
          ease: M.accordion.ease,
          onComplete: function () {
            /* Refresh triggers below this point — the page just got taller. */
            ScrollTrigger.refresh();
          },
        });
      });
    });
  }

  /* ==========================================================================
   *  6. GLASS HEADER
   *  The header is transparent over the hero and frosts once the page scrolls
   *  under it. Glass on a header that never changes is just a grey bar - the
   *  transition is the whole effect.
   *
   *  Deliberately a class toggle, not a style write: the browser can then keep
   *  the backdrop-filter layer promoted instead of rebuilding it every frame.
   *  The scroll handler itself does no layout reads at all.
   * ======================================================================== */
  function buildHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    /* How far you scroll before it frosts. Roughly one header height, so it
     * kicks in exactly as the first content passes underneath. */
    var TRIGGER = 60;
    var stuck = false;
    var queued = false;

    function apply() {
      queued = false;
      var next = (window.scrollY || window.pageYOffset) > TRIGGER;
      if (next === stuck) return; // only touch the DOM on a real change
      stuck = next;
      header.classList.toggle('is-stuck', stuck);
    }

    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });

    apply(); // correct state on load and on a restored scroll position
  }

  /* ==========================================================================
   *  7. CURRENCY SWITCH
   *  The studio sells into two markets with genuinely different price levels.
   *  Any element carrying data-inr / data-usd swaps its text when the toggle
   *  changes; INR is the default because Kerala is the primary market and the
   *  first number someone sees should be one they can judge.
   *
   *  The choice is remembered for the session, so moving between pages does
   *  not keep resetting a visitor to a currency they do not think in.
   * ======================================================================== */
  function buildCurrency() {
    var btns = document.querySelectorAll('[data-cur]');
    if (!btns.length) return;

    var STORE = 'ft-currency';
    var saved = null;
    try { saved = sessionStorage.getItem(STORE); } catch (e) { /* private mode */ }

    /* A press rolls each changed price over: old figure lifts out, new one
     * rises in. It confirms the press did something and shows exactly WHICH
     * numbers changed. Page load and reduced motion swap instantly. */
    function roll(el, value) {
      var C = M.currency;
      /* A fast double-press must never leave a price half-faded: kill any roll
       * in flight and clear its inline styles before reading the resting
       * opacity — several of these figures are deliberately dimmed (the agency
       * price sits at 40%), and that is the value to come back to, not 1. */
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'opacity,transform' });
      var rest = parseFloat(getComputedStyle(el).opacity) || 1;
      /* Transforms do nothing on a plain inline box, so those just fade. */
      var lift = getComputedStyle(el).display === 'inline' ? 0 : C.lift;

      gsap.timeline({
        onComplete: function () { gsap.set(el, { clearProps: 'opacity,transform' }); },
      })
        .to(el, { opacity: 0, yPercent: -lift, duration: C.out, ease: 'power2.out' })
        .add(function () { el.textContent = value; })
        .fromTo(el,
          { opacity: 0, yPercent: lift },
          { opacity: rest, yPercent: 0, duration: C.in, ease: 'signature', immediateRender: false });
    }

    function apply(cur, animate) {
      document.querySelectorAll('[data-inr]').forEach(function (el) {
        var v = cur === 'usd' ? el.getAttribute('data-usd') : el.getAttribute('data-inr');
        if (v === null || el.textContent === v) return;
        if (animate && !reduced) roll(el, v);
        else el.textContent = v;
      });
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-cur') === cur));
      });
      try { sessionStorage.setItem(STORE, cur); } catch (e) { /* ignore */ }
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-cur'), true); });
    });

    apply(saved === 'usd' ? 'usd' : 'inr', false);
  }

  /* ==========================================================================
   *  8. MOBILE NAVIGATION
   *  Burger toggles a full-screen panel. Kept deliberately plain: no focus
   *  trap library, just the four things that actually matter on a phone -
   *  it opens, it closes, Escape works, and the page behind it cannot scroll.
   * ======================================================================== */
  function buildMobileNav() {
    var btn = document.querySelector('.burger');
    var panel = document.getElementById('mobileNav');
    if (!btn || !panel) return;

    var open = false;
    var links = panel.querySelectorAll('.m-link, .m-cta, .m-rule, .m-meta');
    /* Everything the panel covers, marked inert while it is open so Tab cannot
     * walk the page behind a full-screen overlay — which it could, invisibly.
     *
     * NOT the whole header: the burger lives inside it and sits at z-80
     * precisely so it can close the panel, and inert would make it unclickable.
     * The header's other contents are already display:none below md, so the
     * brand mark is the only thing left that needs neutralising. */
    var behind = [document.querySelector('main'),
                  document.querySelector('footer'),
                  document.querySelector('.site-header [data-anim="logo"]')].filter(Boolean);

    function setOpen(next) {
      if (next === open) return;
      open = next;
      btn.setAttribute('aria-expanded', String(open));
      /* The label has to change with the state — "Open menu" announced over an
       * open menu is simply wrong. */
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
      behind.forEach(function (el) {
        if (open) { el.setAttribute('inert', ''); } else { el.removeAttribute('inert'); }
      });

      if (open) {
        panel.hidden = false;
        if (reduced) return;
        /* Panel wipes down, then the links cascade in behind it. Starting the
         * links slightly after the panel is what stops it feeling like one
         * flat block appearing. */
        var N = M.mobileNav;
        gsap.fromTo(panel, { yPercent: -100 },
          { yPercent: 0, duration: N.open, ease: N.ease });
        gsap.fromTo(links, { opacity: 0, y: N.linkY },
          { opacity: 1, y: 0, duration: N.linkDuration, stagger: N.linkStagger, ease: 'signature', delay: N.linkDelay });
      } else {
        if (reduced) { panel.hidden = true; return; }
        gsap.to(panel, {
          yPercent: -100, duration: M.mobileNav.close, ease: M.mobileNav.ease,
          onComplete: function () { panel.hidden = true; }
        });
      }
    }

    btn.addEventListener('click', function () { setOpen(!open); });

    /* Any link closes it. Page transitions then take over from there. */
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      /* Escape closes, and focus goes back to the burger rather than being
       * dropped on the body — otherwise the next Tab starts from the top of the
       * document, which is disorienting. */
      if (e.key === 'Escape' && open) { setOpen(false); btn.focus(); }
    });

    /* Rotating the phone into landscape can cross the md breakpoint, which
     * would leave the body scroll-locked behind a hidden panel. */
    window.addEventListener('resize', function () {
      if (open && window.innerWidth >= 768) setOpen(false);
    });
  }

  /* ==========================================================================
   *  9. COPY TO CLIPBOARD + TOAST
   *  Every email address on the site becomes click-to-copy. On a phone a
   *  mailto: link opens an app the visitor may not have configured; copying
   *  always works and never navigates them away mid-decision.
   *
   *  The mailto: href stays intact, so without JS the link still behaves
   *  normally.
   * ======================================================================== */
  function buildCopy() {
    var toast = null;
    var hideCall = null;

    function notify(message) {
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
        gsap.set(toast, { xPercent: -50, opacity: 0, y: M.toast.y });
      }
      toast.innerHTML = '<b></b>' + message;

      if (hideCall) hideCall.kill();
      gsap.to(toast, {
        opacity: 1, y: 0,
        duration: reduced ? 0 : M.toast.inDuration,
        ease: 'signature',
        overwrite: true
      });
      /* Exits the way it entered, so it reads as one object leaving rather
       * than a second one fading out. */
      hideCall = gsap.delayedCall(M.toast.hold, function () {
        gsap.to(toast, {
          opacity: 0, y: M.toast.y,
          duration: reduced ? 0 : M.toast.outDuration,
          ease: 'power2.in'
        });
      });
    }

    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
      if (!link || !navigator.clipboard) return;
      /* The contact form's send-by-email link composes a real message, so it
       * opts out of copy-instead-of-open. */
      if (link.hasAttribute('data-no-copy')) return;

      var address = link.getAttribute('href').replace('mailto:', '').split('?')[0];
      e.preventDefault();

      navigator.clipboard.writeText(address).then(
        function () { notify('Email copied &mdash; ' + address); },
        /* Clipboard can be blocked by permissions. Fall back to the link's
         * normal behaviour rather than silently doing nothing. */
        function () { window.location.href = link.getAttribute('href'); }
      );
    });
  }

  /* ==========================================================================
   *  11. FLOURISHES
   *  Three effects that demonstrate capability better than any sentence on
   *  the page can claim it. A visitor deciding whether this person can build
   *  something good is answered by the page itself.
   *
   *  All three are transform-only, all three run one shared rAF loop rather
   *  than three, and all three are skipped entirely on touch and for
   *  reduced-motion.
   * ======================================================================== */
  function buildFlourishes() {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var F = M.flourish;
    var tilts = [];
    var spots = [];

    /* --- 3D tilt: hero screenshots only -----------------------------------
     * `.shot:not(.shot-zoom)` is exactly the hero images. The work cards
     * carry .shot-zoom and already have their own hover behaviour, so this
     * selector separates them without touching any HTML. */
    gsap.utils.toArray('.shot:not(.shot-zoom)').forEach(function (shot) {
      var stage = shot.parentElement;
      if (!stage) return;
      stage.classList.add('tilt-stage');

      var sheen = document.createElement('span');
      sheen.className = 'tilt-sheen';
      sheen.setAttribute('aria-hidden', 'true');
      shot.appendChild(sheen);

      tilts.push({
        el: shot, stage: stage, sheen: sheen,
        tx: 0, ty: 0, cx: 0, cy: 0, hot: false,
        /* Document-space box: measured once, refreshed on resize and on
         * ScrollTrigger refresh — never on scroll, never inside pointermove. */
        doc: null
      });
    });

    /* --- Spotlight inside every dark panel --- */
    gsap.utils.toArray('.panel-ink').forEach(function (panel) {
      var glow = document.createElement('span');
      glow.className = 'spotlight';
      glow.setAttribute('aria-hidden', 'true');
      panel.appendChild(glow);
      spots.push({ panel: panel, glow: glow, x: 0, y: 0, doc: null });
    });

    /* --- Glowing edge on every light panel and pricing tier ---------------
     * Forms are left out: an arc sweeping round the fields while someone
     * types is a distraction, not a flourish. The tiers get it because they
     * are the cards a visitor actually compares by moving between them — the
     * arc following the pointer from one to the next makes that comparison
     * feel like handling three objects rather than reading three columns. */
    var glows = [];
    gsap.utils.toArray('.panel, .tier').forEach(function (panel) {
      if (panel.tagName === 'FORM') return;
      var edge = document.createElement('span');
      edge.className = 'glow-edge';
      edge.setAttribute('aria-hidden', 'true');
      edge.style.setProperty('--spread', F.glow.spread);
      panel.appendChild(edge);
      glows.push({ panel: panel, edge: edge, a: 0, lit: false, doc: null });
    });

    /* --- Pointer parallax on the hero cards -------------------------------
     * Each [data-depth] element drifts toward the pointer by up to its own
     * depth in px. Written to the individual CSS `translate` property, which
     * composes with — rather than overwriting — the `transform` the entrance
     * timeline owns on these same cards. */
    var stage = document.querySelector('[data-hero-stage]');
    var depths = stage ? gsap.utils.toArray(stage.querySelectorAll('[data-depth]')).map(function (el) {
      return { el: el, depth: parseFloat(el.getAttribute('data-depth')) || 0, x: 0, y: 0 };
    }) : [];
    var stageBox = null;

    if (!tilts.length && !spots.length && !glows.length && !depths.length) return;

    /* Document coordinates from the offset chain. Unlike a rect, this ignores
     * transforms, so a panel measured mid-reveal (still 26px low) reports
     * where it will actually sit. None of the panels has a fixed ancestor. */
    function docBox(el) {
      var x = 0, y = 0, n = el;
      while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    }

    /* EVERYTHING is measured in document space, once, then compared against a
     * document-space pointer with plain arithmetic. Document coordinates do not
     * change on scroll, so nothing re-measures while scrolling.
     *
     * This replaced a scroll listener that called getBoundingClientRect() on
     * the tilt and spotlight elements on every scroll event — a forced
     * synchronous layout per scroll tick, which is what made scrolling past
     * the hero and the navy panels stutter. */
    function measure() {
      tilts.forEach(function (t) { t.doc = docBox(t.el); });
      spots.forEach(function (s) { s.doc = docBox(s.panel); });
      glows.forEach(function (g) { g.doc = docBox(g.panel); });
      if (stage) stageBox = docBox(stage);
    }
    measure();
    window.addEventListener('resize', measure);
    /* Accordions and late fonts change the page height; ScrollTrigger already
     * announces those moments, so everything re-measures on the same signal. */
    ScrollTrigger.addEventListener('refresh', measure);

    var px = -9999, py = -9999;
    window.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
    }, { passive: true });

    /* --- Marquee scroll reactivity ----------------------------------------
     * playbackRate on the running CSS animation, rather than rewriting
     * animation-duration, so the ticker never jumps position. */
    var tracks = [];
    document.querySelectorAll('.marquee-track').forEach(function (el) {
      var anims = el.getAnimations ? el.getAnimations() : [];
      if (anims.length) tracks.push(anims[0]);
    });
    var marquees = gsap.utils.toArray('.marquee');
    var lastY = window.scrollY;
    var vel = 0;
    var lastSkew = 0, lastRate = 1;

    /* One loop for every effect. Separate rAF loops would each pay their own
     * scheduling cost for no benefit.
     *
     * RULE: the loop always runs, but it only WRITES when a value actually
     * changed. It used to write the tilt, the sheen, the spotlight and the
     * marquee skew on every frame forever, hover or no hover — sixty style
     * writes a second on an idle page, which is the background hum that makes
     * a site feel heavy on a modest laptop. */
    function frame() {
      requestAnimationFrame(frame);

      /* Scroll velocity, smoothed. */
      var y = window.scrollY;
      vel = vel * F.marquee.decay + (y - lastY) * (1 - F.marquee.decay);
      lastY = y;

      /* The pointer in document space, once per frame, for every effect. */
      var gx = px + window.scrollX;
      var gy = py + y;

      if (tracks.length) {
        var rate = Math.min(1 + Math.abs(vel) * F.marquee.boost, F.marquee.maxRate);
        if (Math.abs(rate - lastRate) > 0.01) {
          lastRate = rate;
          for (var t = 0; t < tracks.length; t++) tracks[t].playbackRate = rate;
        }
      }
      if (marquees.length) {
        var skew = Math.max(-F.marquee.maxSkew,
                   Math.min(F.marquee.maxSkew, vel * 0.25));
        if (Math.abs(skew) < 0.01) skew = 0;
        if (Math.abs(skew - lastSkew) > 0.01) {
          lastSkew = skew;
          for (var mq = 0; mq < marquees.length; mq++) {
            marquees[mq].style.transform = skew ? 'skewX(' + skew.toFixed(2) + 'deg)' : '';
          }
        }
      }

      /* Tilt — idle cards are skipped entirely. */
      for (var i = 0; i < tilts.length; i++) {
        var it = tilts[i];
        var tb = it.doc;
        if (!tb) continue;
        var inside = gx >= tb.x && gx <= tb.x + tb.w && gy >= tb.y && gy <= tb.y + tb.h;

        if (inside) {
          /* -1..1 from the centre of the card. */
          it.cx = (gx - (tb.x + tb.w / 2)) / (tb.w / 2);
          it.cy = (gy - (tb.y + tb.h / 2)) / (tb.h / 2);
          it.hot = true;
        } else if (it.hot) {
          it.cx = 0; it.cy = 0;
        } else {
          continue; // at rest and not hovered: nothing to write
        }

        var e = inside ? F.tilt.ease : F.tilt.restEase;
        it.tx += (it.cx - it.tx) * e;
        it.ty += (it.cy - it.ty) * e;

        /* Settled after the pointer left: snap exactly to rest, write that
         * once, and go quiet until the next hover. */
        if (!inside && Math.abs(it.tx) < 0.002 && Math.abs(it.ty) < 0.002) {
          it.tx = 0; it.ty = 0; it.hot = false;
        }

        var lift = inside ? F.tilt.scale : 1;
        it.el.style.transform =
          'rotate(' + F.tilt.baseRotate + 'deg)' +
          ' rotateY(' + (it.tx * F.tilt.max).toFixed(3) + 'deg)' +
          /* Negated: pushing the pointer up should tip the TOP away. */
          ' rotateX(' + (-it.ty * F.tilt.max).toFixed(3) + 'deg)' +
          ' scale(' + lift + ')';

        /* Sheen tracks the horizontal turn, so the light reads as fixed in
         * the room while the card moves under it. */
        it.sheen.style.transform = 'translateX(' + (it.tx * 22).toFixed(2) + '%)';
      }

      /* Spotlight — only while the pointer is over (or just leaving) the
       * panel. The glow is invisible otherwise (CSS fades it on :hover), so
       * chasing an invisible element was pure waste. */
      for (var s = 0; s < spots.length; s++) {
        var sp = spots[s];
        var sb = sp.doc;
        if (!sb) continue;
        if (gx < sb.x - 60 || gx > sb.x + sb.w + 60 || gy < sb.y - 60 || gy > sb.y + sb.h + 60) continue;
        var spx = sp.x + ((gx - sb.x) - sp.x) * F.spotlight.ease;
        var spy = sp.y + ((gy - sb.y) - sp.y) * F.spotlight.ease;
        if (Math.abs(spx - sp.x) < 0.1 && Math.abs(spy - sp.y) < 0.1) continue;
        sp.x = spx; sp.y = spy;
        sp.glow.style.transform =
          'translate3d(' + sp.x.toFixed(1) + 'px,' + sp.y.toFixed(1) + 'px,0)';
      }

      /* Glowing edge. Arithmetic against boxes measured ahead of time. */
      for (var g = 0; g < glows.length; g++) {
        var gl = glows[g];
        var b = gl.doc;
        if (!b) continue;
        var near =
          gx > b.x - F.glow.proximity && gx < b.x + b.w + F.glow.proximity &&
          gy > b.y - F.glow.proximity && gy < b.y + b.h + F.glow.proximity;

        /* Class only changes on a real transition - the CSS fades it. */
        if (near !== gl.lit) {
          gl.lit = near;
          gl.edge.classList.toggle('is-lit', near);
        }
        if (!near) continue;

        /* Angle from the card's centre to the pointer. +90 because conic
         * gradients measure from 12 o'clock, atan2 from 3 o'clock. */
        var target = Math.atan2(gy - (b.y + b.h / 2), gx - (b.x + b.w / 2)) * 180 / Math.PI + 90;
        /* Shortest way round, so crossing 12 o'clock never spins it 359deg. */
        var diff = ((target - gl.a) % 360 + 540) % 360 - 180;
        if (Math.abs(diff) < 0.1) continue;
        gl.a += diff * F.glow.ease;
        gl.edge.style.setProperty('--start', gl.a.toFixed(2));
      }

      /* Parallax. Same document-space pointer, against the stage box measured
       * with the glows — no layout reads here. Off-screen hero: skip the work
       * entirely and leave the cards where they are. */
      if (depths.length && stageBox &&
          stageBox.y < y + window.innerHeight && stageBox.y + stageBox.h > y) {
        var P = F.parallax;
        var halfW = stageBox.w / 2, halfH = stageBox.h / 2;
        var nx = (gx - (stageBox.x + halfW)) / halfW;
        var ny = (gy - (stageBox.y + halfH)) / halfH;
        /* Inside the reach the cards lean toward the pointer (clamped at the
         * stage edge); beyond it they drift home rather than stopping dead. */
        var inReach = Math.abs(nx) < P.reach && Math.abs(ny) < P.reach;
        var tx = inReach ? Math.max(-1, Math.min(1, nx)) : 0;
        var ty = inReach ? Math.max(-1, Math.min(1, ny)) : 0;
        for (var d = 0; d < depths.length; d++) {
          var dp = depths[d];
          var nxp = dp.x + (tx * dp.depth - dp.x) * P.ease;
          var nyp = dp.y + (ty * dp.depth - dp.y) * P.ease;
          if (Math.abs(nxp - dp.x) < 0.01 && Math.abs(nyp - dp.y) < 0.01) continue;
          dp.x = nxp; dp.y = nyp;
          dp.el.style.translate = dp.x.toFixed(2) + 'px ' + dp.y.toFixed(2) + 'px';
        }
      }
    }
    requestAnimationFrame(frame);
  }

  /* ==========================================================================
   *  12. PROCESS RAIL BEAM
   *  After Aceternity's "Timeline" on 21st.dev. A gold beam fills the rail
   *  with scroll, and each step's dot lights once the beam reaches it.
   *
   *  Runs on touch as well - it is driven by scrolling, not by a pointer.
   *  Reduced motion gets the original static rail, untouched.
   * ======================================================================== */
  function buildRail() {
    if (reduced) return;
    var R = M.rail;

    gsap.utils.toArray('.rail').forEach(function (rail) {
      var steps = gsap.utils.toArray(rail.querySelectorAll('.rail-step'));
      if (!steps.length) return;

      var beam = document.createElement('span');
      beam.className = 'rail-beam';
      beam.setAttribute('aria-hidden', 'true');
      rail.insertBefore(beam, rail.firstChild);

      /* Where along the beam (0..1) each dot's centre sits. The beam spans
       * the rail inset 12px top and bottom, matching .rail::before. Offsets,
       * not rects, so the steps' own reveal transforms don't skew it. */
      var marks = [];
      function measureMarks() {
        var span = rail.offsetHeight - 24;
        marks = steps.map(function (step) {
          var dot = step.querySelector('.rail-dot');
          var centre = step.offsetTop + (dot ? dot.offsetTop + dot.offsetHeight / 2 : 0);
          return span > 0 ? (centre - 12) / span : 0;
        });
      }
      measureMarks();

      gsap.fromTo(beam, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: rail,
          start: R.start,
          end: R.end,
          scrub: R.scrub,
          onRefresh: measureMarks,
        },
        /* The tween's own progress, not the scrollbar's, so a dot lights
         * exactly as the smoothed beam arrives rather than ahead of it. */
        onUpdate: function () {
          var p = this.progress();
          for (var i = 0; i < steps.length; i++) {
            var on = p >= marks[i];
            if (on !== steps[i].classList.contains('is-reached')) {
              steps[i].classList.toggle('is-reached', on);
            }
          }
        },
      });
    });
  }

  /* ==========================================================================
   *  BOOT
   * ======================================================================== */
  /* FAILSAFE — the CSS hides pre-animation elements behind .js on <html>.
   * If anything below throws, that gating would leave the page blank. Strip
   * the class after 3s if the entrance never ran, so a broken script degrades
   * to a plain readable page instead of a navy void. */
  setTimeout(function () {
    if (!CI.entered) document.documentElement.classList.remove('js');
  }, 3000);

  function boot() {
    /* Each module is independent — one failing must not take the entrance
     * timeline down with it.
     *
     * Two init calls are gone from here. The WebGL scene (removed with three.js;
     * do not reintroduce WebGL), and the custom ring-and-dot cursor, removed on
     * request in October 2026: the ring was built to trail the pointer, and on
     * a site meant to feel fast, a cursor that lags behind your hand is the
     * first thing you feel. The native cursor never lags. */
    try { CI.initMagnetic(); } catch (err) { console.warn('magnetic:', err); }
    buildReveals();
    buildCounters();
    buildStrikes();
    buildAccordion();
    buildMobileNav();
    buildCopy();
    buildFlourishes();
    buildRail();
    buildHeader();
    buildTransitions();

    /* Wait for webfonts before SplitText measures line breaks — splitting
     * against a fallback font gives line boxes that jump when the real font
     * swaps in. But only briefly (entrance.fontWait): this wait holds the
     * whole page behind the curtain, so it is the single largest piece of
     * felt lag on arrival. It used to be 1.5s. It can be short now because
     * Inter Tight is preloaded, and because the split is reverted after the
     * intro anyway, so the final line breaks are always right. */
    var started = false;
    function start() {
      if (started) return;
      started = true;
      buildEntrance();
      CI.entered = true; // tells the failsafe above to stand down
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
      setTimeout(start, M.entrance.fontWait * 1000);
    } else {
      start();
    }
  }

  /* CURRENCY RUNS FIRST, AND SYNCHRONOUSLY.
   * Everything else can wait for DOMContentLoaded; this cannot. The markup
   * ships INR, so a returning visitor who chose USD used to watch rupee prices
   * paint and then flip — the one moment on the page where you least want a
   * flicker. This file is the last element in <body>, so every element carrying
   * data-inr is already parsed, and swapping here lands before first paint
   * rather than a frame or two after it. */
  try { buildCurrency(); } catch (err) { console.warn('currency:', err); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
