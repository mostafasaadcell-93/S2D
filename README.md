# S2D Contracting

Interior design and turnkey contracting site for S2D Contracting in Beirut. Static HTML, CSS, and JavaScript. The enquiry form is a [Netlify Form](https://docs.netlify.com/forms/setup/) (`project-enquiry`) and records submissions only when this site is hosted on Netlify.

## Run locally

```bash
python3 -m http.server 43127 --bind 0.0.0.0
```

Open `http://127.0.0.1:43127`.

A local static server does not store form submissions. Posting the form here fails instead of showing a success message. `thank-you.html` is the page Netlify serves after a real submission.

## Media

Project photos and videos live in `assets/media/<project-slug>/` (`NN.webp`, or `NN.mp4` with `NN-poster.webp`). The homepage hero is `assets/media/hero.mp4` with `hero-poster.webp`.

Register each file in `assets/js/images.js` (`type`, `src`, `poster` for video, `alt`, `width`, `height`, `ratio`, `focal`, `tag`). Point a project at those ids from `assets/js/projects-data.js`. Details: [docs/replacing-images.md](docs/replacing-images.md).

The header and footer mark is `assets/images/logo.png`, a raster with the black background removed. It is not an SVG.
