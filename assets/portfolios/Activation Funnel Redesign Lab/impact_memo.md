# Impact Memo — Activation Funnel Redesign Lab

**Author:** Isaiah Moragne  
**Date:** May 2026  
**Dataset:** `bigquery-public-data.ga4_obfuscated_sample_ecommerce` (Nov 2020 – Jan 2021, 270,154 users)

---

## Problem

New users make up 89% of all visitors but convert at just 0.64% — compared to 9.73% for returning customers. That is a 15× activation gap concentrated entirely in users experiencing the checkout flow for the first time. The current default requires account creation before purchase, adding friction at the exact moment a new user is closest to buying. This is where revenue is being left on the table.

---

## Data

| Metric | Value |
|---|---|
| Overall activation rate (new users) | 0.64% |
| Activation rate (returning users) | 9.73% |
| Cart-to-checkout completion | 77.4% |
| Checkout-to-purchase completion | 45.5% |
| Total users in dataset | 270,154 |
| New users affected | ~240,441 |

The drop-off is not distributed evenly across the funnel. Discovery and browsing stages perform normally. The bottleneck is the checkout-to-purchase step — specifically, the account creation gate that intercepts new users before they can complete a transaction.

---

## Segment

**Target:** New users (first-session visitors who have not previously purchased)  
**Why this segment:** They represent 89% of total traffic and sit at a 0.64% activation rate — the largest addressable pool with the largest gap to the benchmark. A 50% relative improvement in this segment produces more incremental revenue than a 50% improvement in any other segment.

Segmentation queries confirmed that the new vs. returning gap holds across device types and traffic channels. Mobile and desktop behave similarly within each user cohort. The root cause is onboarding friction, not device-specific UI failure.

---

## Proposed Intervention

**Recommended: Variant B — Guest Checkout as the Default for New Users**

Make guest checkout the primary path for first-time visitors. Account creation is offered post-purchase, when the user has already received value and has a reason to save their information.

> *Hypothesis: Removing the account creation gate will increase new-user checkout completion rate by reducing abandonment at the highest-friction point in the funnel.*

Variant C (first-purchase welcome nudge for returning non-purchasers) is recommended as the follow-on test after Variant B concludes.

---

## Impact Estimate

The arithmetic, made explicit:

| Input | Value |
|---|---|
| Baseline new-user activation rate | 0.64% |
| Target activation rate (post-test) | 0.96% |
| Relative lift | +50% |
| New users in test window (14 days) | 24,088 (12,044 per group) |
| Baseline purchases | 1,539 |
| Projected purchases at 0.96% | 2,308 |
| **Incremental purchasers** | **769** |
| Average order value | $69.09 |
| **Projected revenue gain** | **$53,130** |

Statistical design: 80% power, α = 0.05, two-sided test. Sample size calculated via `scipy.stats` in `notebooks/02_sample_size.ipynb`.

---

## Implementation Scope

| Component | Estimate |
|---|---|
| Engineering (checkout flow branching) | 3–5 days |
| Design (guest checkout UX, post-purchase account prompt) | 2–3 days |
| Experiment instrumentation (flag + logging) | 1–2 days |
| Test runtime | 14 days |
| **Total calendar time to result** | **~3.5 weeks** |

Medium complexity. No backend schema changes required. Primary risk surface is the experiment flag and event logging layer.

---

## Risks and Limits

- **Email capture reduction:** Guest checkout collects less contact information, which may reduce retargeting reach. Monitor email opt-in rate as a guardrail metric.
- **Fraud exposure:** Guest checkout can increase fraudulent orders. Monitor fraud rate and chargeback volume throughout the test.
- **Dataset constraints:** This analysis uses a public sample dataset. Absolute numbers are illustrative; the directional finding and the 15× gap are the transferable signal.
- **What would change the recommendation:** If a segmentation cut revealed that the gap is device-specific (e.g., mobile-only), the intervention would shift toward a device-targeted checkout simplification rather than a universal guest flow.

---

*Full methodology, SQL queries, Python notebooks, and experiment design available in the GitHub repository.*  
*Live dashboards: Looker Studio (linked from isaiahmba.com/activation-funnel)*
