/* ============================================================
 * Coding Plan Compare — frontend app
 * Dependency-free. Loads public/data/latest.json, renders the
 * whole page, i18n EN/DE, dark mode, URL state.
 * ============================================================ */
"use strict";

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    "nav.brand": "Coding Plan Compare",
    "nav.plans": "Plans",
    "nav.models": "Models",
    "nav.method": "Methodology",
    "nav.faq": "FAQ",
    "hero.live": "Live data · auto-updated daily",
    "hero.h1a": "AI Coding Subscriptions,",
    "hero.h1b": "Compared Honestly.",
    "hero.lead": `"60 for 10" is only the sticker price. We compare what you actually get — real token economics, provider credit formulas, cache-aware cost per request — from live official sources, reproduced daily.`,
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
    "method.sub": "The sticker value hides the real economics. Here is exactly how we make plans comparable — every step reproducible.",
    "method.formula.title": "Cost per request",
    "method.s1.t": "Real token prices, not marketing",
    "method.s1.p": "Every model behind a plan has published API token prices: input, output, cached-read and cached-write. That is the ground truth behind any credit or dollar-usage number.",
    "method.s2.t": "Provider credit formulas",
    "method.s2.p": "Providers define their own credits (GLM: (in×6.9 + cached×1.7 + out×24)/10000). We scrape those formulas from the official docs — never invent them.",
    "method.s3.t": "Cache-aware workload model",
    "method.s3.p": "Coding agents hit the cache constantly. Input is priced 5% fresh + 95% cached-write, cached-read and output at their real rates — per model, per workload pattern.",
    "method.s4.t": "Windows are caps, not volumes",
    "method.s4.p": "A 5-hour window is a throughput limit, not a monthly quota. Weekly credits scale to a month (×4.33); 5h caps are never multiplied into fake monthly numbers.",
    "method.s5.t": "Fair pattern unification",
    "method.s5.p": "Some feeds reuse one generic workload pattern. For shared model families we use the most precise per-model pattern for both plans — so a cheap pattern can't rig the comparison.",
    "method.s6.t": "Undisclosed stays undisclosed",
    "method.s6.p": "If a provider hides its numbers, we say so. No invented credits, no back-calculated quotas. Honesty is a feature.",
    "faq.h2": "Frequently asked questions",
    "faq.q1": "Is this really reproducible?",
    "faq.a1": "Yes. The pipeline fetches official feeds and docs (sources.yml), parses them deterministically, and builds latest.json from the cached snapshots only — never live-fetched during build. Same snapshots in, same JSON out. Change detection runs daily (content-hash of parsed data, robust against HTML nonces).",
    "faq.q2": "Why is \"60 for 10\" misleading?",
    "faq.a2": "OpenCode Go advertises $60 of usage for $10. But real requests per month range from ~490 (Kimi K3) to ~226,000 (Muse Spark 1.2) depending on the model. The dollar value is real; what it buys depends entirely on token prices, cache behaviour and the workload pattern. We compute exactly that.",
    "faq.q3": "Why don't you compare all 17 plans directly?",
    "faq.a3": "Only 6 plans currently publish enough data (token prices or credit formulas) to compute requests per month honestly. The others show their raw quotas. We never invent missing numbers — comparing undisclosed plans would be fiction.",
    "faq.q4": "Which prices do you show?",
    "faq.a4": "The paid checkout price (paidPrice), not the advertised one. Command Code GOAT advertises $10 but checkout is $10.77 — we scale by the real price. Where a plan is CNY (GLM, Kimi) we keep the official currency and note it.",
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
    "foot.rights": "© 2026 Coding Plan Compare · MIT License",
    "foot.lang": "English · Deutsch",
    "loading": "Loading live data…",
    "error": "Could not load data. Please check the connection or try again.",
    "updated": "Data snapshot",
    "disclaimer.title": "Note:",
    "disclaimer.text": "Prices and quotas change frequently. This site is informational — always confirm on the official provider page before subscribing.",
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
    "hero.lead": `„60 für 10“ ist nur der Aufkleberpreis. Wir vergleichen, was du wirklich bekommst — echte Token-Ökonomie, anbietereigene Credit-Formeln, cache-bewusste Kosten pro Request — aus Live-Quellen, täglich reproduziert.`,
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
    "method.sub": "Der Aufkleberwert versteckt die echte Ökonomie. Hier ist genau, wie wir Pläne vergleichbar machen — jeder Schritt reproduzierbar.",
    "method.formula.title": "Kosten pro Request",
    "method.s1.t": "Echte Token-Preise, kein Marketing",
    "method.s1.p": "Jedes Modell hinter einem Plan hat veröffentlichte API-Token-Preise: Input, Output, Cached-Read und Cached-Write. Das ist die Wahrheit hinter jeder Credit- oder Dollar-Usage-Zahl.",
    "method.s2.t": "Anbietereigene Credit-Formeln",
    "method.s2.p": "Anbieter definieren eigene Credits (GLM: (in×6,9 + cached×1,7 + out×24)/10000). Wir scrapen diese Formeln aus den offiziellen Docs — erfinden sie nie.",
    "method.s3.t": "Cache-bewusstes Workload-Modell",
    "method.s3.p": "Coding-Agenten treffen ständig den Cache. Input wird mit 5% frisch + 95% Cached-Write bepreist, Cached-Read und Output zu ihren echten Raten — pro Modell, pro Workload-Pattern.",
    "method.s4.t": "Fenster sind Caps, keine Volumina",
    "method.s4.p": "Ein 5-Stunden-Fenster ist ein Durchsatz-Limit, kein Monatskontingent. Wochen-Credits skalieren auf den Monat (×4,33); 5h-Caps werden nie zu erfundenen Monatszahlen multipliziert.",
    "method.s5.t": "Faire Pattern-Vereinheitlichung",
    "method.s5.p": "Manche Feeds nutzen ein generisches Workload-Pattern. Für geteilte Modell-Familien verwenden wir das präziseste per-Modell-Pattern für beide Pläne — so kann ein billiges Pattern den Vergleich nicht fälschen.",
    "method.s6.t": "Nicht veröffentlicht bleibt nicht veröffentlicht",
    "method.s6.p": "Wenn ein Anbieter seine Zahlen versteckt, sagen wir das. Keine erfundenen Credits, keine rückgerechneten Kontingente. Ehrlichkeit ist ein Feature.",
    "faq.h2": "Häufige Fragen",
    "faq.q1": "Ist das wirklich reproduzierbar?",
    "faq.a1": "Ja. Die Pipeline holt offizielle Feeds und Docs (sources.yml), parst sie deterministisch und baut latest.json nur aus den gecachten Snapshots — nie mit Live-Fetch im Build. Gleiche Snapshots rein, gleiches JSON raus. Change-Detection läuft täglich (Content-Hash der geparsten Daten, robust gegen HTML-Nonces).",
    "faq.q2": "Warum ist „60 für 10“ irreführend?",
    "faq.a2": "OpenCode Go bewirbt $60 Usage für $10. Aber die echten Requests pro Monat reichen von ~490 (Kimi K3) bis ~226.000 (Muse Spark 1.2) je nach Modell. Der Dollar-Wert ist real; was er kauft, hängt komplett von Token-Preisen, Cache-Verhalten und Workload-Pattern ab. Genau das rechnen wir aus.",
    "faq.q3": "Warum vergleicht ihr nicht alle 17 Pläne direkt?",
    "faq.a3": "Nur 6 Pläne veröffentlichen aktuell genug Daten (Token-Preise oder Credit-Formeln), um Requests pro Monat ehrlich zu berechnen. Die anderen zeigen ihre Roh-Kontingente. Wir erfinden keine fehlenden Zahlen — nicht vergleichbare Pläne zu vergleichen wäre Fiktion.",
    "faq.q4": "Welche Preise zeigt ihr?",
    "faq.a4": "Den bezahlten Checkout-Preis (paidPrice), nicht den beworbenen. Command Code GOAT bewirbt $10, aber der Checkout ist $10,77 — wir skalieren mit dem echten Preis. Wo ein Plan in CNY ist (GLM, Kimi), behalten wir die offizielle Währung und weisen darauf hin.",
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
    "foot.rights": "© 2026 Coding Plan Compare · MIT-Lizenz",
    "foot.lang": "English · Deutsch",
    "loading": "Live-Daten werden geladen…",
    "error": "Daten konnten nicht geladen werden. Bitte Verbindung prüfen oder erneut versuchen.",
    "updated": "Datenstand",
    "disclaimer.title": "Hinweis:",
    "disclaimer.text": "Preise und Kontingente ändern sich häufig. Diese Seite ist informativ — bitte vor dem Abonnieren immer auf der offiziellen Anbieterseite bestätigen.",
  },
};

