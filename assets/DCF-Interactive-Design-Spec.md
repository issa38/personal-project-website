# DCF Interactive Widget — Complete Design Specification
**Cognac Folio v2 | Portfolio Case Study: Apple Inc. (AAPL)**
*Version 1.0 — Ready for implementation*

---

## Understanding Lock (Confirmed)

### What is being built
A self-contained interactive Discounted Cash Flow (DCF) valuation widget embedded in a portfolio website. It lets visitors manipulate 3–4 key assumptions and see a live implied share price update, demonstrating financial modeling competence to recruiters and hiring managers.

### Why it exists
The portfolio lacks interactivity that proves quantitative skill beyond static screenshots. A live DCF widget signals financial acumen, product thinking, and technical capability simultaneously — the trifecta for a Finance MBA + Product Analyst role.

### Who it is for
**Primary gate:** Recruiters and hiring managers (30-second attention window, non-technical). Must be immediately readable with labeled presets.
**Secondary gate:** Finance practitioners who want to probe assumptions and stress-test the model.

### Key constraints
- Vanilla HTML/CSS/JS stack only (no React/Vue/Node)
- Anime.js v3 already loaded (use for all animations)
- Chart.js loaded for Phase 2 FCF visualization
- Cognac Folio v2 aesthetic (espresso/clay/slate palette, Noto Serif + Manrope + JetBrains Mono)
- Widget must work both embedded in a case study page AND as a standalone section
- Base case pre-loaded as default on mount

### Explicit non-goals
- Not a full DCF spreadsheet replica — 3–4 headline inputs only
- Not connected to live market data feeds
- No user accounts, no data persistence, no server
- No mobile-first complexity (desktop layout primary, responsive secondary)
- Not a general-purpose tool — Apple Inc. (AAPL) only

---

## Section 1 — Architecture

### Placement Strategy
The widget appears in three locations:
1. **Embedded** in the DCF case study page (`dcf-model.html`) — primary home
2. **Standalone interactive section** on the homepage (`index.html`) — previews the tool
3. **Linked** from case study cards — "Try the model →"

### File Architecture
```
scripts/
  dcf-widget.js          ← IIFE, exposes initDCFWidget(containerId, config)
  dcf-chart.js           ← Phase 2: Chart.js FCF visualization (separate file)
styles.css               ← DCF widget styles added to existing file (scoped to .dcf-*)
dcf-model.html           ← Existing page, mounts widget in #dcf-widget-root
index.html               ← Homepage section mounts widget with compact config
```

### Initialization API
```javascript
// Mount anywhere on any page
initDCFWidget("dcf-widget-root", {
  compact: false,        // true = homepage preview mode (hides chart, smaller)
  showChart: true,       // Phase 2 FCF bar chart
  defaultScenario: "base" // "bear" | "base" | "bull"
});
```

### Guard Rails
- IIFE pattern: `(function() { "use strict"; ... })()`
- Checks for container element existence before mounting
- Falls back gracefully if Chart.js not loaded (Phase 2 disabled, no errors)
- `prefersReducedMotion` check — skip Anime.js animations, show final state immediately

---

## Section 2 — Financial Model (EBIT-Based FCF)

### Formula Chain
The widget uses the same EBIT-based formula as the Excel workbook, not a simplified FCF margin shortcut.

```
Revenue(t)  = Revenue(t-1) × (1 + RevenueGrowth(t))
EBIT(t)     = Revenue(t) × EBITMargin(t)
NOPAT(t)    = EBIT(t) × (1 - TaxRate)
D&A(t)      = Revenue(t) × DA_Pct
CapEx(t)    = Revenue(t) × CapEx_Pct
ΔNWC(t)     = (Revenue(t) - Revenue(t-1)) × NWC_Pct
FCF(t)      = NOPAT(t) + D&A(t) - CapEx(t) - ΔNWC(t)

PV_FCF(t)   = FCF(t) / (1 + WACC)^t

TerminalValue = FCF(Year5) × (1 + TerminalGrowth) / (WACC - TerminalGrowth)
PV_Terminal   = TerminalValue / (1 + WACC)^5

EnterpriseValue = Σ PV_FCF(1..5) + PV_Terminal
EquityValue     = EnterpriseValue - NetDebt
ImpliedPrice    = EquityValue / SharesOutstanding
```

