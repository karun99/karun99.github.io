# SEO/AEO audit and remediation workflow

The algorithm and workflow used to audit and fix the SEO/AEO of
`https://karun99.github.io`, written so the next pass can repeat it. It records
the procedure and the reasoning, not a promise of rankings.

## Goal

Improve the chance that `karun99.github.io` appears in the first 10 results for
the query **"sai karun nandipati"** on major search engines, and that answer
engines (ChatGPT, Perplexity, Google AI Overviews, Claude) cite it when asked
"who is Sai Karun Nandipati".

Indexing and rankings cannot be guaranteed by any on-page change. This workflow
fixes the defects that suppress ranking and builds the entity signals that
support it; measurement happens in Search Console / Bing Webmaster Tools.

## Principle

A personal-name query is an **entity resolution** problem, not a keyword
problem. Search engines must decide that this site, the LinkedIn profile, the
Scholar profile, and the Vidwan record all describe the same person. Every
inconsistency (a wrong URL, a missing identifier) weakens that link. So the
workflow's core is: **find and unify every place the identity is stated.**

---

## Phase 1 — Establish ground truth

Do this before touching any code. Facts come from primary sources only.

1. **Fetch the live site as HTML.** Read the raw source, not the rendered page,
   so JavaScript-injected content is visible and its absence noted.
2. **Pull the technical discovery files:** `robots.txt`, `sitemap.xml`,
   `llms.txt`, `llms-full.txt`. Confirm each returns 200 and reflects current
   content.
3. **Establish the real search results.** Search the exact target query
   (`"sai karun nandipati"`) and record which properties rank, and which URL
   slug each uses. The top-ranked LinkedIn slug is ground truth for that
   identifier.
4. **Verify authoritative profiles directly.** Fetch each identity source:
   - Google Scholar (`qD-LRh4AAAAJ`) — confirms citation counts, current
     institution, verified email.
   - Vidwan/INFLIBNET (`394004`) — confirms role timeline, ORCID, publication
     counts.
   - LinkedIn — often blocks automated fetches (HTTP 999); fall back to the
     slug observed in live search results.
5. **Reconcile the timeline.** Compare every role/date claim on the site against
   the authoritative profiles. Note current vs. previous employers precisely
   (PB Siddhartha = current, KBN = previous).

**Exit condition:** a single canonical set of identifiers (LinkedIn slug,
Scholar ID, ORCID, Vidwan ID) and role facts, each backed by a primary source.

---

## Phase 2 — Locate every statement of identity

Grep the whole checkout for each canonical identifier. Count occurrences per
variant.

```
# one variant per line, with counts
grep -rho "linkedin.com/in/[a-zA-Z0-9-]*" --include=*.html --include=*.txt . \
  | sort | uniq -c | sort -rn
```

Then map *where* each variant appears:

```
grep -rln "<variant>" --include=*.html --include=*.txt .
```

Also enumerate which pages carry structured data, and of which type:

```
for f in index about answers works projects; do
  printf "%-20s " "$f.html"
  grep -o '"@type":\s*"[A-Za-z]*"' $f.html | sort -u | tr '\n' ' '; echo
done
```

**Defect classes this surfaces:**
- **Variant forks** — two URLs for one identity (the LinkedIn bug).
- **`sameAs` gaps** — authoritative profiles linked in the footer but missing
  from the JSON-LD that search engines actually parse for identity.
- **Coverage gaps** — profiles referenced nowhere (Vidwan).

**Exit condition:** a list of concrete defects, each with file paths and counts.

---

## Phase 3 — Fix, smallest-diff-first

Apply fixes in order of impact, keeping each edit minimal and reviewable.

1. **Unify the identity variant.** Use a pattern that matches only the wrong
   variant (the correct slug contains extra text, so it cannot be caught
   accidentally):

   ```
   grep -rl "sai-karun-5a96a8b9" --include=*.html --include=*.txt . \
     | while read f; do
         sed -i 's/sai-karun-5a96a8b9/sai-karun-nandipati-5a96a8b9/g' "$f"
       done
   ```

