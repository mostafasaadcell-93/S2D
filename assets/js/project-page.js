(function () {
  var main = document.getElementById("projectMain");
  if (!main) return;

  var params = new URLSearchParams(location.search);
  var slug = params.get("project");
  var projects = window.S2D_PROJECTS || [];
  var project = projects.find(function (item) {
    return item.slug === slug;
  });

  function imageFor(id) {
    return window.S2D && window.S2D.image ? window.S2D.image(id) : null;
  }

  function leaveProject(event) {
    event.preventDefault();
    if (history.length > 1) {
      history.back();
      return;
    }
    location.href = "/#work";
  }

  function makeBackButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "project-back";
    button.setAttribute("aria-label", "Back");
    var mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "←";
    button.appendChild(mark);
    button.appendChild(document.createTextNode("Back"));
    button.addEventListener("click", leaveProject);
    return button;
  }

  if (!project) {
    document.title = "Project | S2D Contracting";
    main.replaceChildren();
    var missing = document.createElement("section");
    missing.className = "project-missing";
    var heading = document.createElement("h1");
    heading.textContent = "Project not found";
    var paragraph = document.createElement("p");
    var back = document.createElement("a");
    back.href = "/#work";
    back.textContent = "Return to projects";
    paragraph.appendChild(back);
    missing.appendChild(makeBackButton());
    missing.appendChild(heading);
    missing.appendChild(paragraph);
    main.appendChild(missing);
    return;
  }

  document.title = project.title + " | S2D Contracting";
  var galleryIds = project.galleryIds || [];
  var heroImage = imageFor(galleryIds[0] || project.coverId);

  main.replaceChildren();

  var hero = document.createElement("section");
  hero.className = "project-hero";
  var heroMedia = document.createElement("div");
  heroMedia.className = "media media-cover";
  if (heroImage && window.S2D.mountImage) {
    window.S2D.mountImage(heroMedia, heroImage, { alt: heroImage.alt, lazy: false, still: true });
    var heroImg = heroMedia.querySelector("img");
    if (heroImg) heroImg.setAttribute("fetchpriority", "high");
  } else {
    heroMedia.classList.add("is-fallback");
  }
  var shade = document.createElement("div");
  shade.className = "hero-shade";
  shade.setAttribute("aria-hidden", "true");
  var heroCopy = document.createElement("div");
  heroCopy.className = "shell project-hero-copy";
  var kicker = document.createElement("p");
  kicker.className = "kicker on-dark";
  kicker.textContent = project.category;
  var title = document.createElement("h1");
  title.textContent = project.title;
  var galleryLink = document.createElement("a");
  galleryLink.href = "#gallery";
  galleryLink.textContent = "View gallery ↓";
  heroCopy.appendChild(kicker);
  heroCopy.appendChild(title);
  heroCopy.appendChild(galleryLink);
  hero.appendChild(heroMedia);
  hero.appendChild(shade);
  hero.appendChild(makeBackButton());
  hero.appendChild(heroCopy);

  var intro = document.createElement("section");
  intro.className = "section project-intro";
  var introShell = document.createElement("div");
  introShell.className = "shell project-intro-grid";
  var introHeading = document.createElement("div");
  var introKicker = document.createElement("p");
  introKicker.className = "kicker";
  introKicker.textContent = "Project Overview";
  var introTitle = document.createElement("h2");
  introTitle.textContent = project.title;
  introHeading.appendChild(introKicker);
  introHeading.appendChild(introTitle);
  var introCopy = document.createElement("div");
  introCopy.className = "copy";
  var description = document.createElement("p");
  description.textContent = project.description;
  var meta = document.createElement("dl");
  meta.className = "project-meta";
  function addMeta(label, value) {
    var row = document.createElement("div");
    var dt = document.createElement("dt");
    dt.textContent = label;
    var dd = document.createElement("dd");
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    meta.appendChild(row);
  }
  addMeta("Scope", project.scope || "Turnkey project");
  addMeta("Location", project.location || "Lebanon");
  var photoCount = 0;
  var videoCount = 0;
  galleryIds.forEach(function (id) {
    var item = imageFor(id);
    if (!item) return;
    if (item.type === "video") videoCount += 1;
    else photoCount += 1;
  });
  function countLabel(count, singular, plural) {
    return count + " " + (count === 1 ? singular : plural);
  }
  var mediaParts = [];
  if (photoCount) mediaParts.push(countLabel(photoCount, "photo", "photos"));
  if (videoCount) mediaParts.push(countLabel(videoCount, "video", "videos"));
  if (mediaParts.length) addMeta("Media", mediaParts.join(" · "));
  introCopy.appendChild(description);
  introCopy.appendChild(meta);
  introShell.appendChild(introHeading);
  introShell.appendChild(introCopy);
  intro.appendChild(introShell);

  var gallerySection = document.createElement("section");
  gallerySection.className = "section project-gallery-page";
  gallerySection.id = "gallery";
  var galleryShell = document.createElement("div");
  galleryShell.className = "shell";
  var grid = document.createElement("div");
  grid.className = "project-grid";
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
      video.setAttribute("controls", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
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

  galleryIds.forEach(function (id, index) {
    var image = imageFor(id);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "project-image";
    if (image) button.style.aspectRatio = image.ratio;
    if (image) {
      var alt = image.alt;
      var caption = project.title + " — " + (image.tag || "");
      var isVideo = image.type === "video";
      button.setAttribute("aria-label", isVideo ? "Play video: " + alt : alt);
      var img = document.createElement("img");
      img.src = isVideo ? (image.poster || image.src) : image.src;
      img.alt = alt;
      img.width = image.width;
      img.height = image.height;
      img.decoding = "async";
      img.style.objectPosition = image.focal || "center center";
      img.loading = index < 2 ? "eager" : "lazy";
      if (index === 0) img.setAttribute("fetchpriority", "high");
      img.addEventListener("error", function () {
        img.remove();
        button.classList.add("is-fallback");
      });
      button.appendChild(img);
      if (isVideo) {
        var play = document.createElement("span");
        play.className = "play-badge";
        play.setAttribute("aria-hidden", "true");
        button.appendChild(play);
      }
      if (image.tag) {
        var tag = document.createElement("span");
        tag.className = "media-tag";
        tag.textContent = image.tag;
        button.appendChild(tag);
      }
      button.addEventListener("click", function () {
        openLightbox(image, caption);
      });
    } else {
      button.classList.add("is-fallback");
    }
    tiles.push({ el: button, ratio: image ? image.height / image.width : 1 });
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
      var col = document.createElement("div");
      col.className = "project-grid-col";
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

  var next = document.createElement("section");
  next.className = "project-next";
  var nextShell = document.createElement("div");
  nextShell.className = "shell";
  var nextKicker = document.createElement("p");
  nextKicker.textContent = "Planning a similar project?";
  var nextTitle = document.createElement("h2");
  nextTitle.textContent = "Let’s create it together.";
  var nextLink = document.createElement("a");
  nextLink.className = "button button-gold";
  nextLink.href = "/#contact";
  nextLink.textContent = "Start your project";
  nextShell.appendChild(nextKicker);
  nextShell.appendChild(nextTitle);
  nextShell.appendChild(nextLink);
  next.appendChild(nextShell);

  main.appendChild(hero);
  main.appendChild(intro);
  main.appendChild(gallerySection);
  main.appendChild(next);
  if (window.S2D && window.S2D.watchFabBlocker) window.S2D.watchFabBlocker(next);

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
