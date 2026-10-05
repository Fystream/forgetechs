# Forge Technologies — static site

Six hand-written HTML pages. **No server, no build step, no internet connection required.**
Double-click `index.html` and it runs.

Light theme: off-white `#fdfdfd` ground, midnight navy `#091529` ink.

---

## Pages

| File | Section |
|---|---|
| `index.html` | Landing — hero, where things stand, what I do, the real cost, selected work, process, price, next step |
| `services.html` | Web design · Development · Local SEO · Upkeep, plus process |
| `work.html` | Omega Dental + one open slot |
| `faq.html` | Pricing, domain/hosting, ownership, timelines — accordion (nav label: **Pricing**) |
| `about.html` | Who I am, how I work, straight answers |
| `contact.html` | Direct channels + enquiry form |

The nav calls `faq.html` **Pricing** everywhere — desktop nav, mobile panel, footer
and the page-transition curtain. The filename and the `<title>` keep "FAQ" because
people search that word; the visible label does not, because "Pricing" is what they
are actually looking for.

---

## Structure

```
index.html … contact.html      the six pages
assets/
  css/
    styles.css                 ← COMPILED. Pages link this one.
    tailwind.css               ← SOURCE. Edit this, then rebuild.
    fonts.css                  generated @font-face rules
  fonts/                       vendored .woff2 (96 KB, no Google CDN)
  js/
    motion.js                  ★ ALL tuning values live here
    magnetic.js                buttons pulled gently toward the pointer
    site.js                    entrance, reveals, counters, accordion, transitions
    contact-form.js            contact.html only
  vendor/                      gsap + CustomEase, SplitText, ScrollTrigger (all local)
  img/originals/               full-resolution sources, not served
archive/next-version/          the earlier Next.js/React build, kept for reference
```

There is no `scene.js`, no `three.min.js` and no `build/` step — WebGL was removed
deliberately (see **Performance notes**). There is no `node_modules` requirement to
serve the site either; `assets/css/styles.css` is committed and complete.

---

## Editing

**Text and layout** — edit the `.html` files directly. Nothing to rebuild.

**Animation feel** — everything lives in `assets/js/motion.js`. Nothing to rebuild.

**Stat numbers** — on the `data-count` attributes in `index.html`, `work.html` and
`about.html`. `data-count-lead` and `data-count-tail` wrap the figure (1` day`).

There are **two** stats now, not three. A "10+ projects in the pipeline" figure was
removed from all three pages on 1 October 2026 because it was not accurate, and an
unverifiable number is the worst thing to carry on a site whose whole pitch is being
honest about being new. Each grid was re-balanced so no empty column was left behind.
Only add a stat back when it is something a client could check.

**Write the real figure as the element's text as well as in `data-count`.** The
markup used to ship `0` and rely on JS to replace it, which meant a visitor with
JavaScript off read "0 live client sites". `buildCounters` now zeroes an element
only if it is still below the fold, so the roll-up still happens where you would
see it and nothing resets a number already on screen.

**Adding a project** — copy an `<a class="work-row">` block in `work.html`.

**Adding an FAQ** — copy a `.faq-item` block in `faq.html`. No JS changes needed.
Keep the shape: `<h3><button aria-controls="faq-panel-N">` wrapping the question, and
`<div class="faq-panel" id="faq-panel-N" role="region" aria-labelledby="faq-btn-N">`
for the answer. The heading has to *wrap* the button — a heading is not valid
*inside* one — and that is what puts the questions in the document outline.

Then **regenerate the `FAQPage` JSON-LD from the visible accordion** rather than
hand-editing it; it previously covered 4 of 11 questions with one name that
disagreed with the page, which is exactly what Google flags.

**New Tailwind classes** — if you add a utility class that isn't already used somewhere:

```bash
npm install      # once
npm run build:css
```

Or `npm run watch:css` while you work.

---

## Imagery

Everything lives in `assets/img/`.

