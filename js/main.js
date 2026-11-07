const menuBtn = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
    mobileMenu.setAttribute("aria-hidden", !open);
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });
}

document.querySelectorAll(".case-index a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".case-index a").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const portfolioFilters = document.querySelectorAll(".filter-row [data-filter]");
const portfolioCards = document.querySelectorAll(".project-grid .project-card[data-category]");
const projectGrid = document.querySelector(".project-grid");
const pagination = document.querySelector("#portfolioPagination");
const paginationStatus = pagination?.querySelector(".pagination-status");
const paginationNumbers = pagination?.querySelector(".pagination-numbers");
const previousPageButton = pagination?.querySelector("[data-page-prev]");
const nextPageButton = pagination?.querySelector("[data-page-next]");
const projectsPerPage = 6;
let activePortfolioFilter = "all";
let currentPortfolioPage = 1;

function renderPortfolio() {
  if (!projectGrid) return;

  const matchingCards = [...portfolioCards].filter(card =>
    activePortfolioFilter === "all" || card.dataset.category === activePortfolioFilter
  );
  const pageCount = Math.max(1, Math.ceil(matchingCards.length / projectsPerPage));
  currentPortfolioPage = Math.min(currentPortfolioPage, pageCount);
  const firstVisible = (currentPortfolioPage - 1) * projectsPerPage;
  const lastVisible = Math.min(firstVisible + projectsPerPage, matchingCards.length);
  const visibleCards = new Set(matchingCards.slice(firstVisible, lastVisible));

  portfolioCards.forEach(card => {
    card.hidden = !visibleCards.has(card);
  });

  if (!pagination || !paginationStatus || !paginationNumbers || !previousPageButton || !nextPageButton) return;
  pagination.hidden = pageCount <= 1;

  if (matchingCards.length === 0) {
    paginationStatus.textContent = "No projects in this category yet.";
  } else {
    paginationStatus.textContent = `Showing ${firstVisible + 1}-${lastVisible} of ${matchingCards.length} projects`;
  }

  previousPageButton.disabled = currentPortfolioPage === 1;
  nextPageButton.disabled = currentPortfolioPage === pageCount;
  paginationNumbers.replaceChildren();

  for (let page = 1; page <= pageCount; page += 1) {
    const pageButton = document.createElement("button");
    pageButton.className = "pagination-button";
    pageButton.type = "button";
    pageButton.textContent = String(page);
    pageButton.setAttribute("aria-label", `Page ${page}`);
    if (page === currentPortfolioPage) pageButton.setAttribute("aria-current", "page");
    pageButton.addEventListener("click", () => goToPortfolioPage(page));
    paginationNumbers.append(pageButton);
  }
}

function goToPortfolioPage(page) {
  currentPortfolioPage = page;
  renderPortfolio();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  projectGrid?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

portfolioFilters.forEach(button => {
  button.addEventListener("click", () => {
    activePortfolioFilter = button.dataset.filter;
    currentPortfolioPage = 1;

    portfolioFilters.forEach(filterButton => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderPortfolio();
  });
});

previousPageButton?.addEventListener("click", () => goToPortfolioPage(currentPortfolioPage - 1));
nextPageButton?.addEventListener("click", () => goToPortfolioPage(currentPortfolioPage + 1));
renderPortfolio();

document.querySelectorAll("[data-lightbox-open]").forEach(trigger => {
  const dialog = document.getElementById(trigger.dataset.lightboxOpen);
  if (!dialog || typeof dialog.showModal !== "function") return;

  trigger.addEventListener("click", () => {
    const image = dialog.querySelector("[data-lightbox-image]");
    if (image && trigger.dataset.lightboxSrc) {
      image.src = trigger.dataset.lightboxSrc;
      image.alt = trigger.dataset.lightboxAlt || "";
      const title = dialog.querySelector("[data-lightbox-title]");
      if (title && trigger.dataset.lightboxTitle) title.textContent = trigger.dataset.lightboxTitle;
    }
    dialog.showModal();
  });
  if (!dialog.dataset.backdropCloseBound) {
    dialog.dataset.backdropCloseBound = "true";
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
  }
});

const tilt = document.querySelector("[data-tilt]");
if (tilt && window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tilt.addEventListener("mousemove", event => {
    const bounds = tilt.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 5;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * -5;
    const heroImage = tilt.querySelector(".hero-image");
    if (heroImage) heroImage.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  });
  tilt.addEventListener("mouseleave", () => {
    const heroImage = tilt.querySelector(".hero-image");
    if (heroImage) heroImage.style.transform = "";
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: .12 });
  document.querySelectorAll(".cap-card, .placeholder-card, .case-block, .stats div").forEach(item => observer.observe(item));
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
