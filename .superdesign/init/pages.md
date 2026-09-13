# Page dependency trees

## / (single page, all views)
Entry: `public/index.html`
Dependencies:
- `public/app.js`
  - `public/data/latest.json` (fetched at runtime; offline fallback to `public/data/latest.json` cache)
  - i18n dictionaries `I18N.en` / `I18N.de` (in app.js)
  - render functions: renderStats, renderTop, renderPlans, renderDashboard(+Inner), renderFamily, renderCalculator, renderChangelog, renderFormula
  - interaction: initTabs/showView, initDashboard, initCalculator, initSheet, initBackToTop, initMethodMore, bindSortHeader, bindDashTooltip
- (generated) `public/data/latest.json` <- `scripts/build.mjs` <- `sources.yml`, `data/overrides.yml`, `cache/`
