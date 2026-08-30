/**
 * parsers.mjs — Parser für alle Quellen aus sources.yml.
 * Jeder Parser nimmt den rohen Snapshot (Buffer/String) und liefert strukturierte Daten.
 * Deterministisch: gleicher Input → gleicher Output. Kein Netzwerk hier.
 */
import { parseYaml } from "./yaml.mjs";

// ---------- HTML → Text-Helfer ----------
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function findSection(text, startKw, endKws = []) {
  // Letztes Vorkommen (TOC-Erwähnungen überspringen, echte Section ist meist die letzte)
  const start = text.lastIndexOf(startKw);
  if (start < 0) return null;
  let end = text.length;
  for (const kw of endKws) {
    const idx = text.indexOf(kw, start + startKw.length);
    if (idx >= 0 && idx < end) end = idx;
  }
  return text.slice(start, end);
}

// ---------- Parser: ocgo-pricing (JSON) ----------
export function parseOcgo(raw) {
  const data = JSON.parse(raw);
  return {
    // KEIN fetchedAt — volatiler Timestamp, würde contentHash falsch-positiv machen.
    sourceUrl: data.sourceUrl,
    monthlyCredit: data.monthlyCredit,
    monthlyCost: data.monthlyCost,
    peakHours: data.peakHours,
    models: (data.models ?? []).map((m) => ({
      name: m.name,
      tier: m.tier ?? null,
      input: m.input,
      output: m.output,
      cachedRead: m.cachedRead,
      cachedWrite: m.cachedWrite ?? null,
      usage: m.usage,
      multiplier: m.multiplier ?? null,
      pattern: m.pattern ?? null,
      effectiveInput: m.effectiveInput ?? null,
      effectiveOutput: m.effectiveOutput ?? null,
      effectiveCachedRead: m.effectiveCachedRead ?? null,
      effectiveCachedWrite: m.effectiveCachedWrite ?? null,
      provider: m.provider ?? null,
      privacy: m.privacy ?? null,
    })),
  };
}

// ---------- Parser: cc-pricing (JSON) ----------
export function parseCc(raw) {
  const data = JSON.parse(raw);
  return {
    // KEIN fetchedAt — volatiler Timestamp, würde contentHash falsch-positiv machen.
    sourceUrl: data.sourceUrl,
    plans: (data.plans ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      priceMonthly: p.priceMonthly,
      creditsMonthly: p.creditsMonthly,
      requestEstimate: p.requestEstimate ?? null,
      apiAccess: p.apiAccess ?? null,
      limits: p.limits ?? null,
      defaultAllowance: p.defaultAllowance ?? null,
      modelsIncluded: p.modelsIncluded ?? null,
      sourceUrl: p.sourceUrl ?? null,
    })),
    models: (data.models ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider ?? null,
      category: m.category ?? null,
      tier: m.tier ?? null,
      input: m.input,
      output: m.output,
      cachedRead: m.cachedRead,
      cachedWrite: m.cachedWrite ?? null,
      listInput: m.listInput ?? null,
      listOutput: m.listOutput ?? null,
      allowances: m.allowances ?? null,
      pattern: m.pattern ?? null,
      deal: m.deal ?? null,
      availability: m.availability ?? null,
    })),
  };
}

