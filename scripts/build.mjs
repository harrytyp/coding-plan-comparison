#!/usr/bin/env node
/**
 * coding-plan-compare Generator
 * Baut public/data/latest.json dynamisch aus parsed/*.json (Quellen) + data/overrides.yml.
 *
 * Normalisierung (ai-10-usd-Methode, erweitert):
 *  - Kosten pro Request je Modell aus Token-Preisen + Workload-Pattern:
 *      cost = (0.05×input + 0.95×cachedWrite)×pattern.input
 *           + cachedRead×pattern.cachedRead + output×pattern.output, /1M
 *    (Input zu 5% normal + 95% Cache-Write; Cache-Read und Output separat)
 *  - Requests/Monat = Meter / cost  (Meter: credits | $usage | requests | prompts)
 *  - $10-Normalisierung: requests × 10 / paidPrice
 *  - Draw < 10%; Outlier = Tukey IQR auf log2-Ratio
 *  - Anbieter-eigene requestEstimate (Command Code) als offizielle Referenz
 *  - undisclosed bleibt undisclosed; keine direkte Credit-Umrechnung zwischen Anbietern
 *
 * Reproduzierbar: deterministisch aus committeden Inputs (data + feeds-Snapshots).
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGET_PRICE = 10;
const DRAW_THRESHOLD_PERCENT = 10;
// ai-10-usd Workload-Fallback: durchschnittliches Message-Profil
const FALLBACK_PATTERN = { input: 800, cachedRead: 50000, output: 162 };

// ---------- YAML-Parser (block + flow maps/lists; ausreichend für sources.yml / overrides.yml) ----------
function parseFlow(s) {
  s = s.trim();
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1).trim();
    const obj = {};
    if (!inner) return obj;
    for (const part of splitFlow(inner)) {
      const idx = part.indexOf(":");
      if (idx < 0) continue;
      const k = part.slice(0, idx).trim();
      const v = parseFlow(part.slice(idx + 1).trim());
      obj[k] = v;
    }
    return obj;
  }
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitFlow(inner).map((p) => parseFlow(p.trim()));
  }
  return parseScalar(s);
}

function splitFlow(s) {
  const parts = [];
  let depth = 0, cur = "", inStr = null;
  for (const ch of s) {
    if (inStr) {
      cur += ch;
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = ch; cur += ch; continue; }
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

function parseScalar(s) {
  s = s.trim();
  if (s === "null") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  const n = Number(s);
  if (s !== "" && !isNaN(n)) return n;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}

// Rekursiver Parser: verarbeitet eine Liste von {indent, text}-Zeilen.
function parseBlock(lines, startIdx) {
  const root = {};
  let i = startIdx;
  let lastKey = null;
  while (i < lines.length) {
    const { indent, text } = lines[i];
    if (indent < lines[startIdx].indent) break; // back to parent level
    if (indent > lines[startIdx].indent) {
      // shouldn't happen at this level; skip
      i++;
      continue;
    }
    if (text.startsWith("- ")) {
      // List at this indent level — collect all items
      const arr = [];
      const baseIndent = indent;
      while (i < lines.length && lines[i].indent === baseIndent && lines[i].text.startsWith("- ")) {
        const itemText = lines[i].text.slice(2).trim();
        const itemMatch = itemText.match(/^([^:]+):\s*(.*)$/);
        if (itemMatch && !itemText.startsWith("{") && !itemText.startsWith("[")) {
          // block-map list item
          const item = {};
          const k = itemMatch[1].trim();
          const v = itemMatch[2].trim();
          if (v === "") {
            const childLines = [];
            let j = i + 1;
            while (j < lines.length && lines[j].indent > baseIndent) { childLines.push(lines[j]); j++; }
            item[k] = childLines.length ? parseBlock(childLines, 0) : {};
            i = j;
          } else {
            item[k] = parseFlow(v);
            i++;
          }
          // remaining keys of this list item (same item, deeper indent)
          while (i < lines.length && lines[i].indent > baseIndent) {
            const sub = lines[i];
            const sm = sub.text.match(/^([^:]+):\s*(.*)$/);
            if (!sm) { i++; continue; }
            const sk = sm[1].trim();
            const sv = sm[2].trim();
            if (sv === "") {
              const childLines = [];
              let j = i + 1;
              while (j < lines.length && lines[j].indent > sub.indent) { childLines.push(lines[j]); j++; }
              item[sk] = childLines.length ? parseBlock(childLines, 0) : {};
              i = j;
            } else {
              item[sk] = parseFlow(sv);
              i++;
            }
          }
          arr.push(item);
        } else {
          arr.push(parseFlow(itemText));
          i++;
        }
      }
      if (lastKey) root[lastKey] = arr;
      else if (Array.isArray(root)) root.push(...arr);
      else return arr; // top-level list block → array
      lastKey = null;
    } else {
      const m = text.match(/^([^:]+):\s*(.*)$/);
      if (!m) { i++; continue; }
      const key = m[1].trim();
      const rest = m[2].trim();
      if (rest === "") {
        const childLines = [];
        let j = i + 1;
        while (j < lines.length && lines[j].indent > indent) { childLines.push(lines[j]); j++; }
        root[key] = childLines.length ? parseBlock(childLines, 0) : {};
        i = j;
      } else {
        root[key] = parseFlow(rest);
        i++;
      }
      lastKey = key;
    }
  }
  return root;
}

function parseYaml(text) {
  const lines = text.split("\n")
    .map((raw, idx) => ({ indent: raw.match(/^\s*/)[0].length, text: raw.trim(), idx }))
    .filter((l) => l.text && !l.text.startsWith("#"));
  if (!lines.length) return {};
  return parseBlock(lines, 0);
}

