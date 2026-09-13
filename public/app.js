/* ============================================================
 * Coding Plan Compare — frontend app
 * Dependency-free. Loads public/data/latest.json, renders the
 * whole page, i18n EN/DE, dark mode, URL state.
 * ============================================================ */
/* Idempotenz-Schutz: verhindert Crash bei doppelt geladenem Script
 * (z.B. aggressive Caches, Browser-Addons, doppelter Refresh).
 * Sonst: "Identifier '$' has already been declared" → Seite tot. */
(function () {
if (typeof window !== "undefined" && window.__CPC_LOADED__) {
  return; // bereits geladen — nichts tun
}
if (typeof window !== "undefined") window.__CPC_LOADED__ = true;
"use strict";

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    "nav.brand": "Coding Plan Compare",
    "nav.pareto": "Pareto",
    "nav.calc": "Calculator",
    "nav.changelog": "Changelog",
    "menu.currency": "Currency",
    "menu.theme": "Design",
    "menu.language": "Language",
    "nav.plans": "Plans",
    "nav.models": "Models",
    "nav.method": "Methodology",
    "nav.faq": "FAQ",
    "hero.live": "Live data · auto-updated daily",
    "hero.h1a": "AI Coding Subscriptions,",
    "hero.h1b": "Compared Honestly.",
    "hero.lead": `"60 for 10" is only the sticker price. We compare what you actually get. real token economics, provider credit formulas, cache-aware cost per request. from live official sources, reproduced daily.`,
    "hero.cta1": "Compare plans",
    "hero.cta2": "How it works",
    "hero.cta3": "Budget calculator",
    "hero.sources": "live sources",
    "hero.free": "Free · open data · no affiliate links",
    "stats.plans": "Plans tracked",
    "stats.comparable": "Directly comparable",
    "stats.comparable-sub": "with full model pricing",
    "stats.models": "Model families",
    "stats.models-sub": "matched across plans",
    "stats.sources": "Live sources",
    "stats.sources-sub": "official feeds & docs",
    "plans.h2": "The plans",
    "plans.sub": "Every plan and model combination. Token and request rates are per 1 paid unit in your currency — a rate, not something you can stack.",
    "plans.per": "/mo",
    "plans.noPrice": "price not public",
    "plans.meter": "Meter",
    "plans.quota": "Quota",
    "plans.source": "Source",
    "plans.searchPh": "Filter plans...",
    "plans.allMeters": "All meters",
    "plans.allStatus": "All statuses",
    "plans.meter.dollar": "Dollar usage",
    "plans.meter.credits": "Credits",
    "plans.meter.requests": "Requests",
    "plans.meter.prompts": "Prompts",
    "plans.status.disclosed": "Verified",
    "plans.status.partial": "Partial",
    "plans.status.undisclosed": "Undisclosed",
    "plans.th.plan": "Plan",
    "plans.th.provider": "Provider",
    "plans.th.price": "Price / mo",
    "plans.th.meter": "Meter",
    "plans.th.quota": "Quota",
    "plans.th.models": "Models",
    "plans.th.avgreq": "Avg req / mo",
    "plans.th.status": "Status",
    "plans.th.tokens": "Tokens / $",
    "plans.th.model": "Model",
    "plans.th.score": "AI score",
    "plans.th.req10": "Requests / $",
    "plans.th.rawtokens": "Tokens / mo",
    "plans.th.rawreq": "Requests / mo",
    "plans.th.cap": "Included volume",
    "plans.scoreNA": "No benchmark available",
    "plans.th.privacy": "Privacy",
    "plans.budget": "Max $/mo",
    "plans.aiScore": "Min AI score",
    "plans.noTraining": "No training on my data",
    "plans.waitlist": "Waitlist",
    "plans.waitlist.title": "Currently waitlist only - not purchasable yet",
    "plans.estimate": "estimate",
    "plans.includePriceBased": "Include price-based plans (Kimi)",
    "plans.columns": "Columns",
    "plans.columns.title": "Show columns",
    "filters.toggle": "Filters",
    "sheet.title": "Customize list",
    "sheet.sort": "Sort by",
    "sheet.filter": "Filter",
    "sheet.done": "Done",
    "sort.label": "Sort by",
    "sort.tokens": "Tokens / $",
    "sort.score": "AI score",
    "sort.req10": "Requests / $",
    "sort.rawtokens": "Tokens / mo",
    "sort.rawreq": "Requests / mo",
    "sort.price": "Plan price",
    "sort.plan": "Plan",
    "sort.model": "Model",
    "sort.desc": "desc",
    "sort.asc": "asc",
    "dash.h3": "Pareto dashboard",
    "dash.sub": "Each dot is one plan with one model. Default: tokens per money against AI score. Tap a dot for details.",
    "dash.x": "X axis",
    "dash.y": "Y axis",
    "dash.pareto": "Pareto line",
    "dash.green": "Show target",
    "dash.legend.green": "Target zone",
    "dash.legend.pareto": "Pareto frontier",
    "dash.legend.frontier": "Pareto points",
    "dash.legend.shapes": "● no training · ■ trains · ▲ unknown",
    "dash.target": "Target:",
    "dash.targetX": "min X",
    "dash.targetY": "min Y",
    "dash.clickHint": "Click a dot to see the plan and model",
    "dash.empty": "No data for the plot with these filters.",
    "dash.emptyReset": "Reset filters",
    "dash.legendToggle": "Legend",
    "dash.m.tokens": "Tokens / $",
    "dash.m.req10": "Requests / $",
    "dash.m.rawtokens": "Tokens / mo",
    "dash.m.rawreq": "Requests / mo",
    "dash.m.score": "AI score",
    "dash.m.price": "Plan price / mo",
    "plans.badge.noTraining": "no training",
    "plans.badge.zeroRetention": "zero retention",
    "plans.badge.retention": "retention {d}d",
    "models.searchPh": "Filter models...",
    "models.h2": "Model for model, per $1",
    "models.sub": "Averaging plans hides the truth: cheap models inflate the mean. We compare the same model family across plans, shown per $1 paid. One subscription per account — rates are not stackable.",
    "models.th.model": "Model family",
    "models.th.planA": "Plan A",
    "models.th.req": "Requests / $",
    "models.th.planB": "Plan B",
    "models.th.winner": "Winner",
    "models.th.edge": "Edge",
    "models.winner.draw": "Draw",
    "models.edge": "edge",
    "fcomp.h2": "Same model, different plans",
    "fcomp.sub": "Request rate per $1 paid for one model family across plans. Plain numbers, no podium.",
    "fcomp.th.family": "Model family",
    "fcomp.th.planA": "Plan A",
    "fcomp.th.reqA": "Req / $",
    "fcomp.th.planB": "Plan B",
    "fcomp.th.reqB": "Req / $",
    "fcomp.th.edge": "Difference",
    "fcomp.winner.draw": "Draw",
    "cl.h2": "Changelog",
    "cl.sub": "What changed for you, newest first.",
    "method.h2": "Why \"60 for 10\" is not the answer",
    "method.sub": "The sticker value hides the real economics. Here is exactly how we make plans comparable. every step reproducible.",
    "method.formula.title": "Cost per request",
    "method.s1.t": "Real token prices, not marketing",
    "method.s1.p": "Every model behind a plan has published API token prices: input, output, cached-read and cached-write. That is the ground truth behind any credit or dollar-usage number.",
    "method.s2.t": "Provider credit formulas",
    "method.s2.p": "Providers define their own credits (GLM: (in×6.9 + cached×1.7 + out×24)/10000). We scrape those formulas from the official docs. never invent them.",
    "method.s3.t": "Cache-aware workload model",
    "method.s3.p": "Coding agents hit the cache constantly. Input is priced 5% fresh + 95% cached-write, cached-read and output at their real rates. per model, per workload pattern.",
    "method.s4.t": "Windows are caps, not volumes",
    "method.s4.p": "A 5-hour window is a throughput limit, not a monthly quota. Weekly credits scale to a month (×4.33); 5h caps are never multiplied into fake monthly numbers.",
    "method.s5.t": "Fair pattern unification",
    "method.s5.p": "Some feeds reuse one generic workload pattern. For shared model families we use the most precise per-model pattern for both plans. so a cheap pattern can't rig the comparison.",
    "method.s6.t": "Undisclosed stays undisclosed",
    "method.s6.p": "If a provider hides its numbers, we say so. No invented credits, no back-calculated quotas. Honesty is a feature.",
    "method.more": "Show all steps",
    "method.less": "Show fewer",
    "faq.h2": "Frequently asked questions",
    "faq.q1": "Is this really reproducible?",
    "faq.a1": "Yes. The pipeline fetches official feeds and docs (sources.yml), parses them deterministically, and builds latest.json from the cached snapshots only. never live-fetched during build. Same snapshots in, same JSON out. Change detection runs daily (content-hash of parsed data, robust against HTML nonces).",
    "faq.q2": "Why is \"60 for 10\" misleading?",
    "faq.a2": "OpenCode Go advertises $60 of usage for $10. But real requests per month range from ~490 (Kimi K3) to ~226,000 (Muse Spark 1.2) depending on the model. The dollar value is real; what it buys depends entirely on token prices, cache behaviour and the workload pattern. We compute exactly that.",
    "faq.q3": "Why don't you compare all 17 plans directly?",
    "faq.a3": "Only 6 plans currently publish enough data (token prices or credit formulas) to compute requests per month honestly. The others show their raw quotas. We never invent missing numbers. comparing undisclosed plans would be fiction.",
    "faq.q4": "Which prices do you show?",
    "faq.a4": "The paid checkout price (paidPrice), not the advertised one. Command Code GOAT advertises $10 but checkout is $10.77. we scale by the real price. Where a plan is CNY (GLM, Kimi) we keep the official currency and note it.",
    "faq.q5": "How often does this update?",
    "faq.a5": "A GitHub Action fetches all sources daily at 03:17 UTC. If parsed content changed, it commits the new latest.json. If a non-scrapable price page (GLM, MiniMax) changed, it opens a review issue for manual verification.",
    "faq.q6": "Where do the AI scores come from?",
    "faq.a6": "Model benchmark scores are sourced from llm-stats.com — a community-driven model catalog. We cache the data locally and only re-fetch when the cache expires (24h TTL). No API call is made if the cached data is still fresh.",
    "faq.q7": "Can I just buy Command Code Go ten times?",
    "faq.a7": "No. Plans are single per-account subscriptions: you pick one plan, and switching plans resets the rolling windows (per Command Code's own docs). Extra usage comes from top-up credits at model cost. That is why this site shows rates per $1 paid — Go shows what $1 buys — and why the budget calculator below compares single plans within your budget.",
    "faq.q8": "What does “per $1” mean?",
    "faq.a8": "It is a rate: monthly requests divided by the paid monthly price. Command Code Go at $1 shows what $1 buys; OpenCode Go at $10 shows what each $1 of its $10 buys. Rates follow your selected currency and cannot be stacked — plans are single per-account subscriptions.",
    "faq.q9": "Why does plan X rank first in the calculator?",
    "faq.a9": "The calculator lists single plans within your budget, ordered by monthly tokens for each plan's strongest model. It is a sorted list, not advice: the right plan also depends on which models you need, the privacy terms and the rate limits.",
    "calc.h2": "Budget calculator",
    "calc.sub": "One subscription per account, no stacking. Enter what you pay per month and see the most tokens each single plan buys you.",
    "calc.budget": "Budget / mo",
    "calc.score": "Min AI score",
    "calc.plan": "Plan",
    "calc.model": "Best model in budget",
    "calc.tokensMo": "Tokens / mo",
    "calc.reqMo": "Requests / mo",
    "calc.price": "Price / mo",
    "calc.leftover": "left",
    "calc.empty": "No single plan fits this budget.",
    "calc.note": "Ranked by monthly tokens. Rates follow your selected currency. Price-based estimates (Kimi) stay excluded unless enabled in the filters.",
    "calc.rankTitle": "Rank in the budget calculator",
    "foot.product": "Product",
    "foot.plans": "Plans",
    "foot.models": "Model comparison",
    "foot.method": "Methodology",
    "foot.faq": "FAQ",
    "foot.data": "Data",
    "foot.json": "latest.json (API)",
    "foot.repo": "GitHub",
    "foot.sources": "sources.yml",
    "foot.llmstats": "AI scores: llm-stats.com",
    "foot.legal": "Note",
    "foot.note": "Independent & informational. We don't sell plans and have no affiliate links. Always confirm on the official provider page.",
    "foot.legalTitle": "Legal",
    "foot.privacy": "Privacy",
    "foot.imprint": "Imprint",
    "foot.disclaimer": "Disclaimer",
    "foot.rights": "© 2026 Coding Plan Compare · MIT License",
    "foot.lang": "English · Deutsch",
    "legal.h2": "Legal",
    "legal.sub": "Privacy, imprint and liability information.",
    "legal.privacy.h3": "Privacy",
    "legal.privacy.body": "<p><strong>No cookies, no trackers.</strong> This site sets no cookies and makes no connections to third parties. All data is served from this GitHub Pages site itself.</p><p><strong>Local storage (your browser only).</strong> Your preferences (language, theme, currency, visible columns) are stored in your browser's localStorage so the page can remember them between visits. This data never leaves your device. localStorage is not a cookie and is not used for tracking.</p><p><strong>GitHub Pages hosting.</strong> This site is hosted by GitHub Pages. As with any web host, GitHub's servers process technical access data (IP address, user agent, requested files) in server logs. Please refer to GitHub's privacy policy for details on their data processing.</p><p><strong>No analytics, no advertising.</strong> We do not use analytics tools, advertising networks, or third-party embeds.</p><p><strong>Contact.</strong> For any privacy request, please use the contact details in the imprint.</p>",
    "legal.imprint.h3": "Imprint / Provider identification",
    "legal.imprint.body": "<p>This website is operated by an individual maintainer on a non-commercial, informational basis.</p><p>Operator: Kolja Knodel<br>Contact: <a href=https://github.com/harrytyp>GitHub: harrytyp</a></p><p>As a private, non-commercial website, a full postal address is not required. If this service becomes commercial or targets the DACH region, the imprint must be extended (e.g. §5 DDG in Germany) with your full name and address.</p>",
    "legal.disclaimer.h3": "Disclaimer",
    "legal.disclaimer.body": "<p>All prices, quotas, and conditions shown here are collected from public provider sources on a best-effort basis. They may change at any time. Always confirm current terms on the official provider website before purchasing.</p><p>This site is independent and not affiliated with, endorsed by, or sponsored by any provider shown. We do not sell plans and have no affiliate links.</p><p>Information is provided \"as is\" without warranty of any kind. We are not liable for any decisions made based on this data.</p>",
    "loading": "Loading live data…",
    "error": "Could not load data. Please check the connection or try again.",
    "updated": "Data snapshot",
    "disclaimer.title": "Note:",
    "disclaimer.text": "Prices and quotas change frequently. This site is informational. always confirm on the official provider page before subscribing.",
  },
  de: {
    "nav.brand": "Coding Plan Compare",
    "nav.calc": "Rechner",
    "nav.changelog": "Changelog",
    "menu.currency": "Währung",
    "menu.theme": "Design",
    "menu.language": "Sprache",
    "nav.plans": "Pläne",
    "nav.models": "Modelle",
    "nav.method": "Methodik",
    "nav.faq": "FAQ",
    "hero.live": "Live-Daten · täglich automatisch aktualisiert",
    "hero.h1a": "KI-Coding-Abos,",
    "hero.h1b": "Ehrlich verglichen.",
    "hero.lead": `„60 für 10“ ist nur der Aufkleberpreis. Wir vergleichen, was du wirklich bekommst. echte Token-Ökonomie, anbietereigene Credit-Formeln, cache-bewusste Kosten pro Request. aus Live-Quellen, täglich reproduziert.`,
    "hero.cta1": "Pläne vergleichen",
    "hero.cta2": "So funktioniert's",
    "hero.cta3": "Budget-Rechner",
    "hero.sources": "Live-Quellen",
    "hero.free": "Kostenlos · offene Daten · keine Affiliate-Links",
    "stats.plans": "Erfasste Pläne",
    "stats.comparable": "Direkt vergleichbar",
    "stats.comparable-sub": "mit vollständigem Modell-Pricing",
    "stats.models": "Modell-Familien",
    "stats.models-sub": "über Pläne gematcht",
    "stats.sources": "Live-Quellen",
    "stats.sources-sub": "offizielle Feeds & Docs",
    "plans.h2": "Die Pläne",
    "plans.sub": "Jede Plan-Modell-Kombination. Token- und Request-Raten gelten pro 1 bezahlter Einheit in deiner Währung. eine Rate, nichts Stapelbares.",
    "plans.per": "/Monat",
    "plans.noPrice": "Preis nicht öffentlich",
    "plans.meter": "Meter",
    "plans.quota": "Kontingent",
    "plans.source": "Quelle",
    "plans.searchPh": "Pläne filtern...",
    "plans.allMeters": "Alle Meter",
    "plans.allStatus": "Alle Status",
    "plans.meter.dollar": "Dollar-Usage",
    "plans.meter.credits": "Credits",
    "plans.meter.requests": "Requests",
    "plans.meter.prompts": "Prompts",
    "plans.status.disclosed": "Verifiziert",
    "plans.status.partial": "Teilweise",
    "plans.status.undisclosed": "Nicht veröffentlicht",
    "plans.th.plan": "Plan",
    "plans.th.provider": "Anbieter",
    "plans.th.price": "Preis / Monat",
    "plans.th.meter": "Meter",
    "plans.th.quota": "Kontingent",
    "plans.th.models": "Modelle",
    "plans.th.avgreq": "Ø Requests / Monat",
    "plans.th.status": "Status",
    "plans.th.tokens": "Tokens / $",
    "plans.th.model": "Modell",
    "plans.th.score": "AI-Score",
    "plans.th.req10": "Requests / $",
    "plans.th.rawtokens": "Tokens / Monat",
    "plans.th.rawreq": "Requests / Monat",
    "plans.th.cap": "Inkl. Volumen",
    "plans.scoreNA": "Kein Benchmark verfügbar",
    "plans.th.privacy": "Datenschutz",
    "plans.budget": "Max $/Monat",
    "plans.aiScore": "Min. AI-Score",
    "plans.noTraining": "Kein Training auf meinen Daten",
    "plans.waitlist": "Waitlist",
    "plans.waitlist.title": "Aktuell nur Waitlist - noch nicht kaufbar",
    "plans.estimate": "Schätzung",
    "plans.includePriceBased": "Preisbasierte Pläne einblenden (Kimi)",
    "plans.columns": "Spalten",
    "plans.columns.title": "Spalten anzeigen",
    "filters.toggle": "Filter",
    "sheet.title": "Liste anpassen",
    "sheet.sort": "Sortieren nach",
    "sheet.filter": "Filtern",
    "sheet.done": "Fertig",
    "sort.label": "Sortieren nach",
    "sort.tokens": "Tokens / $",
    "sort.score": "AI-Score",
    "sort.req10": "Requests / $",
    "sort.rawtokens": "Tokens / Monat",
    "sort.rawreq": "Requests / Monat",
    "sort.price": "Planpreis",
    "sort.plan": "Plan",
    "sort.model": "Modell",
    "sort.desc": "absteigend",
    "sort.asc": "aufsteigend",
    "dash.h3": "Pareto-Dashboard",
    "dash.sub": "Jeder Punkt ist ein Plan mit einem Modell. Standard: Tokens pro Geld gegen AI-Score. Punkt antippen für Details.",
    "dash.x": "X-Achse",
    "dash.y": "Y-Achse",
    "dash.pareto": "Pareto-Linie",
    "dash.green": "Zielzone zeigen",
    "dash.legend.green": "Zielzone",
    "dash.legend.pareto": "Pareto-Frontier",
    "dash.legend.frontier": "Pareto-Punkte",
    "dash.legend.shapes": "● kein Training · ■ trainiert · ▲ unbekannt",
    "dash.target": "Ziel:",
    "dash.targetX": "min X",
    "dash.targetY": "min Y",
    "dash.clickHint": "Klicke einen Punkt, um Plan und Modell zu sehen",
    "dash.empty": "Keine Daten für den Plot mit diesen Filtern.",
    "dash.emptyReset": "Filter zurücksetzen",
    "dash.legendToggle": "Legende",
    "dash.m.tokens": "Tokens / $",
    "dash.m.req10": "Requests / $",
    "dash.m.rawtokens": "Tokens / Monat",
    "dash.m.rawreq": "Requests / Monat",
    "dash.m.score": "AI-Score",
    "dash.m.price": "Planpreis / Monat",
    "plans.badge.noTraining": "kein Training",
    "plans.badge.zeroRetention": "Zero Retention",
    "plans.badge.retention": "Speicherung {d} T",
    "view.models": "Modell-Vergleich",
    "models.searchPh": "Modelle filtern...",
    "models.h2": "Modell für Modell, pro 1 $",
    "models.sub": "Mittelwerte verschleiern die Wahrheit: Billige Modelle blähen den Schnitt auf. Wir vergleichen dieselbe Modell-Familie über Pläne, pro 1 $ bezahlt gezeigt. Ein Abo pro Konto. Raten sind nicht stapelbar.",
    "models.th.model": "Modell-Familie",
    "models.th.planA": "Plan A",
    "models.th.req": "Requests / $",
    "models.th.planB": "Plan B",
    "models.th.winner": "Gewinner",
    "models.th.edge": "Vorsprung",
    "models.winner.draw": "Unentschieden",
    "models.edge": "Vorsprung",
    "fcomp.h2": "Gleiches Modell, andere Pläne",
    "fcomp.sub": "Request-Rate pro 1 $ bezahlt für eine Modell-Familie über Pläne. Nackte Zahlen, kein Podest.",
    "fcomp.th.family": "Modell-Familie",
    "fcomp.th.planA": "Plan A",
    "fcomp.th.reqA": "Req / $",
    "fcomp.th.planB": "Plan B",
    "fcomp.th.reqB": "Req / $",
    "fcomp.th.edge": "Unterschied",
    "fcomp.winner.draw": "Unentschieden",
    "cl.h2": "Changelog",
    "cl.sub": "Was sich für dich geändert hat, Neuestes zuerst.",
    "method.h2": "Warum „60 für 10“ nicht die Antwort ist",
    "method.sub": "Der Aufkleberwert versteckt die echte Ökonomie. Hier ist genau, wie wir Pläne vergleichbar machen. jeder Schritt reproduzierbar.",
    "method.formula.title": "Kosten pro Request",
    "method.s1.t": "Echte Token-Preise, kein Marketing",
    "method.s1.p": "Jedes Modell hinter einem Plan hat veröffentlichte API-Token-Preise: Input, Output, Cached-Read und Cached-Write. Das ist die Wahrheit hinter jeder Credit- oder Dollar-Usage-Zahl.",
    "method.s2.t": "Anbietereigene Credit-Formeln",
    "method.s2.p": "Anbieter definieren eigene Credits (GLM: (in×6,9 + cached×1,7 + out×24)/10000). Wir scrapen diese Formeln aus den offiziellen Docs. erfinden sie nie.",
    "method.s3.t": "Cache-bewusstes Workload-Modell",
    "method.s3.p": "Coding-Agenten treffen ständig den Cache. Input wird mit 5% frisch + 95% Cached-Write bepreist, Cached-Read und Output zu ihren echten Raten. pro Modell, pro Workload-Pattern.",
    "method.s4.t": "Fenster sind Caps, keine Volumina",
    "method.s4.p": "Ein 5-Stunden-Fenster ist ein Durchsatz-Limit, kein Monatskontingent. Wochen-Credits skalieren auf den Monat (×4,33); 5h-Caps werden nie zu erfundenen Monatszahlen multipliziert.",
    "method.s5.t": "Faire Pattern-Vereinheitlichung",
    "method.s5.p": "Manche Feeds nutzen ein generisches Workload-Pattern. Für geteilte Modell-Familien verwenden wir das präziseste per-Modell-Pattern für beide Pläne. so kann ein billiges Pattern den Vergleich nicht fälschen.",
    "method.s6.t": "Nicht veröffentlicht bleibt nicht veröffentlicht",
    "method.s6.p": "Wenn ein Anbieter seine Zahlen versteckt, sagen wir das. Keine erfundenen Credits, keine rückgerechneten Kontingente. Ehrlichkeit ist ein Feature.",
    "method.more": "Alle Schritte zeigen",
    "method.less": "Weniger zeigen",
    "faq.h2": "Häufige Fragen",
    "faq.q1": "Ist das wirklich reproduzierbar?",
    "faq.a1": "Ja. Die Pipeline holt offizielle Feeds und Docs (sources.yml), parst sie deterministisch und baut latest.json nur aus den gecachten Snapshots. nie mit Live-Fetch im Build. Gleiche Snapshots rein, gleiches JSON raus. Change-Detection läuft täglich (Content-Hash der geparsten Daten, robust gegen HTML-Nonces).",
    "faq.q2": "Warum ist „60 für 10“ irreführend?",
    "faq.a2": "OpenCode Go bewirbt $60 Usage für $10. Aber die echten Requests pro Monat reichen von ~490 (Kimi K3) bis ~226.000 (Muse Spark 1.2) je nach Modell. Der Dollar-Wert ist real; was er kauft, hängt komplett von Token-Preisen, Cache-Verhalten und Workload-Pattern ab. Genau das rechnen wir aus.",
    "faq.q3": "Warum vergleicht ihr nicht alle 17 Pläne direkt?",
    "faq.a3": "Nur 6 Pläne veröffentlichen aktuell genug Daten (Token-Preise oder Credit-Formeln), um Requests pro Monat ehrlich zu berechnen. Die anderen zeigen ihre Roh-Kontingente. Wir erfinden keine fehlenden Zahlen. nicht vergleichbare Pläne zu vergleichen wäre Fiktion.",
    "faq.q4": "Welche Preise zeigt ihr?",
    "faq.a4": "Den bezahlten Checkout-Preis (paidPrice), nicht den beworbenen. Command Code GOAT bewirbt $10, aber der Checkout ist $10,77. wir skalieren mit dem echten Preis. Wo ein Plan in CNY ist (GLM, Kimi), behalten wir die offizielle Währung und weisen darauf hin.",
    "faq.q5": "Wie oft wird aktualisiert?",
    "faq.a5": "Eine GitHub Action holt täglich um 03:17 UTC alle Quellen. Wenn sich geparster Inhalt geändert hat, committed sie das neue latest.json. Wenn sich eine nicht-scrapebare Preisseite (GLM, MiniMax) geändert hat, öffnet sie ein Review-Issue zur manuellen Prüfung.",
    "faq.q6": "Woher kommen die AI-Scores?",
    "faq.a6": "Die Modell-Benchmark-Scores (Intelligenz, Coding, Reasoning, Agents) kommen von llm-stats.com — einem Community-Modell-Katalog. Wir cachen die Daten lokal und fetchen nur neu, wenn der Cache abläuft (24h TTL). Kein API-Call bei frischem Cache.",
    "faq.q7": "Kann ich Command Code Go einfach zehnmal kaufen?",
    "faq.a7": "Nein. Pläne sind einzelne Abos pro Konto: du wählst einen Plan, und ein Planwechsel setzt die rollierenden Fenster zurück (so steht es in Command Codes eigenen Docs). Mehr Nutzung kommt über Top-up-Credits zum Modellpreis. Darum zeigt diese Seite Raten pro 1 $ bezahlt — Go zeigt, was 1 $ kauft — und darum vergleicht der Budget-Rechner unten Einzelpläne innerhalb deines Budgets.",
    "faq.q8": "Was heißt „pro 1 €“?",
    "faq.a8": "Es ist eine Rate: Requests pro Monat geteilt durch den bezahlten Monatspreis. Command Code Go für 1 $ zeigt, was 1 $ kauft; OpenCode Go für 10 $ zeigt, was jeder einzelne Dollar seiner 10 $ kauft. Raten folgen deiner gewählten Währung und sind nicht stapelbar — Pläne sind einzelne Abos pro Konto.",
    "faq.q9": "Warum steht Plan X im Rechner oben?",
    "faq.a9": "Der Rechner listet Einzelpläne innerhalb deines Budgets, sortiert nach Tokens pro Monat des jeweils stärksten Modells. Das ist eine sortierte Liste, keine Empfehlung: Der passende Plan hängt auch davon ab, welche Modelle du brauchst, von den Datenschutz-Bedingungen und den Rate-Limits.",
    "calc.h2": "Budget-Rechner",
    "calc.sub": "Ein Abo pro Konto, kein Stapeln. Gib an, was du im Monat zahlst, und sieh, welche Tokens jeder einzelne Plan dafür kauft.",
    "calc.budget": "Budget / Monat",
    "calc.score": "Min. AI-Score",
    "calc.plan": "Plan",
    "calc.model": "Bestes Modell im Budget",
    "calc.tokensMo": "Tokens / Monat",
    "calc.reqMo": "Requests / Monat",
    "calc.price": "Preis / Monat",
    "calc.leftover": "übrig",
    "calc.empty": "Kein einzelner Plan passt in dieses Budget.",
    "calc.note": "Sortiert nach Tokens pro Monat. Raten folgen deiner gewählten Währung. Preisbasierte Schätzungen (Kimi) bleiben ausgeschlossen, solange sie in den Filtern nicht eingeblendet sind.",
    "calc.rankTitle": "Rang im Budget-Rechner",
    "foot.product": "Produkt",
    "foot.plans": "Pläne",
    "foot.models": "Modellvergleich",
    "foot.method": "Methodik",
    "foot.faq": "FAQ",
    "foot.data": "Daten",
    "foot.json": "latest.json (API)",
    "foot.repo": "GitHub",
    "foot.sources": "sources.yml",
    "foot.llmstats": "AI-Scores: llm-stats.com",
    "foot.legal": "Hinweis",
    "foot.note": "Unabhängig & informativ. Wir verkaufen keine Pläne und haben keine Affiliate-Links. Bitte immer auf der offiziellen Anbieterseite bestätigen.",
    "foot.legalTitle": "Rechtliches",
    "foot.privacy": "Datenschutz",
    "foot.imprint": "Impressum",
    "foot.disclaimer": "Haftungsausschluss",
    "foot.rights": "© 2026 Coding Plan Compare · MIT-Lizenz",
    "legal.h2": "Rechtliches",
    "legal.sub": "Datenschutz, Impressum und Haftungsinformationen.",
    "legal.privacy.h3": "Datenschutz",
    "legal.privacy.body": "<p><strong>Keine Cookies, keine Tracker.</strong> Diese Seite setzt keine Cookies und stellt keine Verbindungen zu Dritten her. Alle Daten werden von dieser GitHub-Pages-Site selbst ausgeliefert.</p><p><strong>Lokaler Speicher (nur dein Browser).</strong> Deine Einstellungen (Sprache, Theme, Währung, sichtbare Spalten) werden im localStorage deines Browsers gespeichert, damit sich die Seite bei deinem nächsten Besuch daran erinnert. Diese Daten verlassen dein Gerät nie. localStorage ist kein Cookie und wird nicht zum Tracking verwendet.</p><p><strong>GitHub-Pages-Hosting.</strong> Diese Seite wird von GitHub Pages gehostet. Wie bei jedem Webhost verarbeiten GitHub-Server technische Zugriffsdaten (IP-Adresse, User-Agent, angeforderte Dateien) in Server-Logs. Details findest du in der Datenschutzerklärung von GitHub.</p><p><strong>Keine Analyse, keine Werbung.</strong> Wir nutzen keine Analysetools, Werbenetzwerke oder Drittanbieter-Embeds.</p><p><strong>Kontakt.</strong> Für Datenschutzanfragen nutze bitte die Kontaktdaten im Impressum.</p>",
    "legal.imprint.h3": "Impressum / Anbieterkennzeichnung",
    "legal.imprint.body": "<p>Diese Website wird von einem einzelnen Betreiber auf nicht-kommerzieller, informativer Basis betrieben.</p><p>Betreiber: Kolja Knodel<br>Kontakt: <a href=https://github.com/harrytyp>GitHub: harrytyp</a></p><p>Als private, nicht-kommerzielle Website ist eine vollständige Postanschrift nicht erforderlich. Falls dieses Angebot kommerziell wird oder die DACH-Region anvisiert, muss das Impressum (z.B. §5 DDG in Deutschland) um deinen vollständigen Namen und deine Anschrift erweitert werden.</p>",
    "legal.disclaimer.h3": "Haftungsausschluss",
    "legal.disclaimer.body": "<p>Alle hier gezeigten Preise, Kontingente und Bedingungen werden nach bestem Bemühen aus öffentlichen Anbieterquellen gesammelt. Sie können sich jederzeit ändern. Bitte bestätige die aktuellen Konditionen vor dem Kauf immer auf der offiziellen Anbieterseite.</p><p>Diese Seite ist unabhängig und nicht mit einem der gezeigten Anbieter verbunden, von ihnen unterstützt oder gesponsert. Wir verkaufen keine Pläne und haben keine Affiliate-Links.</p><p>Die Informationen werden ohne jegliche Gewähr bereitgestellt. Wir haften nicht für Entscheidungen, die auf Grundlage dieser Daten getroffen werden.</p>",
    "foot.lang": "English · Deutsch",
    "loading": "Live-Daten werden geladen…",
    "error": "Daten konnten nicht geladen werden. Bitte Verbindung prüfen oder erneut versuchen.",
    "updated": "Datenstand",
    "disclaimer.title": "Hinweis:",
    "disclaimer.text": "Preise und Kontingente ändern sich häufig. Diese Seite ist informativ. bitte vor dem Abonnieren immer auf der offiziellen Anbieterseite bestätigen.",
  },
};

