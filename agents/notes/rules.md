Shared notes rules

The fixer, the scribe, and HeckleTroll share one notebook in agents/notes. Every run starts fresh, so these notes are how the agents get smarter over time and learn from each other.

Reading. At the start of every run, read agents/notes/general.md. Before working on any app or repo, read agents/notes/apps/NAME.md if it exists, where NAME is the repo name. Trust these notes over your own guesses. If a note turns out to be wrong, fix or delete it.

Writing. At the end of every run, add what you learned that would save another agent time or stop a mistake. Good notes are facts about how a repo is built or deployed, which repo serves which live app, traps you hit, tests that lie, things the developer did on purpose, and fixes that worked or failed. Do not write notes that just repeat what you did this run, since your own logs already hold that. Do not write secrets, tokens, real names, emails, phone numbers, or addresses.

Facts about one app go in agents/notes/apps/NAME.md. Facts about the whole account or how the agents should work go in agents/notes/general.md. Each note is one line in this form: date, who wrote it, then the note. Example:
2026-10-18 scribe. The app code lives in the groundcore-deploy subfolder, so the root vercel.json must stay.

Keeping it short. A file over 40 lines gets condensed: merge notes that say the same thing, drop notes that are no longer true, and keep the newest version of each fact. Never delete another agent's note unless you confirmed it is wrong.

Saving. Commit the agents/notes folder with your other control-troll changes, or with the message "agent notes", pulling with rebase before you push.