// ---------- Parser: GLM Coding Plan Overview (HTML) ----------
export function parseGlmOverview(html) {
  const text = htmlToText(html);
  const out = { quotas: [], formula: null, mcpPerCall: null, offPeakDiscount: null, models: [] };

  // Quoten: "Lite 套餐 2,000 10,000" Tabelle — direkt im Text suchen (Section-Grenzen sind fragil)
  const quotaRe = /(Lite|Pro|Max)\s*套餐\s*([\d,]+)\s*([\d,]+)/g;
  let qm;
  const seenTiers = new Set();
  while ((qm = quotaRe.exec(text))) {
    const tier = qm[1].toLowerCase();
    if (seenTiers.has(tier)) continue; // nur erste (echte) Tabelle
    seenTiers.add(tier);
    out.quotas.push({
      tier,
      h5: parseInt(qm[2].replace(/,/g, ""), 10),
      weekly: parseInt(qm[3].replace(/,/g, ""), 10),
    });
  }

  // Formel: "模型消耗积分数=（输入 Token × Input 抵扣系数 + 缓存命中 Token × Cached Input 抵扣系数 + 输出 Token × Output 抵扣系数） / 10000"
  const formulaSection = findSection(text, "积分抵扣计算方式", ["可用额度参考"]);
  if (formulaSection) {
    // Tabelle: "模型 GLM-5.3 6.9 1.7 24" und "GLM-5.3-Flash（含视觉理解 MCP） 2.3 0.56 8"
    const modelRe = /GLM-([\d.]+(?:-Flash)?)[^]*?([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
    let m;
    while ((m = modelRe.exec(formulaSection))) {
      out.models.push({ model: `GLM-${m[1]}`, input: parseFloat(m[2]), cachedRead: parseFloat(m[3]), output: parseFloat(m[4]) });
    }
    // MCP: "MCP 工具 联网搜索 — — 1.2"
    const mcpRe = /MCP\s*工具\s*联网搜索\s*—\s*—\s*([\d.]+)/;
    const mcpM = mcpRe.exec(formulaSection);
    if (mcpM) out.mcpPerCall = parseFloat(mcpM[1]);
    out.formula = "模型消耗积分数=（输入 Token × Input 抵扣系数 + 缓存命中 Token × Cached Input 抵扣系数 + 输出 Token × Output 抵扣系数）/ 10000";
  }

  // Off-Peak: "非高峰时段内，模型调用按基础积分消耗的 50% 抵扣"
  if (text.includes("非高峰时段内，模型调用按基础积分消耗的 50% 抵扣")) {
    out.offPeakDiscount = 0.5;
  }

  return out;
}

// ---------- Parser: Qwen Docs (HTML) ----------
export function parseQwenDocs(html) {
  const text = htmlToText(html);
  const out = { plans: [], taskConversion: null };
  // Preise + Quoten: "Price $ 50 /month Quota Up to 6,000 requests per 5 hours ..."
  const priceRe = /Price\s*\$?\s*([\d.]+)\s*\/month/g;
  const quota5hRe = /Up to\s*([\d,]+)\s*requests per 5 hours/g;
  const quotaWeekRe = /Up to\s*([\d,]+)\s*requests per week/g;
  const quotaMonthRe = /Up to\s*([\d,]+)\s*requests per month/g;
  let m;
  const prices = [];
  while ((m = priceRe.exec(text))) prices.push(parseFloat(m[1]));
  const q5h = [...text.matchAll(quota5hRe)].map((x) => parseInt(x[1].replace(/,/g, ""), 10));
  const qw = [...text.matchAll(quotaWeekRe)].map((x) => parseInt(x[1].replace(/,/g, ""), 10));
  const qm = [...text.matchAll(quotaMonthRe)].map((x) => parseInt(x[1].replace(/,/g, ""), 10));
  if (prices.length) {
    out.plans.push({ name: "Coding Plan Pro", price: prices[0], quota5h: q5h[0] ?? null, quotaWeek: qw[0] ?? null, quotaMonth: qm[0] ?? null });
  }
  const conv = /Simple tasks typically use\s*([\d–-]+)\s*calls?, while complex tasks may use\s*([\d–-]+)\s*or more/i.exec(text);
  if (conv) out.taskConversion = `simple ${conv[1]} calls, complex ${conv[2]}+ calls`;
  return out;
}

// ---------- Parser: Qwen Token Personal (HTML) ----------
export function parseQwenTokenPersonal(html) {
  const text = htmlToText(html);
  const out = { plans: [], extraBundle: null };
  // Spaltenweise Tabelle: "Lite plan Standard plan Pro plan ... Original price $8/month Limited-time $6/month Original price $25/month Limited-time $18/month ..."
  // Extrahiere "Original price $X/month Limited-time $Y/month" Sequenz + "N Credits" Quoten
  const prices = [...text.matchAll(/Original price \$([\d.]+)\/month\s*Limited-time \$([\d.]+)\/month/g)].map((m) => ({ original: parseFloat(m[1]), limited: parseFloat(m[2]) }));
  // Quoten: "2,500 Credits" / "10,000 Credits" / "40,000 Credits" nach dem Pricing-Block
  const quotaIdx = text.indexOf("7-day quota");
  const quotaText = quotaIdx >= 0 ? text.slice(quotaIdx, quotaIdx + 200) : text;
  const quotas = [...quotaText.matchAll(/([\d,]+)\s*Credits/g)].map((m) => parseInt(m[1].replace(/,/g, ""), 10));
  const names = ["Lite", "Standard", "Pro"];
  prices.forEach((p, i) => {
    if (i >= names.length) return;
    out.plans.push({ name: names[i], originalPrice: p.original, limitedPrice: p.limited, quota7d: quotas[i] ?? null });
  });
  const bundle = /\$([\d.]+)\/bundle\/month\s*([\d,]+)\s*Credits\/bundle/.exec(text);
  if (bundle) out.extraBundle = { price: parseFloat(bundle[1]), credits: parseInt(bundle[2].replace(/,/g, ""), 10) };
  return out;
}

// ---------- Parser: Kimi Membership Pricing (HTML) ----------
export function parseKimiPricing(html) {
  const text = htmlToText(html);
  const out = { plans: [] };
  // "Andante Everyday use ¥49/month" etc.
  const re = /(Andante|Moderato|Allegretto|Allegro|Vivace)\s*[^¥]*?¥([\d.]+)\/month/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(text))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.plans.push({ name: m[1], priceCny: parseFloat(m[2]) });
  }
  return out;
}

