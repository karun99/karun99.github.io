#!/usr/bin/env python3
"""Render the tracked web-app registry (tools/deployments.json) into pages.

The registry lists website deployments attributed to Sai Karun Nandipati: name,
description, URL, hosting platform and last-checked status. Some deployments
may be offline between checks.

The block is written as static HTML (not JavaScript) on purpose: GPTBot,
ClaudeBot and PerplexityBot read the markup, not the renderer.

Usage:
    python3 tools/sync-deployments.py            # rewrite the pages in place
    python3 tools/sync-deployments.py --check    # exit 1 if anything is stale
"""
from __future__ import annotations

import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "tools" / "deployments.json"

START = "<!-- deployments:start -->"
END = "<!-- deployments:end -->"

# Each page gets the same block, anchored before a unique marker already in it.
TARGETS = [
    ("projects.html", "    <!-- LEARNER RESOURCES -->"),
    ("learner-resources.html", "</main>"),
    ("prompts-and-mcp.html", "    <!-- ============ MCP CATALOG"),
]

CARD = (
    '<a href="{url}" target="_blank" rel="noopener nofollow" '
    'class="block resource-card glass-panel p-6 border border-white/5 '
    'hover:border-accent-primary/30 transition-all group">'
)
CARD_OFFLINE = (
    '<div class="resource-card glass-panel p-6 border border-white/5 opacity-80">'
)


def e(text: str) -> str:
    return html.escape(text, quote=True)


def card(d: dict) -> str:
    name = e(d["name"].upper())
    desc = e(d["description"])
    url = e(d["url"])
    host = e(d["url"].split("//", 1)[-1].split("/", 1)[0])
    platform = e(d["platform"])
    open_tag = CARD.format(url=url) if d.get("status") != "offline" else CARD_OFFLINE
    close_tag = "</a>" if d.get("status") != "offline" else "</div>"
    badge = (
        '<span class="inline-flex items-center gap-1.5 font-mono text-[10px] '
        'tracking-widest text-emerald-400 border border-emerald-400/30 '
        'bg-emerald-400/10 rounded px-2 py-1">LIVE</span>'
        if d.get("status") != "offline"
        else '<span class="inline-flex items-center gap-1.5 font-mono text-[10px] '
        'tracking-widest text-amber-400/90 border border-amber-400/30 '
        'bg-amber-400/10 rounded px-2 py-1">OFFLINE &mdash; DEPLOYMENT RETIRED</span>'
    )
    return f"""{open_tag}
                <div class="flex items-start justify-between gap-3 mb-3">
                    <h3 class="text-lg font-display text-white tracking-widest">{name}</h3>
                    {badge}
                </div>
                <p class="text-gray-400 font-light text-sm leading-relaxed mb-4">{desc}</p>
                <div class="flex flex-wrap gap-2">
                    <span class="font-mono text-[10px] tracking-widest text-accent-primary border border-accent-primary/30 rounded px-2 py-1">{platform}</span>
                    <span class="font-mono text-[10px] tracking-widest text-slate-400 border border-white/10 rounded px-2 py-1 break-all">{host}</span>
                </div>
                <p class="mt-4 text-xs text-slate-500"><a href="{url}" target="_blank" rel="noopener nofollow" class="text-accent-primary underline">Visit site</a></p>
            {close_tag}"""


def block(deployments: list[dict], verified_on: str) -> str:
    netlify = sum(1 for d in deployments if d["platform"] == "Netlify")
    vercel = sum(1 for d in deployments if d["platform"] == "Vercel")
    live = sum(1 for d in deployments if d.get("status") != "offline")
    items = "\n".join(
        f'    <li><a href="{e(d["url"])}" target="_blank" rel="noopener nofollow">'
        f'{e(d["name"])} &mdash; {e(d["description"])} ({e(d["platform"])})</a></li>'
        for d in deployments
    )
    cards = "\n            ".join(card(d) for d in deployments)
    jsonld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Deployed web apps by Sai Karun Nandipati",
        "numberOfItems": len(deployments),
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "SoftwareApplication",
                    "name": d["name"],
                    "description": d["description"],
                    "url": d["url"],
                    "applicationCategory": "WebApplication",
                    "operatingSystem": "Web",
                },
            }
            for i, d in enumerate(deployments)
        ],
    }
    return f"""{START}
    <!-- DEPLOYED APPS: static HTML on purpose — written by tools/sync-deployments.py
         from tools/deployments.json. Edit the JSON, not this markup. -->
    <section id="deployed-apps" class="py-16 relative">
        <div class="container relative z-10 px-4">
            <h2 class="text-3xl font-display tracking-wider mb-4">DEPLOYED <span class="text-gold">WEB APPS</span></h2>
            <p class="text-gray-400 max-w-3xl leading-relaxed mb-8">
                <strong class="text-white">{len(deployments)}</strong> tracked website deployments by
                Sai Karun Nandipati &mdash; <strong class="text-white">{live}</strong> were
                verified online on {e(verified_on)} ({netlify} on Netlify, {vercel} on Vercel): AI assistants,
                study tools, prompt libraries, research workspaces and student resources.
            </p>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {cards}
            </div>
            <details class="glass-panel border border-white/5 p-6">
                <summary class="font-mono text-[11px] tracking-widest text-accent-primary cursor-pointer">PLAIN-TEXT INDEX ({len(deployments)} APPS &mdash; FOR AI ASSISTANTS)</summary>
                <ul class="mt-4 space-y-2 text-sm text-gray-400 leading-relaxed list-disc pl-5">
{items}
                </ul>
            </details>
            <script type="application/ld+json">
{json.dumps(jsonld, indent=2)}
            </script>
        </div>
    </section>
{END}"""


def apply(text: str, markup: str, anchor: str) -> str:
    if START in text and END in text:
        head, _, rest = text.partition(START)
        _, _, tail = rest.partition(END)
        return head + markup + tail
    if anchor not in text:
        raise SystemExit(f"anchor not found: {anchor!r}")
    idx = text.index(anchor)
    return text[:idx] + markup + "\n    " + text[idx:]


def main() -> None:
    check = "--check" in sys.argv[1:]
    data = json.loads(DATA.read_text())
    deployments = data["deployments"]
    markup = block(deployments, data["synced"])
    stale = []
    for rel, anchor in TARGETS:
        path = ROOT / rel
        original = path.read_text()
        updated = apply(original, markup, anchor)
        if updated != original:
            stale.append(rel)
            if not check:
                path.write_text(updated)
    print(f"deployments.json: {len(deployments)} apps "
          f"({sum(1 for d in deployments if d['platform'] == 'Netlify')} Netlify, "
          f"{sum(1 for d in deployments if d['platform'] == 'Vercel')} Vercel)")
    if check:
        if stale:
            print("stale: " + ", ".join(stale))
            sys.exit(1)
        print("check mode: pages are up to date")
    else:
        for rel in stale:
            print(f"  wrote deployments block -> {rel}")
        if not stale:
            print("  nothing to do (already up to date)")


if __name__ == "__main__":
    main()