### Fixed Constants (from Excel workbook — do not make these sliders)
| Constant | Value | Source |
|---|---|---|
| Base Revenue Y0 | $416,161,000,000 | Model Inputs worksheet |
| Net Debt | $54,744,000,000 | Gross Debt $90,678M − Cash $35,934M |
| Diluted Shares Outstanding | 14,776,353,000 | Model Inputs worksheet |
| Current Market Price | $270.71 | Model Inputs worksheet |
| Tax Rate | 15.61% | Fixed, all scenarios |
| D&A (% of Revenue) | 2.81% | Fixed, all scenarios |
| CapEx (% of Revenue) | 3.06% | Fixed, all scenarios |
| NWC (% of ΔRevenue) | 3.00% | Fixed, all scenarios |

### Scenario Presets — Per-Year Revenue Growth Rates
Scenario buttons snap sliders to these exact values. The manual Revenue Growth slider applies a **uniform rate** across all 5 years (disclosed to user).

| Year | Bear | Base | Bull |
|---|---|---|---|
| Y1 | −3.96% | 3.20% | 7.88% |
| Y2 | −1.73% | 4.94% | 9.58% |
| Y3 | 1.87% | 6.78% | 11.49% |
| Y4 | 2.98% | 5.76% | 10.65% |
| Y5 | 3.53% | 4.95% | 9.68% |

### Scenario Presets — EBIT Margins Per Year
| Year | Bear | Base | Bull |
|---|---|---|---|
| Y1 | 30.58% | 33.97% | 36.27% |
| Y2 | 29.93% | 33.83% | 36.57% |
| Y3 | 29.31% | 33.69% | 36.75% |
| Y4 | 28.82% | 33.56% | 36.82% |
| Y5 | 28.38% | 33.43% | 36.78% |

### Scenario Presets — WACC and Terminal Growth
| | Bear | Base | Bull |
|---|---|---|---|
| WACC | 10.68% | 9.68% | 8.68% |
| Terminal Growth | 2.00% | 3.00% | 3.50% |

### Slider-Controlled Inputs (3 sliders)
| Slider | Range | Default (Base) | Step | Unit |
|---|---|---|---|---|
| Revenue Growth (uniform) | −5% → +15% | +4.93% (Base Y1–Y5 avg) | 0.1% | % |
| WACC | 6% → 14% | 9.68% | 0.1% | % |
| Terminal Growth | 1% → 5% | 3.00% | 0.1% | % |

**Disclosure note shown below Revenue Growth slider:**
> "Scenario presets use year-by-year rates from the model. This slider applies a uniform rate across all 5 years."

### Implied Price Output Display
```
Implied Price: $XXX.XX
vs. Market: $270.71  (±$XX.XX / ±X.X%)

[UNDERVALUED +X.X%] or [OVERVALUED −X.X%]
```
Color coding:
- Undervalued: `var(--clay)` amber tone (positive signal)
- Overvalued: `var(--slate)` muted tone (neutral/negative signal)

---

## Section 3 — Component Layout

### Full Widget Structure (desktop)
```
┌─────────────────────────────────────────────────────────────────┐
│  .dcf-widget                                                    │
│                                                                 │
│  ┌─────────────────────────────┐  ┌────────────────────────┐   │
│  │  .dcf-controls              │  │  .dcf-output           │   │
│  │                             │  │                        │   │
│  │  [BEAR]  [BASE]  [BULL]     │  │   Implied Price        │   │
│  │   preset scenario buttons   │  │   $XXX.XX              │   │
│  │                             │  │                        │   │
│  │  ── Revenue Growth ──       │  │   vs. Market $270.71   │   │
│  │  [━━━━━━●────────────]      │  │   ± $XX.XX / ±X.X%    │   │
│  │   4.9%  ←→                  │  │                        │   │
│  │  ⚠ Uniform rate disclosure  │  │   [UNDERVALUED +X.X%]  │   │
│  │                             │  │                        │   │
│  │  ── WACC ──────────────     │  │   ─────────────────    │   │
│  │  [────────●────────────]    │  │                        │   │
│  │   9.68%  ←→                 │  │   EV: $X.XXt           │   │
│  │                             │  │   Equity: $X.XXt       │   │
│  │  ── Terminal Growth ──      │  │   P/E implied: XX.Xx   │   │
│  │  [──────────────●──────]    │  │                        │   │
│  │   3.00%  ←→                 │  │                        │   │
│  └─────────────────────────────┘  └────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  .dcf-chart-area  (Phase 2 — Chart.js FCF bar chart)    │   │
│  │  Y1    Y2    Y3    Y4    Y5    Terminal Value           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario Button Styling
```css
.dcf-scenario-btn {
  /* Outlined by default */
  border: 1px solid var(--border);
  background: transparent;
  color: var(--on-surface-muted);
  font-family: var(--font-mono); /* JetBrains Mono */
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 180ms ease;
}

