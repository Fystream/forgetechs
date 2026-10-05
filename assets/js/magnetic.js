/* ============================================================================
 *  MAGNETIC
 *  ---------------------------------------------------------------------------
 *  Pulls elements toward the cursor on PROXIMITY — the pull starts while the
 *  cursor is still approaching, not on hover. That pre-hover reaction is the
 *  entire effect; hover-triggered versions feel dead.
 *
 *  ── PERFORMANCE NOTE ──────────────────────────────────────────────────────
 *  The first version of this file called getBoundingClientRect() for EVERY
 *  magnetic element inside the pointermove handler. A pointermove can fire
 *  120+ times a second on a high-refresh mouse, and every rect read forces the
 *  browser to flush pending style and layout work synchronously. Ten magnets
 *  meant up to 1200 forced layouts a second, interleaved with GSAP's writes.
 *  That was the jank.
 *
 *  Two fixes, both here:
 *    1. Positions are measured ONCE into document coordinates, which do not
 *       change when you scroll. Zero rect reads during pointer movement.
 *    2. The handler only stores coordinates; the maths runs at most once per
 *       animation frame.
 *  ─────────────────────────────────────────────────────────────────────────
 *
 *  USAGE — just add the attribute, no inner markup needed:
 *      <a href="#" data-magnetic>Start a project</a>
 *
 *  Per-element overrides (a nav link should be subtler than a hero CTA):
 *      <a data-magnetic data-mag-radius="90" data-mag-strength="0.22">
 *
 *  ★ ALL PHYSICS LIVE IN  CI.MOTION.magnetic  ★
 * ========================================================================== */

