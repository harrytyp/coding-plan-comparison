# coding-plan-comparison — Projektregeln

## Ziel
Strukturierte, **dynamische** Vergleichsdatenbank für AI-Coding-Plan-Subscriptions
(Credit/Token-Pass, kein reines Token-PAYG). Reproduzierbar, aktualisierbar, keine
statischen Preise.

## Architektur (deterministisch)
```
sources.yml (feeds + docs + privacy + scores + FX)
   → scripts/fetch.mjs      HTTP-Fetch → cache/ + manifest.json (contentHash + changed)
   → scripts/parse-all.mjs  Parser → parsed/<id>.json
   → scripts/build.mjs      Plan-Katalog dynamisch + Normalisierung → public/data/latest.json
   → scripts/check.mjs      Change-Detection-Report (exit 2 = Änderung)
```

- **Nichts statisches:** Alle Daten kommen live aus offiziellen Quellen (Feeds + Docs).
- **Determinismus:** build nutzt NUR cache/ + parsed/ (nie Live-Fetch im Build).
  cache/ + parsed/ sind **nicht committed** (gitignored) — `npm run update` reproduziert sie.
- **Change-Detection:** contentHash = Hash des **geparsten** Inhalts (robust gegen HTML-Nonces).
- **Ehrlichkeit:** undisclosed bleibt undisclosed; keine erfundenen Zahlen.
  Nicht-scrapebares (GLM-Preise via Auth-API, MiniMax-SPA) → `data/overrides.yml` mit lastVerified.

## Normalisierung
```
Kosten pro Request = (0.05×input + 0.95×cachedWrite)×pattern.input
                   + cachedRead×pattern.cachedRead + output×pattern.output, /1M
```
- "60 für 10" ist nur $-Gegenwert; Grundcredits (Token-Preise) + Cache + Workload entscheiden.
- Anbietereigene Credit-Formeln (GLM) kommen dynamisch aus den Docs.
- Pattern-Unifizierung: geteilte Familien nutzen OC-Pattern für beide Provider.
- Tarif-Namen und Tier-Maps kommen aus der Quelle, nie hart kodieren: Qwen fügte einen
  Tarif ein, kimi.ai benannte seine Checkout-Titel um, beides ließ Tarife still aus dem
  Katalog fallen. Die Tests koppeln Parser-Output an den Katalog, damit das auffällt.
- Pläne ohne Preis ($0, werbefinanziert) haben keine Rate pro $: `normalizedPer1` bleibt null
  statt Infinity, sonst kippen Familien-Median und Pareto-Front. Ihre Zeilen sortieren am Ende.
- Fenster: 5h = Durchsatz (nicht ×180), Wochen ×4.33 → Monat.

## Befehle
```bash
npm run update   # fetch → parse → build
npm test         # Invarianz- + Parser-Tests
npm run check    # Change-Detection-Report
```

## Pages-Sync
Root `index.html`/`app.js`/`data/latest.json` sind byte-identische Kopien von `public/`
(Legacy-Pages serviert vom Root). `public/index.html` nutzt den `__VERSION__`-Platzhalter,
den die CI beim Sync durch den Commit-Hash ersetzt (Cache-Busting). Lokal nicht ersetzen.
Root-Mirrors committet die CI (`update.yml`), nicht von Hand.

## Workflow
`.github/workflows/update.yml`: täglich 03:17 UTC — fetch → parse → build → test → commit bei
Änderung → Review-Issue wenn SPA-Preise (GLM/MiniMax) sich ändern → overrides.yml manuell pflegen.

## Verifikation (vor Commit/Push)
1. `npm run update` (exit 0)
2. `npm test` grün
3. `node scripts/check.mjs` — keine unerwarteten Änderungen
4. Nach Push: Workflow-Lauf beobachten bis grün

## Verwandte Repos
- `harrytyp/free-llm-tracker` — LLM-Preis-Tracker (collector/benchmark, alle 6h) — nicht duplizieren,
  ggf. Messdaten teilen.
- `harrytyp/modelselector` — Modell-Auswahl-Daten.
