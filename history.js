// Daily history. Every run folds its results into history.json, one entry per app per day.
// A day keeps the worst state seen that day, so a morning outage stays visible even if
// a later run that day comes back healthy.
//
// States: "o" healthy, "e" console errors only, "f" a feature test failed, "d" down.
const fs = require("fs");

const RANK = { o: 0, e: 1, f: 2, d: 3 };

// Arizona does not change clocks, so its day is always UTC minus 7 hours.
function dayKey(iso) {
  return new Date(new Date(iso).getTime() - 7 * 3600 * 1000).toISOString().slice(0, 10);
}

function stateOf(a) {
  if (!a.up) return "d";
  if ((a.tests || []).some((t) => !t.pass)) return "f";
  if ((a.errors || []).length) return "e";
  return "o";
}

function record(history, status) {
  history.days = history.days || {};
  const key = dayKey(status.checkedAt);
  const day = (history.days[key] = history.days[key] || { runs: 0, apps: {} });
  day.runs += 1;
  for (const a of status.apps) {
    if (!a) continue;
    const tests = a.tests || [];
    const now = {
      s: stateOf(a),
      p: tests.filter((t) => t.pass).length,
      t: tests.length,
    };
    const fails = tests.filter((t) => !t.pass).map((t) => t.name);
    if (fails.length) now.x = fails.slice(0, 3);
    if (now.s === "d") now.x = (a.errors || []).slice(0, 1).map((e) => e.slice(0, 120));
    const was = day.apps[a.name];
    if (!was || RANK[now.s] >= RANK[was.s]) day.apps[a.name] = now;
  }
  history.updatedAt = status.checkedAt;
  return history;
}

function load(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return { days: {} }; }
}

module.exports = { record, load, dayKey, stateOf };
