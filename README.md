# coding-plan-comparison

**Reproducible comparison of AI coding plan subscriptions** (credit/token-pass plans, not plain token PAYG).

Live site: https://harrytyp.github.io/coding-plan-comparison/

> Nothing here is static. All data comes live from official sources (feeds + docs), is fetched, parsed and built deterministically. When a source changes (prices, billing rules, formulas), change detection catches it and the site updates.

## How it works: fetch, parse, build

```
sources.yml           -> which endpoints, which parser
      |
      v
scripts/fetch.mjs     -> HTTP fetch of all sources -> cache/<id>.<ext> + cache/manifest.json
      |                  (sha256 + contentHash + fetchedAt + changed flag)
      v
scripts/parse-all.mjs -> parsers (HTML to structured, JSON to normalized) -> parsed/<id>.json
      |
      v
scripts/build.mjs     -> plan catalog from parsed/* + data/overrides.yml
      |                  -> normalization (token prices + cache + workload) -> public/data/latest.json
      v
scripts/check.mjs     -> diff report: which sources changed (exit 2 = changed)
```

One command for everything:

```bash
npm run update   # fetch -> parse -> build
npm test         # invariance tests
npm run check    # change-detection report
```

**Determinism:** `build.mjs` uses only `cache/` snapshots + `parsed/`, never live fetches. Same snapshots give the same `latest.json`. Snapshots are gitignored and reproduced via `npm run update`.

**Change detection:** every source gets a `contentHash` (hash of the *parsed* content, robust against HTML nonces and cache busters). `check.mjs` shows what really changed (prices, formulas, billing rules), not volatile HTML details.

**One shared YAML parser:** `scripts/yaml.mjs` is the only YAML implementation. `build.mjs`, `fetch.mjs` and `parse-all.mjs` all import it, zero runtime dependencies.

## Sources

Defined in `sources.yml`: machine-readable price feeds (OpenCode Go, Command Code, Kimi goods API, LLM Stats leaderboard, FX rates) plus official docs (GLM, Qwen, Kimi, MiniMax, MiMo) plus provider privacy pages.

Anything not scrapeable (GLM prices behind an auth API, MiniMax JS-SPA) lives in `data/overrides.yml` with `lastVerified`. A scheduled agent rechecks those sources and updates the file on change. `data/privacy.yml` holds manually verified data policies per provider.

## Normalization (what makes plans comparable)

```
cost per request = (0.05 x input + 0.95 x cachedWrite) x pattern.input
                 + cachedRead x pattern.cachedRead + output x pattern.output, /1M
```

- **"60 for 10" is only layer 1.** Base credits (token prices) + cache behavior + workload profile decide what you actually get.
- **Provider-owned credit formulas** (GLM: `(in x 6.9 + cached x 1.7 + out x 24)/10000`) are scraped from the official docs, never invented.
- **Pattern unification:** shared model families use the most precise per-model pattern for both providers, so a cheap generic pattern cannot rig the comparison.
- **All normalized metrics are per $10 paid** (`normalizedPer10 = requestsPerMonth x 10 / paidPrice`). Column headers say "$10" everywhere.
- **Token/month figures are derived** (`requestsPerMonth x tokens-per-request` from the workload pattern), not independently published quotas. The field keeps its `rawTokensPerMonth` name for API compatibility; `derivedTokensPerMonth` is the honestly named alias and `methodology.derivedMetrics` says so in the JSON.
- **Windows are caps, not volumes:** 5h caps are throughput limits (never multiplied into monthly numbers); weekly credits scale x4.33 to monthly.
- **Data tiers:** A = official quota from feed/docs, B = official total as anchor, C = derived, D = price-based estimate (hidden by default in the UI, toggle to show). Tier-D rows carry a `~` estimate marker.
- **undisclosed stays undisclosed.** No invented numbers; undisclosed plans get `modelStats: null`.
- **AI scores** come from the LLM Stats leaderboard (zeroeval.com) only, matched to feed models with fuzzy matching. Family fallbacks are marked with `~`.

## CI / updates

`.github/workflows/update.yml`, daily 03:17 UTC:

1. `fetch` all sources (snapshots + change detection)
2. `parse` + `build` + tests
3. commit on change
4. review issue when SPA sources changed prices, then `overrides.yml` is updated manually

## Layout

```
sources.yml            source definitions (endpoints + parsers)
data/overrides.yml     only non-scrapeable data (SPA/auth) + lastVerified
data/privacy.yml       manually verified provider data policies
data/ai-scores.json    AI score cache/reference
cache/                 raw snapshots + manifest.json (gitignored, reproducible)
parsed/                structured parser output (gitignored)
scripts/               fetch / parse-all / build / check / yaml / parsers
public/                website (index.html, app.js, data/latest.json)
index.html, app.js     synced copies of public/ for legacy GitHub Pages
tests/                 invariance + parser tests
schema.json            schema notes for the JSON output
```

Root `index.html`/`app.js`/`data/latest.json` are byte-identical copies of `public/` (legacy Pages serves from root). `public/index.html` uses the `__VERSION__` placeholder, which CI replaces with the commit hash on sync (cache busting). The root mirrors are committed by CI (`update.yml`), not by hand.

## License

MIT (code). Data: official sources only; provider brands belong to their owners.
