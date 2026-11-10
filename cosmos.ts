/* Cosmos: intro (name → collapse → star → quote → warp → star map) and star travel between sections */
(function () {
  const cos = document.getElementById("cosmos");
  const cv = document.getElementById("warp") as HTMLCanvasElement | null;
  const star0 = cos ? cos.querySelector<HTMLElement>(".star") : null;
  const ctx0 = cv ? cv.getContext("2d") : null;
  if (!cos || !cv || !star0 || !ctx0) { const i = document.getElementById("cinematic-intro"); if (i) i.remove(); return; }
  const cosEl: HTMLElement = cos, canvas: HTMLCanvasElement = cv, starEl: HTMLElement = star0, c2: CanvasRenderingContext2D = ctx0;
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "aryans-workplace-intro-seen";
  let intro: HTMLElement | null = document.getElementById("cinematic-intro");

  /* ---------- Canvas: hyperspace streaks, nebula glow, collapse particles ---------- */
  const S = { speed: 0.03, veil: 0, sa: 0, hue: 212 };
  type Key = "speed" | "veil" | "sa" | "hue";
  interface Tw { k: Key; a: number; b: number; t0: number; d: number; }
  let tws: Tw[] = [];
  const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const to = (k: Key, b: number, d: number): void => {
    tws = tws.filter((w) => w.k !== k);
    tws.push({ k, a: NaN, b, t0: performance.now(), d });
  };
  interface P { x: number; y: number; z: number; h: number; }
  const ps: P[] = [];
  const respawn = (p: P, fresh: boolean): void => { p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; p.z = fresh ? 0.05 + Math.random() * 0.95 : 1; p.h = Math.random() * 50 - 25; };
  for (let i = 0; i < (window.innerWidth < 700 ? 150 : 280); i++) { const p: P = { x: 0, y: 0, z: 1, h: 0 }; respawn(p, true); ps.push(p); }
  const blobs = [0, 1, 2, 3, 4].map((i) => ({ a: i * 1.26 + 0.4, o: i / 5, h: (i % 3) * 28 - 20 }));
  interface Im { a: number; r: number; d: number; }
  let imp: Im[] = [], impT0 = 0;
  let W = 0, H = 0, running = false, last = 0, neb = 0;

  function size(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    c2.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function frame(now: number): void {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    tws = tws.filter((w) => {
      if (now < w.t0) return true;
      if (isNaN(w.a)) w.a = S[w.k];
      const u = Math.min(1, (now - w.t0) / w.d);
      S[w.k] = w.a + (w.b - w.a) * ease(u);
      return u < 1;
    });
    const cx = W / 2, cy = H / 2, k = Math.max(W, H) * 0.16, hue = S.hue;
    c2.clearRect(0, 0, W, H);
    c2.globalCompositeOperation = "source-over";
    if (S.veil > 0.003) {
      const gr = c2.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.6);
      gr.addColorStop(0, "hsla(" + hue + ",80%,15%," + S.veil.toFixed(3) + ")");
      gr.addColorStop(1, "hsla(" + (hue + 30) + ",70%,3%," + S.veil.toFixed(3) + ")");
      c2.fillStyle = gr; c2.fillRect(0, 0, W, H);
    }
    c2.globalCompositeOperation = "lighter";
    neb += dt * (0.04 + S.speed * 0.1);
    if (S.veil > 0.01) {
      const big = Math.max(W, H);
      blobs.forEach((b) => {
        const u = (neb + b.o) % 1, r = u * u * big * 0.7, sz = 40 + u * u * big * 0.45;
        const x = cx + Math.cos(b.a) * r, y = cy + Math.sin(b.a) * r, al = S.veil * 0.33 * Math.sin(Math.PI * u);
        const gr = c2.createRadialGradient(x, y, 0, x, y, sz);
        gr.addColorStop(0, "hsla(" + (hue + b.h) + ",85%,55%," + al.toFixed(3) + ")");
        gr.addColorStop(1, "hsla(" + (hue + b.h) + ",85%,55%,0)");
        c2.fillStyle = gr; c2.fillRect(x - sz, y - sz, sz * 2, sz * 2);
      });
    }
    c2.lineCap = "round";
    const tr = Math.min(0.55, S.speed * 0.1);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.z -= S.speed * dt;
      const z1 = p.z, z0 = Math.min(1.4, p.z + tr);
      const x1 = cx + (p.x / z1) * k, y1 = cy + (p.y / z1) * k;
      if (z1 < 0.04 || x1 < -60 || x1 > W + 60 || y1 < -60 || y1 > H + 60) { respawn(p, false); continue; }
      const x0 = cx + (p.x / z0) * k, y0 = cy + (p.y / z0) * k;
      const a = Math.min(1, (1 - z1) * 1.4) * S.sa * (0.35 + 0.65 * Math.min(1, S.speed));
      c2.strokeStyle = "hsla(" + (hue + p.h).toFixed(0) + ",90%," + (68 + (1 - z1) * 20).toFixed(0) + "%," + a.toFixed(3) + ")";
      c2.lineWidth = 0.6 + (1 - z1) * 2.2;
      c2.beginPath(); c2.moveTo(x0, y0); c2.lineTo(x1, y1); c2.stroke();
    }
    if (imp.length) {
      const el = now - impT0;
      let live = 0;
      c2.lineWidth = 1.6;
      imp.forEach((m) => {
        const u = (el - m.d) / 1300;
        if (u >= 1) return;
        live++;
        if (u < 0) return;
        const at = (q: number): number[] => { const rr = m.r * (1 - q * q), an = m.a + q * 2.8; return [cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]; };
        const p1 = at(u), p0 = at(Math.max(0, u - 0.09));
        c2.strokeStyle = "rgba(150,235,255," + (0.9 * Math.min(1, (1 - u) * 5)).toFixed(3) + ")";
        c2.beginPath(); c2.moveTo(p0[0], p0[1]); c2.lineTo(p1[0], p1[1]); c2.stroke();
      });
      if (!live) imp = [];
    }
    c2.globalCompositeOperation = "source-over";
    window.requestAnimationFrame(frame);
  }
  const start = (): void => { if (running) return; running = true; last = performance.now(); window.requestAnimationFrame(frame); };
  const stop = (): void => { running = false; c2.clearRect(0, 0, W, H); };
  const showCos = (): void => { cosEl.classList.add("on"); start(); };
  const hideCos = (): void => { cosEl.classList.remove("on"); stop(); };

  /* ---------- The star ---------- */
  let mode: "center" | "raised" | "menu" = "center";
  let ringMode = false, menuShown = false;
  function place(): void {
    let y = 0, s = 1;
    if (mode === "raised") { y = -H * 0.25; s = 0.85; }
    else if (mode === "menu" && !ringMode) { y = -H / 2 + Math.max(56, H * 0.14); s = 0.5; }
    starEl.style.setProperty("--sx", "0px");
    starEl.style.setProperty("--sy", y.toFixed(0) + "px");
    starEl.style.setProperty("--ss", String(s));
  }
  const ping = (): void => { starEl.classList.remove("ping"); void starEl.offsetWidth; starEl.classList.add("ping"); };
  const after = (fn: () => void, ms: number): number => window.setTimeout(fn, ms);

  /* ---------- Star map (menu) ---------- */
  const menu = document.getElementById("intro-menu");
  const opts = menu ? Array.from(menu.querySelectorAll<HTMLAnchorElement>("a.opt")) : [];
  const svg = menu ? menu.querySelector<SVGSVGElement>(".intro-lines") : null;
  const lines: SVGLineElement[] = [];
  if (svg) opts.forEach((_o, i) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("pathLength", "1"); l.style.setProperty("--i", String(i));
    svg.appendChild(l); lines.push(l);
  });
  function layoutMenu(): void {
    if (!menu) return;
    ringMode = W >= 820 && H >= 560;
    menu.classList.toggle("grid", !ringMode);
    menu.style.setProperty("--cols", W >= 600 ? "3" : "2");
    const rx = Math.min(W * 0.34, 470), ry = Math.min(H * 0.3, 300);
    opts.forEach((o, i) => {
      const a = ((-90 + (i * 360) / opts.length) * Math.PI) / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      o.style.setProperty("--x", x.toFixed(1) + "px"); o.style.setProperty("--y", y.toFixed(1) + "px");
      const l = lines[i];
      if (l) { l.setAttribute("x1", String(W / 2)); l.setAttribute("y1", String(H / 2)); l.setAttribute("x2", (W / 2 + x).toFixed(1)); l.setAttribute("y2", (H / 2 + y).toFixed(1)); }
    });
    if (svg) svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    place();
  }

  /* ---------- Destinations ---------- */
  const HUES: { [k: string]: number } = { "#top": 212, "#skills": 196, "#leetcode": 34, "#philosophy": 300, "#projects": 160, "#connect": 330 };
  interface Dest { y: number; dock: HTMLElement; }
  function resolve(sel: string): Dest | null {
    if (sel === "#top") return { y: 0, dock: document.querySelector<HTMLElement>(".hero h1") || document.body };
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return null;
    return { y: Math.max(0, el.getBoundingClientRect().top + window.scrollY), dock: el.querySelector<HTMLElement>("h2, blockquote") || el };
  }
  function replayHero(): void {
    if (reduce) return;
    document.querySelectorAll<HTMLElement>(".hero h1, .hero .role, .hero .lede, .hero .btns, .hero .avatar").forEach((el) => {
      el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
    });
  }
  function jump(sel: string): void {
    const d = resolve(sel);
    if (!d) return;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, d.y);
    window.requestAnimationFrame(() => { root.style.scrollBehavior = ""; });
    if (d.y === 0) replayHero();
  }
  function removeIntro(): void {
    if (intro) { intro.remove(); intro = null; }
    root.classList.remove("intro-lock");
    try { sessionStorage.setItem(KEY, "1"); } catch (_e) { /* storage may be blocked */ }
  }

  /* ---------- Travel: the star carries you through hyperspace and stops at the section ---------- */
  let busy = false;
  function travel(sel: string): void {
    if (busy || !resolve(sel)) return;
    busy = true;
    const fromIntro = !!(intro && intro.isConnected);
    if (reduce) { removeIntro(); jump(sel); busy = false; return; }
    const d0 = resolve(sel) as Dest;
    const near = !fromIntro && Math.abs(window.scrollY - d0.y) < 40;
    if (fromIntro && intro) intro.classList.add("is-picked");
    S.hue = HUES[sel] !== undefined ? HUES[sel] : 212;
    mode = "center"; place(); showCos(); starEl.classList.add("born");
    const lead = fromIntro ? (ringMode ? 350 : 750) : 250;
    let t = lead;
    if (!near) {
      if (!fromIntro) { S.sa = 0; S.speed = 0.03; }
      after(() => { to("sa", 1, 500); to("speed", 3.2, 900); to("veil", 1, 800); }, lead);
      after(() => { removeIntro(); jump(sel); }, lead + 900);
      after(() => { to("speed", 0.05, 1100); to("veil", 0, 1000); }, lead + 1000);
      t = lead + 1300;
    } else t = lead + 250;
    after(() => {
      const d = resolve(sel);
      if (!d) return;
      const r = d.dock.getBoundingClientRect();
      const x = Math.min(W - 16, Math.max(16, r.left - 24)), y = Math.min(H - 24, Math.max(24, r.top + r.height / 2));
      starEl.style.setProperty("--sx", (x - W / 2).toFixed(0) + "px");
      starEl.style.setProperty("--sy", (y - H / 2).toFixed(0) + "px");
      starEl.style.setProperty("--ss", "0.55");
      after(() => {
        ping(); d.dock.classList.add("star-hit");
        after(() => d.dock.classList.remove("star-hit"), 1400);
        to("sa", 0, 700);
        after(() => {
          starEl.classList.remove("born", "ping");
          hideCos();
          starEl.style.transition = "none"; mode = "center"; place(); void starEl.offsetWidth; starEl.style.transition = "";
          S.sa = 0; S.speed = 0.03; S.veil = 0; tws = []; busy = false;
        }, 650);
      }, 1050);
    }, t);
  }

  /* ---------- Intro sequence ---------- */
  let timers: number[] = [];
  const later = (fn: () => void, ms: number): void => { timers.push(window.setTimeout(fn, ms)); };
  const clearTimers = (): void => { timers.forEach((id) => window.clearTimeout(id)); timers = []; };
  let typing = false;

  function showMenu(): void {
    if (!intro || menuShown) return;
    menuShown = true; typing = false; clearTimers();
    intro.classList.add("phase-collapse", "phase-star", "phase-quote", "phase-warp", "phase-menu");
    mode = "menu"; layoutMenu();
    S.hue = 212; showCos(); starEl.classList.add("born"); ping();
    to("sa", 0.6, 800); to("speed", 0.07, 800); to("veil", 0, 800);
    const sk = document.getElementById("intro-skip");
    if (sk) sk.innerHTML = "ENTER SITE <span>↗</span>";
  }
  function warp(): void {
    if (!intro || menuShown) return;
    intro.classList.add("phase-warp");
    mode = "center"; place();
    to("sa", 1, 800);
    later(() => { to("speed", 3, 1500); to("veil", 0.8, 1300); }, 800);
    later(() => { to("speed", 0.07, 1500); to("veil", 0, 1400); }, 2700);
    later(showMenu, 3400);
  }
  function startIntro(el: HTMLElement): void {
    root.classList.add("intro-lock");
    const quoteEl = document.getElementById("intro-quote");
    const full = quoteEl ? quoteEl.textContent || "" : "";
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#%&";
    el.addEventListener("pointermove", (e: PointerEvent) => {
      el.style.setProperty("--ix", ((e.clientX / W - 0.5) * 2).toFixed(2));
      el.style.setProperty("--iy", ((e.clientY / H - 0.5) * 2).toFixed(2));
    });
    const status = document.getElementById("intro-status");
    if (status) {
      const t0 = Date.now();
      const upd = (): void => {
        const n = Math.min(100, Math.round((Date.now() - t0) / 29)), num = status.querySelector("span");
        if (num) num.textContent = String(n).padStart(2, "0");
        if (n < 100 && el.isConnected) window.setTimeout(upd, 35);
      };
      upd();
    }
    if (reduce) {
      if (quoteEl) quoteEl.textContent = full;
      later(() => el.classList.add("phase-collapse", "phase-star", "phase-quote"), 1500);
      later(showMenu, 3600);
      return;
    }
    /* the name decodes inside the core */
    el.querySelectorAll<HTMLElement>(".il").forEach((n, i) => {
      const text = n.dataset.t || n.textContent || "";
      n.style.visibility = "hidden";
      later(() => {
        n.style.visibility = "visible";
        const t0 = performance.now(), dur = 600 + text.length * 45;
        const tick = (now: number): void => {
          if (!n.isConnected) return;
          const q = Math.min(1, (now - t0) / dur), keep = Math.floor(q * text.length);
          let out = "";
          for (let c = 0; c < text.length; c++) out += (c < keep || text[c] === " ") ? text[c] : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
          n.textContent = q < 1 ? out : text;
          if (q < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      }, 300 + i * 500);
    });
    /* collapse onto itself, then the star is born */
    later(() => {
      el.classList.add("phase-collapse");
      const core = el.querySelector<HTMLElement>(".intro-core"), R = core ? core.getBoundingClientRect().width * 0.8 : 150;
      imp = []; impT0 = performance.now();
      for (let i = 0; i < 90; i++) imp.push({ a: Math.random() * 6.283, r: R * (0.5 + Math.random() * 1.1), d: Math.random() * 500 });
      S.sa = 0; showCos();
    }, 3500);
    later(() => { el.classList.add("phase-star"); starEl.classList.add("born"); ping(); to("sa", 0.4, 1500); }, 4900);
    later(() => { mode = "raised"; place(); }, 5700);
    later(() => {
      el.classList.add("phase-quote");
      if (!quoteEl) { later(warp, 2500); return; }
      quoteEl.textContent = ""; typing = true;
      let n = 0;
      const step = (): void => {
        if (!typing) return;
        n++; quoteEl.textContent = full.slice(0, n);
        if (n < full.length) window.setTimeout(step, 26 + (full.charAt(n - 1) === "," ? 260 : 0));
        else { typing = false; later(warp, 1100); }
      };
      window.setTimeout(step, 700);
    }, 6100);
  }

  /* ---------- Wiring ---------- */
  size(); place();
  window.addEventListener("resize", () => { size(); if (menuShown) layoutMenu(); else place(); });
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch (_e) { /* storage may be blocked */ }
  if (intro && seen) { intro.remove(); intro = null; }
  if (intro) {
    startIntro(intro);
    if (menu) menu.addEventListener("click", (e: MouseEvent) => {
      const a = (e.target as Element).closest("a.opt") as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      a.classList.add("picked");
      travel(a.dataset.to || "#top");
    });
    const leave = (): void => { if (menuShown) travel("#top"); else showMenu(); };
    const skip = document.getElementById("intro-skip");
    if (skip) skip.addEventListener("click", leave);
    document.addEventListener("keydown", (e: KeyboardEvent) => { if (e.key === "Escape" && intro) leave(); });
  }

  /* Header links, hero buttons and the chapter rail all use the same star travel */
  const RAIL: { [k: string]: string } = { Intro: "#top", Skills: "#skills", Problems: "#leetcode", Philosophy: "#philosophy", Projects: "#projects", Connect: "#connect" };
  if (!reduce) document.addEventListener("click", (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const t = e.target as Element | null, a = t && t.closest ? t.closest("a") : null;
    if (!a || (intro && intro.contains(a))) return;
    let sel = "";
    if (a.parentElement && a.parentElement.id === "chapters") sel = RAIL[a.getAttribute("aria-label") || ""] || "";
    else { const h = a.getAttribute("href") || ""; if (/^#[A-Za-z][\w-]*$/.test(h) && document.querySelector(h)) sel = h; }
    if (!sel) return;
    e.preventDefault(); e.stopImmediatePropagation();
    travel(sel);
  }, true);
})();
