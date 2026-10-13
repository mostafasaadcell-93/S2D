(function () {
  var main = document.querySelector("[data-project-main]");
  if (!main) return;

  var params = new URLSearchParams(location.search);
  var slug = params.get("project");
  var projects = window.S2D_PROJECTS || [];
  var index = projects.findIndex(function (item) {
    return item.slug === slug;
  });
  var project = projects[index];

  function imageFor(id) {
    return window.S2D && window.S2D.image ? window.S2D.image(id) : null;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function arrowLink(className, href, text) {
    var a = el("a", className);
    a.href = href;
    a.appendChild(document.createTextNode(text + " "));
    var arrow = el("span", "arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    a.appendChild(arrow);
    return a;
  }

  main.replaceChildren();

  if (!project) {
    document.title = "Project not found | S2D Contracting";
    var missing = el("section", "not-found");
    missing.appendChild(el("h1", "h-lg", "Project not found"));
    missing.appendChild(arrowLink("link-arrow", "/projects.html", "View all projects"));
    main.appendChild(missing);
    return;
  }

  document.title = project.title + " | S2D Contracting";
  var galleryIds = project.galleryIds || [];
  var place = window.S2D && window.S2D.placeLabel ? window.S2D.placeLabel(project.location) : project.location;

  /* ---------- Hero ---------- */

  var hero = el("section", "hero project-hero");
  var heroMedia = el("div", "media media-cover shade-left");
  var heroImage = imageFor(galleryIds[0] || project.coverId);
  if (heroImage && window.S2D.mountImage) {
    window.S2D.mountImage(heroMedia, heroImage, { still: true, eager: true, decorative: true });
  }
  if (project.heroFit === "panel") hero.classList.add("is-portrait");
  var heroInner = el("div", "shell hero-inner");
  var back = el("a", "back-link");
  back.href = "/projects.html";
  back.innerHTML = '<span aria-hidden="true">←</span> All projects';
  var kicker = el("p", "label", (index < 9 ? "0" : "") + (index + 1) + " · " + project.category);
  var title = el("h1", "h-xl", project.title);
  var where = el("p", "caps", place);
  where.style.color = "var(--text)";
  where.style.marginBottom = "2rem";
  heroInner.appendChild(back);
  heroInner.appendChild(kicker);
  heroInner.appendChild(title);
  heroInner.appendChild(where);
  heroInner.appendChild(arrowLink("link-arrow", "#gallery", "View gallery"));
  hero.appendChild(heroMedia);
  hero.appendChild(heroInner);

  /* ---------- Overview ---------- */

  var intro = el("section", "section reach");
  var introShell = el("div", "shell overview");
  var introHead = el("div");
  introHead.appendChild(el("p", "label", "Project overview"));
  introHead.appendChild(el("h2", "h-lg", project.title));
  var introCopy = el("div");
  var description = el("p", "copy", project.description);
  description.style.color = "var(--text)";
  introCopy.appendChild(description);
  var meta = el("dl", "meta");
  function addMeta(label, value) {
    var row = el("div");
    row.appendChild(el("dt", "", label));
    row.appendChild(el("dd", "", value));
    meta.appendChild(row);
  }
  addMeta("Scope", project.scope || "Turnkey project");
  addMeta("Location", project.location || "Lebanon");
  var photos = 0;
  var videos = 0;
  galleryIds.forEach(function (id) {
    var item = imageFor(id);
    if (!item) return;
    if (item.type === "video") videos += 1;
    else photos += 1;
  });
  var parts = [];
  if (photos) parts.push(photos + (photos === 1 ? " photo" : " photos"));
  if (videos) parts.push(videos + (videos === 1 ? " video" : " videos"));
  if (parts.length) addMeta("Media", parts.join(" · "));
  introCopy.appendChild(meta);
  introShell.appendChild(introHead);
  introShell.appendChild(introCopy);
  intro.appendChild(introShell);

  /* ---------- Gallery: masonry in reading order ---------- */

  var gallerySection = el("section", "section");
  gallerySection.id = "gallery";
  var galleryShell = el("div", "shell");
  var grid = el("div", "project-grid");
  var tiles = [];

  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var lightboxText = lightbox ? lightbox.querySelector("p") : null;
  var lastFocus = null;

  function clearLightboxVideo() {
    if (!lightbox) return;
    var video = lightbox.querySelector("video");
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  }

  function closeLightbox() {
    if (!lightbox) return;
    clearLightboxVideo();
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock");
    if (lightboxImg) {
      lightboxImg.hidden = false;
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    }
    if (lastFocus) lastFocus.focus();
  }

  function openLightbox(entry, caption) {
    if (!lightbox || !lightboxImg || !entry) return;
    lastFocus = document.activeElement;
    clearLightboxVideo();
    if (entry.type === "video") {
      lightboxImg.hidden = true;
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      var video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.src = entry.src;
      video.poster = entry.poster || "";
      ["controls", "autoplay", "playsinline"].forEach(function (attr) {
        video.setAttribute(attr, "");
      });
      lightboxImg.insertAdjacentElement("afterend", video);
    } else {
      lightboxImg.hidden = false;
      lightboxImg.src = entry.src;
      lightboxImg.alt = entry.alt || "";
    }
    if (lightboxText) lightboxText.textContent = caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
    var closeButton = lightbox.querySelector(".lightbox-close");
    if (closeButton) closeButton.focus();
  }

  galleryIds.forEach(function (id, i) {
    var image = imageFor(id);
    var button = el("button", "project-image");
    button.type = "button";
    if (!image) {
      button.classList.add("is-fallback");
      tiles.push({ el: button, ratio: 1 });
      return;
    }
    var isVideo = image.type === "video";
    button.style.aspectRatio = image.ratio;
    button.setAttribute("aria-label", isVideo ? "Play video: " + image.alt : image.alt);
    var img = document.createElement("img");
    img.src = isVideo ? (image.poster || image.src) : image.src;
    img.alt = image.alt;
    img.width = image.width;
    img.height = image.height;
    img.decoding = "async";
    img.loading = i < 3 ? "eager" : "lazy";
    img.style.objectPosition = image.focal || "center center";
    img.addEventListener("error", function () {
      img.remove();
      button.classList.add("is-fallback");
    });
    button.appendChild(img);
    if (isVideo) {
      var play = el("span", "play-badge");
      play.setAttribute("aria-hidden", "true");
      button.appendChild(play);
    }
    if (image.tag) button.appendChild(el("span", "media-tag", image.tag));
    button.addEventListener("click", function () {
      openLightbox(image, project.title + " — " + (image.tag || ""));
    });
    tiles.push({ el: button, ratio: image.height / image.width });
  });

  function layoutGrid() {
    var count = window.matchMedia("(min-width: 1100px)").matches ? 3 : window.matchMedia("(min-width: 720px)").matches ? 2 : 1;
    grid.style.setProperty("--cols", String(count));
    count = Math.max(1, Math.min(count, tiles.length));
    if (grid.dataset.cols === String(count)) return;
    grid.dataset.cols = String(count);
    grid.replaceChildren();
    var cols = [];
    var heights = [];
    for (var c = 0; c < count; c++) {
      var col = el("div", "project-grid-col");
      grid.appendChild(col);
      cols.push(col);
      heights.push(0);
    }
    tiles.forEach(function (tile) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      cols[shortest].appendChild(tile.el);
      heights[shortest] += tile.ratio;
    });
  }
  layoutGrid();
  window.addEventListener("resize", layoutGrid);
  galleryShell.appendChild(grid);
  gallerySection.appendChild(galleryShell);

  /* ---------- Next project + CTA ---------- */

  var nextProject = projects[(index + 1) % projects.length];
  var cta = el("section", "cta");
  var ctaMedia = el("div", "media media-cover shade-full");
  var ctaImage = imageFor(nextProject.coverId);
  if (ctaImage) window.S2D.mountImage(ctaMedia, ctaImage, { still: true, decorative: true });
  var ctaInner = el("div", "shell cta-inner");
  var ctaCopy = el("div");
  ctaCopy.appendChild(el("p", "label", "Next project"));
  var nextTitle = el("h2", "h-lg");
  var nextLink = el("a", "", nextProject.title);
  nextLink.href = "/project.html?project=" + encodeURIComponent(nextProject.slug);
  nextTitle.appendChild(nextLink);
  ctaCopy.appendChild(nextTitle);
  ctaInner.appendChild(ctaCopy);
  ctaInner.appendChild(arrowLink("btn btn-outline", "/contact.html#enquiry", "Start your project"));
  cta.appendChild(ctaMedia);
  cta.appendChild(ctaInner);

  main.appendChild(hero);
  main.appendChild(intro);
  main.appendChild(gallerySection);
  main.appendChild(cta);
  if (window.S2D.watchFabBlocker) window.S2D.watchFabBlocker(hero);

  if (lightbox) {
    var closeButton = lightbox.querySelector(".lightbox-close");
    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }
})();