| File | Size | Used where |
|---|---|---|
| `logo-mark.png` | 192×192 | header + footer on all 6 pages, About brand panel |
| `favicon.png` | 180×180 | browser tab (`rel="icon"`) |
| `apple-touch-icon.png` | 180×180 | iOS home screen — **opaque**, navy mark on paper |
| `og.jpg` | 1200×630 | `og:image` + `twitter:image` on all 6 pages |
| `logo.png` | 1200×906 | **not** linked by any page, but the JSON-LD `"logo"` field in `index.html` points at it — do not delete |
| `work-omega.jpg` | 1400×733 | hero + work cards |
| `client-omega-logo.png` | 482×186 | client chip on the work card and About |
| `svc-*.svg` | 46×46 | the four service icons |
| `originals/` | — | full-resolution sources. Re-export from here. |

`assets/img/originals/` is committed on purpose — it is the only copy of the full-resolution
art. `publish = "."` does upload it, but no page links it, so no visitor ever downloads it.

`bg-wave.jpg` and `client-identity-logo.png` are gone. Before deleting an image, grep for it
in the six pages **and** in the JSON-LD — `logo.png` looks unused but is not.

**Images are sized for their slot, not for posterity.** `logo-mark.png` was a 512px,
61 KB file displayed at 32px in the header of every page, with `favicon.png` a
byte-identical copy of it; `work-omega.jpg` was 2000px for a ~900px slot while
carrying `fetchpriority="high"` as the LCP element. Resizing the three cut 184 KB
off a first visit. If you replace one, match the displayed size at 2× DPR and keep
the full-resolution file in `originals/`.

If you change an image's dimensions, **update its `width`/`height` attributes in the
HTML too** — those reserve layout space, and a stale pair is a latent layout-shift bug.

**The logo was generated, not hand-made.** `logo.png`, `logo-mark.png` and `favicon.png` were
cut from the original white-background JPEG by a threshold pass that recolours every pixel to
flat `#0d1b30` and sets alpha from luminance — so antialiased edges stay navy instead of going
grey. If you ever get the logo as SVG, replace these; vector will always be sharper.

**Replacing a screenshot:** keep the same filename, ~2000px wide, JPEG. Anything much larger
is wasted — they display at roughly 900px.

Gold is deliberately never on a heading, a button, or body text — see
**A pinch of gold** below for the two tokens and why they are two.

## Performance notes

The first build was laggy. Three specific causes, all fixed — worth knowing so they
don't creep back in:

**1. The custom cursor (removed, in two stages).** First the canvas trail went: a
full-viewport `clearRect` plus ~25 stroked quadratic curves every frame, composited with
`mix-blend-mode: screen` — the single largest cost on the page. Then, in October 2026, the
ring-and-dot that replaced it went too, along with `cursor.js`. It was cheap to render, but the
ring was *designed* to trail the pointer, and on a site meant to feel fast, a cursor that lags
behind your hand is the first thing you feel. The site uses the system cursor. Don't hide it
again.

