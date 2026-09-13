# Layouts

Vanilla HTML in `public/index.html`; the app shell is static markup, views are toggled by `.view.active` from `app.js` (`showView`).

## App shell / top nav + app header
```html
<!-- ===== NAV ===== -->
<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="#" data-i18n-nav-brand>
      <svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b57d0"/><path d="M18 20h28v6H18zm0 10h28v6H18zm0 10h18v6H18z" fill="#fff"/></svg>
      <span class="brand-text" data-i18n="nav.brand">Coding Plan Compare</span>
    </a>
    <div class="nav-spacer"></div>
    <div class="nav-controls" id="nav-controls">
      <select id="currency-select" class="currency-select" aria-label="Currency">
        <option value="USD">USD $</option>
        <option value="EUR">EUR €</option>
        <option value="CNY">CNY ¥</option>
        <option value="GBP">GBP £</option>
        <option value="JPY">JPY ¥</option>
      </select>
      <button class="icon-btn" id="theme-toggle" aria-label="Toggle theme" title="Theme">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
      <div class="lang-switch">
        <button data-lang="en" class="active">EN</button>
        <button data-lang="de">DE</button>
      </div>
    </div>
  </div>
</nav>

<!-- ===== APP-HEADER (kompakt) ===== -->
<header class="app-header">
  <div class="app-title">
    <h1 data-i18n="hero.h1">AI coding subscriptions, compared</h1>
    <div class="app-meta">
      <span class="dot"><span class="live"></span> <span id="meta-sources" data-i18n="hero.sources">live sources</span></span>
      <span class="dot" id="meta-updated"></span>
      <span class="dot" data-i18n="hero.free">open data · no affiliate links</span>
    </div>
  </div>
  <div class="disclaimer" id="disclaimer" hidden>
    <strong id="disclaimer-title"></strong> <span id="disclaimer-text"></span>
  </div>
</header>

<main id="main">
  
```

## Tab bar (the only navigation)
```html
<!-- ===== EINE Navigation: Tab-Leiste ===== -->
  <nav class="tabs" id="tabs" role="tablist">
    <button class="tab active" type="button" role="tab" data-view="overview" data-i18n="tab.overview">Overview</button>
    <button class="tab" type="button" role="tab" data-view="plans" data-i18n="tab.plans">Plans</button>
    <button class="tab" type="button" role="tab" data-view="calc" data-i18n="tab.calc">Calculator</button>
    <button class="tab" type="button" role="tab" data-view="method" data-i18n="tab.method">Methodology</button>
    <button class="tab" type="button" role="tab" data-view="changelog" data-i18n="tab.changelog">Changelog</button>
  </nav>

  
```

## Footer
```html
<!-- ===== FOOTER (schlank, ein Block) ===== -->
<footer>
  <div class="footer-inner">
    <div class="footer-row">
      <span data-i18n="foot.rights">© 2026 Coding Plan Compare · MIT license</span>
      <span class="footer-links">
        <a href="data/latest.json" target="_blank" data-i18n="foot.json">latest.json (API)</a>
        <a href="https://github.com/harrytyp/coding-plan-comparison" target="_blank" data-i18n="foot.repo">GitHub</a>
        <a href="https://github.com/harrytyp/coding-plan-comparison/blob/main/sources.yml" target="_blank" data-i18n="foot.sources">sources.yml</a>
        <a href="https://llm-stats.com" target="_blank" data-i18n="foot.llmstats">AI scores: llm-stats.com</a>
        <button class="linklike" id="open-legal" type="button" data-i18n="foot.legalTitle">Legal</button>
      </span>
    </div>
  </div>
</footer>


```

## View wrapper pattern
Six siblings in `<main>`: `#view-overview`, `#view-plans`, `#view-calc`, `#view-changelog`, `#view-method`, `#view-legal`.
Only one carries `.active` (`display: block`); the rest are `display: none`. Sections inside use `.panel` with `.panel-head`.

```css
.view { display: none; }
.view.active { display: block; }
.panel { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 14px; ... }
```
