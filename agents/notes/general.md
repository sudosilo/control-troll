2026-10-18 setup. A docs push to a repo whose app lives in a subfolder makes Vercel build the empty root and takes the live site down. Check for a root vercel.json before pushing anywhere.
2026-10-18 setup. Some live apps were deployed from the developer's phone with the Vercel CLI, not from GitHub, so a repo can be stale or nearly empty while the live app is fine. Compare the live snapshot in snapshots/ with the repo before changing code.
2026-10-18 setup. Vercel names often add a random suffix to the repo name, for example tower-builder-five belongs to tower-builder. scribe/repos.json holds the confirmed mapping.
2026-10-18 setup. The access-terminal apps are separate on purpose. Never merge them or call them clones.
2026-10-18 heckler. Thin repo descriptions made the fleet verdict call working apps dead weight. Check scribe/repos.json summaries and the live link before judging an app abandoned.
2026-10-18 setup. Backends on Railway often 404 at the root because they have no home page. That is not an outage. The fix is a GET /health route, then a health URL in apps.json.
2026-10-19 heckler. The 2026-10-18-orange-testbed repo gets many tiny bot-agent PRs (contrib/NAME/DATE.json, one-line minified JSON) merged via web-flow under the owner's login, so author filters do not catch them. Several are empty or near empty diffs; heckle the process, not the data.
