const toggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const root = document.documentElement;

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
  const saved = localStorage.getItem("theme");

  if (saved) {
    applyTheme(saved);
  } else {
    const system = getSystemTheme();
    applyTheme(system);
  }
}

toggleBtn.addEventListener("click", () => {
  const isDark = root.classList.contains("dark-theme");
  const next = isDark ? "light" : "dark";

  applyTheme(next);
  localStorage.setItem("theme", next);

  themeIcon.style.transform = "scale(0.8)";
  setTimeout(() => {
    themeIcon.style.transform = "scale(1)";
  }, 180);
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  const saved = localStorage.getItem("theme"); 
  if (!saved) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

initTheme();
