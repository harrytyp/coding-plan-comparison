/**
 * vibeplan.cc feedback endpoint.
 *
 * Runs as a Cloudflare Worker route on https://vibeplan.cc/api/feedback, so the
 * submission stays on the site's own origin: the page keeps its promise of "no
 * connections to third parties" and no cookie is involved.
 *
 *   POST /api/feedback   { message, contact?, context?, hp? }  -> { ok: true }
 *   GET  /api/feedback?key=<READ_KEY>[&since=<ms>][&limit=<n>]  -> { ok, count, items }
 *
 * Bindings (created by scripts/deploy-feedback-worker.mjs):
 *   FEEDBACK   KV namespace, one entry per submission
 *   MAIL       send_email binding (Cloudflare Email Routing / Email Service)
 *   MAIL_TO    verified destination address
 *   MAIL_FROM  sender on this zone, e.g. feedback@vibeplan.cc
 *   READ_KEY   secret for the read endpoint (also salts the IP hash)
 *
 * No IP address is stored: only sha256(ip + READ_KEY) truncated, for rate limiting.
 */

const MAX_MESSAGE = 4000;
const MAX_CONTACT = 200;
const MAX_BODY = 16384;
const RATE_MAX = 6; // submissions per address and hour
const LIST_LIMIT = 200;

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === "POST") return await submit(request, env, ctx);
      if (request.method === "GET") return await read(new URL(request.url), env);
      return json({ ok: false, error: "method not allowed" }, 405, { allow: "GET, POST" });
    } catch (e) {
      return json({ ok: false, error: "server error" }, 500);
    }
  },
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

/** Control characters and stray whitespace out, hard length cap on. */
function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

async function hash(input) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function submit(request, env, ctx) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return json({ ok: false, error: "too large" }, 413);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }
  if (!body || typeof body !== "object") return json({ ok: false, error: "invalid body" }, 400);
  // Honeypot: silently accept, store nothing, so bots get no feedback loop.
  if (clean(body.hp, 64)) return json({ ok: true });

  const message = clean(body.message, MAX_MESSAGE);
  if (message.length < 3) return json({ ok: false, error: "message too short" }, 422);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (await rateLimited(env, ip)) return json({ ok: false, error: "rate limited" }, 429);

  const ts = Date.now();
  const entry = {
    ts,
    message,
    contact: clean(body.contact, MAX_CONTACT),
    url: clean(body.context?.url, 300),
    lang: clean(body.context?.lang, 8),
    view: clean(body.context?.view, 40),
    filters: clean(body.context?.filters, 300),
    theme: clean(body.context?.theme, 12),
    country: clean(request.cf?.country, 4),
    ua: clean(request.headers.get("user-agent"), 200),
    ipHash: await hash(`${ip}${env.READ_KEY || ""}`),
  };

  // Sortable key: zero-padded timestamp first, random tail against collisions.
  const key = `fb:${String(ts).padStart(14, "0")}:${crypto.randomUUID().slice(0, 8)}`;
  await env.FEEDBACK.put(key, JSON.stringify(entry));
  if (env.MAIL && env.MAIL_TO && env.MAIL_FROM) {
    // A mail failure never fails the submission, but it must be visible in the
    // Worker logs instead of vanishing: otherwise "sent" is unverifiable.
    ctx.waitUntil(
      mail(env, entry)
        .then(() => console.log("mail ok", entry.ts))
        .catch((e) => console.error("mail failed", entry.ts, e?.message || String(e)))
    );
  }
  return json({ ok: true });
}

async function rateLimited(env, ip) {
  const key = `rl:${await hash(ip)}`;
  const seen = Number((await env.FEEDBACK.get(key)) || 0);
  if (seen >= RATE_MAX) return true;
  await env.FEEDBACK.put(key, String(seen + 1), { expirationTtl: 3600 });
  return false;
}

async function mail(env, entry) {
  const subject = `[vibeplan] ${entry.message.slice(0, 60).replace(/\s+/g, " ")}`;
  const lines = [
    entry.message,
    "",
    "---",
    `contact: ${entry.contact || "-"}`,
    `page:    ${entry.url || "-"}`,
    `view:    ${entry.view || "-"}${entry.filters ? ` | ${entry.filters}` : ""}`,
    `lang:    ${entry.lang || "-"}`,
    `time:    ${new Date(entry.ts).toISOString()}`,
    `country: ${entry.country || "-"}`,
    `agent:   ${entry.ua || "-"}`,
    `id:      ${entry.ts}`,
  ];
  await env.MAIL.send({
    from: { email: env.MAIL_FROM, name: "vibeplan feedback" },
    to: env.MAIL_TO,
    subject,
    text: lines.join("\n"),
  });
}

async function read(url, env) {
  const key = url.searchParams.get("key") || "";
  if (!env.READ_KEY || key !== env.READ_KEY) return json({ ok: false, error: "unauthorized" }, 401);

  const since = Number(url.searchParams.get("since") || 0) || 0;
  const limit = Math.min(Number(url.searchParams.get("limit") || LIST_LIMIT) || LIST_LIMIT, LIST_LIMIT);

  const keys = [];
  let cursor;
  do {
    const page = await env.FEEDBACK.list({ prefix: "fb:", limit: 1000, cursor });
    keys.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && keys.length < 5000);

  const newest = keys.slice(-limit).reverse();
  const found = [];
  for (const name of newest) {
    const raw = await env.FEEDBACK.get(name);
    if (!raw) continue;
    const entry = JSON.parse(raw);
    if (entry.ts > since) found.push([name, entry]);
  }
  // Neueste zuerst; bei identischem Millisekunden-Stempel entscheidet der Key,
  // damit die Antwort reproduzierbar bleibt.
  found.sort((a, b) => b[1].ts - a[1].ts || (a[0] < b[0] ? 1 : -1));
  const items = found.map(([, entry]) => entry);
  return json({ ok: true, count: items.length, items });
}
