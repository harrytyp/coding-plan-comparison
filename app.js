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
    "hero.sources": "11 live sources",
    "hero.free": "Free · open data · no affiliate links",
    "stats.plans": "Plans tracked",
    "stats.comparable": "Directly comparable",
    "stats.comparable-sub": "with full model pricing",
    "stats.models": "Model families",
    "stats.models-sub": "matched across plans",
    "stats.sources": "Live sources",
    "stats.sources-sub": "official feeds & docs",
    "plans.h2": "The plans",
    "plans.sub": "Every subscription we track, with its real meter: credits, requests, dollar-usage or prompts. Prices are the paid checkout price, not the advertised one.",
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
    "plans.th.req10": "Requests / $10",
    "plans.th.rawtokens": "Tokens / mo",
    "plans.th.rawreq": "Requests / mo",
    "plans.th.privacy": "Privacy",
    "plans.budget": "Max $/mo",
    "plans.aiScore": "Min AI score",
    "plans.noTraining": "No training on my data",
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
    "sort.req10": "Requests / $10",
    "sort.rawtokens": "Tokens / mo",
    "sort.rawreq": "Requests / mo",
    "sort.price": "Plan price",
    "sort.plan": "Plan",
    "sort.model": "Model",
    "sort.desc": "desc",
    "sort.asc": "asc",
    "dash.h3": "Pareto dashboard",
    "dash.sub": "Each dot is a plan+model combo. The Pareto line connects the best trade-offs; the green quarter is the target zone. Uses the filters above.",
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
    "dash.m.tokens": "Tokens / $",
    "dash.m.req10": "Requests / $10",
    "dash.m.rawtokens": "Tokens / mo",
    "dash.m.rawreq": "Requests / mo",
    "dash.m.score": "AI score",
    "dash.m.price": "Plan price / mo",
    "plans.badge.noTraining": "no training",
    "plans.badge.zeroRetention": "zero retention",
    "plans.badge.retention": "retention {d}d",
    "models.searchPh": "Filter models...",
    "models.h2": "Model for model, per $10",
    "models.sub": "Averaging plans hides the truth: cheap models inflate the mean. We compare the same model family across plans, scaled to exactly $10 paid.",
    "models.th.model": "Model family",
    "models.th.planA": "Plan A",
    "models.th.req": "Requests / $10",
    "models.th.planB": "Plan B",
    "models.th.winner": "Winner",
    "models.th.edge": "Edge",
    "models.winner.draw": "Draw",
    "models.edge": "edge",
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
    "foot.product": "Product",
    "foot.plans": "Plans",
    "foot.models": "Model comparison",
    "foot.method": "Methodology",
    "foot.faq": "FAQ",
    "foot.data": "Data",
    "foot.json": "latest.json (API)",
    "foot.repo": "GitHub",
    "foot.sources": "sources.yml",
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
    "legal.imprint.body": "<p>This website is operated by an individual maintainer on a non-commercial, informational basis.</p><p><span class=\"legal-placeholder\">[Operator name]</span><br><span class=\"legal-placeholder\">[Address / contact email]</span></p><p>If you offer this service commercially or target the DACH region, you may be required by law (e.g. §5 DDG in Germany) to publish your full name, address, and contact details here.</p>",
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
    "hero.sources": "11 Live-Quellen",
    "hero.free": "Kostenlos · offene Daten · keine Affiliate-Links",
    "stats.plans": "Erfasste Pläne",
    "stats.comparable": "Direkt vergleichbar",
    "stats.comparable-sub": "mit vollständigem Modell-Pricing",
    "stats.models": "Modell-Familien",
    "stats.models-sub": "über Pläne gematcht",
    "stats.sources": "Live-Quellen",
    "stats.sources-sub": "offizielle Feeds & Docs",
    "plans.h2": "Die Pläne",
    "plans.sub": "Jedes Abo mit seinem echten Meter: Credits, Requests, Dollar-Usage oder Prompts. Preise sind der bezahlte Checkout-Preis, nicht der beworbene.",
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
    "plans.th.req10": "Requests / $10",
    "plans.th.rawtokens": "Tokens / Monat",
    "plans.th.rawreq": "Requests / Monat",
    "plans.th.privacy": "Datenschutz",
    "plans.budget": "Max $/Monat",
    "plans.aiScore": "Min. AI-Score",
    "plans.noTraining": "Kein Training auf meinen Daten",
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
    "sort.req10": "Requests / $10",
    "sort.rawtokens": "Tokens / Monat",
    "sort.rawreq": "Requests / Monat",
    "sort.price": "Planpreis",
    "sort.plan": "Plan",
    "sort.model": "Modell",
    "sort.desc": "absteigend",
    "sort.asc": "aufsteigend",
    "dash.h3": "Pareto-Dashboard",
    "dash.sub": "Jeder Punkt ist eine Plan+Modell-Kombination. Die Pareto-Linie verbindet die besten Kompromisse; das grüne Viertel ist die Zielzone. Nutzt die Filter oben.",
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
    "dash.m.tokens": "Tokens / $",
    "dash.m.req10": "Requests / $10",
    "dash.m.rawtokens": "Tokens / Monat",
    "dash.m.rawreq": "Requests / Monat",
    "dash.m.score": "AI-Score",
    "dash.m.price": "Planpreis / Monat",
    "plans.badge.noTraining": "kein Training",
    "plans.badge.zeroRetention": "Zero Retention",
    "plans.badge.retention": "Speicherung {d} T",
    "view.models": "Modell-Vergleich",
    "models.searchPh": "Modelle filtern...",
    "models.h2": "Modell für Modell, pro 10 $",
    "models.sub": "Mittelwerte verschleiern die Wahrheit: Billige Modelle blähen den Schnitt auf. Wir vergleichen dieselbe Modell-Familie über Pläne, skaliert auf exakt 10 $ bezahlt.",
    "models.th.model": "Modell-Familie",
    "models.th.planA": "Plan A",
    "models.th.req": "Requests / 10 $",
    "models.th.planB": "Plan B",
    "models.th.winner": "Gewinner",
    "models.th.edge": "Vorsprung",
    "models.winner.draw": "Unentschieden",
    "models.edge": "Vorsprung",
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
    "foot.product": "Produkt",
    "foot.plans": "Pläne",
    "foot.models": "Modellvergleich",
    "foot.method": "Methodik",
    "foot.faq": "FAQ",
    "foot.data": "Daten",
    "foot.json": "latest.json (API)",
    "foot.repo": "GitHub",
    "foot.sources": "sources.yml",
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
    "legal.imprint.body": "<p>Diese Website wird von einem einzelnen Betreiber auf nicht-kommerzieller, informativer Basis betrieben.</p><p><span class=\"legal-placeholder\">[Name des Betreibers]</span><br><span class=\"legal-placeholder\">[Adresse / Kontakt-E-Mail]</span></p><p>Falls du dieses Angebot kommerziell betreibst oder die DACH-Region anvisierst, kannst du gesetzlich verpflichtet sein (z.B. §5 DDG in Deutschland), hier deinen vollständigen Namen, Anschrift und Kontaktdaten zu veröffentlichen.</p>",
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
    el.textContent = t(key);
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
}

