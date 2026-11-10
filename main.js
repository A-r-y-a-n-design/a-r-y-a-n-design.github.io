"use strict";
/* Light touches of animation, written in TypeScript and compiled to main.js */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");
/* Typing effect for the role line */
function initTyping() {
    const el = document.getElementById("typed");
    if (!el)
        return;
    const roles = ["C++ developer", "Python programmer", "web builder", "problem solver"];
    if (reduceMotion) {
        el.textContent = roles[0];
        return;
    }
    let role = 0;
    let chars = 0;
    let deleting = false;
    const tick = () => {
        const word = roles[role];
        chars += deleting ? -1 : 1;
        el.textContent = word.slice(0, chars);
        let delay = deleting ? 45 : 85;
        if (!deleting && chars === word.length) {
            deleting = true;
            delay = 1500;
        }
        else if (deleting && chars === 0) {
            deleting = false;
            role = (role + 1) % roles.length;
            delay = 350;
        }
        window.setTimeout(tick, delay);
    };
    tick();
}
/* Quote: words fade in one after another when it scrolls into view */
function initQuote() {
    const fig = document.getElementById("quote-fig");
    const p = document.querySelector("#quote-fig blockquote p");
    if (!fig || !p || !p.textContent)
        return;
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
        if (entries[0].isIntersecting) {
            fig.classList.add("in");
            obs.disconnect();
        }
    }, { threshold: 0.4 });
    io.observe(fig);
}
/* Skill rows ease in as you scroll */
function initReveal() {
    const rows = document.querySelectorAll(".skills li");
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("in");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });
    rows.forEach((row) => { row.classList.add("reveal"); io.observe(row); });
}
initTyping();
initQuote();
initReveal();
/* ---------- Scroll progress bar ---------- */
function initProgress() {
    const bar = document.getElementById("progress");
    if (!bar)
        return;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
}
/* ---------- 3D tilt: icons turn toward the pointer ---------- */
function initTilt() {
    if (reduceMotion)
        return;
    const targets = document.querySelectorAll(".skills li, .social, .proj, .avatar");
    targets.forEach((el) => {
        el.addEventListener("pointermove", (e) => {
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
function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
function initBackground() {
    const canvas = document.getElementById("bg");
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    let w = 0, h = 0, frame = 0;
    let rgb = "36,71,245";
    let nodes = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK = 130;
    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(80, Math.round((w * h) / 22000));
        nodes = [];
        for (let i = 0; i < count; i++) {
            nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
        }
    };
    const draw = () => {
        if (frame++ % 60 === 0) {
            const a = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
            if (a.charAt(0) === "#")
                rgb = hexToRgb(a);
        }
        ctx.clearRect(0, 0, w, h);
        for (const n of nodes) {
            if (!reduceMotion) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w)
                    n.vx *= -1;
                if (n.y < 0 || n.y > h)
                    n.vy *= -1;
                const dx = n.x - mouse.x, dy = n.y - mouse.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120 && d > 0) {
                    n.x += (dx / d) * 0.8;
                    n.y += (dy / d) * 0.8;
                }
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
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
            const mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < 170) {
                ctx.strokeStyle = `rgba(${rgb},${((1 - md / 170) * 0.5).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
        if (!reduceMotion)
            window.requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
    resize();
    draw();
}
initProgress();
initTilt();
initBackground();
/* ---------- Hover and tap feedback: ripple, icon pop, light sweep ---------- */
function initPress() {
    const targets = document.querySelectorAll(".social, .skills li, .proj");
    targets.forEach((el) => {
        el.classList.add("fx");
        const layer = document.createElement("span");
        layer.className = "rip";
        layer.setAttribute("aria-hidden", "true");
        el.insertBefore(layer, el.firstChild);
        el.addEventListener("pointerdown", (e) => {
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
    document.querySelectorAll("a.social").forEach((link) => {
        link.addEventListener("click", (e) => {
            if (reduceMotion || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
                return;
            e.preventDefault();
            const href = link.href;
            window.setTimeout(() => { window.location.href = href; }, 280);
        });
    });
}
initPress();
/* ---------- ARYAN.OS cinematic intro ---------- */
function initCinematicIntro() {
    const intro = document.getElementById("cinematic-intro");
    const skip = document.getElementById("intro-skip");
    const status = document.getElementById("intro-status");
    if (!intro)
        return;
    const storageKey = "aryan-os-intro-seen";
    let alreadySeen = false;
    try {
        alreadySeen = sessionStorage.getItem(storageKey) === "1";
    }
    catch (_) { /* storage may be blocked */ }
    const close = () => {
        intro.classList.add("is-leaving");
        window.setTimeout(() => intro.remove(), reduceMotion ? 0 : 900);
        try {
            sessionStorage.setItem(storageKey, "1");
        }
        catch (_) { /* storage may be blocked */ }
    };
    if (alreadySeen) {
        intro.remove();
        return;
    }
    if (status) {
        const start = Date.now();
        const update = () => {
            const elapsed = Math.min(100, Math.round((Date.now() - start) / 26));
            const number = status.querySelector("span");
            if (number)
                number.textContent = String(elapsed).padStart(2, "0");
            if (elapsed < 100 && intro.isConnected)
                window.setTimeout(update, 35);
        };
        update();
    }
    if (skip)
        skip.addEventListener("click", close);
    if (reduceMotion) {
        window.setTimeout(close, 500);
        return;
    }
    window.setTimeout(close, 3100);
}
/* ---------- Scroll-triggered cinematic card entrances ---------- */
function initCinematicReveals() {
    const cards = document.querySelectorAll(".proj, .social, .building, .viz");
    if (!("IntersectionObserver" in window)) {
        cards.forEach((card) => card.classList.add("in-view"));
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const el = entry.target;
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
function initLivingAvatar() {
    const avatar = document.querySelector(".avatar");
    if (!avatar || reduceMotion)
        return;
    avatar.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch")
            return;
        const rect = avatar.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        avatar.style.setProperty("--avatar-ry", `${(px * 7).toFixed(2)}deg`);
        avatar.style.setProperty("--avatar-rx", `${(-py * 7).toFixed(2)}deg`);
        avatar.style.setProperty("--avatar-x", `${(px * 5).toFixed(1)}px`);
        avatar.style.setProperty("--avatar-y", `${(py * 5).toFixed(1)}px`);
    });
    avatar.addEventListener("pointerleave", () => {
        avatar.style.setProperty("--avatar-rx", "0deg");
        avatar.style.setProperty("--avatar-ry", "0deg");
        avatar.style.setProperty("--avatar-x", "0px");
        avatar.style.setProperty("--avatar-y", "0px");
    });
}
initCinematicIntro();
initCinematicReveals();
initLivingAvatar();
