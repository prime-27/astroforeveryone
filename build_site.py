"""Merge the two HTTrack mirrors (astroforeveryone.com + ravirajabuddhaya.com) into one static site in ./site.
Run: python build_site.py   (re-running overwrites ./site)"""
import html, json, re, shutil, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).parent
A = ROOT / "My Web Sites2/astro/astroforeveryone.com"      # GoDaddy site
R = ROOT / "My Web Sites/raviraja/www.ravirajabuddhaya.com"  # Google Sites site
OUT = ROOT / "site"

# out page -> (title, [(site, source basename), ...]); several sources are concatenated
PAGES = {
    "index":            ("Home", [("A", "index")]),
    "about":            ("About Us", [("A", "about-us")]),
    "ravi":             ("Dr Ravi Raja Pothineni", [("R", "index")]),
    "research":         ("Research", [("R", "about-my-research-work"), ("A", "research")]),
    "careers":          ("Career Paths", [("A", "career-path")]),
    "programs":         ("Programs", [("A", "programs")]),
    "activities":       ("Activities & Outreach", [("A", "our-activities"), ("R", "outreach-education")]),
    "events":           ("Events", [("A", "global-and-local-events"), ("A", "global-astronomy-month")]),
    "talks":            ("ASTRO Talks", [("A", "astro-talks")]),
    "articles":         ("Articles", [("R", "my-articles")]),
    "astronomy-for-everyone": ("Astronomy for Everyone", [("R", "astronomy-for-everyone")]),
    "telescopes":       ("Telescopes & Instruments", [("A", "instruments"), ("R", "telescopes-for-astronomy")]),
    "gallery":          ("Gallery", [("A", "gallery"), ("R", "my-art")]),
    "sky-tools":        ("Sky Tools", [("R", "astronomy-sky-tools")]),
    "scientific-tools": ("Scientific Tools", [("R", "astronomy-scientific-tools")]),
    "simulations":      ("Simulations", [("R", "astronomy-simulations")]),
    "games":            ("Games", [("R", "astronomy-games")]),
    "quizzes":          ("Quizzes", [("R", "astronomy-space-quizzes")]),
    "poetry":           ("Poetry", [("R", "my-poetry")]),
    "mindful-life":     ("Mindful Life", [("R", "mindful-life")]),
    "mindful-learning": ("Mindful Learning", [("R", "mindful-and-concept-oriented-learning")]),
}
NAV = [
    ("About", ["about", "ravi", "research", "careers"]),
    ("Programs", ["programs", "activities", "events", "talks"]),
    ("Learn", ["astronomy-for-everyone", "articles", "telescopes", "gallery"]),
    ("Tools", ["sky-tools", "scientific-tools", "simulations", "games", "quizzes"]),
    ("Writings", ["poetry", "mindful-life", "mindful-learning"]),
]
# old page names on each site -> new page
OLD = {("A", s): p for p, (_, srcs) in PAGES.items() for site, s in srcs if site == "A"}
OLD.update({("R", s): p for p, (_, srcs) in PAGES.items() for site, s in srcs if site == "R"})
OLD.update({("R", "home"): "ravi", ("A", "articles"): "articles", ("A", ""): "index", ("R", ""): "ravi"})
HOSTS = {"astroforeveryone.com": "A", "www.astroforeveryone.com": "A",
         "ravirajabuddhaya.com": "R", "www.ravirajabuddhaya.com": "R"}
# Inside embed code HTTrack rewrote unquoted links, e.g. src=_https_/cdnjs.../three.min.js___/script_.html
# or href=_https_/wa.me/9183418626219c07.html?text=..%22 (4-hex hash added when a query was present).
MANGLED = re.compile(r"(src|href)=_(https|mailto)_/?([^\s>]+)")


