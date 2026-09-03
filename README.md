# Strategic Builder Portfolio

A static portfolio website for Isaiah Moragne, with a live homepage and two case-study pages (DCF model, activation funnel).

The site is plain HTML, CSS, and JavaScript with no build step. Fonts are self-hosted from `assets/fonts/`. The only runtime dependencies are two pinned CDN scripts with integrity hashes: Anime.js (homepage staggers and counters) and Chart.js (DCF page chart). `npm` is only needed for the test suite.

Design rules for the site are documented at the top of `styles.css` and in `docs/taste-audit.md`.

## Run Locally

Open `index.html` directly in a browser.

For a local server with Python:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Deploy

The recommended launch path is Cloudflare Pages connected to the GitHub repository. Use `exit 0` as the build command and `.` as the build output directory.

See `docs/deployment-cloudflare.md` for the Cloudflare Pages and `isaiahmba.com` setup checklist.

## Structure

- `index.html` contains the homepage structure and routing into the proof layer.
- `dcf-model.html` contains the flagship public-company DCF case-study MVP.
- `activation-funnel.html` contains the growth analytics case study.
- `styles.css` contains the visual system, responsive layout, hover states, and reduced-motion support.
- `scripts/app.js` contains scroll reveals, filters, command menu, header state, and dialogs.
- `scripts/anime-animations.js` contains the homepage counters and grid staggers.
- `assets/` contains the favicon, the social preview PNG, and the design manifest (`DESIGN.md`).
- `assets/fonts/` contains the self-hosted WOFF2 files (EB Garamond, Hanken Grotesk, JetBrains Mono).
- `assets/images/` contains the WebP images used on the site; originals live in git history.
- `assets/files/` contains the public resume PDF.
- `assets/portfolios/` contains public workbook assets and future portfolio artifacts.
- `docs/` contains planning, SEO readiness, and content model notes.
- `_headers` contains Cloudflare Pages security/canonical headers.

## Interaction Notes

- Use the menu button in the header, or press `Ctrl+K` / `Cmd+K`, to open the command menu.
- Case-study and project cards include strategy brief dialogs.
- The flagship DCF page includes an on-page model preview plus links to the workbook and template files.
- Case studies and lab entries can be filtered by theme or maturity state.
- Motion respects the user's reduced-motion preference.

## Next Content Updates

- Connect `isaiahmba.com` to the chosen hosting provider through Cloudflare.
- Deepen the written investment narrative that accompanies the DCF workbook.
- Add a production social preview image if the current SVG needs a richer branded card.
- Convert case studies, projects, and notes into Astro content collections when package management is ready.
