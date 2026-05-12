# Testing

The portfolio is a static site, but the testing layer protects against regressions whenever HTML, CSS, or JS changes.

## One-time setup

```bash
npm install
npx playwright install chromium
```

## Day-to-day commands

| Command | What it does |
| --- | --- |
| `npm run test:html` | Validates `index.html` and `dcf-model.html` against `html-validate` rules |
| `npm run test:e2e` | Runs the Playwright suite (filters, dialogs, preview panels, nav, axe) |
| `npm run test:a11y` | Runs only the axe-core accessibility scan |
| `npm run test:links` | Crawls the running site for 404s (requires `npm run serve` in another terminal) |
| `npm test` | Convenience: HTML validation + e2e suite |

## What each test covers

- `tests/e2e/filters.spec.js` — Case study and project lab filter buttons toggle correctly, status copy updates, hidden cards stay hidden.
- `tests/e2e/dialogs.spec.js` — Command menu opens via button and Ctrl+K; brief dialog renders content from `data-brief-*` attributes including bullet split on the `|||` separator.
- `tests/e2e/preview-panels.spec.js` — DCF preview tab switching; ARIA `tablist` → `tab` → `tabpanel` linkage via `aria-labelledby` and `aria-controls`.
- `tests/e2e/nav.spec.js` — Active nav link highlights as the matching section scrolls into view.
- `tests/e2e/a11y.spec.js` — axe-core scan on both pages against WCAG 2.0 A/AA and 2.1 A/AA.

## Adding a new test

Drop a new `*.spec.js` file under `tests/e2e/`. Playwright's `webServer` config auto-starts `serve` on port 4173, so tests can `page.goto('/index.html')` directly.

## Link checker

`linkinator` only verifies links it can reach over HTTP. Run `npm run serve` in one terminal, then `npm run test:links` in another. External hosts (LinkedIn, GitHub, Google Fonts) are skipped to avoid rate-limit false positives — they're not under our control.
