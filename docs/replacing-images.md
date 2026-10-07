# Replacing photography and video

Every hero, project card, statement image, and gallery tile is registered in one file:

`assets/js/images.js`

Do not hard-code media paths in HTML or CSS. `window.S2D.image(id)` returns an entry. `window.S2D.media` is the same function.

Project order and which ids appear on a page live in `assets/js/projects-data.js` (`coverId` and `galleryIds`).

## Entry fields

| Field | Role |
| --- | --- |
| `type` | `"image"` or `"video"` |
| `src` | `.webp` for a photo, `.mp4` for a video |
| `poster` | Videos only. Still frame used before playback, on project cards, and as the project-page hero |
| `alt` | Accessible name |
| `width`, `height` | Pixel size of the file |
| `ratio` | Natural frame, as a CSS `aspect-ratio` value such as `16 / 9` or `4 / 5` |
| `focal` | CSS `object-position` when a frame crops the file, such as `center center` |
| `tag` | Small label on a gallery tile and in the lightbox caption |

## Where files go

Put each project’s files in `assets/media/<project-slug>/`.

- Photos: `01.webp`, `02.webp`, and so on
- Videos: `02.mp4` with a still named `02-poster.webp` beside it

The homepage hero is separate: `assets/media/hero.mp4` and `assets/media/hero-poster.webp`, registered as the `hero` id. The statement banner is the `statement` id.

The logo is not part of this library. It stays at `assets/images/logo.png`.

## Add a video

1. Export the `.mp4` and a `-poster.webp` into the project folder.
2. Add an entry in `assets/js/images.js` with `type: "video"`, `src`, `poster`, `alt`, `width`, `height`, `ratio`, `focal`, and `tag`.
3. Add that id to the project’s `galleryIds` in `assets/js/projects-data.js`. Use it as `coverId` only when the poster should be the homepage card.

On the homepage the hero video autoplays muted and loops. With reduced motion, or if the file fails, the poster is shown instead. Project pages never autoplay: a video tile shows the poster and a play control, and the video plays in the lightbox.