/* ---------------- State ---------------- */
let lang = "en";
let theme = "light";
let data = null;

/* ---------------- Helpers ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function t(key) {
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function fmtNum(n, digits = 0) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { maximumFractionDigits: digits });
}

function fmtMoney(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return "$" + n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 2 });
}

function fmtPct(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
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
  renderFamilyTable();
  renderFormula();
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
      const amt = typeof x.amount === "number" ? fmtNum(x.amount) : (x.amount ?? "—");
      return `${amt} ${x.unit ?? ""} / ${x.window ?? ""}`;
    })
    .filter(Boolean);
  return parts.join(" · ") || "—";
}

function renderPlans() {
  const grid = $("#plans-grid");
  const plans = (data.plans ?? []).slice().sort((a, b) => {
    const pa = a.price?.paidPrice ?? a.price?.monthlyUsd ?? 1e9;
    const pb = b.price?.paidPrice ?? b.price?.monthlyUsd ?? 1e9;
    return pa - pb;
  });
  grid.innerHTML = plans.map((p) => {
    const price = p.price?.paidPrice ?? p.price?.monthlyUsd;
    const priceHtml = price !== null && price !== undefined
      ? `<div class="price">${fmtMoney(price)}<small>${t("plans.per")}</small></div>`
      : `<div class="price" style="font-size:17px;font-weight:600;color:var(--text-faint)">${t("plans.noPrice")}</div>`;
    const discBadge = p.disclosure === "undisclosed"
      ? `<span class="badge badge-gray">${lang === "de" ? "nicht veröffentlicht" : "undisclosed"}</span>`
      : (p.disclosure === "partial"
        ? `<span class="badge badge-amber">${lang === "de" ? "teilweise" : "partial"}</span>`
        : `<span class="badge badge-green">${lang === "de" ? "verifiziert" : "verified"}</span>`);
    const mean = p.modelStats?.mean;
    const meanHtml = mean
      ? `<div class="row"><span class="k">${lang === "de" ? "Ø Requests/Monat" : "Avg req/mo"}</span><span class="v num">${fmtNum(mean)}</span></div>`
      : "";
    const src = (p.sourceIds ?? []).map(escapeHtml).join(", ") || "—";
    return `
    <article class="card">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="vendor">${escapeHtml(p.provider)}</div>
        </div>
        ${discBadge}
      </div>
      ${priceHtml}
      <div class="meta">
        <div class="row"><span class="k">${t("plans.meter")}</span><span class="v">${meterLabel(p.meter)}</span></div>
        <div class="row"><span class="k">${t("plans.quota")}</span><span class="v" style="font-weight:500">${escapeHtml(quotaSummary(p))}</span></div>
        ${meanHtml}
        <div class="row"><span class="k">${t("plans.source")}</span><span class="v mono" style="font-weight:400;font-size:12px;color:var(--text-faint);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${src}">${src}</span></div>
      </div>
    </article>`;
  }).join("");
}

function renderFamilyTable() {
  const tbody = $("#family-tbody");
  const rows = (data.familyComparisons ?? []).slice().sort((a, b) => Math.abs(b.advantagePercent ?? 0) - Math.abs(a.advantagePercent ?? 0));
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-faint)">${lang === "de" ? "Noch keine Vergleiche verfügbar." : "No comparisons available yet."}</td></tr>`;
    return;
  }
  const planName = (id) => {
    const p = (data.plans ?? []).find((x) => x.id === id);
    return p ? escapeHtml(p.name) : escapeHtml(id);
  };
  tbody.innerHTML = rows.map((r) => {
    const isDraw = r.winner === "draw";
    const badge = isDraw
      ? `<span class="badge badge-gray">${t("models.winner.draw")}</span>`
      : (r.winner === r.planA
        ? `<span class="badge badge-green">${planName(r.planA)}</span>`
        : `<span class="badge badge-blue">${planName(r.planB)}</span>`);
    const edge = isDraw ? "—" : `${fmtPct(r.advantagePercent)} ${t("models.edge")}`;
    return `
    <tr>
      <td><span class="strong">${escapeHtml(r.family)}</span></td>
      <td class="muted">${planName(r.planA)}</td>
      <td class="num">${fmtNum(r.requestsA)}</td>
      <td class="muted">${planName(r.planB)}</td>
      <td class="num">${fmtNum(r.requestsB)}</td>
      <td>${badge}</td>
      <td class="num" style="color:${isDraw ? "var(--text-faint)" : "var(--success)"}">${edge}</td>
    </tr>`;
  }).join("");
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
    const resp = await fetch("data/latest.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    data = await resp.json();
    applyI18n();
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="state-box"><div class="spinner" style="display:none"></div><p style="font-size:18px;font-weight:700">${t("error")}</p></div>`;
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

  // Show loading state
  $("#main").innerHTML = `<div class="state-box"><div class="spinner"></div><p>${t("loading")}</p></div>`;
  applyI18n();
  loadData();
}

document.addEventListener("DOMContentLoaded", init);
