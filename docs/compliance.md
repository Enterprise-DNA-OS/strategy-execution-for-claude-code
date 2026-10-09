# Record checks and their sources

Checked 9 October 2026. This package checks the state of recorded evidence. It does not supply legal advice, certify a strategy process or implement a complete privacy programme.

| Rule | Check | Basis |
|---|---|---|
| MEASURE-STALE | No observation, or newest observation older than the configured cadence | House policy, cadence_days defaults to 7 |
| INITIATIVE-DUE | Unfinished initiative is past its due date | House policy |
| INITIATIVE-ALIGNMENT | Active initiative has no objective | House policy |
| INITIATIVE-BUDGET | Recorded spending exceeds its budget | House policy, same currency only |
| DECISION-DUE | Proposed decision is past its due date | House policy |
| ACTION-DUE | Open action is past its due date | House policy |
| DEPENDENCY-BLOCKED | Unfinished initiative has a prerequisite that is not complete | House policy |
| OWNER-MISSING | Objective has a blank accountable owner | House policy |
| PRIVACY-REVIEW | Decision marked as containing personal information has no retention review date, or that date has passed | NZ Privacy Act 2020 IPP9, supported by a local review policy |

[The NZ Privacy Commissioner's IPP9 guidance](https://www.privacy.org.nz/privacy-principles/9/) explains that personal information must not outlive its lawful purpose. The law does not prescribe this package's date field or a universal period. The business supplies the review date and assesses legal retention duties. The finding asks for a review; it never deletes anything. Imports, backups, draft files and activity history can also contain personal information and require their own retention process. No automatic scan proves that a record lacks personal information.

Completion gates require initiative evidence, decision rationale and evidence, and action completion date and evidence. Measurement records require evidence and an author. These are house controls. Evidence presence does not establish evidence validity. All changes made through the CLI record their actor; privileged database access can change history.
