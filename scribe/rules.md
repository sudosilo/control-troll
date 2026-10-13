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

Releases

Every changelog entry gets a GitHub release. The tag is v followed by the date as YYYY.MM.DD. If a tag for that date exists, add -2, -3, and so on. Tag the last commit of that day. The release title is the app name and the date. The release notes are the same paragraph as the changelog entry. During a backfill, create releases only for the 5 most recent days, so old history does not flood the releases page.

README.md

Structure, all plain prose paragraphs: the app's name on the first line by itself. A paragraph saying what the app is and who it is for. A paragraph describing what it does, drawn from the Control Troll spec in specs/APPNAME.json when one exists. A line with the live link as plain text with no protocol prefix, if the repo has one. A line saying the app is checked every morning by Control Troll. A paragraph headed by the words "Latest change" followed by the newest changelog paragraph. A last line pointing to CHANGELOG.md for the full history. If a README already exists and was written by a person, keep their text and add the scribe sections below it, separated by a line reading "Maintained by the scribe".

Repo settings

Set the description to one sentence under 120 characters. Set the website to the first live URL. Set three to six lowercase topic tags, for example game, music, restaurant-tech, tool, map, simulator, backend, vercel, railway, threejs. Write the chosen summary and category into scribe/repos.json so the profile page can use them. Categories: Games, Music and Visualizers, Restaurant Tech, Field and Equipment, Maps and Research, Tools, Pajamastan, Backends and Infrastructure.

Commits

Put all documentation changes for a repo into one commit per run, with the message "docs: scribe update" and the author name control-troll-scribe. Pull before pushing. Documentation commits go straight to main. Never change any file other than README.md and CHANGELOG.md in an app repo.

Profile page

After the repos are done, rebuild README.md in the sudosilo/sudosilo repo if any repo changed. Structure, plain prose: one opening paragraph saying this account holds a large set of small web apps, games, tools, and backends, all deployed and checked every morning by an automated test system called Control Troll. Then one paragraph per category, starting with the category name and a period, then each public app as "name, one line summary, live link" in sentences. Then a paragraph titled "Recent changes" listing the ten newest changelog entries across all repos as short sentences with the repo name and date. Skip private repos and repos with no summary yet.

State

After each repo, write lastSha, lastSeenPush, lastTag, and documentedAt into scribe/state.json under the repo name. Commit state.json and repos.json to control-troll main at the end with the message "scribe state". Pull first.
