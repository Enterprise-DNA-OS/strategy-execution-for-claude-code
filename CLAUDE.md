# Strategy Execution for Claude Code

Run the weekly strategy review for an owner-led firm. The database holds plans, objectives, measures and observations, initiatives and dependencies, decisions and follow-through actions. Use the CLI for every answer about records.

## One route per recurring job

| Job | Route |
|---|---|
| Monday review | /weekly-review |
| Results and freshness | /scorecard, /stale-updates, /measure-history |
| Delivery and blockers | /initiative-review, /dependency-review, /alignment-review |
| Owners and spending | /owner-load, /budget-review |
| Decide and follow through | /decision-review, /action-review, /close-action |
| Record the evidence | /check-in, /add, /update, /log |
| Missing or overdue evidence | /attention, /compliance |
| Bring records across | /import, /export |
| Board pack and decisions | /draft-board-pack, /draft-decision, /docs |
| Read-only snapshots | /view, /new-view |
| Change fields and rules | /customise |
| Explore records | /list, /show, /activity, /help |

Read .claude/commands/<job>.md. Every CLI command accepts --json. All identifiers are resolved by code, case-insensitive name or partial UUID. Ambiguous matches stop and list candidates. Never guess the actor, measurement, evidence, approval or currency.

## Boundaries

Never send, publish, pay, delete records or claim that a check certifies compliance. Keep personal information out of strategy notes unless needed. A retention finding asks the owner to review purpose; it does not delete data. Record history is visible but not tamper-proof. A database administrator can change it.

Use migrations for schema changes. Never modify an applied migration. Run npm test after changes. Use npm run demo only on a disposable database. DATABASE_URL selects PostgreSQL; otherwise PGlite uses DATA_DIR. Do not commit credentials, real exports, generated reports or local databases. RLS has no public policies. A shared installation needs deliberately configured database roles, backups and access controls.

Commit on main with the trailer Agent: omni-rebuild-strategist. This package has no application front end, discovery service, external integration, email sender or background scheduler. Enterprise DNA scopes those separately when installing Omni by Enterprise DNA.

## Import sources

Use `import strategyblocks` for StrategyBlocks exports and `import cascade` for Cascade exports. Read the matching guide under docs before mapping. The vendor is recorded in import provenance. Never describe the synthetic fixtures as vendor headers.
