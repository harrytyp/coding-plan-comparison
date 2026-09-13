# UI primitives

All shared UI lives as CSS classes in `public/index.html` and is rendered by `public/app.js`.
There is no component library (no React/Vue/Tailwind). Reproduce by reusing these classes.

## Class definitions (verbatim from index.html)
```css
.panel {
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 18px 20px; box-shadow: var(--shadow-sm);
}
.panel + .panel { margin-top: 16px; }
.panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.panel-head h2 { font-family: var(--font-display); font-size: 19px; margin: 0; font-weight: 700; }
.panel-head h3 { font-size: 16px; margin: 0; font-weight: 700; }
.panel-head p { margin: 2px 0 0; font-size: 13.5px; color: var(--text-muted); }
.grid-2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; align-items: start; }
@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

@media (max-width: 760px) {
  main { padding: 0 14px 24px; }
  .tabs { top: 52px; }
  .tab { padding: 9px 12px; font-size: 13.5px; }
  .panel { padding: 14px 14px; }
  .view > section, .view > .panel { padding-top: 16px; }
  /* Kompakter Kopf, damit der Chart früher ins Bild kommt */
  .app-header { padding: 12px 14px 2px; gap: 6px; }
  .app-header h1 { font-size: 19px; }
  .app-meta { font-size: 11.5px; gap: 10px; }
  #disclaimer { font-size: 12px; padding: 8px 10px; }
  .kpi { padding: 10px 11px; }
  .kpi .v { font-size: 23px; }
  .kpi-grid { gap: 8px; }
  .panel-head { padding: 12px 14px; }
  .panel-head h2, .panel-head h3 { font-size: 15.5px; }
  /* Controls einklappen: der Chart gehört auf Mobile zuerst ins Bild */
  .dash-controls.collapsed { display: none !important; }
  .dash-target-input { width: 84px; min-height: 40px; font-size: 15px; }
  .dash-ctl select { width: 100%; }
  .dash-ctl { width: 100%; justify-content: space-between; }
  .dash-note-row { flex-direction: column; align-items: flex-start; }
}
```

```css
.panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.panel-head h2 { font-family: var(--font-display); font-size: 19px; margin: 0; font-weight: 700; }
.panel-head h3 { font-size: 16px; margin: 0; font-weight: 700; }
.panel-head p { margin: 2px 0 0; font-size: 13.5px; color: var(--text-muted); }
.grid-2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; align-items: start; }
@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

@media (max-width: 760px) {
  main { padding: 0 14px 24px; }
  .tabs { top: 52px; }
  .tab { padding: 9px 12px; font-size: 13.5px; }
  .panel { padding: 14px 14px; }
  .view > section, .view > .panel { padding-top: 16px; }
  /* Kompakter Kopf, damit der Chart früher ins Bild kommt */
  .app-header { padding: 12px 14px 2px; gap: 6px; }
  .app-header h1 { font-size: 19px; }
  .app-meta { font-size: 11.5px; gap: 10px; }
  #disclaimer { font-size: 12px; padding: 8px 10px; }
  .kpi { padding: 10px 11px; }
  .kpi .v { font-size: 23px; }
  .kpi-grid { gap: 8px; }
  .panel-head { padding: 12px 14px; }
  .panel-head h2, .panel-head h3 { font-size: 15.5px; }
  /* Controls einklappen: der Chart gehört auf Mobile zuerst ins Bild */
  .dash-controls.collapsed { display: none !important; }
  .dash-target-input { width: 84px; min-height: 40px; font-size: 15px; }
  .dash-ctl select { width: 100%; }
  .dash-ctl { width: 100%; justify-content: space-between; }
  .dash-note-row { flex-direction: column; align-items: flex-start; }
}
```

```css
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.kpi {
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px;
}
.kpi .k { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.kpi .v { font-size: 24px; font-weight: 700; margin-top: 2px; letter-spacing: 0; }
.kpi .s { font-size: 12px; color: var(--text-faint); }

/* Panels: Dashboard-Karten statt Seiten-Sektionen */
.panel {
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 18px 20px; box-shadow: var(--shadow-sm);
}
```

```css
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.kpi {
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px;
}
```

```css
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 9px; border: 1px solid var(--border-strong);
  background: var(--bg-elev); color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all .15s ease; font-family: var(--font);
}
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { background: var(--primary-strong); color: #fff; }
.lang-switch { display: flex; border: 1px solid var(--border-strong); border-radius: 9px; overflow: hidden; }
.currency-select {
  padding: 7px 8px; border: 1px solid var(--border-strong); border-radius: 9px;
  background: var(--bg-elev); color: var(--text); font-size: 13px; font-weight: 600;
  font-family: var(--font); cursor: pointer;
}
```

