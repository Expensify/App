---
title: NS0921 Export Error in NetSuite Integration
description: Learn what the NS0921 export error means and how to align subsidiaries across reports, users, accounts, tags, and categories in NetSuite.
keywords: NS0921, NetSuite invalid subsidiary reference, subsidiary mismatch NetSuite export, category subsidiary mismatch NetSuite, export account subsidiary error, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0921 export error caused by subsidiary mismatches across report data and NetSuite configuration. Does not cover token authentication or approval workflow issues.
---

# NS0921 Export Error in NetSuite Integration

If you see the error:

NS0921 Export Error: Invalid subsidiary reference [X]. Please ensure the report, user, accounts, tags, and categories all use the subsidiary selected in the workspace.

This means there is a subsidiary mismatch between the Workspace and one or more records in NetSuite.

NetSuite requires all elements tied to the export to belong to the same subsidiary.

---

## Why the NS0921 Export Error Happens in NetSuite

The NS0921 error typically occurs when one or more of the following are associated with a different subsidiary than the one selected in the Workspace:

- The report creator or submitter (Employee record)
- The Vendor record (for vendor bill exports)
- The expense category or account
- Tags such as **Department**, **Class**, **Location**, **Project**, or **Customer**
- The export account
- The default payable account

If any of these records are tied to a different subsidiary, NetSuite rejects the export.

This is a subsidiary alignment issue, not a token authentication or approval workflow issue.

---

## How to Fix the NS0921 Export Error

Follow the steps below to align subsidiary settings.

---

## Confirm the Subsidiary Selected in the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Confirm the **Subsidiary** selected for the NetSuite connection.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Confirm the selected subsidiary.

Make note of the subsidiary listed.

---

## Verify Subsidiary Alignment in NetSuite

In NetSuite, confirm that all relevant records:

- Are **Active**.
- Are assigned to the same subsidiary selected in the Workspace.

Review the following:

- The **Employee** record for the report creator or submitter.
- The **Vendor** record (if applicable).
- The **Expense category** used on the report.
- Any applied **Department, Class, Location, Project, or Customer** tags.
- The **Export account**.
- The **Default Payable Account** for the subsidiary.

If any item is assigned to a different subsidiary:

- Update the record so it matches the Workspace subsidiary.
- Click **Save**.

---

## Sync the Workspace and Retry the Export

After confirming all records are aligned:

On web:

1. Select **Workspaces > [workspace name] > Connections**, then select **Configure** next to NetSuite.
2. Select **More (⋮)**.
3. Select **Sync now**.

On mobile:

1. Select **Workspaces > [workspace name] > Connections**, then select **Configure** next to NetSuite.
2. Select **More (⋮)**.
3. Select **Sync now**.

Then retry exporting the report.

If all records are aligned to the same subsidiary, the export should complete successfully.

---

# FAQ

## Does the NS0921 Export Error Affect Only One Report?

It affects any report that includes records tied to a different subsidiary than the one selected in the Workspace.

## Do I Need NetSuite Admin Access to Fix the NS0921 Export Error?

Yes. Updating subsidiary assignments for employees, vendors, categories, tags, or accounts requires NetSuite administrator permissions.

## Do I Need to Reconnect the Integration?

No. Correcting the subsidiary alignment and selecting **Sync Now** is typically sufficient.
