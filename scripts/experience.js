import {
  animate,
  createTimeline,
  cubicBezier,
  stagger,
} from "./vendor/anime.esm.min.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

function initCeramicBackdrop() {
  const backdrop = document.querySelector("[data-ceramic-backdrop]");
  if (!backdrop) return;

  if (prefersReducedMotion) {
    backdrop.classList.add("is-static");
    return;
  }

  const entranceEase = cubicBezier(0.18, 1, 0.28, 1);
  const drawTargets = backdrop.querySelectorAll("[data-ceramic-draw]");

  drawTargets.forEach((target) => {
    const length = typeof target.getTotalLength === "function" ? target.getTotalLength() : 600;
    target.style.strokeDasharray = String(length);
    target.style.strokeDashoffset = String(length);
  });

  createTimeline({ defaults: { ease: entranceEase } })
    .add(".ceramic-arch", {
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.98, 1],
      duration: 1000,
      delay: 80,
    })
    .add(
      ".ceramic-slab",
      {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 820,
        delay: stagger(90),
      },
      "-=620"
    )
    .add(
      drawTargets,
      {
        strokeDashoffset: 0,
        opacity: [0, 0.62],
        duration: 1100,
        delay: stagger(70),
      },
      "-=520"
    )
    .add(
      ".ceramic-rule",
      {
        opacity: [0, 1],
        scaleX: [0.35, 1],
        duration: 640,
        delay: stagger(70),
      },
      "-=760"
    )
    .add(
      ".ceramic-dot-field",
      {
        opacity: [0, 0.38],
        translateY: [8, 0],
        duration: 760,
      },
      "-=580"
    );

  animate(".ceramic-arch", {
    translateY: [0, -2],
    duration: 11000,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });

  animate(".ceramic-slab-a", {
    translateX: [0, 3],
    translateY: [0, -1],
    duration: 12000,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });

  animate(".ceramic-slab-b", {
    translateX: [0, -3],
    translateY: [0, 2],
    rotate: [-3, -2.7],
    duration: 13000,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });

  animate(".ceramic-moon", {
    translateY: [0, 2],
    opacity: [0.22, 0.3],
    duration: 14000,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });

  animate(".ceramic-plinth", {
    translateX: [0, -3],
    opacity: [0.36, 0.46],
    duration: 12500,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });

  animate(".ceramic-dot-field", {
    translateY: [0, -4],
    opacity: [0.22, 0.32],
    duration: 9500,
    alternate: true,
    loop: true,
    ease: "inOut(2)",
  });
}

function initAnimeChoreography() {
  if (prefersReducedMotion) return;

  const entranceEase = cubicBezier(0.16, 1, 0.3, 1);
  const heroTargets = [
    ".brand",
    ".site-nav a",
    ".command-trigger",
    ".nav-cta",
    ".ledger-strip span",
    ".hero-vol",
    ".hero-wordmark .hero-given",
    ".hero-wordmark-rule",
    ".hero-wordmark-tail",
    ".hero-byline",
    ".hero-lede-block > *",
    ".hero-rail",
    ".case-hero-copy > *",
    ".case-hero-rail",
    ".breadcrumb > *",
  ].join(",");

  animate(heroTargets, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 820,
    delay: stagger(42),
    ease: entranceEase,
  });

  const panels = document.querySelectorAll(
    ".case-card, .lab-card, .capability-card, .method-card, .snapshot-card, .detail-card, .sheet-card, .note-row"
  );
  panels.forEach((panel) => {
    panel.dataset.kineticCard = "";
    panel.style.transformStyle = "preserve-3d";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const items = entry.target.matches("[data-kinetic-card]")
          ? [entry.target]
          : entry.target.querySelectorAll("[data-kinetic-card]");
        animate(items, {
          opacity: [0, 1],
          translateY: [22, 0],
          rotateX: [2, 0],
          duration: 680,
          delay: stagger(45),
          ease: "out(3)",
        });
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -14% 0px", threshold: 0.12 }
  );

  document.querySelectorAll(".section-pad, .metrics-band").forEach((section) => observer.observe(section));

  if (!isCoarsePointer) {
    panels.forEach((panel) => {
      panel.addEventListener("pointerenter", () => {
        animate(panel, {
          translateY: -3,
          rotateX: -0.5,
          duration: 160,
          ease: "out(3)",
        });
      });
      panel.addEventListener("pointerleave", () => {
        animate(panel, {
          translateY: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 160,
          ease: "out(3)",
        });
      });
    });
  }
}

initCeramicBackdrop();
initAnimeChoreography();
