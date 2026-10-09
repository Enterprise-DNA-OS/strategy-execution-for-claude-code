# Replace the weekly Cascade review

## Export from Cascade

Use the report editor. For each relevant chart or report widget, open the three-dot menu and select Export to CSV. Include the needed columns before exporting. Cascade documents widget-level CSV exports in [Sharing, permissions and exporting](https://support.cascade.app/sharing-permissions-and-exporting-a-report) and describes configurable measure columns in [Measures reporting](https://support.cascade.app/measures-table-for-reporting-on-measures). Checked 9 October 2026. These pages do not promise a fixed header schema or one complete account export.

## Map and import

Keep an untouched copy of each source export. Inspect headers, date formats, identifiers and units. Write an explicit JSON map from local field to exported header. entities.json is the field contract. Every entity needs a stable code. Use an exported stable identifier where available; otherwise assign and preserve one in a staging copy. Map parent references to those codes, not guessed matches. Dates must be YYYY-MM-DD and numbers unformatted, with no percent sign or thousands separator. Measures require a non-equal baseline and target. Split observations into dated rows; do not invent history from a current value.

Import order: plans, objectives, measures, observations, initiatives, dependencies, decisions, actions. Plans and relationships missing from your selected widgets must be staged explicitly and reconciled. Required mapping fields are listed in entities.json. For example:

```bash
npm run strategy -- import cascade --kind=objectives --file=objectives.csv --map=objective-map.json --actor="Your name" --dry-run
npm run strategy -- import cascade --kind=objectives --file=objectives.csv --map=objective-map.json --actor="Your name"
```

The included fixture and map are synthetic examples, not a verified Cascade header layout. With your map prepared, each export imports in one command. Headers must match exactly. Rows have to match column counts. Quoted commas, line breaks, doubled quotes, BOM and CRLF work. Duplicate headers, invalid dates, unknown references and conflicting codes stop the file. Imports retain original row values, source filename and mapping in activity, including unmapped columns. A dry run rolls back every write. Identical repeats do not duplicate records. Conflicting existing records require a deliberate update before re-import.

## What maps

- Plans: code, name, owner, start and due dates.
- Objectives: code, title, plan, owner, due date and status.
- Measures: code, name, objective, owner, unit, baseline, target, start and due dates, update cadence.
- Observations: code, measure, date, numeric value, evidence reference and author.
- Initiatives: code, title, objective, owner, due date, status, budget, spend, currency and evidence reference.
- Dependencies: code, initiative and prerequisite.
- Decisions: code, title, objective, owner, due date, status, rationale, evidence and personal-information review fields.
- Actions: code, title, decision, owner, due date, status, completion date and evidence.

## What needs separate work

Attachments and permissions do not transfer through this importer. Nested objective hierarchies, calculated or maintained measures, custom scoring models, automatic data feeds, survey workflows, comments and full source audit history need mapping or a separate agreed build. The base uses linear target progress and its own health labels, so reconcile the formula as well as the numbers. Arbitrary source status names need an explicit staging conversion to the documented values. Files are not fetched from evidence links.

## Reconcile before switching

Compare counts and identifiers for every imported entity. Compare measure units, baselines, targets, dates and actual values. Compare budgets by currency and trace dependencies to their source. Review unmapped columns in import provenance. Run attention, scorecard and the board pack beside Cascade for one review cycle. Keep Cascade until the owner confirms coverage and permissions. One-day switching is a goal for a mapped, bounded record set, not a guarantee for an unexamined account.

`npm run strategy -- export --kind=objectives` writes CSV with stable reference codes. Without --kind it writes all entities and activity to exports/strategy-backup.json. This JSON is an archival export, not an automatic database restore; use database backups for recovery.