def unmangle(m):
    attr, scheme, v = m.groups()
    path, _, query = v.partition("?")
    path = unquote(path)
    if path.endswith("___/script_.html"):  # HTTrack swallowed the closing '"></script>' into the name
        return f'{attr}="https://{path.removesuffix("___/script_.html")}"></script>'
    path = path.removesuffix(".html").removesuffix("_")
    if scheme == "mailto":
        return f'{attr}="mailto:{path}"'
    if query:
        path = re.sub(r"[0-9a-f]{4}$", "", path)
    url = f"https://{path}" + (f"?{query.removesuffix('%22')}" if query else "")
    local = fix_href(url, "R")
    return f'{attr}="{"../" + local if local and not local.startswith("http") else local or url}"'
DROP_TEXT = {"Show More", "Show Less", "Search this site", "Embedded Files", "Skip to main content",
             "Skip to navigation", "Report abuse", "Page details", "Page updated", "Google Sites", "More",
             "Powered by", "Accept", "Sign up", "Subscribe", "Email", "Name", "Email*", "Send", "Attach Files",
             "Message us on WhatsApp", "This website uses cookies.", "Connect With Us", "Connect with us",
             "Sign up to hear from us about specials, sales, and events.", "Learn More", "Contact Us",
             "Updates are coming very soon!", "Be in touch to know more about us!", "Better yet, see us in person!",
             "Dr Ravi Raja Pothineni Official", "Privacy Policy and", "Terms of Service apply.", "ASTRO"}
DROP_RE = re.compile(r"^(Copyright|Registered under UDHYAM|We use cookies|This site is protected by reCAPTCHA|"
                     r"Attach FilesAttachments|Dr Ravi Raja Pothineni Official -)")
SKIP_TAGS = {"script", "style", "noscript", "svg", "nav", "form", "button", "select", "textarea", "template"}
SKIP_UX = re.compile(r"^(Navigation|Sidebar|Nav|LinkDropdown|Icon|Membership|Cart|Form|Modal|ImageLogo|Input|Utility|"
                     r"scaler|Footer|PromoBanner|CookieBanner)")
VOID = {"br", "img", "hr", "input", "meta", "link", "source", "wbr", "area", "col", "embed", "param", "track"}
BLOCK = {"p", "div", "section", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "td", "th", "tr", "table",
         "blockquote", "figure", "figcaption", "article", "main", "footer", "span-block"}
HEAD = {"h1": "h2", "h2": "h2", "h3": "h3", "h4": "h3", "h5": "h3", "h6": "h3"}


def fix_href(href, site):
    href = html.unescape(href or "").strip()
    if not href or href.startswith(("#", "javascript:")):
        return None
    if href.startswith(("mailto:", "tel:")):
        return href
    if href.startswith("//"):
        href = "https:" + href
    u = urlsplit(href)
    if u.scheme in ("http", "https"):
        s = HOSTS.get(u.netloc)
        if not s:
            return href
        site, name = s, u.path.strip("/")
    elif u.scheme:
        return None
    else:
        name = u.path.split("/")[-1]
    name = name.removesuffix(".html")
    if "/articles/f/" in href:  # individual blog posts only exist on the live site
        return "https://astroforeveryone.com" + u.path
    page = OLD.get((site, name)) or OLD.get(("A" if site == "R" else "R", name))
    return f"{page}.html" if page else None


def img_url(a):
    src = a.get("src") or a.get("data-srclazy") or (a.get("srcset") or "").split(",")[0].split(" ")[0]
    if not src or src.startswith("data:"):
        return None
    if src.startswith("//"):
        src = "https:" + src
    src = src.replace("http://", "https://", 1)
    if not src.startswith("https://"):  # local mirror file (only social icons) -> skip
        return None
    return quote(src, safe=":/%?=&,;~+#@!$*'()")


