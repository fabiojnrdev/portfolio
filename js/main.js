/* ============================================================
   main.js — carrega e renderiza todos os dados do user.json
   ============================================================ */

/* ── ESTADO GLOBAL DE COR (paleta cíclica, sem violeta/magenta fixos) ──
   --hue gira lentamente e é a única fonte de cor de destaque do site.
   Starfield e galaxy-core leem essa mesma variável para não duplicar
   estado de cor em dois lugares. */
const ColorCycle = (() => {
  let hue = 262;
  const root = document.documentElement;
  const CYCLE_MS = 140000; // uma volta completa a cada ~140s — "lento"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick(t) {
    hue = (262 + (t / CYCLE_MS) * 360) % 360;
    root.style.setProperty("--hue", hue.toFixed(2));
    requestAnimationFrame(tick);
  }

  if (!reduceMotion) {
    requestAnimationFrame(tick);
  } else {
    root.style.setProperty("--hue", hue);
  }

  return { getHue: () => hue };
})();

/* ── STARFIELD (fundo do site inteiro, interativo) ── */
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
      accent: Math.random() > 0.82 // 18% das estrelas usam a cor de destaque cíclica
    }));
  }

  function drawStar(s, offX, offY, twinkle, hue) {
    ctx.globalAlpha = s.baseAlpha * twinkle;
    ctx.fillStyle = s.accent ? `hsl(${hue}, 78%, 74%)` : `hsl(${hue}, 14%, 92%)`;
    ctx.beginPath();
    ctx.arc(s.x + offX, s.y + offY, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStatic() {
    const hue = ColorCycle.getHue();
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => drawStar(s, 0, 0, 1, hue));
    ctx.globalAlpha = 1;
  }

  function drawBursts(hue) {
    bursts.forEach(b => {
      ctx.globalAlpha = b.life;
      ctx.strokeStyle = `hsl(${b.accent ? hue : hue + 40}, 80%, 72%)`;
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

    const hue = ColorCycle.getHue();

    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const twinkle = Math.sin(t * s.speed + s.phase) * 0.35 + 0.65;
      const offX = mx * s.depth * 22;
      const offY = my * s.depth * 22;
      drawStar(s, offX, offY, twinkle, hue);
    });
    drawBursts(hue);
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
        accent: Math.random() > 0.6
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
      setTargetFromClient(e.clientX, e.clientY);
    });
    window.addEventListener("pointerleave", () => {
      targetMx = 0;
      targetMy = 0;
    });
    window.addEventListener("pointerdown", e => spawnBurst(e.clientX, e.clientY));
    requestAnimationFrame(tick);
  }
})();

/* ── GALAXY CORE (hero) ──────────────────────────────────────
   Substitui a foto de perfil. É um disco galáctico girando, com
   partículas que se afastam do cursor e reagem a cliques (ripple).
   A identidade visual do dono do site é a galáxia, não um retrato. */
