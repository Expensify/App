---
title: NS0864 Export Error in NetSuite Integration
description: Learn what the NS0864 export error means and how to update approval level settings in the Workspace before exporting to NetSuite.
keywords: NS0864, NetSuite report not fully approved, Supervisor and Accounting approval Workspace, Approved for Posting NetSuite, approval level export error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0864 export error caused by approval level mismatches between the Workspace and NetSuite. Does not cover supervisor field validation or role permission configuration issues.
---

# NS0864 Export Error in NetSuite Integration

If you see the error:

NS0864 Export Error: The report isn’t fully approved. Update the approval level in Expensify to require 'Supervisor and Accounting approval', then try to export again.

This means the report does not meet the approval requirements configured in NetSuite.

NetSuite requires transactions to reach the correct approval status before they can be exported.

---

## Why the NS0864 Export Error Happens in NetSuite

The NS0864 error typically occurs when:

- The report has not reached the required approval status.
- The approval level selected in the Workspace does not match NetSuite’s required approval workflow.
- NetSuite expects the transaction to be **Approved for Posting** or fully approved before export.

If the approval status is insufficient, NetSuite blocks the export.

This is an approval level configuration issue, not a supervisor field validation or role permission issue.

---

## How to Fix the NS0864 Export Error

Follow the steps below to align approval levels and retry the export.

---

## Update Approval Levels in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Update the approval level based on the export type:

   - For **Expense reports** — Select **Supervisor & Accounting Approved**.  
   - For **Vendor bills** — Select **Approved for Posting**.  
   - For **Journal entries** — Select **Approved for Posting**.

6. Click **Save**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Update the approval level for the applicable export type.
6. Tap **Save**.

---

## Confirm the Report Is Fully Approved

1. Open the report.
2. Confirm all required approvals are complete.
3. Ensure the report status reflects the required approval level.

---

## Sync the Workspace and Retry the Export

1. Go to **Workspaces > Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.
4. Retry exporting the report.

If the approval level matches NetSuite’s requirement and the report is fully approved, the export should complete successfully.

---

# FAQ

## Does the NS0864 Export Error Affect All Export Types?

It affects exports where the report does not meet the approval level required by NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0864 Export Error?

No. You only need Workspace Admin access to update approval level settings.

## Do I Need to Reconnect the Integration?

No. Updating the approval level and selecting **Sync Now** is typically sufficient.
