# Cloudflare Deployment

## Recommended Path

Use Cloudflare Workers Static Assets or Cloudflare Pages with the GitHub repository as the production source.

This site is static HTML, CSS, JavaScript, images, PDFs, `robots.txt`, and `sitemap.xml`. It does not need application server code for the current version. The build step only copies the public site files into `dist/` so deploys do not upload source files, tests, docs, or `node_modules`.

## Why This Path

- The domain `isaiahmba.com` is already registered in Cloudflare.
- Cloudflare can deploy directly from GitHub on every push to `main`.
- The project gets a temporary preview URL before the custom domain is attached.
- Cloudflare can create the DNS record automatically when adding the apex custom domain.
- The setup leaves room for future Workers, Pages Functions, Astro, analytics, forms, or edge redirects.

## Cloudflare Workers Static Assets Settings

- Project type: Worker
- Source: GitHub
- Repository: `issa38/personal-project-website`
- Production branch: `main`
- Framework preset: None
- Deploy command: `npx wrangler deploy`
- Wrangler config: `wrangler.jsonc`

Wrangler runs `npm run build` from `wrangler.jsonc`, then deploys the `dist/` directory as static assets.

## Cloudflare Pages Alternative

- Project type: Pages
- Source: GitHub
- Repository: `issa38/personal-project-website`
- Production branch: `main`
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: none required

## Custom Domain Steps

1. Push the current local changes to GitHub.
2. In Cloudflare, open `Workers & Pages`.
3. Create a Workers or Pages project from GitHub.
4. Select `issa38/personal-project-website`.
5. Deploy with the settings above.
6. Open the project, then go to `Custom domains`.
7. Add `isaiahmba.com`.
8. Add `www.isaiahmba.com` as a second custom domain if you want the `www` variant to resolve.
9. In Cloudflare Redirect Rules, redirect `www.isaiahmba.com/*` to `https://isaiahmba.com/$1` with a permanent 301 redirect.
10. After deployment, verify:
    - `https://isaiahmba.com/`
    - `https://isaiahmba.com/sitemap.xml`
    - `https://isaiahmba.com/robots.txt`
    - `https://isaiahmba.com/assets/og-preview.svg`
    - `https://isaiahmba.com/assets/files/Isaiah%20Moragne%20-%20Resume.pdf`

## Local Preview

```powershell
npm run serve:dist
```

Then open `http://localhost:4173`.

## When To Use Workers Later

Add a Worker or Pages Function only when the site needs dynamic behavior, such as a contact form endpoint, protected preview routes, custom analytics handling, server-side personalization, or advanced redirects.