(function () {
  'use strict';

  CI.initMagnetic = function () {
    var cfg = CI.MOTION.magnetic;

    /* No cursor to be magnetic toward on touch devices, and reduced-motion
     * users have explicitly asked us not to do this. */
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var items = [];

    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      /* Wrap the element's contents so the label can drift further than its
       * container. Done in JS so the HTML stays clean. */
      var label = document.createElement('span');
      label.className = 'mag-label';
      while (el.firstChild) label.appendChild(el.firstChild);
      el.appendChild(label);
      el.classList.add('mag-root');


      items.push({
        el: el,
        label: label,
        radius: parseFloat(el.dataset.magRadius) || cfg.radius,
        /* strengthScale dials every magnet at once, including the per-element
         * data-mag-strength values in the HTML. */
        strength: (parseFloat(el.dataset.magStrength) || cfg.strength) * (cfg.strengthScale || 1),
        labelStrength: parseFloat(el.dataset.magLabel) || cfg.labelStrength,
        engaged: false,
        pressed: false,
        cx: 0, // centre in DOCUMENT space — scroll-invariant, so measured once
        cy: 0,
        /* quickTo builds a reusable, pre-compiled tween. Far cheaper than
         * creating a new gsap.to() per event. */
        xTo: gsap.quickTo(el, 'x', { duration: cfg.settle, ease: cfg.ease }),
        yTo: gsap.quickTo(el, 'y', { duration: cfg.settle, ease: cfg.ease }),
        lxTo: gsap.quickTo(label, 'x', { duration: cfg.settle, ease: cfg.ease }),
        lyTo: gsap.quickTo(label, 'y', { duration: cfg.settle, ease: cfg.ease }),
      });
    });

    if (!items.length) return;

    /* ----------------------------------------------------------------------
     *  MEASURE
     *  All reads happen together in one batch, never interleaved with writes.
     *  We subtract any transform GSAP has already applied so we always record
     *  the element's true resting position, and we add scroll offset to store
     *  it in document space — which means scrolling never invalidates it.
     * -------------------------------------------------------------------- */
    function measure() {
      var sx = window.scrollX || window.pageXOffset;
      var sy = window.scrollY || window.pageYOffset;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        var tx = Number(gsap.getProperty(it.el, 'x')) || 0;
        var ty = Number(gsap.getProperty(it.el, 'y')) || 0;
        it.cx = r.left + r.width / 2 - tx + sx;
        it.cy = r.top + r.height / 2 - ty + sy;
      }
    }

    /* Re-measure whenever layout could have shifted. Debounced so a resize
     * drag doesn't trigger a hundred measure passes. */
    var measureTimer = null;
    function scheduleMeasure() {
      clearTimeout(measureTimer);
      measureTimer = setTimeout(measure, 120);
    }

    measure();
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('load', scheduleMeasure);
    /* Entrance and scroll-reveal animations move things after first paint. */
    setTimeout(measure, 800);
    setTimeout(measure, 2500);
    CI.remeasureMagnets = measure; // call this if you inject content later

    /* ----------------------------------------------------------------------
     *  POINTER
     *  The listener does nothing but record coordinates. All work is deferred
     *  to a single rAF tick, so a 120Hz mouse on a 60Hz display costs the same
     *  as a 60Hz mouse.
     * -------------------------------------------------------------------- */
    var px = -9999;
    var py = -9999;
    var queued = false;

    window.addEventListener(
      'pointermove',
      function (e) {
        px = e.clientX;
        py = e.clientY;
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    /* ----------------------------------------------------------------------
     *  PRESS FEEDBACK
     *  A pressable thing that does not move under the finger reads as broken.
     *  CSS :active cannot do this job here: GSAP writes an inline transform
     *  to these elements every frame, and inline styles win.
     *
     *  The press multiplies whatever scale the magnet is already at, so it
     *  still reads while the element is mid-hover. Release listens on the
     *  window rather than the element, because a finger that slides off the
     *  button before lifting would otherwise leave it stuck depressed.
     * -------------------------------------------------------------------- */
    items.forEach(function (it) {
      it.el.style.webkitTapHighlightColor = 'transparent';
      it.el.style.touchAction = 'manipulation';

      it.el.addEventListener('pointerdown', function () {
        it.pressed = true;
        gsap.to(it.el, {
          scale: (it.engaged ? cfg.hoverScale : 1) * cfg.pressScale,
          duration: cfg.pressDown,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });

    function release() {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.pressed) continue;
        it.pressed = false;
        gsap.to(it.el, {
          scale: it.engaged ? cfg.hoverScale : 1,
          duration: cfg.pressUp,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    function update() {
      queued = false;

      var sx = window.scrollX || window.pageXOffset;
      var sy = window.scrollY || window.pageYOffset;
      var vh = window.innerHeight;

      for (var i = 0; i < items.length; i++) {
        var it = items[i];

        /* Document space → viewport space. Pure arithmetic, no layout read. */
        var vy = it.cy - sy;
        if (vy < -200 || vy > vh + 200) continue; // offscreen, skip entirely

        var dx = px - (it.cx - sx);
        var dy = py - vy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < it.radius) {
          /* Linear falloff: full strength at the centre, zero at the rim.
           * Without this the element would JUMP the instant the cursor
           * crossed the radius boundary. For a punchier magnet try:
           *   var falloff = Math.pow(1 - dist / it.radius, 0.6); */
          var falloff = 1 - dist / it.radius;

          it.xTo(dx * it.strength * falloff);
          it.yTo(dy * it.strength * falloff);

          /* The label travels FURTHER than its container. Subtract the
           * container's own movement so this is a true extra offset. */
          var extra = it.strength * falloff * (it.labelStrength - 1);
          it.lxTo(dx * extra);
          it.lyTo(dy * extra);

          if (!it.engaged) {
            it.engaged = true;
            /* Skip while held: the press owns the scale, and letting the
             * proximity tween through would pop the button back out from
             * under the finger. */
            if (!it.pressed) {
              gsap.to(it.el, { scale: cfg.hoverScale, duration: cfg.settle, ease: cfg.ease });
            }
          }
        } else if (it.engaged) {
          /* RELEASE — deliberately elastic and slower than the attraction.
           * A snap back to zero reads as a bug; a spring reads as physics. */
          it.engaged = false;
          gsap.to([it.el, it.label], {
            x: 0,
            y: 0,
            duration: cfg.release,
            ease: cfg.releaseEase,
          });
          if (!it.pressed) {
            gsap.to(it.el, { scale: 1, duration: cfg.release, ease: cfg.releaseEase });
          }
        }
      }
    }
  };
})();
