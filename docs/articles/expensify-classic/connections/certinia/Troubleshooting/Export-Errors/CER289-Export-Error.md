---
title: CER289 Export Error in Certinia PSA Integration
description: Learn what the CER289 export error means in Certinia PSA and how to remove duplicate expense reports tied to the same Expensify Report ID.
keywords: CER289, Certinia export error, duplicate value on record, Certinia PSA duplicate report, Expensify Report ID duplicate, delete expense report Certinia, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia PSA integration. Covers resolving the CER289 export error caused by duplicate expense reports tied to the same Expensify Report ID. Does not cover other Certinia error codes.
---

# CER289 Export Error in Certinia PSA Integration

If you see the error:

CER289: Duplicate value on record.

This means Certinia PSA already has an expense report associated with the same Expensify Report ID, preventing the export from completing.

---

## Why the CER289 Export Error Happens in Certinia PSA

The CER289 error typically indicates:

- A previous export attempt partially created an expense report in Certinia PSA.
- The same Expensify Report ID is being used in a new export attempt.
- Certinia is preventing duplicate records from being created.

This is a duplicate record issue in Certinia PSA, not a Workspace configuration issue.

---

## How to Fix the CER289 Export Error

This issue must be resolved in Certinia PSA.

1. Log in to Certinia.
2. Locate the expense report associated with the Expensify Report ID.
3. Delete any existing expense reports tied to that Report ID.
4. Save your changes.

After removing the duplicate record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After deleting the duplicate report and selecting **Sync Now**, retry the export. If the error persists, confirm no remaining records are tied to the same Expensify Report ID.

## Does CER289 Mean My Report Was Exported Successfully?

Not necessarily. It usually means a partial or failed export created a record that is now blocking a new export attempt.

## Is CER289 Caused by Workspace Settings?

No. CER289 is triggered by duplicate records in Certinia PSA. Workspace accounting settings are not the cause.