/* ---------------- State ---------------- */
let lang = "en";
let theme = "light";
let data = null;

/* ---------------- Währung (einheitliche Anzeige, tägliche Kurse) ----------------
 * Alle Preise werden intern in USD geführt; die UI rechnet in die gewählte
 * Währung um. Kurse von open.er-api.com (kostenlos, täglich aktualisiert).
 */
let currency = "USD";
let exchangeRates = { USD: 1 }; // USD → Zielwährung
// Kurse kommen aus latest.json (fx-Source, 1x täglich mit-gescraped) —
// KEIN Client-seitiger Live-API-Call (Datenschutz: keine Third-Party-Verbindung).
function loadExchangeRates() {
  const fx = data?.fx?.rates ?? null;
  if (fx) exchangeRates = { ...fx, USD: 1 };
}
// USD-Betrag → gewählte Währung (formatiert)
function fmtPrice(usd) {
  if (usd === null || usd === undefined || !isFinite(usd)) return "-";
  const rate = exchangeRates[currency] ?? 1;
  const value = usd * rate;
  const loc = lang === "de" ? "de-DE" : (currency === "EUR" ? "de-DE" : "en-US");
  const opts = { style: "currency", currency, maximumFractionDigits: currency === "JPY" ? 0 : 2 };
  try { return value.toLocaleString(loc, opts); } catch { return `${currency} ${value.toFixed(2)}`; }
}
// Währungssymbol für Raten-Labels ("Tokens / €"): eindeutig auch bei ¥ (CNY/JPY)
function curSym() {
  return { USD: "$", EUR: "€", GBP: "£", CNY: "CN¥", JPY: "JP¥" }[currency] ?? currency + " ";
}
function rateTokensLabel() { return `Tokens / ${curSym()}`; }
function rateReqLabel() { return `Requests / ${curSym()}`; }
// Raten folgen der gewählten Währung: Tokens pro 1 Einheit (1 €, 1 ¥ …).
// USD-Rate durch den Kurs teilen: 1 Zieleinheit = 1/rate USD.
function rateOf(usdRate) {
  if (usdRate === null || usdRate === undefined || !isFinite(usdRate)) return null;
  return usdRate / (exchangeRates[currency] ?? 1);
}

