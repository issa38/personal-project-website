# Taste-Skill Audit (2026-09-03)

> **Status: remediated on branch `taste-audit-fixes` (2026-09-03).** All six fix-plan steps below were applied. Verified after the changes: zero em/en-dashes in rendered text on all three pages; heroes end at 623px (home), 541px (DCF), and 569px (activation) at 1440×900 with CTAs above the fold; eyebrow counts 3 / 2 / 3; three radii on the whole site (4px, 8px, pill); self-hosted fonts load; no console errors; no horizontal overflow at 390px; 23/23 Playwright tests and axe checks pass. Two nav items were removed from the home sidebar because their sections merged (Dashboards into the Activation case, Notes into Lab); the `#notes` anchor is preserved.

Audit of `index.html`, `dcf-model.html`, `activation-funnel.html`, `styles.css`, and `scripts/` against the `design-taste-frontend` skill (github.com/Leonxlnx/taste-skill, `skills/taste-skill/SKILL.md`). Method: full code read of all three pages and the animation layer, CSS/JS greps for each mechanical rule, and DOM measurements in Chrome at 1430px wide.

## Design read

Reading this as: a developer/finance portfolio for hiring managers and recruiters, with an editorial "folio" language, built on native CSS + vanilla JS + Anime.js, on a dark moss/obsidian palette with EB Garamond, Hanken Grotesk, and JetBrains Mono.

Mode: **Redesign - Preserve.** Brand tokens exist (`assets/DESIGN.md`), the docs ask to keep the editorial style, and the IA/anchors are live. Nothing below proposes changing slugs, anchor IDs, nav labels, file paths, or the wordmark.

Dial read of the current site vs. the skill preset for "Portfolio (Developer)":

| Dial | Current | Preset | Recommendation |
|---|---|---|---|
| DESIGN_VARIANCE | 7 | 6 | Hold at 7. The split-panel sidebar and asymmetric hero are the site's signature. |
| MOTION_INTENSITY | 7 | 5 | Bring to 5. Cut unmotivated effects (see F-13). |
| VISUAL_DENSITY | 6 | 4 | Bring to 4. Cut copy and decorative chrome (F-2, F-4, F-5). |

Out of scope per skill section 13: the DCF widget, sliders, sensitivity grids, and the activation sizer are data UI. They were audited only where they break page-level locks (chart palette, placeholder dashes).

## Verdict

The bones are good: one dark theme held everywhere, a justified serif, real photography and a real interactive model instead of fake screenshots, real numbers from a real analysis, reduced-motion honored, solid a11y scaffolding, and tests. The site fails the Pre-Flight Check on **layering**: an editorial-folio device (section numerals, rule dividers, ledger strips, version stamps, margin notes, pulsing dots, mono comment labels) is applied to every section on every page, and the copy is roughly twice the skill's density budget. Most of the fix is deletion, not redesign.

Pre-flight tally: **24 fail, 4 partial, 21 pass, 8 not applicable.**

## Findings

Severity: **Fail** = hard rule in the skill's Pre-Flight Check. **Discouraged** = soft rule. Line numbers refer to the current commit (a144f37).

### Fail

**F-1. Em-dashes and en-dashes in visible text** (skill 9.G, zero allowed)
- `index.html:129` sidebar nav "§ I – II" (en-dash)
- `index.html:458`, `:556` image alt text ("… — evoking …")
- `index.html:671`, `:926`, `:964` body paragraphs
- `index.html:1056` command menu description
- `dcf-model.html:186` eyebrow "Interactive model — live in your browser"
- Runtime strings: `scripts/dcf-widget.js:30` "Y1–Y2", `:115`, `:156-214` "—" placeholders rendered into the widget; `scripts/activation-widget.js:145`
- Fix: replace with period, comma, or colon. Placeholders become a skeleton state, not a dash.

**F-2. Hero does not fit the viewport on any page** (skill 4.7)
- Home: hero is 1512px tall; CTAs bottom out at ~1050px; the two ledes are 53 and 45 words (budget: 20 total). Stack has 11 text elements against a max of 4: vol eyebrow, H1, 14-word italic tail inside the H1, byline with dot, manifesto, lede, lede, 3 CTAs, 5-row spec sheet, portrait with figure label and photo credit, baseline strip.
- DCF: H1 wraps to 3 lines at 85.8px; lede 39 words; 3 CTAs plus a pill strip under the CTAs.
- Activation: H1 wraps to 5 lines at 85.8px; lede 42 words; 5 CTAs in 2 rows plus a pill strip; hero ends at 1172px.
- Fix: H1 = name only (home) or a ≤2-line headline (cases), one ≤20-word lede, 1 primary + 1 secondary CTA. Move the spec sheet into the Resume section. Delete the pill strips (`case-status-list`).

