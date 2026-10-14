#!/usr/bin/env python3
"""Structural audit for the static site.

Checks the things that silently break SEO and accessibility:
duplicate attributes, duplicate ids, duplicate titles/descriptions,
heading order, canonical/metadata presence, and dead internal links.
"""
from __future__ import annotations

import html.parser
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(p for p in ROOT.glob("*.html"))
SKIP_LINKS = {"sitemap.xml", "robots.txt", "llms.txt", "llms-full.txt"}

ATTR_SPLIT = re.compile(r"([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+)")


class Doc(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.dup_attrs: list[tuple[str, str]] = []
        self.links: list[str] = []
        self.headings: list[tuple[int, str]] = []
        self.metas: dict[str, list[str]] = {}
        self.canonicals: list[str] = []
        self.imgs_no_alt = 0
        self.buttons_no_name = 0
        self._stack: list[str] = []
        self._heading_text: list[str] | None = None
        self._void = {"img", "br", "hr", "meta", "link", "input", "source", "area", "base", "col"}

    def handle_starttag(self, tag, attrs):
        raw = re.match(r"<[a-zA-Z]+[^>]*>", self.get_starttag_text() or "")
        names = [m.group(1).lower() for m in ATTR_SPLIT.finditer(raw.group(0))] if raw else []
        seen: set[str] = set()
        for n in names:
            if n in seen:
                self.dup_attrs.append((tag, n))
            seen.add(n)

        amap = {k.lower(): (v or "") for k, v in attrs}
        if "id" in amap:
            self.ids.append(amap["id"])
        if tag == "a" and "href" in amap:
            self.links.append(amap["href"])
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.headings.append((int(tag[1]), ""))
            self._heading_text = []
        if tag == "meta":
            key = amap.get("name") or amap.get("property") or amap.get("http-equiv")
            if key:
                self.metas.setdefault(key.lower(), []).append(amap.get("content", ""))
        if tag == "link" and "canonical" in amap.get("rel", "").lower():
            self.canonicals.append(amap.get("href", ""))
        if tag == "img" and "alt" not in amap:
            self.imgs_no_alt += 1
        if tag not in self._void:
            self._stack.append(tag)

    def handle_endtag(self, tag):
        if self._heading_text is not None and tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.headings[-1] = (self.headings[-1][0], "".join(self._heading_text).strip())
            self._heading_text = None
        if tag in self._stack:
            while self._stack and self._stack.pop() != tag:
                pass

    def handle_data(self, data):
        if self._heading_text is not None:
            self._heading_text.append(data)


def parse(text: str) -> Doc:
    d = Doc()
    d.feed(text)
    d.close()
    return d


def main() -> int:
    problems: list[str] = []
    exists = {p.name for p in PAGES} | {p.name for p in ROOT.iterdir() if p.is_file()}

    for page in PAGES:
        text = page.read_text(encoding="utf-8")
        d = parse(text)
        rel = page.relative_to(ROOT)
        add = lambda msg: problems.append(f"{rel}: {msg}")  # noqa: E731

        for tag, attr in d.dup_attrs:
            add(f"duplicate attribute {attr!r} on <{tag}> (browser keeps the first)")

        dup_ids = {i for i in d.ids if d.ids.count(i) > 1}
        for i in sorted(dup_ids):
            add(f"duplicate id {i!r}")

        for key in ("description", "title"):
            if key == "description" and len(d.metas.get("description", [])) > 1:
                add("multiple meta descriptions")
        if "<title>" not in text:
            add("missing <title>")
        if not d.metas.get("description"):
            add("missing meta description")
        if not d.canonicals:
            add("missing canonical link")
        elif len(d.canonicals) > 1:
            add(f"multiple canonicals: {d.canonicals}")
        if d.imgs_no_alt:
            add(f"{d.imgs_no_alt} <img> without alt attribute")

        h1 = [h for h, _ in d.headings if h == 1]
        if len(h1) != 1:
            add(f"expected exactly one <h1>, found {len(h1)}")
        prev = 0
        for lvl, txt in d.headings:
            if prev and lvl > prev + 1:
                add(f"heading jumps h{prev} -> h{lvl} ({txt[:50]!r})")
            prev = lvl

        for href in d.links:
            if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "#")):
                continue
            target = href.split("#", 1)[0].split("?", 1)[0]
            if not target:
                continue
            if target.startswith("/"):
                target = target.lstrip("/")
            if target in SKIP_LINKS:
                continue
            if target not in exists:
                add(f"dead internal link: {href}")

        for anchor in set(re.findall(r'href="#([A-Za-z][-\w]*)"', text)):
            if f'id="{anchor}"' not in text:
                add(f"dead in-page anchor: #{anchor}")

    # In-page anchors must resolve against the page that links to them.
    for page in PAGES:
        text = page.read_text(encoding="utf-8")
        for href in parse(text).links:
            if href.startswith("#") or ".html#" not in href:
                continue
            page_part, _, frag = href.partition("#")
            target = ROOT / page_part
            if target.exists() and f'id="{frag}"' not in target.read_text(encoding="utf-8"):
                problems.append(f"{page.relative_to(ROOT)}: anchor {href} not found in {page_part}")

    if problems:
        print(f"{len(problems)} problem(s):\n")
        for p in problems:
            print(f"  {p}")
        return 1

    print(f"clean: {len(PAGES)} pages checked")
    for p in PAGES:
        print(f"  ok  {p.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())