#!/usr/bin/env python3
"""
sync-chrome.py — keep the site header, footer and <head> boot snippet identical
across every page.

The site is static with no build step, so the chrome used to drift: nine pages
each carried their own nav markup, two pages had none at all, and the
active-link highlighting only worked on some of them. This script owns the
canonical markup and writes it into every page, so a change is made once.

Regions are located structurally (the first top-level `<nav>`, the first
`<footer>`, `</head>`) rather than by matching comment text, so renaming a
comment can never break the sync.

Usage
    python3 tools/sync-chrome.py           # rewrite chrome in place
    python3 tools/sync-chrome.py --check   # exit 1 if any page is out of date

Review the diff before committing.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------
# Canonical navigation.
#
# Six destinations sit in the bar. The remaining three (Services, Prompts & MCP,
# Answers) sit in a "More" dropdown on desktop and in the mobile panel, so every
# page is reachable from the header at every breakpoint instead of only from the
# footer.
#
# `aria-current="page"` is written into the markup per page rather than left to
# assets/js/main.js: the current-page state is part of the document, and a
# crawler or a reader with JavaScript disabled should still see it.
# --------------------------------------------------------------------------
NAV_LINKS = [
    ("index.html", "Home"),
    ("about.html", "About"),
    ("works.html", "Works"),
    ("projects.html", "Projects"),
    ("learner-resources.html", "Resources"),
    ("contact.html", "Contact"),
]

SECONDARY_LINKS = [
    ("services.html", "Services"),
    ("prompts-and-mcp.html", "Prompts &amp; MCP"),
    ("answers.html", "Answers &amp; SEO/AEO"),
]

NAV_START = "<!-- nav:start -->"
NAV_END = "<!-- nav:end -->"
FOOTER_START = "<!-- footer:start -->"
FOOTER_END = "<!-- footer:end -->"
SUBBAR_START = "<!-- works-subbar:start -->"
SUBBAR_END = "<!-- works-subbar:end -->"
HEAD_START = "<!-- head-boot:start -->"
HEAD_END = "<!-- head-boot:end -->"


def _items(links: list[tuple[str, str]], indent: str, current: str | None = None) -> str:
    rows = []
    for href, label in links:
        mark = ' aria-current="page"' if href == current else ""
        rows.append(f'{indent}<li><a href="{href}"{mark}>{label}</a></li>')
    return "\n".join(rows)


def build_nav(skip_target: str = "main", current: str | None = None) -> str:
    return f"""{NAV_START}
<a class="skip-link" href="#{skip_target}">Skip to main content</a>

<header class="site-header">
    <nav class="site-nav" aria-label="Primary">
        <div class="container site-nav__inner">
            <a class="site-nav__brand" href="index.html">S<span class="text-gold">AI</span>KARUN</a>

            <ul class="site-nav__list">
{_items(NAV_LINKS, "                ", current)}
            </ul>

            <div class="site-nav__more">
                <button class="site-nav__more-btn" type="button" aria-expanded="false"
                    aria-controls="site-nav-more">
                    MORE<i class="fas fa-chevron-down site-nav__more-caret" aria-hidden="true"></i>
                </button>
                <ul class="site-nav__more-menu" id="site-nav-more" hidden>
{_items(SECONDARY_LINKS, "                    ", current)}
                </ul>
            </div>

            <button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-menu"
                aria-label="Open main menu">
                <span class="site-nav__toggle-bar" aria-hidden="true"></span>
                <span class="site-nav__toggle-bar" aria-hidden="true"></span>
                <span class="site-nav__toggle-bar" aria-hidden="true"></span>
            </button>
        </div>
    </nav>

    <div class="site-menu" id="site-menu" hidden>
        <ul class="site-menu__list">
{_items(NAV_LINKS, "            ", current)}
            <li class="site-menu__heading">More</li>
{_items(SECONDARY_LINKS, "            ", current)}
        </ul>
    </div>
</header>
{NAV_END}"""


def build_footer() -> str:
    return f"""{FOOTER_START}
