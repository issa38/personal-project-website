const page = document.body.dataset.page;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".folio-sidebar, [data-header]");
const scrollSentinel = document.querySelector("[data-scroll-sentinel]");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".sidebar-nav a");
const navSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const BRIEF_POINTS_SEPARATOR = "|||";

/* Header/sidebar "scrolled" state: an IntersectionObserver on a 1px sentinel at
   the top of <main> replaces a window scroll listener. */
function initHeaderState() {
  if (!header || !scrollSentinel || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
      });
    },
    { rootMargin: "16px 0px 0px 0px", threshold: 0 }
  );
  observer.observe(scrollSentinel);
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
      const visibleCards = [];
      let visibleCount = 0;
      cards.forEach((card) => {
        const tags = card.dataset.tags?.split(" ") ?? [];
        const visible = filter === "all" || tags.includes(filter);
        if (visible) visibleCount += 1;
        if (visible) visibleCards.push(card);
        card.classList.toggle("is-hidden", !visible);
      });
      if (status) {
        const label = button.dataset.filterLabel ?? button.textContent?.trim() ?? "Selected";
        const noun = visibleCount === 1 ? "proof entry" : "proof entries";
        const titles = visibleCards.map((card) => card.dataset.proofTitle).filter(Boolean);
        const titleCopy = titles.length > 0 ? `: ${titles.join(", ")}.` : ".";
        status.textContent =
          filter === "all"
            ? `Showing all ${visibleCount} ${noun}${titleCopy}`
            : `Showing ${visibleCount} ${label.toLowerCase()} ${noun}${titleCopy}`;
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
  const commandEmpty = document.querySelector("[data-command-empty]");

  if (!commandDialog || !commandOpen) return;

  function resetCommandFilter() {
    if (commandSearch) commandSearch.value = "";
    commandItems.forEach((item) => item.classList.remove("is-filtered"));
    if (commandEmpty) commandEmpty.hidden = true;
  }

  commandOpen.addEventListener("click", () => {
    openDialog(commandDialog);
    commandSearch?.focus();
  });

  commandSearch?.addEventListener("input", () => {
    const query = commandSearch.value.trim().toLowerCase();
    let visible = 0;
    commandItems.forEach((item) => {
      const text = item.textContent?.toLowerCase() ?? "";
      const hidden = query.length > 0 && !text.includes(query);
      item.classList.toggle("is-filtered", hidden);
      if (!hidden) visible += 1;
    });
    if (commandEmpty) commandEmpty.hidden = visible > 0;
  });

  commandItems.forEach((item) => {
    item.addEventListener("click", () => closeDialog(commandDialog));
  });

  commandDialog.addEventListener("close", resetCommandFilter);

  commandDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog(commandDialog);
    commandOpen.focus();
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

initHeaderState();
initReveals();
initActiveNav();
initMobileSidebarToggle();

if (page === "home") {
  initCaseFilters();
  initProjectFilters();
  initCommandMenu();
  initStrategyBriefs();
}

if (page === "dcf") {
  initPreviewPanels();
}
