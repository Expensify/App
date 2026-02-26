---
title: NS0320 Export Error in NetSuite Integration
description: Learn what the NS0320 export error means and how to adjust export date settings or enable Export to Next Open Period before retrying your NetSuite export.
keywords: NS0320, NetSuite closed accounting period, transaction falls in closed period NetSuite, Export to Next Open Period Workspace, export date selection NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0320 export error caused by closed accounting periods and export date configuration. Does not cover role permission or approval workflow issues.
---

# NS0320 Export Error in NetSuite Integration

If you see the error:

NS0320 Export Error: The transaction falls in a closed accounting period. Please change date selection for export or enable 'Export to Next Open Period' in the Expensify configurations.

This means the export date falls within a closed accounting period in NetSuite.

NetSuite blocks transactions that are dated within closed reporting periods.

---

## Why the NS0320 Export Error Happens in NetSuite

The NS0320 error typically occurs when:

- The export date selected in the Workspace falls within a **closed accounting period** in NetSuite.
- NetSuite is configured to prevent posting in closed periods.
- The report date, submitted date, or expense date maps to a locked period.

The export date depends on the configuration selected in the Workspace.

This is a closed accounting period issue, not a role permission or approval workflow issue.

---

## How to Fix the NS0320 Export Error

You can resolve this by adjusting the export date or enabling export to the next open period.

---

## Confirm the Selected Export Date in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Export**.
5. Review the selected export date option:
   - **Submitted Date**
   - **Exported Date**
   - **Date of Last Expense**
6. Confirm the selected option results in a date that falls within an **open accounting period** in NetSuite.
7. Click **Save** if changes are made.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Export**.
5. Review and update the export date setting if needed.
6. Tap **Save**.

After saving, retry exporting the report.

---

## Enable Export to Next Open Period in the Workspace

If adjusting the export date is not preferred:

On web:

1. Go to **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Advanced**.
5. Enable **Export to Next Open Period**.
6. Click **Save**.

On mobile:

1. Tap **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap **Advanced**.
5. Enable **Export to Next Open Period**.
6. Tap **Save**.

Then:

1. Go to **Accounting**.
2. Click the three-dot menu next to the NetSuite connection.
3. Click **Sync Now**.
4. Retry exporting the report.

The report will export to the next available open accounting period.

---

## Alternative Option: Reopen the Accounting Period in NetSuite

If appropriate based on your accounting policies:

1. Log in to NetSuite as an administrator.
2. Reopen the closed accounting period.
3. Save the changes.
4. Retry exporting the report.

---

# FAQ

## Does the NS0320 Export Error Affect All Reports?

It affects reports whose export date falls within a closed accounting period in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0320 Export Error?

Only if you choose to reopen a closed accounting period in NetSuite. Otherwise, Workspace Admin access is sufficient to adjust export settings.

## Is Export to Next Open Period the Recommended Fix?

In most cases, enabling **Export to Next Open Period** is the simplest and safest solution.
