---
title: NS0864 Export Error in NetSuite Integration
description: Learn how to fix the NS0864 export error in NetSuite when a report is not fully approved before export.
keywords: NS0864, NetSuite report not fully approved, supervisor and accounting approval Expensify, approved for posting NetSuite, export approval level Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0864 export error caused by insufficient approval levels before export. Does not cover other NetSuite error codes.
---

# NS0864 Export Error in NetSuite Integration

If you see the error:

NS0864: The report isn’t fully approved. Update the approval level in Expensify to require 'Supervisor and Accounting approval', then try to export again.

This means the report does not meet the required approval level for export to NetSuite.

---

## Why the NS0864 Export Error Happens in NetSuite

The NS0864 error occurs when:

- The report has not reached the required approval status in Expensify.
- The Workspace approval configuration does not align with NetSuite requirements.
- NetSuite expects a higher approval level before allowing export.
- The export type requires additional approval before posting.

NetSuite requires transactions to meet specific approval criteria before they can be created.

---

## How to Fix the NS0864 Export Error

### Step One: Update the Approval Level in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.

Select the required approval level based on the export type:

- **Expense Reports** — Select **Supervisor & Accounting Approved**
- **Vendor Bills** — Select **Approved for Posting**
- **Journal Entries** — Select **Approved for Posting**

7. Click **Save**.

---

### Step Two: Confirm the Report Is Fully Approved

1. Open the report in Expensify.
2. Confirm it has completed the required approval workflow.
3. Ensure it is in the correct final status before export.

---

### Step Three: Retry the Export

1. Retry exporting the report to NetSuite.

Once the correct approval level is enabled and the report meets the required approval status, the export should complete successfully.

---

# FAQ

## Does NS0864 Mean the Report Was Rejected?

No. It means the report has not reached the required approval level for export.

## Do I Need to Reconnect NetSuite?

No. Updating the approval configuration and ensuring the report is fully approved is typically sufficient.
