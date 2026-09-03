/**
 * dcf-widget.js: interactive DCF widget
 * Apple Inc. (AAPL), 5-year EBIT-based DCF, three-slider edition
 *
 * Usage: add data-init-dcf-widget to any div, optionally:
 *   data-dcf-compact="true"   → compact single-column layout
 *   data-dcf-chart="true"     → show Phase 2 FCF bar chart
 *   data-dcf-scenario="base"  → starting scenario (bear|base|bull)
 *
 * Requires Anime.js v3 (optional, degrades gracefully without it)
 * Requires dcf-chart.js + Chart.js for chart display (optional)
 */
(function () {
  "use strict";

  /* ── Constants (from AAPL workbook "Model Inputs") ────────── */
  var BASE_REVENUE = 416161000000;
  var NET_DEBT     = 54744000000;   // Gross Debt $90,678M − Cash $35,934M
  var SHARES       = 14776353000;
  var MARKET_PRICE = 270.71;
  var TAX_RATE     = 0.1561;
  var DA_PCT       = 0.0281;
  var CAPEX_PCT    = 0.0306;
  var NWC_PCT      = 0.0300;

  /* ── Scenario presets (workbook "Model Inputs" worksheet) ─── */
  var SCENARIOS = {
    bear: {
      label: "Bear",
      note: "Negative growth in Y1 to Y2, slow recovery, higher discount rate.",
      growth:    [-0.0396, -0.0173,  0.0187,  0.0298,  0.0353],
      ebitMargin: [0.3058,  0.2993,  0.2931,  0.2882,  0.2838],
      wacc:       0.1068,
      terminalG:  0.0200
    },
    base: {
      label: "Base",
      note: "Conservative recovery, stable margins, consensus discount rate.",
      growth:    [0.0320,  0.0494,  0.0678,  0.0576,  0.0495],
      ebitMargin: [0.3397,  0.3383,  0.3369,  0.3356,  0.3343],
      wacc:       0.0968,
      terminalG:  0.0300
    },
    bull: {
      label: "Bull",
      note: "Strong top-line growth, margin expansion, lower cost of capital.",
      growth:    [0.0788,  0.0958,  0.1149,  0.1065,  0.0968],
      ebitMargin: [0.3627,  0.3657,  0.3675,  0.3682,  0.3678],
      wacc:       0.0868,
      terminalG:  0.0350
    }
  };

  /* ── Pure DCF computation ─────────────────────────────────── */
  function computeDCF(params) {
    var scenario        = params.scenario;
    var uniformGrowth   = params.uniformGrowth;   // decimal  e.g. 0.05
    var wacc            = params.wacc;             // decimal  e.g. 0.0968
    var termG           = params.terminalG;        // decimal  e.g. 0.03

    // Guard: WACC must exceed terminal growth
    if (wacc <= termG) {
      return { impliedPrice: NaN, enterpriseValue: NaN, equityValue: NaN, fcfByYear: [], pvByYear: [], pvTerminal: NaN };
    }

    var s = scenario ? SCENARIOS[scenario] : null;
    var growthRates  = s ? s.growth     : [uniformGrowth, uniformGrowth, uniformGrowth, uniformGrowth, uniformGrowth];
    var ebitMargins  = s ? s.ebitMargin : SCENARIOS.base.ebitMargin;
    var effWacc      = s ? s.wacc       : wacc;
    var effTermG     = s ? s.terminalG  : termG;

    var prevRevenue = BASE_REVENUE;
    var fcfByYear   = [];
    var pvByYear    = [];
    var sumPV       = 0;

    for (var t = 1; t <= 5; t++) {
      var rev    = prevRevenue * (1 + growthRates[t - 1]);
      var ebit   = rev * ebitMargins[t - 1];
      var nopat  = ebit * (1 - TAX_RATE);
      var da     = rev * DA_PCT;
      var capex  = rev * CAPEX_PCT;
      var dNWC   = (rev - prevRevenue) * NWC_PCT;
      var fcf    = nopat + da - capex - dNWC;
      var pv     = fcf / Math.pow(1 + effWacc, t);

      fcfByYear.push(fcf);
      pvByYear.push(pv);
      sumPV += pv;
      prevRevenue = rev;
    }

    var fcfY5          = fcfByYear[4];
    var terminalValue  = fcfY5 * (1 + effTermG) / (effWacc - effTermG);
    var pvTerminal     = terminalValue / Math.pow(1 + effWacc, 5);
    var enterpriseValue = sumPV + pvTerminal;
    var equityValue    = enterpriseValue - NET_DEBT;
    var impliedPrice   = equityValue / SHARES;

    return {
      impliedPrice:    impliedPrice,
      enterpriseValue: enterpriseValue,
      equityValue:     equityValue,
      fcfByYear:       fcfByYear,
      pvByYear:        pvByYear,
      pvTerminal:      pvTerminal,
      sumPV:           sumPV,
      wacc:            effWacc,
      terminalG:       effTermG
    };
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function fmtTrillions(n) {
    if (!isFinite(n)) return "n/a";
    var abs = Math.abs(n);
    if (abs >= 1e12) return (n < 0 ? "-" : "") + "$" + (abs / 1e12).toFixed(2) + "T";
    return (n < 0 ? "-" : "") + "$" + (abs / 1e9).toFixed(0) + "B";
  }

  function avgOf(arr) {
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  /* ── Build widget HTML ────────────────────────────────────── */
  function buildHTML(uid, compact, showChart) {
    return [
      '<div class="dcfw-header">',
        '<div class="dcfw-ticker-block">',
          '<span class="dcfw-ticker-symbol">AAPL</span>',
          '<span class="dcfw-ticker-sep" aria-hidden="true">&middot;</span>',
          '<span class="dcfw-ticker-name">Apple Inc.</span>',
        '</div>',
        '<span class="dcfw-tag">5yr &middot; EBIT-based DCF &middot; Live</span>',
      '</div>',

      '<div class="dcfw-body">',

        '<!-- Controls -->',
        '<div class="dcfw-controls">',

          '<div class="dcfw-scenario-group" role="group" aria-label="Valuation scenario">',
            '<button class="dcfw-scenario-btn" type="button" data-scenario="bear" aria-pressed="false">Bear</button>',
            '<button class="dcfw-scenario-btn dcfw-scenario-btn--active" type="button" data-scenario="base" aria-pressed="true">Base</button>',
            '<button class="dcfw-scenario-btn" type="button" data-scenario="bull" aria-pressed="false">Bull</button>',
          '</div>',
          '<p class="dcfw-scenario-note" data-dcfw-note>',
            SCENARIOS.base.note,
          '</p>',

          '<div class="dcfw-sliders">',

            '<div class="dcfw-slider-group" data-slider="revenue">',
              '<div class="dcfw-slider-hd">',
                '<label class="dcfw-slider-label" for="dcfw-rev-' + uid + '">Revenue Growth</label>',
                '<output class="dcfw-slider-readout" id="dcfw-rev-out-' + uid + '"></output>',
              '</div>',
              '<div class="dcfw-track-wrap">',
                '<div class="dcfw-track" aria-hidden="true"><div class="dcfw-fill"></div></div>',
                '<input class="dcfw-range" type="range" id="dcfw-rev-' + uid + '" min="-5" max="15" step="0.1" value="5.13" aria-label="Revenue growth rate (uniform across all 5 years)">',
              '</div>',
              '<p class="dcfw-slider-note">Scenario presets use per-year rates from the workbook. Slider applies a uniform rate.</p>',
            '</div>',

            '<div class="dcfw-slider-group" data-slider="wacc">',
              '<div class="dcfw-slider-hd">',
                '<label class="dcfw-slider-label" for="dcfw-wacc-' + uid + '">WACC</label>',
                '<output class="dcfw-slider-readout" id="dcfw-wacc-out-' + uid + '"></output>',
              '</div>',
              '<div class="dcfw-track-wrap">',
                '<div class="dcfw-track" aria-hidden="true"><div class="dcfw-fill"></div></div>',
                '<input class="dcfw-range" type="range" id="dcfw-wacc-' + uid + '" min="6" max="14" step="0.1" value="9.68" aria-label="Weighted average cost of capital">',
              '</div>',
            '</div>',

            '<div class="dcfw-slider-group" data-slider="terminal">',
              '<div class="dcfw-slider-hd">',
                '<label class="dcfw-slider-label" for="dcfw-term-' + uid + '">Terminal Growth</label>',
                '<output class="dcfw-slider-readout" id="dcfw-term-out-' + uid + '"></output>',
              '</div>',
              '<div class="dcfw-track-wrap">',
                '<div class="dcfw-track" aria-hidden="true"><div class="dcfw-fill"></div></div>',
                '<input class="dcfw-range" type="range" id="dcfw-term-' + uid + '" min="1" max="5" step="0.1" value="3.00" aria-label="Long-run terminal growth rate">',
              '</div>',
            '</div>',

          '</div>',
        '</div>',

        '<!-- Output -->',
        '<div class="dcfw-output" aria-live="polite" aria-atomic="false">',
          '<p class="dcfw-output-eyebrow">Implied share price</p>',
          '<strong class="dcfw-output-price" data-dcfw-price></strong>',
          '<div class="dcfw-market-row">',
            '<span class="dcfw-market-label">vs. Market</span>',
            '<span class="dcfw-market-ref">$' + MARKET_PRICE.toFixed(2) + '</span>',
          '</div>',
          '<div class="dcfw-delta-row">',
            '<span class="dcfw-delta-abs" data-dcfw-delta-abs></span>',
            '<span class="dcfw-delta-sep" aria-hidden="true">/</span>',
            '<span class="dcfw-delta-pct" data-dcfw-delta-pct></span>',
          '</div>',
          '<div class="dcfw-badge" data-dcfw-badge data-tone="neutral">',
            '<span class="dcfw-badge-label" data-dcfw-badge-label></span>',
          '</div>',
          !compact ? [
            '<div class="dcfw-output-sub">',
              '<div class="dcfw-sub-row">',
                '<span>Enterprise Value</span>',
                '<strong data-dcfw-ev></strong>',
              '</div>',
              '<div class="dcfw-sub-row">',
                '<span>Equity Value</span>',
                '<strong data-dcfw-equity></strong>',
              '</div>',
              '<div class="dcfw-sub-row dcfw-sub-dim">',
                '<span>Net Debt (Gross&minus;Cash)</span>',
                '<strong>$54.74B</strong>',
              '</div>',
            '</div>'
          ].join('') : '',
        '</div>',

      '</div>',

      showChart ? [
        '<div class="dcfw-chart-area">',
          '<p class="dcfw-chart-label">Free cash flow forecast &middot; 5 years + terminal PV</p>',
          '<div class="dcfw-chart-wrap">',
            '<canvas id="dcfw-canvas-' + uid + '" class="dcfw-canvas"></canvas>',
          '</div>',
        '</div>'
      ].join('') : ''
    ].join('');
  }

  /* ── Sync slider fill + readout (synchronous, no animation) ─ */
  function syncSliderUI(slider) {
    var group   = slider.closest("[data-slider]");
    if (!group) return;
    var fill    = group.querySelector(".dcfw-fill");
    var readout = group.querySelector(".dcfw-slider-readout");
    var val = parseFloat(slider.value);
    var min = parseFloat(slider.min);
    var max = parseFloat(slider.max);
    var pct = (val - min) / (max - min);
    if (fill) fill.style.transform = "scaleX(" + Math.max(0, Math.min(1, pct)) + ")";
    if (readout) readout.textContent = val.toFixed(2) + "%";
  }

  /* ── Wire a mounted widget ───────────────────────────────── */
  function wireWidget(container, config) {
    var uid         = container.dataset.dcfwUid;
    var compact     = config.compact;
    var showChart   = config.showChart;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasAnime    = typeof anime !== "undefined";

    /* DOM refs */
    var scenarioBtns = container.querySelectorAll(".dcfw-scenario-btn");
    var revSlider    = container.querySelector('[data-slider="revenue"] .dcfw-range');
    var waccSlider   = container.querySelector('[data-slider="wacc"] .dcfw-range');
    var termSlider   = container.querySelector('[data-slider="terminal"] .dcfw-range');
    var priceEl      = container.querySelector("[data-dcfw-price]");
    var deltaAbsEl   = container.querySelector("[data-dcfw-delta-abs]");
    var deltaPctEl   = container.querySelector("[data-dcfw-delta-pct]");
    var badgeEl      = container.querySelector("[data-dcfw-badge]");
    var badgeLabelEl = container.querySelector("[data-dcfw-badge-label]");
    var evEl         = container.querySelector("[data-dcfw-ev]");
    var equityEl     = container.querySelector("[data-dcfw-equity]");
    var noteEl       = container.querySelector("[data-dcfw-note]");

    /* Mutable state */
    var state = {
      scenario:   config.defaultScenario || "base",
      revPct:     avgOf(SCENARIOS.base.growth) * 100,
      waccPct:    SCENARIOS.base.wacc * 100,
      termPct:    SCENARIOS.base.terminalG * 100,
      prevPrice:  null
    };

    /* ─ Sync output DOM immediately (no animation) ─ */
    function syncOutputDom(result) {
      var price = result.impliedPrice;
      if (!isFinite(price)) {
        if (priceEl)      priceEl.textContent = "";
        if (deltaAbsEl)   deltaAbsEl.textContent = "";
        if (deltaPctEl)   deltaPctEl.textContent = "";
        if (badgeEl)      badgeEl.dataset.tone = "neutral";
        if (badgeLabelEl) badgeLabelEl.textContent = "";
        return;
      }

      if (priceEl) priceEl.textContent = "$" + price.toFixed(2);

      var diff    = price - MARKET_PRICE;
      var diffPct = diff / MARKET_PRICE;
      var isUnder = diff > 0;

      if (deltaAbsEl) deltaAbsEl.textContent = (diff >= 0 ? "+$" : "-$") + Math.abs(diff).toFixed(2);
      if (deltaPctEl) deltaPctEl.textContent  = (diffPct >= 0 ? "+" : "") + (diffPct * 100).toFixed(1) + "%";

      if (badgeEl)      badgeEl.dataset.tone  = isUnder ? "up" : "down";
      if (badgeLabelEl) badgeLabelEl.textContent = isUnder ? "UNDERVALUED" : "OVERVALUED";

      if (evEl)     evEl.textContent     = fmtTrillions(result.enterpriseValue);
      if (equityEl) equityEl.textContent = fmtTrillions(result.equityValue);
    }

    /* ─ Animate price number ─ */
    function animatePrice(from, to, result) {
      if (!hasAnime || reducedMotion || from === null || !isFinite(to)) {
        syncOutputDom(result);
        return;
      }

      var wasUnder = badgeEl && badgeEl.dataset.tone === "up";
      var nowUnder = to > MARKET_PRICE;

      // Cancel any in-flight price tween
      if (priceEl) anime.remove(priceEl);
      var obj = { value: isFinite(from) ? from : to };
      anime({
        targets: obj,
        value: to,
        duration: 600,
        easing: "easeOutExpo",
        update: function () {
          if (priceEl) priceEl.textContent = "$" + obj.value.toFixed(2);
          var d = obj.value - MARKET_PRICE;
          var dp = d / MARKET_PRICE;
          if (deltaAbsEl) deltaAbsEl.textContent = (d >= 0 ? "+$" : "-$") + Math.abs(d).toFixed(2);
          if (deltaPctEl) deltaPctEl.textContent  = (dp >= 0 ? "+" : "") + (dp * 100).toFixed(1) + "%";
        },
        complete: function () { syncOutputDom(result); }
      });

      // EV / Equity: set immediately
      if (evEl)     evEl.textContent     = fmtTrillions(result.enterpriseValue);
      if (equityEl) equityEl.textContent = fmtTrillions(result.equityValue);

      // Badge sign-change flip
      if (badgeEl && badgeLabelEl && wasUnder !== nowUnder) {
        anime.timeline()
          .add({ targets: badgeEl, translateY: [0, -8], opacity: [1, 0], duration: 160, easing: "easeInCubic" })
          .add({
            targets: badgeEl,
            translateY: [8, 0],
            opacity: [0, 1],
            duration: 200,
            easing: "easeOutCubic",
            begin: function () {
              badgeEl.dataset.tone   = nowUnder ? "up" : "down";
              badgeLabelEl.textContent = nowUnder ? "UNDERVALUED" : "OVERVALUED";
            }
          });
      } else if (badgeEl && badgeLabelEl) {
        badgeEl.dataset.tone   = nowUnder ? "up" : "down";
        badgeLabelEl.textContent = nowUnder ? "UNDERVALUED" : "OVERVALUED";
      }
    }

    /* ─ Main update ─ */
    function updateModel() {
      var result = computeDCF({
        scenario:     state.scenario,
        uniformGrowth: state.revPct / 100,
        wacc:          state.waccPct / 100,
        terminalG:     state.termPct / 100
      });
      animatePrice(state.prevPrice, result.impliedPrice, result);
      state.prevPrice = result.impliedPrice;

      if (showChart && window.updateDCFWidgetChart) {
        window.updateDCFWidgetChart(uid, result);
      }
    }

    /* ─ Slider input handlers ─ */
    function onSliderInput(e) {
      var sliderKey = e.target.closest("[data-slider]").dataset.slider;
      if (sliderKey === "revenue") state.revPct  = parseFloat(e.target.value);
      if (sliderKey === "wacc")    state.waccPct = parseFloat(e.target.value);
      if (sliderKey === "terminal") state.termPct = parseFloat(e.target.value);

      // Deselect scenario
      state.scenario = null;
      scenarioBtns.forEach(function (b) {
        b.classList.remove("dcfw-scenario-btn--active");
        b.setAttribute("aria-pressed", "false");
      });
      if (noteEl) noteEl.textContent = "Uniform growth rate applied across all 5 forecast years.";

      syncSliderUI(e.target);
      updateModel();
    }

    [revSlider, waccSlider, termSlider].forEach(function (s) {
      if (s) s.addEventListener("input", onSliderInput, { passive: true });
    });

    /* ─ Scenario button click ─ */
    function activateScenario(key, animated) {
      var prevBtn = container.querySelector(".dcfw-scenario-btn--active");
      state.scenario = key;
      var s = SCENARIOS[key];

      // Update button states
      scenarioBtns.forEach(function (b) {
        var isThis = b.dataset.scenario === key;
        b.classList.toggle("dcfw-scenario-btn--active", isThis);
        b.setAttribute("aria-pressed", isThis ? "true" : "false");
      });

      var activeBtn = container.querySelector('[data-scenario="' + key + '"]');

      // Button spring
      if (animated && hasAnime && !reducedMotion) {
        if (activeBtn) anime({ targets: activeBtn, scale: [0.96, 1], duration: 280, easing: "spring(1, 90, 14, 0)" });
        if (prevBtn && prevBtn !== activeBtn) anime({ targets: prevBtn, scale: [1.02, 1], duration: 200, easing: "easeOutCubic" });
      }

      // Target slider display values
      var targetRev  = avgOf(s.growth) * 100;
      var targetWacc = s.wacc * 100;
      var targetTerm = s.terminalG * 100;

      if (noteEl) noteEl.textContent = s.note;

      if (animated && hasAnime && !reducedMotion) {
        // Animate slider visual positions + recompute on each frame
        var progress = {
          rev:  parseFloat(revSlider  ? revSlider.value  : targetRev),
          wacc: parseFloat(waccSlider ? waccSlider.value : targetWacc),
          term: parseFloat(termSlider ? termSlider.value : targetTerm)
        };

        anime({
          targets: progress,
          rev:  targetRev,
          wacc: targetWacc,
          term: targetTerm,
          duration: 700,
          easing: "spring(1, 80, 12, 0)",
          update: function () {
            if (revSlider)  { revSlider.value  = progress.rev;  syncSliderUI(revSlider); }
            if (waccSlider) { waccSlider.value = progress.wacc; syncSliderUI(waccSlider); }
            if (termSlider) { termSlider.value = progress.term; syncSliderUI(termSlider); }

            // Live price update during snap — use scenario rates (already set)
            var r = computeDCF({
              scenario:     state.scenario,
              uniformGrowth: progress.rev / 100,
              wacc:          progress.wacc / 100,
              terminalG:     progress.term / 100
            });
            if (priceEl && isFinite(r.impliedPrice)) priceEl.textContent = "$" + r.impliedPrice.toFixed(2);
          },
          complete: function () {
            state.revPct  = targetRev;
            state.waccPct = targetWacc;
            state.termPct = targetTerm;
            updateModel();
          }
        });
      } else {
        state.revPct  = targetRev;
        state.waccPct = targetWacc;
        state.termPct = targetTerm;
        if (revSlider)  { revSlider.value  = targetRev;  syncSliderUI(revSlider); }
        if (waccSlider) { waccSlider.value = targetWacc; syncSliderUI(waccSlider); }
        if (termSlider) { termSlider.value = targetTerm; syncSliderUI(termSlider); }
        updateModel();
      }
    }

    scenarioBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.scenario;
        if (state.scenario === key) return;
        activateScenario(key, true);
      });
    });

    /* ─ Mount entrance animation ─ */
    function playEntrance() {
      if (!hasAnime || reducedMotion) return;
      var scenarioGroup  = container.querySelector(".dcfw-scenario-group");
      var sliderGroups   = container.querySelectorAll(".dcfw-slider-group");
      var outputPanel    = container.querySelector(".dcfw-output");
      var chartArea      = container.querySelector(".dcfw-chart-area");

      // Pre-hide
      var toHide = [scenarioGroup, outputPanel].concat(Array.from(sliderGroups));
      if (chartArea) toHide.push(chartArea);
      toHide.forEach(function (el) {
        if (el) { el.style.opacity = "0"; el.style.willChange = "transform, opacity"; }
      });

      var tl = anime.timeline({ autoplay: true });
      tl
        .add({
          targets: scenarioGroup,
          opacity: [0, 1], translateY: [16, 0],
          duration: 480, easing: "easeOutCubic"
        })
        .add({
          targets: sliderGroups,
          opacity: [0, 1], translateY: [16, 0],
          delay: anime.stagger(90),
          duration: 560, easing: "spring(1, 76, 12, 0)"
        }, "-=300")
        .add({
          targets: outputPanel,
          opacity: [0, 1], translateX: [20, 0],
          duration: 520, easing: "easeOutCubic",
          complete: !chartArea ? function () { toHide.forEach(function (el) { if (el) el.style.willChange = "auto"; }); } : undefined
        }, "-=400");

      if (chartArea) {
        tl.add({
          targets: chartArea,
          opacity: [0, 1], translateY: [24, 0],
          duration: 480, easing: "easeOutCubic",
          complete: function () {
            toHide.forEach(function (el) { if (el) el.style.willChange = "auto"; });
          }
        }, "-=200");
      }
    }

    /* ─ Initialise ─ */
    // Set sliders to base scenario defaults, then activate selected scenario
    if (revSlider)  { revSlider.value  = avgOf(SCENARIOS.base.growth) * 100; syncSliderUI(revSlider); }
    if (waccSlider) { waccSlider.value = SCENARIOS.base.wacc * 100;          syncSliderUI(waccSlider); }
    if (termSlider) { termSlider.value = SCENARIOS.base.terminalG * 100;     syncSliderUI(termSlider); }

    var defaultKey = config.defaultScenario || "base";
    activateScenario(defaultKey, false); // silent initial set

    playEntrance();

    // Chart init (Phase 2)
    if (showChart && window.initDCFWidgetChart) {
      var canvas = container.querySelector(".dcfw-canvas");
      if (canvas) {
        window.initDCFWidgetChart(uid, canvas);
        var initResult = computeDCF({
          scenario: state.scenario,
          uniformGrowth: state.revPct / 100,
          wacc: state.waccPct / 100,
          terminalG: state.termPct / 100
        });
        window.updateDCFWidgetChart(uid, initResult);
      }
    }
  }

  /* ── Mount a widget into a container ─────────────────────── */
  function mountWidget(container) {
    var compact     = container.dataset.dcfCompact === "true";
    var showChart   = container.dataset.dcfChart   === "true";
    var defaultSc   = container.dataset.dcfScenario || "base";

    // Generate a stable UID from the container id or random
    var uid = (container.id || "dcfw").replace(/[^a-zA-Z0-9]/g, "") + Math.random().toString(36).slice(2, 6);
    container.dataset.dcfwUid = uid;

    container.classList.add("dcfw-widget");
    if (compact) container.classList.add("dcfw-compact");

    container.innerHTML = buildHTML(uid, compact, showChart);

    wireWidget(container, { compact: compact, showChart: showChart, defaultScenario: defaultSc });
  }

  /* ── Public API ───────────────────────────────────────────── */
  window.initDCFWidget = function (containerId, options) {
    var el = document.getElementById(containerId);
    if (!el) return;
    // Allow options override via JS call
    if (options) {
      if (options.compact     !== undefined) el.dataset.dcfCompact   = String(options.compact);
      if (options.showChart   !== undefined) el.dataset.dcfChart     = String(options.showChart);
      if (options.defaultScenario) el.dataset.dcfScenario = options.defaultScenario;
    }
    mountWidget(el);
  };

  /* ── Auto-discover containers ────────────────────────────── */
  function autoMount() {
    document.querySelectorAll("[data-init-dcf-widget]").forEach(mountWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();
