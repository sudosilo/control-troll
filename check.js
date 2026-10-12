// Layer one daily check. Loads every app in apps.json in a headless browser
// and writes the results to status.json. Costs zero tokens.
const fs = require("fs");
const { chromium } = require("playwright");

const TIMEOUT = 30000;

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
    await page.waitForTimeout(2000);
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

(async () => {
  const list = JSON.parse(fs.readFileSync("apps.json", "utf8")).apps || [];
  const browser = await chromium.launch();
  const apps = [];
  for (const app of list) {
    apps.push(await checkApp(browser, app));
    console.log((apps[apps.length - 1].up ? "UP   " : "DOWN ") + app.name);
  }
  await browser.close();
  fs.writeFileSync("status.json", JSON.stringify({ checkedAt: new Date().toISOString(), apps }, null, 2) + "\n");
})();
