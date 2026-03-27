---
title: INT993 Export Error in Sage Intacct Integration
description: Learn what the INT993 export error means and what to do when a connection issue prevents creation of a cctransaction record in Sage Intacct.
keywords: INT993, cctransaction error Sage Intacct, Sage Intacct connection issue, credit card transaction export error, Sage Intacct integration failure, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT993 export error caused by connection or session issues when creating cctransaction records. Does not cover category, tax, or configuration errors.
---

# INT993 Export Error in Sage Intacct Integration

If you see the error:

INT993 Export Error: Could not create 'cctransaction' record in Sage Intacct.

This means there is a connection or session issue between Expensify and Sage Intacct that is preventing the credit card transaction from being created.

---

## Why the INT993 Export Error Happens in Sage Intacct

The INT993 error typically indicates:

- The integration session was interrupted.
- There is a temporary authentication issue between Expensify and Sage Intacct.
- Sage Intacct was unable to process the request to create the `cctransaction` record.
- Sage Intacct validation failed due to a communication issue.

Because this error relates to the integration connection or session, it cannot be resolved by updating report data, categories, or tags.

This is a connection or session issue, not a category, tax, or configuration error.

---

## How to Fix the INT993 Export Error

This error requires additional investigation.

Reach out to **Concierge** for support and include:

- The full error message.
- The report name or report ID.
- The approximate time the export was attempted.

Concierge will review the integration logs and help restore the connection so you can successfully export your report.

---

# FAQ

## Can I Fix This by Running Sync Now?

No. This error is related to record creation and connection status, and typically requires additional investigation.

## Does This Mean My Integration Is Disconnected?

Not necessarily. It indicates a transaction creation issue. Concierge can confirm whether the connection needs to be refreshed or reconfigured.
