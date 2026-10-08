# S2D Contracting

Interior design and turnkey contracting site for S2D Contracting in Beirut. Static HTML, CSS, and JavaScript, live at https://s2dcontracting.com.

Pages: `index.html` (Home), `about.html`, `projects.html`, `services.html`, `contact.html`, and `project.html?project=<slug>` for each project. The design follows the client's October 2026 mockups: navy-black backgrounds, champagne gold accents, Cormorant Garamond headings and Montserrat text. The enquiry form on `contact.html` (`#enquiryForm`) opens WhatsApp with the visitor's details filled in, addressed to the number in its `data-whatsapp` attribute (`96171557725`). Nothing is stored on a server; the message is sent when the visitor presses send in WhatsApp. The handler is at the end of `assets/js/site.js`.

## Run locally

```bash
python3 -m http.server 43127 --bind 0.0.0.0
```

Open `http://127.0.0.1:43127`.

The form works the same locally and on any host.

## Media

Project photos and videos live in `assets/media/<project-slug>/` (`NN.webp`, or `NN.mp4` with `NN-poster.webp`). The homepage hero is `assets/media/hero.mp4` with `hero-poster.webp`.

Register each file in `assets/js/images.js` (`type`, `src`, `poster` for video, `alt`, `width`, `height`, `ratio`, `focal`, `tag`). Point a project at those ids from `assets/js/projects-data.js`. Details: [docs/replacing-images.md](docs/replacing-images.md).

The header and footer mark is `assets/images/logo.png`, a raster with the black background removed. It is not an SVG.
