# Strategic Builder Portfolio

A dependency-free first version of Isaiah's personal portfolio website.

The site is built as static HTML, CSS, and JavaScript because the local Node runtime is present but `npm` is currently missing its CLI module. This keeps the portfolio runnable now and easy to migrate into Astro later.

## Run Locally

Open `index.html` directly in a browser.

For a local server with Python:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Structure

- `index.html` contains the semantic page structure and real starter copy.
- `styles.css` contains the executive visual system, responsive layout, hover states, and reduced-motion support.
- `scripts/app.js` contains scroll reveals, filters, command menu, strategy briefs, header state, and the lightweight canvas depth layer.
- `assets/` contains favicon and social preview artwork.
- `docs/` contains planning, SEO readiness, and content model notes.

## Interaction Notes

- Use the menu button in the header, or press `Ctrl+K` / `Cmd+K`, to open the command menu.
- Case-study and project cards include strategy brief dialogs.
- Case studies and lab entries can be filtered by theme or maturity state.
- Motion respects the user's reduced-motion preference.

## Next Content Updates

- Replace `your.email@example.com` with a preferred contact email.
- Add a canonical URL and sitemap once the live domain is chosen.
- Add a resume PDF and point the resume CTA to it.
- Convert case studies, projects, and notes into Astro content collections when package management is ready.
