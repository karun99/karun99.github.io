# SEO and AEO operating process

This process keeps the portfolio discoverable and its public identity facts consistent. It does not treat crawler access, structured data, or an AI-readable file as a promise of rankings or citations.

## Before publishing a site change

1. **Check the page purpose.** Confirm one clear search intent, a useful title and description, one descriptive H1, and visible copy that answers the page's main question directly.
2. **Check technical signals.** Confirm the canonical URL, indexability directive, Open Graph and social metadata, descriptive image text, semantic headings, and working internal links. Keep redirects and utility pages out of the sitemap when they are `noindex`.
3. **Check answer consistency.** Make sure key identity, role, organization, publication, and project claims agree across visible copy, JSON-LD, `answers.html`, `llms.txt`, and generated `llms-full.txt`. Use only facts already supported by the site or a primary profile.
4. **Update discovery files.** Add only canonical, indexable pages to `sitemap.xml`; set `lastmod` to the actual meaningful page change date. Keep `robots.txt` rules intentional. Regenerate `llms-full.txt` from its source pages with `python3 tools/sync-llms.py`.
5. **Review query coverage.** Update `SEO-AEO-QUERY-MAP.md` when a page or topic changes. Use natural questions and avoid keyword lists or repetitive copy.
6. **Inspect the rendered result.** Check the changed page at desktop and mobile sizes, confirm links and images load, and ensure content is available without requiring client-side interaction.

## After publishing

1. Open the canonical URL and its `robots.txt`, `sitemap.xml`, `llms.txt`, and `llms-full.txt` on the public site. Confirm each returns the expected current content.
2. In Google Search Console, inspect URL indexing for the changed canonical page, submit the sitemap if needed, and review page indexing and performance queries after Google has recrawled it.
3. In Bing Webmaster Tools, inspect the URL and sitemap status, then review search query data after recrawl.
4. Record the date, changed URLs, observed crawl/index status, query or impression movement, and any follow-up in the site's SEO notes. Treat impressions and citations as measured outcomes, not implementation guarantees.

## Current handoff

- The repository contains the technical SEO and AEO foundations, the query map, and an on-page SEO-Optimiser in `answers.html`.
- `llms-full.txt` is generated from the nine canonical content pages. Run `python3 tools/sync-llms.py --check` to detect drift; regenerate it with `python3 tools/sync-llms.py` after page edits.
- Search Console and Bing Webmaster Tools measurements require the site owner's connected accounts. The repository alone cannot confirm current indexing, queries, impressions, or AI citations.
