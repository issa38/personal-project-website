const page = document.body.dataset.page;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".folio-sidebar");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".sidebar-nav a");
const navSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const parallaxItems = document.querySelectorAll("[data-parallax]");

const BRIEF_POINTS_SEPARATOR = "|||";

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

function setScrollProgress() {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}

function setParallax() {
  if (prefersReducedMotion || parallaxItems.length === 0) return;

  const reads = Array.from(parallaxItems).map((item) => ({
    item,
    speed: Number(item.dataset.parallax) || 0,
    rect: item.getBoundingClientRect(),
  }));

  const innerHeight = window.innerHeight;
  reads.forEach(({ item, speed, rect }) => {
    const centerOffset = rect.top + rect.height / 2 - innerHeight / 2;
    const movement = Math.max(-28, Math.min(28, centerOffset * speed * -1));
    item.style.transform = `translate3d(0, ${movement}px, 0)`;
  });
}

function initReveals() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.16 }
  );

  revealItems.forEach((item) => {
    const siblings = Array.from(item.parentElement?.children ?? []).filter((child) =>
      child.classList.contains("reveal")
    );
    const groupIndex = Math.max(0, siblings.indexOf(item));
    item.style.transitionDelay = `${(groupIndex % 4) * 70}ms`;
    observer.observe(item);
  });
}

function initToggleGroup({ buttons, activeAttr, onSelect }) {
  if (!buttons || buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        if (activeAttr) item.setAttribute(activeAttr, String(isActive));
      });
      onSelect(button);
    });
  });
}

function initCaseFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-tags]");
  const status = document.querySelector("[data-case-filter-status]");

  initToggleGroup({
    buttons,
    activeAttr: "aria-pressed",
    onSelect: (button) => {
      const filter = button.dataset.filter;
      let visibleCount = 0;
      cards.forEach((card) => {
        const tags = card.dataset.tags?.split(" ") ?? [];
        const visible = filter === "all" || tags.includes(filter);
        if (visible) visibleCount += 1;
        card.classList.toggle("is-hidden", !visible);
      });
      if (status) {
        const label = button.textContent?.trim().toLowerCase() ?? "selected";
        status.textContent =
          filter === "all"
            ? `Showing all ${visibleCount} case studies.`
            : `Showing ${visibleCount} ${label} case study entries.`;
      }
    },
  });
}

function initProjectFilters() {
  const buttons = document.querySelectorAll("[data-project-filter]");
  const cards = document.querySelectorAll("[data-project-status]");
  const status = document.querySelector("[data-project-filter-status]");

  initToggleGroup({
    buttons,
    activeAttr: "aria-pressed",
    onSelect: (button) => {
      const filter = button.dataset.projectFilter;
      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = filter === "all" || card.dataset.projectStatus === filter;
        if (visible) visibleCount += 1;
        card.classList.toggle("is-hidden", !visible);
      });
      if (status) {
        const label = button.textContent?.trim().toLowerCase() ?? "selected";
        status.textContent =
          filter === "all"
            ? `Showing all ${visibleCount} project lab entries.`
            : `Showing ${visibleCount} ${label} project lab entries.`;
      }
    },
  });
}

function initPreviewPanels() {
  const buttons = document.querySelectorAll("[data-preview-button]");
  const panels = document.querySelectorAll("[data-preview-panel]");
  if (buttons.length === 0 || panels.length === 0) return;

  initToggleGroup({
    buttons,
    activeAttr: "aria-selected",
    onSelect: (button) => {
      const target = button.dataset.previewButton;
      panels.forEach((panel) => {
        const isActive = panel.dataset.previewPanel === target;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });
    },
  });
}

function initActiveNav() {
  if (!("IntersectionObserver" in window) || navSections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 }
  );

  navSections.forEach((section) => observer.observe(section));
}

function initMobileSidebarToggle() {
  const sidebar = document.querySelector(".folio-sidebar");
  const toggle = document.querySelector(".sidebar-toggle");
  const backdrop = document.querySelector(".mobile-nav-backdrop");
  if (!sidebar || !toggle) return;

  function openSidebar() {
    sidebar.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    if (backdrop) {
      backdrop.classList.add("is-visible");
      backdrop.setAttribute("aria-hidden", "false");
    }
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      backdrop.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeSidebar);
  }

  // Close when any link inside the sidebar is clicked on mobile
  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 720) closeSidebar();
    });
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeSidebar();
      toggle.focus();
    }
  });
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function initCommandMenu() {
  const commandDialog = document.querySelector("[data-command-dialog]");
  const commandOpen = document.querySelector("[data-command-open]");
  const commandSearch = document.querySelector("[data-command-search]");
  const commandItems = document.querySelectorAll("[data-command-item]");

  if (!commandDialog || !commandOpen) return;

  commandOpen.addEventListener("click", () => {
    openDialog(commandDialog);
    commandSearch?.focus();
  });

  commandSearch?.addEventListener("input", () => {
    const query = commandSearch.value.trim().toLowerCase();
    commandItems.forEach((item) => {
      const text = item.textContent?.toLowerCase() ?? "";
      item.classList.toggle("is-filtered", query.length > 0 && !text.includes(query));
    });
  });

  commandItems.forEach((item) => {
    item.addEventListener("click", () => closeDialog(commandDialog));
  });

  window.addEventListener("keydown", (event) => {
    const wantsCommand = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    if (wantsCommand) {
      event.preventDefault();
      openDialog(commandDialog);
      commandSearch?.focus();
      commandSearch?.select();
    }
  });
}

