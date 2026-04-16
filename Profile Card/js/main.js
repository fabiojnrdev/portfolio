/* ============================================================
   main.js — carrega e renderiza todos os dados do user.json
   ============================================================ */

async function loadPortfolio() {
  const loader = document.getElementById("loader");

  try {
    loader.classList.remove("hidden");

    const res = await fetch("./data/user.json", {
      cache: 'force-cache'
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
    setTimeout(() => {
      initScrollAnimations();
      animateStats();
    }, 100);

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
  if (user.avatar) {
    const img = document.getElementById("avatar");
    const placeholder = document.getElementById("avatar-placeholder");

    img.onload = () => {
      img.style.display = "block";
      placeholder.style.display = "none";
      img.classList.add("fade-in");
    };

    img.onerror = () => {
      img.style.display = "none";
      placeholder.style.display = "flex";
      // Iniciais como fallback
      const initials = (user.name || "")
        .split(" ")
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      placeholder.textContent = initials || "?";
    };

    img.src = user.avatar;
  }

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

  links.innerHTML = contactItems.map((item, index) => `
    <a class="contact-link fade-up" href="${item.href}" target="_blank" rel="noopener noreferrer" style="animation-delay: ${index * 0.1}s">
      <span class="contact-link-label">${item.label}</span>
      <span class="contact-link-value">${item.value}</span>
      <span class="contact-link-arrow">↗</span>
    </a>
  `).join("");
}

/* ── FOOTER ──────────────────────────────────────────────── */
function renderFooter(user) {
  const year = new Date().getFullYear();
  document.getElementById("footer-copy").textContent =
    `© ${year} ${user.name || ""}`;
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
