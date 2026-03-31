---
title: INT176 Export Error in Sage Intacct Integration
description: Learn what the INT176 export error means and what to do when a session or connection issue prevents exporting to Sage Intacct.
keywords: INT176, Sage Intacct session initialization error, Sage Intacct connection issue export, Sage Intacct integration session failure, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT176 export error caused by session or connection failures. Does not cover report data validation or configuration errors.
---

# INT176 Export Error in Sage Intacct Integration

If you see the error:

INT176 Export Error: Session initialization error. Please reach out to Concierge for additional support.

This means there is a session or connection issue between the Workspace and Sage Intacct that is preventing the export from starting.

The export cannot proceed because the integration session failed to initialize.

---

## Why the INT176 Export Error Happens in Sage Intacct

The INT176 error typically occurs when:

- The Sage Intacct integration session cannot be initialized.
- Authentication credentials are temporarily invalid.
- The connection between systems is interrupted.
- There is a temporary backend communication issue.

Because this error relates to the integration session itself, it cannot be resolved by editing the report or updating coding fields.

This is a connection-level issue, not a data validation or configuration issue.

---

# How to Fix the INT176 Export Error

This error requires additional investigation.

---

## Retry the Export Once

1. Open the report.
2. Retry the export.
3. If the error persists, continue to the next step.

---

## Contact Concierge for Support

Please reach out to **Concierge** and include:

- The full error message.
- The report name or ID.
- The date and time the export was attempted.

Concierge will review the integration logs and determine whether:

- The connection needs to be refreshed.
- Credentials need to be reauthenticated.
- A backend issue needs to be resolved.

---

# FAQ

## Can I Fix This by Running Sync Now?

No. This error is related to session initialization and typically requires backend review.

## Does This Mean the Integration Is Disconnected?

Not necessarily. It indicates a session issue. Concierge can confirm whether the connection needs to be refreshed or reconfigured.

## Does This Affect All Exports?

It can. If the integration session cannot initialize, additional exports may fail until the issue is resolved.