**2. Layout thrashing in `magnetic.js`.** It called `getBoundingClientRect()` for every
magnetic element inside the `pointermove` handler. A high-refresh mouse fires 120+ times a
second, and each rect read forces a synchronous style-and-layout flush — with ten magnets
that was up to 1200 forced layouts a second, interleaved with GSAP's writes. Now positions
are measured once into **document** coordinates (which don't change when you scroll) and the
handler only records coordinates, with the maths deferred to one `requestAnimationFrame`.

**3. WebGL — removed entirely.** The particle field was 472 KB of three.js plus a full screen
of transparent overdraw every frame, and on a near-white ground it read as smudge rather than
atmosphere. Real photography does that job better and costs nothing to render. `three.min.js`,
`scene.js`, the `three-entry` build step, the `three:` block in `motion.js`, the `#webgl` CSS
and the third init call in `site.js` are all gone. **Do not reintroduce WebGL.**

Images are the weight now, and they're handled: every image below the fold is `loading="lazy"`,
all have explicit `width`/`height` so nothing shifts as they arrive, and the hero image is
`fetchpriority="high"`. First paint pulls only HTML + CSS + fonts + GSAP + the hero shot.

**4. Inter Tight is preloaded.** `site.js` blocks the entrance timeline on
`document.fonts.ready`, because SplitText measuring line breaks against a fallback font
produces line boxes that jump when the real font swaps in — the commonest cause of a broken
masked headline. So the font is on the critical path whether you like it or not, and a
`<link rel="preload">` in every `<head>` starts it with the stylesheet instead of after it.
Only the sans: the serif is one accent word per heading and the mono is small labels, neither
worth competing with the LCP image for bandwidth.

**5. Dead CSS was deleted, not kept "just in case."** Hand-written component CSS is *not*
tree-shaken by Tailwind — only utility classes are. A `.glass`/`.glass-dark` pair (~118 lines),
a `.cmp` comparison table (~21) and `.tier-was` (~8) shipped to every visitor on every page
while being referenced by nothing. Verify with a grep over `*.html` **and** `assets/js/*.js`
before removing a component, and before adding one ask whether an existing one would do.

---

## Why some things are the way they are

**Fonts are vendored, not loaded from Google.** True offline means no CDN.

**The curtain is the one inverted surface** — navy ground, paper text. Its labels are
overridden in CSS rather than special-cased in six HTML files.

**The nav and footer are duplicated on every page.** No build step means no partials. Real
markup means the nav works with JavaScript disabled. Change a nav link in all six files.

**The contact form has no backend, and both send actions are real links.** They were
`<button type="button">`, which meant a visitor with JavaScript off could fill the form, press
send, and get *nothing* — silence, on the one page whose job is to start a conversation. They
are now anchors with working `href`s (WhatsApp with a generic opener, and a `mailto:`), and
`contact-form.js` intercepts the click to upgrade the message with what was typed. There is
also a `<noscript>` block with the direct links. Swap the handlers for a `fetch()` if you move
to Netlify Forms — but keep the hrefs.

**Every page must be complete with JavaScript disabled.** This is a hard rule, and it has been
broken twice. Rules that enforce it:

- Pre-animation hiding is gated behind `.js` on `<html>`, set by an inline script in `<head>`.
  That includes `.faq-panel`'s `height: 0` — **ungated, it hid all eleven FAQ answers** from
  anyone whose JS failed, on the pricing page, while the `FAQPage` schema promised Google
  answers that were not in the document.
- Controls that only work with JS do not exist without it: `.faq-sign` (the +/−) is
  `display: none` until `.js`, and the accordion's `aria-expanded` is set by `buildAccordion`
  rather than shipped in the markup, because a button announcing "collapsed" over a visible
  answer is worse than no state at all.
- Counters ship their real figure as text (see **Stat numbers**).
- The mobile burger is `display: none` without `.js`, and `.nav-links` stay visible and wrap,
  so there is always a way to navigate.

**Nothing degrades to a blank page.** A 3-second failsafe in `site.js` strips the `.js` class
if the entrance never ran.

**Never rewrite these files with PowerShell `Get-Content`/`Set-Content`.** On Windows
PowerShell 5.1 the first decodes UTF-8 as Windows-1252 and the second writes a BOM, so a
round-trip double-encodes every non-ASCII character (`—` becomes `â€”`) and prepends a BOM
before `<!doctype html>`. It is invisible in a PowerShell console, which renders the mojibake
back as the original glyph. Use Node (`fs.writeFileSync(p, t, 'utf8')` never emits a BOM) or
an editor. Afterwards check the bytes: no `EF BB BF`, no `â[€‚]`.

---

## Tuning cheat sheet

All in `assets/js/motion.js`:

| Want to change | Value |
|---|---|
| Whole intro faster/slower | `entrance.timeScale` — 2.2 now; 1.5 was the old, slower feel |
| How long the intro waits for fonts | `entrance.fontWait` — every 0.1 s here is felt on arrival |
| How the headline cascade feels | `entrance.headline.stagger` — sweet spot 0.08–0.16 |
| When each step starts | `entrance.beats` — negative values overlap steps |
| Every magnet at once | `magnetic.strengthScale` — scales the HTML's `data-mag-strength` values too |
| How far a magnet lags the pointer | `magnetic.settle` — 0.18; above ~0.3 it reads as lag |
| Magnet detection distance | `magnetic.radius` |
| Delay before a clicked link navigates | `transition.outDuration` — 0.2 s, pure wait on every click |
| FAQ open / close | `accordion.open` / `.close` |
| Mobile menu | `mobileNav.*` |
| Hero screenshot tilt | `flourish.tilt.max` — 7° is clearly 3D and still credible |
| Panel edge glow | `flourish.glow.spread` / `.proximity` |
| Marquee scroll reactivity | `flourish.marquee.boost` / `.maxSkew` |
| Process rail beam timing | `rail.start` / `rail.end` / `rail.scrub` |
| Hero build (type / wireframe / wipe) | `entrance.build` |
| Rotating headline word | `rotator.hold` / `rotator.duration` |
| Agency strike-through | `strike.duration` / `strike.delayOnLoad` |
| Currency roll | `currency.out` / `currency.in` — keep it short, it answers a click |
| Hero card parallax | `flourish.parallax.ease`; depth per card is `data-depth` in the HTML |

## Interactive motion — what each piece is for

Every effect here answers "why does this move?" with something other than "it looks good".
If a new one can't, leave it out.

- **Hero build** (`index.html`). The screenshot sits in a browser frame and assembles itself
  on first load: the address types in, a wireframe draws, the real page wipes down over it,
  then the glass cards land. It shows what the studio *does*. It runs **in parallel** with the
  headline — inserted into the master timeline at an absolute time after everything else is
  placed — so the paragraph and the free-demo button arrive exactly as fast as before.
- **Rotating word** — "Small *business / clinic / café / homestay / studio*." Plays **once**,
  ~8 s, lands back on "business." and stops: endlessly moving text beside the main call to
  action pulls the eye off it. Hovering the headline replays it. Screen readers only ever hear
  "Small business." The headline's SplitText wrappers are reverted after the intro, which also
  means a resized window now reflows the headline instead of keeping frozen line breaks.
- **Agency strike-through** (home, services, pricing). The line draws across the agency figure
  as the card arrives. It is a `::after` whose length is the `--strike` custom property, not a
  child element, because the currency toggle rewrites these elements' text.
- **Currency roll.** Pressing ₹ / $ rolls each changed price over, so it is obvious which
  numbers moved. It returns each figure to its own resting opacity (the agency price is
  deliberately dimmed), not to 1.
- **Tier cards** (pricing) lift on hover and carry the gold edge-glow that follows the cursor,
  as the light panels already did. The lift uses the CSS `translate` property: the scroll
  reveal leaves an inline `transform` on each card, which would silently beat a `:hover`.
- **Hero card parallax** — the two glass cards drift toward the pointer by their `data-depth`,
  also via `translate`, so they never fight the entrance timeline's `transform`.

**Two elements, one owner each.** Wherever something has both an entrance animation and a hover
effect, they live on separate elements — `[data-anim="media"]` outside, `.shot` inside — because
both write `transform`, and on one element they fought every frame through the intro. Keep it
that way when adding a new hero.

All of it is pointer-and-motion gated: no tilt, glow, parallax or replay on touch screens, and
under `prefers-reduced-motion` the build is shown finished, the word never rotates, the strike is
already drawn, prices swap instantly and the tiers do not move. With JavaScript off, the frame
shows the live site and the headline reads "Small business."

## Prices on the two navy cards

The navy cards on the homepage and at the top of the Pricing page show the **starting** price —
"from ₹6,499" — with a **See tiers** button directly underneath that jumps to `faq.html#tiers`.
The list beside the homepage figure is headed **In every tier** and may only contain things true
of Launch, Business *and* Custom: it used to describe the Business tier (up to 5 pages, the
booking flow), which became untrue the moment the price next to it changed. The Business price
(₹7,999) lives on the tier cards. `services.html`'s navy card still leads with ₹7,999.

Debug the entrance in the browser console: `CI.tl.progress(0.4)` scrubs to any frame.

---

## Publishing

Live at **https://forgetechs.netlify.app**. `netlify.toml` publishes `.` (the repo root *is*
the website) and runs `npm run build:css` as belt-and-braces; the committed `styles.css` is
complete, so deleting that command still deploys a working site.