**F-3. H1 semantics.** `index.html:233-237` puts a 14-word sentence inside the `<h1>`, so the page's heading reads "Isaiah Moragne MBA in Finance. Product analyst. I find where value hides, then build the fix." Move the tail to a `<p>`. Also an oversized-H1 tell: the wordmark clamps to 9.6rem (153.6px measured). Cap at ~6.5rem.

**F-4. Eyebrow budget** (skill 4.7, max ceil(sections/3))
- Home: 12 `.eyebrow` + 9 rule-dividers + 9 section-folio labels + hero-vol + 4 metric labels across 11 sections. Budget: 4.
- DCF: 13 eyebrows / 8 sections. Budget: 3.
- Activation: 15 eyebrows / 9 sections. Budget: 3.
- `styles.css` has 35 uppercase+tracking rules.
- Fix: keep eyebrows only on the hero and two sections per page; delete the rest. Headlines already name the section.

**F-5. Section-number eyebrows, rule dividers, and folio numerals** (skill 9.F). Every section on every page carries three decorative blocks: `.rule-divider` ("§ III · V", "Case files · the receipts"), `.section-folio` (a rotate-in "§ III" numeral plus a floating right-aligned label), and a `.eyebrow`. That is 27 decorative blocks on the home page alone. Also `.snav-folio` in the sidebar nav, method cards numbered 01-04 (`index.html:388-405`), pipeline steps 01-06 (`activation-funnel.html:256-284`). Numbering only earns its place where order carries information; the pipeline qualifies, the method cards and section folios do not.

**F-6. Floating top-right sub-text in section headers** (skill 9.F). `.section-folio small` ("Working principles, rule of four", "Toolkit, in plain English", "Snapshot") floats right on every section. The `.method-intro.with-marginalia` block (`index.html:366-384`) is the banned split-header: big headline left, small explainer paragraph right.

**F-7. Version labels and stamps** (skill 9.F). "Vol. 0.5 / Issue 01" (`index.html:113`), "Vol. 0.5 / Issue 01 / Functional Model" as the hero eyebrow (`:232`), "v. 0.4 · Last entry 2026.05" (`:175`). Delete all three.

**F-8. Decorative status dots and middle-dot chains** (skill 9.F). Four pulsing LED dots: sidebar status (`:171`), hero byline dot (`:239`, pure decoration), ledger strip on both case pages. Middle-dot chains up to 6 per line: byline (`:240`), spec status (`:282`), ledger strips ("Stack · BigQuery · SQL · Python · Looker Studio · Claude", `activation-funnel.html:87`). Keep one dot, on "Open to work", if it is real availability state. Replace chains with commas or line breaks.

**F-9. Hero-bottom decoration strip and scroll cue** (skill 9.F). `.hero-baseline` renders "Folio § 00 / Cover" and "↓ Read on" (`index.html:309-312`). Both explicitly banned. Delete the element.

**F-10. Figure label and photo-credit caption overlaid on the portrait** (skill 9.F). `data-fig="Fig. 01"` and "Working portrait, 2026. Photo by Isaiah." via `.fig-frame::before/::after` (`index.html:294-298`, `styles.css:2754-2780`). Let the portrait stand alone.

**F-11. Performative-craftsman labels and micro-meta** (skill 9.F). "// margin note", "(field notebook, 2025-11)" (`index.html:376-382`); "// title", "// toolkit", "// status", "// based", "// latest" (`:273-289`); "Notes from the field", "Case files · the receipts", "The lab · still cooking", "Notes · said out loud", "Colophon · get in touch". The ledger strips on both case pages ("Flagship case · live workbook, AAPL / Refreshed · 2026.04.29 / Scope · … / Status · Published MVP") are version-footer content. Use plain functional labels or none.

**F-12. Copy self-audit** (skill 4.9). Strings to rewrite:
- `index.html:250-252` "mapping how work actually flows in ugly text flow sheets, pricing the gaps not just on tender but also time" (unclear: "on tender")
- `:286` "U.S.A; or wherever I'm needed" (semicolon)
- `:338` "not just for the sake of zeitgeist"
- `:348` "Time value doesn't end with money."
- `:572` "Trying to identify and solve the sunk cost of operations." (sunk cost is not the concept meant)
- `:581` "Mathematical changes only last as long as someone cares, AI never gets bored." (comma splice; unclear)
- `:748` "Consistent 1% growth always outpaces business cycles." (unsupported claim, unrelated to the Python card)
- `:759` "Attach weight to the words we carry." (mock-poetic)
- `:892-893` "The question I keep asking is this. what's different on Monday morning" (broken punctuation)
- `:923` "Sharpened by product analysis across startup and enterprise."
- Value prop stated three times in the hero: H1 tail, manifesto, meta description. Keep one.
- Job title varies: "Product Requirements Analyst", "Senior Product Analyst", "Product analyst", "requirements analyst" (meta). Pick one and use it everywhere, including `theme-color` and JSON-LD.
- "Dashboards" section (`:654-707`) promises dashboards and shows a hallway photo plus four stat tiles. Either embed a real dashboard screenshot or fold the tiles into the Activation case.

