/* ==========================================================================
   SEO-Optimiser — browser-only SEO flaw detection tool.
   Fetches a URL through a public CORS proxy (a browser cannot read a
   cross-origin page directly) and reports metadata, sitemap, robots.txt,
   content-quality and per-engine defects. No backend, no storage, no account.

   Loaded on demand from the SEO/AEO page; the markup below is inert without it.
   ========================================================================== */

(function () {
    'use strict';

    const el = (id) => document.getElementById(id);
    const root = el('seo-tool');
    if (!root) return;

    const urlInput = el('seo-url');
    const analyzeBtn = el('seo-analyze');
    const statusArea = el('seo-status');
    const reportContainer = el('seo-report');
    const reportContent = el('seo-report-content');
    const scoreDisplay = el('seo-score');
    const scoreSummary = el('seo-score-summary');
    const initialMessage = el('seo-hint');
    const exportToolbar = el('seo-export');

    let lastAnalysis = null;

    const ENGINES = ['Google', 'Bing', 'Yahoo', 'DuckDuckGo', 'Baidu', 'Yandex'];

    // ---------------------------------------------------------------- helpers

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"]/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
        })[m]);
    }

    function normaliseUrl(input) {
        let text = String(input || '').trim();
        if (!text) return null;
        if (!/^https?:\/\//i.test(text)) text = 'https://' + text;
        try {
            return new URL(text).href;
        } catch {
            return null;
        }
    }

    function setStatus(html, modifier) {
        statusArea.className = 'seo-tool__status' + (modifier ? ' seo-tool__status--' + modifier : '');
        statusArea.innerHTML = html;
    }

    // -------------------------------------------------------------- fetching

    // Three independent public proxies, tried in order. A browser is subject to
    // the target site's CORS policy, so a direct fetch usually fails.
    const PROXIES = [
        ['allorigins', (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`],
        ['corsproxy', (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`],
        ['codetabs', (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`]
    ];

    async function fetchViaProxy(url) {
        let lastError;
        for (let i = 0; i < PROXIES.length; i++) {
            const [name, build] = PROXIES[i];
            try {
                setStatus('<span class="seo-tool__spinner" aria-hidden="true"></span> Proxy ' +
                    (i + 1) + '/' + PROXIES.length + ' (' + name + ')…');
                const res = await fetch(build(url), { signal: AbortSignal.timeout(15000) });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return await res.text();
            } catch (err) {
                lastError = err;
            }
        }
        throw new Error('All ' + PROXIES.length + ' proxies failed. ' +
            (lastError ? lastError.message : ''));
    }

    async function inspectSitemapAndRobots(baseUrl) {
        const out = { sitemapFound: false, sitemapUrl: '', robotsFound: false };
        try {
            const robotsText = await fetchViaProxy(baseUrl + '/robots.txt');
            out.robotsFound = true;
            const match = robotsText.match(/Sitemap:\s*(\S+)/i);
            if (match) {
                out.sitemapFound = true;
                out.sitemapUrl = match[1].trim();
            }
        } catch {
            // A missing or unreachable robots.txt is a finding, not a failure.
        }

        if (!out.sitemapFound) {
            try {
                const candidate = baseUrl + '/sitemap.xml';
                await fetchViaProxy(candidate);
                out.sitemapFound = true;
                out.sitemapUrl = candidate;
            } catch {
                // Reported as a flaw below.
            }
        }
        return out;
    }

    // -------------------------------------------------------------- analysis

    function extractMetadata(html, url) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const meta = (name, attr) =>
            (doc.querySelector(`meta[${attr || 'name'}="${name}"]`) || {}).content || '';

        const bodyText = ((doc.body && doc.body.textContent) || '').replace(/\s+/g, ' ').trim();
        const origin = new URL(url).origin;
        const links = Array.from(doc.querySelectorAll('a[href]'));

        let internal = 0;
        let external = 0;
        let dead = 0;
        links.forEach((a) => {
            const href = a.getAttribute('href') || '';
            if (!href || href === '#' || /^javascript:/i.test(href)) {
                dead++;
                return;
            }
            try {
                if (new URL(a.href, url).origin === origin) internal++;
                else external++;
            } catch {
                dead++;
            }
        });

        const h1 = Array.from(doc.querySelectorAll('h1'))
            .map((h) => h.textContent.trim())
            .filter(Boolean);

        return {
            title: (doc.querySelector('title') || {}).textContent?.trim() || '',
            description: meta('description'),
            keywords: meta('keywords'),
            robots: meta('robots'),
            viewport: meta('viewport'),
            canonical: (doc.querySelector('link[rel="canonical"]') || {}).href || '',
            ogTitle: meta('og:title', 'property'),
            ogDescription: meta('og:description', 'property'),
            twitterCard: meta('twitter:card', 'name'),
            lang: doc.documentElement.lang || '',
            h1,
            h2Count: doc.querySelectorAll('h2').length,
            imagesWithoutAlt: Array.from(doc.querySelectorAll('img'))
                .filter((i) => !(i.getAttribute('alt') || '').trim()).length,
            totalImages: doc.querySelectorAll('img').length,
            wordCount: bodyText.split(/\s+/).filter((w) => w.length > 1).length,
            internalLinks: internal,
            externalLinks: external,
            deadLinks: dead,
            textToHtmlRatio: html.length
                ? Math.round((bodyText.length / html.length) * 100)
                : 0
        };
    }

    function contentFlaws(m) {
        const flaws = [];
        if (m.wordCount < 300) flaws.push({ severity: 'high', detail: 'Thin content: under 300 words. Search engines prefer substantial pages.' });
        if (m.wordCount < 600) flaws.push({ severity: 'medium', detail: 'Under 600 words — consider expanding for stronger topical coverage.' });
        if (m.textToHtmlRatio < 10) flaws.push({ severity: 'medium', detail: `Low text-to-HTML ratio (${m.textToHtmlRatio}%). Heavy markup relative to content.` });
        if (m.deadLinks > 5) flaws.push({ severity: 'high', detail: `${m.deadLinks} placeholder links (href="#" or javascript:).` });
        if (m.internalLinks < 5) flaws.push({ severity: 'medium', detail: 'Fewer than 5 internal links — weak crawl paths between pages.' });
        if (!m.h1.length) flaws.push({ severity: 'high', detail: 'No <h1>. The page has no declared top-level heading.' });
        if (m.h1.length > 1) flaws.push({ severity: 'medium', detail: `${m.h1.length} <h1> elements. One per page is the convention.` });
        if (m.imagesWithoutAlt > 0) flaws.push({ severity: 'medium', detail: `${m.imagesWithoutAlt} images without alt text — accessibility and image-search loss.` });
        return flaws;
    }

    function scorePage(m, crawl, flaws) {
        let score = 100;
        const checks = [];
        const add = (aspect, status, message, penalty) => {
            checks.push({ aspect, status, message });
            score -= penalty || 0;
        };

        if (!m.title || m.title.length < 10) add('Title', 'fail', 'Missing or under 10 characters', 15);
        else if (m.title.length > 60) add('Title', 'warn', m.title.length + ' characters — likely truncated', 8);
        else add('Title', 'pass', 'Optimal length', 0);

        if (!m.description) add('Meta description', 'fail', 'Missing', 18);
        else if (m.description.length < 50 || m.description.length > 160) add('Meta description', 'warn', m.description.length + ' characters — outside 50-160', 10);
        else add('Meta description', 'pass', 'Good length', 0);

        if (!/width=device-width/.test(m.viewport || '')) add('Viewport', 'fail', 'Not responsive', 12);
        else add('Viewport', 'pass', 'Responsive', 0);

        if (!m.canonical) add('Canonical', 'warn', 'Missing', 8);
        else add('Canonical', 'pass', 'Present', 0);

        if (!m.h1.length) add('H1', 'fail', 'Missing', 12);
        else if (m.h1.length > 1) add('H1', 'warn', m.h1.length + ' found', 7);
        else add('H1', 'pass', 'Single', 0);

        add('Sitemap', crawl.sitemapFound ? 'pass' : 'fail',
            crawl.sitemapFound ? 'Found' : 'Not found', crawl.sitemapFound ? 0 : 15);
        add('Robots.txt', crawl.robotsFound ? 'pass' : 'warn',
            crawl.robotsFound ? 'Present' : 'Missing', crawl.robotsFound ? 0 : 6);

        if (flaws.some((f) => f.severity === 'high')) score -= 12;
        if (flaws.some((f) => f.severity === 'medium')) score -= 8;

        return { score: Math.max(0, Math.min(100, Math.round(score))), checks };
    }

    function engineReadiness(m) {
        return ENGINES.map((name) => {
            const notes = [];
            if (!m.title || m.title.length < 10) notes.push('Title missing or short');
            if (!m.description) notes.push('Meta description missing');
            if (name === 'Baidu' && !m.keywords) notes.push('Keywords meta carries more weight for Baidu');
            if (name === 'DuckDuckGo' && !m.ogTitle) notes.push('Open Graph tags improve preview');
            return { name, notes, ready: notes.length === 0 };
        });
    }

    // --------------------------------------------------------------- render

    function render(data) {
        const { metadata: m, score, checks, crawl, flaws, engines, url } = data;

        scoreDisplay.textContent = score.score;
        scoreDisplay.style.color = score.score >= 80 ? '#0f766e' : score.score >= 50 ? '#b45309' : '#b91c1c';
        const verdict = score.score >= 80 ? 'Strong foundation'
            : score.score >= 50 ? 'Needs work' : 'Critical issues';
        scoreSummary.innerHTML = '<strong>Score ' + score.score + '/100</strong><br>' + esc(verdict);

        let html = '';

        html += '<div class="seo-tool__card"><h4>Metadata</h4><table class="seo-tool__table">' +
            '<tr><td>URL</td><td>' + esc(url) + '</td></tr>' +
            '<tr><td>Title</td><td>' + (esc(m.title) || '&mdash;') + '</td></tr>' +
            '<tr><td>Description</td><td>' + (esc(m.description) || '&mdash;') + '</td></tr>' +
            '<tr><td>Canonical</td><td>' + (esc(m.canonical) || '&mdash;') + '</td></tr>' +
            '<tr><td>Language</td><td>' + (esc(m.lang) || '&mdash;') + '</td></tr>' +
            '<tr><td>Word count</td><td>' + m.wordCount + '</td></tr>' +
            '<tr><td>Text / HTML</td><td>' + m.textToHtmlRatio + '%</td></tr>' +
            '<tr><td>Internal links</td><td>' + m.internalLinks + '</td></tr>' +
            '<tr><td>External links</td><td>' + m.externalLinks + '</td></tr>' +
            '<tr><td>Placeholder links</td><td>' + m.deadLinks + '</td></tr>' +
            '<tr><td>Images missing alt</td><td>' + m.imagesWithoutAlt + ' of ' + m.totalImages + '</td></tr>' +
            '</table></div>';

        html += '<div class="seo-tool__card"><h4>Sitemap &amp; crawling</h4>' +
            '<p>Sitemap: ' + (crawl.sitemapFound
                ? '<span class="seo-tool__pass">found</span> at ' + esc(crawl.sitemapUrl)
                : '<span class="seo-tool__fail">not found</span>') + '</p>' +
            '<p>robots.txt: ' + (crawl.robotsFound
                ? '<span class="seo-tool__pass">present</span>'
                : '<span class="seo-tool__warn">missing</span>') + '</p>' +
            (crawl.sitemapFound ? '' : '<div class="seo-tool__flaw">Fix: publish a sitemap.xml and reference it from robots.txt.</div>') +
            (crawl.robotsFound ? '' : '<div class="seo-tool__flaw">Fix: add robots.txt so crawlers have crawl directions.</div>') +
            '</div>';

        html += '<div class="seo-tool__card"><h4>Content quality</h4>';
        if (!flaws.length) {
            html += '<p class="seo-tool__pass">No content defects detected.</p>';
        } else {
            flaws.forEach((f) => {
                html += '<div class="seo-tool__flaw"><strong>' +
                    (f.severity === 'high' ? 'High: ' : 'Medium: ') + '</strong>' +
                    esc(f.detail) + '</div>';
            });
        }
        html += '</div>';

        html += '<div class="seo-tool__card"><h4>Search engine readiness</h4><div class="seo-tool__engines">';
        engines.forEach((e) => {
            html += '<div class="seo-tool__engine"><strong>' + (e.ready ? '&#10003; ' : '&#9888; ') +
                esc(e.name) + '</strong>';
            e.notes.forEach((n) => {
                html += '<span class="seo-tool__engine-note">' + esc(n) + '</span>';
            });
            html += '</div>';
        });
        html += '</div></div>';

        html += '<div class="seo-tool__card"><h4>Detailed checks</h4>';
        checks.forEach((c) => {
            const glyph = c.status === 'pass' ? '&#10003;' : c.status === 'fail' ? '&#10007;' : '&#9888;';
            const cls = c.status === 'pass' ? 'seo-tool__pass'
                : c.status === 'fail' ? 'seo-tool__fail' : 'seo-tool__warn';
            html += '<p class="' + cls + '">' + glyph + ' ' + esc(c.aspect) + ': ' +
                esc(c.message) + '</p>';
        });
        html += '</div>';

        reportContent.innerHTML = html;
        reportContainer.hidden = false;
        exportToolbar.hidden = false;
        if (initialMessage) initialMessage.hidden = true;
    }

    // ---------------------------------------------------------------- export

    function exportHtml() {
        if (!lastAnalysis) return;
        const { metadata: m, score, crawl, flaws, engines, url } = lastAnalysis;
        const doc = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
            '<title>SEO report — ' + esc(url) + '</title>' +
            '<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:2rem;line-height:1.6}' +
            'h1{font-size:1.4rem}.score{font-size:2.5rem;font-weight:700}' +
            '.flaw{background:#fef9e7;border-left:4px solid #c49b2b;padding:.6rem;margin:.4rem 0}' +
            'table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #eee;padding:.4rem}</style>' +
            '</head><body>' +
            '<h1>SEO-Optimiser report</h1><p>' + esc(url) + '</p>' +
            '<p class="score">' + score.score + '/100</p>' +
            '<h2>Metadata</h2><table>' +
            '<tr><td>Title</td><td>' + esc(m.title) + '</td></tr>' +
            '<tr><td>Description</td><td>' + esc(m.description) + '</td></tr>' +
            '<tr><td>Words</td><td>' + m.wordCount + '</td></tr>' +
            '<tr><td>Images missing alt</td><td>' + m.imagesWithoutAlt + '</td></tr>' +
            '</table>' +
            '<h2>Crawling</h2><p>Sitemap: ' + (crawl.sitemapFound ? 'found' : 'missing') +
            ' — robots.txt: ' + (crawl.robotsFound ? 'present' : 'missing') + '</p>' +
            '<h2>Content flaws</h2>' +
            (flaws.length
                ? flaws.map((f) => '<div class="flaw">' + esc(f.detail) + '</div>').join('')
                : '<p>None detected.</p>') +
            '<h2>Engines</h2><ul>' +
            engines.map((e) => '<li>' + esc(e.name) + ': ' + (e.ready ? 'ready' : esc(e.notes.join('; '))) + '</li>').join('') +
            '</ul></body></html>';

        const url2 = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
        const a = document.createElement('a');
        a.href = url2;
        a.download = 'seo-optimiser-report.html';
        a.click();
        URL.revokeObjectURL(url2);
    }

    function exportPdf() {
        if (!lastAnalysis) return;
        // html2pdf is optional: the page loads it from a CDN, and if that fails
        // the HTML export still works. Say so rather than throwing.
        if (typeof html2pdf !== 'function') {
            setStatus('PDF export needs the html2pdf library, which did not load. Use Export HTML instead.', 'error');
            return;
        }
        html2pdf().set({
            margin: 0.5,
            filename: 'seo-optimiser-report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter' }
        }).from(reportContainer).save();
    }

    // ------------------------------------------------------------------ wire

    async function analyse() {
        const url = normaliseUrl(urlInput.value);
        if (!url) {
            setStatus('That does not look like a URL.', 'error');
            return;
        }

        analyzeBtn.disabled = true;
        setStatus('<span class="seo-tool__spinner" aria-hidden="true"></span> Analysing ' + esc(url) + '…');

        try {
            const base = new URL(url).origin;
            const [html, crawl] = await Promise.all([
                fetchViaProxy(url),
                inspectSitemapAndRobots(base)
            ]);
            const metadata = extractMetadata(html, url);
            const flaws = contentFlaws(metadata);
            const score = scorePage(metadata, crawl, flaws);
            const engines = engineReadiness(metadata);

            lastAnalysis = { metadata, score, crawl, flaws, engines, url };
            render(lastAnalysis);
            setStatus('Analysis complete.', 'ok');
        } catch (err) {
            reportContainer.hidden = true;
            exportToolbar.hidden = true;
            setStatus('Could not analyse: ' + err.message, 'error');
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    analyzeBtn.addEventListener('click', analyse);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyse();
        }
    });
    el('seo-export-html').addEventListener('click', exportHtml);
    el('seo-export-pdf').addEventListener('click', exportPdf);
})();
