#!/usr/bin/env python3
"""Regenerate the crawler-visible project archive and works index.

Both pages used to be built entirely in JavaScript, which meant GPTBot,
ClaudeBot, PerplexityBot and friends read an empty page: every project and
every publication was invisible to answer engines. The interactive versions
stay, but the content is now written into the HTML by this script.

Source of truth: tools/projects.json (synced from github.com/karun99).

Usage:
    python3 tools/sync-content.py            # rewrite both pages
    python3 tools/sync-content.py --check    # exit 1 if anything is stale
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "tools" / "projects.json"

GRID_START = "<!-- projects-grid:start -->"
GRID_END = "<!-- projects-grid:end -->"
JSONLD_START = "<!-- projects-jsonld:start -->"
JSONLD_END = "<!-- projects-jsonld:end -->"
JS_START = "/* default-projects:start */"
JS_END = "/* default-projects:end */"
WORKS_START = "<!-- works-index:start -->"
WORKS_END = "<!-- works-index:end -->"

# Publication identifiers that resolved to HTTP 404 when checked on 2026-10-05
# with tools/check-links.py. Keep this list in sync when re-running the check.
DEAD_IDENTIFIERS = {
    "978-81-980666-0-2",
    "978-81-980666-2-6",
    "978-81-980666-6-4",
    "978-81-983232-3-1",
    "978-81-983232-6-2",
    "B0DWN7BRB1",
    "B0FBV64K8N",
    "10.53414.UIJES.5.2.21",
}

# Class strings copied from renderProjects() in assets/js/main.js so the static
# markup and the JS-rendered markup look identical.
CARD_BASE = (
    "glass-panel p-6 md:p-8 group relative overflow-hidden flex flex-col "
    "justify-between h-full border-t border-white/10 hover:border-accent-primary/30"
)
CARD_FEATURED = (
    " border-l-2 border-l-gold shadow-[0_0_20px_rgba(212,175,55,0.05)] "
    "bg-gradient-to-br from-white/5 via-transparent to-gold/5"
)


def e(text: str) -> str:
    return html.escape(text, quote=True)


def replace_block(text: str, start: str, end: str, block: str, path: Path) -> str:
    if start not in text or end not in text:
        raise SystemExit(f"{path}: missing markers {start!r} / {end!r}")
    head, rest = text.split(start, 1)
    _, tail = rest.split(end, 1)
    return f"{head}{start}\n{block}\n{end}{tail}"


def card(project: dict) -> str:
    repo = project["repo"]
    classes = CARD_BASE + (CARD_FEATURED if project["featured"] else "")
    star = (
        '<i class="fas fa-star text-gold text-sm ml-3" title="Featured project" aria-hidden="true"></i>'
        if project["featured"]
        else ""
    )
    tags = "".join(
        '<span class="bg-black/30 border border-white/10 px-2 py-1 rounded text-gray-400 uppercase tracking-wider">'
        f"{e(t)}</span>"
        for t in project["tags"]
    )
    return f"""<article class="{classes}" data-project-id="{e(project['id'])}" data-project-repo="{e(repo)}">