```css
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); box-shadow: var(--shadow-sm); }
table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 720px; }
@media (max-width: 760px) {
  table { min-width: 0; } /* Tabelle darf auf Mobile schrumpfen (Karten-Layout) */
}
.table-toolbar {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  margin-bottom: 14px;
}
.table-note { margin-top: 10px; font-size: 13px; color: var(--text-faint); }
.score-bar {
  width: 60px; height: 4px; background: var(--bg-muted); border-radius: 2px; margin-top: 4px; overflow: hidden;
}
.tabs {
  position: sticky; top: 56px; z-index: 45;
  display: flex; gap: 6px; overflow-x: auto; padding: 10px 0 10px;
  background: color-mix(in oklab, var(--bg) 94%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  flex: 0 0 auto; padding: 8px 14px; border-radius: 8px; border: 1px solid transparent;
  background: none; color: var(--text-muted); font-family: var(--font);
  font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.tab:hover { background: var(--bg-muted); color: var(--text); }
.tab.active { background: var(--bg-elev); border-color: var(--border-strong); color: var(--text); box-shadow: var(--shadow-sm); }
.view { display: none; }
.view.active { display: block; }
.view > section, .view > .panel { margin: 0; padding: 24px 0 0; max-width: none; }

/* KPI-Kacheln: kompakt, immer im Blick */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.kpi {
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px;
}
```

```css
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; white-space: nowrap;
}
.badge-green { background: var(--success-soft); color: var(--success); }
.badge-blue { background: var(--info-soft); color: var(--info); }
.badge-gray { background: var(--bg-muted); color: var(--text-muted); }
.badge-amber { background: var(--warn-soft); color: var(--warn); }
.badge-red { background: var(--danger-soft); color: var(--danger); }

/* ============ TABLES ============ */
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); box-shadow: var(--shadow-sm); }
table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 720px; }
@media (max-width: 760px) {
  table { min-width: 0; } /* Tabelle darf auf Mobile schrumpfen (Karten-Layout) */
}
```

```css
.sortable-table th { cursor: pointer; user-select: none; }
.sortable-table th:hover { color: var(--primary); }
.sortable-table th .sort-ind {
  display: inline-block; margin-left: 5px; color: var(--text-faint); font-size: 11px;
}
.sortable-table th.sorted .sort-ind { color: var(--primary); font-weight: 800; }
th[data-sort].sorted { color: var(--primary); }

/* Mobile: Tabelle wird zu Karten (kein horizontales Scrollen) */
@media (max-width: 760px) {
  /* Filter-Bar: zentraler Steuerpunkt auf Mobile */
  .filter-bar {
    position: sticky; top: 56px; z-index: 40;
    background: color-mix(in oklab, var(--bg) 92%, transparent);
    backdrop-filter: blur(8px);
    padding: 8px 2px; margin: 0 0 10px; border-radius: 12px;
    gap: 8px;
  }
  .filter-toggle {
    padding: 12px 18px; font-size: 15px; border-radius: 12px;
    width: 100%; justify-content: center;
  }
  .filter-active { width: 100%; justify-content: flex-start; padding: 0 4px; }
  .filter-active .chip { padding: 6px 12px; font-size: 12.5px; }
  /* Sticky-Toolbar (Desktop-Filter) auf Mobile NICHT mehr zeigen (Sheet ersetzt) */
  .table-toolbar {
    display: none !important;
  }
  .toolbar-search { width: 100%; grid-column: 1 / -1; font-size: 16px; padding: 12px 14px; box-sizing: border-box; min-width: 0; } /* 16px verhindert iOS-Zoom */
  .toolbar-select { width: 100%; font-size: 15px; padding: 11px 10px; min-width: 0; }
  .budget-filter, .ai-filter { padding: 6px 10px; min-width: 0; }
  .budget-filter input[type=range], .ai-filter input[type=range] { flex: 1; width: auto; height: 28px; min-width: 0; }
  .privacy-filter { grid-column: 1 / -1; justify-content: center; padding: 12px; font-size: 14px; width: 100%; box-sizing: border-box; }
  .toolbar-count { grid-column: 1 / -1; text-align: center; margin-left: 0; }

  .table-wrap { border: none; background: none; box-shadow: none; }
  .sortable-table, .sortable-table thead, .sortable-table tbody, .sortable-table tr, .sortable-table td {
    display: block; width: 100%;
  }
  .sortable-table thead { display: none; }
  /* Mobile: Sortier-Leiste bleibt sichtbar (kompakt, kein Verstecken mehr) */
  .sort-bar { margin-bottom: 10px; }
  .sortable-table tbody tr {
    background: var(--bg-elev); border: 1px solid var(--border); border-radius: 16px;
    padding: 12px 16px; margin-bottom: 12px; box-shadow: var(--shadow-sm);
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .sortable-table tbody tr:active { transform: scale(.985); }
  .sortable-table tbody tr:hover { background: var(--bg-elev); }
  .sortable-table td {
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
    padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 14px; text-align: right;
  }
  .sortable-table td:last-child { border-bottom: none; }
  /* Plan+Modell als Kartenkopf: erste zwei Zellen ohne Label, prominent */
  .sortable-table td:first-child::before, .sortable-table td:nth-child(2)::before { display: none; }
  .sortable-table td:first-child { font-size: 15px; font-weight: 800; color: var(--text); padding-top: 4px; }
  .sortable-table td:nth-child(2) { font-size: 14px; font-weight: 600; }
  /* Label vor jedem Wert (data-label) */
  .sortable-table td::before {
    content: attr(data-label); display: block; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .04em; color: var(--text-faint); text-align: left;
  }
  /* Werte prominenter */
  .sortable-table td .num { font-size: 15px; font-weight: 700; }
  /* Hero kompakter */
  .hero { padding: 40px 18px 28px; }
  .hero h1 { font-size: 34px; }
  .hero-meta { gap: 10px; font-size: 12px; }
  /* Section-Padding kompakter */
  section { padding: 36px 18px; }
  /* Score-Bar größer (Touch) */
  .score-bar { width: 80px; height: 5px; }
}
```

