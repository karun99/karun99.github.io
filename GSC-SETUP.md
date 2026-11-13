# Search Console verification & indexing — karun99.github.io

**Goal:** get `https://karun99.github.io/` verified in Google, sitemap accepted, and
the key pages crawled. On-page SEO is already implemented (see
`SEO-AEO-CONFIG.md`); this is the remaining owner-side step.

> **"Google Cloud Console" is a different product.** `console.cloud.google.com`
> manages servers, APIs and billing — it has no button that ranks a website.
> Ranking signals are collected in **Google Search Console**
> (`search.google.com/search-console`). Cloud Console only matters if you later
> want to call the PageSpeed Insights or Search Console APIs programmatically
> (section 6).

---

## 1. Why the usual first step cannot be used here

Search Console offers two property types:

| Type | Proof required | Works for `*.github.io`? |
|------|----------------|--------------------------|
| **Domain** | DNS `TXT` record | **No** — you do not control the `github.io` DNS zone |
| **URL prefix** | HTML file, HTML meta tag, or Google Analytics/Tag Manager | **Yes** |

So the correct choice is **URL-prefix**, verified with an **HTML tag**.

---

## 2. Add the property

1. Open <https://search.google.com/search-console> with the Google account you
   want to own the data (any Gmail account works; it does not need to be the
   GitHub account).
2. **Add property** → choose **URL prefix** (right-hand box).
3. Enter exactly, including the trailing slash:

   ```
   https://karun99.github.io/
   ```

4. Expand **HTML tag**. Copy the full tag, e.g.

   ```html
   <meta name="google-site-verification" content="AbC123...xyz" />
   ```

   You only need the `content="..."` value.

---

## 3. Install the proof in the repo

From the site repository root:

```bash
python3 tools/gsc-verify.py --token "AbC123...xyz"
```

That inserts the meta tag into `index.html` (use `--all` to put it on every
page). Then publish it:

```bash
git add index.html tools/gsc-verify.py
git commit -m "seo: add Google Search Console verification meta tag"
git push origin main
```

Wait for the GitHub Pages build (1–2 minutes) and confirm the tag is actually
public **before** clicking Verify:

```bash
curl -s https://karun99.github.io/ | grep -o 'google-site-verification[^>]*'
```

If you prefer the HTML-file method instead, download the file Google gives you
and run:

```bash
python3 tools/gsc-verify.py --file ~/Downloads/google1a2b3c4d5e.html
```

then commit, push, and check
`https://karun99.github.io/google1a2b3c4d5e.html` returns 200.

Back in Search Console, click **Verify**. Verification stays valid as long as
the tag or file remains in the repo — do not remove it later.

Check the current state at any time:

```bash
python3 tools/gsc-verify.py --show
```

---

## 4. Submit the sitemap and request indexing

1. Left menu → **Sitemaps** → enter `sitemap.xml` → **Submit**.
   Status should become *Success* within a day. The sitemap lists exactly the
   9 indexable pages; `profile.html` and `seoreport.html` are deliberately
   `noindex` and excluded.
2. Left menu → **URL Inspection**. Paste one URL at a time and choose
   **Request indexing**:
   - `https://karun99.github.io/`
   - `https://karun99.github.io/answers.html`
   - `https://karun99.github.io/about.html`
   - `https://karun99.github.io/works.html`
   - `https://karun99.github.io/projects.html`

   There is a daily quota (roughly 10 URLs). Indexing is typically days to two
   weeks, not minutes.
3. **Settings → Crawl stats** later confirms Googlebot is fetching the site.

---

## 5. Bing / Copilot (same sitemap, two minutes)

Bing feeds Bing search, Copilot and several AI answer engines.

1. <https://www.bing.com/webmasters> → sign in → **Import from Google Search
   Console** (or add the site and use the same HTML-tag method; Microsoft's tag
   is separate, so add it as a second meta name).
2. Submit `https://karun99.github.io/sitemap.xml`.
3. Yandex and Seznam accept the same sitemap if you want wider coverage.

---

## 6. Optional: doing this from Google Cloud Console properly

If the intent was to automate reporting rather than verify ownership, the
legitimate Cloud Console path is:

1. Create/select a Google Cloud project.
2. **APIs & Services → Library** → enable **Google Search Console API**
   (and **PageSpeed Insights API** if you want Core Web Vitals data).
3. **IAM → Service accounts** → create one → download a JSON key → store it
   outside the repo (never commit it; this repo is public).
4. In Search Console, add the service-account email as a **user** of the
   property (Settings → Users and permissions → Full or Restricted).
5. Query it, e.g.:

   ```bash
   pip install google-api-python-client google-auth
   ```

   ```python
   from google.oauth2 import service_account
   from googleapiclient.discovery import build

   creds = service_account.Credentials.from_service_account_file(
       "/secure/path/key.json",
       scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
   )
   sc = build("searchconsole", "v1", credentials=creds)
   print(sc.searchanalytics().query(
       siteUrl="https://karun99.github.io/",
       body={"startDate": "2026-01-01", "endDate": "2026-11-13",
             "dimensions": ["query"]},
   ).execute())
   ```

This gives automated *measurement*. It does not improve ranking by itself.

---

## 7. What is already fixed in the repo

- Canonicals, unique titles/descriptions, one `<h1>` per page, `index, follow`.
- `Person` + `WebSite` + `WebPage` JSON-LD with `sameAs` identity links
  (validated as parseable JSON).
- `robots.txt` explicitly allows Googlebot, Bingbot and the major AI crawlers.
- `sitemap.xml` lists only indexable pages, with `lastmod` matching the real
  file dates.
- `llms.txt` / `llms-full.txt` for answer engines.
- `tools/audit.py` now resolves links inside subdirectories, so
  `assets/skills/*.md` is no longer reported as dead.

## 8. Do not

- Do not add a **Domain** property for `github.io` — it will never verify.
- Do not mark a page `noindex` while it is listed in `sitemap.xml`.
- Do not commit API keys, service-account JSON, or `.env` files.

## 9. Expected timeline (realistic)

| When | What |
|------|------|
| Day 0 | Verified, sitemap submitted, 2–3 URLs requested |
| Day 1–3 | Sitemap status *Success*; first crawl of submitted URLs |
| Week 1–2 | Pages appear in `site:karun99.github.io`; impressions start in Performance |
| Week 2–8 | Ranking for the exact name query stabilises; brand/entity queries move first |

Search Console can confirm indexing and impressions. It cannot force a position.