/* ---------------- Basis-URL (robust, egal welche URL) ----------------
 * Leitet den Datenpfad aus dem Script-Src ab statt aus location.pathname.
 * Funktioniert mit/ohne trailing slash, mit Sub-Pfaden, mit Query-Parametern.
 */
function baseUrl() {
  try {
    const scripts = document.querySelectorAll("script[src]");
    for (const s of scripts) {
      const src = s.getAttribute("src") || "";
      if (src.includes("app.js")) {
        // z.B. "/coding-plan-comparison/app.js" → Basis "/coding-plan-comparison/"
        const idx = src.lastIndexOf("/");
        if (idx >= 0) return src.slice(0, idx + 1);
      }
    }
  } catch (e) { /* fallthrough */ }
  // Fallback: location (mit trailing slash erzwingen)
  let base = location.pathname;
  if (!base.endsWith("/")) base = base.slice(0, base.lastIndexOf("/") + 1);
  return base;
}
const DATA_URL = baseUrl() + "data/latest.json";

/* ---------------- Helpers ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function t(key) {
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function fmtNum(n, digits = 0) {
  if (n === null || n === undefined || !isFinite(n)) return "-";
  return n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { maximumFractionDigits: digits });
}

// Tokens kompakt: 1.6 Mrd → "1.6B", 45 Mio → "45M", 900k → "900K"
function fmtTokens(n) {
  if (n === null || n === undefined || !isFinite(n)) return "-";
  const loc = lang === "de" ? "de-DE" : "en-US";
  if (n >= 1e9) return (n / 1e9).toLocaleString(loc, { maximumFractionDigits: 1 }) + "B";
  if (n >= 1e6) return (n / 1e6).toLocaleString(loc, { maximumFractionDigits: 0 }) + "M";
  if (n >= 1e3) return (n / 1e3).toLocaleString(loc, { maximumFractionDigits: 0 }) + "K";
  return Math.round(n).toLocaleString(loc);
}

function fmtMoney(n) {
  if (n === null || n === undefined || !isFinite(n)) return "-";
  return "$" + n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 2 });
}

function fmtPct(n) {
  if (n === null || n === undefined || !isFinite(n)) return "-";
  return n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 1 }) + "%";
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------- i18n DOM ---------------- */
function applyI18n() {
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    // Keys mit HTML-Inhalt (legal.*.body) via innerHTML setzen,
    // damit <p>/<span> korrekt gerendert werden.
    if (typeof val === "string" && val.startsWith("<")) el.innerHTML = val;
    else el.textContent = val;
  });
  $$("[data-i18n-ph]").forEach((el) => {
    const key = el.dataset.i18nPh;
    el.placeholder = t(key);
  });
  // Select-Optionen (data-i18n auf <option>) aktualisieren
  $$("option[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.documentElement.lang = lang;
  $$(".lang-switch button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  document.title = lang === "de"
    ? "Coding Plan Compare — KI-Coding-Abos im Vergleich"
    : "Coding Plan Compare — AI Coding Subscriptions, Compared";
  renderAll();
  syncMethodMore();
}

/* ---------------- Theme ---------------- */
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("cpc-theme", theme);
}

/* ---------------- Rendering ---------------- */
function renderAll() {
  if (!data) return;
  syncRateLabels();
  renderStats();
  renderCalculator();
  renderPlans();
  renderDashboard();
  renderFamily();
  renderChangelog();
  renderFormula();
  bindSortHeader("plans-table", plansSort, renderPlans);
  syncFilterUI();
}

// Statische Select-Optionen mit Raten-Labels folgen der Währung
// (applyI18n setzt sie erst auf $ zurück — danach wieder währungsgenau).
function syncRateLabels() {
  const map = { "sort.tokens": rateTokensLabel(), "sort.req10": rateReqLabel(), "dash.m.tokens": rateTokensLabel(), "dash.m.req10": rateReqLabel(), "plans.th.tokens": rateTokensLabel(), "plans.th.req10": rateReqLabel() };
  for (const [key, label] of Object.entries(map)) {
    document.querySelectorAll(`option[data-i18n="${key}"]`).forEach((el) => { el.textContent = label; });
  }
  document.querySelectorAll(`#col-picker-panel label span[data-i18n="plans.th.tokens"], #sheet-cols span[data-i18n="plans.th.tokens"]`).forEach((el) => { el.textContent = rateTokensLabel(); });
  document.querySelectorAll(`#col-picker-panel label span[data-i18n="plans.th.req10"], #sheet-cols span[data-i18n="plans.th.req10"]`).forEach((el) => { el.textContent = rateReqLabel(); });
}

function syncFilterUI() {
  const budgetSlider = $("#budget-slider");
  const budgetOut = $("#budget-value");
  if (budgetSlider && budgetOut) {
    budgetSlider.value = maxBudget;
    budgetOut.textContent = maxBudget >= 300 ? (lang === "de" ? "beliebig" : "any") : fmtMoney(maxBudget);
  }
  const aiSlider = $("#ai-slider");
  const aiOut = $("#ai-value");
  if (aiSlider && aiOut) {
    aiSlider.value = minAiScore;
    aiOut.textContent = minAiScore === 0 ? (lang === "de" ? "keins" : "none") : String(minAiScore);
  }
  syncFilterChips();
}

/* ---------------- Filter-Toggle + aktive-Filter-Chips ---------------- */
let filtersOpen = false;
// Gemeinsames Re-Rendering: Tabelle + Dashboard + Rechner + Filter-Chips
function rerender() {
  renderCalculator();
  renderPlans();
  renderDashboard();
  syncFilterChips();
}
function toggleFilters(force) {
  filtersOpen = force !== undefined ? force : !filtersOpen;
  const toolbar = $("#plans-toolbar");
  const btn = $("#filter-toggle");
  if (toolbar) toolbar.hidden = !filtersOpen;
  if (btn) btn.setAttribute("aria-expanded", String(filtersOpen));
}

