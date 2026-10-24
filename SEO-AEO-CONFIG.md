# SEO / AEO Configuration — karun99.github.io

**Last updated:** 2026-10-24  
**Site:** https://karun99.github.io  
**Primary target query:** "Sai Karun Nandipati" / "who is Sai Karun Nandipati"

---

## 1. Canonical Identity

| Field              | Value |
|--------------------|-------|
| Full name          | Sai Karun Nandipati |
| Also known as      | Sai Karun, Saikarun, Karun Nandipati, N.S. Sai Karun |
| Current role 1     | Assistant Professor, Department of Data Science & Artificial Intelligence, PB Siddhartha College of Arts and Science |
| Current role 2     | Content Writer, Yes&Yes Publications (content drafting, data writing, data accuracy) |
| Previous role      | Assistant Professor, KBN College (2023–2026) |
| ORCID              | 0009-0007-9218-9750 |
| Google Scholar     | https://scholar.google.com/citations?user=qD-LRh4AAAAJ |
| Vidwan ID          | 394004 |
| GitHub             | https://github.com/karun99 |
| LinkedIn           | https://www.linkedin.com/in/sai-karun-nandipati-5a96a8b9 |
| ResearchGate       | https://www.researchgate.net/profile/Sai-Karun-Nandipati |
| Email              | saikarun085@gmail.com |
| Official website   | https://karun99.github.io |

---

## 2. Required sameAs Array (use on every Person schema)

```json
"sameAs": [
  "https://orcid.org/0009-0007-9218-9750",
  "https://github.com/karun99",
  "https://www.linkedin.com/in/sai-karun-nandipati-5a96a8b9",
  "https://www.researchgate.net/profile/Sai-Karun-Nandipati",
  "https://scholar.google.com/citations?user=qD-LRh4AAAAJ",
  "https://vidwan.inflibnet.ac.in/profile/394004",
  "https://www.npmjs.com/package/@saikarun/s-ai"
]
```

---

## 3. Core Pages Priority

| Priority | URL | Purpose | lastmod frequency |
|----------|-----|---------|-------------------|
| 1.0 | / | Homepage / Identity | weekly |
| 0.9 | /answers.html | AEO hub + FAQ | monthly |
| 0.9 | /about.html | Full biography | monthly |
| 0.9 | /works.html | Publications | weekly |
| 0.9 | /projects.html | Open-source work | weekly |
| 0.8 | /services.html | Services | monthly |
| 0.8 | /learner-resources.html | Learning resources | monthly |
| 0.8 | /contact.html | Contact | monthly |

---

## 4. Indexing Checklist (Owner Action)

- [ ] Verify property in **Google Search Console**
- [ ] Submit `https://karun99.github.io/sitemap.xml`
- [ ] Request indexing for `/`, `/answers.html`, `/about.html`
- [ ] Verify property in **Bing Webmaster Tools**
- [ ] Submit the same sitemap to Bing
- [ ] Add https://karun99.github.io as Homepage / Website on:
  - [ ] Google Scholar
  - [ ] ORCID
  - [ ] Vidwan
  - [ ] ResearchGate
  - [ ] LinkedIn
  - [ ] Amazon Author page

---

## 5. Content Rules

- First paragraph of every major page must be a self-contained answer to “Who is Sai Karun Nandipati?”
- Keep book count consistent (currently “more than 30” / 31 on works page)
- Never mark a page as `noindex` if it is listed in sitemap.xml
- After any content change → run `python3 tools/sync-llms.py`

---

## 6. robots.txt Key Directives

- Explicitly allow: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CopilotBot, OAI-SearchBot, ChatGPT-User, anthropic-ai, etc.
- Sitemap: `https://karun99.github.io/sitemap.xml`

---

## 7. Maintenance Cadence

| Frequency | Action |
|-----------|--------|
| Every content change | Regenerate llms-full.txt + validate JSON-LD |
| Monthly | Re-check external profiles for consistency |
| After job/publication change | Update identity facts across site + external profiles together |

---

**File purpose:** Single source of truth for SEO/AEO decisions.  
Keep this file updated whenever identity facts or priorities change.