// ---------- Dynamischer Plan-Katalog aus geparsten Quellen + Overrides ----------
function buildPlanCatalog(parsed, overrides, overridesData) {
  const plans = [];
  const add = (p) => { if (p) plans.push(p); };

  // --- OpenCode Go (aus ocgo-Feed) ---
  const oc = parsed["ocgo-pricing"];
  if (oc) {
    add({
      id: "opencode-go",
      provider: "opencode",
      name: "OpenCode Go",
      price: { monthlyUsd: oc.monthlyCost ?? 10, paidPrice: oc.monthlyCost ?? 10, advertisedPrice: oc.monthlyCost ?? 10, billingNote: "first month $5; beta", altPrice: null },
      meter: "dollar_usage",
      quotas: [
        { label: "5h window", unit: "usd", amount: 12, window: "5h", refresh: "rolling", disclosure: "exact" },
        { label: "Weekly", unit: "usd", amount: 30, window: "week", refresh: "weekly", disclosure: "exact" },
        { label: "Monthly", unit: "usd", amount: oc.monthlyCredit ?? 60, window: "month", refresh: "monthly", disclosure: "exact" },
      ],
      tokenPricing: { source: "ocgo-pricing", note: "Feed: usage = Credits/Monat je Modell, pattern = Token-Profil, input/output/cachedRead/cachedWrite = API-Preise" },
      workload: { pattern: null, taskConversion: null },
      models: (oc.models ?? []).map((m) => m.name),
      disclosure: "disclosed",
      sourceIds: ["ocgo-pricing"],
      verifiedAt: oc.fetchedAt ? oc.fetchedAt.slice(0, 10) : "2026-08-28",
    });
  }

  // --- Command Code Pläne (aus cc-Feed) ---
  const cc = parsed["cc-pricing"];
  const CC_PAID = { goat: 10.77 }; // ai-10-usd verifizierter Checkout-Preis
  if (cc) {
    for (const p of cc.plans ?? []) {
      if (!p.creditsMonthly) continue; // provider-Plan ohne credits überspringen
      const id = `command-code-${p.id}`;
      add({
        id,
        provider: "command-code",
        name: `Command Code ${p.name}`,
        price: { monthlyUsd: p.priceMonthly, paidPrice: CC_PAID[p.id] ?? p.priceMonthly, advertisedPrice: p.priceMonthly, billingNote: CC_PAID[p.id] ? "paid $10.77 (ai-10-usd verifiziert)" : "", altPrice: null },
        meter: "credits",
        quotas: [
          { label: "5h window", unit: "credits", amount: p.limits?.h5 ?? null, window: "5h", refresh: "rolling", disclosure: "exact" },
          { label: "Weekly", unit: "credits", amount: p.limits?.weekly ?? null, window: "week", refresh: "weekly", disclosure: "exact" },
          { label: "Monthly", unit: "credits", amount: p.creditsMonthly, window: "month", refresh: "monthly", disclosure: "exact" },
        ],
        tokenPricing: { source: "cc-pricing", note: "allowances = Credits/Monat je Modell; requestEstimate = offizielle Request-Schätzung" },
        workload: { pattern: null, taskConversion: p.requestEstimate ? `Offizielle requestEstimate: ${p.requestEstimate.toLocaleString()} req/mo` : null },
        models: [],
        disclosure: "disclosed",
        sourceIds: ["cc-pricing"],
        verifiedAt: cc.fetchedAt ? cc.fetchedAt.slice(0, 10) : "2026-08-28",
        requestEstimate: p.requestEstimate ?? null,
      });
    }
  }

  // --- GLM Pläne (Quoten+Formel dynamisch aus Docs; Preise aus overrides) ---
  const glm = parsed["glm-coding-overview"];
  if (glm) {
    const tierMap = { lite: "Lite", pro: "Pro", max: "Max" };
    for (const q of glm.quotas ?? []) {
      const tierName = tierMap[q.tier];
      if (!tierName) continue;
      const id = `glm-${q.tier}`;
      const ov = overrides[id];
      add({
        id,
        provider: "zhipu",
        name: `GLM Coding Plan ${tierName}`,
        price: ov?.price ?? { monthlyUsd: null, paidPrice: null, advertisedPrice: null, billingNote: "Preis nicht scrapebar (API-Auth) — siehe overrides.yml", altPrice: null },
        meter: "credits",
        quotas: [
          { label: "5h rolling", unit: "credits", amount: q.h5, window: "5h", refresh: "rolling", disclosure: "exact" },
          { label: "7-day", unit: "credits", amount: q.weekly, window: "week", refresh: "weekly", disclosure: "exact" },
        ],
        tokenPricing: { source: "glm-coding-overview", note: glm.formula ?? "Credit-Formel aus Docs" },
        providerCost: {
          formula: glm.formula ?? "(input×a + cachedRead×b + output×c)/10000",
          perModel: (glm.models ?? []).map((m) => ({ model: m.model, input: m.input, cachedRead: m.cachedRead, output: m.output })),
          mcpPerCall: glm.mcpPerCall ?? null,
          offPeakDiscount: glm.offPeakDiscount ?? null,
          note: "Offiziell verifiziert (docs.bigmodel.cn/cn/coding-plan/overview)",
        },
        workload: { pattern: null, taskConversion: null },
        models: (glm.models ?? []).map((m) => m.model),
        disclosure: "disclosed",
        sourceIds: ["glm-coding-overview", ...(ov ? ["overrides"] : [])],
        verifiedAt: "2026-08-28",
        priceSource: ov ? "overrides (API-Auth)" : "undisclosed",
      });
    }
  }

  // --- Qwen Coding Plan Pro (dynamisch aus Docs) ---
  const qwen = parsed["qwen-coding-plan"];
  if (qwen?.plans?.[0]) {
    const p = qwen.plans[0];
    add({
      id: "qwen-coding-pro",
      provider: "alibaba",
      name: "Qwen Coding Plan Pro",
      price: { monthlyUsd: p.price, paidPrice: p.price, advertisedPrice: p.price, billingNote: "仅月付, 库存每日 UTC+8 00:00 补充", altPrice: null },
      meter: "requests",
      quotas: [
        { label: "5h rolling", unit: "requests", amount: p.quota5h, window: "5h", refresh: "rolling", disclosure: "exact" },
        { label: "Weekly", unit: "requests", amount: p.quotaWeek, window: "week", refresh: "weekly", disclosure: "exact" },
        { label: "Monthly", unit: "requests", amount: p.quotaMonth, window: "month", refresh: "monthly", disclosure: "exact" },
      ],
      tokenPricing: null,
      workload: { pattern: null, taskConversion: qwen.taskConversion },
      models: ["Qwen Code", "Claude Code", "Codex", "Cursor", "OpenCode"],
      disclosure: "disclosed",
      sourceIds: ["qwen-coding-plan"],
      verifiedAt: "2026-08-28",
    });
  }

  // --- Qwen Token Personal (dynamisch aus Docs) ---
  const qwenTok = parsed["qwen-token-personal"];
  const qwenTierMap = { Lite: "lite", Standard: "standard", Pro: "pro" };
  for (const p of qwenTok?.plans ?? []) {
    const tierKey = qwenTierMap[p.name];
    if (!tierKey) continue;
    add({
      id: `qwen-token-personal-${tierKey}`,
      provider: "alibaba",
      name: `Qwen Token Plan Personal ${p.name}`,
      price: { monthlyUsd: p.limitedPrice, paidPrice: p.limitedPrice, advertisedPrice: p.originalPrice, billingNote: `Limited-time $${p.limitedPrice} (Original $${p.originalPrice})`, altPrice: null },
      meter: "credits",
      quotas: [
        { label: "7-day rolling", unit: "credits", amount: p.quota7d, window: "rolling", refresh: "rolling", disclosure: "exact" },
      ],
      tokenPricing: null,
      workload: { pattern: null, taskConversion: "Tiered deduction coefficients by model (offiziell); Koeffizienten nicht öffentlich" },
      models: ["Qwen 文本与多模态", "Claude Code", "Cursor", "Qwen Code", "OpenClaw"],
      disclosure: "disclosed",
      sourceIds: ["qwen-token-personal"],
      verifiedAt: "2026-08-28",
    });
  }

  // --- Kimi Pläne (Preise dynamisch aus Pricing-Docs; Quota-Regeln aus Code-Docs) ---
  const kimiPrices = parsed["kimi-membership-pricing"];
  const kimiCode = parsed["kimi-code-membership"];
  const kimiTierMap = { Moderato: "moderato", Allegretto: "allegretto", Allegro: "allegro" };
  const USD_PER_CNY = 0.14; // grobe Umrechnung für Anzeige; kanonisch bleibt CNY
  for (const p of kimiPrices?.plans ?? []) {
    const tierKey = kimiTierMap[p.name];
    if (!tierKey) continue;
    const usd = Math.round(p.priceCny * USD_PER_CNY * 10) / 10;
    add({
      id: `kimi-${tierKey}`,
      provider: "moonshot",
      name: `Kimi Code ${p.name}`,
      price: { monthlyUsd: usd, paidPrice: usd, advertisedPrice: usd, billingNote: `CNY ${p.priceCny}/月 (offiziell, kimi.com)`, altPrice: `¥${p.priceCny}/mo` },
      meter: "credits",
      quotas: [
        { label: "7-day quota", unit: "credits", amount: null, window: "week", refresh: "weekly", disclosure: "undisclosed", shared: "Kimi Code + Kimi Membership" },
        { label: "5h rate window", unit: "credits", amount: null, window: "5h", refresh: "rolling", disclosure: "undisclosed" },
      ],
      tokenPricing: { source: "kimi-code-membership", note: kimiCode?.extraUsage ?? "Credit-Balance; Extra Usage nach Verbrauch" },
      workload: { pattern: null, taskConversion: kimiCode?.extraUsage ?? null },
      models: ["Kimi K3", "Kimi K2.7 Code"],
      disclosure: "partial",
      sourceIds: ["kimi-membership-pricing", "kimi-code-membership"],
      verifiedAt: "2026-08-28",
    });
  }

  // --- Nicht-scrapebare Pläne aus overrides.yml (MiniMax) ---
  for (const ov of overridesData?.overrides ?? []) {
    if (plans.some((p) => p.id === ov.id)) continue; // schon dynamisch
    add({
      id: ov.id,
      provider: ov.provider ?? "unknown",
      name: ov.name ?? ov.id,
      price: ov.price ?? { monthlyUsd: null, paidPrice: null, advertisedPrice: null },
      meter: ov.meter ?? "credits",
      quotas: ov.quota ? [ov.quota] : [],
      tokenPricing: null,
      workload: { pattern: null, taskConversion: null },
      models: [],
      disclosure: "undisclosed",
      sourceIds: ["overrides"],
      verifiedAt: ov.lastVerified ?? "2026-08-28",
      notes: ov.note ?? null,
    });
  }

  return plans;
}
function validatePlan(p) {
  const errors = [];
  for (const field of ["id", "provider", "name", "price", "meter", "quotas", "sourceIds", "verifiedAt"]) {
    if (!(field in p)) errors.push(`${p.id || "(unknown)"}: missing ${field}`);
  }
  if (p.price && typeof p.price.monthlyUsd !== "number") errors.push(`${p.id}: price.monthlyUsd must be number`);
  if (!Array.isArray(p.quotas)) errors.push(`${p.id}: quotas must be array`);
  return errors;
}

