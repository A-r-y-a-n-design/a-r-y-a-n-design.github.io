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

/* ---------- LeetCode problems, animated step by step ---------- */
type Mark = [string, string?];
interface Frame { a: (number | string)[]; m: Record<number, Mark>; n: string; bar?: boolean; cols?: number; }
interface Problem { id: number; slug: string; t: string; tag: string; cx: string; gen: () => Frame[]; }

const F = (a: (number | string)[], m: Record<number, Mark>, n: string, o?: { bar?: boolean; cols?: number }): Frame =>
  ({ a, m, n, bar: o && o.bar, cols: o && o.cols });

/* Binary-search window: L / M / R tags, everything outside the window dimmed */
function win(a: number[], lo: number, hi: number, mid: number, n: string, bar?: boolean): Frame {
  const m: Record<number, Mark> = {};
  for (let i = 0; i < a.length; i++) {
    m[i] = (i < lo || i > hi) ? ["d"] : [i === mid ? "a" : "", (i === lo ? "L" : "") + (i === mid ? "M" : "") + (i === hi ? "R" : "")];
  }
  return F(a, m, n, { bar });
}
/* Final frame: one answer cell lit, the rest dimmed */
function done(a: number[], at: number, tag: string, n: string, bar?: boolean): Frame {
  const m: Record<number, Mark> = {};
  for (let i = 0; i < a.length; i++) m[i] = i === at ? ["h", tag] : ["d"];
  return F(a, m, n, { bar });
}

