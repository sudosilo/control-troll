// Fix queue. After each check, every app that is down or failing a test becomes a job
// in fixes.json. Any agent can read this file, work a job, and report back in fix-log.json.
// The queue is rebuilt from scratch each run, so a fixed app drops off on its own.
const fs = require("fs");

const BUDGET = { minutes: 15, note: "Stop when the budget runs out, log what was found, move to the next job." };

function firstBadDay(history, name) {
  const days = Object.keys(history.days || {}).sort().reverse();
  let first = null;
  for (const d of days) {
    const a = history.days[d].apps[name];
    if (a && (a.s === "d" || a.s === "f")) first = d; else if (a) break;
  }
  return first;
}

function build(status, history, specs, rules) {
  const keep = Object.values((rules && rules.keepSeparate) || {});
  const jobs = [];
  for (const a of status.apps) {
    if (!a) continue;
    const fails = (a.tests || []).filter((t) => !t.pass);
    if (a.up && !fails.length) continue;
    const spec = specs[a.name] || {};
    jobs.push({
      app: a.name,
      url: a.url,
      kind: a.up ? "test-failing" : "down",
      since: firstBadDay(history, a.name),
      status: a.status,
      failing: fails.map((t) => ({ test: t.name, error: t.error, testFile: "tests/" + a.name + ".json" })),
      errors: (a.errors || []).slice(0, 5),
      features: spec.features || [],
      knownProblem: spec.problem || null,
      snapshot: "snapshots/" + a.name + ".html",
    });
  }
  // Down first, then longest broken first.
  jobs.sort((x, y) => (x.kind === y.kind ? String(x.since).localeCompare(String(y.since)) : x.kind === "down" ? -1 : 1));
  return {
    builtAt: status.checkedAt,
    budget: BUDGET,
    rules: [
      "Work on a branch in the app's repo and open a pull request. Never push to main.",
      "If the app works and the test is wrong, fix the test in control-troll instead, on a branch with a pull request.",
      "Add one line to fix-log.json in control-troll for every job touched, fixed or not.",
    ],
    jobs,
  };
}

module.exports = { build };
