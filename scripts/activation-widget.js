/**
 * activation-widget.js
 * Two interactive widgets for the Activation Funnel case study:
 *   1. Segment Comparison Panel  — replaces static metric cards
 *   2. Opportunity Sizer         — live revenue calculator tied to variant presets
 *
 * Requires: Anime.js v3 (window.anime), loaded before this script
 * Auto-discovers: [data-init-activation-comparison], [data-init-activation-sizer]
 * Variant cards:  [data-variant-preset="control|variantB|variantC"]
 */
(function () {
  "use strict";

  // ─────────────────────────────────────────────────────────────────────────
  //  DATA
  // ─────────────────────────────────────────────────────────────────────────

  // ALL: exact values from published analysis
  // MOBILE / DESKTOP: approximate, consistent with the 44.7%/44.3% cart-to-checkout
  //   finding. Device split was ruled out as the activation gap driver.
  var SEGMENTS = {
    all: {
      label:    "All Users",
      newRate:  0.64,      // activation % (new users)
      retRate:  9.73,      // activation % (returning users)
      newCount: 240441,
      retCount: 29713,
      cartPct:  44.5,
      gap:      15.2
    },
    mobile: {
      label:    "Mobile",
      newRate:  0.62,
      retRate:  9.51,
      newCount: 132200,
      retCount: 16300,
      cartPct:  44.7,
      gap:      15.3
    },
    desktop: {
      label:    "Desktop",
      newRate:  0.67,
      retRate:  9.91,
      newCount: 107800,
      retCount: 13200,
      cartPct:  44.3,
      gap:      14.8
    }
  };

  // Parallels DCF Bear / Base / Bull presets
  var PRESETS = {
    control:  { liftPct: 0,  aov: 69, label: "Control A" },
    variantB: { liftPct: 50, aov: 69, label: "Variant B" },
    variantC: { liftPct: 25, aov: 69, label: "Variant C" }
  };

  var BASE_RATE  = 0.0064;
  var BASE_USERS = 240441;

  // ─────────────────────────────────────────────────────────────────────────
  //  MATH
  // ─────────────────────────────────────────────────────────────────────────

  function computeOpp(liftPct, aov) {
    var baseline   = Math.round(BASE_USERS * BASE_RATE);
    var newRate    = BASE_RATE * (1 + liftPct / 100);
    var projected  = Math.round(BASE_USERS * newRate);
    var delta      = projected - baseline;
    return {
      baseline:  baseline,
      projected: projected,
      delta:     delta,
      newRate:   (newRate * 100).toFixed(2),
      revenue:   delta * aov
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function fmtInt(n)   { return Math.round(n).toLocaleString("en-US"); }
  function fmtMoney(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function q(root, sel) { return root.querySelector(sel); }

  // ─────────────────────────────────────────────────────────────────────────
  //  WIDGET 1 — SEGMENT COMPARISON PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function buildPanelHTML() {
    return [
      '<div class="acfw-panel">',

        // ── Header: tabs + disclaimer
        '<div class="acfw-panel-top">',
          '<div class="acfw-seg-tabs" role="tablist" aria-label="Segment filter">',
            '<button class="acfw-seg-btn acfw-seg-btn--active" data-seg="all"',
              ' role="tab" aria-selected="true">All users</button>',
            '<button class="acfw-seg-btn" data-seg="mobile"',
              ' role="tab" aria-selected="false">Mobile</button>',
            '<button class="acfw-seg-btn" data-seg="desktop"',
              ' role="tab" aria-selected="false">Desktop</button>',
          '</div>',
          '<span class="acfw-panel-note">Approx. device splits &middot; exact rates for All</span>',
        '</div>',

        // ── Three-column gap display
        '<div class="acfw-gap-body">',

          // New users
          '<div class="acfw-col acfw-col--new">',
            '<p class="acfw-col-eyebrow">New users</p>',
            '<div class="acfw-big-rate" data-r="new-rate">0.00%</div>',
            '<div class="acfw-bar-wrap">',
              '<div class="acfw-bar acfw-bar--new" data-r="new-bar" style="width:0%"></div>',
            '</div>',
            '<p class="acfw-col-count" data-r="new-count">240,441</p>',
          '</div>',

          // Gap center
          '<div class="acfw-col acfw-col--gap">',
            '<div class="acfw-gap-mult" data-r="gap-mult">1&times;</div>',
            '<p class="acfw-gap-word">gap</p>',
            '<div class="acfw-cart-block">',
              '<span class="acfw-cart-label">Cart &rarr; checkout</span>',
              '<span class="acfw-cart-val" data-r="cart-val">44.5%</span>',
            '</div>',
          '</div>',

          // Returning users
          '<div class="acfw-col acfw-col--ret">',
            '<p class="acfw-col-eyebrow">Returning users</p>',
            '<div class="acfw-big-rate acfw-big-rate--ret" data-r="ret-rate">0.00%</div>',
            '<div class="acfw-bar-wrap">',
              '<div class="acfw-bar acfw-bar--ret" data-r="ret-bar" style="width:0%"></div>',
            '</div>',
            '<p class="acfw-col-count" data-r="ret-count">29,713</p>',
          '</div>',

        '</div>',

        // ── Footer note
        '<p class="acfw-panel-foot">',
          'Cart-to-checkout is nearly identical across devices. Structural ',
          'first-purchase friction is the driver, not device UX.',
        '</p>',

      '</div>'
    ].join('');
  }

  function mountComparisonPanel(root) {
    root.innerHTML = buildPanelHTML();

    var panel    = q(root, '.acfw-panel');
    var tabs     = root.querySelectorAll('.acfw-seg-btn');
    var newRate  = q(root, '[data-r="new-rate"]');
    var retRate  = q(root, '[data-r="ret-rate"]');
    var newBar   = q(root, '[data-r="new-bar"]');
    var retBar   = q(root, '[data-r="ret-bar"]');
    var newCnt   = q(root, '[data-r="new-count"]');
    var retCnt   = q(root, '[data-r="ret-count"]');
    var gapMult  = q(root, '[data-r="gap-mult"]');
    var cartVal  = q(root, '[data-r="cart-val"]');

    var cur     = 'all';
    var entered = false;

    function setSegment(key, anim) {
      var s    = SEGMENTS[key] || SEGMENTS.all;
      cur      = key;
      var newW = (s.newRate / s.retRate) * 100; // new bar = % of returning (max)

      tabs.forEach(function (b) {
        var on = b.dataset.seg === key;
        b.classList.toggle('acfw-seg-btn--active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      if (anim && window.anime) {
        var nO = { v: parseFloat(newRate.textContent) || 0 };
        var rO = { v: parseFloat(retRate.textContent) || 0 };
        var gO = { v: parseFloat(gapMult.textContent) || 1 };
        var cO = { v: parseFloat(cartVal.textContent) || 44 };

        anime({ targets: nO, v: s.newRate, duration: 480, easing: 'easeOutQuart',
          update: function () { newRate.textContent = nO.v.toFixed(2) + '%'; } });
        anime({ targets: rO, v: s.retRate, duration: 480, easing: 'easeOutQuart',
          update: function () { retRate.textContent = rO.v.toFixed(2) + '%'; } });
        anime({ targets: gO, v: s.gap, duration: 480, easing: 'easeOutQuart',
          update: function () { gapMult.textContent = gO.v.toFixed(1) + '×'; } });
        anime({ targets: cO, v: s.cartPct, duration: 380, easing: 'easeOutQuart',
          update: function () { cartVal.textContent = cO.v.toFixed(1) + '%'; } });
        anime({ targets: newBar, width: newW + '%', duration: 480, easing: 'spring(1,80,12,0)' });
        // ret bar always stays at 100%
      } else {
        newRate.textContent = s.newRate.toFixed(2) + '%';
        retRate.textContent = s.retRate.toFixed(2) + '%';
        gapMult.textContent = s.gap.toFixed(1) + '×';
        cartVal.textContent = s.cartPct.toFixed(1) + '%';
        newBar.style.width  = newW + '%';
        retBar.style.width  = '100%';
      }

      newCnt.textContent = fmtInt(s.newCount);
      retCnt.textContent = fmtInt(s.retCount);
    }

    function playEntrance() {
      if (entered) return;
      entered = true;
      var s    = SEGMENTS[cur];
      var newW = (s.newRate / s.retRate) * 100;

      if (!window.anime) { setSegment(cur, false); return; }

      // Set final static values first (non-animated pieces)
      newCnt.textContent  = fmtInt(s.newCount);
      retCnt.textContent  = fmtInt(s.retCount);
      cartVal.textContent = s.cartPct.toFixed(1) + '%';
      retBar.style.width  = '0%';

      var tl = anime.timeline({ easing: 'easeOutQuart' });

      // Slide panel in
      tl.add({
        targets: panel,
        opacity: [0, 1],
        translateY: [28, 0],
        duration: 500
      });

      // Count up both rates simultaneously
      var nO = { v: 0 }, rO = { v: 0 };
      tl.add({
        targets: nO, v: s.newRate, duration: 1100,
        update: function () { newRate.textContent = nO.v.toFixed(2) + '%'; }
      }, '-=200');
      tl.add({
        targets: rO, v: s.retRate, duration: 1100,
        update: function () { retRate.textContent = rO.v.toFixed(2) + '%'; }
      }, '-=1100');

      // Fill bars
      tl.add({ targets: newBar, width: ['0%', newW + '%'],
        duration: 900, easing: 'spring(1,80,10,0)' }, '-=900');
      tl.add({ targets: retBar, width: ['0%', '100%'],
        duration: 900, easing: 'spring(1,80,10,0)' }, '-=900');

      // Gap multiplier counts up last — the reveal
      var gO = { v: 1 };
      tl.add({
        targets: gO, v: s.gap, duration: 700,
        easing: 'easeOutExpo',
        update: function () { gapMult.textContent = gO.v.toFixed(1) + '×'; }
      }, '-=300');
    }

    // Trigger on scroll-entry
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { playEntrance(); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(panel);

    // Tab switches
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!entered) playEntrance();
        setSegment(btn.dataset.seg, true);
      });
    });

    // Start quiet (bars at 0, counts ready to count)
    setSegment('all', false);
    newBar.style.width  = '0%';
    retBar.style.width  = '0%';
    newRate.textContent = '0.00%';
    retRate.textContent = '0.00%';
    gapMult.textContent = '1×';
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  WIDGET 2 — OPPORTUNITY SIZER
  // ─────────────────────────────────────────────────────────────────────────

  function buildSizerHTML() {
    return [
      '<div class="acfw-sizer">',

        // ── Header: title + preset tabs
        '<div class="acfw-sizer-top">',
          '<div>',
            '<p class="eyebrow" style="margin-bottom:0.2rem">Live model</p>',
            '<p class="acfw-sizer-sub">Adjust assumptions or click a variant card above</p>',
          '</div>',
          '<div class="acfw-preset-tabs">',
            '<button class="acfw-preset-btn" data-preset="control">Control A</button>',
            '<button class="acfw-preset-btn acfw-preset-btn--active" data-preset="variantB">Variant B &#9733;</button>',
            '<button class="acfw-preset-btn" data-preset="variantC">Variant C</button>',
          '</div>',
        '</div>',

        // ── Body: sliders left, output right
        '<div class="acfw-sizer-body">',

          // Controls
          '<div class="acfw-sizer-controls">',

            '<div class="acfw-slider-grp">',
              '<div class="acfw-slider-hd">',
                '<span class="acfw-slider-lbl">Relative lift target</span>',
                '<span class="acfw-slider-val" data-r="lift-out">+50%</span>',
              '</div>',
              '<div class="acfw-track-wrap">',
                '<div class="acfw-track">',
                  '<div class="acfw-fill" data-r="lift-fill" style="transform:scaleX(0.5)"></div>',
                '</div>',
                '<input class="acfw-range" type="range" min="0" max="100" step="1" value="50"',
                  ' data-r="lift-in" aria-label="Lift target percentage">',
              '</div>',
              '<div class="acfw-range-bounds"><span>0%</span><span>+100%</span></div>',
            '</div>',

            '<div class="acfw-slider-grp">',
              '<div class="acfw-slider-hd">',
                '<span class="acfw-slider-lbl">Avg order value</span>',
                '<span class="acfw-slider-val" data-r="aov-out">$69</span>',
              '</div>',
              '<div class="acfw-track-wrap">',
                '<div class="acfw-track">',
                  '<div class="acfw-fill" data-r="aov-fill" style="transform:scaleX(0.3625)"></div>',
                '</div>',
                '<input class="acfw-range" type="range" min="40" max="120" step="1" value="69"',
                  ' data-r="aov-in" aria-label="Average order value">',
              '</div>',
              '<div class="acfw-range-bounds"><span>$40</span><span>$120</span></div>',
            '</div>',

          '</div>',

          // Output
          '<div class="acfw-sizer-out">',
            '<div class="acfw-out-row">',
              '<span>Baseline purchases</span>',
              '<strong data-r="baseline">1,539</strong>',
            '</div>',
            '<div class="acfw-out-row acfw-out-row--proj">',
              '<span>Projected purchases</span>',
              '<strong>',
                '<span data-r="projected">2,308</span>',
                ' <span class="acfw-delta acfw-delta--pos" data-r="delta">+769</span>',
              '</strong>',
            '</div>',
            '<div class="acfw-out-row">',
              '<span>New-user activation</span>',
              '<strong>0.64% &rarr; <span data-r="proj-rate">0.96%</span></strong>',
            '</div>',
            '<div class="acfw-rev-box">',
              '<span class="acfw-rev-lbl">Incremental revenue</span>',
              '<span class="acfw-rev-val" data-r="revenue">$53,130</span>',
            '</div>',
          '</div>',

        '</div>',
      '</div>'
    ].join('');
  }

  function mountSizer(root) {
    root.innerHTML = buildSizerHTML();

    var liftIn   = q(root, '[data-r="lift-in"]');
    var aovIn    = q(root, '[data-r="aov-in"]');
    var liftFill = q(root, '[data-r="lift-fill"]');
    var aovFill  = q(root, '[data-r="aov-fill"]');
    var liftOut  = q(root, '[data-r="lift-out"]');
    var aovOut   = q(root, '[data-r="aov-out"]');
    var baseEl   = q(root, '[data-r="baseline"]');
    var projEl   = q(root, '[data-r="projected"]');
    var deltaEl  = q(root, '[data-r="delta"]');
    var rateEl   = q(root, '[data-r="proj-rate"]');
    var revEl    = q(root, '[data-r="revenue"]');
    var presets  = root.querySelectorAll('.acfw-preset-btn');

    var state = { lift: 50, aov: 69 };

    function syncUI() {
      var lift = parseFloat(liftIn.value);
      var aov  = parseFloat(aovIn.value);
      state.lift = lift;
      state.aov  = aov;

      // Update fills (scaleX 0→1)
      liftFill.style.transform = 'scaleX(' + (lift / 100) + ')';
      aovFill.style.transform  = 'scaleX(' + ((aov - 40) / 80) + ')';

      // Update readouts
      liftOut.textContent = '+' + lift + '%';
      aovOut.textContent  = '$' + aov;

      // Compute and render
      var r = computeOpp(lift, aov);
      baseEl.textContent  = fmtInt(r.baseline);
      projEl.textContent  = fmtInt(r.projected);
      deltaEl.textContent = (r.delta >= 0 ? '+' : '') + fmtInt(r.delta);
      rateEl.textContent  = r.newRate + '%';
      revEl.textContent   = fmtMoney(r.revenue);

      deltaEl.className = 'acfw-delta' + (r.delta > 0 ? ' acfw-delta--pos' : '');
    }

    function snapPreset(key, anim) {
      var p = PRESETS[key];
      if (!p) return;

      // Highlight preset buttons
      presets.forEach(function (b) {
        b.classList.toggle('acfw-preset-btn--active', b.dataset.preset === key);
      });

      // Highlight variant cards
      document.querySelectorAll('[data-variant-preset]').forEach(function (card) {
        card.classList.toggle('variant-active', card.dataset.variantPreset === key);
      });

      if (anim && window.anime) {
        var obj = { lift: state.lift, aov: state.aov };
        anime({
          targets: obj,
          lift: p.liftPct,
          aov:  p.aov,
          duration: 650,
          easing: 'spring(1,80,12,0)',
          update: function () {
            liftIn.value = Math.round(obj.lift);
            aovIn.value  = Math.round(obj.aov);
            syncUI();
          }
        });
      } else {
        liftIn.value = p.liftPct;
        aovIn.value  = p.aov;
        syncUI();
      }
    }

    // Expose globally so variant cards can trigger it
    window._acfwSnapPreset = snapPreset;

    function clearPresetActive() {
      presets.forEach(function (b) { b.classList.remove('acfw-preset-btn--active'); });
      document.querySelectorAll('[data-variant-preset]').forEach(function (c) {
        c.classList.remove('variant-active');
      });
    }

    liftIn.addEventListener('input', function () { clearPresetActive(); syncUI(); });
    aovIn.addEventListener('input',  function () { clearPresetActive(); syncUI(); });

    presets.forEach(function (btn) {
      btn.addEventListener('click', function () { snapPreset(btn.dataset.preset, true); });
    });

    // Boot into Variant B (base case)
    snapPreset('variantB', false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  AUTO-DISCOVERY
  // ─────────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('[data-init-activation-comparison]').forEach(mountComparisonPanel);
    document.querySelectorAll('[data-init-activation-sizer]').forEach(mountSizer);

    // Wire variant cards to the sizer (cards rendered from static HTML, not widget)
    document.querySelectorAll('[data-variant-preset]').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.addEventListener('click', function () {
        var key = card.dataset.variantPreset;
        if (window._acfwSnapPreset) window._acfwSnapPreset(key, true);
        var sizer = document.querySelector('[data-init-activation-sizer]');
        if (sizer) {
          setTimeout(function () {
            sizer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 80);
        }
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });

  });

})();