// Aktive Filter als Chips anzeigen (mit Entfernen-Button) + Zähler-Badge
function syncFilterChips() {
  const container = $("#filter-active");
  const badge = $("#filter-count-badge");
  if (!container) return;
  const chips = [];
  if (plansSearch) chips.push({ label: `${t("plans.searchPh").replace("...", "")} "${plansSearch}"`, clear: () => { plansSearch = ""; const el = $("#plans-search"); if (el) el.value = ""; rerender(); } });
  if (plansMeter) chips.push({ label: meterLabel(plansMeter), clear: () => { plansMeter = ""; const el = $("#plans-meter-filter"); if (el) el.value = ""; rerender(); } });
  if (maxBudget < 300) chips.push({ label: `${t("plans.budget")} ≤ ${fmtMoney(maxBudget)}`, clear: () => { maxBudget = 300; syncFilterUI(); rerender(); } });
  if (minAiScore > 0) chips.push({ label: `${t("plans.aiScore")} ≥ ${minAiScore}`, clear: () => { minAiScore = 0; syncFilterUI(); rerender(); } });
  if (noTrainingOnly) chips.push({ label: t("plans.noTraining"), clear: () => { noTrainingOnly = false; const el = $("#privacy-toggle"); if (el) el.checked = false; rerender(); } });
  if (includePriceBased) chips.push({ label: t("plans.includePriceBased"), clear: () => { includePriceBased = false; const el = $("#tierd-toggle"); if (el) el.checked = false; rerender(); } });
  container.innerHTML = chips.map((c) => `<span class="chip">${escapeHtml(c.label)}<button type="button" aria-label="remove">×</button></span>`).join("");
  container.querySelectorAll(".chip button").forEach((btn, i) => {
    btn.addEventListener("click", chips[i].clear);
  });
  if (badge) {
    badge.hidden = chips.length === 0;
    badge.textContent = String(chips.length);
  }
}

function renderStats() {
  $("#stat-plans").textContent = fmtNum(data.statistics?.totalPlans);
  $("#stat-comparable").textContent = fmtNum(data.statistics?.comparablePlans);
  $("#stat-models").textContent = fmtNum(data.modelComparisons?.length ?? data.statistics?.plansWithModels);
  $("#stat-sources").textContent = fmtNum(Object.keys(data.sources ?? {}).length);
  const srcCount = Object.keys(data.sources ?? {}).length;
  $("#meta-sources").textContent = `${fmtNum(srcCount)} ${lang === "de" ? "Live-Quellen" : "live sources"}`;
  const date = new Date(data.generatedAt);
  $("#meta-updated").textContent = `${t("updated")}: ${date.toLocaleDateString(lang === "de" ? "de-DE" : "en-US")}`;
  $("#stat-plans-sub").textContent = lang === "de" ? "davon " + data.statistics?.undisclosed + " ohne öffentliche Zahlen" : "of which " + data.statistics?.undisclosed + " undisclosed";
  // Disclaimer-Banner
  const disc = $("#disclaimer");
  if (disc) {
    disc.style.display = "block";
    $("#disclaimer-title").textContent = t("disclaimer.title");
    $("#disclaimer-text").textContent = t("disclaimer.text");
  }
}

function meterLabel(meter) {
  const map = {
    dollar_usage: lang === "de" ? "Dollar-Usage" : "Dollar usage",
    credits: lang === "de" ? "Credits" : "Credits",
    requests: lang === "de" ? "Requests" : "Requests",
    prompts: lang === "de" ? "Prompts" : "Prompts",
    gpu: "GPU",
    allowance: lang === "de" ? "Kontingent" : "Allowance",
  };
  return map[meter] ?? meter;
}

function quotaSummary(plan) {
  const q = plan.quotas ?? [];
  const parts = q
    .map((x) => {
      const amt = typeof x.amount === "number" ? fmtNum(x.amount) : (x.amount ?? "-");
      return `${amt} ${x.unit ?? ""} / ${x.window ?? ""}`;
    })
    .filter(Boolean);
  return parts.join(" · ") || "-";
}

/* ---------------- Sortier-/Filter-State ---------------- */
let plansSort = { key: "tokens", dir: "desc" }; // Standard: meisten Tokens/$ zuerst
let plansSearch = "";
let plansMeter = "";
let maxBudget = 300;   // Budget-Filter: max $/Monat
let minAiScore = 0;    // AI-Score-Filter: mindestens
let noTrainingOnly = false; // Privacy-Filter: nur "no training on my data"
let includePriceBased = false; // Tier-D (preisbasierte Mengen, z.B. Kimi) per Default aus — einblendbar

/* ---------------- Spalten-Auswahl (User-anpassbar) ---------------- */
// Alle verfügbaren Spalten; Auswahl wird in localStorage gespeichert.
const ALL_COLUMNS = ["plan", "model", "score", "tokens", "req10", "rawtokens", "rawreq", "cap", "price", "privacy"];
const DEFAULT_COLUMNS = ["plan", "model", "score", "tokens", "rawtokens", "cap", "price", "privacy"];
// Mobile Default: nur das Nötigste (Karten statt Tabelle)
const MOBILE_DEFAULT_COLUMNS = ["plan", "model", "rawtokens", "price"];
let visibleColumns = loadColumns();
function loadColumns() {
  try {
    const stored = localStorage.getItem("cpc-columns");
    if (stored) {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr) && arr.length) return arr.filter((c) => ALL_COLUMNS.includes(c));
    }
  } catch (e) { /* fallthrough */ }
  // Mobile ohne gespeicherte Wahl: schlanke Karten-Defaults
  try {
    if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) return [...MOBILE_DEFAULT_COLUMNS];
  } catch (e) { /* fallthrough */ }
  return [...DEFAULT_COLUMNS];
}
function saveColumns() {
  try { localStorage.setItem("cpc-columns", JSON.stringify(visibleColumns)); } catch (e) { /* ignore */ }
}
function columnVisible(col) { return visibleColumns.includes(col); }

/* ---------------- AI-Score (LLM Stats) ---------------- */
// Robuster Fuzzy-Match: findet Score für Feed-Modellnamen in den Scores.
function aiScoreFor(modelName, family) {
  const scores = data?.aiScores?.scores ?? {};
  const keys = Object.keys(scores);
  if (!keys.length) return null;

  const raw = (modelName || family || "").toLowerCase();
  const slug = (s) => s.replace(/\./g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const compact = (s) => s.replace(/[^a-z0-9]/g, "");
  const words = (s) => s.split(/[\s-]+/).filter(Boolean);
  const commonWords = (a, b) => words(a).filter(w => w.length > 1 && words(b).includes(w)).length;

  // Kandidaten generieren
  const candidates = [];
  candidates.push(slug(raw));
  if (family) candidates.push(slug(family.toLowerCase()));
  const noParen = raw.replace(/\([^)]*\)/g, "").trim();
  if (noParen !== raw) candidates.push(slug(noParen));
  const PREFIXES = ["tencent ", "alibaba ", "google ", "openai ", "anthropic ", "meta "];
  for (const p of PREFIXES) {
    if (noParen.startsWith(p)) candidates.push(slug(noParen.slice(p.length)));
  }
  const noSuffix = noParen.replace(/\s+(contributor|preview|highspeed|fast|latest|exp)\s*$/i, "").trim();
  if (noSuffix !== noParen) candidates.push(slug(noSuffix));
  const noDate = noParen.replace(/[\s-]+\d{4}$/, "").trim();
  if (noDate !== noParen) candidates.push(slug(noDate));
  let parts = words(noParen);
  while (parts.length > 2) { parts.pop(); candidates.push(slug(parts.join(" "))); }

  // Match in strict phases: exact normalizations beat fuzzy prefix hits,
  // so "Muse Spark 1.3 Contributor" resolves to muse-spark-1-3, never to the
  // generic muse-spark key. Derived (non-exact) hits are flagged as fallback.
  const uniq = [...new Set(candidates.filter(Boolean))];
  // Alias entries (build-precomputed, flagged) are never fuzzy targets, only
  // direct hits: matches always land on original leaderboard keys, never chains.
  const solid = keys.filter((k) => !scores[k]?.fallback && !scores[k]?.familyFallback);
  const withFallback = (entry, aliasOf) => {
    if (!entry || (!entry.fallback && !entry.familyFallback && !aliasOf)) return entry;
    // Transitive Auflösung: aliasOf zeigt immer auf den originalen
    // Leaderboard-Key, nie auf einen anderen Alias (alte JSONs mit Ketten heilen).
    let root = entry.aliasOf ?? aliasOf ?? null;
    const seen = new Set();
    while (root && scores[root]?.aliasOf && !seen.has(root)) { seen.add(root); root = scores[root].aliasOf; }
    return { intelligence: entry.intelligence, fallback: true, aliasOf: root };
  };
  for (const c of uniq) {
    if (scores[c]) return withFallback(scores[c], c === slug(raw) ? null : c);
  }
  for (const c of uniq) {
    const cc = compact(c);
    if (cc.length >= 4) {
      const found = solid.find(k => compact(k) === cc);
      if (found) return withFallback(scores[found], found);
    }
  }
  for (const c of uniq) {
    const prefix = solid.filter(k => k === c || k.startsWith(c + "-") || c.startsWith(k + "-"))
      .sort((a, b) => a.length - b.length)[0];
    if (prefix) return withFallback(scores[prefix], prefix);
  }

  // Word-Overlap Fallback
  let best = null, bestOverlap = 0;
  for (const k of solid) {
    const overlap = commonWords(k, noParen);
    if (overlap >= 2 && overlap > bestOverlap) { bestOverlap = overlap; best = k; }
  }
  if (best) return withFallback(scores[best], best);

  // Familien-Mittelwert
  if (family || modelName) {
    const famKey = (family || modelName).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const prefixes = [
      famKey.split("-").slice(0, 2).join("-"),
      famKey.split("-").slice(0, 3).join("-"),
      famKey.split("-").slice(0, 3).join(""),
    ];
    let famScores = [];
    for (const prefix of prefixes) {
      if (!prefix || prefix.length < 3) continue;
      famScores = Object.entries(scores)
        .filter(([k, v]) => !v?.fallback && !v?.familyFallback)
        .filter(([k]) => k.startsWith(prefix + "-") || k.replace(/-+/g, "").startsWith(prefix))
        .map(([, v]) => v?.intelligence)
        .filter((v) => typeof v === "number");
      if (famScores.length >= 2) break;
    }
    if (famScores.length >= 2) {
      const mean = famScores.reduce((a, b) => a + b, 0) / famScores.length;
      return { intelligence: mean, familyFallback: true };
    }
  }
  return null;
}

/* ---------------- Kombinations-Zeilen (Plan + Modell) ---------------- */
// Privacy je Anbieter aus data.privacy (in latest.json), plus Modell-Privacy aus Feed
function providerPrivacy(provider) {
  const entries = data?.privacy ?? [];
  const match = entries.find((e) => e.provider === provider);
  return match || null;
}
// Globale Modell-Privacy-Map: Ein Modell hat dieselbe Training-Policy überall.
// Zwei Ebenen: exakter Modellname (z.B. "Muse Spark 1.2 Contributor") hat Vorrang,
// Familie ("muse spark 1.2") nur als Fallback. Behebt: Muse Spark 1.2 Contributor
// hat training=true (ocgo-Feed) → gilt AUCH in Command Code trotz Anbieter-Zusage.
const modelPrivacyMap = new Map();
const modelPrivacyByName = new Map();
function buildModelPrivacyMap() {
  modelPrivacyMap.clear();
  modelPrivacyByName.clear();
  for (const plan of data?.plans ?? []) {
    for (const row of plan.modelRows ?? []) {
      if (row.privacy && (row.privacy.training === true || row.privacy.training === false)) {
        const nameKey = row.model.toLowerCase();
        const famKey = row.family || nameKey;
        if (!modelPrivacyByName.has(nameKey)) modelPrivacyByName.set(nameKey, row.privacy);
        if (!modelPrivacyMap.has(famKey)) modelPrivacyMap.set(famKey, row.privacy);
      }
    }
  }
}

// Privacy einer Combo: Modell-genaue Privacy hat STRENGEN Vorrang.
// Ein Modell trainiert (oder nicht) unabhängig vom Plan/Anbieter.
// Anbieter-Policy gilt nur als Fallback für Modelle ohne eigene Aussage.
function comboPrivacy(plan, row) {
  const modelPriv = modelPrivacyByName.get(row.model.toLowerCase()) ?? modelPrivacyMap.get(row.family);
  if (modelPriv) {
    return {
      noTraining: modelPriv.training === false,
      retentionDays: typeof modelPriv.retentionDays === "number" ? modelPriv.retentionDays : null,
      zeroRetention: null,
      source: "model",
      known: true,
    };
  }
  const pp = providerPrivacy(plan.provider);
  if (pp) {
    return {
      noTraining: pp.training === false ? true : (pp.training === true ? false : null),
      retentionDays: pp.retentionDays ?? null,
      zeroRetention: pp.zeroRetention === true ? true : (pp.zeroRetention === false ? false : null),
      source: "provider",
      known: pp.training != null || pp.zeroRetention != null,
    };
  }
  return { noTraining: null, retentionDays: null, zeroRetention: null, source: null, known: false };
}

