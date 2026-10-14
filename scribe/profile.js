// Builds the profile README for the sudosilo/sudosilo repo from scribe/repos.json.
// Usage: node scribe/profile.js > README.md
const repos = require("./repos.json").repos;
const ORDER = ["Games", "Music and Visualizers", "Restaurant Tech", "Field and Equipment", "Maps and Research", "Tools", "Pajamastan", "Backends and Infrastructure"];
const strip = (u) => u.replace(/^https?:\/\//, "");
const list = Object.entries(repos).filter(([, r]) => r.summary && !r.private);
const out = [];
out.push("sudosilo");
out.push("This account holds a large set of small web apps, games, tools, and backends. Every live app is loaded and clicked through every morning by Control Troll, an automated test system, and every update gets a changelog entry and a release. " + list.length + " repos are documented so far.");
for (const cat of ORDER) {
  const items = list.filter(([, r]) => r.category === cat).sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]));
  if (!items.length) continue;
  const lines = items.map(([name, r]) => {
    const link = r.urls && r.urls[0] ? " Live at " + strip(r.urls[0]) + "." : "";
    return (r.name || name) + ". " + r.summary.replace(/\.$/, "") + "." + link;
  });
  out.push(cat);
  out.push(lines.join("  \n"));
}
const recent = list.filter(([, r]) => r.latest).sort((a, b) => b[1].latest.date.localeCompare(a[1].latest.date)).slice(0, 10);
if (recent.length) {
  const gist = (t) => { const s = t.split(". ").filter((x) => !/^First release\.?$/.test(x)); return (s[0] || t).replace(/\.?$/, "."); };
  out.push("Recent changes");
  out.push(recent.map(([name, r]) => r.latest.date + ". " + (r.name || name) + ". " + gist(r.latest.text)).join("  \n"));
}
out.push("Updated automatically by the scribe.");
process.stdout.write(out.join("\n\n") + "\n");