// ---------- Parser: Kimi Code Membership (HTML) ----------
export function parseKimiCode(html) {
  const text = htmlToText(html);
  const out = {
    quotaRefresh: null,
    rollover: null,
    fiveHourWindow: null,
    extraUsage: null,
    sharedWith: null,
  };
  if (/quota refreshes automatically every 7 days/i.test(text)) out.quotaRefresh = "7d";
  if (/unused quota does not roll over/i.test(text)) out.rollover = false;
  if (/rolling 5-hour rate window/i.test(text)) out.fiveHourWindow = true;
  if (/Extra Usage/i.test(text) && /charged by actual usage/i.test(text)) out.extraUsage = "RMB, charged by actual usage, rates close to platform API";
  if (/shares quota with your Kimi membership/i.test(text)) out.sharedWith = "Kimi membership";
  return out;
}

// ---------- Parser: Privacy-Policy-Text (z.B. Command Code) ----------
// Extrahiert strukturierte Privacy-Aussagen aus Policy-Text.
// Deterministisch: sucht nach dokumentierten Mustern; unbekannt bleibt unbekannt.
export function parsePrivacyText(html) {
  const text = htmlToText(html);
  const out = {
    training: null,
    trainingQuote: null,
    zeroRetention: null,
    zeroRetentionQuote: null,
    retentionDays: null,
    retentionQuote: null,
    provider: null,
  };

  // Anbieter erkennen (aus URL-Mustern im Text oder fix via Aufrufer)
  if (/command ?code/i.test(text)) out.provider = "command-code";

  // "does not train" / "never use for training" → training=false
  const noTrain = /(does not|never|will not|won't|do not)\s+(train|use[^.]*for (model )?training)/i.exec(text);
  if (noTrain) {
    out.training = false;
    out.trainingQuote = text.slice(Math.max(0, noTrain.index - 60), noTrain.index + 120).trim();
  }
  // "trains on" / "may use for training" → training=true
  const yesTrain = /(trains?|may use|uses)[^.]*\b(train(ing)?)\b/i.exec(text);
  if (!noTrain && yesTrain) {
    out.training = true;
    out.trainingQuote = text.slice(Math.max(0, yesTrain.index - 60), yesTrain.index + 120).trim();
  }

  // "zero data retention" / "never stored" → zeroRetention=true
  const zero = /(zero[ -]?data retention|never stored|not stored)/i.exec(text);
  if (zero) {
    out.zeroRetention = true;
    out.zeroRetentionQuote = text.slice(Math.max(0, zero.index - 70), zero.index + 120).trim();
  }

  // "retained for up to X days" / "thirty (30) days" / "30 days" → retentionDays
  const ret = /retained?[^.]{0,60}?\(?(\d{1,3})\)?\s*days?/i.exec(text)
    || /(?:up to|for)\s+(?:thirty|sixty|ninety)?\s*\(?(\d{1,3})\)?\s*days?/i.exec(text)
    || /retained?[^.]{0,40}?(\d{1,3})\s*days?/i.exec(text);
  if (ret) {
    out.retentionDays = parseInt(ret[1], 10);
    out.retentionQuote = text.slice(Math.max(0, ret.index - 70), ret.index + 120).trim();
  }

  return out;
}

// ---------- Registry ----------
export const PARSERS = {
  ocgo: parseOcgo,
  cc: parseCc,
  "glm-overview": parseGlmOverview,
  "qwen-docs": parseQwenDocs,
  "qwen-token-personal": parseQwenTokenPersonal,
  "kimi-pricing": parseKimiPricing,
  "kimi-code": parseKimiCode,
  "privacy-text": parsePrivacyText,
};