function buildCombos() {
  const combos = [];
  for (const plan of data?.plans ?? []) {
    // Preis: USD als Vergleichs-Basis (Sortierung/Budget), Anzeige in gewählter Währung
    const priceUsd = plan.price?.monthlyUsd ?? (plan.price?.currency === "CNY" ? plan.price?.monthlyUsd : plan.price?.paidPrice) ?? null;
    const priceDisplay = priceUsd !== null && priceUsd !== undefined ? fmtPrice(priceUsd) : null;
    // Inklusives Monats-Volumen (Cap): ehrliche Obergrenze des Abos, keine Rate
    const monthlyQuota = (plan.quotas ?? []).find((q) => q.window === "month" && typeof q.amount === "number");
    const capStr = monthlyQuota ? `${fmtNum(monthlyQuota.amount)} ${monthlyQuota.unit ?? ""} / ${lang === "de" ? "Monat" : "mo"}` : null;
    for (const row of plan.modelRows ?? []) {
      const score = aiScoreFor(row.model, row.family);
      const tokensPerReq = tokensPerRequest(row);
      // Pro-$ Rate (USD-Basis); alte Artefakte mit normalizedPer10 bleiben lesbar (/10).
      const norm1 = row.normalizedPer1 ?? (row.normalizedPer10 != null ? row.normalizedPer10 / 10 : null);
      const tokensPerUsd = tokensPerReq && norm1 ? tokensPerReq * norm1 : null;
      const reqPerUsd = norm1;
      const priv = comboPrivacy(plan, row);
      combos.push({
        planId: plan.id,
        planName: plan.name,
        provider: plan.provider,
        price: priceUsd,
        priceDisplay,
        meter: plan.meter,
        waitlist: plan.price?.waitlist === true,
        dataTier: plan.dataTier ?? null,
        model: row.model,
        family: row.family,
        score: score?.intelligence ?? null,
        scoreFallback: score?.familyFallback === true || score?.fallback === true,
        // Raten in der gewählten Währung (pro 1 Einheit); USD-Rohwerte für den Rechner
        tokensPer: rateOf(tokensPerUsd),
        reqPer: rateOf(reqPerUsd),
        tokensPerUsd,
        reqPerUsd,
        // Rohdaten: Tokens/Monat und Requests/Monat (un-normalisiert)
        rawTokensPerMonth: row.rawTokensPerMonth ?? null,
        rawRequestsPerMonth: row.requestsPerMonth ?? null,
        // Inklusives Volumen des Plans (Cap, keine Rate)
        capStr,
        // Schätzung (kein offizielles Limit): z.B. Kimi price-based estimate
        estimateNote: row.estimate ?? null,
        // Privacy: kombinierte Aussage (Modell-Feed vorrangig, sonst Anbieter-Policy)
        noTraining: priv.noTraining,
        retentionDays: priv.retentionDays,
        zeroRetention: priv.zeroRetention,
        privacyKnown: priv.known,
        privacySource: priv.source,
      });
    }
  }
  return combos;
}

// Tokens pro Request aus dem Workload-Pattern (input + cachedRead + output)
function tokensPerRequest(row) {
  const p = row.patternUsed;
  if (!p) return null;
  return (p.input || 0) + (p.cachedRead || 0) + (p.output || 0);
}

function sortBy(key, dir) {
  return (a, b) => {
    let va, vb;
    if (key === "plan") { va = (a.planName || "").toLowerCase(); vb = (b.planName || "").toLowerCase(); }
    else if (key === "model") { va = (a.model || "").toLowerCase(); vb = (b.model || "").toLowerCase(); }
    else if (key === "score") { va = a.score ?? null; vb = b.score ?? null; }
    else if (key === "tokens") { va = a.tokensPer ?? null; vb = b.tokensPer ?? null; }
    else if (key === "req10") { va = a.reqPer ?? null; vb = b.reqPer ?? null; }
    else if (key === "rawtokens") { va = a.rawTokensPerMonth ?? null; vb = b.rawTokensPerMonth ?? null; }
    else if (key === "rawreq") { va = a.rawRequestsPerMonth ?? null; vb = b.rawRequestsPerMonth ?? null; }
    else if (key === "price") { va = a.price ?? null; vb = b.price ?? null; }
    else return 0;
    // Fehlende Werte (null) immer ans Ende
    if (va === null || va === undefined) return 1;
    if (vb === null || vb === undefined) return -1;
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    va = String(va ?? ""); vb = String(vb ?? "");
    return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  };
}

function sortArrow(key, state) {
  const arrow = state.key === key ? (state.dir === "asc" ? "↑" : "↓") : "↕";
  return `<span class="sort-ind">${arrow}</span>`;
}

function bindSortHeader(tableId, state, renderFn) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll("th[data-sort]").forEach((th) => {
    th.classList.remove("sorted");
    th.innerHTML = th.innerHTML.replace(/\s*<span class="sort-ind">.*<\/span>/, "");
    if (state.key === th.dataset.sort) {
      th.classList.add("sorted");
      th.insertAdjacentHTML("beforeend", sortArrow(th.dataset.sort, state));
    }
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.key === key) state.dir = state.dir === "asc" ? "desc" : "asc";
      else { state.key = key; state.dir = key === "name" || key === "provider" || key === "meter" || key === "family" ? "asc" : "desc"; }
      renderFn();
    });
  });
}

// Privacy-Badge: "no training" grün, Retention-Zeit als Info
function privacyBadge(c) {
  if (!c.privacyKnown) return "";
  const parts = [];
  if (c.noTraining === true) parts.push(`<span class="badge badge-green" title="No training on my data">${t("plans.badge.noTraining")}</span>`);
  if (c.zeroRetention === true) parts.push(`<span class="badge badge-green" title="Zero data retention">${t("plans.badge.zeroRetention")}</span>`);
  if (typeof c.retentionDays === "number" && c.retentionDays !== false) parts.push(`<span class="badge badge-gray" title="Data retention">${t("plans.badge.retention").replace("{d}", String(c.retentionDays))}</span>`);
  return parts.length ? `<div class="privacy-badges">${parts.join(" ")}</div>` : "";
}

