#!/usr/bin/env python3
"""Generate llms-full.txt from the pages themselves.

The file is advertised to answer engines as "auto-generated from the live pages,
so it cannot drift from them". That was not true: the copy was maintained by hand
and had already drifted (it still showed the old navigation and the projects
section still read "LOADING PROJECTS..." from the deleted JavaScript renderer).

This script renders the main content of every indexable page to text. Shared
chrome (nav, footer, loader, modals) is dropped, because repeating the same
navigation nine times wastes context that the model needs for the content.

Usage:
    python3 tools/sync-llms.py           # rewrite llms-full.txt
    python3 tools/sync-llms.py --check   # exit 1 if it is out of date
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "llms-full.txt"
SITE = "https://karun99.github.io"

# Pages in the order an answer engine should meet them.
PAGES = [
    ("index.html", "Home", f"{SITE}/", "Canonical home page. Start here."),
    ("about.html", "About & Journey", f"{SITE}/about.html",
     "Biography, academic career and technical philosophy."),
    ("works.html", "Research Library", f"{SITE}/works.html",
     "Books, research papers and peer review, with a full text index."),
    ("projects.html", "Projects", f"{SITE}/projects.html",
     "Open-source AI systems published on GitHub, with source links."),
    ("services.html", "Services", f"{SITE}/services.html",
     "Research assistance, tutoring and technical writing."),
    ("learner-resources.html", "Learner Resources", f"{SITE}/learner-resources.html",
     "Live study portals and web apps for students."),
    ("prompts-and-mcp.html", "Prompts & MCP Servers", f"{SITE}/prompts-and-mcp.html",
     "AI prompt tools and Model Context Protocol servers."),
    ("answers.html", "Answers & FAQ (AEO hub)", f"{SITE}/answers.html",
     "Identity record, verified answers and the free SEO-Optimiser tool."),
    ("contact.html", "Contact", f"{SITE}/contact.html",
     "Collaboration, tutoring and project channels."),
]

HEADER = """# Sai Karun Nandipati — AI Architect & Professor (complete site text)

> Full plain-text rendering of https://karun99.github.io/ for AI assistants and
> answer engines. Auto-generated from the live pages by tools/sync-llms.py, so it
> cannot drift from them. For the concise machine-readable index, see
> https://karun99.github.io/llms.txt
"""

# Regions that carry no information about the person or the work.
DROP_BLOCKS = [
    r'<div id="loader">.*?</div>\s*</div>\s*</div>',
    r'<!-- nav:start -->.*?<!-- nav:end -->',
    r'<!-- footer:start -->.*?<!-- footer:end -->',
    r'<!-- works-subbar:start -->.*?<!-- works-subbar:end -->',
    r'<div id="project-modal".*?</form>\s*</div>\s*</div>',
    r'<div id="login-modal".*?</form>\s*</div>\s*</div>',
    r'<div id="popover".*?(?=<footer|</body>)',
    r'<script[^>]*>.*?</script>',
    r'<style[^>]*>.*?</style>',
    r'<noscript>.*?</noscript>',
    r'<!--.*?-->',
]


def to_text(markup: str) -> str:
    text = markup
    for pattern in DROP_BLOCKS:
        text = re.sub(pattern, " ", text, flags=re.S | re.I)
    # Keep link text, drop the URL noise it was wrapped in.
    text = re.sub(r"<a\b[^>]*>", " ", text, flags=re.I)
    text = re.sub(r"</a>", " ", text, flags=re.I)
    text = re.sub(r"<(h[1-6]|p|li|tr|section|article|div|br|ol|ul)\b[^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    lines = [re.sub(r"[ \t\u00a0]+", " ", ln).strip() for ln in text.splitlines()]
    out, blank = [], False
    for ln in lines:
        if not ln:
            if not blank and out:
                out.append("")
            blank = True
            continue
        blank = False
        out.append(ln)
    return "\n".join(out).strip()


def render() -> str:
    parts = [HEADER, "---"]
    for filename, title, url, blurb in PAGES:
        page = ROOT / filename
        body = to_text(page.read_text(encoding="utf-8"))
        parts.append(f"\n## {title}\n\nSource: {url}\n{blurb}\n\n{body}\n")
    return "\n".join(parts) + "\n"


def main() -> int:
    fresh = render()
    current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""

    if "--check" in sys.argv:
        if current != fresh:
            print("llms-full.txt is out of date - run: python3 tools/sync-llms.py")
            return 1
        print("llms-full.txt is up to date")
        return 0

    OUT.write_text(fresh, encoding="utf-8")
    print(f"wrote llms-full.txt ({len(fresh.splitlines())} lines, {len(fresh)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())