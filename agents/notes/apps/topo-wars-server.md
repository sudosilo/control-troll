2026-10-18 fixer. Had no home page, so the root returned 404. Pull request 1 adds /api/health that pings Redis, with a /health rewrite. Once merged, add the health URL to apps.json.
