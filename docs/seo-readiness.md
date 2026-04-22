# SEO Readiness Notes

## Assumptions

- Site type: personal portfolio.
- Primary SEO goal: brand visibility for recruiters and peers.
- Target market/language: United States, English.
- Scope: v1 technical and on-page foundations only.

## Implemented

- One clear page title and meta description.
- Author meta tag and `Person` structured data with public profile links.
- Canonical URL for `https://isaiahmba.com/`.
- Semantic landmark structure with header, nav, main, sections, and footer.
- One primary H1 and logical section headings.
- Open Graph and Twitter card title, description, type, URL, and absolute preview image.
- Crawl-friendly `robots.txt` with sitemap location.
- Root `sitemap.xml` for the launch domain.
- Text content is present in the DOM, not hidden inside canvas or image-only experiences.
- Motion respects `prefers-reduced-motion`.
- Filter controls expose live status text for assistive technology.

## Launch Tasks

- Connect `isaiahmba.com` from Cloudflare to the chosen host.
- Confirm the absolute Open Graph image resolves after deployment.
- Add `WebSite` structured data if search or site-level actions are added later.
- Publish the in-progress public company DCF case study once the model and writeup are complete.
- Replace remaining project shells with real case studies as they become available.

## Current SEO Health

The current build is SEO-ready for a static v1 portfolio. Remaining launch risk is deployment-specific: DNS, hosting, and confirming the final hosted URLs resolve.
