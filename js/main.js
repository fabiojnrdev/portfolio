/* ============================================================
   main.js — carrega e renderiza todos os dados do user.json
   ============================================================ */

/* ── STARFIELD (identidade única: galáxia roxo/preto, com imersão) ── */
(function initStarfield() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let bursts = []; // rastros estelares gerados por clique/toque
  let w, h;

  // posição do ponteiro (suavizada) e alvo bruto
  let mx = 0, my = 0, targetMx = 0, targetMy = 0;
  let pointerActive = false;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const density = Math.min(160, Math.floor((w * h) / 9000));
    stars = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
      depth: Math.random() * 0.8 + 0.2, // estrelas "mais próximas" reagem mais ao paralaxe
      hue: Math.random() > 0.82 ? "#D975E0" : "#EDE8F5"
    }));
  }

  function drawStar(s, offX, offY, twinkle) {
    ctx.globalAlpha = s.baseAlpha * twinkle;
    ctx.fillStyle = s.hue;
    ctx.beginPath();
    ctx.arc(s.x + offX, s.y + offY, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => drawStar(s, 0, 0, 1));
    ctx.globalAlpha = 1;
  }

  function drawBursts() {
    bursts.forEach(b => {
      ctx.globalAlpha = b.life;
      ctx.strokeStyle = b.hue;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 6, b.y - b.vy * 6);
      ctx.stroke();
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 0.02;
    });
    bursts = bursts.filter(b => b.life > 0);
    ctx.globalAlpha = 1;
  }

  function tick(t) {
    // suaviza o movimento do paralaxe (lerp) para sensação de imersão, não de rigidez
    mx += (targetMx - mx) * 0.06;
    my += (targetMy - my) * 0.06;

    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const twinkle = Math.sin(t * s.speed + s.phase) * 0.35 + 0.65;
      const offX = mx * s.depth * 22;
      const offY = my * s.depth * 22;
      drawStar(s, offX, offY, twinkle);
    });
    drawBursts();
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  function setTargetFromClient(clientX, clientY) {
    targetMx = (clientX / w) * 2 - 1;   // -1..1
    targetMy = (clientY / h) * 2 - 1;
    document.documentElement.style.setProperty("--mx", `${(clientX / w) * 100}%`);
    document.documentElement.style.setProperty("--my", `${(clientY / h) * 100}%`);
  }

  function spawnBurst(clientX, clientY) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.8;
      bursts.push({
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        hue: Math.random() > 0.6 ? "#D975E0" : "#9B6DFF"
      });
    }
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    drawStatic();
    // mesmo com movimento reduzido, mantém o glow de nebulosa acompanhando o cursor
    // (é uma pista visual estática por evento, não uma animação contínua)
    window.addEventListener("pointermove", e => setTargetFromClient(e.clientX, e.clientY));
  } else {
    window.addEventListener("pointermove", e => {
      pointerActive = true;
      setTargetFromClient(e.clientX, e.clientY);
    });
    window.addEventListener("pointerleave", () => {
      pointerActive = false;
      targetMx = 0;
      targetMy = 0;
    });
    window.addEventListener("pointerdown", e => spawnBurst(e.clientX, e.clientY));
    requestAnimationFrame(tick);
  }
})();

/* ── MOBILE MENU ─────────────────────────────────────────── */
function initMobileMenu() {
  const btn  = document.getElementById("nav-menu");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menu.setAttribute("aria-hidden", String(!isOpen));

    menu.querySelectorAll(".mobile-link").forEach((link, i) => {
      if (isOpen) {
        link.style.animationDelay = `${i * 0.1}s`;
        link.classList.add("slide-in");
      } else {
        link.classList.remove("slide-in");
        link.style.animationDelay = "";
      }
    });
  });

  menu.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    });
  });
}