/* ---------------- Theme ---------------- */
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("cpc-theme", theme);
}

/* ---------------- Rendering ---------------- */
function renderAll() {
  if (!data) return;
  renderStats();
  renderPlans();
  renderDashboard();
  renderFormula();
  bindSortHeader("plans-table", plansSort, renderPlans);
  syncFilterUI();
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
// Gemeinsames Re-Rendering: Tabelle + Dashboard + Filter-Chips
function rerender() {
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

/* ---------------- Spalten-Auswahl (User-anpassbar) ---------------- */
// Alle verfügbaren Spalten; Auswahl wird in localStorage gespeichert.
const ALL_COLUMNS = ["plan", "model", "score", "tokens", "req10", "rawtokens", "rawreq", "price", "privacy"];
const DEFAULT_COLUMNS = ["plan", "model", "score", "tokens", "req10", "price", "privacy"];
let visibleColumns = loadColumns();
function loadColumns() {
  try {
    const stored = localStorage.getItem("cpc-columns");
    if (stored) {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr) && arr.length) return arr.filter((c) => ALL_COLUMNS.includes(c));
    }
  } catch (e) { /* fallthrough */ }
  return [...DEFAULT_COLUMNS];
}
function saveColumns() {
  try { localStorage.setItem("cpc-columns", JSON.stringify(visibleColumns)); } catch (e) { /* ignore */ }
}
function columnVisible(col) { return visibleColumns.includes(col); }