<footer class="site-footer">
    <div class="container">
        <div class="site-footer__cols">
            <div class="site-footer__col">
                <h2>Profile</h2>
                <ul>
                    <li><a href="about.html">Biography</a></li>
                    <li><a href="works.html">Books &amp; publications</a></li>
                    <li><a href="projects.html">Open-source projects</a></li>
                    <li><a href="services.html">Research &amp; tutoring</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="site-footer__col">
                <h2>Learn</h2>
                <ul>
                    <li><a href="learner-resources.html">Learner resources</a></li>
                    <li><a href="prompts-and-mcp.html">Prompts &amp; MCP servers</a></li>
                    <li><a href="answers.html">Answers &amp; SEO/AEO</a></li>
                </ul>
            </div>
            <div class="site-footer__col">
                <h2>Elsewhere</h2>
                <ul>
                    <li><a href="https://github.com/karun99" rel="me noopener" target="_blank">GitHub</a></li>
                    <li><a href="https://www.linkedin.com/in/sai-karun-5a96a8b9" rel="me noopener" target="_blank">LinkedIn</a></li>
                    <li><a href="https://orcid.org/0009-0007-9218-9750" rel="me noopener" target="_blank">ORCID</a></li>
                    <li><a href="https://www.researchgate.net/profile/Sai-Karun-Nandipati" rel="me noopener" target="_blank">ResearchGate</a></li>
                </ul>
            </div>
            <div class="site-footer__col">
                <h2>For crawlers</h2>
                <ul>
                    <li><a href="llms.txt">llms.txt</a></li>
                    <li><a href="llms-full.txt">llms-full.txt</a></li>
                    <li><a href="sitemap.xml">sitemap.xml</a></li>
                    <li><a href="robots.txt">robots.txt</a></li>
                </ul>
            </div>
        </div>

        <div class="site-footer__bar">
            <span>&copy; 2026 Sai Karun Nandipati &middot; ORCID 0009-0007-9218-9750</span>
            <span class="site-footer__social">
                <a href="https://github.com/karun99" rel="me noopener" target="_blank" aria-label="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>
                <a href="https://www.linkedin.com/in/sai-karun-5a96a8b9" rel="me noopener" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a>
                <a href="https://orcid.org/0009-0007-9218-9750" rel="me noopener" target="_blank" aria-label="ORCID"><i class="fab fa-orcid" aria-hidden="true"></i></a>
                <a href="mailto:saikarun085@gmail.com" aria-label="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a>
            </span>
        </div>
    </div>
</footer>
{FOOTER_END}"""


# works.html used to fold its search box, category filters and live counters into
# the same element as the nav links. Swapping in the shared header would delete
# them, so the page-specific controls are re-emitted as a sub-header beneath the
# canonical nav. Element ids are preserved because the inline script at the
# bottom of works.html wires up #searchInput, #total-works and friends.
def build_works_subbar() -> str:
    return f"""{SUBBAR_START}
<div class="works-subbar">
    <div class="container works-subbar__inner">
        <div class="works-subbar__search">
            <label class="sr-only" for="searchInput">Search publication titles</label>
            <input type="search" id="searchInput" placeholder="Search titles...">
            <i class="fas fa-search" aria-hidden="true"></i>
        </div>

        <div class="works-subbar__filters" role="group" aria-label="Filter works by category">
            <button type="button" class="filter-btn active" onclick="filterBooks('all')">ALL</button>
            <button type="button" class="filter-btn" onclick="filterBooks('Research Paper')">PAPERS</button>
            <button type="button" class="filter-btn" onclick="filterBooks('Book')">BOOKS</button>
            <button type="button" class="filter-btn" onclick="filterBooks('Peer Review')">REVIEWS</button>
        </div>

        <div class="works-subbar__stats">
            <span id="total-works"><i class="fas fa-database" aria-hidden="true"></i> 0 Works Indexed</span>
            <span><i class="fas fa-file-alt" aria-hidden="true"></i> <span id="count-papers">0</span> Papers</span>
            <span><i class="fas fa-book" aria-hidden="true"></i> <span id="count-books">0</span> Books</span>
            <span><i class="fas fa-star" aria-hidden="true"></i> <span id="count-reviews">0</span> Reviews</span>
        </div>
    </div>
