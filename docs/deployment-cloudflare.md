# Cloudflare Pages Deployment

## Recommended Path

Use Cloudflare Pages with the GitHub repository as the production source.

This site is static HTML, CSS, JavaScript, images, PDFs, `robots.txt`, and `sitemap.xml`. It does not need a server, a Worker, or a build step for the current version.

## Why This Path

- The domain `isaiahmba.com` is already registered in Cloudflare.
- Cloudflare Pages can deploy directly from GitHub on every push to `main`.
- The project gets a temporary `*.pages.dev` URL for preview before the custom domain is attached.
- Cloudflare can create the DNS record automatically when adding the apex custom domain.
- The setup leaves room for future Workers, Pages Functions, Astro, analytics, forms, or edge redirects.

## Cloudflare Pages Settings

- Project type: Pages
- Source: GitHub
- Repository: `issa38/personal-project-website`
- Production branch: `main`
- Framework preset: None
- Build command: `exit 0`
- Build output directory: `.`
- Environment variables: none required

## Custom Domain Steps

1. Push the current local changes to GitHub.
2. In Cloudflare, open `Workers & Pages`.
3. Create a Pages project from GitHub.
4. Select `issa38/personal-project-website`.
5. Deploy with `exit 0` as the build command and `.` as the output directory.
6. Open the Pages project, then go to `Custom domains`.
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
python -m http.server 4173
```

Then open `http://localhost:4173`.

## When To Use Workers Later

Add a Worker or Pages Function only when the site needs dynamic behavior, such as a contact form endpoint, protected preview routes, custom analytics handling, server-side personalization, or advanced redirects.