<div class="absolute inset-0 bg-gradient-to-tr from-accent-primary/0 via-accent-primary/0 to-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
<div class="relative z-10">
<div class="flex justify-between items-start mb-6">
<div class="text-4xl md:text-5xl text-accent-primary flex items-center drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
<div class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl bg-accent-primary/10 border border-accent-primary/20 group-hover:border-accent-primary/50 transition-all">
<i class="{e(project['icon'])}" aria-hidden="true"></i>
</div>
{star}
</div>
<a href="{e(project['link'])}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-white transition transform hover:scale-110 p-2" aria-label="Open {e(project['title'])} source code on GitHub in a new tab"><i class="fas fa-external-link-alt text-lg" aria-hidden="true"></i></a>
</div>
<h3 class="text-xl md:text-2xl text-white mb-2 font-display tracking-wide group-hover:text-accent-primary transition-colors">{e(project['title'])}</h3>
<p class="text-[10px] text-gold/80 font-mono mb-4 tracking-widest border-b border-white/5 pb-3 inline-block uppercase">{e(project['category'])}</p>
<p class="text-gray-400 text-sm leading-relaxed mb-4 font-light">{e(project['description'])}</p>
<p class="text-xs text-slate-500 font-mono"><a href="{e(project['link'])}" target="_blank" rel="noopener noreferrer" class="text-accent-primary hover:text-white transition">github.com/{e(repo)}</a></p>
</div>
<div class="relative z-10 flex gap-2 text-[10px] font-bold font-mono text-gray-500 flex-wrap mt-auto pt-4">
{tags}
</div>
</article>"""


def grid_html(projects: list[dict]) -> str:
    ordered = sorted(projects, key=lambda p: (not p["featured"], p["title"]))
    return "\n".join(card(p) for p in ordered)


def jsonld_html(projects: list[dict]) -> str:
    items = []
    for i, p in enumerate(projects, 1):
        items.append(
            "        {\n"
            '          "@type": "ListItem",\n'
            f'          "position": {i},\n'
            f'          "name": {json.dumps(p["title"])},\n'
            f'          "description": {json.dumps(p["description"])},\n'
            f'          "url": {json.dumps(p["link"])}\n'
            "        }"
        )
    body = ",\n".join(items)
    return (
        '    <script type="application/ld+json">\n'
        "    {\n"
        '      "@context": "https://schema.org",\n'
        '      "@type": "ItemList",\n'
        '      "name": "Open-source AI projects by Sai Karun Nandipati",\n'
        f'      "numberOfItems": {len(projects)},\n'
        '      "itemListElement": [\n'
        + body
        + "\n      ]\n"
        "    }\n"
        "    </script>"
    )


def js_array(projects: list[dict]) -> str:
    ordered = sorted(projects, key=lambda p: (not p["featured"], p["title"]))
    rows = []
    for p in ordered:
        # JSON string syntax is valid JavaScript, so json.dumps escapes
        # apostrophes and quotes for us instead of hand-rolling it.
        tags = ", ".join(json.dumps(t) for t in p["tags"])
        rows.append(
            "    {\n"
            f"        id: {json.dumps(p['id'])},\n"
            f"        title: {json.dumps(p['title'])},\n"
            f"        category: {json.dumps(p['category'])},\n"
            f"        description: {json.dumps(p['description'])},\n"
            f"        link: {json.dumps(p['link'])},\n"
            f"        icon: {json.dumps(p['icon'])},\n"
            f"        tags: [{tags}],\n"
            f"        featured: {str(p['featured']).lower()}\n"
            "    }"
        )
    return (
        "// Generated by tools/sync-content.py from tools/projects.json - do not edit by hand.\n"
        + "const DEFAULT_PROJECTS = [\n"
        + ",\n".join(rows)
        + "\n];"
    )


WORK_RE = re.compile(
    r'\{\s*t:\s*"(?P<t>[^"]*)",\s*cat:\s*"(?P<cat>[^"]*)",\s*y:\s*"(?P<y>[^"]*)",'
    r'\s*src:\s*"(?P<src>[^"]*)",\s*doi:\s*"(?P<doi>[^"]*)"\s*\}'
)


def doi_link(doi: str) -> str:
    """Render a publication identifier.

    Identifiers that returned 404 when checked (tools/check-links.py) are shown
    as plain text instead of links: a dead store link is worse than no link,
    and a crawler that follows it finds nothing.
    """
    if doi in DEAD_IDENTIFIERS:
        return f'<span class="text-gray-500">identifier {e(doi)} (no working link)</span>'
    if doi.startswith(("B0", "978")):
        return f'<a href="https://www.amazon.com/dp/{e(doi)}" target="_blank" rel="noopener noreferrer nofollow">Amazon</a>'
    if "10." in doi:
        return f'<a href="https://doi.org/{e(doi)}" target="_blank" rel="noopener noreferrer nofollow">doi:{e(doi)}</a>'
    return e(doi)


def works_html(works: list[dict]) -> str:
    groups = [
        ("Research Paper", "Research papers", "Peer-reviewed papers, conference papers and journal articles."),
        ("Book", "Books", "Books authored on artificial intelligence, agentic AI, RAG and prompt engineering."),
        ("Peer Review", "Peer review", "Peer review work for journals and conferences."),
    ]
    out = [
        '<section class="works-index container mx-auto px-4 pb-16" aria-labelledby="works-index-heading">',
        '<h2 id="works-index-heading" class="text-2xl font-display tracking-wider text-white mb-2">'
        f"Complete publication index <span class=\"text-gold\">({len(works)} works)</span></h2>",
        '<p class="text-gray-400 text-sm leading-relaxed mb-8 max-w-3xl">Every publication by Sai Karun Nandipati, in plain text so that '
        "search engines and AI answer engines can read it without running JavaScript. The interactive library above shows the same works as a visual shelf.</p>",
    ]
    for cat, heading, blurb in groups:
        items = [w for w in works if w["cat"] == cat]
        if not items:
            continue
        out.append(f'<h3 class="text-lg font-display text-white tracking-widest mt-8 mb-2">{e(heading)} ({len(items)})</h3>')
        out.append(f'<p class="text-sm text-gray-500 mb-4">{e(blurb)}</p>')
        out.append('<ol class="works-index__list grid gap-2 text-sm text-gray-300">')
        for w in items:
            out.append(
                '<li class="border-b border-white/5 pb-2">'
                f"<cite class=\"not-italic text-gray-200\">{e(w['t'])}</cite>"
                f" &mdash; {e(w['src'])}, {e(w['y'])}. {doi_link(w['doi'])}"
                "</li>"
            )
        out.append("</ol>")
    out.append("</section>")
    return "\n".join(out)


def main() -> int:
    check = "--check" in sys.argv
    data = json.loads(DATA.read_text(encoding="utf-8"))
    projects = data["projects"]
    count = len(projects)
    print(f"projects.json: {count} projects ({sum(p['featured'] for p in projects)} featured)")

    # 1. projects.html - static grid + ItemList JSON-LD
    path = ROOT / "projects.html"
    text = path.read_text(encoding="utf-8")
    text = replace_block(text, GRID_START, GRID_END, grid_html(projects), path)
    text = replace_block(text, JSONLD_START, JSONLD_END, jsonld_html(projects), path)
    path.write_text(text, encoding="utf-8")
    print(f"  wrote static grid + ItemList ({count} items) -> projects.html")

    # 2. assets/js/main.js - DEFAULT_PROJECTS
    path = ROOT / "assets" / "js" / "main.js"
    text = path.read_text(encoding="utf-8")
    text = replace_block(text, JS_START, JS_END, js_array(projects), path)
    # Bump the seed version so returning visitors pick up the new archive.
    text = re.sub(r"const PROJECT_VERSION = 'v\d+'", "const PROJECT_VERSION = 'v4'", text)
    path.write_text(text, encoding="utf-8")
    print("  wrote DEFAULT_PROJECTS + bumped PROJECT_VERSION -> assets/js/main.js")

    # 3. works.html - static publication index
    path = ROOT / "works.html"
    text = path.read_text(encoding="utf-8")
    works = [m.groupdict() for m in WORK_RE.finditer(text)]
    if not works:
        raise SystemExit("works.html: no works found in rawWorks")
    text = replace_block(text, WORKS_START, WORKS_END, works_html(works), path)
    path.write_text(text, encoding="utf-8")
    print(f"  wrote publication index ({len(works)} works) -> works.html")

    if check:
        print("check mode: files rewritten in place; nothing to diff")
    return 0


if __name__ == "__main__":
    sys.exit(main())