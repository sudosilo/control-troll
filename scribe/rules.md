Scribe rules

The scribe keeps every sudosilo repo documented. It writes a changelog entry for every update, publishes a GitHub release for it, keeps each repo's README current, keeps the repo description, website link, and topic tags filled in, and keeps the profile page in the sudosilo/sudosilo repo current. Follow these rules exactly.

Writing style for everything the scribe writes

Plain prose only. No bullet points, no numbered lists, no markdown headers, no bold, no em dashes. Short sentences. Describe what changed for a person using the app, not file names or code internals. Never write a person's real name, a business name, an email, a phone number, or an address. The account handle sudosilo is fine. Never invent features. Only describe what the commits, the code, and the Control Troll spec show.

Which repos to process

Read scribe/repos.json for the repo list and scribe/state.json for what is already documented. Skip repos marked private for the profile page, but still give them changelogs and releases. Use the list_repos tool to get each repo's pushed_at time. A repo needs work when it has no entry in state.json, or its pushed_at is newer than state.json's lastSeenPush for it.

When a repo has new commits, only commits made after state.json's lastSha count. Ignore commits whose message starts with "docs: scribe". Those are the scribe's own. If every new commit is a scribe commit, just update lastSeenPush and move on.

CHANGELOG.md

Newest entries at the top. Each entry is one paragraph that starts with the date and the version tag, then a period, then two to five short sentences about what changed. Group all of one day's commits into one entry. Example:

2026-10-12, v2026.10.12. Added a bolt spec section that estimates torque from bolt size, thread, lubrication, and nut material. Results now round to two decimals.

For a backfill, read the full commit history once, group commits by day in Arizona time (UTC minus 7), and write one entry per day that had changes. A first commit entry says the app was created and what it did at the start.

Releases and repo settings

Claude sessions cannot create releases, tags, or change repo settings. GitHub blocks it. Instead, write that work into scribe/publish.json in control-troll, and the scribe-publish workflow carries it out with the account token. Replace publish.json each run with this run's jobs only. Each job looks like this: {"repo": "name", "releases": [{"tag": "v2026.10.12", "target": "full commit sha", "name": "App Name 2026-10-12", "body": "the changelog paragraph without the date and tag"}], "description": "one sentence", "homepage": "https://live-url or empty", "topics": ["game", "vercel"]}.

The tag is v followed by the date as YYYY.MM.DD. If that repo already has a release for that date in scribe/published.json, add -2, -3, and so on. The target is the last commit of that day that is not a scribe commit. During a backfill, include releases only for the 5 most recent days, so old history does not flood the releases page.

README.md

Structure, all plain prose paragraphs: the app's name on the first line by itself. A paragraph saying what the app is and who it is for. A paragraph describing what it does, drawn from the Control Troll spec in specs/APPNAME.json when one exists. A line with the live link as plain text with no protocol prefix, if the repo has one. A line saying the app is checked every morning by Control Troll. A paragraph headed by the words "Latest change" followed by the newest changelog paragraph. A last line pointing to CHANGELOG.md for the full history. If a README already exists and was written by a person, keep their text and add the scribe sections below it, separated by a line reading "Maintained by the scribe".

Repo settings

The description is one sentence under 120 characters. The homepage is the first live URL. Topics are three to six lowercase tags, for example game, music, restaurant-tech, tool, map, simulator, backend, vercel, railway, threejs. Put them in the publish.json job. Also write name, summary, and category into the repo's entry in scribe/repos.json, plus latest, which holds the date and text of the newest changelog entry. Categories: Games, Music and Visualizers, Restaurant Tech, Field and Equipment, Maps and Research, Tools, Pajamastan, Backends and Infrastructure.

Commits

Put all documentation changes for a repo into one commit per run, with the message "docs: scribe update" and the author name control-troll-scribe. Pull before pushing. Documentation commits go straight to main. Never change any file other than README.md and CHANGELOG.md in an app repo.

Profile page

After the repos are done, if any repo changed, run node scribe/profile.js from the control-troll folder and write its output to README.md in the sudosilo/sudosilo repo. Commit it there with the message "docs: scribe update" and push. Do not hand write the profile. Change scribe/profile.js only if its output breaks these style rules.

State

After each repo, write lastSha, lastSeenPush, lastTag, and documentedAt into scribe/state.json under the repo name. Commit state.json, repos.json, and publish.json to control-troll main at the end with the message "scribe state". Pull first.
