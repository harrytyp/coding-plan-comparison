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
- **Drei Rechenwege für Credit-Pläne** (`modelsForPlan`, `providerCost`):
  1. `perModel` mit Koeffizienten und `divisor` (Default 10000): Credits = (Tokens × Koeff.)/divisor.
     GLM nutzt 10000, MiMo 1 (Credits direkt pro Token).
  2. `creditsFromUsd` + `feedModels`: Anbieter veröffentlicht "1 $ Modellnutzung = N Credits"
     (StepFun: 7M). Credits pro Request = $-Kosten aus dem Feed × N.
  3. `allowance` in Tokens mit `window: "day"` (Cerebras): Tageslimit × 30.44 = Monat.
  Alle drei Wege brauchen keine geschätzten Zahlen, nur die veröffentlichten Werte.
- **Modelle ohne Feed-Preis** (nicht im ocgo/cc-Feed): Zeile entsteht trotzdem, `costPerRequest`
  bleibt null. `requestCost()` muss dafür null-sicher bleiben.
- Pattern-Unifizierung: geteilte Familien nutzen OC-Pattern für beide Provider.
- Tarif-Namen und Tier-Maps kommen aus der Quelle, nie hart kodieren: Qwen fügte einen
  Tarif ein, kimi.ai benannte seine Checkout-Titel um, beides ließ Tarife still aus dem
  Katalog fallen. Die Tests koppeln Parser-Output an den Katalog, damit das auffällt.
- Pläne ohne Preis ($0, werbefinanziert) haben keine Rate pro $: `normalizedPer1` bleibt null
  statt Infinity, sonst kippen Familien-Median und Pareto-Front. Ihre Zeilen sortieren am Ende.
- Fenster: 5h = Durchsatz (nicht ×180), Wochen ×4.33 → Monat.
- **Standard-Ausschlüsse (Website):** Tier D (preisbasiert, Kimi) und Pläne ohne API-Zugang
  (Tag `no API` / `CLI only` aus overrides.yml) sind in Tabelle, Chart und Rechner per Default
  ausgeblendet, per Schalter einblendbar. Ohne API-Zugang sind die Token-Raten nicht vergleichbar,
  deshalb steht der Ausschluss als sichtbarer Chip in der Filterzeile.
- **Zusätzlich in der Liste (`renderPlans`):** Modellzeilen mit `noTraining === false` (Modell
  trainiert auf den Daten) sind per Default ausgeblendet, Schalter `#training-toggle` /
  `#sheet-training`, Chip "training hidden (n)". `noTraining === null` (keine Aussage) bleibt
  sichtbar. Das Best-Value-Panel (`renderTop`) filtert härter und immer: nur `noTraining === true`
  und nur Pläne mit API-Zugang, unabhängig von den Schaltern.
- **Fixe Overlays gehören auf Body-Ebene.** `main` trägt `view-transition-name: main-content`
  und ist damit Containing Block für `position: fixed`: Sheet und Overlay lagen darin und
  öffneten auf dem Telefon unsichtbar unter dem Fold. Command-Palette, Toast und Sheet stehen
  deshalb hinter `</main>`.

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
Root-Mirrors committet die CI (`update.yml`), nicht von Hand. **Änderungen immer in `public/`
machen:** die Root-Kopien werden bei jedem CI-Lauf überschrieben, ein Edit dort ist nach dem
nächsten Push weg (und die Seite hat dann neues Markup ohne Logik).

**Vorschau:** `public/preview/index.html` spiegelt die CI nach `preview/` (erreichbar unter
`/preview/`). Sie lädt `../app.js`, `../data/latest.json` und `../fonts/` von der Hauptseite,
dupliziert also keine Assets, trägt `noindex` und eine Hinweisleiste. Quelle bleibt
`public/index.html`; die Vorschau ist eine eingefrorene Kopie für Design-Abnahmen.

- `node scripts/build-preview.mjs` erzeugt `public/preview/index.html` neu. **Nach jeder
  Änderung an `public/index.html` laufen lassen**, sonst zeigt die Vorschau altes Markup.
- Die Gestaltungsschicht ("Instrument Panel": Tokens, Typo, Layout, Tiefe, Zustände, Bewegung)
  steht **inline am Ende des `<style>`-Blocks und als `<script>` vor `</body>` in
  `public/index.html`**, damit die Einzeldatei-Architektur bleibt und der CI-Mirror nichts
  zusätzlich kopieren muss. `public/preview/preview.css` und `preview.js` waren die
  Vorschau-Fassung davon und werden nicht mehr geladen (können weg, sobald Kolja es freigibt).
- `app.js` bleibt der Renderer. Die Schicht darf app.js nicht patchen; Korrekturen an dessen
  Verhalten gehören in `public/app.js`.

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