/* ── PORTFOLIO LOADER ────────────────────────────────────── */
async function loadPortfolio() {
  const loader = document.getElementById("loader");

  try {
    loader?.classList.remove("hidden");

    const res = await fetch("./data/user.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const user = await res.json();

    renderNav(user);
    renderHero(user);
    renderProjects(user.projects);
    renderSkills(user.skills);
    renderSoftSkills(user.softSkills);
    renderExperience(user.experience);
    renderContact(user);
    renderFooter(user);

    requestAnimationFrame(() => {
      initScrollAnimations();
      animateStats();
    });

  } catch (err) {
    console.error("Erro ao carregar portfólio:", err);
    renderError();
  } finally {
    const el = document.getElementById("loader");
    if (el) {
      el.style.opacity = "0";
      setTimeout(() => el.classList.add("hidden"), 300);
    }
  }
}

/* ── NAV ─────────────────────────────────────────────────── */
function renderNav(user) {
  const el = document.getElementById("nav-name");
  if (!el) return;
  const [first, ...rest] = (user.name || "").split(" ");
  el.innerHTML = `${first} <span>${rest.join(" ")}</span>`;
  document.getElementById("page-title").textContent = `${user.name || "Portfólio"} — Dev`;
}

/* ── HERO ────────────────────────────────────────────────── */
function renderHero(user) {
  const labelEl = document.getElementById("hero-label");
  if (labelEl && user.label) labelEl.textContent = user.label;

  const nameEl = document.getElementById("hero-name");
  if (nameEl) {
    const [first, ...rest] = (user.name || "").split(" ");
    nameEl.innerHTML = `${first}<br><em>${rest.join(" ")}</em>`;
  }

  const bioEl = document.getElementById("hero-bio");
  if (bioEl) bioEl.textContent = user.bio || "";

  /* Avatar */
  const img         = document.getElementById("avatar");
  const placeholder = document.getElementById("avatar-placeholder");

  if (img && placeholder) {
    img.alt = `Foto de perfil de ${user.name || "perfil"}`;
    img.classList.remove("fade-in");
    placeholder.style.display = "flex";

    const fallback = "./assets/img/avatar.png";
    const primary  = user.avatar || fallback;
    let triedFallback = false;

    const showAvatar = () => {
      placeholder.style.display = "none";
      requestAnimationFrame(() => img.classList.add("fade-in"));
    };

    const hideAvatar = () => {
      if (!triedFallback && primary !== fallback) {
        triedFallback = true;
        img.src = fallback;
        return;
      }
      placeholder.style.display = "flex";
      img.classList.remove("fade-in");
      placeholder.textContent = (user.name || "")
        .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    };

    img.onload  = showAvatar;
    img.onerror = hideAvatar;
    img.src = primary;

    requestAnimationFrame(() => {
      if (img.complete) {
        img.naturalWidth > 0 ? showAvatar() : hideAvatar();
      }
    });
  }

  /* Stats */
  if (Array.isArray(user.stats)) {
    const statsEl = document.getElementById("hero-stats");
    if (statsEl) {
      statsEl.innerHTML = user.stats.map((s, i) => `
        <div class="stat-item fade-up" style="animation-delay:${i * 0.1}s">
          <div class="stat-num">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join("");
    }
  }
}

/* ── PROJECTS (4 destaques, peso visual igual) ──────────── */
function renderProjects(projects) {
  if (!Array.isArray(projects) || !projects.length) return;

  const grid    = document.getElementById("projects-grid");
  const countEl = document.getElementById("projects-count");
  if (!grid) return;

  if (countEl) countEl.textContent = `${String(projects.length).padStart(2, "0")} selecionados`;

  grid.innerHTML = projects.map((p, i) => {
    const num  = String(i + 1).padStart(2, "0");
    const tags = (p.tags || []).map(t => `<span class="proj-tag">${t}</span>`).join("");
    const href = p.url && p.url !== "#"
      ? `href="${p.url}" target="_blank" rel="noopener noreferrer"`
      : `href="#" tabindex="-1"`;
    const demo = p.demo
      ? `<a class="proj-demo" href="${p.demo}" target="_blank" rel="noopener noreferrer">Demo</a>`
      : "";

    return `
      <div class="project-card fade-up" style="animation-delay:${i * 0.1}s">
        <div class="proj-num">PROJ_${num}</div>
        <div>
          <div class="proj-title">${p.title}</div>
          <div class="proj-desc">${p.description}</div>
          <div class="proj-footer">
            <div class="proj-tags">${tags}</div>
            <div class="proj-links">
              ${demo}
              <a class="proj-arrow" ${href} aria-label="Ver projeto ${p.title}">↗</a>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ── SKILLS ──────────────────────────────────────────────── */
function renderSkills(skills) {
  if (!Array.isArray(skills) || !skills.length) return;
  const grid = document.getElementById("skills-grid");
  if (!grid) return;

  grid.innerHTML = skills.map((group, gi) =>
    `<div class="skill-group fade-up" style="animation-delay:${gi * 0.2}s">
      <div class="skill-group-title">${group.group}</div>
      ${(group.items || []).map((item, ii) => {
        const name  = typeof item === "string" ? item : item.name;
        const level = typeof item === "string" ? null : item.level;
        const bar   = level != null ? `
          <div class="skill-bar">
            <div class="skill-bar-fill" data-level="${level}" style="width:0%"></div>
          </div>
          <span class="skill-level">${level}%</span>` : "";
        return `
          <div class="skill-item fade-up" style="animation-delay:${gi * 0.2 + ii * 0.1}s">
            <span class="skill-dot"></span>
            <span class="skill-name">${name}</span>
            ${bar}
          </div>`;
      }).join("")}
    </div>`
  ).join("");

  requestAnimationFrame(() => {
    document.querySelectorAll(".skill-bar-fill").forEach(el => {
      el.style.width = `${el.dataset.level}%`;
    });
  });
}

/* ── SOFT SKILLS (preenchimento manual) ──────────────────── */
function renderSoftSkills(softSkills) {
  const grid = document.getElementById("soft-skills-grid");
  if (!grid) return;

  if (!Array.isArray(softSkills) || !softSkills.length) {
    grid.innerHTML = `
      <div class="soft-skill-empty fade-up">
        Adicione suas soft skills em <code>softSkills</code> no arquivo data/user.json.
      </div>`;
    return;
  }

  grid.innerHTML = softSkills.map((skill, i) => `
    <div class="soft-skill-chip fade-up" style="animation-delay:${i * 0.08}s">${skill}</div>
  `).join("");
}

/* ── EXPERIENCE ──────────────────────────────────────────── */
function renderExperience(experience) {
  if (!Array.isArray(experience) || !experience.length) return;
  const list = document.getElementById("experience-list");
  if (!list) return;

  list.innerHTML = experience.map((exp, i) => `
    <div class="exp-item fade-up" style="animation-delay:${i * 0.2}s">
      <div class="exp-period">${exp.period}</div>
      <div>
        <div class="exp-title">${exp.title}</div>
        <div class="exp-org">${exp.org}</div>
        <div class="exp-desc">${exp.description}</div>
      </div>
    </div>`
  ).join("");
}

/* ── CONTACT ─────────────────────────────────────────────── */
function renderContact(user) {
  const tagline = document.getElementById("contact-tagline");
  const sub     = document.getElementById("contact-sub");
  const links   = document.getElementById("contact-links");

  if (tagline) {
    const text = user.contact?.tagline || "Aberto a oportunidades e colaborações";
    tagline.innerHTML = text.replace(/(oportunidades|colaborações|projetos)/gi, "<em>$1</em>");
  }

  if (sub) sub.textContent = user.contact?.sub || "";

  if (!links) return;

  const items = [];

  if (user.social?.github) {
    items.push({ label: "GitHub",    value: user.social.github.replace("https://github.com/", ""),    href: user.social.github });
  }
  if (user.social?.linkedin) {
    items.push({ label: "LinkedIn",  value: user.social.linkedin.replace("https://linkedin.com/in/", ""), href: user.social.linkedin });
  }
  if (user.social?.instagram) {
    items.push({ label: "Instagram", value: user.social.instagram.replace("https://instagram.com/", ""),  href: user.social.instagram });
  }
  if (user.contact?.email) {
    items.push({ label: "Email",     value: user.contact.email, href: `mailto:${user.contact.email}` });
  }

  links.innerHTML = items.map((item, i) => {
    const attrs = item.href.startsWith("mailto:")
      ? `href="${item.href}"`
      : `href="${item.href}" target="_blank" rel="noopener noreferrer"`;
    return `
      <a class="contact-link fade-up" ${attrs} style="animation-delay:${i * 0.1}s">
        <span class="contact-link-label">${item.label}</span>
        <span class="contact-link-value">${item.value}</span>
        <span class="contact-link-arrow">↗</span>
      </a>`;
  }).join("");
}

/* ── FOOTER ──────────────────────────────────────────────── */
function renderFooter(user) {
  const year   = new Date().getFullYear();
  const author = user.firstName || user.name || "";
  const copyEl = document.getElementById("footer-copy");
  if (copyEl) copyEl.textContent = `© ${year} ${author}`;
}

/* ── ERROR STATE ─────────────────────────────────────────── */
function renderError() {
  const hero = document.getElementById("hero");
  if (hero) {
    hero.innerHTML = `
      <div class="error-state fade-up" style="padding:6rem 3.5rem;">
        <p>Não foi possível carregar o portfólio.</p>
        <span>Verifique o arquivo data/user.json e rode com um servidor local.</span>
      </div>`;
  }
}

/* ── SCROLL ANIMATIONS ───────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll(".fade-up, .fade-left, .fade-right")
    .forEach(el => observer.observe(el));
}

/* ── STATS ANIMATION ─────────────────────────────────────── */
function animateStats() {
  document.querySelectorAll(".stat-item").forEach((item, index) => {
    const numEl = item.querySelector(".stat-num");
    if (!numEl) return;

    const raw     = numEl.textContent.trim();
    const match   = raw.match(/-?\d+/);
    if (!match) return;

    const target  = Number(match[0]);
    const prefix  = raw.slice(0, match.index);
    const suffix  = raw.slice(match.index + match[0].length);
    const delay   = index * 100;
    const dur     = 600;
    let   start   = null;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed  = ts - start;
      if (elapsed < delay) { requestAnimationFrame(step); return; }
      const progress = Math.min((elapsed - delay) / dur, 1);
      numEl.textContent = `${prefix}${String(Math.round(target * progress)).padStart(2, "0")}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
}

/* ── INIT ────────────────────────────────────────────────── */
initMobileMenu();
loadPortfolio();