const PROBLEMS: Problem[] = [
  { id: 1606, slug: "find-servers-that-handled-most-number-of-requests", t: "Find Servers That Handled Most Number of Requests",
    tag: "Simulation · heaps", cx: "O(n log k) time · O(k) space",
    gen: () => {
      const k = 3, arr = [1, 2, 3, 4, 5], load = [5, 2, 3, 3, 3];
      const free = [0, 0, 0], cnt = [0, 0, 0], f: Frame[] = [];
      const tags = (now: number): Record<number, Mark> => {
        const m: Record<number, Mark> = {};
        free.forEach((t, s) => { m[s] = ["", t > now ? `until ${t}` : "free"]; });
        return m;
      };
      f.push(F(cnt.slice(), tags(0), "3 servers. Request i tries server i mod 3, then the next free one.", { cols: 3 }));
      arr.forEach((now, i) => {
        let pick = -1;
        for (let j = 0; j < k; j++) { const s = (i + j) % k; if (free[s] <= now) { pick = s; break; } }
        if (pick >= 0) { free[pick] = now + load[i]; cnt[pick]++; }
        const m = tags(now);
        if (pick >= 0) m[pick] = ["h", `until ${free[pick]}`]; else for (let s = 0; s < k; s++) m[s] = ["x", m[s][1]];
        const first = `Request ${i + 1} at t=${now} (takes ${load[i]}): `;
        f.push(F(cnt.slice(), m, first + (pick < 0 ? "every server is busy, so it is dropped."
          : pick === i % k ? `server ${pick} is free.` : `server ${i % k} is busy, so it moves on to server ${pick}.`), { cols: 3 }));
      });
      const top = Math.max(...cnt), m: Record<number, Mark> = {};
      cnt.forEach((c, s) => { m[s] = c === top ? ["g", "busiest"] : ["d"]; });
      f.push(F(cnt.slice(), m, `Busiest server: ${cnt.map((c, s) => c === top ? s : -1).filter((s) => s >= 0).join(", ")} with ${top} requests.`, { cols: 3 }));
      return f;
    } },
  { id: 540, slug: "single-element-in-a-sorted-array", t: "Single Element in a Sorted Array",
    tag: "Binary search", cx: "O(log n) time · O(1) space",
    gen: () => {
      const a = [1, 1, 2, 3, 3, 4, 4, 8, 8], f: Frame[] = [];
      let lo = 0, hi = a.length - 1;
      while (lo < hi) {
        let mid = (lo + hi) >> 1;
        if (mid % 2 === 1) mid--;
        const same = a[mid] === a[mid + 1];
        f.push(win(a, lo, hi, mid, same ? `Pair at ${mid} matches, so the single is further right.` : `Pair at ${mid} is broken, so the single is here or left.`));
        if (same) lo = mid + 2; else hi = mid;
      }
      f.push(done(a, lo, "single", `The single element is ${a[lo]}.`));
      return f;
    } },
  { id: 852, slug: "peak-index-in-a-mountain-array", t: "Peak Index in a Mountain Array",
    tag: "Binary search", cx: "O(log n) time · O(1) space",
    gen: () => {
      const a = [0, 2, 5, 9, 12, 10, 6, 3, 1], f: Frame[] = [];
      let lo = 0, hi = a.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1, up = a[mid] < a[mid + 1];
        f.push(win(a, lo, hi, mid, up ? `${a[mid]} < ${a[mid + 1]}: still climbing, search right.` : `${a[mid]} > ${a[mid + 1]}: going down, the peak is here or left.`, true));
        if (up) lo = mid + 1; else hi = mid;
      }
      f.push(done(a, lo, "peak", `The peak is at index ${lo} (height ${a[lo]}).`, true));
      return f;
    } },
  { id: 1267, slug: "count-servers-that-communicate", t: "Count Servers That Communicate",
    tag: "Matrix · counting", cx: "O(m·n) time · O(m+n) space",
    gen: () => {
      const g = [[1, 0, 0, 1], [0, 0, 0, 0], [1, 1, 0, 0], [0, 0, 1, 0]], C = 4, f: Frame[] = [];
      const row = [0, 0, 0, 0], col = [0, 0, 0, 0], st: Record<number, Mark> = {}, cells: string[] = [];
      g.forEach((r, i) => r.forEach((v, j) => { row[i] += v; col[j] += v; cells.push(v ? "●" : "·"); if (!v) st[i * C + j] = ["d"]; }));
      f.push(F(cells, { ...st }, "Count the servers in every row and every column first.", { cols: C }));
      let ok = 0;
      g.forEach((r, i) => r.forEach((v, j) => {
        if (!v) return;
        const talks = row[i] > 1 || col[j] > 1, k = i * C + j;
        st[k] = ["a"];
        f.push(F(cells, { ...st }, `Server (${i},${j}): row has ${row[i]}, column has ${col[j]}. ${talks ? "It can talk to another." : "It is alone."}`, { cols: C }));
        st[k] = talks ? ["g", "✓"] : ["x", "alone"];
        if (talks) ok++;
      }));
      f.push(F(cells, { ...st }, `${ok} servers can communicate.`, { cols: C }));
      return f;
    } },
  { id: 33, slug: "search-in-rotated-sorted-array", t: "Search in Rotated Sorted Array",
    tag: "Binary search", cx: "O(log n) time · O(1) space",
    gen: () => {
      const a = [4, 5, 6, 7, 0, 1, 2], t = 0, f: Frame[] = [];
      let lo = 0, hi = a.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid] === t) { f.push(done(a, mid, "found", `Found ${t} at index ${mid}.`)); return f; }
        const leftSorted = a[lo] <= a[mid];
        const inside = leftSorted ? (a[lo] <= t && t < a[mid]) : (a[mid] < t && t <= a[hi]);
        f.push(win(a, lo, hi, mid, `Looking for ${t}: the ${leftSorted ? "left" : "right"} half is sorted and ${inside ? "contains" : "does not contain"} it.`));
        if (leftSorted === inside) hi = mid - 1; else lo = mid + 1;
      }
      f.push(F(a, {}, `${t} is not in the array.`));
      return f;
    } },
  { id: 238, slug: "product-of-array-except-self", t: "Product of Array Except Self",
    tag: "Prefix · suffix", cx: "O(n) time · O(1) extra space",
    gen: () => {
      const a = [1, 2, 3, 4], n = a.length, out = [1, 1, 1, 1], f: Frame[] = [];
      f.push(F(out.slice(), {}, "nums = [1, 2, 3, 4]. The output starts as all 1s."));
      let p = 1;
      for (let i = 0; i < n; i++) {
        out[i] = p;
        const m: Record<number, Mark> = {}; for (let j = 0; j < i; j++) m[j] = ["g"]; m[i] = ["a", `×${p}`];
        f.push(F(out.slice(), m, `Left pass: out[${i}] = product of everything left of it = ${p}.`));
        p *= a[i];
      }
      let s = 1;
      for (let i = n - 1; i >= 0; i--) {
        out[i] *= s;
        const m: Record<number, Mark> = {}; for (let j = i + 1; j < n; j++) m[j] = ["h"]; m[i] = ["a", `×${s}`];
        f.push(F(out.slice(), m, `Right pass: multiply out[${i}] by the product to its right = ${s}.`));
        s *= a[i];
      }
      const m: Record<number, Mark> = {}; out.forEach((_, i) => { m[i] = ["h"]; });
      f.push(F(out.slice(), m, `Answer: [${out.join(", ")}], with no division.`));
      return f;
    } },
  { id: 50, slug: "powx-n", t: "Pow(x, n)",
    tag: "Binary exponentiation", cx: "O(log n) time · O(1) space",
    gen: () => {
      let base = 2, e = 10, res = 1;
      const x = base, n = e, f: Frame[] = [], tg: Mark[] = [["", "base"], ["", "n"], ["", "result"]];
      const show = (r: string[], note: string, hot: boolean): Frame =>
        F([base, e, res], { 0: [r[0], tg[0][1]], 1: [r[1], tg[1][1]], 2: [hot ? "h" : r[2], tg[2][1]] }, note, { cols: 3 });
      f.push(show(["", "", ""], `Compute ${x}^${n} by halving the exponent each step.`, false));
      while (e > 0) {
        const odd = (e & 1) === 1, bits = e.toString(2);
        if (odd) res *= base;
        base *= base; e >>= 1;
        f.push(show(["a", "a", ""], `Lowest bit of ${bits} is ${odd ? "1: multiply the result by the base" : "0: skip"}. Then square the base and halve n.`, odd));
      }
      f.push(show(["d", "d", "g"], `${x}^${n} = ${res}, in ${Math.floor(Math.log2(n)) + 1} steps instead of ${n}.`, false));
      return f;
    } },
  { id: 121, slug: "best-time-to-buy-and-sell-stock", t: "Best Time to Buy and Sell Stock",
    tag: "One pass", cx: "O(n) time · O(1) space",
    gen: () => {
      const a = [7, 1, 5, 3, 6, 4], f: Frame[] = [];
      let min = a[0], mi = 0, best = 0, bi = 0, bj = 0;
      f.push(F(a, { 0: ["g", "min"] }, "Walk the prices once, tracking the lowest price seen so far.", { bar: true }));
      for (let i = 1; i < a.length; i++) {
        if (a[i] < min) { min = a[i]; mi = i; } else if (a[i] - min > best) { best = a[i] - min; bi = mi; bj = i; }
        const m: Record<number, Mark> = {};
        m[i] = ["a", "today"]; m[mi] = ["g", "min"];
        if (best > 0) { m[bi] = ["g", "buy"]; m[bj] = ["h", "sell"]; }
        f.push(F(a, m, `Price ${a[i]}: lowest so far ${min}, best profit ${best}.`, { bar: true }));
      }
      f.push(F(a, { [bi]: ["g", "buy"], [bj]: ["h", "sell"] }, `Buy at ${a[bi]}, sell at ${a[bj]}: profit ${best}.`, { bar: true }));
      return f;
    } },
  { id: 169, slug: "majority-element", t: "Majority Element",
    tag: "Boyer–Moore voting", cx: "O(n) time · O(1) space",
    gen: () => {
      const a = [2, 2, 1, 1, 1, 2, 2], f: Frame[] = [];
      let c = 0, n = 0;
      f.push(F(a, {}, "Each element votes for or against the current candidate."));
      a.forEach((v, i) => {
        if (n === 0) c = v;
        n += v === c ? 1 : -1;
        f.push(F(a, { [i]: ["a", `n=${n}`] }, `Vote ${v}: candidate ${c}, count ${n}.`));
      });
      const m: Record<number, Mark> = {}; a.forEach((v, i) => { m[i] = v === c ? ["h"] : ["d"]; });
      f.push(F(a, m, `${c} survives and appears more than n/2 times.`));
      return f;
    } },
  { id: 53, slug: "maximum-subarray", t: "Maximum Subarray",
    tag: "Kadane’s algorithm", cx: "O(n) time · O(1) space",
    gen: () => {
      const a = [-2, 1, -3, 4, -1, 2, 1, -5, 4], f: Frame[] = [];
      let cur = 0, s = 0, best = -Infinity, bs = 0, be = 0;
      f.push(F(a, {}, "Keep a running sum. If it goes negative, start over."));
      a.forEach((v, i) => {
        const restart = cur < 0;
        cur = restart ? v : cur + v;
        if (restart) s = i;
        if (cur > best) { best = cur; bs = s; be = i; }
        const m: Record<number, Mark> = {};
        for (let j = s; j <= i; j++) m[j] = ["a"];
        m[i] = ["a", String(cur)];
        for (let j = bs; j <= be; j++) m[j] = ["h", j === be ? String(best) : ""];
        f.push(F(a, m, `Sum ${cur}${restart ? " (restarted, the old sum was negative)" : ""}. Best so far ${best}.`));
      });
      const m: Record<number, Mark> = {};
      a.forEach((_, j) => { m[j] = j >= bs && j <= be ? ["h"] : ["d"]; });
      f.push(F(a, m, `Best subarray: [${a.slice(bs, be + 1).join(", ")}] with sum ${best}.`));
      return f;
    } },
  { id: 136, slug: "single-number", t: "Single Number",
    tag: "Bit manipulation", cx: "O(n) time · O(1) space",
    gen: () => {
      const a = [4, 1, 2, 1, 2], f: Frame[] = [];
      let x = 0;
      f.push(F(a, {}, "XOR everything together. Equal pairs cancel out (a ⊕ a = 0)."));
      a.forEach((v, i) => {
        const prev = x; x ^= v;
        const m: Record<number, Mark> = {}; for (let j = 0; j < i; j++) m[j] = ["d"]; m[i] = ["a", `x=${x}`];
        f.push(F(a, m, `${prev} ⊕ ${v} = ${x}`));
      });
      f.push(done(a, a.indexOf(x), "single", `Everything else cancelled. The single number is ${x}.`));
      return f;
    } },
];

