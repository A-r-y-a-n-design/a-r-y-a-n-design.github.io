"use strict";
/* Scroll journey: one constellation of nodes that morphs into a data structure per chapter */
(function () {
    const canvas = document.getElementById("scene");
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!canvas || !ctx)
        return;
    const c2 = ctx;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 127, TAU = Math.PI * 2;
    const mk = (spin, sway, ax, ay, sc, alpha, emul) => ({ p: new Float32Array(N * 3), e: [], s: new Set(), spin, sway, ax, ay, sc, alpha, emul });
    const put = (f, i, x, y, z) => { f.p[i * 3] = x; f.p[i * 3 + 1] = y; f.p[i * 3 + 2] = z; };
    const link = (f, a, b) => {
        if (a === b || a < 0 || b < 0 || a >= N || b >= N)
            return;
        const k = a < b ? a * 256 + b : b * 256 + a;
        if (!f.s.has(k)) {
            f.s.add(k);
            f.e.push(a, b);
        }
    };
    const d2 = (f, a, b) => {
        const dx = f.p[a * 3] - f.p[b * 3], dy = f.p[a * 3 + 1] - f.p[b * 3 + 1], dz = f.p[a * 3 + 2] - f.p[b * 3 + 2];
        return dx * dx + dy * dy + dz * dz;
    };
    const nearest = (f, i, lo, hi, k) => {
        const arr = [];
        for (let j = lo; j < hi; j++)
            if (j !== i)
                arr.push({ d: d2(f, i, j), j });
        arr.sort((a, b) => a.d - b.d);
        return arr.slice(0, k).map((o) => o.j);
    };
    const forms = [];
    { /* 0 · graph core (sphere) */
        const f = mk(0.14, 0, 0.72, 0.52, 0.74, 1, 0.8);
        for (let i = 0; i < N; i++) {
            const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), t = i * 2.39996;
            put(f, i, Math.cos(t) * r, y, Math.sin(t) * r);
        }
        for (let i = 0; i < N; i++)
            nearest(f, i, 0, N, 3).forEach((j) => link(f, i, j));
        forms.push(f);
    }
    { /* 1 · binary tree */
        const f = mk(0, 0.5, 0.76, 0.5, 0.8, 0.55, 1);
        for (let L = 0; L < 7; L++) {
            const n = 1 << L;
            for (let j = 0; j < n; j++) {
                const i = n - 1 + j;
                put(f, i, ((j + 0.5) / n - 0.5) * 2.1, 0.95 - L * (1.9 / 6), Math.sin(j * 1.9 + L * 0.7) * 0.28);
                if (i > 0)
                    link(f, i, (i - 1) >> 1);
            }
        }
        forms.push(f);
    }
    { /* 2 · sorted bars */
        const f = mk(0, 0.45, 0.5, 0.5, 1.05, 0.75, 1);
        const C = 16;
        const hs = (k) => { const h = []; for (let c = 0; c < C; c++)
            h.push(Math.max(1, Math.round((c + 1) * k))); return h; };
        let best = 1, bd = 1e9;
        for (let k = 0.5; k < 1.5; k += 0.005) {
            const s = hs(k).reduce((a, b) => a + b, 0);
            if (Math.abs(s - N) < bd) {
                bd = Math.abs(s - N);
                best = k;
            }
        }
        const h = hs(best);
        h[C - 1] += N - h.reduce((a, b) => a + b, 0);
        const id = [];
        let i = 0;
        for (let c = 0; c < C; c++) {
            id.push([]);
            for (let r = 0; r < h[c]; r++) {
                put(f, i, (c / (C - 1)) * 2 - 1, -0.9 + r * 0.115, Math.sin(c * 1.3 + r * 0.5) * 0.12);
                id[c].push(i++);
            }
        }
        for (let c = 0; c < C; c++)
            for (let r = 0; r < h[c]; r++) {
                if (r > 0)
                    link(f, id[c][r], id[c][r - 1]);
                if (c > 0 && r < h[c - 1])
                    link(f, id[c][r], id[c - 1][r]);
            }
        forms.push(f);
    }
    { /* 3 · linked helix */
        const f = mk(0.3, 0, 0.86, 0.5, 0.72, 0.35, 1);
        for (let i = 0; i < N; i++) {
            const k = i >> 1, s = i & 1, a = k * 0.42 + s * Math.PI;
            put(f, i, Math.cos(a) * 0.62, ((k / 63) * 2 - 1) * 0.95, Math.sin(a) * 0.62);
            link(f, i, i + 2);
            if (s === 0 && k % 3 === 0)
                link(f, i, i + 1);
        }
        forms.push(f);
    }
    { /* 4 · 3D lattice */
        const f = mk(0.2, 0, 0.78, 0.5, 0.5, 0.55, 0.55);
        for (let x = 0; x < 5; x++)
            for (let y = 0; y < 5; y++)
                for (let z = 0; z < 5; z++) {
                    const i = x * 25 + y * 5 + z;
                    put(f, i, (x - 2) * 0.45, (y - 2) * 0.45, (z - 2) * 0.45);
                    if (x > 0)
                        link(f, i, i - 25);
                    if (y > 0)
                        link(f, i, i - 5);
                    if (z > 0)
                        link(f, i, i - 1);
                }
        put(f, 125, 0, 1.2, 0);
        put(f, 126, 0, -1.2, 0);
        link(f, 125, 72);
        link(f, 126, 52);
        forms.push(f);
    }
    { /* 5 · hub and rings */
        const f = mk(0.12, 0, 0.74, 0.5, 0.6, 0.85, 1);
        put(f, 0, 0, 0, 0);
        const rings = [{ n: 7, r: 0.55, t: 0.5 }, { n: 28, r: 0.85, t: -0.35 }, { n: 45, r: 1.1, t: 0.9 }, { n: 46, r: 1.3, t: -0.8 }];
        let i = 1, pLo = 0, pHi = 1;
        rings.forEach((g, k) => {
            const lo = i;
            for (let j = 0; j < g.n; j++) {
                const a = (j / g.n) * TAU + k * 0.7, y0 = Math.sin(a) * g.r;
                put(f, i, Math.cos(a) * g.r, y0 * Math.cos(g.t), y0 * Math.sin(g.t));
                i++;
            }
            for (let j = 0; j < g.n; j++) {
                link(f, lo + j, lo + ((j + 1) % g.n));
                nearest(f, lo + j, pLo, pHi, 1).forEach((q) => link(f, lo + j, q));
            }
            pLo = lo;
            pHi = i;
        });
        forms.push(f);
    }
    const specs = [
        [".hero", 0, 1, "Intro", "Graph core · V = 127"],
        ["#skills", 1, 1, "Skills", "Binary tree · O(log n)"],
        ["#leetcode", 3, 1, "Problems I solved", "Linked nodes · O(n)"],
        ["#philosophy", 0, 0.6, "Philosophy", "Graph core · connected"],
        ["#projects", 4, 1, "Projects", "3D lattice · building blocks"],
        ["#connect", 5, 1, "Connect", "Hub & spokes · network"]
    ];
    const chapters = [];
    specs.forEach((s) => { const el = document.querySelector(s[0]); if (el)
        chapters.push({ el, form: s[1], mul: s[2], title: s[3], ds: s[4] }); });
    if (!chapters.length)
        return;
    /* ---------- State ---------- */
    let W = 0, H = 0, dpr = 1;
    const pos = new Float32Array(N * 3), from = new Float32Array(N * 3), rb = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) {
        rb[i] = Math.random() * 2 - 1;
        pos[i] = forms[0].p[i];
        from[i] = pos[i];
    }
    let cur = 0, chap = 0, tween = 1;
    let ax = forms[0].ax, ay = forms[0].ay, sc = forms[0].sc, al = 1;
    let tAx = ax, tAy = ay, tSc = sc, tAl = 1;
    const ea = forms.map((_, i) => (i === 0 ? 1 : 0));
    function retarget() {
        const f = forms[cur], m = window.innerWidth < 820;
        tAx = m ? 0.5 : f.ax;
        tAy = f.ay;
        tSc = f.sc * (m ? 0.8 : 1);
        tAl = f.alpha * chapters[chap].mul * (m ? 0.55 : 1);
    }
    /* ---------- HUD ---------- */
    const rail = document.getElementById("chapters"), cap = document.getElementById("cap");
    const capNum = document.getElementById("cap-num"), capTitle = document.getElementById("cap-title"), capDs = document.getElementById("cap-ds");
    const dots = [];
    if (rail)
        chapters.forEach((c, i) => {
            const a = document.createElement("a");
            a.href = "#";
            a.setAttribute("aria-label", c.title);
            a.innerHTML = "<span>" + c.title + "</span><i></i>";
            a.addEventListener("click", (e) => {
                e.preventDefault();
                if (i === 0)
                    window.scrollTo({ top: 0, behavior: "smooth" });
                else
                    c.el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            rail.appendChild(a);
            dots.push(a);
        });
    function hud(i) {
        dots.forEach((d, k) => d.classList.toggle("on", k === i));
        if (!cap || !capNum || !capTitle || !capDs)
            return;
        cap.classList.add("out");
        window.setTimeout(() => {
            capNum.textContent = String(i + 1).padStart(2, "0") + " / " + String(chapters.length).padStart(2, "0");
            capTitle.textContent = chapters[i].title;
            capDs.textContent = chapters[i].ds;
            cap.classList.remove("out");
        }, 220);
    }
    function setChapter(i) {
        if (i === chap)
            return;
        chap = i;
        const nf = chapters[i].form;
        if (nf !== cur) {
            from.set(pos);
            cur = nf;
            tween = reduce ? 1 : 0;
        }
        retarget();
        hud(i);
    }
    let ticking = false;
    function onScroll() {
        if (ticking)
            return;
        ticking = true;
        window.requestAnimationFrame(() => {
            ticking = false;
            const mid = window.innerHeight * 0.45;
            for (let i = 0; i < chapters.length; i++) {
                const r = chapters[i].el.getBoundingClientRect();
                if (r.top <= mid && r.bottom > mid) {
                    setChapter(i);
                    break;
                }
            }
            document.documentElement.classList.toggle("at-top", window.scrollY < 60);
        });
    }
    /* ---------- Rendering ---------- */
    const sprite = (core, mid) => {
        const s = document.createElement("canvas");
        s.width = s.height = 64;
        const g = s.getContext("2d");
        if (g) {
            const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
            gr.addColorStop(0, "rgba(255,255,255,1)");
            gr.addColorStop(0.18, core);
            gr.addColorStop(0.5, mid);
            gr.addColorStop(1, "rgba(0,0,0,0)");
            g.fillStyle = gr;
            g.fillRect(0, 0, 64, 64);
        }
        return s;
    };
    const sprites = [sprite("rgba(120,235,255,.95)", "rgba(60,170,255,.22)"), sprite("rgba(95,165,255,.95)", "rgba(40,100,255,.22)"), sprite("rgba(255,205,100,.95)", "rgba(255,150,0,.22)")];
    const px = new Float32Array(N), py = new Float32Array(N), pf = new Float32Array(N), pd = new Float32Array(N);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let last = performance.now(), time = 0, ry = 0, spinCur = 0, swayCur = 0, gain = 1, raf = 0, running = false;
    let pmx = 0.5, pmy = 0.5, mx = 0.5, my = 0.5;
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        retarget();
    }
    function frame(now) {
        if (!running || document.hidden) {
            running = false;
            raf = 0;
            return;
        }
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        time += dt;
        const k = 1 - Math.exp(-dt * 3.2);
        ax += (tAx - ax) * k;
        ay += (tAy - ay) * k;
        sc += (tSc - sc) * k;
        al += (tAl - al) * k;
        if (tween < 1)
            tween = Math.min(1, tween + dt / 1.7);
        const e = ease(tween), burst = reduce ? 0 : Math.sin(Math.PI * tween) * 0.55;
        const F = forms[cur];
        for (let i = 0; i < N * 3; i++)
            pos[i] = from[i] + (F.p[i] - from[i]) * e + rb[i] * burst;
        mx += (pmx - mx) * k;
        my += (pmy - my) * k;
        spinCur += ((reduce ? 0 : F.spin) - spinCur) * k;
        swayCur += ((reduce ? 0 : F.sway) - swayCur) * k;
        gain += ((F.spin > 0 ? 1 : 0.12) - gain) * k;
        ry += spinCur * dt;
        if (F.spin === 0)
            ry += (Math.round(ry / TAU) * TAU - ry) * k;
        const yaw = ry + window.scrollY * 0.0006 * gain + swayCur * Math.sin(time * 0.45) + (mx - 0.5) * 0.7;
        const pitch = 0.26 + (my - 0.5) * 0.4;
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        const S = sc * Math.min(W, H) * 0.5;
        for (let i = 0; i < N; i++) {
            const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
            const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
            const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
            const f = 3 / (3.2 - z2);
            px[i] = ax * W + x1 * f * S;
            py[i] = ay * H - y2 * f * S;
            pf[i] = f;
            pd[i] = Math.min(1, Math.max(0, (z2 + 1.3) / 2.6));
        }
        c2.clearRect(0, 0, W, H);
        const gx = ax * W, gy = ay * H, gr = c2.createRadialGradient(gx, gy, 0, gx, gy, S * 1.25);
        gr.addColorStop(0, "rgba(61,139,255," + (0.17 * al).toFixed(3) + ")");
        gr.addColorStop(1, "rgba(61,139,255,0)");
        c2.fillStyle = gr;
        c2.fillRect(0, 0, W, H);
        c2.lineWidth = 1;
        for (let fi = 0; fi < forms.length; fi++) {
            const goal = fi === cur ? 1 : 0;
            ea[fi] += (goal - ea[fi]) * (1 - Math.exp(-dt * (goal ? 2.2 : 5)));
            if (ea[fi] < 0.02)
                continue;
            const E = forms[fi].e, a0 = ea[fi] * al * 0.6 * forms[fi].emul;
            for (let n = 0; n < E.length; n += 2) {
                const a = E[n], b = E[n + 1], d = (pd[a] + pd[b]) * 0.5;
                c2.strokeStyle = "rgba(110,190,255," + (a0 * (0.25 + 0.75 * d)).toFixed(3) + ")";
                c2.beginPath();
                c2.moveTo(px[a], py[a]);
                c2.lineTo(px[b], py[b]);
                c2.stroke();
            }
        }
        c2.globalCompositeOperation = "lighter";
        const unit = Math.min(1.5, Math.max(0.6, S / 300));
        for (let i = 0; i < N; i++) {
            const size = (7 + 12 * pd[i]) * pf[i] * unit;
            c2.globalAlpha = Math.min(1, al * (0.3 + 0.7 * pd[i]));
            c2.drawImage(sprites[i % 13 === 0 ? 2 : i % 4 === 0 ? 1 : 0], px[i] - size, py[i] - size, size * 2, size * 2);
        }
        c2.globalAlpha = 1;
        c2.globalCompositeOperation = "source-over";
        raf = window.requestAnimationFrame(frame);
    }
    function start() {
        if (running || document.hidden || document.getElementById("cinematic-intro"))
            return;
        running = true;
        last = performance.now();
        raf = window.requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        if (raf)
            window.cancelAnimationFrame(raf);
        raf = 0;
    }
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", (ev) => { pmx = ev.clientX / window.innerWidth; pmy = ev.clientY / window.innerHeight; });
    document.addEventListener("intro:closed", start);
    document.addEventListener("visibilitychange", () => { if (document.hidden)
        stop(); else
        start(); });
    resize();
    hud(0);
    onScroll();
    start();
})();