class Extract(HTMLParser):
    """Streams a source page into a flat list of clean blocks: (kind, html, key)."""

    def __init__(self, site, page):
        super().__init__(convert_charrefs=True)
        self.site, self.page = site, page
        self.root_tag, self.root_depth = None, 0   # inside a content root?
        self.skip_tag, self.skip_depth = None, 0   # inside a skipped subtree?
        self.blocks, self.buf, self.kind = [], [], "p"
        self.links = []  # open <a> tags (None = dropped link); reopened in each new block
        self.embeds = 0
        self.ratio = 60.0

    def is_root(self, tag, a):
        if self.site == "R":
            return tag == "section"
        return tag == "body"  # GoDaddy: whole body; header nav/footer are dropped via SKIP_UX / contentinfo

    def flush(self):
        h = re.sub(r"\s+", " ", "".join(self.buf)).strip()
        h = re.sub(r"^(<br>\s*)+|(\s*<br>)+$", "", h)
        h += "</a>" * sum(1 for l in self.links if l)
        text = re.sub(r"<[^>]+>", "", h).strip()
        if text and text not in DROP_TEXT and not DROP_RE.match(text):
            self.blocks.append((self.kind, h, text))
        self.buf, self.kind = [l for l in self.links if l], "p"

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth += 1
            return
        if not self.root_tag:
            if self.is_root(tag, a):
                self.root_tag, self.root_depth = tag, 1
            return
        if tag == self.root_tag:
            self.root_depth += 1
        m = re.search(r"padding-top:\s*([\d.]+)%", a.get("style", ""))
        if m:  # Google Sites sizes each embed box by a padding-top aspect ratio just above it
            self.ratio = float(m.group(1))
        if "data-code" in a:  # Google Sites custom embed: the whole tool's HTML lives in this attribute
            self.flush()
            self.save_embed(html.unescape(a["data-code"]))
        for v in a.values():
            m = re.search(r"youtube(?:-nocookie)?\.com/embed/([\w-]{11})", v)
            if m:
                self.flush()
                self.blocks.append(("video", m.group(1), "yt:" + m.group(1)))
                break
        if tag in SKIP_TAGS or SKIP_UX.match(a.get("data-ux", "")) or a.get("role") == "contentinfo":
            if tag not in VOID:
                self.skip_tag, self.skip_depth = tag, 1
            return
        if tag in BLOCK:
            self.flush()
            if tag in HEAD:
                self.kind = HEAD[tag]
            elif tag == "li":
                self.kind = "li"
        elif tag == "br":
            self.buf.append("<br>")
        elif tag == "img":
            src = img_url(a)
            if src and "sociallinks" not in src and "logo" not in src.lower():
                self.flush()
                key = src.split("/:/")[0]
                src = local_img(key) or src
                if "googleusercontent.com/sitesv-images" in src:
                    # Google Sites image links are signed and return 403 off-site; mark the spot for a real image
                    self.blocks.append(("raw-img", f"<!-- MISSING IMAGE (was on Google Sites) -->", key))
                else:
                    self.blocks.append(("img", f'<img src="{html.escape(src)}" alt="{html.escape(a.get("alt", ""))}" loading="lazy">', key))
        elif tag == "a":
            href = fix_href(a.get("href"), self.site)
            ext = ' target="_blank" rel="noopener"' if href and href.startswith("http") else ""
            self.links.append(f' <a href="{html.escape(href)}"{ext}>' if href else None)
            if href:
                self.buf.append(self.links[-1])

    def handle_endtag(self, tag):
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth -= 1
                if not self.skip_depth:
                    self.skip_tag = None
            return
        if not self.root_tag:
            return
        if tag == self.root_tag:
            self.root_depth -= 1
            if not self.root_depth:
                self.flush()
                self.root_tag = None
                return
        if tag == "a" and self.links:
            if self.links.pop():
                self.buf.append("</a> ")
        elif tag in BLOCK:
            self.flush()

    def handle_data(self, d):
        if self.root_tag and not self.skip_tag:
            self.buf.append(html.escape(d))

    def save_embed(self, code):
        self.embeds += 1
        name = f"{self.page}-{self.embeds}.html"
        code = MANGLED.sub(unmangle, code)
        m = re.search(r"<title>(.*?)</title>", code, re.S) or re.search(r"<h[1-3][^>]*>(.*?)</h[1-3]>", code, re.S)
        title = html.unescape(re.sub(r"<[^>]+>|\s+", " ", m.group(1))).strip() if m else "Interactive tool"
        if "<html" not in code.lower():
            code = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                    '<meta name="viewport" content="width=device-width,initial-scale=1">'
                    f'<title>{html.escape(title)}</title><style>body{{margin:0;background:#03060b;color:#e2e8f0}}</style>'
                    f'</head><body>\n{code}\n</body></html>')
        (OUT / "tools" / name).write_text(code, encoding="utf-8")
        self.blocks.append(("embed", name, (title, self.ratio)))
        self.ratio = 60.0


