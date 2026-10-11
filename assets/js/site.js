(function () {
  document.documentElement.classList.add("js");

  var header = document.querySelector(".site-header");
  var menu = document.querySelector(".menu");
  var nav = document.getElementById("nav");
  var fab = document.querySelector(".contact-fab");
  var year = document.getElementById("year");
  var pageMain = document.querySelector("main");
  var pageFooter = document.querySelector(".site-footer");

  if (year) year.textContent = String(new Date().getFullYear());

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Header: transparent over the hero, solid once scrolled ---------- */

  var alwaysSolid = document.body.hasAttribute("data-solid-header");
  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-solid", alwaysSolid || window.scrollY > 24);
  }
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- Mobile menu ---------- */

  function setMenu(open) {
    if (!menu || !nav) return;
    menu.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (pageMain) pageMain.inert = open;
    if (pageFooter) pageFooter.inert = open;
    syncFab();
  }

  if (menu && nav) {
    menu.addEventListener("click", function () {
      setMenu(menu.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    if (window.matchMedia) {
      var desktop = window.matchMedia("(min-width: 1024px)");
      if (desktop.addEventListener) {
        desktop.addEventListener("change", function () {
          if (desktop.matches) setMenu(false);
        });
      }
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menu.focus();
      }
      if (event.key !== "Tab" || !document.body.classList.contains("menu-open")) return;
      var focusable = nav.querySelectorAll("a");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        menu.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        menu.focus();
      } else if (!event.shiftKey && document.activeElement === menu) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Media: every photo and video comes from images.js by id ---------- */

  function mountImage(el, image, options) {
    if (!el || !image || el.dataset.mounted === "true") return;
    options = options || {};
    var playVideo = image.type === "video" && !options.still && !prefersReducedMotion();
    if (playVideo) {
      var video = document.createElement("video");
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.poster = image.poster || "";
      ["autoplay", "muted", "loop", "playsinline"].forEach(function (attr) {
        video.setAttribute(attr, "");
      });
      video.setAttribute("aria-hidden", "true");
      video.style.objectPosition = image.focal || "center center";
      var source = document.createElement("source");
      source.src = image.src;
      source.type = "video/mp4";
      video.appendChild(source);
      var fellBack = false;
      var usePoster = function () {
        if (fellBack) return;
        fellBack = true;
        video.remove();
        el.dataset.mounted = "false";
        mountImage(el, {
          type: "image",
          src: image.poster || image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          focal: image.focal,
          priority: image.priority
        }, options);
      };
      video.addEventListener("error", usePoster);
      source.addEventListener("error", usePoster);
      el.prepend(video);
      el.dataset.mounted = "true";
      // Some browsers do not start dynamically inserted videos from autoplay
      // alone. Request playback explicitly once mounted and after returning
      // to a visible tab. Keep the poster while the video buffers.
      function startPlayback() {
        if (fellBack || !video.isConnected || document.hidden) return;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            // Autoplay can be restricted by browser settings; retain poster.
          });
        }
      }
      video.addEventListener("canplay", startPlayback);
      document.addEventListener("visibilitychange", startPlayback);
      window.addEventListener("pageshow", startPlayback);
      video.addEventListener("error", function () {
        document.removeEventListener("visibilitychange", startPlayback);
        window.removeEventListener("pageshow", startPlayback);
      }, { once: true });
      startPlayback();
      return;
    }
    var img = document.createElement("img");
    img.src = image.type === "video" ? (image.poster || image.src) : image.src;
    img.alt = options.decorative ? "" : (options.alt || image.alt || "");
    if (image.width) img.width = image.width;
    if (image.height) img.height = image.height;
    img.decoding = "async";
    img.style.objectPosition = el.dataset.focal || image.focal || "center center";
    if (image.priority === "high" || options.eager) {
      img.loading = "eager";
      img.setAttribute("fetchpriority", "high");
    } else {
      img.loading = "lazy";
    }
    img.addEventListener("error", function () {
      img.remove();
      el.classList.add("is-fallback");
      el.dataset.mounted = "false";
    });
    el.prepend(img);
    el.dataset.mounted = "true";
  }

  function imageFor(id) {
    return window.S2D && window.S2D.image ? window.S2D.image(id) : null;
  }

  document.querySelectorAll("[data-image-id]").forEach(function (el) {
    var image = imageFor(el.dataset.imageId);
    if (!image) {
      el.classList.add("is-fallback");
      return;
    }
    mountImage(el, image, {
      eager: el.hasAttribute("data-eager"),
      decorative: el.hasAttribute("data-decorative")
    });
  });

  /* ---------- Projects page: featured project + numbered cards ---------- */

  function placeLabel(location) {
    return String(location || "Lebanon").split(",").map(function (part) {
      return part.trim();
    }).join(" · ");
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function coverMedia(project, className) {
    var media = document.createElement("div");
    media.className = className;
    var image = imageFor(project.coverId);
    if (image) mountImage(media, image, { still: true });
    else media.classList.add("is-fallback");
    return media;
  }

  var projectsRoot = document.querySelector("[data-projects]");
  var projects = window.S2D_PROJECTS || [];
  if (projectsRoot && projects.length) {
    projectsRoot.replaceChildren();
    projects.forEach(function (project, index) {
      var href = "/project.html?project=" + encodeURIComponent(project.slug);
      if (index === 0) {
        var featured = document.createElement("article");
        featured.className = "featured reveal";
        var mediaLink = document.createElement("a");
        mediaLink.className = "media";
        mediaLink.href = href;
        mediaLink.setAttribute("aria-label", "View " + project.title);
        mediaLink.appendChild(coverMedia(project, "media-cover"));
        var copy = document.createElement("div");
        copy.className = "featured-copy";
        copy.innerHTML =
          '<span class="num"></span><h2></h2><p class="where caps"></p>' +
          '<a class="link-arrow">View project <span aria-hidden="true">→</span></a>';
        copy.querySelector(".num").textContent = pad(index + 1);
        copy.querySelector("h2").textContent = project.title;
        copy.querySelector(".where").textContent = placeLabel(project.location);
        copy.querySelector(".link-arrow").href = href;
        featured.appendChild(mediaLink);
        featured.appendChild(copy);
        projectsRoot.appendChild(featured);
        var grid = document.createElement("div");
        grid.className = "card-grid";
        projectsRoot.appendChild(grid);
        return;
      }
      var card = document.createElement("a");
      card.className = "card shade-bottom reveal";
      card.href = href;
      card.appendChild(coverMedia(project, "media media-cover"));
      var cardCopy = document.createElement("div");
      cardCopy.className = "card-copy";
      cardCopy.innerHTML = '<span class="num"></span><h3></h3><p class="where caps"></p>';
      cardCopy.querySelector(".num").textContent = pad(index + 1);
      cardCopy.querySelector("h3").textContent = project.title;
      cardCopy.querySelector(".where").textContent = placeLabel(project.location);
      card.appendChild(cardCopy);
      projectsRoot.querySelector(".card-grid").appendChild(card);
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function watchReveals(root) {
    var items = (root || document).querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }
  watchReveals();

  /* ---------- Floating WhatsApp button: hidden over heroes, forms and footer ---------- */

  var blocking = new Set();
  var fabObserver = null;

  function syncFab() {
    if (!fab) return;
    var hide = blocking.size > 0 || document.body.classList.contains("menu-open");
    fab.classList.toggle("is-hidden", hide);
    if (hide) {
      fab.setAttribute("aria-hidden", "true");
      fab.tabIndex = -1;
    } else {
      fab.removeAttribute("aria-hidden");
      fab.removeAttribute("tabindex");
    }
  }

  if (fab && "IntersectionObserver" in window) {
    fabObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) blocking.add(entry.target);
        else blocking.delete(entry.target);
      });
      syncFab();
    }, { threshold: [0, 0.12, 0.2] });
    document.querySelectorAll(".hero, .talk, .form, .site-footer").forEach(function (el) {
      fabObserver.observe(el);
    });
  }

  /* ---------- Enquiry form: opens WhatsApp with the details filled in ---------- */

  var enquiryForm = document.getElementById("enquiryForm");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (enquiryForm.reportValidity && !enquiryForm.reportValidity()) return;
      var value = function (name) {
        var field = enquiryForm.elements[name];
        return field ? String(field.value || "").trim() : "";
      };
      var lines = ["Hello S2D Contracting, I would like to discuss a project.", ""];
      [
        ["Name", "name"],
        ["Phone", "phone"],
        ["Email", "email"],
        ["Project type", "project-type"],
        ["Location", "location"],
        ["Details", "message"]
      ].forEach(function (row) {
        var text = value(row[1]);
        if (text) lines.push(row[0] + ": " + text);
      });
      var number = enquiryForm.getAttribute("data-whatsapp");
      var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }
      var note = document.getElementById("enquiryNote");
      if (note) note.textContent = "WhatsApp opened with your enquiry. Press send there to reach our team.";
    });
  }

  window.S2D = window.S2D || {};
  window.S2D.mountImage = mountImage;
  window.S2D.watchReveals = watchReveals;
  window.S2D.placeLabel = placeLabel;
  window.S2D.watchFabBlocker = function (el) {
    if (el && fabObserver) fabObserver.observe(el);
  };
})();