```css
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elev); box-shadow: var(--shadow-sm); }
table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 720px; }
@media (max-width: 760px) {
  table { min-width: 0; } /* Tabelle darf auf Mobile schrumpfen (Karten-Layout) */
}
```

```css
.dash-controls {
  display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 14px;
}
```

```css
.dash-detail {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg-elev); padding: 16px; min-height: 200px;
}
.dash-detail-empty { color: var(--text-faint); font-size: 13.5px; text-align: center; padding: 40px 10px; }
.dash-detail-content .dd-name { font-size: 17px; font-weight: 800; margin: 0 0 2px; }
.dash-detail-content .dd-plan { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
.dash-detail-content .dd-row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 5px 0; border-bottom: 1px solid var(--border); }
.dash-detail-content .dd-row:last-child { border-bottom: none; }
.dash-detail-content .dd-row .k { color: var(--text-muted); }
.dash-detail-content .dd-row .v { font-weight: 700; }
.dash-detail-content .dd-badge { margin-top: 10px; }
@media (max-width: 760px) {
  .dash-plot { height: 360px; }
  .dash-legend { margin-left: 0; }
  .dash-body { grid-template-columns: 1fr; }
  .dash-detail { min-height: 0; }
  .dash-controls { gap: 10px; }
  .dash-ctl { font-size: 14px; }
  .dash-ctl select { padding: 10px 12px; font-size: 14px; min-height: 44px; }
}
```

```css
.more-row { display: flex; justify-content: center; padding: 14px 0 4px; }
.more-row .btn { min-width: 200px; }
/* Plot-Fehler sichtbar machen statt schwarzer Fläche */
.dash-plot { position: relative; }
.dash-error {
  position: absolute; inset: 8px; display: flex; align-items: flex-start;
  padding: 10px 12px; border-radius: 10px; font-size: 13px; line-height: 1.35;
  background: var(--danger-soft, #fee2e2); color: var(--danger, #b91c1c);
  border: 1px solid color-mix(in oklab, var(--danger, #b91c1c) 35%, transparent);
  overflow: auto; z-index: 5;
}
```

```css
.cl-row {
  display: flex; gap: 14px; align-items: baseline;
  background: var(--bg-elev); border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 10px 16px; font-size: 14.5px;
}
```

## Rendered markup examples (verbatim from app.js)

### KPI card
```html
<div class="kpi"><div class="k" data-i18n="stats.plans">Plans tracked</div><div class="v num" id="stat-plans">-</div><div class="s" id="stat-plans-sub"></div></div>
```

### Chart detail panel (`showDashDetail`)
```html
<div class="dash-detail"> ... plan name, provider, tokens per money, AI score, plan price, tokens per month ... </div>
```

### Table row (one row per plan+model combination)
```html
<tr><td class="cell-head">Plan name<span class="rank-tag">#3</span><div class="muted">provider</div></td><td class="cell-sub">model</td>...</tr>
```

### Chart
`<canvas id="dash-canvas">` drawn in 2D by `renderDashboardInner()` (log X axis, dots, Pareto line, target zone). SVG is not used.