(function initGalaxyCore() {
  const canvas = document.getElementById("galaxy-core");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, cx, cy;
  let particles = [];
  let ripples = [];
  const pointer = { x: -9999, y: -9999, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = canvas.width  = Math.max(1, rect.width);
    h = canvas.height = Math.max(1, rect.height);
    cx = w / 2;
    cy = h / 2;

    const coreR = Math.min(w, h) * 0.44;
    const count = Math.min(260, Math.floor((w * h) / 1500));

    particles = Array.from({ length: count }, () => {
      const r = Math.pow(Math.random(), 0.6) * coreR + 8;
      return {
        baseR: r,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0022 + (coreR - r) / coreR * 0.0035, // núcleo gira mais rápido que a borda
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.5 + 0.4,
        offset: 0,
        accent: Math.random() > 0.55
      };
    });
  }

  function particlePos(p) {
    const r = p.baseR + p.offset;
    return {
      x: cx + Math.cos(p.angle) * r,
      y: cy + Math.sin(p.angle) * r * 0.55 // disco achatado em elipse
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const hue = ColorCycle.getHue();

    // núcleo brilhante
    const coreRadius = Math.min(w, h) * 0.13;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    grad.addColorStop(0, `hsla(${hue}, 90%, 78%, 0.55)`);
    grad.addColorStop(1, `hsla(${hue}, 90%, 78%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    particles.forEach(p => {
      p.angle += p.speed;
      p.offset += (0 - p.offset) * 0.05; // relaxa de volta à órbita original

      if (pointer.active) {
        const pos = particlePos(p);
        const dx = pos.x - pointer.x;
        const dy = pos.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const influence = 100;
        if (dist < influence) {
          p.offset += (1 - dist / influence) * 1.6;
        }
      }

      const pos = particlePos(p);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.accent ? `hsl(${hue}, 82%, 74%)` : `hsl(${hue + 55}, 70%, 72%)`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ripples.forEach(rp => {
      ctx.globalAlpha = rp.life;
      ctx.strokeStyle = `hsl(${hue}, 85%, 75%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.stroke();
      rp.radius += 2.6;
      rp.life -= 0.018;
    });
    ripples = ripples.filter(r => r.life > 0);

    ctx.globalAlpha = 1;
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  function setPointerFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  }

  resize();
  // ResizeObserver cobre qualquer mudança de layout do container (rotação,
  // breakpoint, zoom, DevTools abrindo) — mais confiável que só "resize" da
  // janela pra garantir que a galáxia se adapte a qualquer resolução/dispositivo.
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas.parentElement);
  } else {
    window.addEventListener("resize", resize);
  }
  canvas.addEventListener("pointermove", setPointerFromEvent);
  canvas.addEventListener("pointerleave", () => { pointer.active = false; });
  canvas.addEventListener("pointerdown", e => {
    setPointerFromEvent(e);
    ripples.push({ x: pointer.x, y: pointer.y, radius: 4, life: 1 });
    particles.forEach(p => {
      const pos = particlePos(p);
      const dist = Math.hypot(pos.x - pointer.x, pos.y - pointer.y);
      if (dist < 150) p.offset += (150 - dist) * 0.35;
    });
  });

  if (reduceMotion) {
    draw();
  } else {
    requestAnimationFrame(loop);
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
    initContactForm(user);

    requestAnimationFrame(() => {
      initScrollAnimations();
      animateStats();
      initContactScrollPeek();
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

/* ── HERO (sem foto: o retrato é a galáxia interativa) ──── */
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

/* ── SOFT SKILLS (chips simples — espera array de strings) ── */
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
  // Email não entra no menu linear de propósito: fica exclusivo do
  // formulário de orçamento (initContactForm), que já usa
  // user.contact.email para montar o mailto.

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

/* ── CONTACT FORM (orçamento) ─────────────────────────────
   Este site é estático, sem backend e sem chave de API configurada.
   Por isso o envio real é feito via mailto: — o formulário monta o
   assunto e o corpo do email e abre o cliente de email do próprio
   visitante, já endereçado para o email de contato do data/user.json,
   pronto pra ele clicar em "enviar". Não é envio silencioso via
   servidor: se algum dia você quiser isso, precisa de um serviço tipo
   Formspree/EmailJS (ou uma function própria) com uma chave — aí sim
   dá pra tirar o mailto e mandar direto sem abrir o cliente de email. */
function initContactForm(user) {
  const form   = document.getElementById("contact-form");
  const note   = document.getElementById("form-note");
  const toMail = user?.contact?.email;
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!toMail) {
      note.textContent = "Email de contato não configurado em data/user.json.";
      note.className = "form-note error";
      return;
    }

    const email       = form.email.value.trim();
    const phone       = form.phone.value.trim();
    const projectName = form.project.value.trim();
    const description = form.description.value.trim();

    const subject = `Orçamento de projeto: ${projectName}`;
    const body =
      `Nome do projeto: ${projectName}\n` +
      `Email para retorno: ${email}\n` +
      `Telefone: ${phone}\n\n` +
      `Descrição:\n${description}`;

    const mailtoUrl =
      `mailto:${encodeURIComponent(toMail)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    note.textContent = "Abrindo seu cliente de email com os dados preenchidos...";
    note.className = "form-note success";
  });
}

/* ── CONTACT SCROLLBAR POP-IN ─────────────────────────────
   Assim que a seção #contato entra em vista, a barra de rolagem do
   menu linear de contato aparece por ~1.6s e some de novo. Só faz
   sentido em telas onde o conteúdo realmente estoura a largura. */
function initContactScrollPeek() {
  const links = document.getElementById("contact-links");
  if (!links) return;

  let played = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played && links.scrollWidth > links.clientWidth) {
        played = true;
        links.classList.add("scrollbar-peek");
        setTimeout(() => links.classList.remove("scrollbar-peek"), 1600);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(links);
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
