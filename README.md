# ASTRO – Astronomy for Everyone

Website of ASTRO, The Astronomical Society for Training, Research and Outreach (Hyderabad).
It merges astroforeveryone.com and ravirajabuddhaya.com into one React site with 21 pages and 34 interactive astronomy tools.

## Run it

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in web/dist
```

## What's inside

| Path | What |
|---|---|
| `web/src/engine/particles.js` | Particle engine: the layered, twinkling, parallax starfield with shooting stars behind every page (2D canvas). |
| `web/src/engine/universe.js` | Universe engine: the three.js spiral galaxy in the home page hero. Loaded only on the home page. |
| `web/src/components`, `web/src/pages` | React components (JSX): header, footer, home page, content pages. |
| `web/public/content/*.json` | The text of each page, generated from the old sites. |
| `web/public/tools/*.html` | The interactive tools (planisphere, simulations, games, quizzes…), each a self-contained page shown in a frame. |
| `web/public/images`, `web/public/logo.webp` | Photos and the ASTRO logo. |
| `build_site.py`, `fetch_images.py` | The importer that generated the content above from local HTTrack copies of the old sites (not in this repo). |
| `brand/` | The ASTRO logo, exactly as supplied. |

Both engines pause when the tab is hidden and show a still frame for visitors who prefer reduced motion.

## Deploy

`npm run build` and upload the contents of `web/dist` to the web root. `web/public/.htaccess` sends routes like `/events` to the app on Apache hosting (Hostinger).

Brand: colours, type and logo rules are in the ASTRO Brand Kit. Headlines use Lexend Exa, text uses Open Sans, both from the logo.
