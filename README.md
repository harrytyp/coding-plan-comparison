# coding-plan-compare

**Dynamische, reproduzierbare Vergleichsdatenbank für AI-Coding-Plan-Subscriptions**
(Credit/Token-Pass-Pläne — kein reines Token-PAYG).

> ⚡ **Nichts ist statisch.** Alle Daten kommen live aus offiziellen Quellen (Feeds + Docs),
> werden deterministisch gefetcht, geparst und gebaut. Ändert sich eine Quelle (Preise,
> Abrechnungsarten, Formeln), erkennt das System das per Change-Detection und aktualisiert.

## Architektur: Fetch → Parse → Build (deterministisch)

```
sources.yml          → Welche Endpoints, welche Parser
      │
      ▼
scripts/fetch.mjs    → HTTP-Fetch aller Quellen → cache/<id>.<ext> + cache/manifest.json
      │                (sha256 + contentHash + fetchedAt + changed-Flag)
      ▼
scripts/parse-all.mjs → Parser (HTML→strukturiert, JSON→normalisiert) → parsed/<id>.json
      │
      ▼
scripts/build.mjs    → Plan-Katalog dynamisch aus parsed/* + data/overrides.yml
      │                → Normalisierung (Token-Preise + Cache + Workload) → public/data/latest.json
      ▼
scripts/check.mjs    → Diff-Report: welche Quellen geändert (exit 2 = Änderung)
```

**Ein Befehl für alles:**
```bash
npm run update   # fetch → parse → build
npm test         # Invarianz-Tests (9)
npm run check    # Change-Detection-Report
```

**Determinismus:** build.mjs nutzt NUR `cache/` (Snapshots) + `parsed/`, nie Live-Fetch im Build.
Gleiche Snapshots → gleiches latest.json. Die Snapshots sind im Git committed (reproduzierbar).

**Change-Detection:** Jede Quelle hat `contentHash` (Hash des **geparsten** Inhalts, robust gegen
HTML-Nonces/Cache-Buster). `check.mjs` zeigt, was sich wirklich geändert hat (Preise, Formeln,
Abrechnungsarten) — nicht nur flüchtige HTML-Details.

## Quellen (sources.yml, alle live verifiziert 2026-08-28)

| Quelle | Typ | Liefert |
|---|---|---|
| `ocgo-pricing` | JSON-Feed | OpenCode Go: Token-Preise, usage, multiplier, Pattern |
| `cc-pricing` | JSON-Feed | Command Code: allowances, requestEstimate, Token-Preise |
| `glm-coding-overview` | HTML-Docs | GLM: Quoten (5h/Woche), Credit-Formel, MCP, Off-Peak |
| `qwen-coding-plan` | HTML-Docs | Qwen Pro: $50, 6k/45k/90k, Task-Konvertierung |
| `qwen-token-personal` | HTML-Docs | Qwen Token: $6/18/68, Quoten, Extra Bundle |
| `kimi-membership-pricing` | HTML-Docs | Kimi Preise (CNY): ¥49/99/199/699 |
| `kimi-code-membership` | HTML-Docs | Kimi Quota-Regeln, Extra Usage |
| `glm-pricing-page` | JS-SPA | ⚠️ Preise nur per API (Auth) → overrides.yml |
| `minimax-token-plan` | JS-SPA | ⚠️ Daten nur per JS → overrides.yml |
| `mimo-token-plan` | HTML | MiMo (Parser offen) |

**Nicht-scrapebares** (GLM-Preise via Auth-API, MiniMax-SPA) lebt in `data/overrides.yml` mit
`lastVerified` — der Cron-Agent prüft die Quellen und pflegt diese Datei bei Änderung.

## Normalisierung (die Vergleichbarkeit)

```
Kosten pro Request = (0.05×input + 0.95×cachedWrite)×pattern.input
                   + cachedRead×pattern.cachedRead + output×pattern.output, /1M
```

- **"60 für 10" ist nur Schicht 1** — Grundcredits (Token-Preise) + Cache + Workload-Profil entscheiden.
- **Anbietereigene Credit-Formeln** (GLM: `(in×6.9+cached×1.7+out×24)/10000`) kommen dynamisch aus den Docs.
- **Pattern-Unifizierung:** geteilte Modell-Familien nutzen das OC-Pattern für beide Provider (Fairness).
- **Fenster:** 5h-Caps = Durchsatz (nicht ×180); Wochen ×4.33 → Monat.
- **undisclosed bleibt undisclosed** — keine erfundenen Zahlen.

## CI / Aktualisierung

`.github/workflows/update.yml` — täglicher Cron (03:17 UTC):
1. `fetch` alle Quellen (Snapshots + Change-Detection)
2. `parse` + `build` + Tests
3. Commit bei Änderung
4. **Review-Issue** wenn SPA-Quellen (Preise) sich geändert haben → overrides.yml manuell pflegen

Optional: Cron-Agent (manuell) für die SPA-Preise (GLM/MiniMax), die Auth-APIs brauchen.

## Aktueller Stand (2026-08-28)

- **17 Pläne** aus Quellen dynamisch aufgelöst, **6 vergleichbar** (Modell-Pricing):
  OpenCode Go, Command Code GOAT/Pro, GLM Lite/Pro/Max
- **94 Modell-Familien-Vergleiche** (`familyComparisons[]`) mit Pattern-Unifizierung
- GLM-Formel + MCP + Off-Peak **live aus Docs geparst**
- Qwen/Kimi Preise **live aus offiziellen Docs geparst** (Limited-Time + CNY korrekt)

## Struktur

```
sources.yml          Quellen-Definition (Endpoints + Parser)
data/overrides.yml   Nur nicht-scrapebares (SPA/Auth) + lastVerified
cache/               Roh-Snapshots + manifest.json (committed, reproduzierbar)
parsed/              Strukturierte Parser-Outputs (committed)
scripts/             fetch / parse-all / build / check / yaml / parsers
public/data/latest.json  Maschinenlesbarer Output (API-Endpunkt)
tests/               Invarianz- + Parser-Tests (9)
```

## Lizenz

MIT (Code). Daten: nur offizielle Quellen; Anbieter-Marken gehören ihren Inhabern.