.dcf-scenario-btn.is-active {
  /* Bear: cool slate */
  border-color: var(--slate);
  color: var(--slate);
  background: rgba(133, 144, 144, 0.08);
  /* Base: warm clay */  [data-scenario="base"].is-active → var(--clay)
  /* Bull: bright clay */  [data-scenario="bull"].is-active → var(--clay-soft)
}
```

### Slider Styling
```css
.dcf-slider-track { position: relative; height: 2px; background: var(--border); }
.dcf-slider-fill  { height: 100%; background: var(--clay); transform-origin: left; }
.dcf-slider-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--clay); 
                    box-shadow: 0 0 0 3px rgba(147,121,89,0.2); }
input[type=range]  { opacity: 0; position: absolute; inset: 0; cursor: pointer; }
```

### Output Number Animation
When implied price updates:
- Animate the number from old value → new value using `anime()` counter tween (same pattern as homepage `data-count-up`)
- Duration: 600ms, easing: `easeOutExpo`
- The ± badge flips with a `translateY` flicker: 0 → -6px → 0 over 240ms

### Compact Mode (homepage embed)
- Hide `.dcf-chart-area`
- Single column layout (controls top, output below)
- Output shows price + comparison badge only (no EV/equity breakdown)
- Smaller padding, max-width: 520px, centered

---

## Section 4 — Data Flow

### Computation Trigger
```
User interaction (slider move OR scenario button click)
  → updateModel()
  → computeDCF()    ← pure function, no side effects
  → animateOutput() ← Anime.js tweens
  → updateChart()   ← Phase 2: Chart.js re-render
```

### State Object
```javascript
const state = {
  scenario: "base",         // "bear" | "base" | "bull"
  revenueGrowthUniform: 0.0493,  // slider value (only when scenario = null)
  wacc: 0.0968,
  terminalGrowth: 0.0300,
  // Computed (read-only, set by computeDCF)
  impliedPrice: null,
  enterpriseValue: null,
  equityValue: null,
  fcfByYear: [],            // [Y1, Y2, Y3, Y4, Y5]
  pvByYear: [],             // present values
  pvTerminal: null,
};
```

### computeDCF() — Pure Function Signature
```javascript
function computeDCF(params) {
  // params: { scenario, revenueGrowthUniform, wacc, terminalGrowth }
  // Returns: { impliedPrice, enterpriseValue, equityValue, fcfByYear, pvByYear, pvTerminal }
  
  const BASE_REVENUE = 416_161_000_000;
  const NET_DEBT     = 54_744_000_000;
  const SHARES       = 14_776_353_000;
  const TAX_RATE     = 0.1561;
  const DA_PCT       = 0.0281;
  const CAPEX_PCT    = 0.0306;
  const NWC_PCT      = 0.0300;
  
  // Per-year growth rates from scenario (or uniform from slider)
  const growthRates  = getGrowthRates(params);   // [g1, g2, g3, g4, g5]
  const ebitMargins  = getEBITMargins(params);    // [m1, m2, m3, m4, m5]
  
  // ... compute revenue, EBIT, NOPAT, FCF per year
  // ... discount to PV
  // ... compute terminal value
  // ... return results
}
```

### Slider → State Sync
When a slider moves:
- Set `state.scenario = null` (deselects scenario buttons)
- Update the relevant state field
- Trigger `updateModel()`

When a scenario button is clicked:
- Set `state.scenario = "bear" | "base" | "bull"`
- Snap slider values via Anime.js (see Section 5 for animation spec)
- Trigger `updateModel()`

---

## Section 5 — Animation Specification

### 5.1 Scenario Button Click → Slider Snap
When Bear/Base/Bull is clicked, all three sliders animate simultaneously to new positions:
```javascript
// Staggered spring physics — Anime.js v3
anime({
  targets: [revenueSlider, waccSlider, terminalSlider],
  value: [currentVal, targetVal],  // per-slider targets
  delay: anime.stagger(60),        // 60ms stagger between sliders
  duration: 700,
  easing: "spring(1, 80, 12, 0)", // spring mass=1, stiffness=80, damping=12, velocity=0
  update(anim) {
    // Sync visual fill track and text readout on every frame
    syncSliderUI(revenueSlider);
    syncSliderUI(waccSlider);
    syncSliderUI(terminalSlider);
    // Recompute DCF on each frame for live output
    updateModel();
  }
});
```

### 5.2 Scenario Button Active State Transition
```javascript
anime({
  targets: activeButton,
  scale: [0.96, 1],
  duration: 280,
  easing: "spring(1, 90, 14, 0)",
});
// Previous active button snaps out:
anime({
  targets: prevButton,
  scale: [1.02, 1],
  duration: 200,
  easing: "easeOutCubic",
});
```

### 5.3 Implied Price Number Tween
```javascript
const obj = { value: state.previousImpliedPrice };
anime({
  targets: obj,
  value: state.impliedPrice,
  duration: 600,
  easing: "easeOutExpo",
  update() {
    priceEl.textContent = "$" + obj.value.toFixed(2);
    syncDeltaBadge(obj.value);  // live delta label update
  },
  complete() {
    priceEl.textContent = "$" + state.impliedPrice.toFixed(2);
    priceEl.style.willChange = "auto";
  }
});
```

### 5.4 Delta Badge Flip (Undervalued ↔ Overvalued)
Only runs when sign changes (undervalued → overvalued or vice versa):
```javascript
anime.timeline()
  .add({ targets: badge, translateY: [0, -8], opacity: [1, 0], duration: 160, easing: "easeInCubic" })
  .add({ targets: badge, translateY: [8, 0],  opacity: [0, 1], duration: 200, easing: "easeOutCubic" });
