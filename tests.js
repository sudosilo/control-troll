// Layer two feature tests. Each file in tests/ holds scripted steps for one app.
// A test passes when every step in it succeeds. Costs zero tokens to run.
//
// Step types:
//   {"click": "text"}            click the first visible element containing this text
//   {"clickSel": "css"}          click the first element matching this selector
//   {"fill": "css", "value": ""} type a value into an input
//   {"press": "Key"}             press a keyboard key
//   {"wait": 500}                wait this many milliseconds
//   {"see": "text"}              this text must be visible
//   {"seeSel": "css"}            an element matching this selector must be visible
//   {"gone": "text"}             this text must not be visible
//   {"textOf": "css", "has": ""} the element's text must contain this
//   {"painted": "css"}           the canvas must have something drawn on it
//   {"stored": true}             the app must have saved something in browser storage
//   {"download": "css"}          clicking this must start a file download
//   {"changes": "css", "after": [steps]}  the text must change after the inner steps run
//   {"renders": true}            the page shows text or a drawn canvas
//   {"reload": true}             reload the page
const fs = require("fs");

const STEP_TIMEOUT = 6000;

async function runStep(page, s) {
  if (s.click !== undefined) {
    await page.getByText(s.click, { exact: false }).locator("visible=true").first().click({ timeout: STEP_TIMEOUT });
  } else if (s.clickSel) {
    await page.locator(s.clickSel).first().click({ timeout: STEP_TIMEOUT });
  } else if (s.fill) {
    await page.locator(s.fill).first().fill(String(s.value), { timeout: STEP_TIMEOUT });
  } else if (s.press) {
    await page.keyboard.press(s.press);
  } else if (s.wait) {
    await page.waitForTimeout(s.wait);
  } else if (s.see !== undefined) {
    await page.getByText(s.see, { exact: false }).locator("visible=true").first().waitFor({ state: "visible", timeout: STEP_TIMEOUT });
  } else if (s.seeSel) {
    await page.locator(s.seeSel).locator("visible=true").first().waitFor({ state: "visible", timeout: STEP_TIMEOUT });
  } else if (s.gone !== undefined) {
    await page.waitForTimeout(300);
    const n = await page.getByText(s.gone, { exact: false }).locator("visible=true").count();
    if (n) throw new Error("still visible: " + s.gone);
  } else if (s.textOf) {
    const el = page.locator(s.textOf).first();
    await el.waitFor({ state: "attached", timeout: STEP_TIMEOUT });
    // Inputs and text areas hold their text in value, everything else in innerText.
    const t = await el.evaluate((n) => ("value" in n && typeof n.value === "string" && n.tagName !== "BUTTON" && n.tagName !== "LI") ? n.value : (n.innerText !== undefined ? n.innerText : n.textContent));
    if (!t.includes(s.has)) throw new Error(s.textOf + " text is '" + t.slice(0, 80) + "', expected it to contain '" + s.has + "'");
  } else if (s.painted) {
    const shot = await page.locator(s.painted).first().screenshot({ timeout: STEP_TIMEOUT });
    // A blank or single color canvas compresses to a tiny PNG.
    if (shot.length < 4000) throw new Error(s.painted + " looks blank");
  } else if (s.stored) {
    const n = await page.evaluate(() => { try { return localStorage.length; } catch (e) { return 0; } });
    const idb = await page.evaluate(async () => { try { return (await indexedDB.databases()).length; } catch (e) { return 0; } });
    if (!n && !idb) throw new Error("nothing saved in browser storage");
  } else if (s.download) {
    const [dl] = await Promise.all([
      page.waitForEvent("download", { timeout: STEP_TIMEOUT }),
      page.locator(s.download).first().click({ timeout: STEP_TIMEOUT }),
    ]);
    if (!dl.suggestedFilename()) throw new Error("download had no file");
  } else if (s.changes) {
    // Run the inner steps, then the element's text must differ from before.
    const read = () => page.locator(s.changes).first().evaluate((n) => n.innerText !== undefined ? n.innerText : n.textContent);
    const before = await read();
    for (const inner of s.after || []) await runStep(page, inner);
    await page.waitForTimeout(400);
    if ((await read()) === before) throw new Error(s.changes + " did not change");
  } else if (s.renders) {
    // Pass when the page shows real text or has a canvas with something drawn on it.
    const text = await page.evaluate(() => (document.body && document.body.innerText || "").trim().length);
    if (text < 20) {
      const canvases = await page.locator("canvas").count();
      let drawn = false;
      for (let i = 0; i < Math.min(canvases, 3) && !drawn; i++) {
        try { drawn = (await page.locator("canvas").nth(i).screenshot({ timeout: STEP_TIMEOUT })).length >= 4000; } catch (e) {}
      }
      if (!drawn) throw new Error("page shows almost nothing");
    }
  } else if (s.reload) {
    await page.reload({ waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1500);
  } else {
    throw new Error("unknown step " + JSON.stringify(s));
  }
}

async function runTests(page, name) {
  const file = "tests/" + name + ".json";
  // Every app gets a render test. Apps with a tests file get their feature tests too.
  const spec = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { tests: [] };
  spec.tests = [{ feature: 0, name: "renders", steps: [{ renders: true }] }].concat(spec.tests);
  const out = [];
  for (const t of spec.tests) {
    const r = { feature: t.feature, name: t.name, pass: true };
    try {
      for (const s of t.steps) await runStep(page, s);
    } catch (e) {
      r.pass = false;
      r.error = String(e.message || e).split("\n")[0].slice(0, 200);
    }
    out.push(r);
  }
  return out;
}

module.exports = { runTests, runStep };