function initProblems(): void {
  const grid = document.getElementById("lcgrid");
  if (!grid) return;
  PROBLEMS.forEach((p) => {
    const frames = p.gen();
    const card = document.createElement("article");
    card.className = "viz lc";
    card.setAttribute("aria-label", `LeetCode ${p.id}: ${p.t}, animated walkthrough`);
    card.innerHTML = `<div class="viz-top"><span>#${p.id}</span><span>${p.tag}</span></div><h3>${p.t}</h3>` +
      `<div class="stage" aria-hidden="true"></div><p class="note"></p>` +
      `<div class="viz-code"><span>${p.cx}</span><a href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener">Solve ↗</a></div>`;
    grid.appendChild(card);
    const stage = card.querySelector<HTMLElement>(".stage") as HTMLElement;
    const note = card.querySelector<HTMLElement>(".note") as HTMLElement;

    const show = (f: Frame): void => {
      if (stage.children.length !== f.a.length) {
        stage.innerHTML = f.a.map(() => `<div class="c"><i class="b"></i><span class="v"></span><small></small></div>`).join("");
      }
      const max = Math.max(...f.a.map(Number));
      stage.classList.toggle("barmode", !!f.bar);
      stage.style.setProperty("--cols", String(f.cols || f.a.length));
      f.a.forEach((v, i) => {
        const c = stage.children[i] as HTMLElement;
        const m: Mark = f.m[i] || [""];
        c.className = "c " + (m[0] || "");
        (c.children[0] as HTMLElement).style.height = f.bar ? `${8 + Math.round((56 * Number(v)) / max)}px` : "0px";
        (c.children[1] as HTMLElement).textContent = String(v);
        (c.children[2] as HTMLElement).textContent = m[1] || "";
      });
      note.textContent = f.n;
    };

    if (reduceMotion) { show(frames[frames.length - 1]); return; }
    show(frames[0]);
    let idx = 0, timer = 0, running = false;
    const step = (): void => {
      show(frames[idx]);
      const last = idx === frames.length - 1;
      idx = last ? 0 : idx + 1;
      timer = window.setTimeout(step, last ? 2600 : 1150);
    };
    /* Only animate cards that are on screen */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !running) { running = true; step(); }
        else if (!e.isIntersecting && running) { running = false; window.clearTimeout(timer); }
      });
    }, { threshold: 0.2 });
    io.observe(card);
  });
  const sorting = document.querySelector<HTMLElement>(".sortwrap");
  if (sorting) grid.insertBefore(sorting, grid.children[3] || null);
}
initProblems();