function initStrategyBriefs() {
  const briefDialog = document.querySelector("[data-brief-dialog]");
  const briefOpenButtons = document.querySelectorAll("[data-brief-open]");
  if (!briefDialog || briefOpenButtons.length === 0) return;

  const title = briefDialog.querySelector("[data-brief-title]");
  const kicker = briefDialog.querySelector("[data-brief-kicker]");
  const body = briefDialog.querySelector("[data-brief-body]");
  const list = briefDialog.querySelector("[data-brief-list]");

  briefOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const points = button.dataset.briefPoints?.split(BRIEF_POINTS_SEPARATOR) ?? [];

      if (title) title.textContent = button.dataset.briefTitle ?? "Strategy Brief";
      if (kicker) kicker.textContent = button.dataset.briefKicker ?? "Strategy Brief";
      if (body) body.textContent = button.dataset.briefBody ?? "";
      if (list) {
        list.innerHTML = "";
        points.forEach((point) => {
          const item = document.createElement("li");
          item.textContent = point;
          list.appendChild(item);
        });
      }

      openDialog(briefDialog);
    });
  });
}

function initStrategyCanvas() {
  const canvas = document.getElementById("strategy-canvas");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let rafId = null;
  let isVisible = true;
  let isOnscreen = true;

  const nodes = Array.from({ length: 36 }, (_, index) => ({
    angle: (Math.PI * 2 * index) / 36,
    radius: 90 + (index % 6) * 34,
    speed: 0.0008 + (index % 5) * 0.00016,
    layer: index % 3,
  }));

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawGrid(originX, originY) {
    context.save();
    context.strokeStyle = "rgba(197, 186, 165, 0.055)";
    context.lineWidth = 1;
    for (let x = -width; x < width * 2; x += 92) {
      context.beginPath();
      context.moveTo(x + originX * 18, 0);
      context.lineTo(x + originX * 18 - 160, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 92) {
      context.beginPath();
      context.moveTo(0, y + originY * 14);
      context.lineTo(width, y + originY * 14);
      context.stroke();
    }
    context.restore();
  }

  function draw() {
    frame += 1;
    context.clearRect(0, 0, width, height);

    const centerX = width * (0.68 + (pointerX - 0.5) * 0.025);
    const centerY = height * (0.47 + (pointerY - 0.5) * 0.035);
    drawGrid(pointerX - 0.5, pointerY - 0.5);

    const projected = nodes.map((node) => {
      const time = frame * node.speed;
      const z = Math.sin(node.angle + time * 5) * 0.5 + 0.5;
      const perspective = 0.64 + z * 0.52;
      const x = centerX + Math.cos(node.angle + time) * node.radius * perspective;
      const y = centerY + Math.sin(node.angle + time * 0.85) * node.radius * 0.46 * perspective;
      return { ...node, x, y, z, perspective };
    });

    context.save();
    context.lineWidth = 1;
    for (let index = 0; index < projected.length; index += 1) {
      const node = projected[index];
      const next = projected[(index + 1) % projected.length];
      const jump = projected[(index + 9) % projected.length];
      // Warm amber connectors
      context.strokeStyle = `rgba(147, 121, 89, ${0.04 + node.z * 0.09})`;
      context.beginPath();
      context.moveTo(node.x, node.y);
      context.lineTo(next.x, next.y);
      context.stroke();

      if (index % 3 === 0) {
        // Slate blue-grey cross-connectors — the cool counterpoint
        context.strokeStyle = `rgba(133, 144, 144, ${0.025 + node.z * 0.04})`;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(jump.x, jump.y);
        context.stroke();
      }
    }

    projected.forEach((node, index) => {
      const size = 2.2 + node.z * 3.8;
      // Tricolor nodes: amber / linen / slate
      const fillColor = index % 9 === 0
        ? `rgba(133, 144, 144, ${0.38 + node.z * 0.22})`   // slate
        : index % 5 === 0
          ? `rgba(147, 121, 89, ${0.42 + node.z * 0.18})`  // amber
          : `rgba(197, 186, 165, ${0.22 + node.z * 0.14})`; // linen
      context.fillStyle = fillColor;
      context.beginPath();
      context.arc(node.x, node.y, size, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(draw);
  }

  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function reconcile() {
    if (isVisible && isOnscreen) start();
    else stop();
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX / Math.max(1, window.innerWidth);
      pointerY = event.clientY / Math.max(1, window.innerHeight);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState === "visible";
    reconcile();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isOnscreen = entry.isIntersecting;
        });
        reconcile();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);
  }

  resize();
  start();
}

let scrollTicking = false;

function updateScrollEffects() {
  scrollTicking = false;
  setHeaderState();
  setScrollProgress();
  setParallax();
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollEffects);
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    setHeaderState();
    setScrollProgress();
    setParallax();
  },
  { passive: true }
);

setHeaderState();
setScrollProgress();
setParallax();
initReveals();
initActiveNav();
initMobileSidebarToggle();

if (page === "home") {
  initCaseFilters();
  initProjectFilters();
  initCommandMenu();
  initStrategyBriefs();
  initStrategyCanvas();
}

if (page === "dcf") {
  initPreviewPanels();
}
