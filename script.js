
(function () {
    "use strict";

    var toggle = document.getElementById("menu-toggle");
    var nav = document.getElementById("nav-menu");
    var links = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

    function setMenu(open) {
        if (!toggle || !nav) return;
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });
    }

    links.forEach(function (a) {
        a.addEventListener("click", function () {
            setMenu(false);
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", function (e) {
        if (!nav || !toggle) return;
        if (nav.contains(e.target) || toggle.contains(e.target)) return;
        setMenu(false);
    });

    var sections = links
        .map(function (a) {
            var id = a.getAttribute("href");
            return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
        })
        .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    var terlihat = new Map();

    var io = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                terlihat.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
            });

            var juara = null;
            var skor = 0;
            terlihat.forEach(function (ratio, id) {
                if (ratio > skor) {
                    skor = ratio;
                    juara = id;
                }
            });

            links.forEach(function (a) {
                var aktif = juara && a.getAttribute("href") === "#" + juara;
                if (aktif) {
                    a.setAttribute("aria-current", "true");
                } else {
                    a.removeAttribute("aria-current");
                }
            });
        },
        {
            rootMargin: "-96px 0px -55% 0px",
            threshold: [0, 0.15, 0.35, 0.6, 0.85]
        }
    );

    sections.forEach(function (s) {
        terlihat.set(s.id, 0);
        io.observe(s);
    });
})();
