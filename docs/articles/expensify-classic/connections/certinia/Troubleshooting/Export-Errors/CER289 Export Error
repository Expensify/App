---
title: CER289 Export Error: Duplicate Value on Record for Certinia PSA
description: Learn why CER289 appears when exporting to Certinia PSA and how to remove duplicate expense reports tied to the same Expensify Report ID.
keywords: CER289, Certinia error CER289, duplicate value on record, Certinia PSA duplicate report, Expensify report ID duplicate, delete expense report Certinia, Sync Now, Workspace Admin
internalScope: Audience is Workspace Admins using the Certinia PSA integration. Covers resolving the CER289 duplicate record error by deleting existing expense reports tied to the Expensify Report ID and re-syncing. Does not cover unrelated Certinia validation errors or general PSA project configuration.
---

# CER289 Export Error: Duplicate Value on Record for Certinia PSA

If you see the error:

**“CER289 Export Error: Duplicate value on record for Certinia PSA. Please delete any existing expense reports associated with the Expensify Report ID in Certinia before attempting to export again.”**

this means Certinia already has an expense report associated with the same Expensify Report ID.

Until the duplicate record is removed, Certinia will block the export.

---

## Why CER289 Happens

CER289 typically occurs when multiple projects fail during an initial export attempt.

If a partial or failed export creates a record in Certinia, subsequent export attempts using the same Expensify Report ID can trigger a duplicate value error.

Certinia prevents duplicate records from being created, which results in error **CER289**.

This is a duplicate record issue in Certinia — not an Expensify Workspace configuration issue.

---

## Who Can Fix CER289

You must have access to delete expense reports in Certinia (typically a Certinia Admin or PSA Admin) to resolve this error.

---

## How to Delete Duplicate Expense Reports in Certinia

1. Log in to Certinia.
2. Locate the expense report associated with the **Expensify Report ID**.
3. Delete any existing expense reports tied to that Report ID.
4. Save your changes.

Ensure that all duplicate records associated with the Expensify Report ID are removed before retrying the export.

---

## How to Sync Certinia After Deleting the Duplicate Report

After deleting the duplicate expense report, re-sync the connection in Expensify.

1. Go to the navigation tabs on the left.
2. Click **Settings**.
3. Click **Workspaces**.
4. Select your Workspace.
5. Click **Accounting**.
6. Click **Sync Now**.

---

## How to Retry Exporting After CER289

After syncing:

1. Open the report you attempted to export.
2. Retry the export.
3. Confirm the export completes successfully.

If the error continues, confirm that no remaining records in Certinia are associated with the same Expensify Report ID.

---

# FAQ

## Does CER289 mean my report was exported successfully?

Not necessarily. It usually means a partial or failed export created a record in Certinia, which is now blocking a new export attempt.

---

## Is CER289 caused by Expensify settings?

No. CER289 is triggered by duplicate records in Certinia PSA, not by Workspace settings in Expensify.

---

## Do I need to reconnect the Certinia integration?

No. In most cases, deleting the duplicate report and selecting **Sync Now** resolves the issue.