def render(blocks):
    out, seen, in_list = [], set(), False
    long_texts = [k for kind, _, k in blocks if isinstance(k, str) and len(k) > 80]
    for kind, h, key in blocks:
        if key in seen:
            continue
        seen.add(key)
        if isinstance(key, str) and len(key) > 80:  # "Show more" teaser: a shorter copy of a longer block
            stem = key.rstrip(" .…")
            if any(len(t) > len(key) and t.startswith(stem) for t in long_texts):
                continue
        if kind == "raw-img":
            out.append(h)
            continue
        if in_list and kind != "li":
            out.append("</ul>")
            in_list = False
        if kind == "li" and not in_list:
            out.append("<ul>")
            in_list = True
        if kind == "img":
            out.append(f"<figure>{h}</figure>")
        elif kind == "video":
            # some owners block embedding, so always offer the YouTube page too
            out.append(f'<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/{h}" title="Video" '
                       'allowfullscreen loading="lazy"></iframe></div>'
                       f'<p class="video-link"><a href="https://www.youtube.com/watch?v={h}" target="_blank" rel="noopener">'
                       'Watch on YouTube ↗</a></p>')
        elif kind == "embed":
            t, ratio = html.escape(key[0]), key[1]
            if ratio < 40:  # short page-banner embeds: no heading, no full-screen link
                out.append(f'<iframe class="banner" src="tools/{h}" title="{t}" style="aspect-ratio:100/{ratio:.2f}"></iframe>')
            else:
                out.append(f'<section class="tool" aria-label="{t}"><div class="tool-head">'
                           f'<a href="tools/{h}" target="_blank">Open {t} full screen ↗</a></div>'
                           f'<iframe src="tools/{h}" title="{t}" loading="lazy" style="aspect-ratio:100/{ratio:.2f}"></iframe></section>')
        else:
            out.append(f"<{kind}>{h}</{kind}>")
    if in_list:
        out.append("</ul>")
    return "\n".join(out)


def articles_feed():
    items = json.loads((A / "articles/f.json").read_text(encoding="utf-8"))["items"]
    cards = []
    for it in items:
        img = re.search(r'<img src="([^"]+)"', it.get("html_content", ""))
        src = img and img_url({"src": html.unescape(img.group(1))})
        src = src and (local_img(src.split("/:/")[0]) or src)
        pic = f'<img src="{html.escape(src)}" alt="" loading="lazy">' if src else ""
        cards.append(f'<article class="card">{pic}<h3><a href="{html.escape(it["url"])}" target="_blank" rel="noopener">'
                     f'{html.escape(it["title"])}</a></h3><p>{html.escape(it.get("summary", ""))}</p></article>')
    return '<h2>Articles (English)</h2>\n<div class="cards">' + "\n".join(cards) + "</div>"


def nav_html(current):
    groups = []
    for label, pages in NAV:
        links = "".join(f'<a href="{p}.html"{" aria-current=page" if p == current else ""}>{PAGES[p][0]}</a>' for p in pages)
        groups.append(f'<details><summary>{label}</summary><div class="menu">{links}</div></details>')
    return "".join(groups)


TEMPLATE = (ROOT / "site_template.html").read_text(encoding="utf-8")
CACHE = ROOT / "image_cache"  # filled by fetch_images.py
IMAGES = json.loads((CACHE / "map.json").read_text(encoding="utf-8")) if (CACHE / "map.json").exists() else {}


def local_img(key):
    """Copy a cached image into site/images and return its path, or None if it was never downloaded."""
    name = IMAGES.get(key)
    if not name or not (CACHE / name).exists():
        return None
    if not (OUT / "images" / name).exists():
        shutil.copy(CACHE / name, OUT / "images" / name)
    return f"images/{name}"


