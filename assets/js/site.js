(function () {
  var menu = document.querySelector(".menu");
  var nav = document.querySelector(".navlinks");
  var year = document.getElementById("year");
  var fab = document.querySelector(".contact-fab");

  if (year) year.textContent = String(new Date().getFullYear());

  var pageMain = document.querySelector("main");
  var pageFooter = document.querySelector(".footer");

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

  if (window.matchMedia) {
    var desktopNav = window.matchMedia("(min-width: 960px)");
    var closeOnDesktop = function () {
      if (desktopNav.matches) setMenu(false);
    };
    if (desktopNav.addEventListener) desktopNav.addEventListener("change", closeOnDesktop);
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

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navlinks a[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function mountImage(el, image, options) {
    if (!el || !image || el.dataset.mounted === "true") return;
    var still = options && options.still;
    var playVideo = image.type === "video" && !still && !prefersReducedMotion();
    if (playVideo) {
      var video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.poster = image.poster || "";
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "auto");
      video.setAttribute("aria-hidden", "true");
      video.style.objectPosition = image.focal || "center center";
      var source = document.createElement("source");
      source.src = image.src;
      source.type = "video/mp4";
      video.appendChild(source);
      var fellBack = false;
      function usePoster() {
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
          ratio: image.ratio,
          focal: image.focal,
          priority: image.priority
        }, options);
      }
      video.addEventListener("error", usePoster);
      source.addEventListener("error", usePoster);
      el.prepend(video);
      el.dataset.mounted = "true";
      return;
    }
    var img = document.createElement("img");
    img.src = image.type === "video" ? (image.poster || image.src) : image.src;
    img.alt = options && options.alt ? options.alt : image.alt;
    img.width = image.width;
    img.height = image.height;
    img.decoding = "async";
    img.style.objectPosition = image.focal || "center center";
    if (image.priority === "high" || (options && options.lazy === false)) {
      img.setAttribute("fetchpriority", "high");
      img.loading = "eager";
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
    if ((!options || options.ratio !== false) && image.ratio && !el.classList.contains("media-cover") && !el.classList.contains("statement")) {
      el.style.aspectRatio = image.ratio;
    }
  }

  document.querySelectorAll("[data-image-id]").forEach(function (el) {
    var image = window.S2D && window.S2D.image(el.dataset.imageId);
    if (!image) {
      el.classList.add("is-fallback");
      return;
    }
    mountImage(el, image);
  });

  var gallery = document.getElementById("projectGallery");
  var projects = window.S2D_PROJECTS || [];
  if (gallery && projects.length && window.S2D) {
    var fallback = gallery.querySelector(".project-fallback");
    projects.forEach(function (project, index) {
      var image = window.S2D.image(project.coverId);
      var wide = typeof project.wide === "boolean" ? project.wide : index % 3 === 0;
      var link = document.createElement("a");
      link.className = "project" + (wide ? " wide" : "");
      link.href = "/project.html?project=" + encodeURIComponent(project.slug);
      link.setAttribute("aria-label", "View " + project.title);
      if (image) {
        var img = document.createElement("img");
        img.src = image.type === "video" ? (image.poster || image.src) : image.src;
        img.alt = image.alt;
        img.width = image.width;
        img.height = image.height;
        img.loading = "lazy";
        img.decoding = "async";
        img.style.objectPosition = image.focal || "center center";
        img.addEventListener("error", function () {
          img.remove();
          link.classList.add("is-fallback");
        });
        link.appendChild(img);
      } else {
        link.classList.add("is-fallback");
      }
      var label = document.createElement("span");
      label.className = "project-label";
      var category = document.createElement("small");
      category.textContent = project.category;
      var title = document.createElement("span");
      title.className = "project-title";
      title.textContent = project.title;
      var view = document.createElement("em");
      view.textContent = "View project →";
      label.appendChild(category);
      label.appendChild(title);
      label.appendChild(view);
      link.appendChild(label);
      gallery.appendChild(link);
    });
    if (fallback) fallback.hidden = true;
  }

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
    fabObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) blocking.add(entry.target);
          else blocking.delete(entry.target);
        });
        syncFab();
      },
      { threshold: [0, 0.12, 0.2] }
    );
    document.querySelectorAll(".hero, .form, .footer").forEach(function (el) {
      fabObserver.observe(el);
    });
  }

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
  window.S2D.watchFabBlocker = function (el) {
    if (el && fabObserver) fabObserver.observe(el);
  };
})();
