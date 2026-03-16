---
title: ONL442 Export Error in QuickBooks Online Integration
description: Learn what the ONL442 export error means in QuickBooks Online and how to remove partial transactions before re-exporting.
keywords: ONL442, QuickBooks Online export error, partial export QuickBooks, delete partial transaction QuickBooks, QuickBooks outage export failure, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL442 export error caused by partial transactions due to QuickBooks Online outages or interruptions. Does not cover other QuickBooks Online error codes.
---

# ONL442 Export Error in QuickBooks Online Integration

If you see the error:

ONL442: Partial export — QuickBooks Online returned an error.

This means QuickBooks Online encountered an issue during export, and only part of the report was successfully created.

Until the partial transactions are removed, re-exporting may fail or create duplicates.

---

## Why the ONL442 Export Error Happens in QuickBooks Online

The ONL442 error typically indicates:

- QuickBooks Online was experiencing an outage or maintenance period.
- The connection was interrupted during export.
- QuickBooks processed part of the report but failed before completion.

When this occurs, some transactions may be created in QuickBooks Online while others are not, resulting in a partial export.

This is generally a QuickBooks Online system issue, not a Workspace configuration issue.

---

## How to Fix the ONL442 Export Error

This issue can be resolved by removing partial transactions and retrying the export.

### Check QuickBooks Online Status

1. Visit the QuickBooks Online status page.
2. Confirm whether there is an outage or maintenance period.
3. Wait until the issue is resolved before retrying the export.

### Delete Partial Transactions in QuickBooks Online

After confirming QuickBooks Online is operating normally:

1. Log in to QuickBooks Online.
2. Locate the transactions created during the failed export.
3. Delete the partial transactions associated with the affected report.
4. Save your changes.

Removing partial transactions prevents duplicates when re-exporting.

### Re-export the Report

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Open the affected report.
5. Retry exporting the report.

Confirm the export completes successfully.

---

# FAQ

## Can I Retry the Export?

Yes. After deleting partial transactions and confirming QuickBooks Online is functioning normally, retry the export.

## Does ONL442 Mean My Report Failed Completely?

Not necessarily. Some transactions may have been created before the error occurred.

## Will Re-exporting Create Duplicates?

It can if partial transactions are not deleted first. Always remove partial exports before retrying.

## Do I Need to Reconnect QuickBooks Online?

No. Once QuickBooks Online is functioning normally and partial transactions are deleted, you can retry the export.