**F-13. Motion not motivated** (skill 5, 5.D)
- `scripts/app.js:504` `window.addEventListener("scroll")`. rAF-throttled and passive, but the skill bans it outright. Header state: IntersectionObserver on a 16px sentinel. Progress bar: CSS `animation-timeline: scroll()` with the JS as fallback. Parallax (`data-parallax="0.04"` on one image): delete.
- `scripts/anime-animations.js`: magnetic buttons (12) create a new anime instance on every mousemove for every `.button-primary` and `.nav-cta`; folio numeral rotate-in (13); ledger cascade (14); scroll-progress flash on load (15). None communicates hierarchy, story, feedback, or state. Delete 12-15. Keep hero entrance (shorten to ≤1.2s total), grid staggers, counters, card spotlight.
- Three pulsing `ledger-pulse` animations (infinite loops with no semantic state).
- `styles.css:3981` sets `will-change: transform, opacity` on all 48 `.reveal` elements. Remove; the JS already resets it.
- Four layered ambient backgrounds behind the hero: hot-linked Unsplash forest (`styles.css:76`), 96px hairline grid (`body::after`, banned as "crosshair / hairline grid lines as decoration"), grain overlay, and the `strategy-canvas`. Keep the photo and grain; delete the grid; make the canvas earn its place or delete it.

**F-14. Color Consistency Lock** (skill 4.2). `scripts/dcf-chart.js:30-31,66-67` paints the FCF bars cognac brown (`rgba(147,121,89)`) with a `rgba(35,18,8)` tooltip. That is the retired "Cognac Folio" palette (still named in the headers of `anime-animations.js` and `dcf-widget.js`). Page accent is moss `#8c9b73` / `#bdcca1`. Re-skin the chart from the `--dcf-*` tokens. Also: three conflicting design manifests live in `assets/` (`DESIGN.md` Organic Atmospheric, `Ceramic Noir - Full Design Manifest.md`, `DCF-Interactive-Design-Spec.md`). Keep one.

**F-15. Shape Consistency Lock** (skill 4.4). 20 distinct `border-radius` values in `styles.css` (tokens 2/4/8px plus 1, 3, 5, 6, 9, 10, 18, 50%, 999px). The brand doc's rule is buttons/inputs 4px, cards 8px. Write that rule as a comment at the top of `styles.css`, add a pill token for chips and dots, and collapse everything else onto the three tokens.

**F-16. Duplicate CTA intent** (skill 4.5)
- Home, resume intent: "Resume" (hero ghost), "Open resume" (resume section), "Resume" (contact). Keep one label.
- Home, case-study intent: "Browse case files", "Open flagship case", "Open case study", "Open full case & workbook".
- DCF page, workbook intent: "Open workbook" (hero), "Open showcase workbook" (rail), plus "Download workbook" and "Open workbook" on the home page.
- Activation page, memo intent: "Download impact memo", "Read memo preview", "Download memo PDF", "Download one-page memo". Repo intent: "View on GitHub", "View the repo", "View repo". "Back to case studies" appears twice per case page.

**F-17. Section-layout repetition and card overuse** (skill 4.7, 4.4, 9.C). The equal-card grid family appears in 7 of 11 home sections: metrics band (4), method (2x2), dash metrics (4), capabilities (3x2), lab (2), notes rows, related cases. All cards are the same tinted panel with text; only the case grid carries images (Bento Background Diversity fails). DCF `sheet-grid` is 11 identical cards, the banned spec-sheet pattern. Fixes: metrics band → single-column statement list with one hairline between items; capabilities → two-column definition list, no boxes; sheet-grid → three grouped clusters (Outputs / Inputs and build / Data and checks) with one heading each; notes → keep as rows but drop the box.

**F-18. Content density** (skill 4.9). Section intros run 40-50 words against a 25-word default. Home has 11 sections. Merge: metrics band into Method; Dashboards into the Activation case; Notes into Lab. Target 8 sections.

**F-19. Hand-rolled SVG icons** (skill 3.C, 9.E). Nine hand-drawn paths: LinkedIn, GitHub, command, hamburger, arrow (x4), close, mail, download. For a no-build site, paste the official SVG from Tabler Icons or Phosphor (same stroke width, 1.5) so the family is consistent.

