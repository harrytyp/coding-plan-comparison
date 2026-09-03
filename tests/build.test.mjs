import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// Basis-Tests gegen den Generator-Output (latest.json) + Parser-Logik.
// Die eigentliche Generator-Logik ist in build.mjs; hier testen wir die invarianten
// Ergebnisse, die reproduzierbar sein müssen.

test("latest.json existiert und hat Schema", async () => {
  const raw = await readFile(join(ROOT, "public/data/latest.json"), "utf8");
  const d = JSON.parse(raw);
  assert.equal(d.schemaVersion, 1);
  assert.equal(d.targetMonthlyPrice, 10);
  assert.ok(Array.isArray(d.plans));
  // Dynamisch: nur Pläne mit echten Quellen (keine statischen Erfindungen)
  assert.ok(d.plans.length >= 15, "sollte ≥15 Pläne aus Quellen haben");
  assert.ok(d.methodology?.costPerRequest, "Methodik muss Kostenformel dokumentieren");
  // Jeder Plan muss eine Quelle haben
  for (const p of d.plans) {
    assert.ok(p.sourceIds?.length, `${p.id}: muss sourceIds haben`);
    assert.ok(p.verifiedAt, `${p.id}: muss verifiedAt haben`);
  }
});

test("opencode-go ist vergleichbar (Feed-Modelle)", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  const oc = d.plans.find((p) => p.id === "opencode-go");
  assert.ok(oc, "opencode-go muss existieren");
  assert.ok(oc.modelCount >= 30, "opencode-go sollte ≥30 Modelle aus Feed haben");
  assert.ok(oc.modelStats.mean > 0);
  // $10-Normalisierung: requests pro $10 = requests (paid=10)
  const row = oc.modelRows[0];
  assert.ok(Math.abs(row.normalizedPer10 - row.requestsPerMonth) < 0.001,
    "bei paid=10 ist normalizedPer10 = requestsPerMonth");
});

test("command-code-goat ist vergleichbar und $10-normalisiert", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  const goat = d.plans.find((p) => p.id === "command-code-goat");
  assert.ok(goat, "command-code-goat muss existieren");
  assert.equal(goat.price.paidPrice, 10.77, "bezahlter Preis muss 10.77 sein (ai-10-usd)");
  assert.ok(goat.modelCount >= 50, "GOAT sollte ≥50 Modelle haben");
  // Normalisierung: requests × 10 / 10.77 < requests
  const row = goat.modelRows[0];
  assert.ok(row.normalizedPer10 < row.requestsPerMonth,
    "bei paid=10.77 ist normalizedPer10 < requestsPerMonth");
  assert.ok(Math.abs(row.normalizedPer10 - row.requestsPerMonth * 10 / 10.77) < 0.01,
    "Normalisierung = requests × 10 / paidPrice");
});

test("GLM nutzt Anbieter-Credit-Formel (beide Modelle, offiziell)", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  const pro = d.plans.find((p) => p.id === "glm-pro");
  assert.ok(pro, "glm-pro muss existieren");
  // Nach Fenster-Korrektur: nur Wochen-Rows (5h-Caps raus)
  assert.ok(pro.modelRows.length >= 2, "GLM-5.3 + GLM-5.3-Flash (Wochen-Basis)");
  const glm53 = pro.modelRows.find((r) => r.model === "GLM-5.3");
  const flash = pro.modelRows.find((r) => r.model === "GLM-5.3-Flash");
  assert.ok(glm53 && flash, "beide GLM-Modelle müssen present sein");
  // Formel GLM-5.3: (in×6.9 + cached×1.7 + out×24)/10000 — Pattern aus Feed (GLM-5.3: 1000/55000/200)
  const expected53 = (1000 * 6.9 + 55000 * 1.7 + 200 * 24) / 10000;
  assert.ok(Math.abs(glm53.creditsPerRequest - expected53) < 0.001,
    `GLM-5.3: (in×6.9 + cached×1.7 + out×24)/10000 = ${expected53}`);
  // Formel GLM-5.3-Flash: (in×2.3 + cached×0.56 + out×8)/10000
  const expectedFlash = (1000 * 2.3 + 55000 * 0.56 + 200 * 8) / 10000;
  assert.ok(Math.abs(flash.creditsPerRequest - expectedFlash) < 0.001,
    `GLM-5.3-Flash: (in×2.3 + cached×0.56 + out×8)/10000 = ${expectedFlash}`);
  // Wochen-Fenster: weekly×4.33→monthly
  assert.equal(glm53.window, "week");
  assert.ok(Math.abs(glm53.requestsPerMonth - glm53.requestsRawInWindow * 4.33) < 1,
    "weekly → ×4.33 monthly");
});