/* ---------------- AI-Score (Artificial Analysis) ---------------- */
function aiScoreFor(modelName, family) {
  const scores = data?.aiScores?.scores ?? {};
  // Normalisiere Modellname/Familie auf AA-Slug: "Grok 4.6" → "grok-4-6", "GLM-5.3" → "glm-5-3"
  const candidates = [];
  const raw = (modelName || family || "").toLowerCase();
  candidates.push(raw.replace(/\s+/g, "-").replace(/\./g, "-"));
  candidates.push(family ? family.replace(/\s+/g, "-").replace(/\./g, "-") : null);
  candidates.push(raw.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"));
  for (const c of candidates) {
    if (!c) continue;
    if (scores[c]) return scores[c];
    // Prefix-Match (z.B. "grok-4-6" matcht "grok-4-6-high")
    const keys = Object.keys(scores);
    const exact = keys.find((k) => k === c || k.startsWith(c + "-") || c.startsWith(k + "-"));
    if (exact) return scores[exact];
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
    for (const row of plan.modelRows ?? []) {
      const score = aiScoreFor(row.model, row.family);
      const tokensPerReq = tokensPerRequest(row);
      const tokensPer10 = tokensPerReq && row.normalizedPer10 ? tokensPerReq * row.normalizedPer10 : null;
      const priv = comboPrivacy(plan, row);
      combos.push({
        planId: plan.id,
        planName: plan.name,
        provider: plan.provider,
        price: priceUsd,
        priceDisplay,
        meter: plan.meter,
        model: row.model,
        family: row.family,
        score: score?.intelligence ?? null,
        codingScore: score?.coding ?? null,
        tokensPer10,
        req10: row.normalizedPer10 ?? null,
        // Rohdaten: Tokens/Monat und Requests/Monat (un-normalisiert)
        rawTokensPerMonth: row.rawTokensPerMonth ?? null,
        rawRequestsPerMonth: row.requestsPerMonth ?? null,
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
    else if (key === "tokens") { va = a.tokensPer10 ?? null; vb = b.tokensPer10 ?? null; }
    else if (key === "req10") { va = a.req10 ?? null; vb = b.req10 ?? null; }
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
  const scoreStr = c.score !== null ? `<span class="num strong">${c.score.toFixed(1)}</span>` : `<span class="muted">-</span>`;
  const scoreBar = c.score !== null
    ? `<div class="score-bar"><div class="score-fill" style="width:${Math.min(100, (c.score / 70) * 100)}%"></div></div>`
    : "";
  const codingStr = c.codingScore !== null ? `<span class="muted">${c.codingScore.toFixed(1)}</span>` : "";
  switch (col) {
    case "plan": return `<td class="cell-head" data-label="${t("plans.th.plan")}"><span class="strong">${escapeHtml(c.planName)}</span><div class="muted" style="font-size:12px">${escapeHtml(c.provider)}</div></td>`;
    case "model": return `<td class="cell-sub" data-label="${t("plans.th.model")}"><span class="strong">${escapeHtml(c.model)}</span></td>`;
    case "score": return `<td data-label="${t("plans.th.score")}">${scoreStr}${scoreBar}<div class="muted" style="font-size:11px">${lang === "de" ? "coding" : "coding"} ${codingStr}</div></td>`;
    case "tokens": return `<td data-label="${t("plans.th.tokens")}"><span class="num">${fmtTokens(c.tokensPer10)}</span></td>`;
    case "req10": return `<td data-label="${t("plans.th.req10")}"><span class="num">${c.req10 ? fmtNum(c.req10) : "-"}</span></td>`;
    case "rawtokens": return `<td data-label="${t("plans.th.rawtokens")}"><span class="num">${fmtTokens(c.rawTokensPerMonth)}</span></td>`;
    case "rawreq": return `<td data-label="${t("plans.th.rawreq")}"><span class="num">${c.rawRequestsPerMonth ? fmtNum(c.rawRequestsPerMonth) : "-"}</span></td>`;
    case "price": return `<td data-label="${t("plans.th.price")}"><span class="num">${priceStr}</span></td>`;
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
  const sortableMap = { plan: "plan", model: "model", score: "score", tokens: "tokens", req10: "req10", rawtokens: "rawtokens", rawreq: "rawreq", price: "price", privacy: null };
  head.innerHTML = visibleColumns.map((col) => {
    const sortKey = sortableMap[col];
    const i18nKey = `plans.th.${col}`;
    const label = t(i18nKey) || col;
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

/* ============ DASHBOARD / PARETO-PLOT (AA-Stil) ============ */
let dashX = "tokens";
let dashY = "score";
let dashPareto = true;
let dashGreen = true;
let dashTargetX = null; // Ziel-Schwelle X (Green Target)
let dashTargetY = null; // Ziel-Schwelle Y (Green Target)

// Punkt-Wert für eine Metrik
function metricValue(combo, metric) {
  switch (metric) {
    case "tokens": return combo.tokensPer10;
    case "req10": return combo.req10;
    case "rawtokens": return combo.rawTokensPerMonth;
    case "rawreq": return combo.rawRequestsPerMonth;
    case "score": return combo.score;
    case "price": return combo.price;
    default: return null;
  }
}
// Metrik-Label (i18n)
function metricLabel(metric) {
  const map = {
    tokens: t("dash.m.tokens"), req10: t("dash.m.req10"), rawtokens: t("dash.m.rawtokens"),
    rawreq: t("dash.m.rawreq"), score: t("dash.m.score"), price: t("dash.m.price"),
  };
  return map[metric] ?? metric;
}
// Kurz-Format für Tooltip
function metricFmt(metric, val) {
  if (val === null || val === undefined) return "-";
  if (metric === "price") return fmtMoney(val);
  if (metric === "score") return val.toFixed(1);
  return fmtTokens(val);
}

// Pareto-Frontier: Punkte die in beiden Achsen nicht dominiert werden
// (maximiert X und Y — "mehr ist besser" auf beiden Achsen).
function paretoFrontier(points) {
  const sorted = points.filter((p) => p.x != null && p.y != null).sort((a, b) => b.x - a.x);
  const frontier = [];
  let maxY = -Infinity;
  for (const p of sorted) {
    if (p.y > maxY) {
      frontier.push(p);
      maxY = p.y;
    }
  }
  // Von links nach rechts sortieren für die Linie
  return frontier.sort((a, b) => a.x - b.x);
}

function renderDashboard() {
  const svg = $("#dash-svg");
  const note = $("#dash-note");
  if (!svg) return;
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

  const points = combos.map((c) => ({
    combo: c,
    x: metricValue(c, dashX),
    y: metricValue(c, dashY),
  })).filter((p) => p.x != null && p.y != null && p.x > 0 && p.y > 0);

  // Dynamische Auflösung: viewBox an Container-Größe (CSS-Pixel) koppeln,
  // damit auf Desktop (groß) volle Detailgenauigkeit herrscht und kein
  // Strecken/Verzerren durch eine winzige 100×100-viewBox entsteht.
  const rect = svg.getBoundingClientRect();
  const cssW = Math.max(rect.width, 320);
  const cssH = Math.max(rect.height, 240);
  const W = cssW, H = cssH;
  const PAD_L = Math.max(28, cssW * 0.045), PAD_B = Math.max(26, cssH * 0.07);
  const PAD_T = 14, PAD_R = 12;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  svg.setAttribute("viewBox", `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
  svg.setAttribute("preserveAspectRatio", "none");

  if (!points.length) {
    svg.innerHTML = "";
    if (note) note.textContent = lang === "de" ? "Keine Daten für den Plot nach Filtern." : "No data for the plot after filtering.";
    return;
  }

  // Skalen: log für Token/Request-Metriken (riesige Spannen), linear für Score/Preis
  const logScale = (m) => m === "tokens" || m === "req10" || m === "rawtokens" || m === "rawreq";
  const xLog = logScale(dashX), yLog = logScale(dashY);
  const xVals = points.map((p) => p.x), yVals = points.map((p) => p.y);
  const xMin = xLog ? Math.min(...xVals) * 0.8 : 0;
  const xMax = xLog ? Math.max(...xVals) * 1.2 : Math.max(...xVals) * 1.05;
  const yMin = yLog ? Math.min(...yVals) * 0.8 : 0;
  const yMax = yLog ? Math.max(...yVals) * 1.2 : Math.max(...yVals) * 1.05;

  const sx = (v) => PAD_L + (xLog ? (Math.log(v) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin)) : (v - xMin) / (xMax - xMin)) * plotW;
  const sy = (v) => H - PAD_B - (yLog ? (Math.log(v) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin)) : (v - yMin) / (yMax - yMin)) * plotH;

  const px = points.map((p) => ({ ...p, px: sx(p.x), py: sy(p.y) }));

  // Zielzone (Green Target): Bereich oberhalb der User-Schwellen.
  // Ohne gesetzte Schwellen: automatisch der obere-rechte Bereich
  // (Median als sinnvolle Default-Schwelle — Punkte über Median auf beiden Achsen).
  let targetX = dashTargetX;
  let targetY = dashTargetY;
  if (targetX === null || targetX === undefined) {
    const xValsSorted = xVals.slice().sort((a, b) => a - b);
    targetX = xValsSorted[Math.floor(xValsSorted.length / 2)]; // Median
  }
  if (targetY === null || targetY === undefined) {
    const yValsSorted = yVals.slice().sort((a, b) => a - b);
    targetY = yValsSorted[Math.floor(yValsSorted.length / 2)]; // Median
  }
  const tX = sx(targetX), tY = sy(targetY);
  const greenRect = dashGreen
    ? `<rect class="dash-green-region" x="${tX}" y="${PAD_T}" width="${PAD_L + plotW - tX}" height="${Math.max(0, tY - PAD_T)}"/>`
    : "";
  const thresholdLines = dashGreen
    ? `<line class="dash-threshold-line" x1="${tX}" y1="${PAD_T}" x2="${tX}" y2="${H - PAD_B}"/>
       <line class="dash-threshold-line" x1="${PAD_L}" y1="${tY}" x2="${W - PAD_R}" y2="${tY}"/>`
    : "";

  // Pareto-Frontier
  const frontier = dashPareto ? paretoFrontier(points) : [];
  const linePath = frontier.length > 1
    ? `<path class="dash-pareto-line" d="M${frontier.map((p) => `${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" L")}"/>`
    : "";

  // Achsen + Ticks (log-Skala: 10er-Potenzen; linear: ~5 Ticks)
  const ticks = (log, min, max, n) => {
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
  const xTicks = ticks(xLog, xMin, xMax, 5);
  const yTicks = ticks(yLog, yMin, yMax, 5);

  const xGrid = xTicks.map((v) => `<line class="dash-grid-line" x1="${sx(v).toFixed(2)}" y1="${PAD_T}" x2="${sx(v).toFixed(2)}" y2="${H - PAD_B}"/>`).join("");
  const yGrid = yTicks.map((v) => `<line class="dash-grid-line" x1="${PAD_L}" y1="${sy(v).toFixed(2)}" x2="${W - PAD_R}" y2="${sy(v).toFixed(2)}"/>`).join("");
  const xTickLabels = xTicks.map((v) => `<text class="dash-tick" x="${sx(v).toFixed(2)}" y="${H - PAD_B + 18}" text-anchor="middle">${fmtTokens(v)}</text>`).join("");
  const yTickLabels = yTicks.map((v) => `<text class="dash-tick" x="${PAD_L - 8}" y="${(sy(v) + 4).toFixed(2)}" text-anchor="end">${fmtTokens(v)}</text>`).join("");

  // Punkte: Farbe + FORM (Accessibility: nicht nur Farbe unterscheiden).
  // no-training = Kreis, trainiert = Quadrat, unbekannt = Dreieck.
  // Frontier-Punkte zusätzlich größer + primary.
  const frontierKeys = new Set(frontier.map((f) => `${f.combo.planId}::${f.combo.model}`));
  const dots = px.map((p, i) => {
    const isFrontier = frontierKeys.has(`${p.combo.planId}::${p.combo.model}`);
    const color = p.combo.noTraining === true ? "var(--success)" : (p.combo.noTraining === false ? "var(--danger)" : "var(--info)");
    const r = isFrontier ? 7 : 5; // echte Pixel (viewBox = CSS-Pixel)
    const cls = isFrontier ? "dash-dot dash-dot-frontier" : "dash-dot";
    const x = p.px.toFixed(2), y = p.py.toFixed(2);
    const shape = p.combo.noTraining === true ? "circle"
      : (p.combo.noTraining === false ? "square" : "triangle");
    if (shape === "square") {
      return `<rect class="${cls}" data-i="${i}" x="${(p.px - r * 0.8).toFixed(2)}" y="${(p.py - r * 0.8).toFixed(2)}" width="${(r * 1.6).toFixed(2)}" height="${(r * 1.6).toFixed(2)}" fill="${isFrontier ? "var(--primary)" : color}" transform="rotate(45 ${x} ${y})"/>`;
    }
    if (shape === "triangle") {
      const h = r * 1.8;
      return `<path class="${cls}" data-i="${i}" d="M${x},${(p.py - h / 2).toFixed(2)} L${(p.px + r).toFixed(2)},${(p.py + h / 2).toFixed(2)} L${(p.px - r).toFixed(2)},${(p.py + h / 2).toFixed(2)} Z" fill="${isFrontier ? "var(--primary)" : color}"/>`;
    }
    return `<circle class="${cls}" data-i="${i}" cx="${x}" cy="${y}" r="${r}" fill="${isFrontier ? "var(--primary)" : color}"/>`;
  }).join("");

  svg.innerHTML = `
    ${greenRect}
    ${thresholdLines}
    ${xGrid}${yGrid}
    <line class="dash-axis-line" x1="${PAD_L}" y1="${H - PAD_B}" x2="${W - PAD_R}" y2="${H - PAD_B}"/>
    <line class="dash-axis-line" x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${H - PAD_B}"/>
    ${linePath}
    ${dots}
    ${xTickLabels}${yTickLabels}
    <text class="dash-axis-label" x="${PAD_L + plotW / 2}" y="${H - 8}" text-anchor="middle">${escapeHtml(metricLabel(dashX))}</text>
    <text class="dash-axis-label" x="16" y="${PAD_T + plotH / 2}" text-anchor="middle" transform="rotate(-90 16 ${PAD_T + plotH / 2})">${escapeHtml(metricLabel(dashY))}</text>
  `;

  // Tooltip + Punkt-Daten für Hover + Klick
  svg._points = px;
  if (note) note.textContent = `${points.length} ${lang === "de" ? "Kombinationen im Plot" : "combinations plotted"} · ${frontier.length} ${lang === "de" ? "Pareto-Punkte" : "Pareto points"}`;
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
  content.innerHTML = `
    <div class="dd-name">${escapeHtml(p.combo.model)}</div>
    <div class="dd-plan">${escapeHtml(p.combo.planName)} · ${escapeHtml(p.combo.provider)}</div>
    <div class="dd-row"><span class="k">${metricLabel(dashX)}</span><span class="v">${metricFmt(dashX, p.x)}</span></div>
    <div class="dd-row"><span class="k">${metricLabel(dashY)}</span><span class="v">${metricFmt(dashY, p.y)}</span></div>
    <div class="dd-row"><span class="k">AI ${lang === "de" ? "Score" : "score"}</span><span class="v">${p.combo.score !== null ? p.combo.score.toFixed(1) : "-"}</span></div>
    <div class="dd-row"><span class="k">${t("plans.th.price")}</span><span class="v">${p.combo.price !== null ? fmtMoney(p.combo.price) : "-"}</span></div>
    <div class="dd-row"><span class="k">${t("plans.th.tokens")}</span><span class="v">${fmtTokens(p.combo.tokensPer10)}</span></div>
    ${priv ? `<div class="dd-badge">${priv}</div>` : ""}
  `;
}

// Tooltip-Events (Delegation auf SVG)
function bindDashTooltip() {
  const svg = $("#dash-svg");
  const tip = document.getElementById("dash-tooltip") || (() => { const d = document.createElement("div"); d.id = "dash-tooltip"; d.className = "dash-tooltip"; document.body.appendChild(d); return d; })();
  if (!svg) return;
  svg.addEventListener("mousemove", (e) => {
    const circle = e.target.closest(".dash-dot");
    if (circle && svg._points) {
      const p = svg._points[parseInt(circle.dataset.i, 10)];
      if (!p) return;
      tip.style.display = "block";
      tip.textContent = `${p.combo.planName} · ${p.combo.model} · ${metricLabel(dashX)} ${metricFmt(dashX, p.x)} · ${metricLabel(dashY)} ${metricFmt(dashY, p.y)}`;
      const rect = svg.getBoundingClientRect();
      // p.px/p.py sind jetzt in CSS-Pixel-Koordinaten (dynamische viewBox)
      const vbx = svg.viewBox.baseVal;
      tip.style.left = `${rect.left + (p.px / vbx.width) * rect.width}px`;
      tip.style.top = `${rect.top + (p.py / vbx.height) * rect.height}px`;
    } else {
      tip.style.display = "none";
    }
  });
  svg.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  // Klick auf Punkt → Detail-Panel
  svg.addEventListener("click", (e) => {
    const circle = e.target.closest(".dash-dot");
    if (circle && svg._points) {
      const p = svg._points[parseInt(circle.dataset.i, 10)];
      if (p) showDashDetail(p);
    }
  });
}

// Dashboard-Controls initialisieren
function initDashboard() {
  const xSel = $("#dash-x"), ySel = $("#dash-y");
  if (xSel) xSel.addEventListener("change", (e) => { dashX = e.target.value; renderDashboard(); });
  if (ySel) ySel.addEventListener("change", (e) => { dashY = e.target.value; renderDashboard(); });
  const pSel = $("#dash-pareto");
  if (pSel) pSel.addEventListener("change", (e) => { dashPareto = e.target.checked; renderDashboard(); });
  const gSel = $("#dash-green");
  if (gSel) gSel.addEventListener("change", (e) => { dashGreen = e.target.checked; renderDashboard(); });
  // Ziel-Schwellen (Green Target)
  const tx = $("#dash-target-x"), ty = $("#dash-target-y");
  if (tx) tx.addEventListener("input", (e) => { dashTargetX = e.target.value === "" ? null : parseFloat(e.target.value); renderDashboard(); });
  if (ty) ty.addEventListener("input", (e) => { dashTargetY = e.target.value === "" ? null : parseFloat(e.target.value); renderDashboard(); });
  bindDashTooltip();
}

function renderFormula() {
  const block = $("#formula-block");
  const m = data.methodology ?? {};
  const title = `<div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">${t("method.formula.title")}</div>`;
  block.innerHTML = title + `<div>${escapeHtml(m.costPerRequest ?? "")}</div>`;
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
    if (!resp.ok) throw new Error("HTTP " + resp.status + " für " + DATA_URL);
    data = await resp.json();
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
      renderPlans();
      renderDashboard();
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
  initSheet();

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