**Deploy from git, not by dragging the folder.** The repo is 1.4 MB across 57 tracked files.
The folder on disk is **402 MB across 12,416 files**, because `node_modules/` and `archive/`
live inside it. Netlify Drop has no concept of `.gitignore`, so dragging the folder uploads all
402 MB and publishes the dead Next.js source in `archive/` to the public internet. A
git-connected deploy clones only what is tracked, which is exactly the site.

If the domain ever changes, update **all six canonical tags, all OG/Twitter URLs,
`sitemap.xml`, `robots.txt`, and every URL in the `index.html` JSON-LD graph.**

## Verifying a change

Always rebuild first:

```powershell
npx @tailwindcss/cli -i ./assets/css/tailwind.css -o ./assets/css/styles.css --minify
```

Then check, and report the numbers rather than claiming success:

1. **Tag balance** per page — count `<li[\s>]`, not `<li>`, or attributed items are missed,
   and **strip HTML comments first**: a literal tag written inside a comment is not a tag, and
   that false alarm has cost real time twice.
2. **Every local `src`/`href` resolves** (currently 231 refs, 0 broken).
3. **The JSON-LD blocks parse** — `index.html` (business + person + website graph) and
   `faq.html` (`FAQPage`).
4. **`node --check`** on every file in `assets/js/`.
5. **Open each page with JavaScript disabled** and confirm it is complete.
6. **Grep that prices and contact details are identical everywhere.**

