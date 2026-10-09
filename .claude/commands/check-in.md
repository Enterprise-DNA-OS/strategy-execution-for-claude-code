# /check-in

Read CLAUDE.md. Run `npm run strategy -- check-in --code=OBS-NEW --measure-id=M-RET --observed-on=2026-10-09 --value=90 --evidence="your evidence reference" --actor="Your name" --json` against the selected database. Replace sample references, dates and actor with the user's supplied values. Read `entities.json` for allowed fields and references. Dates are YYYY-MM-DD.

Present the result with owners, dates and evidence references. If a reference is ambiguous, list matches and ask which record. Do not invent missing values. For writes, show what changed and use the user's named actor. For imports, inspect the export headers, create an explicit map and run a dry run before importing. Read docs/replace-cascade.md. For drafts, return the generated file and keep it unsent.

Use only results from the CLI. A clean check is not a guarantee of legal compliance.