// ---------- Kostenmodell (ai-10-usd) ----------
function requestCost(model, pattern) {
  const input = typeof model.input === "number" ? model.input : null;
  const cachedRead = typeof model.cachedRead === "number" ? model.cachedRead : null;
  const output = typeof model.output === "number" ? model.output : null;
  const cachedWrite = typeof model.cachedWrite === "number" ? model.cachedWrite : (input ?? null);
  if (input === null || cachedRead === null || output === null || !pattern) return null;
  if (pattern.input === undefined || pattern.cachedRead === undefined || pattern.output === undefined) return null;
  const inputPrice = 0.05 * input + 0.95 * cachedWrite;
  return (inputPrice * pattern.input + cachedRead * pattern.cachedRead + output * pattern.output) / 1_000_000;
}

function avg(values) {
  const usable = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  return usable.length ? usable.reduce((a, b) => a + b, 0) / usable.length : null;
}

function percentile(values, frac) {
  const sorted = values.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * frac;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function distribution(values) {
  const usable = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  return {
    count: usable.length,
    min: usable.length ? Math.min(...usable) : null,
    max: usable.length ? Math.max(...usable) : null,
    mean: avg(usable),
    median: percentile(usable, 0.5),
    p25: percentile(usable, 0.25),
    p75: percentile(usable, 0.75),
  };
}

// ---------- Modelle aus Feeds für einen Plan auswählen ----------
function modelsForPlan(plan, feeds) {
  const out = [];
  if (plan.id.startsWith("command-code")) {
    const cc = feeds["cc-pricing.json"];
    if (!cc?.models) return out;
    const planId = plan.id.replace("command-code-", "");
    for (const m of cc.models) {
      const allowance = m.allowances?.[planId] ?? null;
      if (allowance == null) continue;
      out.push({ name: m.name, allowance, pattern: m.pattern ?? FALLBACK_PATTERN, pricing: m });
    }
    return out;
  }
  if (plan.id === "opencode-go") {
    const oc = feeds["ocgo-pricing.json"];
    if (!oc?.models) return out;
    for (const m of oc.models) {
      if (typeof m.usage !== "number" || m.usage <= 0) continue;
      out.push({ name: m.name, usage: m.usage, pattern: m.pattern ?? FALLBACK_PATTERN, pricing: m, privacy: m.privacy ?? null });
    }
    return out;
  }
  // Generische Pläne: NUR Preis-Infos aus dem Feed nutzen (Token-Preise + Pattern sind
  // modelleigen, nicht plan-eigen). Die Allowance kommt aus dem Plan selbst.
  // providerCost: anbietereigene Credit-Formel (z.B. GLM) als Daten im Plan.
  // Formel: creditsPerRequest = (input×c_input + cachedRead×c_cached + output×c_output) / 10000
  // Angewendet auf das Pattern (aus Feed oder Fallback).
  if (plan.providerCost?.perModel) {
    const oc = feeds["ocgo-pricing.json"];
    const cc = feeds["cc-pricing.json"];
    const allModels = [...(oc?.models ?? []), ...(cc?.models ?? [])];
    for (const pc of plan.providerCost.perModel) {
      // find model pricing in feeds
      const match = allModels.find((m) => m.name && m.name.toLowerCase().includes(pc.model.toLowerCase()));
      const pattern = match?.pattern ?? FALLBACK_PATTERN;
      const creditCostPerReq = (pattern.input * pc.input + pattern.cachedRead * pc.cachedRead + pattern.output * pc.output) / 10000;
      if (!(creditCostPerReq > 0)) continue;
      for (const q of plan.quotas) {
        if (typeof q.amount !== "number" || q.amount <= 0) continue;
        out.push({
          name: pc.model,
          allowance: q.amount,
          window: q.window,
          pattern,
          pricing: match,
          providerCost: {
            formula: plan.providerCost.formula ?? "(input×a + cachedRead×b + output×c)/10000",
            creditsPerRequest: creditCostPerReq,
            offPeakDiscount: plan.providerCost.offPeakDiscount ?? null,
          },
        });
      }
    }
    return out;
  }
  return out;
}

// ---------- Main ----------
async function main() {
  // ============ DYNAMISCHE QUELLEN (statt statischer plans.yml) ============
  // Die Plan-Definitionen werden zur Laufzeit aus den geparsten Quellen gebaut:
  //   - ocgo-pricing / cc-pricing (JSON-Feeds): Preise, Modelle, Allowances, Patterns
  //   - glm-coding-overview (HTML-Docs): Quoten, Credit-Formel, MCP, Off-Peak
  //   - qwen-* (HTML-Docs): Preise, Quoten, Task-Konvertierung
  //   - kimi-* (HTML-Docs): Preise (CNY), Quota-Regeln
  //   - data/overrides.yml: NUR nicht-scrapebares (GLM-Preise via API-Auth, MiniMax-SPA)
  const parsedDir = join(ROOT, "parsed");
  const parsedFiles = (await readdir(parsedDir)).filter((f) => f.endsWith(".json"));
  const parsed = {};
  for (const f of parsedFiles) {
    parsed[f.replace(/\.json$/, "")] = JSON.parse(await readFile(join(parsedDir, f), "utf8"));
  }

  const overridesYml = await readFile(join(ROOT, "data/overrides.yml"), "utf8");
  const overridesData = parseYaml(overridesYml);
  const overrides = Object.fromEntries((overridesData.overrides ?? []).map((o) => [o.id, o]));

  // Plan-Katalog dynamisch bauen
  const plans = buildPlanCatalog(parsed, overrides, overridesData);
  if (!plans.length) throw new Error("keine Pläne aus Quellen+Overrides aufgelöst");

  const errors = plans.flatMap(validatePlan);
  if (errors.length) {
    console.error("SCHEMA ERRORS:\n" + errors.join("\n"));
    process.exit(1);
  }

  // Feeds laden (aus parsed/, das aus cache/ kommt)
  const feeds = {
    "ocgo-pricing.json": parsed["ocgo-pricing"],
    "cc-pricing.json": parsed["cc-pricing"],
  };

  // Modell-Familien-Matching (ai-10-usd-Prinzip): pro gemeinsamer Familie vergleichen,
  // statt Plan-Mittelwerte (die teure/billige Modelle vermischen).
  const FAMILY_ALIASES = {
    "hy3": "tencent hy3", "hy4": "tencent hy4", "hy4 preview": "tencent hy4",
    "gpt 5.6 luna": "gpt-5.6 luna", "glm-5.3-flash": "glm-5.3 flash",
    "deepseek v4": "deepseek v4", "deepseek v4 vision exp": "deepseek v4 flash vision exp",
  };
  function familyOf(name) {
    let n = String(name).toLowerCase();
    n = n.replace(/\s*\(latest\)\s*/g, " ").replace(/\s*\(exp\)\s*/g, " exp")
         .replace(/\s*preview\s*$/, " preview");
    // strip tier/peak-offpeak/variant suffixes for family grouping
    const clean = n.replace(/\s*(off[- ]?peak|peak|highspeed|fast|contributor|preview|vision exp|exp)\s*$/, "")
                   .replace(/\s+/g, " ").trim();
    return FAMILY_ALIASES[clean] ?? clean;
  }

  const warnings = [];
  const rows = [];
  const planSummaries = [];

  // Pattern-Unifizierung (ai-10-usd-Fairnessregel): Für geteilte Familien nutze das
  // OpenCode-Go-Pattern (echte per-Modell-Tokenstatistik) für ALLE Provider, weil das
  // CC-Feed für fast alle Modelle nur das generische 800/50000/162-Pattern hat.
  const ocFeed = feeds["ocgo-pricing.json"];
  const patternByFamily = new Map();
  if (ocFeed?.models) {
    for (const m of ocFeed.models) {
      const fam = familyOf(m.name);
      if (m.pattern && !patternByFamily.has(fam)) patternByFamily.set(fam, m.pattern);
    }
  }
  function unifiedPattern(family, providerPattern) {
    const ocPat = patternByFamily.get(family);
    return ocPat ?? providerPattern ?? FALLBACK_PATTERN;
  }

  for (const plan of plans) {
    const models = modelsForPlan(plan, feeds);
    const paid = plan.price.paidPrice ?? plan.price.monthlyUsd;
    const meterAmount = plan.meter === "dollar_usage"
      ? plan.quotas.find((q) => q.label === "Monthly")?.amount
      : plan.quotas.find((q) => q.window === "month")?.amount;

    const modelRows = [];
    for (const m of models) {
      const pattern = unifiedPattern(familyOf(m.name), m.pattern);
      const cost = requestCost(m.pricing, pattern);
      const allowance = m.allowance ?? m.usage ?? null;
      if (allowance == null || allowance <= 0) continue;
      let requests = null;
      let unit = "requests";
      if (m.providerCost) {
        // Anbieter-eigene Credit-Formel: Credits / Credits-pro-Request
        if (m.providerCost.creditsPerRequest > 0) {
          requests = allowance / m.providerCost.creditsPerRequest;
          unit = "requests (provider credit formula)";
        }
      } else if (cost !== null && cost > 0) {
        // Feed-Preise: Meter (USD oder Credits) / Kosten pro Request
        requests = allowance / cost;
      }
      if (requests === null || requests <= 0) continue;
      // Fenster-Korrektur (Methodik-Regel: "5h-Windows als Cap, nicht ×180"):
      // - Wochen-Credits sind die Monats-Basis: 1 Woche ≈ 4.33 Wochen/Monat
      // - Monats-Credits = 1× (bereits monatlich)
      // - 5h-Credits sind ROLLING-Caps (Durchsatz), KEINE Monats-Menge → nicht hochrechnen
      const window = m.window ?? null;
      let monthlyRequests = requests;
      let windowNote = null;
      if (window === "week") {
        monthlyRequests = requests * 4.33;
        windowNote = "weekly×4.33→monthly";
      } else if (window === "5h") {
        // 5h-Cap bleibt als Durchsatz-Grenze; für Monats-Vergleich NICHT nutzen
        monthlyRequests = null;
        windowNote = "5h rolling cap (Durchsatz), nicht Monats-Menge";
      }
      if (monthlyRequests === null) continue;
      const normalized = (monthlyRequests * TARGET_PRICE) / paid;
      modelRows.push({
        model: m.name,
        family: familyOf(m.name),
        allowance,
        window,
        windowNote,
        costPerRequest: cost,
        patternUsed: pattern,
        creditsPerRequest: m.providerCost?.creditsPerRequest ?? null,
        unit,
        requestsPerMonth: monthlyRequests,
        requestsRawInWindow: requests,
        normalizedPer10: normalized,
        privacy: m.privacy ?? null,
      });
    }

    // Fenster-Obergrenze: 5h-Windows als Cap, nicht ×180
    const h5 = plan.quotas.find((q) => q.window === "5h");
    const weekly = plan.quotas.find((q) => q.window === "week");
    const monthly = plan.quotas.find((q) => q.window === "month");
    const windowCaps = {
      h5: h5?.amount ?? null,
      weekly: weekly?.amount ?? null,
      monthly: monthly?.amount ?? null,
    };

    planSummaries.push({
      id: plan.id,
      name: plan.name,
      provider: plan.provider,
      price: { monthlyUsd: plan.price.monthlyUsd, paidPrice: paid, advertised: plan.price.advertisedPrice ?? plan.price.monthlyUsd },
      meter: plan.meter,
      quotas: plan.quotas,
      windowCaps,
      officialConversion: plan.workload?.taskConversion ?? null,
      disclosure: plan.disclosure,
      sourceIds: plan.sourceIds ?? [],
      verifiedAt: plan.verifiedAt ?? null,
      modelCount: modelRows.length,
      modelStats: modelRows.length ? distribution(modelRows.map((r) => r.requestsPerMonth)) : null,
      modelRows,
    });

    if (modelRows.length === 0 && plan.disclosure === "disclosed") {
      warnings.push(`${plan.id}: no model pricing from feeds (meter=${plan.meter}) — Rohdaten nur, keine Request-Normalisierung`);
    }
  }

  // Vergleichbarkeit: Paarweise Draw-Analyse über die normalisierten Requests
  const comparablePlans = planSummaries.filter((p) => p.modelStats && p.modelStats.mean > 0);
  const pairwise = [];
  for (let i = 0; i < comparablePlans.length; i++) {
    for (let j = i + 1; j < comparablePlans.length; j++) {
      const a = comparablePlans[i], b = comparablePlans[j];
      const ratio = a.modelStats.mean / b.modelStats.mean;
      const advantagePct = Math.abs(ratio - 1) * 100;
      pairwise.push({
        planA: a.id,
        planB: b.id,
        meanRequestsA: a.modelStats.mean,
        meanRequestsB: b.modelStats.mean,
        advantagePercent: advantagePct,
        winner: advantagePct < DRAW_THRESHOLD_PERCENT ? "draw" : (a.modelStats.mean > b.modelStats.mean ? a.id : b.id),
      });
    }
  }

  // Baue Modell-Vergleichszeilen: pro Plan, pro Familie der Median der $10-normalisierten Requests
  const modelComparisons = [];

  for (const plan of planSummaries) {
    if (!plan.modelRows?.length) continue;
    const famMap = new Map();
    for (const r of plan.modelRows) {
      const fam = familyOf(r.model);
      const arr = famMap.get(fam) ?? [];
      arr.push(r.normalizedPer10);
      famMap.set(fam, arr);
    }
    for (const [fam, vals] of famMap) {
      modelComparisons.push({
        planId: plan.id,
        family: fam,
        modelCount: vals.length,
        normalizedPer10Median: percentile(vals, 0.5),
        normalizedPer10Mean: avg(vals),
      });
    }
  }
  // Paarweise Familien-Vergleiche zwischen Feed-Plänen (haben echte Modell-Preise)
  const feedPlans = planSummaries.filter((p) => ["opencode-go", "command-code-goat", "command-code-pro"].includes(p.id));
  const familyComparisons = [];
  for (let i = 0; i < feedPlans.length; i++) {
    for (let j = i + 1; j < feedPlans.length; j++) {
      const a = feedPlans[i], b = feedPlans[j];
      const aFams = new Map(modelComparisons.filter((m) => m.planId === a.id).map((m) => [m.family, m]));
      const bFams = new Map(modelComparisons.filter((m) => m.planId === b.id).map((m) => [m.family, m]));
      const shared = [...aFams.keys()].filter((f) => bFams.has(f));
      for (const fam of shared) {
        const ma = aFams.get(fam).normalizedPer10Median;
        const mb = bFams.get(fam).normalizedPer10Median;
        if (ma == null || mb == null || ma <= 0 || mb <= 0) continue;
        const advantagePct = Math.abs(ma / mb - 1) * 100;
        familyComparisons.push({
          family: fam,
          planA: a.id,
          planB: b.id,
          requestsA: ma,
          requestsB: mb,
          advantagePercent: advantagePct,
          winner: advantagePct < DRAW_THRESHOLD_PERCENT ? "draw" : (ma > mb ? a.id : b.id),
        });
      }
    }
  }

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    targetMonthlyPrice: TARGET_PRICE,
    methodology: {
      basis: "Rohdaten + offizielle Credit-Formeln + Workload-Profil. '60 für 10' ist nur $-Gegenwert; Vergleichbarkeit via Grundcredits (Token-Preise) + Cache-Modell + Pattern.",
      costPerRequest: "(0.05×input + 0.95×cachedWrite)×pattern.input + cachedRead×pattern.cachedRead + output×pattern.output, /1M",
      normalizedMetric: "average requests per month scaled to exactly $10 paid",
      fallbackPattern: FALLBACK_PATTERN,
      drawThresholdPercent: DRAW_THRESHOLD_PERCENT,
      patternUnification: "Für geteilte Modell-Familien wird das OpenCode-Go-Pattern (echte per-Modell-Tokenstatistik) für beide Provider verwendet; das CC-Feed nutzt sonst nur das generische 800/50000/162-Pattern, was Kosten verzerrt.",
      fenster: "5h-Windows als Obergrenze (Cap), nicht ×180; undisclosed bleibt undisclosed; keine direkte Credit-Umrechnung zwischen Anbietern.",
    },
    sources: Object.fromEntries(Object.entries(feeds).map(([k, v]) => [k, v.fetchedAt ?? null])),
    plans: planSummaries,
    pairwiseComparisons: pairwise,
    modelComparisons,
    familyComparisons,
    aiScores: loadAiScores(ROOT),
    statistics: {
      totalPlans: plans.length,
      comparablePlans: comparablePlans.length,
      plansWithModels: planSummaries.filter((p) => p.modelCount > 0).length,
      undisclosed: planSummaries.filter((p) => p.disclosure === "undisclosed").length,
    },
    warnings,
  };

  const outPath = join(ROOT, "public/data/latest.json");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Generated ${outPath}: ${plans.length} plans, ${comparablePlans.length} comparable, ${warnings.length} warnings`);
  for (const w of warnings) console.log("  WARN:", w);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// AI-Scores (Artificial Analysis Intelligence Index) aus data/ai-scores.json laden
function loadAiScores(root) {
  try {
    const raw = readFileSync(join(root, "data", "ai-scores.json"), "utf8");
    const parsed = JSON.parse(raw);
    return {
      source: parsed.source ?? "Artificial Analysis",
      fetchedAt: parsed.fetchedAt ?? null,
      count: parsed.count ?? Object.keys(parsed.scores ?? {}).length,
      scores: parsed.scores ?? {},
    };
  } catch (e) {
    console.warn("WARN: ai-scores.json nicht lesbar:", e.message);
    return { source: "Artificial Analysis", fetchedAt: null, count: 0, scores: {} };
  }
}
