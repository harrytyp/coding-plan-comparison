/**
 * Unit tests for the feedback Worker (worker/feedback-worker.js) and for the
 * wiring in the page markup. No network, no Cloudflare account: the KV and the
 * send_email binding are faked, so this runs in plain `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import worker from "../worker/feedback-worker.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const READ_KEY = "test-key";

function fakeKV() {
  const store = new Map();
  return {
    store,
    async get(key) { return store.has(key) ? store.get(key) : null; },
    async put(key, value) { store.set(key, value); },
    async list({ prefix = "", cursor } = {}) {
      const keys = [...store.keys()].filter((k) => k.startsWith(prefix)).sort().map((name) => ({ name }));
      return { keys, list_complete: true, cursor: undefined };
    },
  };
}

function fakeEnv(overrides = {}) {
  const sent = [];
  return {
    env: {
      FEEDBACK: fakeKV(),
      MAIL: { send: async (msg) => { sent.push(msg); } },
      MAIL_TO: "kolja@example.org",
      MAIL_FROM: "feedback@vibeplan.cc",
      READ_KEY,
      ...overrides,
    },
    sent,
  };
}

function ctx() {
  const pending = [];
  return { waitUntil: (p) => pending.push(p), pending };
}

function post(body, { ip = "203.0.113.9", headers = {} } = {}) {
  return new Request("https://vibeplan.cc/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("POST speichert eine Meldung und schickt eine Mail", async () => {
  const { env, sent } = fakeEnv();
  const c = ctx();
  const res = await worker.fetch(post({ message: "  Cursor Ultra price is wrong  ", contact: "a@b.c", context: { url: "https://vibeplan.cc/?lang=de", lang: "de", view: "view-plans", filters: "no API hidden" } }), env, c);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(env.FEEDBACK.store.size, 2, "Meldung + Rate-Limit-Zaehler");
  const entry = JSON.parse([...env.FEEDBACK.store.entries()].find(([k]) => k.startsWith("fb:"))[1]);
  assert.equal(entry.message, "Cursor Ultra price is wrong");
  assert.equal(entry.lang, "de");
  assert.equal(entry.view, "view-plans");
  assert.ok(entry.ipHash && entry.ipHash.length === 16, "IP nur als Hash");
  assert.ok(!JSON.stringify(entry).includes("203.0.113.9"), "keine IP im Datensatz");
  await Promise.all(c.pending);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "kolja@example.org");
  assert.match(sent[0].subject, /Cursor Ultra/);
  assert.match(sent[0].text, /page:\s+https:\/\/vibeplan\.cc/);
});

test("Honeypot: Bot bekommt ok, aber nichts wird gespeichert", async () => {
  const { env, sent } = fakeEnv();
  const res = await worker.fetch(post({ message: "spam spam", hp: "http://spam" }), env, ctx());
  assert.equal(res.status, 200);
  assert.equal(env.FEEDBACK.store.size, 0);
  assert.equal(sent.length, 0);
});

test("zu kurze Meldung wird abgelehnt", async () => {
  const { env } = fakeEnv();
  const res = await worker.fetch(post({ message: "hi" }), env, ctx());
  assert.equal(res.status, 422);
  assert.equal(env.FEEDBACK.store.size, 0);
});

test("kaputtes JSON und zu grosser Body werden abgelehnt", async () => {
  const { env } = fakeEnv();
  assert.equal((await worker.fetch(post("{nope"), env, ctx())).status, 400);
  const big = new Request("https://vibeplan.cc/api/feedback", {
    method: "POST", headers: { "content-type": "application/json", "content-length": "99999" }, body: "{}",
  });
  assert.equal((await worker.fetch(big, env, ctx())).status, 413);
});

test("Rate-Limit greift nach 6 Meldungen pro Adresse", async () => {
  const { env } = fakeEnv();
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push((await worker.fetch(post({ message: `Meldung Nummer ${i}` }), env, ctx())).status);
  }
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 200, 429, 429]);
});

test("Mail-Fehler laesst die Meldung nicht scheitern", async () => {
  const { env } = fakeEnv({ MAIL: { send: async () => { throw new Error("boom"); } } });
  const c = ctx();
  const res = await worker.fetch(post({ message: "funktioniert trotzdem" }), env, c);
  assert.equal(res.status, 200);
  await Promise.all(c.pending);
  assert.equal(env.FEEDBACK.store.size, 2);
});

test("GET ohne Schluessel ist 401, mit Schluessel kommen die Meldungen", async () => {
  const { env } = fakeEnv();
  await worker.fetch(post({ message: "erste Meldung" }), env, ctx());
  await new Promise((r) => setTimeout(r, 2)); // zwei Meldungen nie in derselben Millisekunde
  await worker.fetch(post({ message: "zweite Meldung" }), env, ctx());

  const denied = await worker.fetch(new Request("https://vibeplan.cc/api/feedback"), env, ctx());
  assert.equal(denied.status, 401);

  const res = await worker.fetch(new Request(`https://vibeplan.cc/api/feedback?key=${READ_KEY}`), env, ctx());
  const data = await res.json();
  assert.equal(data.count, 2);
  assert.equal(data.items[0].message, "zweite Meldung", "neueste zuerst");
  assert.equal(data.items[1].message, "erste Meldung");

  const since = data.items[0].ts;
  const only = await (await worker.fetch(new Request(`https://vibeplan.cc/api/feedback?key=${READ_KEY}&since=${since}`), env, ctx())).json();
  assert.equal(only.count, 0, "since filtert alles Aeltere weg");
});

test("andere Methoden werden abgewiesen", async () => {
  const { env } = fakeEnv();
  const res = await worker.fetch(new Request("https://vibeplan.cc/api/feedback", { method: "DELETE" }), env, ctx());
  assert.equal(res.status, 405);
});

/* ---- Seitliche Verdrahtung: Button, Panel, i18n ---- */

