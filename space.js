"use strict";
/* Deep-space background: drifting nebula, parallax stars that follow the scroll, shooting stars */
(function () {
    const cv = document.getElementById("space");
    const g0 = cv ? cv.getContext("2d") : null;
    if (!cv || !g0)
        return;
    const canvas = cv, g = g0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, stars = [];
    const neb = document.createElement("canvas");
    let shoot = null, nextShoot = 4, running = false, raf = 0, lastDraw = 0;
    function build() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        /* nebula is painted once, at half resolution, 1.5 screens tall so it can drift */
        neb.width = Math.ceil(W / 2);
        neb.height = Math.ceil((H * 1.5) / 2);
        const n = neb.getContext("2d");
        if (n) {
            const blobs = [
                [0.18, 0.2, 0.55, 0.2, "110,70,230"], [0.85, 0.35, 0.5, 0.17, "40,140,255"], [0.5, 0.62, 0.6, 0.15, "30,200,255"],
                [0.12, 0.85, 0.5, 0.15, "255,110,200"], [0.8, 0.95, 0.55, 0.17, "70,100,255"]
            ];
            blobs.forEach((b) => {
                const x = b[0] * neb.width, y = b[1] * neb.height, r = b[2] * Math.max(neb.width, neb.height);
                const gr = n.createRadialGradient(x, y, 0, x, y, r);
                gr.addColorStop(0, "rgba(" + b[4] + "," + b[3] + ")");
                gr.addColorStop(1, "rgba(" + b[4] + ",0)");
                n.fillStyle = gr;
                n.fillRect(0, 0, neb.width, neb.height);
            });
        }
        const count = Math.min(180, Math.round((W * H) / 11000));
        stars = [];
        for (let i = 0; i < count; i++) {
            const l = [0.2, 0.5, 1][i % 3];
            stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.4 + l * 0.9 * Math.random() + 0.2, l, tw: 0.6 + Math.random() * 1.6, ph: Math.random() * 6.28, h: Math.random() < 0.12 ? 38 : 190 + Math.random() * 40 });
        }
    }
    function draw(time, dt = 1 / 60) {
        const t = time / 1000, sy = window.scrollY;
        g.clearRect(0, 0, W, H);
        const max = Math.max(1, document.documentElement.scrollHeight - H), off = -Math.min(1, sy / max) * H * 0.5; /* eases down the page, always covers the screen */
        g.globalAlpha = 0.9;
        g.drawImage(neb, Math.sin(t * 0.03) * W * 0.03 - W * 0.03, off, W * 1.06, H * 1.5);
        g.globalAlpha = 1;
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const y = (((s.y - sy * s.l * 0.22) % H) + H) % H;
            const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph))) * (0.35 + s.l * 0.65);
            g.fillStyle = "hsla(" + s.h.toFixed(0) + ",85%,82%," + a.toFixed(3) + ")";
            g.beginPath();
            g.arc(s.x, y, s.r, 0, 6.283);
            g.fill();
        }
        if (!reduce) {
            if (!shoot && t > nextShoot) {
                const fromLeft = Math.random() < 0.5;
                shoot = { x: Math.random() * W * 0.6 + (fromLeft ? 0 : W * 0.3), y: Math.random() * H * 0.4, vx: 900 * (fromLeft ? 1 : -1), vy: 420, t: 0 };
            }
            if (shoot) {
                shoot.t += dt;
                shoot.x += shoot.vx * dt;
                shoot.y += shoot.vy * dt;
                const a = Math.max(0, 1 - shoot.t / 0.9), tx = shoot.x - shoot.vx * 0.09, ty = shoot.y - shoot.vy * 0.09;
                const gr = g.createLinearGradient(tx, ty, shoot.x, shoot.y);
                gr.addColorStop(0, "rgba(140,220,255,0)");
                gr.addColorStop(1, "rgba(220,248,255," + a.toFixed(2) + ")");
                g.strokeStyle = gr;
                g.lineWidth = 1.6;
                g.lineCap = "round";
                g.beginPath();
                g.moveTo(tx, ty);
                g.lineTo(shoot.x, shoot.y);
                g.stroke();
                if (shoot.t > 0.9) {
                    shoot = null;
                    nextShoot = t + 5 + Math.random() * 7;
                }
            }
        }
    }
    const loop = (now) => {
        if (!running || document.hidden) {
            running = false;
            raf = 0;
            return;
        }
        if (now - lastDraw < 1000 / 30) {
            raf = window.requestAnimationFrame(loop);
            return;
        }
        const dt = lastDraw ? Math.min((now - lastDraw) / 1000, 0.05) : 1 / 60;
        lastDraw = now;
        draw(now, dt);
        raf = window.requestAnimationFrame(loop);
    };
    const start = () => {
        if (document.hidden || document.getElementById("cinematic-intro"))
            return;
        if (reduce) {
            draw(0);
            return;
        }
        if (!running) {
            running = true;
            lastDraw = 0;
            raf = window.requestAnimationFrame(loop);
        }
    };
    const stop = () => {
        running = false;
        if (raf)
            window.cancelAnimationFrame(raf);
        raf = 0;
    };
    build();
    window.addEventListener("resize", () => { build(); if (reduce)
        start(); });
    if (reduce)
        window.addEventListener("scroll", start, { passive: true });
    document.addEventListener("intro:closed", start);
    document.addEventListener("visibilitychange", () => { if (document.hidden)
        stop(); else
        start(); });
    start();
})();