/* ---------- Shared rolling cards ---------- */
function autoRoll(track: HTMLElement | null, label: string, showCounter = true): void {
  if (!track || !track.children.length || reduceMotion) return;
  const sec = track.closest("section");
  if (!sec) return;
  sec.classList.add("autoroll");
  const stage = document.createElement("div");
  stage.className = showCounter ? "lcauto" : "lcauto no-hud";
  if (showCounter) stage.innerHTML = `<div class="lchud" aria-hidden="true"><span>${label}</span><span class="lcn"></span></div>`;
  (track.parentNode as Node).insertBefore(stage, track);
  stage.appendChild(track);
  track.classList.add("roll-track");
  const isList = track.tagName === "UL";
  if (isList) track.setAttribute("role", "list");
  const slots: HTMLElement[] = Array.from(track.children).map((c) => {
    const s = document.createElement("div");
    s.className = "slot3d";
    if (isList) s.setAttribute("role", "listitem");
    if ((c as HTMLElement).classList.contains("sortwrap")) s.classList.add("sort-slot");
    track.replaceChild(s, c);
    s.appendChild(c);
    return s;
  });
  const cnt = showCounter ? stage.querySelector<HTMLElement>(".lcn") : null;
  const originalSlotCount = slots.length;
  const originalSlots = slots.slice();
  const glowCenteredProjects = track.matches(".projects");
  const SPEED = 70; /* px per second */
  let cw = 0, w = 0, L = 1, gap = 30, lefts: number[] = [];
  let t = 0, speed = 0, last = 0, raf = 0;
  let playing = false, hover = false, drag = false, dragX = 0, push = 0, vel = 0, idle = 0, moved = 0, scrollingUntil = 0;
  let wheelDelta = 0, wheelConsumed = false, wheelResetTimer = 0;

  const paint = (): void => {
    const xmin = -w - 140;
    const fadeWidth = Math.max(w, cw * 0.15);
    let near = 0, nd = 9;
    slots.forEach((c, i) => {
      let x = lefts[i] - t;
      x = ((((x - xmin) % L) + L) % L) + xmin; /* wrap around: cards leave on the left and return on the right */
      const d = Math.max(-1.3, Math.min(1.3, (x + w / 2 - cw / 2) / (cw / 2)));
      const a = Math.abs(d);
      if (glowCenteredProjects) c.classList.toggle("is-centered", a < 0.2);
      if (a < nd) { nd = a; near = i % originalSlotCount; }
      c.style.transform = `translate3d(${(x - lefts[i]).toFixed(1)}px,0,0) perspective(1100px) translateZ(${(-a * 190).toFixed(0)}px) rotateY(${(d * 42).toFixed(1)}deg) scale(${(1 - a * 0.07).toFixed(3)})`;
      const edgeFade = Math.max(0, Math.min(1, (x + w) / fadeWidth, (cw - x) / fadeWidth));
      c.style.opacity = ((1 - Math.min(a, 1.3) * 0.28) * edgeFade).toFixed(2);
    });
    if (cnt) cnt.textContent = `${String(near + 1).padStart(2, "0")} / ${String(originalSlotCount).padStart(2, "0")}`;
  };
  const measure = (): void => {
    cw = stage.clientWidth || window.innerWidth;
    w = slots[0].offsetWidth;
    const minLoopWidth = cw + w;
    gap = slots.length > 1 ? slots[1].offsetLeft - slots[0].offsetLeft - slots[0].offsetWidth : 0;
    const getLoopWidth = (): number => slots[slots.length - 1].offsetLeft + slots[slots.length - 1].offsetWidth + gap;
    while (!showCounter && getLoopWidth() < minLoopWidth) {
      const clone = originalSlots[slots.length % originalSlotCount].cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("inert", "");
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      track.appendChild(clone);
      slots.push(clone);
    }
    while (!showCounter && slots.length > originalSlotCount) {
      const last = slots[slots.length - 1];
      const previous = slots[slots.length - 2];
      const previousLoopWidth = previous.offsetLeft + previous.offsetWidth + gap;
      if (previousLoopWidth < minLoopWidth) break;
      track.removeChild(last);
      slots.pop();
    }
    lefts = slots.map((c) => c.offsetLeft);
    L = lefts[lefts.length - 1] + slots[slots.length - 1].offsetWidth + gap;
    paint();
  };
  const frame = (now: number): void => {
    if (!playing) { raf = 0; return; }
    if (now < scrollingUntil) { last = now; raf = window.requestAnimationFrame(frame); return;     }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const goal = drag || now < idle ? 0 : hover ? SPEED * 0.35 : SPEED; /* auto-roll resumes after manual use */
    speed += (goal - speed) * Math.min(1, dt * 4);
    t += speed * dt;
    const m = push * Math.min(1, dt * 7); t += m; push -= m; if (Math.abs(push) < 0.1) push = 0;
    paint();
    raf = window.requestAnimationFrame(frame);
  };
  stage.addEventListener("pointerenter", (e: PointerEvent) => { if (e.pointerType === "mouse") hover = true; });
  stage.addEventListener("pointerleave", () => { hover = false; });
  const hold = (): void => { idle = performance.now() + 2500; };
  window.addEventListener("scroll", () => { scrollingUntil = performance.now() + 180; }, { passive: true });
  stage.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return;
    drag = true; dragX = e.clientX; vel = 0; push = 0; moved = 0;
    if (e.button === 1) e.preventDefault();
  });
  window.addEventListener("pointermove", (e: PointerEvent) => {
    if (!drag) return;
    const dx = dragX - e.clientX;
    t += dx; moved += Math.abs(dx); vel = vel * 0.6 + dx * 0.4; dragX = e.clientX; hold();
  });
  const release = (): void => { if (!drag) return; drag = false; push += vel * 14; vel = 0; hold(); };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  stage.addEventListener("scroll", () => { stage.scrollLeft = 0; });
  stage.addEventListener("dragstart", (e: Event) => e.preventDefault());
  stage.addEventListener("click", (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
  stage.addEventListener("wheel", (e: WheelEvent) => {
    if (e.ctrlKey) return;
    const unit = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? stage.clientHeight : 1;
    const dx = e.deltaX * unit;
    const dy = e.deltaY * unit;
    const stageRect = stage.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const centerX = stageRect.left + stageRect.width / 2;
    const wheelZone = Math.min(stageRect.width * 0.2, 180);
    const overCards = e.clientX >= centerX - wheelZone &&
      e.clientX <= centerX + wheelZone &&
      e.clientY >= trackRect.top &&
      e.clientY <= trackRect.bottom;
    if (!overCards) return;
    if (Math.abs(dx) > Math.abs(dy) && !e.shiftKey) {
      e.preventDefault();
      push += dx;
    } else if (e.shiftKey && Math.abs(dy || dx) > 0) {
      e.preventDefault();
      push += dy || dx;
    } else if (Math.abs(dy) > 0) {
      if (wheelConsumed) {
        window.clearTimeout(wheelResetTimer);
        wheelResetTimer = window.setTimeout(() => { wheelConsumed = false; wheelDelta = 0; }, 320);
        return;
      }
      e.preventDefault();
      wheelDelta += dy;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => { wheelDelta = 0; }, 320);
      if (Math.abs(wheelDelta) >= 45) {
        push += Math.sign(wheelDelta) * (w + gap);
        wheelDelta = 0;
        wheelConsumed = true;
        wheelResetTimer = window.setTimeout(() => { wheelConsumed = false; wheelDelta = 0; }, 320);
      }
    } else {
      return;
    }
    hold();
  }, { passive: false });
  stage.tabIndex = 0;
  stage.setAttribute("aria-label", "Solved problems and live sorting visualization. Scroll, drag, or use the left and right arrow keys to browse.");
  stage.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const direction = e.key === "ArrowRight" ? 1 : -1;
    push += direction * (w + 30);
    activeIndex = (activeIndex + direction + originalSlotCount) % originalSlotCount;
    hold();
  });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !playing) { playing = true; last = performance.now(); raf = window.requestAnimationFrame(frame); }
      else if (!e.isIntersecting) { playing = false; if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }
    });
  }, { threshold: 0.1 });
  io.observe(stage);
}
autoRoll(document.getElementById("lcgrid"), "Solved");
autoRoll(document.querySelector<HTMLElement>(".skills"), "Skills", false);
autoRoll(document.querySelector<HTMLElement>(".projects"), "Projects", false);
autoRoll(document.querySelector<HTMLElement>(".socials"), "Connect", false);