test("Seite hat Footer-Button, Panel und Honeypot", async () => {
  const html = await readFile(join(ROOT, "public/index.html"), "utf8");
  assert.match(html, /id="open-feedback"/);
  assert.match(html, /data-i18n="foot.feedback"/);
  assert.match(html, /id="fbk-overlay"/);
  assert.match(html, /id="fbk-hp"/);
  assert.match(html, /class="fbk-hp"/);
  assert.match(html, /fetch\('\/api\/feedback'/);
  // 44px Trefferflaeche fuer den Footer-Button (Regel existiert fuer .footer-links .linklike)
  assert.match(html, /\.footer-links a, \.footer-links \.linklike \{[^}]*min-height: 44px/);
  // Panel liegt nach </main>, sonst ist main der Containing Block fuer position:fixed
  assert.ok(html.indexOf('id="fbk-overlay"') > html.indexOf("</main>"));
});

test("Mobil: Feedback-Kontrolle sichtbar und Panel passt auf kleine Hoehen", async () => {
  const html = await readFile(join(ROOT, "public/index.html"), "utf8");
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  assert.ok(css.length > 5000, "Stylesheet gefunden");

  // Kein Regelwerk darf den Footer-Button oder seine Linkzeile ausblenden:
  // haeufigster Regressionsgrund fuer "auf dem Handy ist der Link weg".
  for (const sel of ["#open-feedback", ".footer-links", ".linklike"]) {
    const hiding = [...css.matchAll(new RegExp(`(^|\\})\\s*([^{}]*${sel.replace(".", "\\.")}[^{}]*)\\{([^}]*)\\}`, "g"))]
      .filter((m) => /display:\s*none/.test(m[3]));
    assert.equal(hiding.length, 0, `${sel} darf nie display:none bekommen: ${JSON.stringify(hiding.map((m) => m[2].trim()))}`);
  }
  // Der Button steht im Footer, nicht in einem hidden-Container.
  const footer = html.slice(html.indexOf("<footer>"), html.indexOf("</footer>"));
  assert.match(footer, /id="open-feedback"/);
  assert.ok(!/hidden/.test(footer.replace(/hidden=""/g, "")) || !/\shidden[\s>]/.test(footer));

  // Panel: Hoehe an das *sichtbare* Viewport gebunden (Tastatur/Adressleiste),
  // sonst liegt der Send-Button unter der Tastatur.
  assert.match(css, /\.fbk\s*\{[^}]*max-height:\s*calc\(100dvh - 32px\)/);
  assert.match(css, /\.fbk\s*\{[^}]*overflow:\s*auto/);
  assert.match(css, /@media \(max-width: 520px\)\s*\{[^}]*\.fbk\s*\{[^}]*padding:\s*14px/);
  // Tap-Target 44px bleibt auch in der kleinen Ansicht erhalten.
  assert.match(css, /#open-feedback\s*\{[^}]*padding:\s*10px 2px/);
});

test("Mobil: der feste Filter-Griff verdeckt Feedback/Legal nicht", async () => {
  const html = await readFile(join(ROOT, "public/index.html"), "utf8");
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

  // Griff: fest, 48px hoch, 14px ueber der Unterkante (plus Safe-Area).
  const trig = css.match(/\.rail-trigger\s*\{([^}]*)\}/);
  assert.ok(trig, ".rail-trigger existiert");
  const trigCss = trig[1];
  assert.match(trigCss, /position:\s*fixed/);
  const trigH = Number((trigCss.match(/min-height:\s*(\d+)px/) || [])[1]);
  const trigBottom = Number((trigCss.match(/bottom:\s*calc\((\d+)px/) || [])[1]);
  assert.equal(trigH, 48);
  assert.equal(trigBottom, 14);

  // Footer muss so viel Luft haben, dass die letzte Zeile ueber dem Griff endet.
  const footerReserve = Number(
    (css.match(/\.footer-row\s*\{\s*padding-bottom:\s*calc\((\d+)px \+ env\(safe-area-inset-bottom/) || [])[1]
  );
  assert.ok(footerReserve, "Footer hat eine Reserve fuer den Griff");
  assert.ok(
    footerReserve >= trigH + trigBottom,
    `Reserve ${footerReserve}px muss Griff (${trigH}px + ${trigBottom}px Abstand) abdecken`
  );

  // Cascade: die Reserve-Regel steht nach den Basispaddings von .footer-row.
  assert.ok(
    css.lastIndexOf(".footer-row { padding-bottom: calc(") > css.indexOf(".footer-row { padding: 18px 14px; }"),
    "Reserve-Regel muss die mobilen Basispaddings ueberschreiben"
  );
});

test("jeder fbk-Key existiert in beiden Sprachen", async () => {
  const [html, app] = await Promise.all([
    readFile(join(ROOT, "public/index.html"), "utf8"),
    readFile(join(ROOT, "public/app.js"), "utf8"),
  ]);
  const used = new Set([...html.matchAll(/data-i18n(?:-aria|-title|-ph)?="([^"]+)"/g)].map((m) => m[1]));
  const wanted = [...used].filter((k) => k.startsWith("fbk.") || k === "foot.feedback");
  assert.ok(wanted.length >= 10, `fbk-Keys im Markup gefunden: ${wanted.length}`);
  for (const key of wanted) {
    const hits = [...app.matchAll(new RegExp(`"${key.replace(/\./g, "\\.")}":`, "g"))].length;
    assert.equal(hits, 2, `${key} muss einmal in en und einmal in de stehen (gefunden: ${hits})`);
  }
});