```

### 5.5 Widget Mount Entrance (runs once on load)
```javascript
// Stagger controls → output → chart
anime.timeline({ autoplay: true })
  .add({ targets: ".dcf-scenario-group", opacity: [0,1], translateY: [16,0], duration: 480, easing: "easeOutCubic" })
  .add({ targets: ".dcf-slider-group",   opacity: [0,1], translateY: [16,0], delay: anime.stagger(90), duration: 560, easing: "spring(1,76,12,0)" }, "-=300")
  .add({ targets: ".dcf-output",         opacity: [0,1], translateX: [20,0], duration: 520, easing: "easeOutCubic" }, "-=400")
  .add({ targets: ".dcf-chart-area",     opacity: [0,1], translateY: [24,0], duration: 480, easing: "easeOutCubic" }, "-=200");
```

### 5.6 Slider Drag — Live Fill Track
On every `input` event (no animation, synchronous):
```javascript
const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
fillEl.style.transform = `scaleX(${pct / 100})`;
readoutEl.textContent  = formatSliderValue(slider.dataset.type, slider.value);
```

---

## Phase 2 Specification — Analyst's Desk (FCF Chart)

### Overview
Phase 2 adds a Chart.js bar chart beneath the controls/output grid showing projected FCF by year plus the present value of the terminal value. Updates live as sliders move.

### Chart Type
Grouped bar chart — two datasets per year:
1. **FCF (Nominal)** — bar fill: `rgba(147, 121, 89, 0.65)` (clay)
2. **PV of FCF** — bar fill: `rgba(133, 144, 144, 0.45)` (slate)
Plus a standalone **"PV Terminal Value"** bar (different color: `rgba(197, 186, 165, 0.55)`)

### Chart.js Config Skeleton
```javascript
const chartConfig = {
  type: "bar",
  data: {
    labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Terminal"],
    datasets: [
      {
        label: "FCF (Nominal)",
        data: [],    // populated from state.fcfByYear + state.pvTerminal
        backgroundColor: "rgba(147, 121, 89, 0.65)",
        borderColor: "rgba(147, 121, 89, 0.9)",
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: "PV of FCF",
        data: [],    // state.pvByYear + state.pvTerminal
        backgroundColor: "rgba(133, 144, 144, 0.4)",
        borderColor: "rgba(133, 144, 144, 0.7)",
        borderWidth: 1,
        borderRadius: 2,
      }
    ]
  },
  options: {
    responsive: true,
    animation: { duration: 400, easing: "easeOutQuart" },
    plugins: {
      legend: { labels: { color: "rgba(197,186,165,0.7)", font: { family: "Manrope" } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${(ctx.raw / 1e9).toFixed(1)}B`
        }
      }
    },
    scales: {
      x: { grid: { color: "rgba(197,186,165,0.06)" }, ticks: { color: "rgba(197,186,165,0.55)" } },
      y: { 
        grid: { color: "rgba(197,186,165,0.06)" }, 
        ticks: { color: "rgba(197,186,165,0.55)", callback: (v) => `$${(v/1e9).toFixed(0)}B` }
      }
    }
  }
};
```

### Chart Update on Slider Move
```javascript
function updateChart() {
  if (!chart) return;
  chart.data.datasets[0].data = [...state.fcfByYear, state.pvTerminal];
  chart.data.datasets[1].data = [...state.pvByYear, state.pvTerminal];
  chart.update("active");  // Chart.js built-in animation
}
```

### File: `scripts/dcf-chart.js`
Separate file, loaded only on pages that opt in (`showChart: true`). Exposes `initDCFChart(containerId)` and `updateDCFChart(state)`.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | 3 slider inputs only (Revenue Growth, WACC, Terminal Growth) | Full 10-input model; 5 inputs | 30-second recruiter window. 3 inputs = immediate comprehension. Other variables fixed constants. |
| 2 | Implied share price as primary output | EV output; IRR output; sensitivity table | Most legible to non-finance audience. "Is it cheap or not?" is the question everyone asks. |
| 3 | Bear/Base/Bull preset buttons | Sensitivity table; scenario dropdown; no presets | Presets serve both gates simultaneously — quick tap for recruiters, deep dive for practitioners. |
| 4 | Base case pre-loaded on mount | Bear default; no default (blank) | Base = consensus expectation. Anchors the visitor to a credible starting point before they explore. |
| 5 | Recruiter as first design gate | Finance practitioner first; equal weighting | Portfolio's primary conversion goal is getting a callback. Practitioners self-serve via sliders anyway. |
| 6 | New interactive companion, not modification to existing static case | Modify existing page layout; replace existing content | Preserves existing case study narrative. Widget adds a third layer of engagement on top of the story. |
| 7 | All three placements: embedded + standalone + homepage | Embedded only; homepage only | Maximum reach. Each placement serves a different visitor journey stage. |
| 8 | EBIT-based FCF formula (NOPAT + D&A − CapEx − ΔNWC) | Simple Revenue × FCF_Margin; EBITDA-based | Must match the Excel workbook exactly. EBIT-based is the standard professional DCF approach. |
| 9 | Per-year growth from scenario presets; uniform rate for manual slider | Force sliders to lock during scenario mode; hidden per-year rates | Transparency about the simplification. Manual slider discloses uniform-rate assumption inline. |
| 10 | Net Debt = $54,744M (model figure: Gross Debt − Cash) | User-stated $111,165M | Excel workbook is the authoritative source. Model figure is verifiable and defensible. |
| 11 | Chart.js for Phase 2 FCF visualization | D3.js; SVG hand-coded; Canvas API | Chart.js is already a common portfolio dependency, lightweight, no build step, sufficient for bar charts. |

---

## CSS Scope

All DCF widget styles are prefixed `.dcf-*` to avoid collision with existing Cognac Folio v2 styles. Key variables (already in `styles.css`, reused here):

```css
/* Already defined in styles.css — just reference these */
--clay:      #937959;
--clay-soft: #c5baa5;
--slate:     #859090;
--surface:   #1e1208;
--surface-dim: #241709;
--border:    rgba(197, 186, 165, 0.12);
--on-surface: #e8ddd0;
--on-surface-muted: rgba(197, 186, 165, 0.5);
--font-serif: 'Noto Serif', Georgia, serif;
--font-sans:  'Manrope', system-ui, sans-serif;
--font-mono:  'JetBrains Mono', 'Courier New', monospace;
```

---

## Implementation Checklist

### Phase 1 (Core Widget)
- [ ] Create `scripts/dcf-widget.js` — IIFE with `initDCFWidget()`
- [ ] Implement `computeDCF()` pure function with all constants
- [ ] Build scenario preset data tables (per-year growth + EBIT margins)
- [ ] Implement slider UI (custom track/fill/thumb over native `<input type=range>`)
- [ ] Wire Bear/Base/Bull buttons with Anime.js spring snap
- [ ] Implement `animateOutput()` with counter tween + delta badge flip
- [ ] Add `.dcf-*` styles to `styles.css`
- [ ] Mount on `dcf-model.html` with `showChart: false` initially
- [ ] Mount on `index.html` homepage section with `compact: true`
- [ ] Test: Base case implied price should be approximately $180–$220 range (validate against Excel)

### Phase 2 (FCF Chart)
- [ ] Create `scripts/dcf-chart.js`
- [ ] Add Chart.js `<script>` tag to relevant pages
- [ ] Implement `initDCFChart()` and `updateDCFChart()`
- [ ] Wire chart updates to slider `input` events (throttled to rAF)
- [ ] Test all three scenarios render correctly

### Validation
- [ ] `prefers-reduced-motion` — all animations skipped, final state shown immediately
- [ ] Keyboard accessible — sliders navigable via arrow keys
- [ ] Mobile — compact layout works at 320px minimum width
- [ ] `initDCFWidget()` called with non-existent container → no errors, no render
- [ ] Rapid slider movement → no animation queue buildup (use `anime.remove()` before re-animating)

---

*Spec completed: 2026-05-25 | Author: Claude (Cognac Folio v2 session)*
*This document is the authoritative implementation reference — no re-brainstorming required.*
