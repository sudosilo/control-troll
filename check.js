// Layer one daily check. Loads every app in apps.json in a headless browser
// and writes the results to status.json. Costs zero tokens.
const fs = require("fs");
const { chromium } = require("playwright");
const { runTests } = require("./tests");
const history = require("./history");
const queue = require("./queue");

const TIMEOUT = 30000;
const MAX_SNAPSHOT = 3 * 1024 * 1024;

async function checkApp(browser, app) {
  const result = { name: app.name, url: app.url, up: false, status: null, ms: null, errors: [] };
  const page = await browser.newPage();
  page.on("console", (m) => { if (m.type() === "error") result.errors.push("console: " + m.text().slice(0, 300)); });
  page.on("pageerror", (e) => result.errors.push("page: " + String(e.message || e).slice(0, 300)));
  const start = Date.now();
  try {
    const res = await page.goto(app.url, { waitUntil: "load", timeout: TIMEOUT });
    result.status = res ? res.status() : null;
    result.ms = Date.now() - start;
    result.up = !!res && res.status() < 400;
    // Save the served source so the spec agent can read it later without network access.
    if (res && result.up) {
      try {
        const body = await res.text();
        result.bytes = body.length;
        if (body.length <= MAX_SNAPSHOT) fs.writeFileSync("snapshots/" + app.name + ".html", body);
        else result.errors.push("snapshot skipped: " + Math.round(body.length / 1024) + " KB is over the limit");
      } catch (e) {}
    }
    await page.waitForTimeout(2000);
    if (result.up) {
      const tests = await runTests(page, app.name);
      if (tests) result.tests = tests;
    }
  } catch (e) {
    result.errors.push("load: " + String(e.message || e).split("\n")[0].slice(0, 300));
  }
  if (app.health) {
    try {
      const h = await fetch(app.health, { signal: AbortSignal.timeout(15000) });
      if (!h.ok) { result.up = false; result.errors.push("health: status " + h.status); }
    } catch (e) {
      result.up = false;
      result.errors.push("health: " + String(e.message || e).slice(0, 200));
    }
  }
  await page.close();
  return result;
}

// The project index site is the source of truth. Every vercel.app link on it gets checked.
const INDEX_URL = "https://mohave.wtf";
const WORKERS = 4;

async function discover(browser) {
  const page = await browser.newPage();
  await page.goto(INDEX_URL, { waitUntil: "load", timeout: TIMEOUT });
  await page.waitForTimeout(2000);
  const html = await page.content();
  await page.close();
  const found = html.match(/https:\/\/[a-z0-9-]+\.vercel\.app/gi) || [];
  return [...new Set(found.map((u) => u.toLowerCase()))].map((url) => ({
    name: url.replace("https://", "").replace(".vercel.app", ""),
    url,
  }));
}

(async () => {
  fs.mkdirSync("snapshots", { recursive: true });
  const browser = await chromium.launch();
  let list = [];
  try { list = await discover(browser); } catch (e) { console.log("index load failed: " + e.message); }
  // apps.json adds extra apps or health endpoints. Same url overrides the discovered entry.
  const extra = JSON.parse(fs.readFileSync("apps.json", "utf8")).apps || [];
  for (const x of extra) {
    const i = list.findIndex((a) => a.url === x.url);
    if (i >= 0) list[i] = { ...list[i], ...x }; else list.push(x);
  }
  console.log("checking " + list.length + " apps");
  const apps = new Array(list.length);
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const i = next++;
      apps[i] = await checkApp(browser, list[i]);
      console.log((apps[i].up ? "UP   " : "DOWN ") + list[i].name);
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, worker));
  await browser.close();
  const status = { checkedAt: new Date().toISOString(), apps };
  fs.writeFileSync("status.json", JSON.stringify(status, null, 2) + "\n");
  const hist = history.record(history.load("history.json"), status);
  fs.writeFileSync("history.json", JSON.stringify(hist) + "\n");
  const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
  fs.writeFileSync("fixes.json", JSON.stringify(queue.build(status, hist, readJson("specs/all.json", {}), readJson("rules.json", {})), null, 2) + "\n");
})();
