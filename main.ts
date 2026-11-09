/* Light touches of animation, written in TypeScript and compiled to main.js */

const reduceMotion: boolean = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* Typing effect for the role line */
function initTyping(): void {
  const el = document.getElementById("typed");
  if (!el) return;
  const roles: string[] = ["C++ developer", "Python programmer", "web builder", "problem solver"];
  if (reduceMotion) { el.textContent = roles[0]; return; }

  let role = 0;
  let chars = 0;
  let deleting = false;

  const tick = (): void => {
    const word = roles[role];
    chars += deleting ? -1 : 1;
    el.textContent = word.slice(0, chars);
    let delay = deleting ? 45 : 85;
    if (!deleting && chars === word.length) { deleting = true; delay = 1500; }
    else if (deleting && chars === 0) { deleting = false; role = (role + 1) % roles.length; delay = 350; }
    window.setTimeout(tick, delay);
  };
  tick();
}

/* Quote: words fade in one after another when it scrolls into view */
function initQuote(): void {
  const fig = document.getElementById("quote-fig");
  const p = document.querySelector<HTMLElement>("#quote-fig blockquote p");
  if (!fig || !p || !p.textContent) return;

  const words = p.textContent.trim().split(/\s+/);
  p.textContent = "";
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.style.transitionDelay = `${i * 70}ms`;
    span.textContent = word + (i < words.length - 1 ? " " : "");
    p.appendChild(span);
  });

  const io = new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { fig.classList.add("in"); obs.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(fig);
}

/* Skill rows ease in as you scroll */
function initReveal(): void {
  const rows = document.querySelectorAll<HTMLElement>(".skills li");
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  rows.forEach((row) => { row.classList.add("reveal"); io.observe(row); });
}

initTyping();
initQuote();
initReveal();

/* ---------- Scroll progress bar ---------- */
function initProgress(): void {
  const bar = document.getElementById("progress");
  if (!bar) return;
  const update = (): void => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- 3D tilt: icons turn toward the pointer ---------- */
function initTilt(): void {
  if (reduceMotion) return;
  const targets = document.querySelectorAll<HTMLElement>(".skills li, .social, .proj, .avatar");
  targets.forEach((el) => {
    el.addEventListener("pointermove", (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(px * 30).toFixed(1)}deg`);
      el.style.setProperty("--rx", `${(-py * 30).toFixed(1)}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

/* ---------- Background: a network of connected nodes (a graph) ---------- */
interface GraphNode { x: number; y: number; vx: number; vy: number; }

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function initBackground(): void {
  const canvas = document.getElementById("bg") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0, h = 0, frame = 0;
  let rgb = "36,71,245";
  let nodes: GraphNode[] = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130;

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(80, Math.round((w * h) / 22000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
    }
  };

  const draw = (): void => {
    if (frame++ % 60 === 0) {
      const a = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (a.charAt(0) === "#") rgb = hexToRgb(a);
    }
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) { n.x += (dx / d) * 0.8; n.y += (dy / d) * 0.8; }
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},0.45)`;
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${rgb},${((1 - d / LINK) * 0.25).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
      const mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 170) {
        ctx.strokeStyle = `rgba(${rgb},${((1 - md / 170) * 0.5).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!reduceMotion) window.requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  draw();
}

initProgress();
initTilt();
initBackground();

/* ---------- Hover and tap feedback: ripple, icon pop, light sweep ---------- */
function initPress(): void {
  const targets = document.querySelectorAll<HTMLElement>(".social, .skills li, .proj");
  targets.forEach((el) => {
    el.classList.add("fx");
    const layer = document.createElement("span");
    layer.className = "rip";
    layer.setAttribute("aria-hidden", "true");
    el.insertBefore(layer, el.firstChild);

    el.addEventListener("pointerdown", (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dot = document.createElement("i");
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      layer.appendChild(dot);
      window.setTimeout(() => dot.remove(), 750);
      el.classList.remove("tapped");
      void el.offsetWidth; /* restart the animation */
      el.classList.add("tapped");
      window.setTimeout(() => el.classList.remove("tapped"), 650);
    });
  });

  /* Let the tap animation play before a social link opens */
  document.querySelectorAll<HTMLAnchorElement>("a.social").forEach((link) => {
    link.addEventListener("click", (e: MouseEvent) => {
      if (reduceMotion || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const href = link.href;
      window.setTimeout(() => { window.location.href = href; }, 280);
    });
  });
}

initPress();

/* ---------- Portfolio welcome intro ---------- */
function initIntro(): void {
  const overlay = document.getElementById("intro");
  const skip = document.getElementById("intro-skip");
  if (!overlay) return;

  const finish = (): void => {
    overlay.classList.add("is-leaving");
    window.setTimeout(() => overlay.remove(), 800);
    try { window.sessionStorage.setItem("aryan-intro-seen", "1"); } catch { /* Storage may be unavailable. */ }
  };

  let alreadySeen = false;
  try { alreadySeen = window.sessionStorage.getItem("aryan-intro-seen") === "1"; } catch { /* Continue without storage. */ }
  if (alreadySeen) { overlay.remove(); return; }

  skip?.addEventListener("click", finish);
  if (reduceMotion) { finish(); return; }
  window.setTimeout(finish, 2900);
}

initIntro();