2. **Add missing authoritative profiles to Person `sameAs`** in every page that
   declares `Person` schema (index, about, answers). `sameAs` is the field that
   binds the site's entity to external records.

3. **Mirror the links into the visible footer and `llms.txt`**, so humans,
   crawlers, and answer engines see the same identity set.

4. **Regenerate `llms-full.txt`** from source pages:

   ```
   python3 tools/sync-llms.py
   ```

5. **Bump `lastmod`** in `sitemap.xml` for every page that actually changed.

**Rule:** never add a claim not already supported by a primary source. Never put
a `noindex` URL in the sitemap.

---

## Phase 4 — Verify before committing

Run these checks; every one must pass before the commit.

| Check | Expect |
| --- | --- |
| Wrong identity variant count | `0` |
| Correct identity variant count | `> 0` |
| Authoritative profiles present in `sameAs` | present on Person pages |
| All `<script type="application/ld+json">` blocks parse as JSON | 0 invalid |
| No malformed/merged HTML lines from scripted edits | `0` |
| `sitemap.xml` parses as XML | valid |
| `robots.txt` / `sitemap.xml` / `llms.txt` / `llms-full.txt` | HTTP 200 |

Validate JSON-LD programmatically:

```python
import re, json, glob
for fn in glob.glob("*.html"):
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>',
                         open(fn, encoding="utf-8").read(), re.S):
        json.loads(m.group(1))   # raises on invalid
```

**Caution:** when inserting lines with `sed`/`perl`, inspect the actual output.
Automated multi-step edits can merge or duplicate lines while the `grep -c`
count still looks correct — read the changed region directly to confirm.

**Exit condition:** all checks green, `git diff` reviewed and understood.

---

## Phase 5 — Publish and verify live

1. Confirm remote state is a fast-forward of local (no clobbering others' work):

   ```
   git ls-remote --heads origin main   # must equal your base commit
   ```

2. Commit with a message that states *what* changed and *why*:

   ```
   git add <changed files>
   git commit -m "SEO/AEO: unify LinkedIn identity, add Scholar + Vidwan to Person sameAs"
   ```

3. `git push origin main`. GitHub Pages rebuilds from `main`.

4. **Verify the public URLs, not just the repo.** After the rebuild, re-fetch
   and re-run the Phase 4 checks against the live site:

   ```
   curl -s https://karun99.github.io/ > /tmp/live.html
   # re-check identity variant, sameAs presence, JSON-LD validity
   ```

**Exit condition:** live HTML shows the corrected identity and valid JSON-LD;
discovery files all return 200.

---

## Phase 6 — Indexing (owner's accounts required)

The repository alone cannot confirm indexing, queries, or AI citations. These
steps need the site owner's connected accounts:

1. **Google Search Console** — verify property, submit `sitemap.xml`, use URL
   Inspection to request indexing of `/` and `answers.html`.
2. **Bing Webmaster Tools** — same, and it feeds Bing/AI search.
3. After recrawl, review the **Performance** report for the target query's
   impressions and position.
4. Record date, changed URLs, observed index status, and query movement in the
   site's SEO notes.

---

## Repetition cadence

- **Every content change:** run Phase 3 step 4 (regenerate `llms-full.txt`) and
  Phase 4 checks.
- **Monthly:** re-run Phase 1 steps 3–4 (search results + profile verification),
  because external profiles and rankings drift.
- **After external changes** (new job, new paper, new profile): update the
  canonical facts in `llms.txt`, JSON-LD, and visible copy together, so they
  never diverge.

## Out of scope / limitations

- No workflow can **guarantee** a top-10 ranking; rankings depend on
  competition, authority, and engine algorithms outside this site's control.
- Off-site signals (backlinks from Scholar, LinkedIn, Vidwan; consistent
  citations elsewhere) must grow alongside on-page work.
- LinkedIn blocks automated verification (HTTP 999); its slug is confirmed via
  observed live search results instead.