/* ---------- Headings decode themselves when they scroll into view ---------- */
function initScramble(): void {
  const els = document.querySelectorAll<HTMLElement>("main h2, .proj h3, .building h3");
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#%&";
  const decode = (el: HTMLElement): void => {
    el.classList.add("h-in");
    const text = el.textContent || "";
    const t0 = performance.now(), dur = 500 + text.length * 22;
    el.setAttribute("aria-label", text);
    const tick = (now: number): void => {
      const k = Math.min(1, (now - t0) / dur), keep = Math.floor(k * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) out += (i < keep || text[i] === " ") ? text[i] : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      el.textContent = k < 1 ? out : text;
      if (k < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };
  if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("h-in")); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { decode(e.target as HTMLElement); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach((e) => io.observe(e));
}
initScramble();


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

function initScrollPerformance(): void {
  let stopTimer = 0;
  window.addEventListener("scroll", () => {
    document.documentElement.classList.add("is-scrolling");
    window.clearTimeout(stopTimer);
    stopTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("is-scrolling");
      stopTimer = 0;
    }, 180);
  }, { passive: true });
}

function initSectionWheel(): void {
  let locked = false, settleTimer = 0, safetyTimer = 0, cooldownUntil = 0;
  const finishScroll = (): void => {
    window.clearTimeout(safetyTimer);
    safetyTimer = 0;
    settleTimer = 0;
    locked = false;
    cooldownUntil = performance.now() + 180;
  };
  window.addEventListener("scroll", () => {
    if (!locked) return;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(finishScroll, 180);
  }, { passive: true });
  window.addEventListener("wheel", (e: WheelEvent) => {
    if (window.innerWidth < 821 || e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    const now = performance.now();
    if (locked || now < cooldownUntil) return;
    const stops = Array.from(document.querySelectorAll<HTMLElement>(".hero, main > section"));
    if (stops.length < 2) return;
    const center = window.innerHeight / 2;
    let current = 0, distance = Infinity;
    stops.forEach((stop, i) => {
      const rect = stop.getBoundingClientRect();
      const d = Math.abs(rect.top + rect.height / 2 - center);
      if (d < distance) {
        current = i;
        distance = d;
      }
    });
    const next = Math.max(0, Math.min(stops.length - 1, current + (e.deltaY > 0 ? 1 : -1)));
    if (next === current) return;
    const rect = stops[next].getBoundingClientRect();
    const target = Math.max(0, Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      window.scrollY + rect.top + rect.height / 2 - center
    ));
    if (Math.abs(target - window.scrollY) < 2) return;
    locked = true;
    safetyTimer = window.setTimeout(finishScroll, 1500);
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  }, { passive: false });
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
  if (!canvas || getComputedStyle(canvas).display === "none") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0, h = 0, frame = 0, raf = 0, running = false;
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
    if (!reduceMotion && running) raf = window.requestAnimationFrame(draw);
    else { running = false; raf = 0; }
  };

  const start = (): void => {
    if (running || document.hidden || document.getElementById("cinematic-intro")) return;
    running = true;
    draw();
  };
  const stop = (): void => {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener("intro:closed", start);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
  resize();
  start();
}

