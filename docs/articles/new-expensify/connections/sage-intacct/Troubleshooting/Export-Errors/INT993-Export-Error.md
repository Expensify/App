---
title: INT993 Export Error in Sage Intacct Integration
description: Learn what the INT993 export error means and what to do when a connection issue prevents creation of a cctransaction record in Sage Intacct.
keywords: INT993, cctransaction error Sage Intacct, credit card transaction export failure, Sage Intacct connection issue, integration export error, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT993 export error related to connection or session issues when creating cctransaction records. Does not cover category, tax, employee, or project configuration errors.
---

# INT993 Export Error in Sage Intacct Integration

If you see the error:

INT993 Export Error: Could not create 'cctransaction' record in Sage Intacct.

This means there is a connection or session issue between the Workspace and Sage Intacct that is preventing the credit card transaction record from being created.

---

## Why the INT993 Export Error Happens in Sage Intacct

The INT993 error typically indicates a communication issue between the Workspace and Sage Intacct.

This can occur if:

- The integration session was interrupted.
- Authentication credentials have expired.
- Sage Intacct is temporarily unable to process the request.
- The connection requires reauthorization.

Because this error relates to transaction creation and system communication, it cannot be resolved by updating report data or categories.

This is a connection or session issue, not a configuration issue.

---

# How to Fix the INT993 Export Error

Follow the steps below to confirm the connection and retry the export.

---

## Confirm the Sage Intacct Connection in the Workspace

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Confirm the Sage Intacct integration shows as connected.

If the connection appears disconnected or requires reauthorization, reconnect the integration.

---

## Run Sync

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the integration session and confirms connectivity.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the issue was session-related, the export should complete successfully.

---

## Contact Concierge if the Error Persists

If the export continues to fail:

Contact **Concierge** and include:

- The full error message.
- The report name or ID.
- The date and time the export was attempted.

Concierge can review integration logs and help restore the connection if additional action is required.

---

# FAQ

## Can I Fix This by Updating the Report Data?

No. This error is related to transaction creation and system communication, not report configuration.

## Does the INT993 Error Mean the Integration Is Permanently Disconnected?

Not necessarily. It may indicate a temporary session or authentication issue that can be resolved by reconnecting or running **Sync Now**.
