# Views (client-side "routes")

Hash-routed in `public/app.js` (`VIEW_ALIASES` + `showView`); no server routing, single `index.html`.

| hash | view id | content |
|---|---|---|
| `#overview` | `view-overview` | KPI cards, positioning chart (canvas), "best value" table (6 rows) |
| `#plans` | `view-plans` | search/filter toolbar, sortable plan+model table (25 rows, "show more"), column picker, mobile filter sheet, family comparison table (12 rows) |
| `#calc` | `view-calc` | budget calculator: input + ranked plan list with monthly tokens and plan cap |
| `#changelog` | `view-changelog` | changelog entries from `data/changelog.yml` |
| `#method` | `view-method` | methodology steps (collapsible), formula block, FAQ accordion |
| `#legal` | `view-legal` | privacy, imprint, disclaimer |

Legacy anchors redirect: `#pareto`/`#stats` -> overview, `#models` -> plans, `#faq` -> method, `#privacy`/`#imprint`/`#disclaimer` -> legal.
