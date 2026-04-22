# Strategic Builder Portfolio

A dependency-free first version of Isaiah's personal portfolio website.

The site is built as static HTML, CSS, and JavaScript so the portfolio is easy to host now and easy to migrate into Astro later. `npm` is available on the machine again, but this first version does not require a package install or build step.

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

- `index.html` contains the semantic page structure and real starter copy.
- `styles.css` contains the executive visual system, responsive layout, hover states, and reduced-motion support.
- `scripts/app.js` contains scroll reveals, filters, command menu, strategy briefs, header state, and the lightweight canvas depth layer.
- `assets/` contains favicon and social preview artwork.
- `assets/files/` contains the public resume PDF.
- `docs/` contains planning, SEO readiness, and content model notes.
- `_headers` contains Cloudflare Pages security/canonical headers.

## Interaction Notes

- Use the menu button in the header, or press `Ctrl+K` / `Cmd+K`, to open the command menu.
- Case-study and project cards include strategy brief dialogs.
- Case studies and lab entries can be filtered by theme or maturity state.
- Motion respects the user's reduced-motion preference.

## Next Content Updates

- Connect `isaiahmba.com` to the chosen hosting provider through Cloudflare.
- Complete and publish the in-progress public company DCF case study.
- Add a production social preview image if the current SVG needs a richer branded card.
- Convert case studies, projects, and notes into Astro content collections when package management is ready.
