/* ==========================================================================
   NEXY METRHON — shared interactions
   Progressive enhancement. Safe to block: the page works without JavaScript.
   Kontak/contact: edit assets/config.js (satu tempat untuk semua halaman).
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = window.NEXY || {};
  var KONTAK = CONFIG.kontak || {};
  var LOCALE = CONFIG.locale || "id-ID";
  var WA_TEXT = CONFIG.waText || "Halo Nexy Metrhon, saya ingin membahas proyek.";

  /* ---------- 1. Contact details ---------- */
  if (KONTAK.wa || KONTAK.email || KONTAK.ig) {
    var hrefs = {
      wa: "https://wa.me/" + KONTAK.wa + "?text=" + encodeURIComponent(WA_TEXT),
      email: "mailto:" + KONTAK.email,
      ig: "https://instagram.com/" + KONTAK.ig
    };
    var texts = { nomor: KONTAK.nomor, email: KONTAK.email, ig: "@" + KONTAK.ig };

    document.querySelectorAll("[data-kontak]").forEach(function (el) {
      var href = hrefs[el.getAttribute("data-kontak")];
      if (href) el.setAttribute("href", href);
    });
    document.querySelectorAll("[data-kontak-text]").forEach(function (el) {
      var value = texts[el.getAttribute("data-kontak-text")];
      if (value) el.textContent = value;
    });

    /* Keep SEO structured data (JSON-LD) in sync with the same config,
       so you only ever edit contacts in one place: assets/config.js */
    (function syncJsonLd() {
      var tel = String(KONTAK.nomor || "").replace(/\s+/g, "-");
      var igUrl = KONTAK.ig ? "https://www.instagram.com/" + KONTAK.ig : "";
      function walk(node) {
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (!node || typeof node !== "object") return;
        Object.keys(node).forEach(function (key) {
          var val = node[key];
          if (key === "email" && KONTAK.email) node[key] = KONTAK.email;
          else if (key === "telephone" && tel) node[key] = tel;
          else if (key === "sameAs" && Array.isArray(val) && KONTAK.ig) {
            node[key] = val.map(function (u) {
              return /instagram\.com/i.test(u) ? igUrl : u;
            });
          } else {
            walk(val);
          }
        });
      }
      document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
        try {
          var data = JSON.parse(script.textContent);
          walk(data);
          script.textContent = JSON.stringify(data);
        } catch (e) { /* ignore malformed block */ }
      });
    })();
  }

  /* ---------- 2. Edition date & year ---------- */
  document.querySelectorAll("[data-edition-date]").forEach(function (el) {
    try {
      el.textContent = new Date().toLocaleDateString(LOCALE, {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) {
      el.textContent = new Date().toISOString().slice(0, 10);
    }
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 3. Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  var navbar = document.querySelector(".mainnav");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("is-open") &&
          !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  /* ---------- 4. Nav shadow on scroll ---------- */
  function onScroll() {
    if (navbar) navbar.classList.toggle("is-scrolled", window.scrollY > 6);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 5. Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 6. Active navigation ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));
  var linkById = {};
  navLinks.forEach(function (link) { linkById[link.getAttribute("href").slice(1)] = link; });

  if ("IntersectionObserver" in window && Object.keys(linkById).length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          var active = linkById[entry.target.id];
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }
})();