function renderPlans() {
  const tbody = $("#plans-tbody");
  if (!tbody) return;
  let combos = buildCombos();
  // Filter: Suche (Plan, Modell, Provider)
  if (plansSearch) {
    const q = plansSearch.toLowerCase();
    combos = combos.filter((c) => [c.planName, c.model, c.provider].join(" ").toLowerCase().includes(q));
  }
  // Filter: Meter
  if (plansMeter) combos = combos.filter((c) => c.meter === plansMeter);
  // Filter: Budget (max $/Monat)
  if (maxBudget < 300) combos = combos.filter((c) => (c.price ?? 0) <= maxBudget);
  // Filter: AI-Score (mindestens)
  if (minAiScore > 0) combos = combos.filter((c) => (c.score ?? 0) >= minAiScore);
  // Filter: Privacy — nur "no training on my data"
  if (noTrainingOnly) combos = combos.filter((c) => c.noTraining === true);
  // Datenqualität: Tier-D (preisbasiert, z.B. Kimi) per Default ausblenden —
  // keine veröffentlichte Menge = nicht sicher vergleichbar. Toggle zum Einblenden.
  if (!includePriceBased) combos = combos.filter((c) => c.dataTier !== "D");
  // Sortieren
  combos.sort(sortBy(plansSort.key, plansSort.dir));
  // Count
  const count = $("#plans-count");
  const totalCombos = buildCombos().length;
  if (count) count.textContent = `${combos.length} / ${totalCombos}`;

  if (!combos.length) {
    tbody.innerHTML = `<tr><td colspan="${visibleColumns.length}" style="text-align:center;padding:28px;color:var(--text-faint)">${lang === "de" ? "Keine Kombinationen gefunden." : "No combinations match."}</td></tr>`;
    return;
  }

  tbody.innerHTML = combos.map((c) => {
    const cells = visibleColumns.map((col) => renderCell(col, c)).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  syncColumnHeaders();
}

// Spalten-Factory: jede Spalte rendert ihre Zelle (nur sichtbare werden aufgerufen)
function renderCell(col, c) {
  const priceStr = c.priceDisplay ?? (c.price !== null && c.price !== undefined ? fmtMoney(c.price) : "-");
  // Familien-Fallback-Scores mit "~" markieren (Näherungswert, kein exakter AA-Wert)
  const scoreStr = c.score !== null
    ? `<span class="num strong">${c.scoreFallback ? "~" : ""}${c.score.toFixed(1)}</span>`
    : `<span class="muted" title="${escapeHtml(t("plans.scoreNA"))}">-</span>`;
  const scoreBar = c.score !== null
    ? `<div class="score-bar"><div class="score-fill" style="width:${Math.min(100, (c.score / 70) * 100)}%"></div></div>`
    : "";
  // Neutraler Rechner-Rang (grau, keine Empfehlung): nur Info, wo der Plan im Budget steht
  const rankTag = calcRanks.has(c.planId)
    ? `<span class="rank-tag" title="${escapeHtml(t("calc.rankTitle"))}">#${calcRanks.get(c.planId)}</span>`
    : "";
  switch (col) {
    case "plan": return `<td class="cell-head" data-label="${t("plans.th.plan")}"><span class="strong">${escapeHtml(c.planName)}</span>${rankTag}<div class="muted" style="font-size:12px">${escapeHtml(c.provider)}</div></td>`;
    case "model": return `<td class="cell-sub" data-label="${t("plans.th.model")}"><span class="strong">${escapeHtml(c.model)}</span></td>`;
    case "score": return `<td data-label="${t("plans.th.score")}">${scoreStr}${scoreBar}</td>`;
    case "tokens": return `<td data-label="${rateTokensLabel()}"><span class="num">${fmtTokens(c.tokensPer)}</span></td>`;
    case "req10": {
      const mark = c.estimateNote ? "~" : "";
      return `<td data-label="${rateReqLabel()}"><span class="num">${c.reqPer ? mark + fmtNum(c.reqPer) : "-"}</span>${c.estimateNote ? `<div class="est-note" title="${escapeHtml(c.estimateNote)}">${t("plans.estimate")}</div>` : ""}</td>`;
    }
    case "rawtokens": return `<td data-label="${t("plans.th.rawtokens")}"><span class="num">${fmtTokens(c.rawTokensPerMonth)}</span></td>`;
    case "rawreq": {
      const mark = c.estimateNote ? "~" : "";
      return `<td data-label="${t("plans.th.rawreq")}"><span class="num">${c.rawRequestsPerMonth ? mark + fmtNum(c.rawRequestsPerMonth) : "-"}</span>${c.estimateNote ? `<div class="est-note" title="${escapeHtml(c.estimateNote)}">${t("plans.estimate")}</div>` : ""}</td>`;
    }
    case "cap": return `<td data-label="${t("plans.th.cap")}"><span class="num">${c.capStr ? escapeHtml(c.capStr) : "-"}</span></td>`;
    case "price": {
      const wl = c.waitlist === true
        ? `<div class="waitlist-badge" title="${t("plans.waitlist.title")}">${t("plans.waitlist")}</div>`
        : "";
      return `<td data-label="${t("plans.th.price")}"><span class="num">${priceStr}</span>${wl}</td>`;
    }
    case "privacy": return `<td data-label="${t("plans.th.privacy")}">${privacyBadge(c)}</td>`;
    default: return "";
  }
}

// Tabellenköpfe: nur sichtbare Spalten anzeigen
function syncColumnHeaders() {
  const table = document.getElementById("plans-table");
  if (!table) return;
  // Sort-Selector (Mobile) mit aktuellem Sort-Zustand synchronisieren
  const selKey = $("#sort-select-key");
  const selDir = $("#sort-select-dir");
  if (selKey) selKey.value = plansSort.key;
  if (selDir) selDir.value = plansSort.dir;
  const head = table.querySelector("thead tr");
  if (!head) return;
  const sortableMap = { plan: "plan", model: "model", score: "score", tokens: "tokens", req10: "req10", rawtokens: "rawtokens", rawreq: "rawreq", cap: null, price: "price", privacy: null };
  head.innerHTML = visibleColumns.map((col) => {
    const sortKey = sortableMap[col];
    const i18nKey = `plans.th.${col}`;
    const label = col === "tokens" ? rateTokensLabel() : col === "req10" ? rateReqLabel() : (t(i18nKey) || col);
    const th = document.createElement("th");
    if (sortKey) {
      th.dataset.sort = sortKey;
      th.innerHTML = `${label}<span class="sort-ind">${plansSort.key === sortKey ? (plansSort.dir === "asc" ? "↑" : "↓") : "↕"}</span>`;
      if (plansSort.key === sortKey) th.classList.add("sorted");
    } else {
      th.textContent = label;
    }
    return th.outerHTML;
  }).join("");
  bindSortHeader("plans-table", plansSort, renderPlans);
}

// Spalten-Picker UI synchronisieren
function syncColumnPicker() {
  document.querySelectorAll("#col-picker-panel input[data-col]").forEach((box) => {
    box.checked = visibleColumns.includes(box.dataset.col);
  });
  // Mobile-Sheet-Spalten syncen
  document.querySelectorAll("#sheet-cols input[data-col]").forEach((box) => {
    box.checked = visibleColumns.includes(box.dataset.col);
  });
}

/* ============ MOBILE BOTTOM-SHEET (Filter & Columns) ============ */
function openSheet() {
  const sheet = $("#sheet");
  const overlay = $("#sheet-overlay");
  if (!sheet) return;
  // Sync aller Controls mit aktuellem State
  const sk = $("#sheet-sort-key"); if (sk) sk.value = plansSort.key;
  const sd = $("#sheet-sort-dir"); if (sd) sd.value = plansSort.dir;
  const ss = $("#sheet-search"); if (ss) ss.value = plansSearch;
  const sm = $("#sheet-meter"); if (sm) sm.value = plansMeter;
  const sb = $("#sheet-budget"); if (sb) sb.value = maxBudget;
  const sbo = $("#sheet-budget-out"); if (sbo) sbo.textContent = maxBudget >= 300 ? (lang === "de" ? "beliebig" : "any") : fmtMoney(maxBudget);
  const sa = $("#sheet-ai"); if (sa) sa.value = minAiScore;
  const sao = $("#sheet-ai-out"); if (sao) sao.textContent = minAiScore === 0 ? (lang === "de" ? "keins" : "none") : String(minAiScore);
  const sp = $("#sheet-privacy"); if (sp) sp.checked = noTrainingOnly;
  const st = $("#sheet-tierd"); if (st) st.checked = includePriceBased;
  syncColumnPicker();
  sheet.hidden = false;
  if (overlay) overlay.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeSheet() {
  const sheet = $("#sheet");
  const overlay = $("#sheet-overlay");
  if (sheet) sheet.hidden = true;
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = "";
}
function initSheet() {
  // Auf Mobile: "Filter & Columns"-Button öffnet Sheet (statt Filter-Toggle + Col-Picker)
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  if (isMobile) {
    const ft = $("#filter-toggle");
    if (ft) ft.addEventListener("click", openSheet);
    const cp = $("#col-picker-btn");
    if (cp) cp.style.display = "none"; // Columns im Sheet
  }
  // Sheet-Controls: Änderungen direkt anwenden
  const sk = $("#sheet-sort-key"); if (sk) sk.addEventListener("change", (e) => { plansSort.key = e.target.value; renderPlans(); });
  const sd = $("#sheet-sort-dir"); if (sd) sd.addEventListener("change", (e) => { plansSort.dir = e.target.value; renderPlans(); });
  const ss = $("#sheet-search"); if (ss) ss.addEventListener("input", (e) => { plansSearch = e.target.value; rerender(); });
  const sm = $("#sheet-meter"); if (sm) sm.addEventListener("change", (e) => { plansMeter = e.target.value; rerender(); });
  const sb = $("#sheet-budget"); if (sb) sb.addEventListener("input", (e) => {
    maxBudget = parseInt(e.target.value, 10) || 300;
    const o = $("#sheet-budget-out"); if (o) o.textContent = maxBudget >= 300 ? (lang === "de" ? "beliebig" : "any") : fmtMoney(maxBudget);
    rerender();
  });
  const sa = $("#sheet-ai"); if (sa) sa.addEventListener("input", (e) => {
    minAiScore = parseInt(e.target.value, 10) || 0;
    const o = $("#sheet-ai-out"); if (o) o.textContent = minAiScore === 0 ? (lang === "de" ? "keins" : "none") : String(minAiScore);
    rerender();
  });
  const sp = $("#sheet-privacy"); if (sp) sp.addEventListener("change", (e) => { noTrainingOnly = e.target.checked; rerender(); });
  const st2 = $("#sheet-tierd"); if (st2) st2.addEventListener("change", (e) => { includePriceBased = e.target.checked; rerender(); });
  // Sheet-Spalten
  document.querySelectorAll("#sheet-cols input[data-col]").forEach((box) => {
    box.addEventListener("change", () => {
      const col = box.dataset.col;
      if (box.checked) { if (!visibleColumns.includes(col)) visibleColumns.push(col); }
      else { visibleColumns = visibleColumns.filter((c) => c !== col); }
      saveColumns();
      renderPlans();
    });
  });
  // Schließen
  const sc = $("#sheet-close"); if (sc) sc.addEventListener("click", closeSheet);
  const so = $("#sheet-overlay"); if (so) so.addEventListener("click", closeSheet);
  const sd2 = $("#sheet-done"); if (sd2) sd2.addEventListener("click", closeSheet);
}

/* ============ DASHBOARD / PARETO-PLOT (Canvas) ============ */
// Standard: Tokens pro Geld (X) gegen Intelligenz (Y) — ehrliche Rate, kein Kaufversprechen.
let dashX = "tokens";
let dashY = "score";
let dashPareto = true;
let dashGreen = false; // Zielzone default aus (wirkt sonst beliebig)
let dashTargetX = null; // Ziel-Schwelle X (Green Target)
let dashTargetY = null; // Ziel-Schwelle Y (Green Target)
let dashSelected = null; // "planId::model" des angetippten Punkts (Feedback-Ring)
let dashPoints = []; // gerenderte Punkte in CSS-Pixeln (für Hit-Test)

// Quantil für den Bildausschnitt (P2–P98 statt Min/Max: keine halbe Fläche Luft)
function quantile(sorted, q) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * q;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
// CSS-Variablen als echte Farben für Canvas lesen
function cssVar(name, fallback) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) { return fallback; }
}

// Punkt-Wert für eine Metrik
function metricValue(combo, metric) {
  switch (metric) {
    case "tokens": return combo.tokensPer;
    case "req10": return combo.reqPer;
    case "rawtokens": return combo.rawTokensPerMonth;
    case "rawreq": return combo.rawRequestsPerMonth;
    case "score": return combo.score;
    case "price": return combo.price;
    default: return null;
  }
}
// Richtung einer Metrik: "max" = mehr ist besser (Tokens, Requests, Score),
// "min" = weniger ist besser (Preis). Bestimmt Pareto-Frontier + Zielzone.
function metricDir(metric) {
  return metric === "price" ? "min" : "max";
}
// Ist die Achsen-Kombination sinnvoll? (nicht beide Achsen sind "min")
// Preis als EINE Achse ist ok (Trade-off), beide min wäre unsinnig.
function validAxes(x, y) {
  return !(metricDir(x) === "min" && metricDir(y) === "min");
}
// Metrik-Label (i18n); Preis trägt die gewählte Währung im Label
function metricLabel(metric) {
  const map = {
    tokens: rateTokensLabel(), req10: rateReqLabel(), rawtokens: t("dash.m.rawtokens"),
    rawreq: t("dash.m.rawreq"), score: t("dash.m.score"), price: `${t("dash.m.price")} (${currency})`,
  };
  return map[metric] ?? metric;
}
// Kurz-Format für Tooltip
function metricFmt(metric, val) {
  if (val === null || val === undefined) return "-";
  if (metric === "price") return fmtPrice(val); // gewählte Währung (USD/EUR/CNY/...)
  if (metric === "score") return val.toFixed(1);
  return fmtTokens(val);
}

// Pareto-Frontier: Punkte die in beiden Achsen nicht dominiert werden.
// Richtungen werden respektiert: "max" = größer besser, "min" = kleiner besser.
// Ein Punkt p dominiert q, wenn p auf beiden Achsen mindestens so gut ist
// und auf einer besser — gemäß der jeweiligen Richtung.
function paretoFrontier(points) {
  const pts = points.filter((p) => p.x != null && p.y != null);
  if (pts.length < 2) return pts;
  const better = (a, b, dir) => (dir === "min" ? a < b : a > b);
  const atLeast = (a, b, dir) => (dir === "min" ? a <= b : a >= b);
  const dx = metricDir(dashX), dy = metricDir(dashY);
  const frontier = [];
  for (const p of pts) {
    let dominated = false;
    for (const q of pts) {
      if (q === p) continue;
      // q dominiert p?
      const xDom = atLeast(q.x, p.x, dx) && better(q.y, p.y, dy);
      const yDom = atLeast(q.y, p.y, dy) && better(q.x, p.x, dx);
      const eqX = q.x === p.x, eqY = q.y === p.y;
      if (!(eqX && eqY) && (xDom || yDom || (atLeast(q.x, p.x, dx) && atLeast(q.y, p.y, dy) && (q.x !== p.x || q.y !== p.y)))) {
        dominated = true;
        break;
      }
    }
    if (!dominated) frontier.push(p);
  }
  // Sortieren für die Linie: auf X-Achse aufsteigend (unabhängig von Richtung)
  return frontier.sort((a, b) => a.x - b.x);
}

function renderDashboard() {
  const canvas = $("#dash-canvas");
  const note = $("#dash-note");
  const resetBtn = $("#dash-reset-btn");
  if (!canvas || !canvas.getContext) {
    // Versions-Mismatch (altes HTML + neues JS oder umgekehrt): nicht schwarz bleiben
    if (note) note.textContent = lang === "de"
      ? "Plot startet nicht — bitte hart neu laden (Strg+Shift+R), dann passt es wieder."
      : "Plot won't start — please hard-reload (Ctrl+Shift+R).";
    return;
  }
  // Achsen-Guards zuerst: ungültige Auswahl korrigieren, bevor Punkte fallen
  const ALLOWED_Y = ["score", "tokens", "req10", "rawtokens", "rawreq"];
  if (!ALLOWED_Y.includes(dashY)) { dashY = "score"; const ys = $("#dash-y"); if (ys) ys.value = "score"; }
  if (!validAxes(dashX, dashY)) { dashX = "tokens"; const xs = $("#dash-x"); if (xs) xs.value = "tokens"; }
  // Gleiche Filter wie die Tabelle anwenden (Suche, Budget, AI, Privacy)
  let combos = buildCombos();
  if (plansSearch) {
    const q = plansSearch.toLowerCase();
    combos = combos.filter((c) => [c.planName, c.model, c.provider].join(" ").toLowerCase().includes(q));
  }
  if (plansMeter) combos = combos.filter((c) => c.meter === plansMeter);
  if (maxBudget < 300) combos = combos.filter((c) => (c.price ?? 0) <= maxBudget);
  if (minAiScore > 0) combos = combos.filter((c) => (c.score ?? 0) >= minAiScore);
  if (noTrainingOnly) combos = combos.filter((c) => c.noTraining === true);
  if (!includePriceBased) combos = combos.filter((c) => c.dataTier !== "D");

  const points = combos.map((c) => ({
    combo: c,
    x: metricValue(c, dashX),
    y: metricValue(c, dashY),
  })).filter((p) => p.x != null && p.y != null && p.x > 0 && p.y > 0);

  // Canvas-Größe: CSS-Pixel × Gerätepixel-Verhältnis (scharf auf Retina + Mobile)
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(rect.width, 300);
  const cssH = Math.max(rect.height, 240);
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = cssW, H = cssH;
  const PAD_L = Math.max(34, cssW * 0.05), PAD_B = Math.max(30, cssH * 0.08);
  const PAD_T = 14, PAD_R = 12;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const C = {
    grid: cssVar("--border", "#e2e8f0"),
    axis: cssVar("--text-faint", "#94a3b8"),
    text: cssVar("--text-muted", "#64748b"),
    ring: cssVar("--text", "#0f172a"),
    ok: cssVar("--success", "#0d9488"),
    bad: cssVar("--danger", "#dc2626"),
    info: cssVar("--info", "#2563eb"),
    primary: cssVar("--primary", "#0b57d0"),
  };
  // Expliziter Hintergrund: nie ein schwarzes Loch, auch bei Teilfehlern nicht
  ctx.fillStyle = cssVar("--bg-elev", "#ffffff");
  ctx.fillRect(0, 0, W, H);

  if (!points.length) {
    ctx.fillStyle = cssVar("--bg-elev", "#ffffff");
    ctx.fillRect(0, 0, W, H);
    dashPoints = [];
    if (note) note.textContent = t("dash.empty");
    if (resetBtn) { resetBtn.hidden = false; resetBtn.textContent = t("dash.emptyReset"); }
    return;
  }
  if (resetBtn) resetBtn.hidden = true;

  // Skalen: log für Token/Request/Preis-Metriken (riesige Spannen), linear für Score
  const logScale = (m) => m === "tokens" || m === "req10" || m === "rawtokens" || m === "rawreq" || m === "price";
  const xLog = logScale(dashX), yLog = logScale(dashY);
  // Bildausschnitt aus Perzentilen (P2–P98) + 4 % Luft: Daten füllen den Plot,
  // keine halbe Fläche Leerraum. Linear startet am Daten-Minimum, nicht bei 0.
  const xSorted = points.map((p) => p.x).sort((a, b) => a - b);
  const ySorted = points.map((p) => p.y).sort((a, b) => a - b);
  const pad = (lo, hi, log) => {
    if (!(hi > lo)) return [lo * 0.9 || 0.9, lo * 1.1 || 1.1];
    if (log) return [lo * 0.96, hi * 1.04];
    const span = hi - lo, m = span * 0.08 || 1;
    return [lo - m, hi + m];
  };
  const [xMin, xMax] = pad(quantile(xSorted, 0.02), quantile(xSorted, 0.98), xLog);
  const [yMin, yMax] = pad(quantile(ySorted, 0.02), quantile(ySorted, 0.98), yLog);

  const sx = (v) => PAD_L + (xLog ? (Math.log(v) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin)) : (v - xMin) / (xMax - xMin)) * plotW;
  const sy = (v) => H - PAD_B - (yLog ? (Math.log(v) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin)) : (v - yMin) / (yMax - yMin)) * plotH;

  // Identische Datenpunkte leicht versetzen (deterministischer Jitter), sonst verdecken sie sich
  const seen = new Map();
  const px = points.map((p) => {
    const key = `${p.x.toFixed(6)}:${p.y.toFixed(6)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    let jx = 0, jy = 0;
    if (n > 0) { const ang = n * 2.4, rad = 5 + 3 * n; jx = Math.cos(ang) * rad; jy = Math.sin(ang) * rad; }
    return { ...p, px: sx(p.x) + jx, py: sy(p.y) + jy };
  });

  const axesValid = validAxes(dashX, dashY);
  const dx = metricDir(dashX), dy = metricDir(dashY);
  let targetX = dashTargetX;
  let targetY = dashTargetY;
  if (targetX === null || targetX === undefined) targetX = quantile(xSorted, 0.5); // Median
  if (targetY === null || targetY === undefined) targetY = quantile(ySorted, 0.5); // Median
  const tX = sx(Math.min(Math.max(targetX, xMin), xMax));
  const tY = sy(Math.min(Math.max(targetY, yMin), yMax));

  ctx.clearRect(0, 0, W, H);
  ctx.font = "11px Inter, system-ui, sans-serif";
  // Zielzone (nur wenn eingeschaltet)
  if (dashGreen && axesValid) {
    ctx.save();
    ctx.fillStyle = C.ok; ctx.globalAlpha = 0.12;
    if (dx === "max" && dy === "max") ctx.fillRect(tX, PAD_T, PAD_L + plotW - tX, Math.max(0, tY - PAD_T));
    else if (dx === "min" && dy === "max") ctx.fillRect(PAD_L, PAD_T, Math.max(0, tX - PAD_L), Math.max(0, tY - PAD_T));
    else if (dx === "max" && dy === "min") ctx.fillRect(tX, tY, PAD_L + plotW - tX, Math.max(0, H - PAD_B - tY));
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = C.ok; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(tX, PAD_T); ctx.lineTo(tX, H - PAD_B); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD_L, tY); ctx.lineTo(W - PAD_R, tY); ctx.stroke();
    ctx.restore();
  }
  // Ticks + Grid (Mobile: höchstens 4)
  const maxTicks = cssW < 760 ? 4 : 6;
  const tickVals = (log, min, max, n) => {
    if (log) {
      const out = [];
      let v = Math.pow(10, Math.ceil(Math.log10(min)));
      while (v <= max && out.length < 8) { if (v >= min) out.push(v); v *= 10; }
      return out;
    }
    const out = [];
    for (let i = 0; i <= n; i++) out.push(min + ((max - min) * i) / n);
    return out;
  };
  const tickFmt = (m, v) => m === "price" ? fmtPrice(v) : (m === "score" ? v.toFixed(1) : fmtTokens(v));
  const xTicks = tickVals(xLog, xMin, xMax, maxTicks);
  const yTicks = tickVals(yLog, yMin, yMax, maxTicks);
  ctx.save();
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.fillStyle = C.axis; ctx.textAlign = "center"; ctx.textBaseline = "top";
  for (const v of xTicks) {
    const X = sx(v);
    ctx.beginPath(); ctx.moveTo(X, PAD_T); ctx.lineTo(X, H - PAD_B); ctx.stroke();
    ctx.fillText(tickFmt(dashX, v), X, H - PAD_B + 6);
  }
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (const v of yTicks) {
    const Y = sy(v);
    ctx.beginPath(); ctx.moveTo(PAD_L, Y); ctx.lineTo(W - PAD_R, Y); ctx.stroke();
    ctx.fillText(tickFmt(dashY, v), PAD_L - 6, Y);
  }
  // Achsen
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD_L, H - PAD_B); ctx.lineTo(W - PAD_R, H - PAD_B); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PAD_L, PAD_T); ctx.lineTo(PAD_L, H - PAD_B); ctx.stroke();
  ctx.fillStyle = C.text; ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(metricLabel(dashX), PAD_L + plotW / 2, H - 6);
  ctx.save();
  ctx.translate(14, PAD_T + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
  ctx.fillText(metricLabel(dashY), 0, 0);
  ctx.restore();
  ctx.restore();
  // Pareto-Linie (wird unten im geclippten Bereich gezeichnet)
  const frontier = dashPareto ? paretoFrontier(points) : [];
  // Punkte: klein genug, dass 400 davon unterscheidbar bleiben (Trefferfläche bleibt groß)
  const frontierKeys = new Set(frontier.map((f) => `${f.combo.planId}::${f.combo.model}`));
  const touchSize = cssW < 760;
  // Zeichenfläche beschneiden: nichts ragt über Achsen/Labels hinaus
  ctx.save();
  ctx.beginPath();
  ctx.rect(PAD_L, PAD_T, plotW, plotH);
  ctx.clip();
  if (frontier.length > 1) {
    ctx.save();
    ctx.strokeStyle = C.primary; ctx.lineWidth = 1.75; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    frontier.forEach((p, i) => { const X = sx(p.x), Y = sy(p.y); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke();
    ctx.restore();
  }
  for (const p of px) {
    const isFrontier = frontierKeys.has(`${p.combo.planId}::${p.combo.model}`);
    const r = isFrontier ? (touchSize ? 5.5 : 4.5) : (touchSize ? 4 : 3);
    p.pr = r;
    ctx.save();
    ctx.fillStyle = isFrontier ? C.primary
      : (p.combo.noTraining === true ? C.ok : (p.combo.noTraining === false ? C.bad : C.info));
    if (p.combo.noTraining === false) {
      ctx.translate(p.px, p.py); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
    } else if (p.combo.noTraining !== true) {
      const h = r * 1.8;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py - h / 2); ctx.lineTo(p.px + r, p.py + h / 2); ctx.lineTo(p.px - r, p.py + h / 2);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // Auswahl-Ring: zeigt, welcher Punkt aktiv ist
  if (dashSelected) {
    const sel = px.find((p) => `${p.combo.planId}::${p.combo.model}` === dashSelected);
    if (sel) {
      ctx.save();
      ctx.strokeStyle = C.ring; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(sel.px, sel.py, (sel.pr ?? 6) + 4.5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    } else dashSelected = null;
  }
  ctx.restore(); // Clip der Zeichenfläche aufheben
  dashPoints = px;
  if (note) {
    if (dashPareto && frontier.length === 1 && points.length > 1) {
      // Genau 1 Pareto-Punkt: dieser Plan dominiert alle anderen auf beiden Achsen.
      note.textContent = lang === "de"
        ? `1 Pareto-Punkt: dieser Plan dominiert alle anderen (${points.length} Kombinationen im Plot)`
        : `1 Pareto point: this plan dominates all others (${points.length} combinations plotted)`;
    } else {
      note.textContent = `${points.length} ${lang === "de" ? "Kombinationen im Plot" : "combinations plotted"} · ${frontier.length} ${lang === "de" ? "Pareto-Punkte" : "Pareto points"}`;
    }
  }
}

// Klick auf Punkt → Detail-Panel mit Plan/Modell/Werten füllen
function showDashDetail(p) {
  const content = $("#dash-detail-content");
  const empty = $("#dash-detail-empty");
  if (!content) return;
  if (!p) { content.hidden = true; if (empty) empty.style.display = ""; return; }
  if (empty) empty.style.display = "none";
  content.hidden = false;
  const priv = p.combo.noTraining === true
    ? `<span class="badge badge-green">${t("plans.badge.noTraining")}</span>`
    : (p.combo.noTraining === false ? `<span class="badge badge-red">${lang === "de" ? "trainiert" : "trains on data"}</span>` : "");
  // Keine doppelten Zeilen: Was schon als Achse oben steht, unten nicht wiederholen
  const rows = [
    `<div class="dd-row"><span class="k">${metricLabel(dashX)}</span><span class="v">${metricFmt(dashX, p.x)}</span></div>`,
    `<div class="dd-row"><span class="k">${metricLabel(dashY)}</span><span class="v">${metricFmt(dashY, p.y)}</span></div>`,
  ];
  if (dashY !== "score") rows.push(`<div class="dd-row"><span class="k">AI ${lang === "de" ? "Score" : "score"}</span><span class="v">${p.combo.score !== null ? p.combo.score.toFixed(1) : "-"}</span></div>`);
  rows.push(`<div class="dd-row"><span class="k">${t("plans.th.price")}</span><span class="v">${p.combo.price !== null ? fmtPrice(p.combo.price) : "-"}</span></div>`);
  if (dashX !== "tokens") rows.push(`<div class="dd-row"><span class="k">${rateTokensLabel()}</span><span class="v">${fmtTokens(p.combo.tokensPer)}</span></div>`);
  rows.push(`<div class="dd-row"><span class="k">${t("plans.th.rawtokens")}</span><span class="v">${fmtTokens(p.combo.rawTokensPerMonth)}</span></div>`);
  content.innerHTML = `
    <div class="dd-name">${escapeHtml(p.combo.model)}</div>
    <div class="dd-plan">${escapeHtml(p.combo.planName)} · ${escapeHtml(p.combo.provider)}</div>
    ${rows.join("")}
    ${priv ? `<div class="dd-badge">${priv}</div>` : ""}
  `;
  // Mobile: Detail-Panel ins Bild holen (Plot ist darüber, Panel darunter)
  try {
    if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
      document.getElementById("dash-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } catch (e) { /* ignore */ }
}

// Tooltip + Auswahl auf Canvas (Hover, Klick, Touch mit Hit-Test)
function bindDashTooltip() {
  const canvas = $("#dash-canvas");
  const tip = document.getElementById("dash-tooltip") || (() => { const d = document.createElement("div"); d.id = "dash-tooltip"; d.className = "dash-tooltip"; document.body.appendChild(d); return d; })();
  if (!canvas) return;
  const pick = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    const x = clientX - r.left, y = clientY - r.top;
    let bestP = null, bestD = 30; // Treffer-Radius in CSS-Pixeln
    for (const p of dashPoints) {
      const d = Math.hypot(p.px - x, p.py - y);
      if (d < bestD) { bestD = d; bestP = p; }
    }
    return bestP;
  };
  const showTip = (p, clientX, clientY) => {
    tip.style.display = "block";
    tip.textContent = `${p.combo.planName} · ${p.combo.model} · ${metricLabel(dashX)} ${metricFmt(dashX, p.x)} · ${metricLabel(dashY)} ${metricFmt(dashY, p.y)}`;
    tip.style.left = `${clientX}px`;
    tip.style.top = `${clientY}px`;
  };
  const select = (p) => {
    if (!p) return;
    dashSelected = `${p.combo.planId}::${p.combo.model}`;
    showDashDetail(p);
    renderDashboard(); // Ring zeichnen
  };
  canvas.addEventListener("mousemove", (e) => {
    if (e.pointerType === "touch") return;
    const p = pick(e.clientX, e.clientY);
    if (p) showTip(p, e.clientX, e.clientY);
    else tip.style.display = "none";
  });
  canvas.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  canvas.addEventListener("click", (e) => {
    tip.style.display = "none";
    select(pick(e.clientX, e.clientY));
  });
  // Touch: Antippen wählt direkt (kein Hover auf Mobile)
  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    const p = pick(t.clientX, t.clientY);
    if (p) { e.preventDefault(); tip.style.display = "none"; select(p); }
  }, { passive: false });
}

// Dashboard-Controls initialisieren
function initDashboard() {
  const xSel = $("#dash-x"), ySel = $("#dash-y");
  if (xSel) { xSel.value = dashX; xSel.addEventListener("change", (e) => { dashX = e.target.value; syncViewUrl(); renderDashboard(); }); }
  if (ySel) { ySel.value = dashY; ySel.addEventListener("change", (e) => { dashY = e.target.value; syncViewUrl(); renderDashboard(); }); }
  const pSel = $("#dash-pareto");
  if (pSel) pSel.addEventListener("change", (e) => { dashPareto = e.target.checked; renderDashboard(); });
  const gSel = $("#dash-green");
  if (gSel) { gSel.checked = dashGreen; gSel.addEventListener("change", (e) => { dashGreen = e.target.checked; renderDashboard(); }); }
  // Ziel-Schwellen (Green Target)
  const tx = $("#dash-target-x"), ty = $("#dash-target-y");
  if (tx) tx.addEventListener("input", (e) => { dashTargetX = e.target.value === "" ? null : parseFloat(e.target.value); renderDashboard(); });
  if (ty) ty.addEventListener("input", (e) => { dashTargetY = e.target.value === "" ? null : parseFloat(e.target.value); renderDashboard(); });
  // Leerer Plot: Filter zurücksetzen
  const rb = $("#dash-reset-btn");
  if (rb) rb.addEventListener("click", () => { resetAllFilters(); });
  bindDashTooltip();
}

// Alle Listen-Filter auf Anfang (für den Reset-Button am leeren Plot)
function resetAllFilters() {
  plansSearch = ""; plansMeter = ""; maxBudget = 300; minAiScore = 0; noTrainingOnly = false;
  const ps = $("#plans-search"); if (ps) ps.value = "";
  const pm = $("#plans-meter-filter"); if (pm) pm.value = "";
  const pt = $("#privacy-toggle"); if (pt) pt.checked = false;
  syncFilterUI();
  rerender();
}

// Ansicht in der URL teilen: Achsen + Rechner (Filter bleiben lokal)
function syncViewUrl() {
  try {
    const p = new URLSearchParams(location.search);
    p.set("lang", lang);
    p.set("dx", dashX); p.set("dy", dashY);
    p.set("budget", String(calcBudget)); p.set("score", String(calcScore));
    history.replaceState(null, "", `${location.pathname}?${p.toString()}`);
  } catch (e) { /* ignore */ }
}

/* ============ BUDGET-RECHNER (kein Stacking: ein Abo pro Konto) ============ */
// Vergleicht EINZELPLÄNE innerhalb des Budgets: pro Plan das beste Modell
// (meiste Tokens/Monat), sortiert nach Tokens/Monat. Budget in gewählter Währung.
let calcBudget = 20;
let calcScore = 0;
// Neutraler Rang je Plan im aktuellen Rechner-Ergebnis (grau, keine Empfehlung)
let calcRanks = new Map();
function renderCalculator() {
  const list = $("#calc-results");
  const empty = $("#calc-empty");
  if (!list || !data) return;
  const rate = exchangeRates[currency] ?? 1;
  const budgetUsd = calcBudget / rate;
  let combos = buildCombos().filter((c) => c.price != null && c.price <= budgetUsd + 1e-9);
  if (calcScore > 0) combos = combos.filter((c) => (c.score ?? 0) >= calcScore);
  if (!includePriceBased) combos = combos.filter((c) => c.dataTier !== "D");
  // Pro Plan nur das beste Modell (Tokens/Monat), dann Top 5
  const best = new Map();
  for (const c of combos) {
    const cur = best.get(c.planId);
    if (!cur || (c.rawTokensPerMonth ?? 0) > (cur.rawTokensPerMonth ?? 0)) best.set(c.planId, c);
  }
  const top = [...best.values()]
    .filter((c) => c.rawTokensPerMonth != null)
    .sort((a, b) => b.rawTokensPerMonth - a.rawTokensPerMonth)
    .slice(0, 5);
  // Ränge für die neutrale Markierung in der Tabelle (keine Empfehlung, nur Rang)
  calcRanks = new Map(top.map((c, i) => [c.planId, i + 1]));
  const budgetOut = $("#calc-budget-out");
  if (budgetOut) budgetOut.textContent = fmtPrice(budgetUsd);
  const curOut = $("#calc-cur");
  if (curOut) curOut.textContent = curSym();
  const scoreOut = $("#calc-score-out");
  if (scoreOut) scoreOut.textContent = calcScore === 0 ? (lang === "de" ? "keins" : "none") : String(calcScore);
  if (!top.length) {
    list.innerHTML = "";
    calcRanks = new Map();
    renderPlans();
    if (empty) { empty.hidden = false; empty.textContent = t("calc.empty"); }
    return;
  }
  if (empty) empty.hidden = true;
  // Neutrale Liste (sortiert, kein Sieger-Podest): Zahlen, keine Beratung
  list.innerHTML = top.map((c, i) => {
    const left = budgetUsd - c.price;
    return `<div class="calc-row">`
      + `<div class="calc-main"><span class="calc-ranknum">${i + 1}.</span><span class="calc-plan">${escapeHtml(c.planName)}</span>`
      + `<span class="calc-model">${escapeHtml(c.model)}</span></div>`
      + `<div class="calc-nums"><span class="num strong">${fmtTokens(c.rawTokensPerMonth)}</span>`
      + `<span class="muted">${t("calc.tokensMo")}</span></div>`
      + `<div class="calc-nums"><span class="num">${fmtPrice(c.price)}</span>`
      + `<span class="muted">${left > 0.005 ? fmtPrice(left) + " " + t("calc.leftover") : t("calc.price")}</span></div>`
      + `</div>`;
  }).join("");
}
function initCalculator() {
  const b = $("#calc-budget");
  if (b) {
    b.value = calcBudget;
    b.addEventListener("input", (e) => {
      calcBudget = Math.max(0, parseFloat(e.target.value) || 0);
      syncViewUrl();
      renderCalculator();
    });
  }
  const s = $("#calc-score");
  if (s) {
    s.value = calcScore;
    s.addEventListener("input", (e) => {
      calcScore = parseInt(e.target.value, 10) || 0;
      syncViewUrl();
      renderCalculator();
    });
  }
}

/* ============ BURGER-MENÜ + BACK-TO-TOP (Mobile-Navigation) ============ */
// Auf Mobile wandern Sprache, Währung und Theme ins Menü (Knoten werden
// verschoben, keine Listener gehen verloren); auf Desktop zurück in die Nav.
function initBurger() {
  const btn = $("#burger-btn");
  const panel = $("#burger-panel");
  if (!btn || !panel) return;
  const navControls = $("#nav-controls");
  const slots = { "currency-select": $("#slot-currency"), "theme-toggle": $("#slot-theme"), ".lang-switch": $("#slot-lang") };
  const mq = window.matchMedia("(max-width: 760px)");
  const place = () => {
    if (!navControls) return;
    const keys = ["currency-select", "theme-toggle", ".lang-switch"];
    for (const k of keys) {
      const el = k.startsWith(".") ? document.querySelector(k) : document.getElementById(k);
      if (!el) continue;
      const target = mq.matches ? slots[k] : navControls;
      if (target && el.parentElement !== target) target.appendChild(el);
    }
    if (!mq.matches) { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  };
  try { mq.addEventListener("change", place); } catch (e) { /* ignore */ }
  place();
  btn.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  });
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }));
}

function initBackTop() {
  const b = $("#back-top");
  if (!b) return;
  const onScroll = () => { b.hidden = !(window.scrollY > 900); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Methodik-Details: Zusammenfassungstext folgt dem Aufklapp-Zustand
function syncMethodMore() {
  const d = document.querySelector(".method-more");
  const s = d?.querySelector("summary");
  if (d && s) s.textContent = d.open ? t("method.less") : t("method.more");
}
function initMethodMore() {
  const d = document.querySelector(".method-more");
  if (d) d.addEventListener("toggle", syncMethodMore);
}

/* ============ FAMILIENVERGLEICH + CHANGELOG (reine Zahlen, kein Podest) ============ */
function renderFamily() {
  const tbody = $("#fcomp-tbody");
  if (!tbody || !data) return;
  const rows = (data.familyComparisons ?? []).slice().sort((a, b) => b.advantagePercent - a.advantagePercent);
  if (!rows.length) { tbody.innerHTML = ""; return; }
  tbody.innerHTML = rows.map((r) => {
    const win = r.winner && r.winner !== "draw"
      ? `<span class="strong">${escapeHtml(r.winner)}</span>`
      : `<span class="muted">${t("fcomp.winner.draw")}</span>`;
    return `<tr><td data-label="${t("fcomp.th.family")}"><span class="strong">${escapeHtml(r.family)}</span></td>`
      + `<td data-label="${t("fcomp.th.planA")}">${escapeHtml(r.planA)}<div class="muted num">${fmtNum(r.requestsA)} ${t("fcomp.th.reqA")}</div></td>`
      + `<td data-label="${t("fcomp.th.planB")}">${escapeHtml(r.planB)}<div class="muted num">${fmtNum(r.requestsB)} ${t("fcomp.th.reqB")}</div></td>`
      + `<td data-label="${t("fcomp.th.edge")}">${win}<div class="muted num">${fmtPct(r.advantagePercent)}</div></td></tr>`;
  }).join("");
}

function renderChangelog() {
  const list = $("#cl-list");
  if (!list || !data) return;
  const entries = data.changelog?.entries ?? [];
  list.innerHTML = entries.map((e) => {
    let date = e.date;
    try { date = new Date(e.date + "T00:00:00").toLocaleDateString(lang === "de" ? "de-DE" : "en-US"); } catch (err) { /* keep */ }
    return `<div class="cl-row"><span class="cl-date num">${escapeHtml(date)}</span><span>${escapeHtml(e.text)}</span></div>`;
  }).join("");
}

function renderFormula() {
  const block = $("#formula-block");
  const m = data.methodology ?? {};
  const title = `<div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">${t("method.formula.title")}</div>`;
  const perUnit = lang === "de"
    ? "Requests pro 1 $ = Requests / Monat ÷ bezahlter Preis · Tokens pro 1 $ = Requests pro 1 $ × Tokens pro Request"
    : "Requests per $1 = monthly requests ÷ paid price · Tokens per $1 = requests per $1 × tokens per request";
  block.innerHTML = title + `<div>${escapeHtml(m.costPerRequest ?? "")}</div><div style="margin-top:10px">${escapeHtml(perUnit)}</div>`;
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------------- Data loading ---------------- */
async function loadData() {
  const main = $("#main");
  try {
    const resp = await fetch(DATA_URL, { cache: "no-cache" });
    if (!resp.ok) throw new Error("HTTP " + resp.status + " for " + DATA_URL);
    data = await resp.json();
    try { localStorage.setItem("cpc-data", JSON.stringify({ at: data.generatedAt, data })); } catch (e) { /* Quota: egal */ }
    buildModelPrivacyMap(); // Modell-Privacy-Map aufbauen, bevor gerendert wird
    // Loading-Note entfernen
    const note = document.getElementById("loading-note");
    if (note) note.remove();
    applyI18n();
    // Kurse aus latest.json (fx-Source) → Preise in gewählter Währung rendern
    loadExchangeRates();
    renderPlans();
    renderDashboard();
  } catch (e) {
    console.error("Coding Plan Compare: Daten konnten nicht geladen werden:", e);
    // Offline-Fallback: zuletzt gecachte Daten mit Stand-Hinweis
    try {
      const cached = JSON.parse(localStorage.getItem("cpc-data") || "null");
      if (cached?.data) {
        data = cached.data;
        buildModelPrivacyMap();
        const note = document.getElementById("loading-note");
        if (note) note.remove();
        applyI18n();
        loadExchangeRates();
        renderPlans();
        renderDashboard();
        toast(lang === "de"
          ? `Offline: Stand vom ${new Date(cached.at).toLocaleDateString("de-DE")}`
          : `Offline: snapshot from ${new Date(cached.at).toLocaleDateString("en-US")}`);
        return;
      }
    } catch (err) { /* kein Cache */ }
    const note = document.getElementById("loading-note");
    if (note) note.remove();
    const errBox = document.createElement("div");
    errBox.className = "state-box";
    errBox.innerHTML = `
      <p style="font-size:18px;font-weight:700;margin:0 0 8px">${t("error")}</p>
      <p style="font-size:14px;color:var(--text-muted);margin:0 0 16px" class="mono">${(e.message || e).replace(/</g, "&lt;")}</p>
      <button class="btn" onclick="location.reload()">↻ ${lang === "de" ? "Erneut versuchen" : "Retry"}</button>`;
    const mainEl = $("#main");
    if (mainEl) mainEl.prepend(errBox);
  }
}

/* ---------------- Init ---------------- */
function init() {
  // Language from URL or localStorage or browser
  const params = new URLSearchParams(location.search);
  const urlLang = params.get("lang");
  const storedLang = localStorage.getItem("cpc-lang");
  if (urlLang === "en" || urlLang === "de") lang = urlLang;
  else if (storedLang === "en" || storedLang === "de") lang = storedLang;
  else lang = navigator.language?.startsWith("de") ? "de" : "en";

  // Theme
  const urlTheme = params.get("theme");
  const storedTheme = localStorage.getItem("cpc-theme");
  theme = urlTheme === "dark" || urlTheme === "light" ? urlTheme : (storedTheme === "dark" ? "dark" : "light");
  applyTheme();

  // Währung (gespeichert oder Standard USD) + tägliche Kurse laden
  const storedCur = localStorage.getItem("cpc-currency");
  currency = ["USD", "EUR", "CNY", "GBP", "JPY"].includes(storedCur) ? storedCur : "USD";
  loadExchangeRates();

  // Ansicht aus URL (teilbare Links): Achsen + Rechner
  const urlDx = params.get("dx");
  if (["tokens", "req10", "rawtokens", "rawreq", "price"].includes(urlDx)) dashX = urlDx;
  const urlDy = params.get("dy");
  if (["score", "tokens", "req10", "rawtokens", "rawreq"].includes(urlDy)) dashY = urlDy;
  const urlBudget = parseFloat(params.get("budget"));
  if (isFinite(urlBudget) && urlBudget >= 0) calcBudget = urlBudget;
  const urlScore = parseInt(params.get("score") ?? "", 10);
  if (isFinite(urlScore) && urlScore >= 0) calcScore = urlScore;

  // Events
  $$(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem("cpc-lang", lang);
      const p = new URLSearchParams(location.search);
      p.set("lang", lang);
      history.replaceState(null, "", `${location.pathname}?${p.toString()}`);
      applyI18n();
    });
  });
  $("#theme-toggle").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme();
    const p = new URLSearchParams(location.search);
    if (theme === "dark") p.set("theme", "dark"); else p.delete("theme");
    history.replaceState(null, "", `${location.pathname}?${p.toString()}`);
  });

  // Währungs-Umschalter (einheitliche Preis-Anzeige)
  const currencySel = $("#currency-select");
  if (currencySel) {
    currencySel.value = currency;
    currencySel.addEventListener("change", (e) => {
      currency = e.target.value;
      localStorage.setItem("cpc-currency", currency);
      renderAll();
    });
  }

  // Filter-Event-Listener (aktualisieren Tabelle UND Dashboard; rerender ist global)
  const plansSearchEl = $("#plans-search");
  if (plansSearchEl) plansSearchEl.addEventListener("input", (e) => { plansSearch = e.target.value; rerender(); });
  const plansMeterEl = $("#plans-meter-filter");
  if (plansMeterEl) plansMeterEl.addEventListener("change", (e) => { plansMeter = e.target.value; rerender(); });

  // Filter-Toggle: ein-/ausklappen
  const filterToggle = $("#filter-toggle");
  if (filterToggle) filterToggle.addEventListener("click", () => toggleFilters());

  // Sort-Selector (Mobile): ändert Sortierung
  const sortKeySel = $("#sort-select-key");
  if (sortKeySel) sortKeySel.addEventListener("change", (e) => {
    plansSort.key = e.target.value;
    plansSort.dir = $("#sort-select-dir")?.value || "desc";
    renderPlans();
  });
  const sortDirSel = $("#sort-select-dir");
  if (sortDirSel) sortDirSel.addEventListener("change", (e) => {
    plansSort.dir = e.target.value;
    renderPlans();
  });

  // Budget-Slider (max $/Monat)
  const budgetSlider = $("#budget-slider");
  if (budgetSlider) budgetSlider.addEventListener("input", (e) => {
    maxBudget = parseInt(e.target.value, 10) || 300;
    syncFilterUI();
    rerender();
  });

  // AI-Score-Slider (mindestens)
  const aiSlider = $("#ai-slider");
  if (aiSlider) aiSlider.addEventListener("input", (e) => {
    minAiScore = parseInt(e.target.value, 10) || 0;
    syncFilterUI();
    rerender();
  });

  // Privacy-Filter: "No training on my data"
  const privacyToggle = $("#privacy-toggle");
  if (privacyToggle) privacyToggle.addEventListener("change", (e) => {
    noTrainingOnly = e.target.checked;
    rerender();
  });
  // Tier-D-Filter: preisbasierte Pläne (Kimi) einblenden
  const tierdToggle = $("#tierd-toggle");
  if (tierdToggle) tierdToggle.addEventListener("change", (e) => {
    includePriceBased = e.target.checked;
    rerender();
  });

  // Spalten-Picker: Dropdown öffnen/schließen
  const colBtn = $("#col-picker-btn");
  const colPanel = $("#col-picker-panel");
  if (colBtn && colPanel) {
    colBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      colPanel.hidden = !colPanel.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#col-picker")) colPanel.hidden = true;
    });
  }
  // Spalten-Checkboxen: Sichtbarkeit togglen + speichern
  document.querySelectorAll("#col-picker-panel input[data-col]").forEach((box) => {
    box.addEventListener("change", () => {
      const col = box.dataset.col;
      if (box.checked) { if (!visibleColumns.includes(col)) visibleColumns.push(col); }
      else { visibleColumns = visibleColumns.filter((c) => c !== col); }
      saveColumns();
      renderPlans();
    });
  });
  syncColumnPicker();
  initDashboard();
  initCalculator();
  initSheet();
  initBurger();
  initBackTop();
  initMethodMore();

  // Chart-Auflösung dynamisch an Fenstergröße koppeln (debounced)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderDashboard(), 150);
  });

  // Loading-Hinweis (OHNE #main zu überschreiben — die Sections enthalten die Ziel-Container
  // und dürfen nicht gelöscht werden, sonst crasht renderStats auf null-Elementen)
  const loadingNote = document.createElement("div");
  loadingNote.id = "loading-note";
  loadingNote.style.cssText = "text-align:center;padding:24px;color:var(--text-muted);font-size:15px";
  loadingNote.textContent = t("loading");
  const mainEl = $("#main");
  // Nur anhängen, nicht ersetzen
  if (mainEl && !document.getElementById("loading-note")) mainEl.prepend(loadingNote);
  applyI18n();
  loadData();
}

document.addEventListener("DOMContentLoaded", init);

})(); /* Ende Idempotenz-Schutz */