initProgress();
initScrollPerformance();
initSectionWheel();
initTilt();
initBackground();

/* ---------- Hover and tap feedback: ripple, icon pop, light sweep ---------- */
function initPress(): void {
  const targets = document.querySelectorAll<HTMLElement>(".social, .skills li, .proj, .viz, .building");
  targets.forEach((el) => {
    el.classList.add("fx");
    const layer = document.createElement("span");
    layer.className = "rip";
    layer.setAttribute("aria-hidden", "true");
    el.insertBefore(layer, el.firstChild);

    /* Glossy neon overlay on cards: lights up on hover and on touch */
    if (el.isConnected) {
      const gloss = document.createElement("span");
      gloss.className = "gloss";
      gloss.setAttribute("aria-hidden", "true");
      el.appendChild(gloss);
      el.addEventListener("pointermove", (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    }

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


/* The intro sequence and section travel now live in cosmos.ts */

/* ---------- Scroll-triggered cinematic card entrances ---------- */
function initCinematicReveals(): void {
  const cards = document.querySelectorAll<HTMLElement>(".proj, .social, .building, .viz");
  if (!("IntersectionObserver" in window)) { cards.forEach((card) => card.classList.add("in-view")); return; }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      el.classList.add("in-view");
      obs.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -45px 0px" });
  cards.forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${(index % 3) * 110}ms`);
    observer.observe(card);
  });
}

/* ---------- Avatar reacts gently to the visitor ---------- */
function initLivingAvatar(): void {
  const avatar = document.querySelector<HTMLElement>(".avatar");
  if (!avatar || reduceMotion) return;
  avatar.addEventListener("pointermove", (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const rect = avatar.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    avatar.style.setProperty("--avatar-ry", `${(px * 7).toFixed(2)}deg`);
    avatar.style.setProperty("--avatar-rx", `${(-py * 7).toFixed(2)}deg`);
    avatar.style.setProperty("--avatar-x", `${(px * 5).toFixed(1)}px`);
    avatar.style.setProperty("--avatar-y", `${(py * 5).toFixed(1)}px`);
  });
  avatar.addEventListener("pointerleave", () => {
    avatar.style.setProperty("--avatar-rx", "0deg"); avatar.style.setProperty("--avatar-ry", "0deg");
    avatar.style.setProperty("--avatar-x", "0px"); avatar.style.setProperty("--avatar-y", "0px");
  });
}

initCinematicReveals();
initLivingAvatar();

/* ---------- Neon cursor ring (mouse devices only) ---------- */
function initCursor(): void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const ring = document.createElement("div");
  ring.id = "cursor";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  document.documentElement.classList.add("ring-on"); /* hides the system cursor everywhere */
  let x = 0, y = 0, cx = 0, cy = 0, seen = false, raf = 0;
  const k = reduceMotion ? 1 : 0.22;
  const loop = (): void => {
    cx += (x - cx) * k; cy += (y - cy) * k;
    ring.style.translate = `${(cx - 16).toFixed(1)}px ${(cy - 16).toFixed(1)}px`; /* property order: translate first, then scale, so the hover scale grows around the ring centre */
    if (Math.abs(x - cx) < 0.1 && Math.abs(y - cy) < 0.1) {
      cx = x; cy = y; raf = 0;
    } else raf = window.requestAnimationFrame(loop);
  };
  const move = (e: MouseEvent): void => {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; cx = x; cy = y; ring.classList.add("on"); }
    if (!raf) raf = window.requestAnimationFrame(loop);
  };
  /* capture + several event types so cards, drags and native link-dragging can never strand the ring */
  ["pointermove", "mousemove", "pointerdown", "pointerup", "drag", "dragover"].forEach((n) => window.addEventListener(n, move as EventListener, { capture: true, passive: true }));
  document.addEventListener("dragstart", (e: Event) => e.preventDefault());
  document.addEventListener("pointerover", (e: PointerEvent) => {
    const t = e.target as HTMLElement | null;
    ring.classList.toggle("hot", !!(t && t.closest && t.closest("a, button, .fx")));
  });
  document.documentElement.addEventListener("pointerleave", () => ring.classList.remove("on"));
  document.documentElement.addEventListener("pointerenter", () => { if (seen) ring.classList.add("on"); });
}
initCursor();