**F-20. Google Fonts via `<link>`** (skill 3.A). Three families, 14 weights, on every page. Self-host subset woff2 files with `font-display: swap`. Trim to EB Garamond 400/500 + italic 400, Hanken Grotesk 400/600, JetBrains Mono 500.

**F-21. Locale strip** (skill 9.F, discouraged bordering on fail). "Based in the U.S." in the sidebar foot and "// based  U.S.A; or wherever I'm needed" in the hero spec sheet. One plain "Based in the U.S." in the contact section is enough.

### Partial

**P-1. Empty, loading, error states.** Filter status live regions exist (good). The command menu has no "No matching sections" state when the search filters everything out. The DCF widget renders "—" placeholders before init; use a skeleton that matches the final layout.

**P-2. Nav height.** Case-page header measures 82px against an 80px cap (default 64-72). Home sidebar is 400px wide at 1440px (28% of the viewport) for ten links; cap the clamp at ~300px.

**P-3. Italic descender clearance.** `.hero-wordmark` sets `line-height: 0.88`, and the italic tail ("…hides, then build the fix.") inherits it with y/g/p descenders. Give the tail its own `line-height: 1.15` and bottom reserve. Check every `.accent-italic` H2 ("Skipping", "upstairs", "receipts", "reinforcing") the same way.

**P-4. Ghost buttons.** `rgba(255,255,255,0.02)` fill with a 0.12 white border on obsidian is below the 3:1 non-text contrast guideline. Raise the border to ~0.28.

### Performance and delivery (skill 6.D, redesign 11.B)

- `assets/images/AdobeStock_251514935.jpeg` is **13.4 MB** and ships lazily on the home page. Export a 1600px WebP under 300 KB. `Diploma.jpg` is 2.6 MB.
- 10 unused files in `assets/images/` (about 35 MB, including a 23 MB AdobeStock JPEG). Delete or move to `deprecated/`.
- 7 of 8 `<img>` tags have no `width`/`height`, so every lazy image shifts layout (CLS).
- `body::before` hot-links a 1920px Unsplash photo (`styles.css:76`). Licensing and availability risk, and the README calls the site dependency-free. Ship a local WebP.
- CDN scripts have no `integrity` hash and Chart.js is unpinned (`chart.js@4`). Pin and add SRI.
- `og:image` is an SVG. LinkedIn, X, and Slack do not render SVG previews. Export a 1200x630 PNG.
- Global `scroll-behavior: smooth` is fine, but note it also applies to programmatic scrolls in tests.

### Pass

Theme lock (dark everywhere, `color-scheme: dark`, dark-only is justified by `assets/DESIGN.md`), serif justified and on the approved list, no Inter, real portrait and licensed photography, real component preview instead of a fake screenshot, numbers trace to the published analysis, reduced-motion honored in CSS and all four scripts, `:focus-visible` rings, skip link, live regions, breadcrumbs, `100dvh` not `h-screen`, no pure `#000`/`#fff`, no emoji, no custom cursor, no marquee, no zigzag, no gradient text, no AI-purple, canvas pauses offscreen, mobile collapse declared for every grid (breakpoints 900/720/480/390), no horizontal overflow at 1430px, Playwright + axe suite exists.

Not visually verified: mobile layout (the Chrome window in this environment would not resize below 1430px). The CSS declares collapses explicitly, and the last four commits were mobile fixes.

## Fix plan (skill 11.D order, targeted evolution)

1. **Copy and type (Lever 1, biggest lift).** F-1, F-2, F-3, F-12, F-16. Hero to 4 elements on each page. One job title. One resume label, one contact label, one memo label.
2. **Spacing and rhythm (Lever 2).** F-4, F-5, F-6, F-7, F-8, F-9, F-10, F-11, F-18, F-21. Delete the rule-divider, section-folio, hero-baseline, ledger-strip, marginalia, and fig-frame blocks. Eyebrow budget 4/3/3. Merge to 8 home sections.
3. **Color and shape (Lever 3).** F-14, F-15, P-4. Chart on moss tokens. Three radii. One design manifest. Rename "Cognac Folio" headers.
4. **Motion (Lever 4).** F-13. Motion dial 7 → 5. Replace the scroll listener. Delete magnetic, rotate-in, cascade, flash, parallax, grid background. Keep entrance, reveals, counters, spotlight.
5. **Delivery.** F-19, F-20, performance list. Self-hosted fonts, local hero background, image compression and dimensions, SRI, PNG og image, delete unused assets.
6. **Layout (Lever 5, last).** F-17, P-2. De-card the metrics band, capabilities, and sheet grid. Narrow the sidebar.

Levers 1-4 are deletions and copy edits inside existing components and carry no IA or SEO risk. Lever 6 is the only structural change.
