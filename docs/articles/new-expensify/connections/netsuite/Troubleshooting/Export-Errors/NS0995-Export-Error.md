---
displayTitle: "NS0995 Export Error: The employee with email 'user@example.com' is deactivated in NetSuite"
title: NS0995 Export Error in NetSuite Integration
description: Learn what the NS0995 export error means and how to reactivate a deactivated NetSuite employee record so exports succeed.
keywords: NS0995, NetSuite employee deactivated, inactive employee NetSuite, reactivate employee NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0995 export error caused by the report submitter's employee record being marked inactive in NetSuite. Does not cover missing employee records, role permission, or token configuration issues.
---

# NS0995 Export Error in NetSuite Integration

If you see the error:

NS0995 Export Error: The employee with email 'user@example.com' is deactivated in NetSuite. Reactivate their employee record in NetSuite, sync your connection, and try exporting again.

This means the report submitter’s employee record exists in NetSuite but is marked **Inactive**.

Expensify only imports active employees, so a deactivated employee cannot be matched during export.

---

## Why the NS0995 Export Error Happens in NetSuite

The NS0995 error occurs when:

- The submitter’s employee record in NetSuite has the **Inactive** box checked.
- The employee left the company, or the record was deactivated during cleanup, while reports from that employee remain unexported.

The record is still in NetSuite, so searching for the employee will find it. Only the inactive status prevents the export.

This is an employee status issue, not a missing employee record. If NetSuite has no record for the email at all, you will see the NS0023 export error instead.

---

## How to Fix the NS0995 Export Error

Follow the steps below to reactivate the employee and retry.

### Reactivate the Employee in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Employees**.
3. Locate the employee profile for the email in the error message. You may need to check **Show Inactives** to see the record.
4. Click **Edit**.
5. Go to the **System Information** tab and clear the **Inactive** checkbox.
6. Click **Save**.

### Sync the Workspace in Expensify

After reactivating the employee record:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

Once the employee is active and the connection has synced, the export should complete successfully.

---

# FAQ

## Can I Deactivate the Employee Again After Exporting?

Yes, but export all of the employee’s outstanding reports first. Deactivating the record again while any report is still unexported will make those reports fail with NS0995.

## Do I Have to Sync After Reactivating the Employee?

Yes. Expensify reads employees from the data stored at the last sync, so the export will keep failing until you sync the connection.

## What if the Employee Should Stay Deactivated?

The employee record has to be active for the export to reference it. Reactivate the employee, export the outstanding reports, then deactivate the record again.

## How Is This Different From the NS0023 Export Error?

NS0995 means NetSuite has the employee but the record is inactive. NS0023 means NetSuite has no employee matching that email and subsidiary at all.
