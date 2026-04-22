const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterCards = document.querySelectorAll("[data-tags]");
const caseFilterStatus = document.querySelector("[data-case-filter-status]");
const projectFilterButtons = document.querySelectorAll("[data-project-filter]");
const projectCards = document.querySelectorAll("[data-project-status]");
const projectFilterStatus = document.querySelector("[data-project-filter-status]");
const navLinks = document.querySelectorAll(".site-nav a");
const navSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const canvas = document.getElementById("strategy-canvas");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandOpen = document.querySelector("[data-command-open]");
const commandSearch = document.querySelector("[data-command-search]");
const commandItems = document.querySelectorAll("[data-command-item]");
const briefDialog = document.querySelector("[data-brief-dialog]");
const briefOpenButtons = document.querySelectorAll("[data-brief-open]");
const parallaxItems = document.querySelectorAll("[data-parallax]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax) || 0;
    const rect = item.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
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

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
}

function initFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });

      filterCards.forEach((card) => {
        const tags = card.dataset.tags?.split(" ") ?? [];
        const visible = filter === "all" || tags.includes(filter);
        if (visible) visibleCount += 1;
        card.classList.toggle("is-hidden", !visible);
      });

      if (caseFilterStatus) {
        const label = button.textContent?.trim().toLowerCase() ?? "selected";
        caseFilterStatus.textContent =
          filter === "all" ? `Showing all ${visibleCount} case studies.` : `Showing ${visibleCount} ${label} case study entries.`;
      }
    });
  });

  projectFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      let visibleCount = 0;

      projectFilterButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });

      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.projectStatus === filter;
        if (visible) visibleCount += 1;
        card.classList.toggle("is-hidden", !visible);
      });

      if (projectFilterStatus) {
        const label = button.textContent?.trim().toLowerCase() ?? "selected";
        projectFilterStatus.textContent =
          filter === "all" ? `Showing all ${visibleCount} project lab entries.` : `Showing ${visibleCount} ${label} project lab entries.`;
      }
    });
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
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  navSections.forEach((section) => observer.observe(section));
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
  commandOpen?.addEventListener("click", () => {
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
  briefOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!briefDialog) return;
      const title = briefDialog.querySelector("[data-brief-title]");
      const kicker = briefDialog.querySelector("[data-brief-kicker]");
      const body = briefDialog.querySelector("[data-brief-body]");
      const list = briefDialog.querySelector("[data-brief-list]");
      const points = button.dataset.briefPoints?.split("|") ?? [];

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
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
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
    context.strokeStyle = "rgba(89, 97, 65, 0.08)";
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
      context.strokeStyle = `rgba(89, 97, 65, ${0.05 + node.z * 0.07})`;
      context.beginPath();
      context.moveTo(node.x, node.y);
      context.lineTo(next.x, next.y);
      context.stroke();

      if (index % 3 === 0) {
        context.strokeStyle = `rgba(36, 86, 191, ${0.025 + node.z * 0.04})`;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(jump.x, jump.y);
        context.stroke();
      }
    }

    projected.forEach((node, index) => {
      const size = 2.2 + node.z * 3.8;
      context.fillStyle = index % 5 === 0 ? "rgba(223, 160, 157, 0.42)" : "rgba(89, 97, 65, 0.42)";
      context.beginPath();
      context.arc(node.x, node.y, size, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();

    requestAnimationFrame(draw);
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

  resize();
  draw();
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
initFilters();
initActiveNav();
initCommandMenu();
initStrategyBriefs();
initStrategyCanvas();