test("Preisdiskrepanzen aufgelöst: offizielle Preise (GLM CNY, Kimi USD, Qwen USD)", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  const glmPro = d.plans.find((p) => p.id === "glm-pro");
  // CNY 538 ≈ $75 (offiziell); nicht mehr Scouty $72 oder coding-plans $30
  assert.ok(Math.abs(glmPro.price.paidPrice - 75) < 2, "GLM Pro paid ≈ $75 (CNY 538)");
  assert.ok(glmPro.price.monthlyUsd > 70, "GLM Pro nicht mehr $30 (coding-plans falsch)");
  const kimiMod = d.plans.find((p) => p.id === "kimi-moderato");
  // Kimi.ai hat USD-Preise (primär): $19/Monat (kimi.com CNY ¥99 ist sekundär)
  assert.ok(Math.abs(kimiMod.price.paidPrice - 19) < 1, "Kimi Moderato ≈ $19 (kimi.ai USD, nicht ¥99→$13.9)");
  const qwenStd = d.plans.find((p) => p.id === "qwen-token-personal-standard");
  assert.equal(qwenStd.price.paidPrice, 18, "Qwen Standard limited-time $18");
  assert.equal(qwenStd.price.advertised, 25, "Qwen Standard Original $25");
});

test("Draw-Schwelle: relative Differenz < 10% = draw", async () => {
  // Die Draw-Logik ist in build.mjs (DRAW_THRESHOLD_PERCENT=10).
  // Wir testen die Logik indirekt: pairwise winner ist nie 'draw' bei großen Abständen.
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  for (const pw of d.pairwiseComparisons) {
    if (pw.advantagePercent >= 10) {
      assert.notEqual(pw.winner, "draw", "≥10% Abstand darf kein draw sein");
    }
  }
});

test("Pattern-Unifizierung: geteilte Familien nutzen dasselbe Pattern (ai-10-usd-Fairness)", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  const oc = d.plans.find((p) => p.id === "opencode-go");
  const goat = d.plans.find((p) => p.id === "command-code-goat");
  // DeepSeek V4 Flash existiert in beiden Feeds; beide müssen das OC-Pattern (410/71300/310) nutzen
  const ocRow = oc.modelRows.find((r) => r.family === "deepseek v4 flash");
  const ccRow = goat.modelRows.find((r) => r.family === "deepseek v4 flash");
  assert.ok(ocRow && ccRow, "DeepSeek V4 Flash muss in beiden Plänen sein");
  assert.deepEqual(ocRow.patternUsed, ccRow.patternUsed,
    "geteilte Familie muss identisches Pattern nutzen (OC-Pattern als kanonisch)");
  assert.deepEqual(ocRow.patternUsed, { input: 410, cachedRead: 71300, output: 310 },
    "DeepSeek V4 Flash Pattern = OC-Feed (410/71300/310)");
});

test("Dynamik: Daten kommen aus geparsten Quellen (nicht statisch)", async () => {
  // parsed/ muss die strukturierten Quellen enthalten
  const { readdir } = await import("node:fs/promises");
  const parsedDir = join(ROOT, "parsed");
  const files = (await readdir(parsedDir)).filter((f) => f.endsWith(".json"));
  assert.ok(files.includes("ocgo-pricing.json"), "ocgo-pricing muss geparst sein");
  assert.ok(files.includes("glm-coding-overview.json"), "GLM-Docs müssen geparst sein");
  assert.ok(files.includes("kimi-membership-pricing.json"), "Kimi-Pricing muss geparst sein");

  // GLM-Parser: Quoten + Formel + beide Modelle
  const glm = JSON.parse(await readFile(join(parsedDir, "glm-coding-overview.json"), "utf8"));
  assert.equal(glm.quotas.length, 3, "GLM Lite/Pro/Max Quoten");
  assert.ok(glm.models.some((m) => m.model === "GLM-5.3" && m.input === 6.9), "GLM-5.3 Koeffizienten");
  assert.ok(glm.models.some((m) => m.model === "GLM-5.3-Flash" && m.input === 2.3), "GLM-5.3-Flash Koeffizienten");
  assert.equal(glm.offPeakDiscount, 0.5, "Off-Peak 50%");

  // Qwen-Parser: Limited-Time-Preise
  const qwen = JSON.parse(await readFile(join(parsedDir, "qwen-token-personal.json"), "utf8"));
  const std = qwen.plans.find((p) => p.name === "Standard");
  assert.equal(std.limitedPrice, 18, "Qwen Standard $18");
  assert.equal(std.originalPrice, 25, "Qwen Standard Original $25");

  // Kimi-Parser: CNY-Preise
  const kimi = JSON.parse(await readFile(join(parsedDir, "kimi-membership-pricing.json"), "utf8"));
  const mod = kimi.plans.find((p) => p.name === "Moderato");
  assert.equal(mod.priceCny, 99, "Kimi Moderato ¥99");
});

test("undisclosed Pläne haben keine erfundenen Zahlen", async () => {
  const d = JSON.parse(await readFile(join(ROOT, "public/data/latest.json"), "utf8"));
  for (const p of d.plans) {
    if (p.disclosure === "undisclosed") {
      assert.equal(p.modelStats, null, `${p.id}: undisclosed darf keine erfundene Modellstatistik haben`);
    }
  }
});
