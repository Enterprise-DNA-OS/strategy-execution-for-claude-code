# Strategy Execution for Claude Code

Your objectives, measures, initiatives, dependencies and decision follow-ups in a database you own. Built for the weekly review an owner actually runs.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Clone it and run the demo. | Your fields, rules, Cascade exports and board pack. | Installed and operated through Omni by Enterprise DNA. A setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=cascade) · [Instead of Cascade](https://enterprisedna.co/omni/instead-of/cascade)

## What this replaces

The manual weekly strategy review: collect evidence, calculate progress, chase stale updates, check initiative spending, resolve dependencies, prepare decisions and assemble the board pack. The database runs through Claude Code, Codex, OpenCode or Cursor. The free base has no application front end.

Cascade quotes retail plans privately. Its public 2026 partner calculator shows a US$30,000 annual platform fee for the 1-500 employee tier. That is wholesale pricing, not a retail offer or an observed customer invoice. [Vendor calculator](https://plan.cascade.app/) and [retail pricing](https://www.cascade.app/pricing), checked 9 October 2026. Compare the actual quote and services your business needs.

## Quick start

Node 20 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/strategy-execution-for-claude-code.git
cd strategy-execution-for-claude-code
npm install
npm run demo
npm run strategy -- weekly-review
npm run view
npm run docs
```

PGlite stores local data in .data/db, with no separate database service. Set DATABASE_URL for PostgreSQL and run npm run migrate. Keep credentials out of version control. Never seed a real database. DATA_DIR overrides local storage. Shared operation needs a configured database role and appropriate access controls; RLS is enabled without public policies.

The fictional Kauri Services demo includes a stale retention measure, a decreasing delivery-time target, a missing referral measure, overdue work, a blocked dependency, an unaligned initiative, an overdue decision and a personal-information review. Seed rows use dates relative to today and repeat safely.

## The weekly rituals

Monday: /weekly-review combines the scorecard, attention list, dependencies and decisions. Before the meeting: /check-in records a dated measurement with its evidence and author. At the meeting: /decision-review, /action-review and /budget-review. After the meeting: /close-action requires completion evidence. Before the board meeting: /draft-board-pack and /docs.

## Ten questions this database answers today

These are verified questions about this build. They are not claims that Cascade cannot answer them.

1. Which results look current but rely on old evidence? /stale-updates
2. Which measures are improving toward a lower target? /scorecard
3. Which initiatives spend money without an objective? /alignment-review
4. Which overdue prerequisite blocks another initiative? /dependency-review
5. Who owns the largest overdue initiative queue? /owner-load
6. Where does recorded spending exceed the approved budget? /initiative-review
7. Which approved decisions still have overdue actions? /action-review
8. Which personal-information records need a retention-purpose review? /compliance
9. Which evidence supports each measurement in the history? /measure-history
10. Who changed an initiative and what were its previous values? /activity

## Commands

26 CLI commands with --json, plus 30 slash command recipes including documents, views and customisation.

- /attention
- /scorecard
- /stale-updates
- /initiative-review
- /dependency-review
- /decision-review
- /action-review
- /alignment-review
- /owner-load
- /budget-review
- /measure-history
- /activity
- /help
- /list
- /show
- /compliance
- /weekly-review
- /add
- /update
- /log
- /check-in
- /close-action
- /import
- /export
- /draft-board-pack
- /draft-decision

- /docs, /view, /customise, /new-view

```bash
npm run strategy -- show --kind=measures --ref=M-RET --json
npm run strategy -- add --kind=initiatives --code=I-NEW --title="Service review" --objective-id=O-RET --owner="Mara Chen" --due-on=2027-03-31 --actor="Mara Chen"
npm run strategy -- log --kind=initiatives --ref=I-NEW --note="Budget review booked" --actor="Mara Chen"
```

Read entities.json for every allowed field. Partial UUIDs and case-insensitive names work. Ambiguous names list matches and exit with failure. Updates retain their before values and actor. Administrators can still change the database directly, so this is not a tamper-proof audit store.

Progress is (actual minus baseline) divided by (target minus baseline), for increasing and decreasing targets. Expected progress is a linear elapsed-time reference, not a forecast. A stale or absent observation overrides a progress health label. Spending totals group by currency and never convert or combine currencies. Cancelled work does not count toward the active budget review. Dependencies cannot point to themselves or form cycles.

## Bring your history

Cascade exports individual report widgets as CSV. Select every column you need before exporting. Headers depend on the report, so create an explicit map to the fields in entities.json. The sample is synthetic, not a captured vendor export.

```bash
npm run strategy -- import cascade --kind=objectives --file=fixtures/objectives.csv --map=fixtures/objective-map.json --actor="Your name" --dry-run
npm run strategy -- import cascade --kind=objectives --file=fixtures/objectives.csv --map=fixtures/objective-map.json --actor="Your name"
```

The same import command accepts all eight entity types. One file is one transaction. Repeated identical rows are unchanged; conflicting records stop for review. Original row values and mapping are retained, including unmapped columns. Export one entity as CSV or export the complete record set and activity as JSON. [Mapping, import order and reconciliation](docs/replace-cascade.md).

## Paperwork and views

Change brand.json once. npm run docs renders board strategy packs, decision records and initiative briefs as branded HTML in docs-out. npm run view renders the week, portfolio and decision snapshots in views. /draft-board-pack and /draft-decision write only to drafts. Nothing sends. These are read-only printable records, not an application front end.

## Record checks

Nine checks cover staleness, ownership, due dates, objective alignment, budget variance, prerequisites and retention-purpose review. [The compliance guide](docs/compliance.md) distinguishes business rules from the NZ Privacy Act principle. Checks inspect records only; they do not certify legal compliance or prove that a document is accurate.

## Your first hour: ten things to ask for

1. Put our business name and colours on the board pack.
2. Import a test report without saving it.
3. Add our strategic themes to objectives.
4. Change our weekly measurement cadence to fortnightly.
5. Add a quarterly target to each measure.
6. Show unaligned spending before the board meeting.
7. Add a reviewer to completed actions.
8. Bring our decision evidence references across.
9. Add a view grouped by office and owner.
10. Prepare a decision brief from overdue follow-through.

/customise adds and applies a migration, updates the CLI and tests the requested behavior. /new-view adds a read-only report using your records.

## Verification

npm test creates a temporary database, migrates, seeds twice, exercises all 26 CLI commands and raises and clears all nine finding rules. It tests increasing and decreasing targets, currency separation, cycles, evidence gates, date validation, CSV mapping, repeated imports, conflicts, rollback, provenance, exports, drafts, documents, views and CLI exit codes. TEST_DATABASE_URL selects an empty disposable PostgreSQL database. CI defines Linux, Windows and PostgreSQL checks; inspect their results before claiming those environments passed.

## Installed for you

Enterprise DNA maps and checks your exports, builds your rules and reporting, adds a web front end or a different stack when agreed, and runs the system through Omni by Enterprise DNA. A setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=cascade).

MIT. Copyright 2026 Enterprise DNA. Not affiliated with Cascade or Anthropic. Hosting and agent use have their own costs.