There is no browser in the usual working environment, so visual appearance cannot be
confirmed by tooling — say so plainly rather than claiming the site "looks right".

## Before going live

- [ ] **`og.jpg` is set in Segoe UI, not Inter Tight.** The image was composed with sharp,
      which renders SVG text through *system* fonts and cannot load the vendored `.woff2`.
      Re-render it in the brand face once a `.ttf`/`.otf` of Inter Tight is available
      (`scratchpad/make-images.js` has the composition).
- [ ] Replace the placeholder `forgetechs.netlify.app` domain if a custom one is bought.
- [ ] **The free demo is now the primary ask on every page** — hero button, mobile menu,
      footer pill, and the reciprocity block on the homepage, all pointing at a WhatsApp
      message that asks for one. It replaced a "free site check", which assumed the visitor
      already had a site to check; a large share of the people this site targets do not.
      Worth keeping an eye on the load: a demo is real build work given away before any
      deposit, which sits slightly ahead of the "half up front to reserve the week" terms on
      `faq.html`. If it stops being sustainable, the lever is the CTA copy, not the guarantee.
- [ ] Consider a second case study — `work.html` carries an explicit "open slot" card, and the
      copy on that page is deliberately singular until there is a second live site.

## A pinch of gold — and a darker one for words

`--color-gold: #a8873c` is the accent, and it is **shapes only**: the live dot in the hero
eyebrow, the `01–04` numerals, the marker dot before each section label, the icon chips on the
floating cards, the tick marks, the rail dots and the hairline rules.

`--color-gold-ink: #7d6327` is the same accent **for lettering on the paper ground** — `.label`
and `.pill` text. It exists because #a8873c measures 3.33:1 on `#fdfdfd`: fine for a 5px dot,
not for an 11px word. The darker one is 5.60:1.

The split matters in both directions. On the **navy** surfaces (`.panel-ink`, `.curtain`,
`.mobile-nav`) plain `#a8873c` already measures 5.38:1, and the darker gold would *break* it,
dropping to 3.20:1 — so gold on navy is applied with an inline
`style="color:var(--color-gold)"`, and there is an **unlayered guard** at the end of
`tailwind.css` that forces it back even if someone pastes `text-gold-ink` into a dark panel.
Unlayered rules beat layered ones whatever the specificity; if that guard ever does visible
work, the markup is wrong.

If you want more gold, raise the opacity of `--color-gold-soft` rather than adding new places
it appears — the restraint is what keeps it reading as expensive.
