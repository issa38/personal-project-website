/**
 * anime-animations.js: homepage animation layer
 * Requires: anime.js v3 (loaded before this script, non-deferred)
 *
 * Architecture note:
 *  - The hero entrance is pure CSS (see .hero-editorial keyframes in styles.css),
 *    so the page renders at rest even if this script never runs.
 *  - app.js handles generic .reveal elements with CSS transitions.
 *  - This script handles counters, grid staggers (by observing CONTAINER
 *    elements, not children), and the cursor-driven card spotlight.
 *  - Every animation here communicates sequence (stagger) or state (counter).
 */

(function () {
  "use strict";

  if (typeof anime === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Fire once when an element enters the viewport */
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

  /* Counters: the number tells the story, so it counts up once when seen */
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

  /* Grid stagger: observes the CONTAINER, then reveals children in sequence */
  function staggerGrid(containerSelector, childSelector, options) {
    if (prefersReducedMotion) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const cards = container.querySelectorAll(childSelector);
    if (!cards.length) return;

    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = options.transform ?? "translateY(24px)";
      c.style.transition = "none";
    });

    onEnter(container, () => {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: options.translateY ?? [24, 0],
        translateX: options.translateX ?? undefined,
        delay: anime.stagger(options.staggerDelay ?? 80, { start: options.startDelay ?? 40 }),
        duration: options.duration ?? 560,
        easing: options.easing ?? "easeOutCubic",
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

  /* Card spotlight: writes CSS variables directly, no React-style state */
  function initCardSpotlight() {
    const cards = document.querySelectorAll(".case-card, .lab-card");

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

  function run() {
    if (document.body.dataset.page !== "home") return;

    initCounters();
    staggerGrid(".principle-list", "div", { translateX: [-12, 0], transform: "translateX(-12px)", staggerDelay: 90 });
    staggerGrid(".method-grid", ".method-card", { staggerDelay: 100 });
    staggerGrid(".case-grid", ".case-card", { staggerDelay: 120, duration: 640 });
    staggerGrid(".capability-list", "div", { translateY: [16, 0], transform: "translateY(16px)", staggerDelay: 70 });
    staggerGrid(".lab-grid", ".lab-card", { staggerDelay: 100 });
    staggerGrid(".notes-list", ".note-row", { translateX: [-18, 0], transform: "translateX(-18px)", staggerDelay: 130 });
    initCardSpotlight();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
