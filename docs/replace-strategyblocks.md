# Replace the weekly StrategyBlocks review

## Get the records out

StrategyBlocks documents an Export option on a selected block for CSV, and a Report option for the block and its descendants. Its Reports area also provides a metrics CSV download and a downloadable company database. Export access depends on permissions. Sources checked 9 October 2026: [block menu](https://www.strategyblocks.com/strategyblocks-full-manual/block-menu-navigation/) and [vendor guide, Reports section](https://www.strategyblocks.com/wp-content/uploads/2023/03/SB6-Downloadable-Guide-V1.pdf).

Keep untouched originals and export all required blocks and reporting periods. The importer accepts CSV records with an explicit map. It does not read the downloadable company database, images or HTML reports. The vendor does not publish a stable CSV header contract in these guides. The fixture is a synthetic staging example, not a vendor export.

## Map once, then import in one command

Read entities.json. Map each local field to the exact header in your export. Use stable source identifiers for code and parent references. If an identifier or a required field is absent, add it to a working copy with the operator's evidence and keep the mapping. Never invent historical measurements from a current value. Convert dates to YYYY-MM-DD, numbers to unformatted decimal values and statuses to the accepted local values.

A top-level strategy becomes a plan. Outcome blocks map to objectives, delivery blocks to initiatives, metrics to measures, dated metric actuals to observations, prerequisite links to dependencies, and agreed decisions and follow-ups to decisions and actions. The base has plan, objective and initiative relationships rather than an arbitrary-depth block tree. Preserve original parent columns in import provenance and agree the mapping before loading a deep hierarchy. Missing relationships and measure baselines need operator input.

Import order: plans, objectives, measures, observations, initiatives, dependencies, decisions, actions. Each file is one command after mapping:

```bash
npm run strategy -- import strategyblocks --kind=objectives --file=blocks.csv --map=block-map.json --actor="Your name" --dry-run
npm run strategy -- import strategyblocks --kind=objectives --file=blocks.csv --map=block-map.json --actor="Your name"
```

The included fixtures/strategyblocks-block-map.json shows the mapping format. Its accompanying CSV refers to P-2026 in the fictional demo. Replace it with your own records for real operation. Units, baseline, target, reporting period, cadence, evidence and owner must be explicit for a metric. Dates with no actual value are not observations.

## Checks before committing the file

Dry runs roll back every write. One invalid row rolls back the whole file. Identical repeats add nothing; conflicting existing records fail for review. Duplicate identifiers in the file, unknown references, invalid dates and unsupported fields are rejected. Original rows and mappings are retained with the StrategyBlocks source label, including unmapped columns. Quoted commas, line breaks, doubled quotes, BOM and CRLF are supported.

## What stays separate

Attachments, visual dashboard designs, security groups, watchers, comments, the complete source audit trail, custom health formulas and live integrations require a separate migration decision. Evidence links remain references, not copied files. The base measures linear progress from baseline to target and compares it with elapsed time; it does not reproduce StrategyBlocks' scoring model or automatically reschedule work from dependencies. Record those differences in the reconciliation, then have Enterprise DNA build the agreed rules into your version.

## Reconcile and rehearse

Compare counts and stable identifiers for every entity. Trace the plan and objective links. Compare each metric's unit, target, baseline, actual value and observation date with the original export. Check budget totals separately by currency and verify prerequisite direction. Review unmapped fields, then generate the weekly review, board pack and decision records alongside the source for one reporting cycle. The owner confirms the coverage before switching. A mapped, bounded record set can be moved in a day; an unexamined account has no guaranteed migration time.

Export an entity as CSV with stable reference codes using npm run strategy -- export --kind=objectives. Without --kind, export writes the eight entities and activity to exports/strategy-backup.json. That JSON is an archival export, not an automated database restore. Use database backups for recovery.