def main():
    for d in ("tools", "images"):
        (OUT / d).mkdir(parents=True, exist_ok=True)
    for f in [*OUT.glob("*.*"), *(OUT / "tools").glob("*.*"), *(OUT / "images").glob("*.*")]:
        try:
            f.unlink()  # clear files only; a preview server may hold the dirs
        except PermissionError:  # locked by OneDrive sync or the preview server; it gets overwritten below
            pass
    shutil.copy(ROOT / "site_style.css", OUT / "style.css")
    shutil.copy(ROOT / "brand/astro-logo.webp", OUT / "logo.webp")  # the logo exactly as supplied
    bodies = {}
    for page, (title, srcs) in PAGES.items():
        blocks = []
        if page == "articles":
            blocks.append(("raw", articles_feed(), "feed"))
        for site, name in srcs:
            src = (A if site == "A" else R) / f"{name}.html"
            p = Extract(site, page)
            p.embeds = sum(1 for b in blocks if b[0] == "embed")
            p.feed(src.read_text(encoding="utf-8", errors="replace"))
            p.flush()
            blocks += p.blocks
        body = "\n".join(b[1] for b in blocks if b[0] == "raw") + render([b for b in blocks if b[0] != "raw"])
        body = body.replace("Onlince", "Online")  # typo on the live site
        doc = (TEMPLATE.replace("{{title}}", html.escape(title)).replace("{{nav}}", nav_html(page))
               .replace("{{heading}}", "" if page == "index" else f"<h1>{html.escape(title)}</h1>")
               .replace("{{body}}", body))
        (OUT / f"{page}.html").write_text(doc, encoding="utf-8")
        bodies[page] = body
        n_embed = sum(1 for b in blocks if b[0] == "embed")
        print(f"{page + '.html':28} {len(blocks):4} blocks  {n_embed} tools")
    export_react(bodies)


WEB = ROOT / "web"


def spa_links(s, up=""):
    """Static-site paths -> React routes: about.html -> /about, tools/x.html -> /tools/x.html.
    Inside a tool (up="../") links stay relative (../about) so they work at a domain root or under a sub-path."""
    root = up or "/"
    s = re.sub(rf'(href)="{re.escape(up)}([a-z0-9-]+)\.html"', lambda m: f'{m[1]}="{root}{"" if m[2] == "index" else m[2]}"', s)
    return re.sub(r'(src|href)="(tools|images)/', r'\1="/\2/', s)


# The tools load their libraries from web/public/vendor instead of CDNs, so they work offline and never break if a CDN does
VENDOR = {
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js": "../vendor/three-r128.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js": "../vendor/OrbitControls-r128.js",
    "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js": "../vendor/astronomy-2.1.19.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js": "../vendor/html2canvas-1.4.1.min.js",
}


def local_libs(s):
    for url, path in VENDOR.items():
        s = s.replace(f'src="{url}"', f'src="{path}"')
    return s


def export_react(bodies):
    """Write the React app's data: public/content/<page>.json, src/nav.json, and the tools, images and logo."""
    pub = WEB / "public"
    for d in ("content", "tools", "images"):
        (pub / d).mkdir(parents=True, exist_ok=True)
        for f in (pub / d).glob("*.*"):
            f.unlink()
    for page, body in bodies.items():
        data = {"title": PAGES[page][0], "html": spa_links(body)}
        (pub / "content" / f"{page}.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    for f in (OUT / "tools").glob("*.html"):  # tools link back to pages as ../page.html
        (pub / "tools" / f.name).write_text(local_libs(spa_links(f.read_text(encoding="utf-8"), up="../")), encoding="utf-8")
    for f in (OUT / "images").glob("*.*"):
        shutil.copy(f, pub / "images" / f.name)
    shutil.copy(ROOT / "brand/astro-logo.webp", pub / "logo.webp")
    nav = [{"label": label, "pages": [{"slug": p, "title": PAGES[p][0]} for p in pages]} for label, pages in NAV]
    (WEB / "src" / "nav.json").write_text(json.dumps(nav, indent=1), encoding="utf-8")
    print(f"React data written to {pub}")


if __name__ == "__main__":
    main()
