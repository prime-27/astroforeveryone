"""Screenshot every tool for its card on /sky-tools, /simulations, /scientific-tools and /games.

    cd web && npm run build && npx vite preview --port 4173 &
    python scripts/previews.py            # all tools
    python scripts/previews.py solar-system planisphere

Needs: pip install playwright pillow && playwright install chromium
Writes web/public/tools/previews/<slug>.webp (640x400).
"""
import io
import re
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web/public/tools/previews"
SITE = "http://localhost:4173"

# read slug, file and component straight from the catalogue so the two never drift apart
src = (ROOT / "web/src/tools/catalogue.js").read_text(encoding="utf-8")
sections = re.findall(r"^  '?([a-z-]+)'?: \{\n    title:(.*?)\n  \},", src, re.S | re.M)
TOOLS = [(sec, m[0], m[1], bool(m[2])) for sec, body in sections
         for m in re.findall(r"slug: '([^']+)', file: '([^']+)',( component: '[^']+',)?", body)]


def main(only):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        for section, slug, file, react in TOOLS:
            if only and slug not in only:
                continue
            if react:  # rebuilt tools: shoot the stage on their own page
                page.goto(f"{SITE}/{section}/{slug}", wait_until="networkidle")
                page.wait_for_timeout(3000)
                shot = page.locator(".tool-stage").screenshot()
            else:
                page.goto(f"{SITE}/tools/{file}", wait_until="networkidle")
                page.wait_for_timeout(3000)
                shot = page.screenshot()
            img = Image.open(io.BytesIO(shot)).convert("RGB")
            w, h = img.size  # crop to 16:10 from the top, then scale
            ch = min(h, round(w * 10 / 16))
            img = img.crop((0, 0, round(ch * 16 / 10), ch)).resize((640, 400), Image.LANCZOS)
            img.save(OUT / f"{slug}.webp", quality=80)
            print(f"{section}/{slug}")
        browser.close()


if __name__ == "__main__":
    main(set(sys.argv[1:]))
