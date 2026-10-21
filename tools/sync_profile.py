#!/usr/bin/env python3
"""Generate static employment and skill summaries from tools/profile.json."""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROFILE = ROOT / "tools" / "profile.json"


def load_profile(path: Path = PROFILE) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("roles") or not data.get("technical_dna"):
        raise ValueError("profile.json must define current roles and technical_dna categories")
    for role in data["roles"]:
        if not role.get("title") or not role.get("organization"):
            raise ValueError("each current role must have a title and organization")
    for category in data["technical_dna"]:
        if not all(category.get(key) for key in ("key", "label", "description", "skills")):
            raise ValueError("each Technical DNA category needs a key, label, description, and skills")
    return data


def e(value: str) -> str:
    return html.escape(value, quote=True)


def render_current_roles(profile: dict) -> str:
    cards = []
    for role in profile["roles"]:
        department = (
            f'<p class="profile-role-card__department">{e(role["department"])}</p>'
            if role.get("department")
            else ""
        )
        responsibilities = ""
        if role.get("responsibilities"):
            items = "".join(f"<li>{e(item)}</li>" for item in role["responsibilities"])
            responsibilities = f'<ul class="profile-role-card__responsibilities">{items}</ul>'
        cards.append(
            '<article class="profile-role-card">'
            f'<h3><span class="profile-role-card__title">{e(role["title"])}</span>'
            f'<span class="profile-role-card__at"> at </span>{e(role["organization"])}</h3>'
            f"{department}{responsibilities}</article>"
        )
    return (
        '<section class="profile-current-work" aria-labelledby="profile-current-work-title">'
        '<div class="profile-current-work__heading">'
        '<p class="profile-eyebrow">Current roles</p>'
        '<h2 id="profile-current-work-title">Teaching, research &amp; writing</h2>'
        "</div>"
        f'<div class="profile-current-work__grid">{"".join(cards)}</div>'
        "</section>"
    )


def render_additional_roles(profile: dict) -> str:
    """Compact, crawlable summary for page author bios outside the full profile section."""
    roles = profile["roles"][1:]
    if not roles:
        return ""
    summaries = []
    for role in roles:
        article = "an" if role["title"][0].lower() in "aeiou" else "a"
        summary = f'{article} {e(role["title"])} at {e(role["organization"])}'
        if role.get("responsibilities"):
            responsibilities = ", ".join(e(item.lower()) for item in role["responsibilities"])
            summary += f"; responsibilities include {responsibilities}"
        summaries.append(summary)
    return "He also works as " + " and ".join(summaries) + "."


def render_technical_skills(profile: dict) -> str:
    cards = []
    for category in profile["technical_dna"]:
        color = f"#{int(category['color']):06x}"
        skills = "".join(f"<li>{e(skill)}</li>" for skill in category["skills"])
        cards.append(
            f'<section class="technical-skill-card" style="--skill-color:{color}" '
            f'aria-labelledby="skill-category-{e(category["key"])}">'
            f'<h4 id="skill-category-{e(category["key"])}">{e(category["label"])}</h4>'
            f'<p>{e(category["description"])}</p><ul>{skills}</ul></section>'
        )
    return (
        '<div class="technical-skills" id="technical-skills">'
        '<div class="technical-skills__heading">'
        '<h4>Skills at a glance</h4>'
        '<p>The skill categories below are available with or without the interactive visualization.</p>'
        "</div>"
        f'<div class="technical-skills__grid">{"".join(cards)}</div>'
        "</div>"
    )


def render_js_categories(profile: dict) -> str:
    categories = [
        {
            "key": category["key"],
            "label": category["label"].upper(),
            "color": int(category["color"]),
            "desc": category["description"],
            "skills": category["skills"],
        }
        for category in profile["technical_dna"]
    ]
    return "const SKILL_CATEGORIES = " + json.dumps(categories, ensure_ascii=False, indent=4) + ";"


def validate_profile_jsonld(profile: dict, root: Path = ROOT) -> None:
    expected = {role["organization"] for role in profile["roles"]}

    def walk(value):
        if isinstance(value, dict):
            types = value.get("@type", [])
            if isinstance(types, str):
                types = [types]
            if "Person" in types and "worksFor" in value:
                works_for = value.get("worksFor", [])
                if isinstance(works_for, dict):
                    works_for = [works_for]
                actual = {item.get("name") for item in works_for if isinstance(item, dict)}
                if not expected.issubset(actual):
                    raise ValueError(
                        f"{root}: Person JSON-LD worksFor must include {', '.join(sorted(expected))}"
                    )
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    for filename in ("index.html", "about.html", "answers.html"):
        path = root / filename
        for match in re.finditer(
            r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            path.read_text(encoding="utf-8"),
            flags=re.IGNORECASE | re.DOTALL,
        ):
            try:
                walk(json.loads(match.group(1)))
            except json.JSONDecodeError as error:
                raise ValueError(f"{path}: invalid JSON-LD: {error}") from error


def replace_region(source: str, name: str, rendered: str, path: Path) -> str:
    if path.suffix == ".js":
        start = f"/* {name}:start */"
        end = f"/* {name}:end */"
    else:
        start = f"<!-- {name}:start -->"
        end = f"<!-- {name}:end -->"
    if source.count(start) != 1 or source.count(end) != 1:
        raise ValueError(f"{path}: expected exactly one {name} marker pair")
    before, remainder = source.split(start, 1)
    _, after = remainder.split(end, 1)
    return f"{before}{start}\n{rendered}\n{end}{after}"


def sync(check: bool = False) -> int:
    profile = load_profile()
    generated = {
        ROOT / "index.html": {"profile-current-work": render_current_roles(profile)},
        ROOT / "about.html": {
            "profile-current-work": render_current_roles(profile),
            "technical-dna-list": render_technical_skills(profile),
        },
        ROOT / "assets" / "js" / "main.js": {
            "profile-skill-categories": render_js_categories(profile),
        },
    }
    aside_names = {
        "learner-resources.html", "contact.html", "services.html", "works.html",
        "projects.html", "prompts-and-mcp.html",
    }
    for filename in aside_names:
        path = ROOT / filename
        if path.exists():
            generated[path] = {"profile-additional-roles": render_additional_roles(profile)}
    stale = []
    for path, regions in generated.items():
        content = path.read_text(encoding="utf-8")
        if path.name in aside_names:
            content = re.sub(
                r"\s*<!-- profile-additional-roles:start -->.*?<!-- profile-additional-roles:end -->",
                "",
                content,
                flags=re.DOTALL,
            )
            anchor = '                <a href="/index.html"'
            if anchor not in content:
                raise ValueError(f"{path}: author summary link not found")
            content = content.replace(
                anchor,
                "<!-- profile-additional-roles:start -->\n<!-- profile-additional-roles:end -->\n" + anchor,
                1,
            )
        for name, rendered in regions.items():
            content = replace_region(content, name, rendered, path)
        if content != path.read_text(encoding="utf-8"):
            stale.append(path)
            if not check:
                path.write_text(content, encoding="utf-8")
    if stale and check:
        print("Generated profile content is out of date: " + ", ".join(str(p.relative_to(ROOT)) for p in stale))
        return 1
    if check:
        print("Generated profile content is up to date")
    else:
        print("Synchronized profile and Technical DNA content")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(sync(check="--check" in sys.argv))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(2)
