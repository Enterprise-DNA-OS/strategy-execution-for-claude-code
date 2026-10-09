# /weekly-review

Read CLAUDE.md. Run `npm run strategy -- weekly-review --json` against the selected database. Replace sample references, dates and actor with the user's supplied values. Read `entities.json` for allowed fields and references. Dates are YYYY-MM-DD.

Present the result with owners, dates and evidence references. If a reference is ambiguous, list matches and ask which record. Do not invent missing values. For writes, show what changed and use the user's named actor. For imports, inspect the export headers, create an explicit map and run a dry run before importing. Read docs/replace-cascade.md. For drafts, return the generated file and keep it unsent.

Combine scorecard, attention, dependency-review and decision-review. Separate stale evidence from measured progress. Name the next decision and its accountable owner. Do not combine currencies.
