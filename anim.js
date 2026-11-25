(function () {
    "use strict";

    /* ── bail jika reduced motion ────────────────────────────────────── */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ── cek GSAP tersedia ───────────────────────────────────────────── */
    if (typeof gsap === "undefined") {
        console.warn("[anim] GSAP not loaded, skipping animations");
        return;
    }

    if (typeof ScrollTrigger === "undefined") {
        console.warn("[anim] ScrollTrigger not loaded, skipping animations");
        return;
    }

    console.log("[anim] GSAP + ScrollTrigger loaded ✓");
    gsap.registerPlugin(ScrollTrigger);

    /* ── Lenis smooth scroll (opsional, jalan tanpa dia juga) ─────── */
    try {
        if (typeof Lenis !== "undefined") {
            var lenis = new Lenis({
                lerp: 0.09,
                smoothWheel: true,
                wheelMultiplier: 0.85
            });

            lenis.on("scroll", ScrollTrigger.update);

            gsap.ticker.add(function (time) {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
            console.log("[anim] Lenis smooth scroll loaded ✓");
        } else {
            console.log("[anim] Lenis not available, using native scroll");
        }
    } catch (e) {
        console.warn("[anim] Lenis init error:", e);
    }

    /* ── helper: split text jadi <span class="char"> ─────────────── */
    function splitChars(el) {
        var html = el.innerHTML;
        var parts = html.split(/(<br\s*\/?>)/gi);
        var result = "";
        for (var p = 0; p < parts.length; p++) {
            var part = parts[p];
            if (/^<br/i.test(part)) {
                result += part;
            } else {
                for (var i = 0; i < part.length; i++) {
                    var c = part[i];
                    if (c === " ") {
                        result += " ";
                    } else {
                        result += '<span class="char">' + c + "</span>";
                    }
                }
            }
        }
        el.innerHTML = result;
        return el.querySelectorAll(".char");
    }

    /* ================================================================
       1 — HERO ENTRANCE
       ================================================================ */
    var heroTL = gsap.timeline({
        defaults: { ease: "expo.out" },
        delay: 0.1
    });

    /* brand */
    var brand = document.querySelector(".brand");
    if (brand) {
        gsap.set(brand, { yPercent: -120, opacity: 0 });
        heroTL.to(brand, { yPercent: 0, opacity: 1, duration: 1 }, 0.1);
    }

    /* nav links */
    var navLinks = document.querySelectorAll(".nav a");
    if (navLinks.length) {
        gsap.set(navLinks, { yPercent: -100, opacity: 0 });
        heroTL.to(navLinks, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05 }, 0.2);
    }

    /* social icons */
    var socialIcons = document.querySelectorAll(".socials a");
    if (socialIcons.length) {
        gsap.set(socialIcons, { scale: 0, rotation: -90 });
        heroTL.to(socialIcons, {
            scale: 1, rotation: 0, duration: 0.7,
            stagger: 0.08, ease: "back.out(2.5)"
        }, 0.35);
    }

    /* lede atas — clip-path wipe dari kiri */
    var ledeTop = document.querySelector(".hero-copy .lede");
    if (ledeTop) {
        gsap.set(ledeTop, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
        heroTL.to(ledeTop, {
            clipPath: "inset(0 0% 0 0)", opacity: 1,
            duration: 0.9, ease: "power3.inOut"
        }, 0.25);
    }

    /* display heading — per-karakter cascade 3D */
    var displayEl = document.querySelector(".display");
    if (displayEl) {
        var chars = splitChars(displayEl);
        gsap.set(chars, {
            yPercent: 110, rotateX: -80, opacity: 0,
            transformOrigin: "0% 50%"
        });
        heroTL.to(chars, {
            yPercent: 0, rotateX: 0, opacity: 1,
            duration: 0.95, stagger: 0.03, ease: "expo.out"
        }, 0.4);
    }

    /* lede bawah */
    var ledeUnder = document.querySelector(".lede--under");
    if (ledeUnder) {
        gsap.set(ledeUnder, { y: 40, opacity: 0 });
        heroTL.to(ledeUnder, { y: 0, opacity: 1, duration: 0.8 }, 0.85);
    }

    /* tombol hero — scale bounce */
    var heroBtn = document.querySelector(".hero .btn");
    if (heroBtn) {
        gsap.set(heroBtn, { scale: 0.6, opacity: 0, transformOrigin: "left center" });
        heroTL.to(heroBtn, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(3)" }, 1.0);
    }

    /* potret — zoom unmask + ring + ornamen */
    var portraitImg = document.querySelector(".portrait img");
    var portraitRing = document.querySelector(".portrait-ring");
    var asterisk = document.querySelector(".asterisk");
    var ticks = document.querySelector(".ticks");

    if (portraitImg) {
        gsap.set(portraitImg, { scale: 1.35, opacity: 0 });
        heroTL.to(portraitImg, { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }, 0.3);
    }
    if (portraitRing) {
        gsap.set(portraitRing, { scale: 0.7, opacity: 0 });
        heroTL.to(portraitRing, { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.6)" }, 0.65);
    }
    if (asterisk) {
        gsap.set(asterisk, { scale: 0, rotation: -180 });
        heroTL.to(asterisk, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2)" }, 0.9);
    }
    if (ticks) {
        var tickItems = ticks.querySelectorAll("i");
        gsap.set(tickItems, { scaleY: 0, transformOrigin: "center bottom" });
        heroTL.to(tickItems, { scaleY: 1, duration: 0.5, stagger: 0.06, ease: "back.out(3)" }, 1.05);
    }

    console.log("[anim] Hero animations ready ✓");

    /* ================================================================
       2 — GHOST HEADINGS: horizontal parallax scrub
       ================================================================ */
    var ghosts = document.querySelectorAll(".ghost");
    ghosts.forEach(function (ghost, i) {
        var xFrom = i % 2 === 0 ? "8%" : "-8%";
        var xTo = i % 2 === 0 ? "-3%" : "3%";

        gsap.fromTo(ghost,
            { x: xFrom, opacity: 0.4 },
            {
                x: xTo, opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ghost,
                    start: "top 88%",
                    end: "bottom 20%",
                    scrub: 0.8
                }
            }
        );
    });

    /* ================================================================
       3 — TENTANG: teks word-by-word fade on scroll
       ================================================================ */
    var tentangBody = document.querySelector("#tentang .body");
    if (tentangBody) {
        var rawText = tentangBody.textContent.trim();
        var words = rawText.split(/\s+/);
        tentangBody.innerHTML = words.map(function (w) {
            return '<span style="display:inline-block;opacity:0.08">' + w + "</span>";
        }).join(" ");

        var wordSpans = tentangBody.querySelectorAll("span");
        gsap.to(wordSpans, {
            opacity: 1,
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
                trigger: tentangBody,
                start: "top 80%",
                end: "bottom 50%",
                scrub: 0.6
            }
        });
    }

    /* ================================================================
       4 — PENDIDIKAN: timeline draw-in
       ================================================================ */
    var timelineItems = document.querySelectorAll(".timeline li");
    /* inject CSS for dot scale */
    var dotCSS = document.createElement("style");
    dotCSS.textContent = ".timeline li::before { transform: scale(var(--dot-s, 1)); }";
    document.head.appendChild(dotCSS);

    timelineItems.forEach(function (li) {
        var children = li.querySelectorAll(".date, h3, .desc");
        gsap.set(children, { x: 50, opacity: 0 });
        li.style.setProperty("--dot-s", "0");

        ScrollTrigger.create({
            trigger: li,
            start: "top 78%",
            onEnter: function () {
                gsap.to(li, {
                    "--dot-s": 1,
                    duration: 0.4,
                    ease: "back.out(3)"
                });
                gsap.to(children, {
                    x: 0, opacity: 1,
                    duration: 0.75, stagger: 0.1,
                    ease: "expo.out",
                    delay: 0.1
                });
            },
            once: true
        });
    });

    /* ================================================================
       5 — SKILL METERS: elastic fill on scroll
       ================================================================ */
    var skillItems = document.querySelectorAll(".skills li");
    skillItems.forEach(function (li) {
        var bar = li.querySelector(".meter i");
        var val = li.querySelector(".skill-val");
        var name = li.querySelector(".skill-name");
        var targetW = bar ? getComputedStyle(bar).getPropertyValue("--v").trim() : "0%";

        if (bar) gsap.set(bar, { width: "0%" });
        if (name) gsap.set(name, { opacity: 0, y: 12 });
        if (val) gsap.set(val, { opacity: 0, y: 12 });

        ScrollTrigger.create({
            trigger: li,
            start: "top 82%",
            onEnter: function () {
                if (name) gsap.to(name, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
                if (val) gsap.to(val, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 });
                if (bar) gsap.to(bar, { width: targetW, duration: 1.3, ease: "elastic.out(1, 0.55)", delay: 0.15 });
            },
            once: true
        });
    });

    /* ================================================================
       6 — PORTFOLIO: 3D perspective entrance
       ================================================================ */
    var workCards = document.querySelectorAll(".work");
    workCards.forEach(function (card, i) {
        var rotY = i % 2 === 0 ? 12 : -12;
        var origin = i % 2 === 0 ? "left center" : "right center";

        gsap.set(card, {
            rotateY: rotY, rotateX: 8, y: 80, opacity: 0,
            transformPerspective: 800,
            transformOrigin: origin
        });

        ScrollTrigger.create({
            trigger: card,
            start: "top 83%",
            onEnter: function () {
                gsap.to(card, {
                    rotateY: 0, rotateX: 0, y: 0, opacity: 1,
                    duration: 1.1, ease: "expo.out"
                });
            },
            once: true
        });
    });

    /* portfolio body text */
    var portBody = document.querySelector("#portofolio .body");
    if (portBody) {
        gsap.set(portBody, { y: 30, opacity: 0 });
        ScrollTrigger.create({
            trigger: portBody,
            start: "top 84%",
            onEnter: function () {
                gsap.to(portBody, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
            },
            once: true
        });
    }

    /* ================================================================
       7 — KONTAK: map clip + links stagger
       ================================================================ */
    var mapEl = document.querySelector(".map");
    if (mapEl) {
        gsap.set(mapEl, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
        ScrollTrigger.create({
            trigger: mapEl,
            start: "top 78%",
            onEnter: function () {
                gsap.to(mapEl, {
                    clipPath: "inset(0 0% 0 0)", opacity: 1,
                    duration: 1, ease: "power3.inOut"
                });
            },
            once: true
        });
    }

    var contactBody = document.querySelector(".contact-copy .body");
    if (contactBody) {
        gsap.set(contactBody, { y: 30, opacity: 0 });
        ScrollTrigger.create({
            trigger: contactBody,
            start: "top 82%",
            onEnter: function () {
                gsap.to(contactBody, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" });
            },
            once: true
        });
    }

    var contactLinks = document.querySelectorAll(".links li");
    if (contactLinks.length) {
        gsap.set(contactLinks, { x: 40, opacity: 0 });
        ScrollTrigger.create({
            trigger: contactLinks[0],
            start: "top 84%",
            onEnter: function () {
                gsap.to(contactLinks, {
                    x: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: "expo.out"
                });
            },
            once: true
        });
    }

    /* ================================================================
       8 — FOOTER: simple fade
       ================================================================ */
    var footer = document.querySelector(".footer");
    if (footer) {
        gsap.set(footer, { opacity: 0, y: 20 });
        ScrollTrigger.create({
            trigger: footer,
            start: "top 92%",
            onEnter: function () {
                gsap.to(footer, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
            },
            once: true
        });
    }

    /* ================================================================
       9 — MAGNETIC HOVER (desktop only)
       ================================================================ */
    if (!("ontouchstart" in window)) {
        function makeMagnetic(el, strength) {
            el.addEventListener("mousemove", function (e) {
                var rect = el.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var dx = (e.clientX - cx) * strength;
                var dy = (e.clientY - cy) * strength;
                gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: "power2.out" });
            });

            el.addEventListener("mouseleave", function () {
                gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            });
        }

        var btn = document.querySelector(".btn");
        if (btn) makeMagnetic(btn, 0.3);

        socialIcons.forEach(function (a) {
            makeMagnetic(a, 0.45);
        });

        /* ============================================================
           10 — CUSTOM CURSOR DOT
           ============================================================ */
        var dot = document.createElement("div");
        dot.className = "cursor-dot";
        document.body.appendChild(dot);

        var mx = -100, my = -100;
        var dotX = -100, dotY = -100;

        document.addEventListener("mousemove", function (e) {
            mx = e.clientX;
            my = e.clientY;
            if (!dot.classList.contains("visible")) dot.classList.add("visible");
        });

        document.addEventListener("mouseleave", function () {
            dot.classList.remove("visible");
        });

        (function tick() {
            dotX += (mx - dotX) * 0.15;
            dotY += (my - dotY) * 0.15;
            dot.style.transform = "translate(" + dotX + "px," + dotY + "px)";
            requestAnimationFrame(tick);
        })();

        var hoverSel = "a, button, .btn, .work, .thumb";
        document.addEventListener("mouseover", function (e) {
            if (e.target.closest(hoverSel)) dot.classList.add("hovering");
        });
        document.addEventListener("mouseout", function (e) {
            if (e.target.closest(hoverSel)) dot.classList.remove("hovering");
        });
    }

    /* ================================================================
       11 — HEADER AUTO-HIDE on scroll down
       ================================================================ */
    var topbar = document.querySelector(".topbar");
    if (topbar) {
        var headerHidden = false;

        ScrollTrigger.create({
            onUpdate: function (self) {
                var scrollY = self.scroll();
                var dir = self.direction;

                if (dir === 1 && scrollY > 200 && !headerHidden) {
                    gsap.to(topbar, { yPercent: -100, duration: 0.4, ease: "power2.inOut" });
                    headerHidden = true;
                } else if (dir === -1 && headerHidden) {
                    gsap.to(topbar, { yPercent: 0, duration: 0.35, ease: "power2.out" });
                    headerHidden = false;
                }
            }
        });
    }

    console.log("[anim] All animations initialized ✓");

})();
