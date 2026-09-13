# Extractable components

## AppShell (top nav + tab bar + footer)
- Source: `public/index.html`
- Category: layout
- Description: brand + currency/theme/language controls, one horizontal tab bar, slim footer
- Extractable props: activeTab (string), currency (string), theme (light|dark), lang (en|de)

## TabBar
- Source: `public/index.html` (`.tabs`), logic `showView` in app.js
- Category: layout
- Description: single navigation for the six views
- Extractable props: activeView, items[]

## KpiCard
- Source: `public/index.html` (`.kpi`), filled by `renderStats()`
- Category: basic
- Description: label / big numeric value / caption
- Extractable props: label, value, caption

## Panel
- Source: `public/index.html` (`.panel`, `.panel-head`)
- Category: basic
- Description: bordered surface with heading, optional action button in the header
- Extractable props: title, subtitle, actionLabel

## DataTable
- Source: `.sortable-table` + `.table-wrap`, rendered by `renderPlans()` / `renderTop()` / `renderFamily()`
- Category: basic
- Description: sortable table with sticky header, numeric cells, mobile card reflow via `data-label`
- Extractable props: columns[], rows[], sortKey, sortDir

## PositioningChart
- Source: `renderDashboardInner()` (canvas 2D)
- Category: basic
- Description: log-X scatter of plan+model points, Pareto frontier line, target zone, click-to-detail
- Extractable props: xMetric, yMetric, showPareto, points[]

## Badge
- Source: `.badge`, `.rank-tag`, `.privacy-badges` in index.html
- Category: basic
- Description: small pill for data tier, privacy flags, calculator rank
- Extractable props: text, tone (neutral|info|warn)
