# Implementation Plan

## Direction

Build a polished executive portfolio for a product and business-minded builder with AI/product engineering as a strong secondary pillar. The first version emphasizes business acumen, credible professional presence, and a medium-complexity interaction layer.

## Decisions

- Audience: hiring managers and recruiters first; developer/creator peers second.
- Positioning: product/business-minded builder first; AI/product engineer second.
- Tone: polished executive, personal, strategic, and distinctive.
- Motion: medium complexity with scroll reveals, hover depth, filtering, and a lightweight animated canvas.
- Architecture: static-first now, Astro-ready later.
- Content: honest early-stage portfolio with case-study shells, project lab entries, and notes.

## Future Astro Migration

Recommended content collections:

- `case-studies`: title, summary, status, tags, businessQuestion, methods, outcomeTarget, date, featured.
- `projects`: title, summary, status, tags, tools, businessAngle, repoUrl, demoUrl, date.
- `notes`: title, summary, category, date, readingTime, featured.

## Validation Checklist

- Confirm homepage communicates value in under 30 seconds.
- Replace placeholder email and canonical domain before launch.
- Test at 375px, 768px, 1024px, and 1440px.
- Verify keyboard focus states and reduced-motion behavior.
- Run a static server and check there is no horizontal mobile scroll.
