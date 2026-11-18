"""Download every image the site uses into ./image_cache (kept between builds), and write image_cache/map.json
mapping the builder's image key -> local file. build_site.py then serves images from site/images/.
Google Sites image links in the mirror are expired (403), so fresh links are read from the live pages and
paired with the mirrored ones by their order on the page.
Run: python fetch_images.py   (already-downloaded images are skipped)"""
import html, json, re, sys, urllib.request
from pathlib import Path

import build_site as b

sys.stdout.reconfigure(encoding="utf-8")
CACHE = b.ROOT / "image_cache"
MAP = CACHE / "map.json"
# only real <img src> tags: the builder uses nothing else, and script data holds escaped variants that 403
GOOGLE = re.compile(r"<img[^>]*?\ssrc=\"(https://lh\d-us\.googleusercontent\.com/sitesv-images[^\"]+)\"")
WSIMG = re.compile(r"(?:https?:)?//img1\.wsimg\.com/isteam/ip/[^\"'\\)<>]+?(?=/:/|[\"'\\)<>])")  # names may contain spaces
EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read(), r.headers.get_content_type()


def unique(urls):
    out = []
    for u in urls:
        if u not in out:
            out.append(u)
    return out


def key_of(raw):
    src = b.img_url({"src": html.unescape(raw)})
    return src and src.split("/:/")[0]


def jobs():
    """Yield (builder key, download url, file stem)."""
    r_pages = {s for _, srcs in b.PAGES.values() for site, s in srcs if site == "R"}
    for name in sorted(r_pages):
        old = unique(html.unescape(u) for u in GOOGLE.findall((b.R / f"{name}.html").read_text(encoding="utf-8")))
        if not old:
            continue
        live_html = get(f"https://www.ravirajabuddhaya.com/{'' if name == 'index' else name}")[0].decode("utf-8")
        new = unique(html.unescape(u) for u in GOOGLE.findall(live_html))
        if len(old) != len(new):  # page changed since the mirror; pairing by position would mislabel images
            print(f"SKIP {name}: mirror has {len(old)} images, live page has {len(new)}")
            continue
        for i, (o, n) in enumerate(zip(old, new), 1):
            yield key_of(o), n, f"{name}-{i}"
    seen = set()
    for f in [*b.A.glob("*.html"), b.A / "articles/f.json"]:
        for raw in WSIMG.findall(f.read_text(encoding="utf-8").replace("\\/", "/")):
            k = key_of(raw)
            if k and k not in seen and "logo" not in k.lower():
                seen.add(k)
                stem = re.sub(r"[^\w-]+", "-", Path(k.split("/")[-1].replace("%20", " ")).stem).strip("-")[:60]
                yield k, k + "/:/rs=w:1600", f"astro-{stem or len(seen)}"


def main():
    CACHE.mkdir(exist_ok=True)
    m = json.loads(MAP.read_text(encoding="utf-8")) if MAP.exists() else {}
    ok = fail = 0
    for key, url, stem in jobs():
        if key in m and (CACHE / m[key]).exists():
            continue
        try:
            data, ctype = get(url)
        except Exception as e:  # keep going; a failed image just stays remote / missing
            print(f"FAIL {stem}: {e}")
            fail += 1
            continue
        name = stem + EXT.get(ctype, ".img")
        (CACHE / name).write_bytes(data)
        m[key] = name
        ok += 1
        MAP.write_text(json.dumps(m, indent=1), encoding="utf-8")  # save as we go so a rerun resumes
    print(f"downloaded {ok}, failed {fail}, cached total {len(m)}")


if __name__ == "__main__":
    main()
