/* ============================================================
   main.js — carrega e renderiza todos os dados do user.json
   ============================================================ */

async function loadPortfolio() {
  const loader = document.getElementById("loader");

  try {
    loader.classList.remove("hidden");

    const res = await fetch("./data/user.json", {
      cache: "no-cache"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const user = await res.json();

    renderNav(user);
    renderHero(user);
    renderProjects(user.projects);
    renderSkills(user.skills);
    renderExperience(user.experience);
    renderContact(user);
    renderFooter(user);

    // Initialize scroll animations after DOM updates
    requestAnimationFrame(() => {
      initScrollAnimations();
      animateStats();
    });

  } catch (err) {
    console.error("Erro ao carregar portfólio:", err);
    renderError();
  } finally {
    // Animate loader out before hiding
    const loader = document.getElementById("loader");
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 300);
  }
}

/* ── NAV ─────────────────────────────────────────────────── */
function renderNav(user) {
  const el = document.getElementById("nav-name");
  const [first, ...rest] = (user.name || "").split(" ");
  el.innerHTML = `${first} <span>${rest.join(" ")}</span>`;

  document.getElementById("page-title").textContent =
    `${user.name || "Portfólio"} — Dev`;
}

/* ── HERO ────────────────────────────────────────────────── */
function renderHero(user) {
  // Label
  if (user.label) {
    document.getElementById("hero-label").textContent = user.label;
  }

  // Nome
  const nameEl = document.getElementById("hero-name");
  const [first, ...rest] = (user.name || "").split(" ");
  nameEl.innerHTML = `${first}<br><em>${rest.join(" ")}</em>`;

  // Bio
  document.getElementById("hero-bio").textContent =
    user.bio || "";

  // Avatar
  const img = document.getElementById("avatar");
  const placeholder = document.getElementById("avatar-placeholder");
  img.alt = user.avatarAlt || `Foto de perfil de ${user.name || "perfil"}`;
  img.classList.remove("fade-in");
  placeholder.style.display = "flex";

  const fallbackAvatar = "./assets/img/avatar.png";
  const primaryAvatar = user.avatar || fallbackAvatar;
  let hasTriedFallback = false;

  const showAvatar = () => {
    placeholder.style.display = "none";
    requestAnimationFrame(() => {
      img.classList.add("fade-in");
    });
  };

  const hideAvatar = () => {
    if (!hasTriedFallback && primaryAvatar !== fallbackAvatar) {
      hasTriedFallback = true;
      img.src = fallbackAvatar;
      return;
    }

    placeholder.style.display = "flex";
    img.classList.remove("fade-in");
    const initials = (user.name || "")
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    placeholder.textContent = initials || "?";
  };

  img.onload = showAvatar;
  img.onerror = hideAvatar;

  img.src = primaryAvatar;

  // Check immediately after setting src (para imagens em cache)
  requestAnimationFrame(() => {
    if (img.complete) {
      if (img.naturalWidth > 0) {
        showAvatar();
      } else {
        hideAvatar();
      }
    }
  });

  // Stats
  if (Array.isArray(user.stats)) {
    const statsEl = document.getElementById("hero-stats");
    statsEl.innerHTML = user.stats.map((s, index) => `
      <div class="stat-item fade-up" style="animation-delay: ${index * 0.1}s">
        <div class="stat-num">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join("");
  }
}

/* ── PROJECTS ────────────────────────────────────────────── */
function renderProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return;

  const grid = document.getElementById("projects-grid");
  const countEl = document.getElementById("projects-count");

  countEl.textContent = `${String(projects.length).padStart(2, "0")} trabalhos`;

  const items = projects.map((p, i) => {
    const num = String(i + 1).padStart(2, "0");
    const featured = p.featured ? "featured" : "";
    const tags = (p.tags || [])
      .map(t => `<span class="proj-tag">${t}</span>`)
      .join("");
    const href = p.url && p.url !== "#"
      ? `href="${p.url}" target="_blank" rel="noopener noreferrer"`
      : `href="#" tabindex="-1"`;

    return `
      <div class="project-card ${featured} fade-up" style="animation-delay: ${i * 0.1}s">
        <div class="proj-num">${num}</div>
        <div>
          <div class="proj-title">${p.title}</div>
          <div class="proj-desc">${p.description}</div>
          <div class="proj-footer">
            <div class="proj-tags">${tags}</div>
            <a class="proj-arrow" ${href} aria-label="Ver projeto ${p.title}">↗</a>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = items.join("");
}

/* ── SKILLS ──────────────────────────────────────────────── */
function renderSkills(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return;

  const grid = document.getElementById("skills-grid");

  grid.innerHTML = skills.map((group, groupIndex) => {
    const items = (group.items || [])
      .map((item, itemIndex) => `
        <div class="skill-item fade-up" style="animation-delay: ${(groupIndex * 0.2) + (itemIndex * 0.1)}s">
          <span class="skill-dot"></span>${item}
        </div>
      `).join("");

    return `
      <div class="skill-group fade-up" style="animation-delay: ${groupIndex * 0.2}s">
        <div class="skill-group-title">${group.group}</div>
        ${items}
      </div>
    `;
  }).join("");
}

/* ── EXPERIENCE ──────────────────────────────────────────── */
function renderExperience(experience) {
  if (!Array.isArray(experience) || experience.length === 0) return;

  const list = document.getElementById("experience-list");

  list.innerHTML = experience.map((exp, index) => `
    <div class="exp-item fade-up" style="animation-delay: ${index * 0.2}s">
      <div class="exp-period">${exp.period}</div>
      <div>
        <div class="exp-title">${exp.title}</div>
        <div class="exp-org">${exp.org}</div>
        <div class="exp-desc">${exp.description}</div>
      </div>
    </div>
  `).join("");
}

/* ── CONTACT ─────────────────────────────────────────────── */
function renderContact(user) {
  const tagline = document.getElementById("contact-tagline");
  const sub = document.getElementById("contact-sub");
  const links = document.getElementById("contact-links");

  // Divide a tagline na primeira vírgula ou "e" para itálico
  const tagText = user.contact?.tagline || "Aberto a oportunidades e colaborações";
  tagline.innerHTML = tagText.replace(
    /(oportunidades|colaborações|projetos)/gi,
    "<em>$1</em>"
  );

  sub.textContent = user.contact?.sub || "";

  // Monta links de contato
  const contactItems = [];

  if (user.social?.github) {
    const handle = user.social.github.replace("https://github.com/", "");
    contactItems.push({
      label: "GitHub",
      value: handle,
      href: user.social.github
    });
  }

  if (user.social?.linkedin) {
    const handle = user.social.linkedin.replace("https://linkedin.com/in/", "");
    contactItems.push({
      label: "LinkedIn",
      value: handle,
      href: user.social.linkedin
    });
  }
  if (user.social?.instagram){
    const handle = user.social.instagram.replace("https://instagram.com/", "");
    contactItems.push({
      label: "Instagram",
      value: handle,
      href: user.social.instagram
    });
  }
  if (user.contact?.email) {
    contactItems.push({
      label: "Email",
      value: user.contact.email,
      href: `mailto:${user.contact.email}`
    });
  }

  links.innerHTML = contactItems.map((item, index) => {
    const attrs = item.href.startsWith("mailto:")
      ? `href="${item.href}"`
      : `href="${item.href}" target="_blank" rel="noopener noreferrer"`;

    return `
      <a class="contact-link fade-up" ${attrs} style="animation-delay: ${index * 0.1}s">
        <span class="contact-link-label">${item.label}</span>
        <span class="contact-link-value">${item.value}</span>
        <span class="contact-link-arrow">↗</span>
      </a>
    `;
  }).join("");
}

/* ── FOOTER ──────────────────────────────────────────────── */
function renderFooter(user) {
  const year = new Date().getFullYear();
  const author = user.firstName || user.name || "";
  const madeBy = user.madeBy || user.madeWith || author;

  document.getElementById("footer-copy").textContent =
    `© ${year} ${author}`;

  const madeEl = document.getElementById("footer-made");
  if (madeEl) {
    madeEl.textContent = madeBy ? `Made with ♥ by ${madeBy}` : "";
  }
}

/* ── ERROR STATE ─────────────────────────────────────────── */
function renderError() {
  const hero = document.getElementById("hero");
  if (hero) {
    hero.innerHTML = `
      <div class="error-state fade-up" style="padding: 6rem 3.5rem;">
        <p>Não foi possível carregar o portfólio.</p>
        <span>Verifique o arquivo data/user.json e rode com um servidor local.</span>
      </div>
    `;
  }
}

/* ── SCROLL ANIMATIONS ───────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  // Observe all animation classes
  document.querySelectorAll(".fade-up, .fade-left, .fade-right").forEach(el => observer.observe(el));
}

/* ── MOBILE MENU ─────────────────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById("nav-menu");
  const menu = document.getElementById("mobile-menu");

  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menu.setAttribute("aria-hidden", String(!isOpen));

    // Animate menu links with stagger
    if (isOpen) {
      menu.querySelectorAll(".mobile-link").forEach((link, index) => {
        link.style.animationDelay = `${index * 0.1}s`;
        link.classList.add("slide-in");
      });
    } else {
      menu.querySelectorAll(".mobile-link").forEach(link => {
        link.classList.remove("slide-in");
        link.style.animationDelay = "";
      });
    }
  });

  // Fecha ao clicar num link
  menu.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    });
  });
}

/* ── STATS ANIMATION ────────────────────────────────────── */
function animateStats() {
  const statItems = document.querySelectorAll(".stat-item");

  statItems.forEach((item, index) => {
    const numEl = item.querySelector(".stat-num");
    if (!numEl) return;

    const rawText = numEl.textContent.trim();
    const numericMatch = rawText.match(/-?\d+/);
    const targetValue = numericMatch ? Number(numericMatch[0]) : 0;
    const prefix = numericMatch ? rawText.slice(0, numericMatch.index) : "";
    const suffix = numericMatch ? rawText.slice(numericMatch.index + numericMatch[0].length) : "";
    const duration = 600;
    let start = null;
    const delay = index * 100;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed < delay) {
        requestAnimationFrame(step);
        return;
      }

      const progress = Math.min((elapsed - delay) / duration, 1);
      const currentValue = Math.round(targetValue * progress);
      numEl.textContent = `${prefix}${String(currentValue).padStart(2, "0")}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  });
}

/* ── THEME SUPPORT ────────────────────────────────────────── */
const themeToggleButton = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const root = document.documentElement;

function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const storage = safeLocalStorage();

function setThemeStorage(value) {
  if (!storage) return;
  try {
    storage.setItem("theme", value);
  } catch (err) {
    // localStorage blocked or unavailable
  }
}

function getThemeStorage() {
  if (!storage) return null;
  try {
    return storage.getItem("theme");
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  if (theme === "dark") {
    root.classList.add("dark-theme");
    themeIcon.textContent = "🌙";
  } else {
    root.classList.remove("dark-theme");
    themeIcon.textContent = "🌞";
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function initTheme() {
  const saved = getThemeStorage();
  if (saved) {
    applyTheme(saved);
  } else {
    applyTheme(getSystemTheme());
  }
}

themeToggleButton?.addEventListener("click", () => {
  const isDark = root.classList.contains("dark-theme");
  const next = isDark ? "light" : "dark";

  applyTheme(next);
  setThemeStorage(next);

  themeIcon.style.transform = "scale(0.8)";
  requestAnimationFrame(() => {
    themeIcon.style.transform = "scale(1)";
  });
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!getThemeStorage()) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

initTheme();

/* ── INIT ────────────────────────────────────────────────── */
initMobileMenu();
loadPortfolio();

function animateStats() {
  const statItems = document.querySelectorAll(".stat-item");

  statItems.forEach((item, index) => {
    setTimeout(() => {
      const numEl = item.querySelector(".stat-num");
      const targetValue = parseInt(numEl.textContent.replace(/[^\d]/g, "")) || 0;
      const isPercentage = numEl.textContent.includes("%");

      let currentValue = 0;
      const increment = targetValue / 60; // 60 frames for smooth animation
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }
        numEl.textContent = isPercentage
          ? `${Math.floor(currentValue)}%`
          : Math.floor(currentValue).toString().padStart(2, "0");
      }, 30);
    }, index * 200); // Stagger the animations
  });
}

/* ── INIT ────────────────────────────────────────────────── */
initMobileMenu();
loadPortfolio();