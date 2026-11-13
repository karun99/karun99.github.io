#!/usr/bin/env python3
"""Attach a Google Search Console ownership proof to this static site.

Why this script exists
----------------------
`karun99.github.io` is a GitHub *user* site, so the owner does NOT control the
`github.io` DNS zone. That rules out the DNS-TXT verification method in Search
Console. Two methods do work, and both are handled here:

  1. HTML meta tag
       <meta name="google-site-verification" content="TOKEN">
     added to the <head> of the page(s) of the URL-prefix property.

  2. HTML file
       https://karun99.github.io/google<hash>.html
     served verbatim at the site root.

Usage
-----
  # Meta-tag method (recommended). Paste the token Search Console shows you.
  python3 tools/gsc-verify.py --token "AbC123...xyz"

  # Put the tag on every page instead of just the homepage.
  python3 tools/gsc-verify.py --token "AbC123...xyz" --all

  # HTML-file method: copy the file Google asked you to download.
  python3 tools/gsc-verify.py --file ~/Downloads/google1a2b3c4d5e.html

  # Inspect current state / remove the tag again.
  python3 tools/gsc-verify.py --show
  python3 tools/gsc-verify.py --remove

After running, commit and push. GitHub Pages must be live before you click
"Verify" in Search Console, otherwise Google fetches the old page.
"""
from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{8,120}$")
META_RE = re.compile(
    r"[ \t]*<meta[^>]+name=[\"']google-site-verification[\"'][^>]*>\n?", re.I
)
FILE_RE = re.compile(r"^google[A-Za-z0-9_-]{4,}\.html$")


def pages() -> list[Path]:
    return sorted(ROOT.glob("*.html"))


def verifies(page: Path) -> str | None:
    m = META_RE.search(page.read_text(encoding="utf-8"))
    if not m:
        return None
    t = re.search(r'content=["\']([^"\']*)["\']', m.group(0))
    return t.group(1) if t else ""


def write_tag(page: Path, token: str) -> bool:
    text = page.read_text(encoding="utf-8")
    if "</head>" not in text:
        return False
    cleaned = META_RE.sub("", text)
    tag = f'<meta name="google-site-verification" content="{token}">'
    # Keep it next to the other crawler directives at the end of <head>.
    updated = cleaned.replace("</head>", f"    {tag}\n</head>", 1)
    if updated == text:
        return False
    page.write_text(updated, encoding="utf-8")
    return True


def strip_tag(page: Path) -> bool:
    text = page.read_text(encoding="utf-8")
    updated = META_RE.sub("", text)
    if updated == text:
        return False
    page.write_text(updated, encoding="utf-8")
    return True


def show() -> int:
    found = False
    for page in pages():
        token = verifies(page)
        if token is not None:
            found = True
            print(f"  meta tag   {page.name}: {token or '(empty content)'}")
    for f in sorted(ROOT.glob("google*.html")):
        found = True
        print(f"  html file  {f.name}")
    if not found:
        print("  no Google verification artifact is installed")
        return 1
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--token", help="content value from the HTML-tag method")
    g.add_argument("--file", help="path to the google*.html file Google gave you")
    g.add_argument("--show", action="store_true", help="print installed artifacts")
    g.add_argument("--remove", action="store_true", help="delete the meta tag")
    ap.add_argument(
        "--all",
        action="store_true",
        help="add the meta tag to every page, not just the homepage",
    )
    args = ap.parse_args()

    if args.show:
        return show()

    if args.remove:
        changed = [p.name for p in pages() if strip_tag(p)]
        print(f"removed from: {', '.join(changed) if changed else 'nothing to remove'}")
        return 0

    if args.file:
        src = Path(args.file).expanduser()
        if not src.is_file():
            ap.error(f"file not found: {src}")
        if not FILE_RE.match(src.name):
            ap.error(f"unexpected name {src.name!r}; expected google<hash>.html")
        shutil.copyfile(src, ROOT / src.name)
        print(f"wrote {src.name}")
        print(f"verify this URL is live, then click Verify in Search Console:")
        print(f"  https://karun99.github.io/{src.name}")
        return 0

    token = args.token.strip()
    if not TOKEN_RE.match(token):
        ap.error("token looks wrong; copy the content= value exactly, no quotes")

    targets = pages() if args.all else [ROOT / "index.html"]
    changed = [p.name for p in targets if write_tag(p, token)]
    if not changed:
        print("token already present; nothing to change")
        return 0
    print(f"wrote meta tag to: {', '.join(changed)}")
    print("next: commit + push, wait for GitHub Pages, then click Verify.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