</div>
{SUBBAR_END}"""


# Sets the `js` class before first paint so CSS can keep the decorative loader
# hidden when JavaScript is unavailable. Without it nothing ever dismisses the
# loader and it covers the whole page.
def build_head_boot() -> str:
    return f"""{HEAD_START}
    <script>document.documentElement.classList.add('js');</script>
    <meta name="theme-color" content="#020617">
    <meta name="color-scheme" content="dark">
    {HEAD_END}"""


# Per-page overrides. Everything else is discovered structurally.
PAGES: dict[str, dict] = {
    "index.html": {},
    "about.html": {},
    "works.html": {"skip_target": "library-container", "after_nav": "works-subbar"},
    "projects.html": {},
    "services.html": {},
    "contact.html": {},
    "answers.html": {},
    "learner-resources.html": {},
    "prompts-and-mcp.html": {},
}


class SyncError(RuntimeError):
    pass


# --------------------------------------------------------------------------
# Structural location helpers
# --------------------------------------------------------------------------


def _lines(text: str) -> list[str]:
    return text.split("\n")


def _find_marker_line(lines: list[str], marker: str, label: str) -> int:
    """Index of the line whose stripped text equals `marker`.

    Stripping keeps detection working when the block has been indented, which
    matters for the <head> snippet.
    """
    for i, line in enumerate(lines):
        if line.strip() == marker:
            return i
    raise SyncError(f"{label}: marker {marker} not found")


def _has_marker(lines: list[str], marker: str) -> bool:
    return any(line.strip() == marker for line in lines)


def _find_open_tag(lines: list[str], tag: str, label: str, start: int = 0,
                   require_class: str | None = None) -> int:
    """Index of the first line whose stripped text starts with `<tag`.

    Anchoring on the literal tag (rather than a comment above it) means the sync
    cannot be broken by re-wording a comment.
    """
    needle = "<" + tag
    for i in range(start, len(lines)):
        text = lines[i].strip()
        if not text.startswith(needle):
            continue
        if require_class:
            # Opening tags may wrap, so look ahead to the closing angle bracket.
            window = text
            j = i
            while ">" not in window and j + 1 < len(lines) and j < i + 8:
                j += 1
                window += " " + lines[j].strip()
            if not _has_class(window, require_class):
                continue
        return i
    raise SyncError(f"{label}: no top-level <{tag}> found")


def _has_class(open_tag: str, name: str) -> bool:
    """True when a class attribute in an opening tag contains `name` exactly."""
    match = re.search(r'class="([^"]*)"', open_tag)
    if not match:
        return False
    return name in match.group(1).split()


def _find_close_tag(lines: list[str], tag: str, label: str, start: int) -> int:
    """Line index of the matching close tag, counting nested same-name tags."""
    open_re = re.compile(r"^<" + tag + r"(?![A-Za-z0-9])")
    close_needle = "</" + tag + ">"
    depth = 0
    for i in range(start, len(lines)):
        text = lines[i].strip()
        if text.startswith(close_needle):
            depth -= 1
            if depth == 0:
                return i
        elif open_re.match(text) or re.search(r"<" + tag + r"(?![A-Za-z0-9])[^>]*>$", text):
            depth += 1
    raise SyncError(f"{label}: no </{tag}> after line {start + 1}")


def _absorb_preceding_comment(lines: list[str], index: int) -> int:
    """Walk back over a comment block so the old marker comment is replaced too."""
    i = index - 1
    while i >= 0 and lines[i].strip() == "":
        i -= 1
    end = i
    while i >= 0 and lines[i].strip().startswith("<!--"):
        if "-->" in lines[i]:
            i -= 1
            break
        i -= 1
    if i < end:
        return i + 1
    return index


def _splice(lines: list[str], start: int, stop: int, replacement: str) -> str:
    return "\n".join(lines[:start] + replacement.split("\n") + lines[stop + 1:])


# --------------------------------------------------------------------------
# Sync steps
# --------------------------------------------------------------------------


def sync_nav(text: str, filename: str, skip_target: str) -> str:
    lines = _lines(text)
    label = f"{filename} nav"
    nav = build_nav(skip_target, current=filename)
    if _has_marker(lines, NAV_START):
        s = _find_marker_line(lines, NAV_START, label)
        e = _find_marker_line(lines, NAV_END, label)
        return _splice(lines, s, e, nav)

    start = _absorb_preceding_comment(lines, _find_open_tag(lines, "nav", label))
    stop = _find_close_tag(lines, "nav", label, start)
    return _splice(lines, start, stop, nav)


def strip_legacy_nav_overlays(text: str, filename: str) -> str:
    """Remove the old <div class="nav-links"> mobile panels.

    They lived outside <nav>, so the structural replacement never reached them.
    They duplicate the real navigation and keep links in the tab order while
    being visually collapsed, which is the accessibility bug we are fixing.
    """
    lines = _lines(text)
    label = f"{filename} legacy nav-links"
    while True:
        try:
            start = _find_open_tag(lines, "div", label, 0, require_class="nav-links")
        except SyncError:
            break
        stop = _find_close_tag(lines, "div", label, start)
        lines = _splice(lines, start, stop, "").split("\n")
    return "\n".join(lines)


def sync_after_nav(text: str, filename: str) -> str:
    """Re-emit page-specific controls that used to live inside the nav block."""
    if PAGES[filename].get("after_nav") != "works-subbar":
        return text
    lines = _lines(text)
    if _has_marker(lines, SUBBAR_START):
        return text
    idx = _find_marker_line(lines, NAV_END, f"{filename} subbar")
    block = build_works_subbar()
    return "\n".join(lines[:idx + 1] + [""] + block.split("\n") + lines[idx + 1:])


def sync_footer(text: str, filename: str) -> str:
    lines = _lines(text)
    label = f"{filename} footer"
    if _has_marker(lines, FOOTER_START):
        s = _find_marker_line(lines, FOOTER_START, label)
        e = _find_marker_line(lines, FOOTER_END, label)
        return _splice(lines, s, e, build_footer())

    if any(line.strip().startswith("<footer") for line in lines):
        start = _absorb_preceding_comment(lines, _find_open_tag(lines, "footer", label))
        stop = _find_close_tag(lines, "footer", label, start)
        return _splice(lines, start, stop, build_footer())

    # Pages with no footer at all (works.html): insert before </body>.
    try:
        idx = next(i for i, line in enumerate(lines) if line.strip() == "</body>")
    except StopIteration:
        raise SyncError(f"{label}: no </body> to insert before") from None
    return "\n".join(lines[:idx] + build_footer().split("\n") + [""] + lines[idx:])


def sync_head(text: str, filename: str) -> str:
    lines = _lines(text)
    if _has_marker(lines, HEAD_START):
        return text
    label = f"{filename} head"
    idx = _find_close_tag(lines, "head", label, 0)
    return "\n".join(lines[:idx] + ["    " + build_head_boot()] + lines[idx:])


def sync_page(filename: str, opts: dict) -> str:
    path = ROOT / filename
    if not path.exists():
        raise SyncError(f"{filename}: file not found")
    original = path.read_text(encoding="utf-8")
    updated = strip_legacy_nav_overlays(original, filename)
    updated = sync_nav(updated, filename, opts.get("skip_target", "main"))
    updated = sync_after_nav(updated, filename)
    updated = sync_footer(updated, filename)
    updated = sync_head(updated, filename)
    return original, updated


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true",
                    help="report out-of-date pages without writing")
    args = ap.parse_args()

    stale: list[str] = []
    for filename, opts in PAGES.items():
        try:
            original, updated = sync_page(filename, opts)
        except SyncError as exc:
            print(f"  ERROR    {exc}", file=sys.stderr)
            return 2

        if updated == original:
            print(f"  ok       {filename}")
            continue

        stale.append(filename)
        if args.check:
            print(f"  STALE    {filename}")
        else:
            (ROOT / filename).write_text(updated, encoding="utf-8")
            print(f"  updated  {filename}")

    if args.check and stale:
        print(f"\n{len(stale)} page(s) out of date: {', '.join(stale)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
