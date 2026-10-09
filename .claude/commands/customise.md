# /customise

Read CLAUDE.md and the request. Inspect the schema, entities.json and existing data. Add a new numbered migration, never edit an applied migration. Add or rename the requested field, rule or stage with a data-preserving migration. Update the entity allowlist, commands, reports and import guide. Apply it with npm run migrate, test the requested behavior and run npm test. Present the before and after using real records. Back up a real database before any migration that changes existing data. Confirm destructive changes. Do not build an application front end here.
