/**
 * anime-animations.js — Cognac Folio v2 Animation Layer
 * Requires: anime.js v3 (loaded before this script, non-deferred)
 *
 * Architecture note:
 *  - app.js handles all generic .reveal elements with CSS transitions.
 *  - This script handles: hero entrance, counters, grid staggers (by
 *    observing CONTAINER elements, not children), card spotlight,
 *    magnetic buttons, folio numerals.
 *  - Grid stagger functions observe the non-.reveal CONTAINER, then
 *    take over children with inline styles (higher specificity than CSS).
 */

(function () {
  "use strict";

  /* ── Guard ────────────────────────────────────────────────── */
  if (typeof anime === "undefined") {
    document.getElementById("hero-init")?.remove();
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ── Helper: fire once when element enters viewport ───────── */
  function onEnter(el, callback, options) {
    if (!("IntersectionObserver" in window)) {
      callback();
      return;
    }
    const opts = Object.assign({ rootMargin: "0px 0px -8% 0px", threshold: 0.12 }, options);
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      callback();
    }, opts);
    observer.observe(el);
  }

  /* ── 1. Hero Entrance ──────────────────────────────────────── */
  function initHeroEntrance() {
    const initStyle = document.getElementById("hero-init");
    if (prefersReducedMotion) {
      initStyle?.remove();
      return;
    }

    /* Remove the head-style block; Anime.js animates from opacity 0
       so inline styles prevent any flash before the animation starts */
    initStyle?.remove();

    const tl = anime.timeline({ autoplay: true });

    tl
      .add({
        targets: ".hero-nameplate",
        opacity: [0, 1],
        duration: 500,
        easing: "easeOutCubic",
      })
      .add({
        targets: ".hero-vol",
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 480,
        easing: "easeOutCubic",
      }, "-=300")
      /* Name: heavy spring — the centrepiece */
      .add({
        targets: ".hero-wordmark .hero-given",
        opacity: [0, 1],
        translateY: [48, 0],
        duration: 1100,
        easing: "spring(1, 68, 10, 0)",
      }, "-=200")
      /* Rule draws left-to-right */
      .add({
        targets: ".hero-wordmark-rule",
        scaleX: [0, 1],
        transformOrigin: "left center",
        duration: 650,
        easing: "easeOutExpo",
      }, "-=700")
      /* Subtitle drifts in from left */
      .add({
        targets: ".hero-wordmark-tail",
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 620,
        easing: "easeOutCubic",
      }, "-=420")
      .add({
        targets: ".hero-byline",
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        easing: "easeOutCubic",
      }, "-=280")
      /* Lede block and spec rail stagger in together */
      .add({
        targets: [".hero-lede-block", ".hero-rail"],
        opacity: [0, 1],
        translateY: [24, 0],
        delay: anime.stagger(200),
        duration: 800,
        easing: "spring(1, 68, 12, 0)",
      }, "-=200")
      /* Baseline footer */
      .add({
        targets: ".hero-baseline",
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutCubic",
      }, "-=500");

    /* Release GPU memory once entrance is complete */
    setTimeout(() => {
      [
        ".hero-nameplate", ".hero-vol", ".hero-wordmark",
        ".hero-byline", ".hero-lede-block", ".hero-rail", ".hero-baseline",
      ].forEach((sel) =>
        document.querySelectorAll(sel).forEach((el) => (el.style.willChange = "auto"))
      );
    }, 2400);
  }

  /* ── 2. Counter animations ─────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll("[data-count-up]");
    if (!counters.length || prefersReducedMotion) return;

    counters.forEach((el) => {
      onEnter(el, () => {
        const targetVal = parseFloat(el.dataset.countTarget ?? "0");
        const prefix    = el.dataset.countPrefix ?? "";
        const suffix    = el.dataset.countSuffix ?? "";
        const decimals  = parseInt(el.dataset.countDecimals ?? "0", 10);
        const format    = el.dataset.countFormat;

        if (isNaN(targetVal)) return;

        const originalText = el.textContent;
        el.setAttribute("aria-label", originalText);

        const obj = { value: 0 };
        anime({
          targets: obj,
          value: targetVal,
          duration: 1600,
          delay: 200,
          easing: "easeOutExpo",
          update() {
            el.textContent =
              format === "thousands"
                ? prefix + Math.round(obj.value).toLocaleString("en-US") + suffix
                : prefix + obj.value.toFixed(decimals) + suffix;
          },
          complete() {
            el.textContent =
              format === "thousands"
                ? prefix + targetVal.toLocaleString("en-US") + suffix
                : prefix + targetVal.toFixed(decimals) + suffix;
            el.style.willChange = "auto";
          },
        });
      }, { threshold: 0.5 });
    });
  }

  /* ── 3. Grid stagger helper ────────────────────────────────── */
  /* Observes CONTAINER (no .reveal), takes over CHILDREN once visible */
  function staggerGrid(containerSelector, childSelector, options) {
    if (prefersReducedMotion) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cards = container.querySelectorAll(childSelector);
    if (!cards.length) return;

    /* Pre-hide children inline (overrides CSS .reveal state) */
    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = options.transform ?? "translateY(30px)";
      c.style.transition = "none";
    });

    onEnter(container, () => {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: options.translateY ?? [30, 0],
        translateX: options.translateX ?? undefined,
        scale: options.scale ?? undefined,
        delay: anime.stagger(options.staggerDelay ?? 85, { start: options.startDelay ?? 60 }),
        duration: options.duration ?? 640,
        easing: options.easing ?? "spring(1, 76, 12, 0)",
        complete() {
          cards.forEach((c) => {
            c.classList.add("in-view");
            c.style.willChange = "auto";
            c.style.transition  = "";
            c.style.opacity     = "";
            c.style.transform   = "";
          });
        },
      });
    }, { threshold: 0.14 });
  }

  /* ── 4. Metrics band cascade ───────────────────────────────── */
  function initMetricsBand() {
    staggerGrid(".metrics-band", "article", {
      translateY: [36, 0],
      scale: [0.97, 1],
      transform: "translateY(36px) scale(0.97)",
      staggerDelay: 95,
      startDelay: 100,
      duration: 680,
      easing: "spring(1, 78, 14, 0)",
    });
  }

  /* ── 5. Method grid ────────────────────────────────────────── */
  function initMethodGrid() {
    staggerGrid(".method-grid", ".method-card", {
      translateY: [32, 0],
      staggerDelay: 100,
      startDelay: 80,
      duration: 660,
    });
  }

  /* ── 6. Capability grid ────────────────────────────────────── */
  function initCapabilityGrid() {
    staggerGrid(".capability-grid", ".capability-card", {
      translateY: [28, 0],
      scale: [0.98, 1],
      transform: "translateY(28px) scale(0.98)",
      staggerDelay: 75,
      startDelay: 55,
      duration: 600,
    });
  }

  /* ── 7. Case study grid ────────────────────────────────────── */
  function initCaseGrid() {
    staggerGrid(".case-grid", ".case-card", {
      translateY: [32, 0],
      staggerDelay: 120,
      startDelay: 80,
      duration: 700,
      easing: "spring(1, 72, 10, 0)",
    });
  }

  /* ── 8. Lab grid ───────────────────────────────────────────── */
  function initLabGrid() {
    staggerGrid(".lab-grid", ".lab-card", {
      translateY: [28, 0],
      staggerDelay: 100,
      startDelay: 60,
      duration: 640,
    });
  }

  /* ── 9. Notes list — slide in from left ────────────────────── */
  function initNotesList() {
    if (prefersReducedMotion) return;

    const list = document.querySelector(".notes-list");
    if (!list) return;

    const rows = list.querySelectorAll(".note-row");
    if (!rows.length) return;

    rows.forEach((r) => {
      r.style.opacity = "0";
      r.style.transform = "translateX(-18px)";
      r.style.transition = "none";
    });

    onEnter(list, () => {
      anime({
        targets: rows,
        opacity: [0, 1],
        translateX: [-18, 0],
        delay: anime.stagger(130, { start: 60 }),
        duration: 580,
        easing: "easeOutCubic",
        complete() {
          rows.forEach((r) => {
            r.classList.add("in-view");
            r.style.willChange = "auto";
            r.style.transition  = "";
            r.style.opacity     = "";
            r.style.transform   = "";
          });
        },
      });
    }, { threshold: 0.1 });
  }

  /* ── 10. Dash metrics — number tiles stagger ───────────────── */
  function initDashMetrics() {
    staggerGrid(".dash-metrics", "article", {
      translateY: [24, 0],
      staggerDelay: 90,
      startDelay: 80,
      duration: 580,
      easing: "spring(1, 82, 12, 0)",
    });
  }

  /* ── 11. Card spotlight — cursor-driven ambient glow ───────── */
  function initCardSpotlight() {
    const cards = document.querySelectorAll(
      ".case-card, .lab-card, .dash-metrics article, .metrics-band article"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-y", `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      }, { passive: true });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--spot-x", "50%");
        card.style.setProperty("--spot-y", "50%");
      });
    });
  }

  /* ── 12. Magnetic primary buttons ─────────────────────────── */
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".button-primary, .nav-cta").forEach((btn) => {
      let hovering = false;

      btn.addEventListener("mouseenter", () => { hovering = true; }, { passive: true });

      btn.addEventListener("mousemove", (e) => {
        if (!hovering) return;
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.2;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.2;
        anime({ targets: btn, translateX: dx, translateY: dy, duration: 280, easing: "easeOutElastic(1, .5)" });
      }, { passive: true });

      btn.addEventListener("mouseleave", () => {
        hovering = false;
        anime({ targets: btn, translateX: 0, translateY: 0, duration: 480, easing: "spring(1, 80, 10, 0)" });
      });
    });
  }

  /* ── 13. Section folio numerals — rotate in ────────────────── */
  function initFolioNumerals() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".section-folio strong").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";

      onEnter(el, () => {
        anime({
          targets: el,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 520,
          easing: "easeOutBack",
          complete() {
            el.style.willChange = "auto";
            el.style.transform  = "";
          },
        });
      }, { threshold: 0.4 });
    });
  }

  /* ── 14. Ledger strip — cascade in from left ───────────────── */
  function initLedgerStrip() {
    if (prefersReducedMotion) return;

    const spans = document.querySelectorAll(".ledger-strip span");
    if (!spans.length) return;

    anime({
      targets: spans,
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: anime.stagger(85, { start: 350 }),
      duration: 420,
      easing: "easeOutCubic",
    });
  }

  /* ── 15. Scroll progress bar — brief flash on load ─────────── */
  function initScrollBarFlash() {
    if (prefersReducedMotion) return;

    const bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;

    anime({
      targets: bar,
      scaleX: [0, 0.035, 0],
      transformOrigin: "left center",
      duration: 860,
      delay: 1400,
      easing: "easeInOutCubic",
    });
  }

  /* ── Initialize ─────────────────────────────────────────────── */
  function run() {
    if (document.body.dataset.page !== "home") return;

    initHeroEntrance();
    initLedgerStrip();
    initCounters();
    initMetricsBand();
    initMethodGrid();
    initCapabilityGrid();
    initCaseGrid();
    initLabGrid();
    initNotesList();
    initDashMetrics();
    initFolioNumerals();
    initCardSpotlight();
    initMagneticButtons();
    initScrollBarFlash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
